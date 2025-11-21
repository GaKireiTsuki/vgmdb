import * as cheerio from 'cheerio';
import { Cheerio, CheerioAPI } from 'cheerio';
import { AnyNode } from 'domhandler';
import { ProductInfo } from '../types';
import * as fetchUtils from '../utils/fetch';
import * as parseUtils from '../utils/parse';

export async function fetchProductPage(id: string): Promise<string> {
  return fetchUtils.fetchInfoPage('product', id);
}

export function parseProductPage(htmlSource: string): ProductInfo | null {
  const $ = cheerio.load(htmlSource);

  const $profile = $('#innermain');
  if ($profile.length === 0) {
    return null;
  }

  const productInfo: ProductInfo = {
    names: {},
    name: '',
    description: '',
    websites: {},
    albums: [],
    franchises: [],
    organizations: [],
  };

  // Parse name
  const $name = $profile.find('h1').first();
  if ($name.length > 0) {
    const $nameSpan = $name.find('span').first();
    if ($nameSpan.length > 0) {
      productInfo.name = $nameSpan.text().trim();
      productInfo.names = { en: productInfo.name };
    }
  }

  // Parse real name (subtitle)
  const $realName = $('#subtitle span').first();
  if ($realName.length > 0) {
    const realNameText = $realName.text().trim();
    if (realNameText) {
      productInfo.name_real = realNameText;
    }
  }

  // Parse type
  const $type = $name.find('span').eq(1);
  if ($type.length > 0) {
    const typeText = $type.text().trim();
    if (typeText.startsWith('(') && typeText.endsWith(')')) {
      productInfo.type = typeText.substring(1, typeText.length - 1);
    }
  }

  const $innerContent = $('#innercontent');
  let $profileContent = $innerContent;
  if ($innerContent.find('#innermain').length > 0) {
    $profileContent = $innerContent.find('#innermain');
  }

  // Parse picture
  const $picDiv = $profileContent.children('div').first();
  const $picLink = $picDiv.find('a').first();
  if ($picLink.length > 0) {
    const fullLink = $picLink.attr('href');
    if (fullLink && fullLink.includes('media.vgm.io')) {
      productInfo.picture_full = fetchUtils.forceAbsolute(fullLink);
    }

    const $img = $picLink.find('img');
    if ($img.length > 0) {
      const mediumLink = $img.attr('src');
      if (mediumLink && mediumLink.includes('media.vgm.io')) {
        productInfo.picture_small = fetchUtils.forceAbsolute(mediumLink);
      }
    }
  }

  // Parse profile info
  const $profileInfo = $picDiv.next('div').find('dl');
  if ($profileInfo.length > 0) {
    Object.assign(productInfo, parseProductInfo($profileInfo, $));
  }

  // Parse description
  const $h3 = $profileContent.find('h3').first();
  const $descDiv = $h3.prev('div');
  if ($descDiv.length > 0) {
    const desc = parseUtils.parseString($descDiv[0], $).trim();
    if (desc) {
      productInfo.description = desc;
    }
  }

  // Parse sections
  const $sectionHeads = $profileContent.find('h3.label');
  $sectionHeads.each((_i: number, head: AnyNode) => {
    const $head = $(head);
    const sectionName = parseUtils.parseShallowString(head, $).trim();
    const $section = $head.next('div');

    if (sectionName === 'Belongs to') {
      const $superDiv = $section.find('div div').first();
      if ($superDiv.length > 0) {
        productInfo.superproduct = parseFranchiseSuperproduct($superDiv, $);
      }
    } else if (sectionName === 'Subproducts') {
      const $table = $section.find('table').first();
      if ($table.length > 0) {
        productInfo.subproducts = parseFranchiseSubproducts($table, $);
      }
    } else if (sectionName === 'Titles') {
      const $table = $section.find('table').first();
      if ($table.length > 0) {
        productInfo.titles = parseFranchiseTitles($table, $);
      }
    } else if (sectionName === 'Releases') {
      const $table = $section.find('table').first();
      if ($table.length > 0) {
        productInfo.releases = parseProductReleases($table, $);
      }
    } else if (sectionName === 'Albums | Credits' || sectionName === 'Albums') {
      const $table = $section.find('table').first();
      if ($table.length > 0) {
        productInfo.albums = parseDiscography($table, $);
      }
    }
  });

  // Parse metadata from right column
  const $rightColumn = $('#rightcolumn');
  const $rightDivs = $rightColumn.children('div');

  // Parse websites
  $rightDivs.each((_i: number, div: AnyNode) => {
    const $div = $(div);
    const $b = $div.find('b').first();
    if ($b.length > 0 && $b.attr('class')?.includes('rtop')) {
      const sectionHead = $div.find('h3').text().trim();

      if (sectionHead === 'Websites') {
        const $nextDiv = $div.next('div');
        const $sectionBody = $nextDiv.find('div').first();

        if ($sectionBody.length > 0) {
          $sectionBody.children('div').each((_j: number, wsDiv: AnyNode) => {
            const $wsDiv = $(wsDiv);
            const websiteType = $wsDiv.find('b').text().trim();
            const websites: Array<{ link: string; name: string }> = [];

            $wsDiv.find('a').each((_k: number, a: AnyNode) => {
              const $a = $(a);
              let link = $a.attr('href') || '';
              link = fetchUtils.stripRedirect(link);
              const name = $a.text().trim();
              websites.push({ link, name });
            });

            if (websiteType && websites.length > 0) {
              if (!productInfo.websites) {
                productInfo.websites = {};
              }
              productInfo.websites[websiteType] = websites;
            }
          });
        }
      }
    }
  });

  // Parse meta from last div
  if ($rightDivs.length > 0) {
    const $metaDiv = $rightDivs.last().find('div').first();
    if ($metaDiv.length > 0) {
      productInfo.meta = parseUtils.parseMeta($metaDiv, $);
    }
  }

  return productInfo;
}

