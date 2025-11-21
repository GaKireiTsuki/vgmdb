import * as cheerio from 'cheerio';
import { CheerioAPI } from 'cheerio';
import { AnyNode } from 'domhandler';
import * as fetchUtils from './fetch';

export function parseString(element: AnyNode, cheerio: CheerioAPI): string {
  const $ = cheerio;

  if (element.type === 'text') {
    let text = $(element).text();
    text = text.replace(/\s+/g, ' ');
    text = text.replace(/\u200b/g, '');
    return text;
  }

  if (element.type === 'tag') {
    if (element.name === 'br') {
      return '\n';
    }

    const omitted = ['em'];
    if (omitted.includes(element.name)) {
      return '';
    }

    const bits: string[] = [];
    const children = $(element).contents().toArray();

    for (const child of children) {
      bits.push(parseString(child, cheerio));
    }

    let ret = bits.join('');
    ret = ret.replace(/\s*\n+\s*/g, '\n');
    ret = ret.replace(/\u200b/g, '');
    return ret;
  }

  return '';
}

export function parseShallowString(
  element: AnyNode,
  cheerio: CheerioAPI
): string {
  const $ = cheerio;

  if (element.type !== 'tag') {
    return $(element).text();
  }

  const bits: string[] = [];
  const children = $(element).contents().toArray();

  for (const child of children) {
    if (child.type !== 'tag') {
      bits.push($(child).text());
    }
  }

  let ret = bits.join('');
  ret = ret.replace(/\s+/g, ' ');
  ret = ret.replace(/\u200b/g, '');
  return ret;
}

export function isEnglish(text: string): boolean {
  const letters = text.split('').filter((char) => /\p{L}/u.test(char));

  if (letters.length === 0) return true;

  const englishLetters = letters.filter((char) => /[a-zA-Z]/.test(char));
  return englishLetters.length / letters.length > 0.5;
}

export function parseNames(
  element: AnyNode,
  cheerio: CheerioAPI
): Record<string, string> {
  const $ = cheerio;
  const info: Record<string, string> = {};

  const shallowString = parseShallowString(element, cheerio);
  if (shallowString.trim().length > 0) {
    const langcode = isEnglish(shallowString.trim()) ? 'en' : 'ja';
    info[langcode] = shallowString.trim();
  }

  $(element)
    .children('span')
    .each((_, span) => {
      const lang = $(span).attr('lang')?.toLowerCase();
      if (!lang) return;

      const name = parseString(span, cheerio);
      info[lang] = name.trim();
    });

  return info;
}

