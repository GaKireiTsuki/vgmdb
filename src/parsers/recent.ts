import * as cheerio from 'cheerio';
import {
  parseNames,
  parseString,
  parseDateTime,
} from '../utils/parse';
import {
  trimAbsolute,
  forceAbsolute,
} from '../utils/fetch';

export interface RecentInfo {
  section: string;
  sections: string[];
  updates: RecentUpdate[];
  meta: {
    edited_date: string;
  };
}

export interface RecentUpdate {
  [key: string]: unknown;
}

export function parseRecentPage(html: string): RecentInfo | null {
  const $ = cheerio.load(html);
  const $innermain = $('#innermain');

  if (!$innermain.length) {
    return null;
  }

  const recentInfo: RecentInfo = {
    section: '',
    sections: [],
    updates: [],
    meta: { edited_date: '' },
  };

  // Parse section tabs
  const $sections = $('ul.tabnav');
  if ($sections.length) {
    recentInfo.section = determineSection($sections);
    recentInfo.sections = parseSections($sections, $);
  }

  // Parse color codes
  const $codes = $innermain.find('div.smallfont');
  const colorCodes = parseColorCodes($codes, $);

  // Parse table
  const $table = $innermain.find('table');
  if ($table.length) {
    recentInfo.updates = parseTable(recentInfo.section, colorCodes, $table, $);
  }

  // Add modification time
  if (recentInfo.updates.length > 0) {
    const dates = recentInfo.updates
      .map((u) => u.date)
      .filter((d) => d)
      .sort();
    recentInfo.meta.edited_date = (dates[dates.length - 1] as string) || '';
  }

  return recentInfo;
}

function determineSection($sections: cheerio.Cheerio<any>): string {
  const $active = $sections.find('li.active');
  if ($active.length && $active.find('a').length) {
    const link = $active.find('a').attr('href') || '';
    const parts = link.split('_');
    return parts[parts.length - 1];
  }
  return 'albums';
}