function parseProductInfo(
  $profileInfo: Cheerio<AnyNode>,
  $: CheerioAPI
): Partial<ProductInfo> {
  const info: Partial<ProductInfo> = {
    franchises: [],
    organizations: [],
  };

  let currentName: string | null = null;

  $profileInfo.children().each((_i: number, child: AnyNode) => {
    const $child = $(child);

    if ($child.is('dt')) {
      const $b = $child.find('b');
      currentName = $b.text().trim();
    } else if ($child.is('dd') && currentName) {
      if (currentName === 'Release Date') {
        const dateText = $child.text().trim();
        const parsed = parseUtils.parseDateTime(dateText);
        if (parsed) {
          info.release_date = parsed;
        }
      } else if (currentName === 'Franchises') {
        const franchises: Array<{
          names: Record<string, string>;
          link: string;
        }> = [];
        $child.find('div').each((_j: number, div: AnyNode) => {
          $(div)
            .find('a')
            .each((_k: number, a: AnyNode) => {
              const $a = $(a);
              const names = parseUtils.parseNames(a, $);
              const link = fetchUtils.trimAbsolute($a.attr('href') || '');
              franchises.push({ names, link });
            });
        });
        info.franchises = franchises;
      } else if (currentName === 'Organizations') {
        const orgs: Array<{ names: Record<string, string>; link?: string }> =
          [];
        $child.find('div').each((_j: number, div: AnyNode) => {
          $(div)
            .find('a')
            .each((_k: number, a: AnyNode) => {
              const $a = $(a);
              const names = parseUtils.parseNames(a, $);
              const link = fetchUtils.trimAbsolute($a.attr('href') || '');
              orgs.push({ names, link });
            });
        });
        info.organizations = orgs;
      } else if (currentName === 'Description') {
        const desc = $child.text().trim();
        if (desc) {
          info.description = desc;
        }
      }
    }
  });

  return info;
}

