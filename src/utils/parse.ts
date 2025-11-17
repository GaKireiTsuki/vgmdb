import { CheerioAPI } from 'cheerio';
import { AnyNode } from 'domhandler';

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
  if (notmonth.length === 4) {
    return `${notmonth.padStart(4, '0')}-${monthNum.toString().padStart(2, '0')}`;
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