function parseSections($sections: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string[] {
  const sections: string[] = [];
  $sections.find('li').each((_i, elem) => {
    const link = $(elem).find('a').attr('href') || '';
    const parts = link.split('_');
    const type = parts[parts.length - 1];
    if (type) {
      sections.push(type);
    }
  });
  return sections;
}

function parseColorCodes($container: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): Record<string, string> {
  const colorCodes: Record<string, string> = {};
  $container.find('span').each((_i, elem) => {
    const name = $(elem).text();
    const style = $(elem).attr('style');
    if (style && style.includes('color')) {
      const color = style.split(':')[1]?.trim();
      if (color) {
        colorCodes[color] = name;
      }
    }
  });
  return colorCodes;
}

function parseTable(
  type: string,
  colorCodes: Record<string, string>,
  $table: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): RecentUpdate[] {
  const updates: RecentUpdate[] = [];
  const $rows = $table.find('tr');

  $rows.each((i, elem) => {
    if (i === 0) return; // Skip header row
    const $cells = $(elem).find('td');

    if ($cells.length < 2) return;

    const parserName = `parseTable${capitalize(type)}`;
    const parser = PARSERS[parserName];

    if (parser) {
      const update = parser(colorCodes, $cells, $);
      if (update) {
        updates.push(update);
      }
    }
  });

  return updates;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Table parsers for each type
function parseTableAlbums(
  colorCodes: Record<string, string>,
  $cells: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): RecentUpdate {
  const info: RecentUpdate = {};

  Object.assign(info, parseCatalogReleaseCell($($cells[0]), $));
  Object.assign(info, parseTitleCell('albums', colorCodes, $($cells[1]), $));
  Object.assign(info, parseContributorCell($($cells[2]), $));

  return info;
}

function parseTableMedia(
  colorCodes: Record<string, string>,
  $cells: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): RecentUpdate {
  const info: RecentUpdate = {};

  const catalog = $($cells[0]).text().trim();
  info.catalog = catalog;
  if (catalog === 'Deleted Media') {
    info.deleted = true;
  }

  Object.assign(info, parseTitleCell('media', colorCodes, $($cells[1]), $));
  Object.assign(info, parseContributorCell($($cells[2]), $));

  return info;
}

function parseTableTracklists(
  colorCodes: Record<string, string>,
  $cells: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): RecentUpdate {
  const info: RecentUpdate = {};

  Object.assign(info, parseCatalogReleaseCell($($cells[0]), $));
  Object.assign(info, parseTitleCell('tracklists', colorCodes, $($cells[1]), $));
  Object.assign(info, parseContributorCell($($cells[2]), $));

  return info;
}

function parseTableScans(
  colorCodes: Record<string, string>,
  $cells: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): RecentUpdate {
  const info: RecentUpdate = {};

  const $link = $($cells[0]).find('a');
  if ($link.length) {
    info.link = trimAbsolute($link.attr('href') || '');
    const imgSrc = $link.find('img').attr('src') || '';
    info.edit = imgSrc === 'icons/del.gif' ? 'deleted' : 'added';
    if (info.edit !== 'deleted') {
      info.image = forceAbsolute(imgSrc);
    }
  }

  const cellNode = $cells[1];
  if (cellNode) {
    const caption = parseString(cellNode, $);
    const lines = caption.split('\n');
    info.catalog = lines[0];
    if (info.edit !== 'deleted' && lines.length > 1) {
      info.caption = lines[1];
    }
  }

  Object.assign(info, parseContributorCell($($cells[2]), $));

  return info;
}

function parseTableArtists(
  colorCodes: Record<string, string>,
  $cells: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): RecentUpdate {
  const info: RecentUpdate = {};

  Object.assign(info, parseTitleCell('artists', colorCodes, $($cells[1]), $));
  Object.assign(info, parseContributorCell($($cells[2]), $));

  const $link = $($cells[0]).find('a');
  if ($link.length) {
    info.linked = {
      link: trimAbsolute($link.attr('href') || ''),
      catalog: $link.text(),
    };
  }

  return info;
}

function parseTableProducts(
  colorCodes: Record<string, string>,
  $cells: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): RecentUpdate {
  const info: RecentUpdate = {};

  Object.assign(info, parseTitleCell('products', colorCodes, $($cells[1]), $));
  Object.assign(info, parseContributorCell($($cells[2]), $));

  if (info.edit === 'Album Linkup') {
    const $link = $($cells[0]).find('a');
    if ($link.length) {
      info.linked = {
        link: trimAbsolute($link.attr('href') || ''),
        catalog: $link.text(),
      };
    }
  }

  return info;
}

function parseTableLabels(
  colorCodes: Record<string, string>,
  $cells: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): RecentUpdate {
  const info: RecentUpdate = {};

  Object.assign(info, parseTitleCell('labels', colorCodes, $($cells[1]), $));
  Object.assign(info, parseContributorCell($($cells[2]), $));

  const $link = $($cells[0]).find('a');
  if ($link.length) {
    if (info.edit === 'Album Linkup') {
      info.linked = {
        link: trimAbsolute($link.attr('href') || ''),
        catalog: $link.text(),
      };
    } else if (info.edit === 'Artist Linkup') {
      info.linked = {
        link: trimAbsolute($link.attr('href') || ''),
        names: { en: $link.text() },
      };
    }
  }

  return info;
}

function parseTableLinks(
  colorCodes: Record<string, string>,
  $cells: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): RecentUpdate {
  const info: RecentUpdate = {};

  Object.assign(info, parseTitleCell('links', colorCodes, $($cells[1]), $));
  Object.assign(info, parseContributorCell($($cells[2]), $));

  const $link = $($cells[0]).find('a');
  if ($link.length && info.link_type && typeof info.link_type === 'string') {
    if (['Album Link', 'Purchase Link'].includes(info.link_type)) {
      info.link = trimAbsolute($link.attr('href') || '');
      info.catalog = $link.text();
    } else if (info.link_type === 'Artist Link') {
      info.link = trimAbsolute($link.attr('href') || '');
      info.names = { en: $link.text() };
    } else if (['Organization Link', 'Product Link'].includes(info.link_type)) {
      let itemLink = trimAbsolute($link.attr('href') || '');
      // Parse query string to get ID
      if (itemLink.includes('?')) {
        const match = itemLink.match(/id=(\d+)/);
        if (match) {
          const itemId = match[1];
          if (info.link_type === 'Organization Link') {
            itemLink = `org/${itemId}`;
          } else if (info.link_type === 'Product Link') {
            itemLink = `product/${itemId}`;
          }
        }
      }
      info.link = itemLink;
      info.names = { en: $link.text() };
    }
  }

  return info;
}

function parseTableRatings(
  colorCodes: Record<string, string>,
  $cells: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): RecentUpdate {
  const info: RecentUpdate = {};

  Object.assign(info, parseCatalogReleaseCell($($cells[0]), $));
  Object.assign(info, parseTitleCell('ratings', colorCodes, $($cells[1]), $));
  info.rating = $($cells[2]).attr('title') || '';
  Object.assign(info, parseContributorCell($($cells[3]), $));

  return info;
}

// Common cell parsers
function parseCatalogReleaseCell($cell: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): Partial<RecentUpdate> {
  const info: Partial<RecentUpdate> = {};
  const cellNode = $cell.get(0);
  if (!cellNode) return info;

  const text = parseString(cellNode, $).trim();
  const lines = text.split('\n');

  if (lines.length < 2) {
    info.deleted = true;
    return info;
  }

  info.catalog = lines[0];
  info.release_date = parseDateTime(lines[1]);

  return info;
}

function parseTitleCell(
  type: string,
  colorCodes: Record<string, string>,
  $cell: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): Partial<RecentUpdate> {
  const info: Partial<RecentUpdate> = {};
  info.edit = 'updated';

  // Check for badges
  $cell.find('img').each((_i, img) => {
    const title = $(img).attr('title');
    if (title === 'Child Album') info.reprint = true;
    if (title === 'New Submission') {
      info.edit = 'new';
      info.new = true;
    }
    if (title === 'Deleted Album' || title === 'Deleted Link') info.edit = 'deleted';
    if (title === 'Rejected Submission') info.edit = 'rejected';
  });

  const $link = $cell.find('a');
  const nameKey = type === 'artists' ? 'names' : 'titles';

  if ($link.length) {
    // Determine which element contains the names
    let $title = $link;
    if ($link.find('span[lang]').length) {
      $title = $link;
    } else if ($link.find('span').length) {
      const $span = $link.find('span').first();
      if ($span.find('span[lang]').length) {
        $title = $span;
      } else if (!$span.attr('lang')) {
        $title = $span;
      }
    }

    const titleNode = $title.get(0);
    if (titleNode) {
      info[nameKey] = parseNames(titleNode, $);
    }

    // Check for category/type from class
    const classes = $link.attr('class');
    if (classes) {
      const classList = classes.split(' ');
      if (classList.length > 1) {
        const klass = classList[classList.length - 1];
        const typeParts = klass.split('-');
        const parsedType = typeParts[typeParts.length - 1];
        info.type = parsedType;
        info.category = typeCategoryMap(parsedType);
      }
    }

    // Check for color coding
    let color = null;
    const linkStyle = $link.attr('style');
    if (linkStyle && linkStyle.includes('color')) {
      color = linkStyle.split(':')[1]?.trim();
    } else if ($link.find('span').length) {
      const spanStyle = $link.find('span').first().attr('style');
      if (spanStyle && spanStyle.includes('color')) {
        color = spanStyle.split(':')[1]?.trim();
      }
    }

    if (!color && ['labels', 'links'].includes(type)) {
      color = '#CEFFFF';
    }

    if (color && colorCodes[color]) {
      const infoText = colorCodes[color];
      if (['albums', 'ratings', 'tracklists'].includes(type)) {
        info.category = infoText;
        info.type = categoryTypeMap(infoText);
      } else if (type === 'media') {
        info.media_format = infoText;
      } else if (['products', 'labels'].includes(type)) {
        info.edit = infoText;
      } else if (type === 'links') {
        info.link_type = infoText;
        delete info.titles;
      }
    }

    if (type === 'links') {
      info.link_data = {
        link: forceAbsolute($link.attr('href') || ''),
        title: $link.text(),
      };
    } else {
      info.link = trimAbsolute($link.attr('href') || '');
    }

    if (type === 'products' && info.edit === 'Release Edit') {
      delete info.link;
    }
  } else {
    // Deleted item
    const $span = $cell.find('span');
    if ($span.length) {
      const spanNode = $span.get(0);
      if (spanNode) {
        info[nameKey] = parseNames(spanNode, $);
      }
    } else {
      const cellNode = $cell.get(0);
      if (cellNode) {
        info[nameKey] = parseNames(cellNode, $);
      }
    }
    info.deleted = true;
  }

  return info;
}

function parseContributorCell($cell: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): Partial<RecentUpdate> {
  const info: Partial<RecentUpdate> = {};
  const $link = $cell.find('a');

  if ($link.length) {
    info.contributor = {
      name: $link.text(),
      link: forceAbsolute($link.attr('href') || ''),
    };
  }

  const $br = $cell.find('br');
  if ($br.length) {
    let dateStr = '';
    const brNode = $br.get(0);
    if (brNode && brNode.nextSibling) {
      const nextNode = brNode.nextSibling;
      if (nextNode.type === 'text') {
        dateStr = $(nextNode).text();
      }
      const nextElement = $br.next();
      if (nextElement.length) {
        dateStr += nextElement.text();
      }
    }
    if (dateStr) {
      info.date = parseDateTime(dateStr);
    }
  }

  return info;
}

// Type mapping utilities
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

function categoryTypeMap(category: string): string {
  const map: Record<string, string> = {
    Game: 'game',
    Animation: 'animation',
    Publication: 'publication',
    'Audio Drama': 'audio',
    'Radio & Drama': 'radio',
    'Live Event': 'live',
    'Demo Scene': 'demo',
    Video: 'video',
  };
  return map[category] || category.toLowerCase();
}

const PARSERS: Record<string, (colorCodes: Record<string, string>, $cells: cheerio.Cheerio<any>, $: cheerio.CheerioAPI) => RecentUpdate> = {
  parseTableAlbums,
  parseTableMedia,
  parseTableTracklists,
  parseTableScans,
  parseTableArtists,
  parseTableProducts,
  parseTableLabels,
  parseTableLinks,
  parseTableRatings,
};
