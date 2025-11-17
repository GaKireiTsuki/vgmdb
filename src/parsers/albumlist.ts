import * as cheerio from 'cheerio';
import { AnyNode } from 'domhandler';
import * as fetchUtils from '../utils/fetch';
import * as parseUtils from '../utils/parse';

export async function fetchAlbumlistPage(id: string): Promise<string> {
  return fetchUtils.fetchListPage('albums', id);
}

export function parseAlbumlistPage(htmlSource: string): {
  albums: Array<{
    catalog: string;
    type: string;
    link: string;
    titles: Record<string, string>;
    release_date?: string;
  }>;
  letters: string[];
  pagination: { last: number };
  meta: { time?: string };
} | null {
  const html = fetchUtils.fixInvalidTable(htmlSource);
  const $ = cheerio.load(html);

  const $innermain = $('#innermain');
  if ($innermain.length === 0) {
    return null;
  }

  const albumlistInfo: {
    albums: Array<{
      catalog: string;
      type: string;
      link: string;
      titles: Record<string, string>;
      release_date?: string;
    }>;
    letters: string[];
    pagination: { last: number };
    meta: { time?: string };
  } = {
    albums: [],
    letters: [],
    pagination: { last: 1 },
    meta: {},
  };

  // Parse album list
  const $table = $innermain.find('div table').first();
  const $rows = $table.find('tr');

  $rows.slice(1).each((_i: number, row: AnyNode) => {
    const $row = $(row);
    const $cells = $row.children('td');

    if ($cells.length < 4) return;

    const $catalog = $cells.eq(0);
    const $title = $cells.eq(2);
    const $date = $cells.eq(3);

    // Parse catalog
    const $catalogSpan = $catalog.find('span');
    const catalog = $catalogSpan.text().trim();

    // Parse title
    const $link = $title.find('a');
    if ($link.length === 0) return;

    const linkClass = $link.attr('class') || '';
    const classes = linkClass.split(' ');
    let albumType = '';
    for (const cls of classes) {
      if (cls.includes('-')) {
        const parts = cls.split('-');
        if (parts.length === 2) {
          albumType = parts[1];
          break;
        }
      }
    }

    const link = fetchUtils.trimAbsolute($link.attr('href') || '');
    const titles = parseUtils.parseNames($link[0], $);

    // Parse date
    const $dateElem = $date.find('a').length > 0 ? $date.find('a') : $date;
    const dateText = $dateElem.text().trim();
    const releaseDate = parseUtils.parseDateTime(dateText);

    const item: {
      catalog: string;
      type: string;
      link: string;
      titles: Record<string, string>;
      release_date?: string;
    } = {
      catalog,
      type: albumType,
      link,
      titles,
    };

    if (releaseDate) {
      item.release_date = releaseDate;
    }

    albumlistInfo.albums.push(item);
  });

  // Parse pagination
  const $pagination = $innermain.find('div.pagenav');
  if ($pagination.length > 0) {
    const $control = $pagination.find('td.vbmenu_control');
    if ($control.length > 0) {
      const text = $control.text().trim();
      const parts = text.split(' ');
      if (parts.length > 0) {
        const lastPage = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastPage)) {
          albumlistInfo.pagination.last = lastPage;
        }
      }
    }
  }

  // Parse page meta
  const $navbar = $innermain.parent().find('div').first();
  const $metadata = $navbar.find('div').first();
  const $timeB = $metadata.find('b');
  if ($timeB.length > 0) {
    albumlistInfo.meta.time = $timeB.text().trim();
  }

  // Parse letters
  const $letters = $navbar.find('ul');
  $letters.find('li').each((_i: number, li: AnyNode) => {
    const $li = $(li);
    const $letterH3 = $li.find('a h3');
    if ($letterH3.length > 0) {
      const letter = $letterH3.text().trim();
      albumlistInfo.letters.push(letter);
    }
  });

  return albumlistInfo;
}