function parseDiscography(
  $table: Cheerio<AnyNode>,
  $: CheerioAPI
): Array<{
  date: string;
  classifications?: string[];
  titles: Record<string, string>;
  catalog: string;
  link: string;
  type: string;
}> {
  const albums: Array<{
    date: string;
    classifications?: string[];
    titles: Record<string, string>;
    catalog: string;
    link: string;
    type: string;
  }> = [];

  const $tbodies = $table.children('tbody');

  $tbodies.each((_i: number, tbody: AnyNode) => {
    const $tbody = $(tbody);
    const $rows = $tbody.children('tr');

    if ($rows.length === 0) return;

    const $yearRow = $rows.first();
    const year = $yearRow.find('h3').text().trim();

    $rows.slice(1).each((_j: number, row: AnyNode) => {
      const $row = $(row);
      const $cells = $row.children('td');

      if ($cells.length < 2) return;

      const monthDay = $cells.eq(0).text().trim();
      const date = fetchUtils.normalizeDottedDate(`${year}.${monthDay}`) || '';

      const $albumCell = $cells.eq(1);
      const $albumLink = $albumCell.find('a').first();

      if ($albumLink.length === 0) return;

      const link = fetchUtils.trimAbsolute($albumLink.attr('href') || '');
      const albumClass = $albumLink.attr('class') || '';
      const albumType = albumClass.split('-')[1] || '';

      const $spans = $albumCell.children('span');
      const catalog = $spans.eq(0).text().trim();

      const classifications: string[] = [];
      if ($spans.length > 1) {
        const classText = $spans.eq(1).text().trim();
        classText.split(',').forEach((c) => {
          const trimmed = c.trim();
          if (trimmed) classifications.push(trimmed);
        });
      }

      const titles: Record<string, string> = {};
      $albumLink.children('span').each((_k: number, span: AnyNode) => {
        const $span = $(span);
        const lang = $span.attr('lang')?.toLowerCase();
        const text = $span.text().trim().replace(/^"|"$/g, '');
        if (lang && text) {
          titles[lang] = text;
        }
      });

      albums.push({
        date,
        classifications,
        titles,
        catalog,
        link,
        type: albumType,
      });
    });
  });

  return albums.sort((a, b) => a.date.localeCompare(b.date));
}

function parseFranchiseSuperproduct(
  $div: Cheerio<AnyNode>,
  $: CheerioAPI
): { names: Record<string, string>; link?: string } {
  const superproduct: { names: Record<string, string>; link?: string } = {
    names: {},
  };

  const $link = $div.find('a').first();
  if ($link.length > 0) {
    superproduct.names = parseUtils.parseNames($link[0], $);
    superproduct.link = fetchUtils.trimAbsolute($link.attr('href') || '');
  }

  return superproduct;
}

function parseFranchiseSubproducts(
  $table: Cheerio<AnyNode>,
  $: CheerioAPI
): Array<{
  date?: string;
  names: Record<string, string>;
  link?: string;
  type?: string;
}> {
  const subproducts: Array<{
    date?: string;
    names: Record<string, string>;
    link?: string;
    type?: string;
  }> = [];

  if ($table.length === 0) return subproducts;

  const $rows = $table.find('tr');
  if ($rows.length === 0) return subproducts;

  $rows.slice(1).each((_i: number, row: AnyNode) => {
    const $row = $(row);
    const $cells = $row.children('td');

    if ($cells.length < 2) return;

    const text = $cells.eq(1).find('span').text();
    if (text === 'No titles found') return;

    const product: {
      date?: string;
      names: Record<string, string>;
      link?: string;
      type?: string;
    } = {
      names: {},
    };

    const dateText = $cells.eq(0).find('span').text().trim();
    const date = fetchUtils.normalizeDashedDate(dateText);
    if (date) {
      product.date = date;
    }

    const $nameSpan = $cells.eq(1).find('span').first();
    product.names = parseUtils.parseNames($nameSpan[0], $);

    const $link = $cells.eq(1).find('a').first();
    if ($link.length > 0) {
      product.link = fetchUtils.trimAbsolute($link.attr('href') || '');
      // Extract type from span class if present
      const $typeSpan = $link.find('span').first();
      if ($typeSpan.length > 0) {
        const spanClass = $typeSpan.attr('class') || '';
        if (spanClass) {
          product.type = spanClass;
        }
      }
    }

    subproducts.push(product);
  });

  return subproducts.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
}