export function parseDateTime(time: string): string | null {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const fullmonths = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const trimmedTime = time.trim();
  if (trimmedTime === '0') return null;
  if (trimmedTime.length === 4) return trimmedTime;

  const space = trimmedTime.indexOf(' ');
  if (space === -1) return null;

  let month = trimmedTime.substring(0, space);
  month = month.endsWith(',') ? month.slice(0, -1) : month;

  let monthNum = 0;
  if (months.includes(month)) {
    monthNum = months.indexOf(month) + 1;
  } else if (fullmonths.includes(month)) {
    monthNum = fullmonths.indexOf(month) + 1;
  }

  const notmonth = trimmedTime.substring(space + 1).trim();
  if (notmonth.length === 4 && /^\d{4}$/.test(notmonth)) {
    const year = parseInt(notmonth, 10);
    return `${year.toString().padStart(4, '0')}-${monthNum.toString().padStart(2, '0')}`;
  }

  const dayYearMatch = trimmedTime
    .substring(space + 1)
    .match(/(\d{1,2}),?\s*([12]\d{3})?/);

  if (!dayYearMatch) return null;

  const day = parseInt(dayYearMatch[1], 10);
  const year = dayYearMatch[2] ? parseInt(dayYearMatch[2], 10) : 0;
  const timepos = space + 1 + dayYearMatch[0].length + 1;

  if (timepos >= trimmedTime.length) {
    return `${year.toString().padStart(4, '0')}-${monthNum.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  let hour = parseInt(trimmedTime.substring(timepos, timepos + 2), 10);
  const minute = parseInt(trimmedTime.substring(timepos + 3, timepos + 5), 10);
  const ampm = trimmedTime.substring(timepos + 6, timepos + 8);

  if (ampm === 'PM' && hour < 12) {
    hour += 12;
  }

  return `${year.toString().padStart(4, '0')}-${monthNum.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export const categoryTypeMap: Record<string, string> = {
  Game: 'game',
  Animation: 'anime',
  Publication: 'print',
  'Audio Drama': 'drama',
  Live: 'live',
  'Tokusatsu/Puppetry': 'toku',
  'Multimedia Franchise': 'mult',
  'Demo Scene': 'demo',
  'Other Works': 'works',
  'Enclosure/Promo': 'bonus',
  'Doujin/Fanmade': 'doujin',
  'Delayed/Cancelled': 'cancel',
  Bootleg: 'bootleg',
};

export const typeCategoryMap: Record<string, string> = Object.fromEntries(
  Object.entries(categoryTypeMap).map(([k, v]) => [v, k])
);

export function categoryToType(category: string): string | undefined {
  return categoryTypeMap[category];
}

export function typeToCategory(type: string): string | undefined {
  return typeCategoryMap[type];
}

export function normalizeSeparatedDate(
  weirdDate: string,
  separator: string
): string | null {
  if (!weirdDate) {
    return null;
  }

  const elements = weirdDate.split(separator);
  const output: number[] = [];

  for (const elem of elements) {
    if (elem.length > 0 && elem[0] !== '?') {
      const num = parseInt(elem, 10);
      if (!isNaN(num)) {
        output.push(num);
      }
    }
  }

  if (output.length === 0) {
    return null;
  }

  const stringedOutput: string[] = [output[0].toString().padStart(4, '0')];
  for (let i = 1; i < output.length; i++) {
    stringedOutput.push(output[i].toString().padStart(2, '0'));
  }

  return stringedOutput.join('-');
}

export function normalizeDottedDate(weirdDate: string): string | null {
  return normalizeSeparatedDate(weirdDate, '.');
}

export function normalizeDashedDate(weirdDate: string): string | null {
  return normalizeSeparatedDate(weirdDate, '-');
}

export function parseDiscography(
  $table: cheerio.Cheerio<AnyNode>,
  $: cheerio.CheerioAPI
): Array<{
  date?: string;
  roles?: string[];
  classifications?: string[];
  titles: Record<string, string>;
  catalog: string;
  link: string;
  type: string;
  reprint?: boolean;
}> {
  const albums: Array<{
    date?: string;
    roles?: string[];
    classifications?: string[];
    titles: Record<string, string>;
    catalog: string;
    link: string;
    type: string;
    reprint?: boolean;
  }> = [];

  if ($table.length === 0) {
    return albums;
  }

  $table.children('tbody').each((_i: number, tbody: AnyNode) => {
    const $tbody = $(tbody);
    const $rows = $tbody.children('tr');

    if ($rows.length === 0) return;

    const $firstRow = $rows.first();
    const $yearH3 = $firstRow.find('h3');
    const year = $yearH3.text().trim();

    $rows.slice(1).each((_j: number, tr: AnyNode) => {
      const $tr = $(tr);
      const $cells = $tr.children('td');

      if ($cells.length < 2) return;

      const monthDay = $cells.eq(0).text().trim();
      const $albumCell = $cells.eq(1);
      const $album = $albumCell.find('a').first();

      if ($album.length === 0) return;

      const link = fetchUtils.trimAbsolute($album.attr('href') || '');
      const albumClass = $album.attr('class') || '';
      const classes = albumClass.split(' ');
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

      const $albumInfo = $albumCell.children('span');
      let catalog = '';
      let rolesStr = '';

      if ($albumInfo.length >= 1) {
        catalog = $albumInfo.eq(0).text().trim();
      }
      if ($albumInfo.length >= 2) {
        const $rolesSpan = $albumInfo.eq(1);
        rolesStr = $rolesSpan.text().trim();
      }

      const roles = rolesStr
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r);

      const normalizedDate = normalizeDottedDate(`${year}.${monthDay}`);
      const date = normalizedDate || undefined;

      const titles: Record<string, string> = {};
      $album.children('span').each((_k: number, span: AnyNode) => {
        const $span = $(span);
        const titleLang = ($span.attr('lang') || '').toLowerCase();
        let titleText = '';

        $span.contents().each((_l: number, child: AnyNode) => {
          if (child.type === 'text') {
            titleText = $(child).text().trim();
            titleText = titleText.replace(/^["']|["']$/g, '');
          }
        });

        if (titleLang && titleText) {
          titles[titleLang] = titleText;
        }
      });

      let reprint = false;
      $albumCell.children('img').each((_k: number, img: AnyNode) => {
        const $img = $(img);
        const alt = $img.attr('alt') || '';
        if (alt === 'This album is a reprint') {
          reprint = true;
        }
      });

      albums.push({
        date,
        classifications: roles,
        roles,
        titles,
        catalog,
        link,
        type: albumType,
        reprint,
      });
    });
  });

  return albums;
}

export function parseMeta(
  $metaSection: cheerio.Cheerio<AnyNode>,
  $: cheerio.CheerioAPI
): {
  added_date?: string;
  added_user?: string;
  edited_date?: string;
  edited_user?: string;
  [key: string]: unknown;
} {
  const metaInfo: {
    added_date?: string;
    added_user?: string;
    edited_date?: string;
    edited_user?: string;
    [key: string]: unknown;
  } = {};

  if ($metaSection.length === 0) {
    return metaInfo;
  }

  $metaSection.children('div').each((_i: number, div: AnyNode) => {
    const $div = $(div);
    const $label = $div.find('b').first();
    const label = $label.text().trim();

    if (label === 'Added' || label === 'Added by') {
      const $br = $div.find('br');
      if ($br.length > 0) {
        const nextText = $br[0].nextSibling;
        if (nextText && nextText.type === 'text') {
          const date = $(nextText).text().trim();
          const $timeSpan = $div.find('span').first();
          const time = $timeSpan.text().trim();
          const datetime = parseDateTime(`${date} ${time}`);
          if (datetime) {
            metaInfo.added_date = datetime;
          }
        }
      }

      if (label === 'Added by') {
        const nameNode = $label[0].nextSibling;
        if (nameNode && nameNode.type === 'text') {
          const name = $(nameNode).text().trim();
          if (name) {
            metaInfo.added_user = name;
          }
        }
      }
    } else if (label === 'Edited' || label === 'Edited by') {
      const $br = $div.find('br');
      if ($br.length > 0) {
        const nextText = $br[0].nextSibling;
        if (nextText && nextText.type === 'text') {
          const date = $(nextText).text().trim();
          const $timeSpan = $div.find('span').first();
          const time = $timeSpan.text().trim();
          const datetime = parseDateTime(`${date} ${time}`);
          if (datetime) {
            metaInfo.edited_date = datetime;
          }
        }
      }

      if (label === 'Edited by') {
        const nameNode = $label[0].nextSibling;
        if (nameNode && nameNode.type === 'text') {
          const name = $(nameNode).text().trim();
          if (name) {
            metaInfo.edited_user = name;
          }
        }
      }
    }
  });

  return metaInfo;
}

export function parseFullName(japanName: string): {
  name_real?: string;
  name_trans?: string;
} {
  const nameData: {
    name_real?: string;
    name_trans?: string;
  } = {};

  if (japanName.length > 0) {
    const leftParen = japanName.indexOf('(');
    if (leftParen >= 0) {
      const rightParen = japanName.lastIndexOf(')');
      const origName = japanName.substring(0, leftParen).trim();
      const ganaName = japanName.substring(leftParen + 1, rightParen).trim();
      nameData.name_real = origName;
      nameData.name_trans = ganaName;
    } else {
      nameData.name_real = japanName;
    }
  }

  return nameData;
}

export function parseWebsites(
  $div: cheerio.Cheerio<AnyNode>,
  $: cheerio.CheerioAPI
): Record<string, Array<{ link: string; name: string }>> {
  const sites: Record<string, Array<{ link: string; name: string }>> = {};

  $div.children('div').each((_i: number, categoryDiv: AnyNode) => {
    const $categoryDiv = $(categoryDiv);
    const category = $categoryDiv.find('b').text();
    const links: Array<{ link: string; name: string }> = [];

    $categoryDiv.children('a').each((_j: number, a: AnyNode) => {
      const $a = $(a);
      let link = $a.attr('href') || '';
      const name = $a.text();

      if (link.startsWith('/redirect')) {
        link = fetchUtils.stripRedirect(link);
      }

      links.push({ link, name });
    });

    if (category && links.length > 0) {
      sites[category] = links;
    }
  });

  return sites;
}
