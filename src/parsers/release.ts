import * as cheerio from 'cheerio';
import { CheerioAPI, Cheerio } from 'cheerio';
import { AnyNode } from 'domhandler';
import * as fetchUtils from '../utils/fetch';
import * as parseUtils from '../utils/parse';

export async function fetchReleasePage(id: string): Promise<string> {
  const url = `https://vgmdb.net/db/release.php?id=${id}`;
  return fetchUtils.fetchPage(url);
}

export function parseReleasePage(htmlSource: string): {
  name: string;
  name_real?: string;
  type?: string;
  picture_full?: string;
  picture_small?: string;
  products?: Array<{
    link: string;
    names: Record<string, string>;
  }>;
  catalog?: string;
  upc?: string;
  release_type?: string;
  platform?: string;
  region?: string;
  release_date?: string;
  release_albums?: Array<{
    link: string;
    titles: Record<string, string>;
    type?: string;
    date?: string;
    [key: string]: unknown;
  }>;
  product_albums?: Array<{
    link: string;
    titles: Record<string, string>;
    type?: string;
    date?: string;
    [key: string]: unknown;
  }>;
  meta?: {
    added_date?: string;
    edited_date?: string;
    [key: string]: unknown;
  };
} | null {
  const html = fetchUtils.fixInvalidTable(htmlSource);
  const $ = cheerio.load(html);

  const $profile = $('#innermain');
  const $rightColumn = $('#rightcolumn');
  
  if ($profile.length === 0) {
    return null;
  }

  const releaseInfo: {
    name: string;
    name_real?: string;
    type?: string;
    picture_full?: string;
    picture_small?: string;
    products?: Array<{
      link: string;
      names: Record<string, string>;
    }>;
    catalog?: string;
    upc?: string;
    release_type?: string;
    platform?: string;
    region?: string;
    release_date?: string;
    release_albums?: Array<{
      link: string;
      titles: Record<string, string>;
      type?: string;
      date?: string;
      [key: string]: unknown;
    }>;
    product_albums?: Array<{
      link: string;
      titles: Record<string, string>;
      type?: string;
      date?: string;
      [key: string]: unknown;
    }>;
    meta?: {
      added_date?: string;
      edited_date?: string;
      [key: string]: unknown;
    };
  } = {
    name: '',
    release_albums: [],
    product_albums: [],
  };

  // Parse name
  const $h1 = $profile.find('h1');
  const $nameSpan = $h1.find('span');
  if ($nameSpan.length > 0) {
    releaseInfo.name = $nameSpan.text().trim();
  }

  // Parse real name
  const $subtitle = $profile.find('#subtitle');
  if ($subtitle.length > 0) {
    const $realNameSpan = $subtitle.find('span');
    if ($realNameSpan.length > 0) {
      const contents = $realNameSpan.contents();
      if (contents.length === 1) {
        releaseInfo.name_real = $realNameSpan.text().trim();
      } else if (contents.length > 1) {
        const firstContent = contents.first();
        if (firstContent.length > 0 && firstContent[0].type === 'text') {
          releaseInfo.name_real = firstContent.text().trim();
        }
      }
    }
  }

  // Parse type
  const $typeSpan = $h1.find('span').next('span');
  if ($typeSpan.length > 0) {
    const typeText = $typeSpan.text().trim();
    if (typeText.startsWith('[') && typeText.endsWith(']')) {
      releaseInfo.type = typeText.substring(1, typeText.length - 1);
    }
  }

  // Find inner content
  let $innerContent = $profile.find('#innercontent');
  if ($innerContent.find('#innermain').length > 0) {
    $innerContent = $innerContent.find('#innermain');
  }
  
  const $sections = $innerContent.children('div');
  
  // Parse picture
  const $picDiv = $sections.first();
  const $picLink = $picDiv.find('a').first();
  if ($picLink.length > 0) {
    const fullLink = $picLink.attr('href');
    if (fullLink) {
      releaseInfo.picture_full = fetchUtils.forceAbsolute(fullLink);
    }
    
    const $img = $picLink.find('img');
    if ($img.length > 0) {
      const mediumLink = $img.attr('src');
      if (mediumLink) {
        releaseInfo.picture_small = fetchUtils.forceAbsolute(mediumLink);
      }
    }
  }

  // Parse sections
  const $sectionHeads = $innerContent.children('h3');
  $sectionHeads.each((_i: number, h3: AnyNode) => {
    const $h3 = $(h3);
    const sectionName = $h3.text().trim();
    const $section = $h3.next('div');

    if (sectionName === 'Products') {
      const $productsDiv = $section.find('div').first();
      releaseInfo.products = parseProducts($productsDiv, $);
    } else if (sectionName === 'Release Information') {
      const $infoDiv = $section.find('div').first();
      Object.assign(releaseInfo, parseReleaseInfo($infoDiv, $));
    } else if (sectionName === 'Albums | Credits') {
      const $discos = $section.find('div').children('div');
      if ($discos.length >= 1) {
        const $releaseTable = $discos.eq(0).next('table');
        if ($releaseTable.length > 0) {
          releaseInfo.release_albums = parseUtils.parseDiscography($releaseTable, $);
        }
      }
      if ($discos.length >= 2) {
        const $productTable = $discos.eq(1).next('table');
        if ($productTable.length > 0) {
          releaseInfo.product_albums = parseUtils.parseDiscography($productTable, $);
        }
      }
    }
  });

  // Parse meta
  const $rightDivs = $rightColumn.children('div');
  if ($rightDivs.length > 0) {
    const $metaDiv = $rightDivs.last().find('div');
    if ($metaDiv.length > 0) {
      releaseInfo.meta = parseUtils.parseMeta($metaDiv, $);
    }
  }

  return releaseInfo;
}

