import * as cheerio from 'cheerio';
import { AnyNode } from 'domhandler';
import * as fetchUtils from '../utils/fetch';

export async function fetchArtistlistPage(id: string): Promise<string> {
  return fetchUtils.fetchListPage('artists', id);
}

export function parseArtistlistPage(htmlSource: string): {
  artists: Array<{
    link: string;
    names: Record<string, string>;
    name_real?: string;
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

  const artistlistInfo: {
    artists: Array<{
      link: string;
      names: Record<string, string>;
      name_real?: string;
    }>;
    letters: string[];
    pagination: { last: number };
    meta: { time?: string };
  } = {
    artists: [],
    letters: [],
    pagination: { last: 1 },
    meta: {},
  };

  // Parse artist list - artists are in 3 columns
  const artistColumns: Array<Array<{
    link: string;
    names: Record<string, string>;
    name_real?: string;
  }>> = [[], [], []];

  const $table = $innermain.find('div table').first();
  const $rows = $table.find('tr');

  $rows.each((_i: number, row: AnyNode) => {
    const $row = $(row);
    const $cells = $row.children('td');

    // Parse each of the 3 columns
    for (let col = 0; col < 3 && col < $cells.length; col++) {
      const $cell = $cells.eq(col);
      const $link = $cell.find('a').first();

      if ($link.length > 0) {
        const link = fetchUtils.trimAbsolute($link.attr('href') || '');
        const name = $link.text().trim();

        const artistInfo: {
          link: string;
          names: Record<string, string>;
          name_real?: string;
        } = {
          link,
          names: { en: name },
        };

        // Check for real name in span
        const $span = $cell.find('span').first();
        if ($span.length > 0) {
          const nameReal = $span.text().trim();
          if (nameReal) {
            artistInfo.name_real = nameReal;
          }
        }

        artistColumns[col].push(artistInfo);
      }
    }
  });

  // Flatten the columns into a single list
  for (const column of artistColumns) {
    artistlistInfo.artists.push(...column);
  }

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
          artistlistInfo.pagination.last = lastPage;
        }
      }
    }
  }

  // Parse page meta
  const $navbar = $innermain.parent().find('div').first();
  const $metadata = $navbar.find('div').first();
  const $timeB = $metadata.find('b');
  if ($timeB.length > 0) {
    artistlistInfo.meta.time = $timeB.text().trim();
  }

  // Parse letters
  const $letters = $navbar.find('ul');
  $letters.find('li').each((_i: number, li: AnyNode) => {
    const $li = $(li);
    const $letterH3 = $li.find('a h3');
    if ($letterH3.length > 0) {
      const letter = $letterH3.text().trim();
      artistlistInfo.letters.push(letter);
    }
  });

  return artistlistInfo;
}
