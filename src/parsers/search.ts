import * as cheerio from 'cheerio';
import {
  parseNames,
  parseString,
  parseDateTime,
} from '../utils/parse';
import {
  trimAbsolute,
} from '../utils/fetch';

export interface SearchInfo {
  query: string;
  results: {
    albums?: SearchAlbum[];
    artists?: SearchArtist[];
    orgs?: SearchOrg[];
    products?: SearchProduct[];
  };
  sections: string[];
  meta: Record<string, unknown>;
}

export interface SearchAlbum {
  link: string;
  catalog: string;
  titles: Record<string, string>;
  release_date: string | null;
  media_format: string;
  category?: string;
}

export interface SearchArtist {
  link: string;
  names: Record<string, string>;
  aliases?: string[];
}

export interface SearchOrg {
  link: string;
  names: Record<string, string>;
  aliases?: string[];
}

export interface SearchProduct {
  link: string;
  names?: Record<string, string>;
  type?: string;
}

export function parseSearchPage(html: string): SearchInfo | null {
  const $ = cheerio.load(html);
  const $innermain = $('#innermain');

  if (!$innermain.length) {
    return null;
  }

  const searchInfo: SearchInfo = {
    query: '',
    results: {},
    sections: [],
    meta: {},
  };

  const sectionTypes: Record<string, string> = {
    albumresults: 'albums',
    artistresults: 'artists',
    orgresults: 'orgs',
    productresults: 'products',
  };

  // Parse each section
  const $mainDiv = $innermain.find('div').first();
  $mainDiv.find('> div[id]').each((_i, elem) => {
    const sectionId = $(elem).attr('id');

    if (sectionId && sectionTypes[sectionId]) {
      const sectionType = sectionTypes[sectionId];
      searchInfo.sections.push(sectionType);

      const parserName = `parse${capitalize(sectionType.slice(0, -1))}`;
      const parser = PARSERS[parserName];

      if (parser) {
        const items = parseList($(elem), parser, $);
        searchInfo.results[sectionType as keyof typeof searchInfo.results] = items;
      }
    }
  });

  // Parse the query from the JavaScript
  const queryMatch = html.match(/\$\("#simplesearch"\)\.val\("(.*)"\);/);
  if (queryMatch) {
    searchInfo.query = queryMatch[1].replace(/\\'/g, "'");
  }

  return searchInfo;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function parseList<T>(
  $section: cheerio.Cheerio<any>,
  itemParser: ($row: cheerio.Cheerio<any>, $: cheerio.CheerioAPI) => T | null,
  $: cheerio.CheerioAPI
): T[] {
  const items: T[] = [];
  const $rows = $section.find('tr');

  $rows.each((_i, elem) => {
    if (_i === 0) return; // Skip header row
    const $row = $(elem);
    const item = itemParser($row, $);
    if (item) {
      items.push(item);
    }
  });

  return items;
}

function parseListItem($row: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): SearchArtist | SearchOrg | null {
  const $cells = $row.find('td');
  if ($cells.length === 0) return null;

  const $link = $cells.first().find('a');
  if (!$link.length) return null;

  const linkNode = $link.get(0);
  if (!linkNode) return null;

  const names = parseNames(linkNode, $);
  const link = trimAbsolute($link.attr('href') || '');

  const info: SearchArtist | SearchOrg = {
    link,
    names,
  };

  // Parse aliases
  const $aliases = $cells.first().find('span');
  if ($aliases.length) {
    const aliasNode = $aliases.get(0);
    if (aliasNode) {
      const aliasesStr = parseString(aliasNode, $);
      const aliases = aliasesStr
        .split('/')
        .map((a) => a.trim())
        .filter((a) => a);
      if (aliases.length > 0) {
        info.aliases = aliases;
      }
    }
  }

  return info;
}

function parseAlbum($row: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): SearchAlbum | null {
  const $cells = $row.find('td');
  if ($cells.length < 5) return null;

  const catalog = $($cells[0]).find('span').text();
  const $album = $($cells[2]);
  const $link = $album.find('a');

  if (!$link.length) return null;

  const linkNode = $link.get(0);
  if (!linkNode) return null;

  const link = trimAbsolute($link.attr('href') || '');
  const names = parseNames(linkNode, $);
  const date = parseDateTime($($cells[3]).text());
  const mediaFormat = $($cells[4]).text();

  const info: SearchAlbum = {
    link,
    catalog,
    titles: names,
    release_date: date,
    media_format: mediaFormat,
  };

  // Parse category from class
  const classes = $link.attr('class');
  if (classes) {
    const classList = classes.split(' ');
    const albumClass = classList.find((c) => c.startsWith('album-'));
    if (albumClass) {
      const type = albumClass.replace('album-', '');
      info.category = typeCategoryMap(type);
    }
  }

  return info;
}

function parseArtist($row: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): SearchArtist | null {
  return parseListItem($row, $);
}

function parseOrg($row: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): SearchOrg | null {
  return parseListItem($row, $);
}

function parseProduct($row: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): SearchProduct | null {
  const $cells = $row.find('td');
  if ($cells.length === 0) return null;

  const $link = $cells.first().find('a');

  if (!$link.length) return null;

  const link = trimAbsolute($link.attr('href') || '');
  const info: SearchProduct = { link };

  // Parse product type from color
  const $color = $cells.first().find('span');
  if ($color.length) {
    const style = $color.attr('style');
    if (style) {
      info.type = parseProductColorType(style);
    }

    const $names = $color.find('span');
    if ($names.length) {
      const colorNode = $color.get(0);
      if (colorNode) {
        info.names = parseNames(colorNode, $);
      }
    }
  }

  return info;
}

function typeCategoryMap(type: string): string {
  const map: Record<string, string> = {
    game: 'Game',
    animation: 'Animation',
    publication: 'Publication',
    audio: 'Audio Drama',
    radio: 'Radio & Drama',
    live: 'Live Event',
    demo: 'Demo Scene',
    video: 'Video',
  };
  return map[type] || type;
}

function parseProductColorType(style: string): string {
  const colorMap: Record<string, string> = {
    '#EE82EE': 'game',
    '#87CEFA': 'anime',
    '#90EE90': 'publication',
    '#FFB6C1': 'audio',
    '#F0E68C': 'live',
    '#DDA0DD': 'demo',
    '#FFA07A': 'video',
    '#F5DEB3': 'radio',
  };

  if (style.includes('color')) {
    const color = style.split(':')[1]?.trim().toUpperCase();
    for (const [hex, type] of Object.entries(colorMap)) {
      if (hex.toUpperCase() === color) {
        return type;
      }
    }
  }

  return 'unknown';
}

const PARSERS: Record<string, ($row: cheerio.Cheerio<any>, $: cheerio.CheerioAPI) => any> = {
  parseAlbum,
  parseArtist,
  parseOrg,
  parseProduct,
};
