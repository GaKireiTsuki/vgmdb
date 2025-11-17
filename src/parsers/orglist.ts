import * as cheerio from 'cheerio';
import { AnyNode } from 'domhandler';
import * as fetchUtils from '../utils/fetch';

export async function fetchOrglistPage(): Promise<string> {
  return fetchUtils.fetchSinglelistPage('org');
}

export function parseOrglistPage(htmlSource: string): {
  orgs: Record<string, Array<{
    link: string;
    names: Record<string, string>;
    [key: string]: unknown;
  }>>;
  letters: string[];
  meta: Record<string, unknown>;
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

  const orglistInfo: {
    orgs: Record<string, Array<{
      link: string;
      names: Record<string, string>;
      [key: string]: unknown;
    }>>;
    letters: string[];
    meta: Record<string, unknown>;
  } = {
    orgs: {},
    letters: [],
    meta: {},
  };

  // Parse org list
  const $table = $innermain.find('table').first();
  $table.find('td').each((_i: number, td: AnyNode) => {
    const $td = $(td);
    $td.find('h3').each((_j: number, h3: AnyNode) => {
      const $h3 = $(h3);
      const heading = $h3.text().trim();
      
      let letter = heading;
      if (!heading || !letter || !/[#A-Z]/.test(letter)) {
        letter = '#';
      }

      if (!orglistInfo.letters.includes(letter)) {
        orglistInfo.letters.push(letter);
      }

      if (!orglistInfo.orgs[letter]) {
        orglistInfo.orgs[letter] = [];
      }

      const $ul = $h3.next('ul');
      if ($ul.length > 0) {
        const letterOrglist = parseOrglist($ul, $);
        orglistInfo.orgs[letter].push(...letterOrglist);
      }
    });
  });

  return orglistInfo;
}

function parseOrglist(
  $list: cheerio.Cheerio<AnyNode>,
  $: cheerio.CheerioAPI
): Array<{
  link: string;
  names: Record<string, string>;
  [key: string]: unknown;
}> {
  const orglist: Array<{
    link: string;
    names: Record<string, string>;
    [key: string]: unknown;
  }> = [];

  $list.find('li').each((_i: number, li: AnyNode) => {
    const $li = $(li);
    const org = parseOrg($li, $);
    orglist.push(org);
  });

  return orglist;
}

function parseOrg(
  $org: cheerio.Cheerio<AnyNode>,
  $: cheerio.CheerioAPI
): {
  link: string;
  names: Record<string, string>;
  [key: string]: unknown;
} {
  const $link = $org.find('a').first();
  const info: {
    link: string;
    names: Record<string, string>;
    [key: string]: unknown;
  } = parseOrglink($link);

  $org.children('div').each((_i: number, div: AnyNode) => {
    const $div = $(div);
    const firstText = $div.contents().first().text();
    const extraType = firstText.split(':')[0].toLowerCase();
    
    const extraList: Array<{
      link: string;
      names: Record<string, string>;
    }> = [];

    $div.find('a').each((_j: number, a: AnyNode) => {
      const $a = $(a);
      extraList.push(parseOrglink($a));
    });

    info[extraType] = extraList;
  });

  return info;
}

function parseOrglink(
  $link: cheerio.Cheerio<AnyNode>
): {
  link: string;
  names: Record<string, string>;
} {
  const link = fetchUtils.trimAbsolute($link.attr('href') || '');
  const name = $link.text().trim();

  return {
    link,
    names: { en: name },
  };
}