function parseFranchiseTitles(
  $table: Cheerio<AnyNode>,
  $: CheerioAPI
): Array<{
  date?: string;
  names: Record<string, string>;
  link?: string;
  type?: string;
}> {
  const titles: Array<{
    date?: string;
    names: Record<string, string>;
    link?: string;
    type?: string;
  }> = [];

  if ($table.length === 0) return titles;

  const $rows = $table.find('tr');
  if ($rows.length === 0) return titles;

  $rows.slice(1).each((_i: number, row: AnyNode) => {
    const $row = $(row);
    const $cells = $row.children('td');

    if ($cells.length < 2) return;

    const text = $cells.eq(1).find('span').text();
    if (text === 'No titles found') return;

    const title: {
      date?: string;
      names: Record<string, string>;
      link?: string;
      type?: string;
    } = {
      names: {},
    };

    const dateText = $cells.eq(0).find('span').text().trim();
    const date = fetchUtils.normalizeDashedDate(dateText);
    if (date) {
      title.date = date;
    }

    const $nameSpan = $cells.eq(1).find('span').first();
    title.names = parseUtils.parseNames($nameSpan[0], $);

    const $link = $cells.eq(1).find('a').first();
    if ($link.length > 0) {
      title.link = fetchUtils.trimAbsolute($link.attr('href') || '');
      // Extract type from span class if present
      const $typeSpan = $link.find('span').first();
      if ($typeSpan.length > 0) {
        const spanClass = $typeSpan.attr('class') || '';
        if (spanClass) {
          title.type = spanClass;
        }
      }
    }

    titles.push(title);
  });

  return titles.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
}

function parseProductReleases(
  $table: Cheerio<AnyNode>,
  $: CheerioAPI
): Array<{
  date?: string;
  names: Record<string, string>;
  link?: string;
  region: string;
  platform: string;
}> {
  const releases: Array<{
    date?: string;
    names: Record<string, string>;
    link?: string;
    region: string;
    platform: string;
  }> = [];

  if ($table.length === 0) return releases;

  const $rows = $table.find('tr');
  if ($rows.length === 0) return releases;

  $rows.slice(1).each((_i: number, row: AnyNode) => {
    const $row = $(row);
    const $cells = $row.children('td');

    if ($cells.length < 4) return;

    const release: {
      date?: string;
      names: Record<string, string>;
      link?: string;
      region: string;
      platform: string;
    } = {
      names: {},
      region: '',
      platform: '',
    };

    const dateText = $cells.eq(0).find('span').text().trim();
    const date = fetchUtils.normalizeDashedDate(dateText);
    if (date) {
      release.date = date;
    }

    const $link = $cells.eq(1).find('a').first();
    if ($link.length > 0) {
      release.link = fetchUtils.trimAbsolute($link.attr('href') || '');
      release.names = parseUtils.parseNames($link[0], $);
    } else {
      const $span = $cells.eq(1).find('span').first();
      if ($span.length > 0) {
        release.names = parseUtils.parseNames($span[0], $);
      }
    }

    release.region = $cells.eq(2).find('span').text().trim();
    release.platform = $cells.eq(3).find('span').text().trim();

    releases.push(release);
  });

  return releases.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
}