function parseProducts(
  $div: Cheerio<AnyNode>,
  $: CheerioAPI
): Array<{
  link: string;
  names: Record<string, string>;
}> {
  const products: Array<{
    link: string;
    names: Record<string, string>;
  }> = [];

  if ($div.length === 0) {
    return products;
  }

  const $rows = $div.children('div');
  if ($rows.length === 0) {
    return products;
  }

  $rows.each((_i: number, row: AnyNode) => {
    const $row = $(row);
    const $link = $row.children('a').first();
    
    if ($link.length > 0) {
      const link = fetchUtils.trimAbsolute($link.attr('href') || '');
      const names = parseUtils.parseNames($link[0], $);
      
      if (Object.keys(names).length > 0) {
        products.push({ link, names });
      }
    }
  });

  return products;
}

function parseReleaseInfo(
  $div: Cheerio<AnyNode>,
  $: CheerioAPI
): {
  catalog?: string;
  upc?: string;
  release_type?: string;
  platform?: string;
  region?: string;
  release_date?: string;
} {
  const info: {
    catalog?: string;
    upc?: string;
    release_type?: string;
    platform?: string;
    region?: string;
    release_date?: string;
  } = {};

  if ($div.length === 0) {
    return info;
  }

  let currentName: string | null = null;

  $div.children('div').each((_i: number, div: AnyNode) => {
    const $innerDiv = $(div);
    const $dl = $innerDiv.find('dl');
    
    if ($dl.length === 0) {
      return;
    }

    $dl.children().each((_j: number, child: AnyNode) => {
      const $child = $(child);

      if ($child.is('dt')) {
        const $b = $child.find('b');
        currentName = $b.text().trim();
      } else if ($child.is('dd') && currentName) {
        const value = $child.text().trim();
        
        const maps: Record<string, string> = {
          'Catalog': 'catalog',
          'EAN/UPC/JAN': 'upc',
          'Release Type': 'release_type',
          'Platform': 'platform',
          'Region': 'region',
        };

        const infoKey = maps[currentName];
        if (infoKey) {
          (info as Record<string, string>)[infoKey] = value;
        }
        
        if (currentName === 'Release Date') {
          const date = parseUtils.parseDateTime(value);
          if (date) {
            info.release_date = date;
          }
        }
      }
    });
  });

  return info;
}
