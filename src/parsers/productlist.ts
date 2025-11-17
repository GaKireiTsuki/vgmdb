import * as cheerio from 'cheerio';
import { AnyNode } from 'domhandler';
import * as fetchUtils from '../utils/fetch';

export async function fetchProductlistPage(id: string): Promise<string> {
  return fetchUtils.fetchListPage('product', id);
}

export function parseProductlistPage(htmlSource: string): {
  products: Array<{
    link: string;
    type: string;
    names: Record<string, string>;
  }>;
  letters: string[];
  pagination: { last: number };
  meta: { time?: string };
} | null {
  const html = fetchUtils.fixInvalidTable(htmlSource);
  const $ = cheerio.load(html);

  const $pref = $('#pref');
  if ($pref.length === 0) {
    return null;
  }

  const $innermain = $pref.parent();
  if ($innermain.length === 0) {
    return null;
  }

  const productlistInfo: {
    products: Array<{
      link: string;
      type: string;
      names: Record<string, string>;
    }>;
    letters: string[];
    pagination: { last: number };
    meta: { time?: string };
  } = {
    products: [],
    letters: [],
    pagination: { last: 1 },
    meta: {},
  };

  // Parse product list
  const $outerTable = $innermain.find('table').first();
  const $table = $outerTable.find('table').first();
  const $rows = $table.find('tr');

  $rows.slice(1).each((_i: number, row: AnyNode) => {
    const $row = $(row);
    const $cells = $row.children('td');

    if ($cells.length < 2) return;

    const $typeCell = $cells.eq(0);
    const $nameCell = $cells.eq(1);

    // Parse type
    const $typeSpan = $typeCell.find('span');
    const productType = $typeSpan.text().trim();

    // Parse name and link
    const $link = $nameCell.find('a');
    if ($link.length === 0) return;

    const link = fetchUtils.trimAbsolute($link.attr('href') || '');
    const name = $link.text().trim();

    productlistInfo.products.push({
      link,
      type: productType,
      names: { en: name },
    });
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
          productlistInfo.pagination.last = lastPage;
        }
      }
    }
  }

  // Parse page meta
  const $navbarDivs = $innermain.children('div');
  if ($navbarDivs.length > 1) {
    const $navbar = $navbarDivs.eq(1);
    const $sections = $navbar.children('div');

    if ($sections.length > 0) {
      const $metadata = $sections.eq(0);
      const $timeB = $metadata.find('b');
      if ($timeB.length > 0) {
        productlistInfo.meta.time = $timeB.text().trim();
      }
    }

    // Parse letters
    if ($sections.length > 1) {
      const $lettersSection = $sections.eq(1);
      $lettersSection.find('td').each((_i: number, td: AnyNode) => {
        const $td = $(td);
        const $a = $td.find('a');
        const $strong = $td.find('strong');

        let letter = '';
        if ($a.length > 0) {
          letter = $a.text().trim();
        } else if ($strong.length > 0) {
          letter = $strong.text().trim();
        }

        if (letter) {
          productlistInfo.letters.push(letter);
        }
      });
    }
  }

  return productlistInfo;
}
