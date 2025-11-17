import * as cheerio from 'cheerio';
import { AnyNode } from 'domhandler';
import * as fetchUtils from '../utils/fetch';
import * as parseUtils from '../utils/parse';

export async function fetchEventlistPage(): Promise<string> {
  return fetchUtils.fetchSinglelistPage('events');
}

export function parseEventlistPage(htmlSource: string): {
  events: Record<string, Array<{
    link: string;
    names: Record<string, string>;
    shortname?: string;
    startdate?: string;
    enddate?: string;
  }>>;
  years: string[];
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

  const eventlistInfo: {
    events: Record<string, Array<{
      link: string;
      names: Record<string, string>;
      shortname?: string;
      startdate?: string;
      enddate?: string;
    }>>;
    years: string[];
    meta: Record<string, unknown>;
  } = {
    events: {},
    years: [],
    meta: {},
  };

  // Parse event list
  const $table = $innermain.find('table').first();
  $table.find('td').each((_i: number, td: AnyNode) => {
    const $td = $(td);
    $td.children('h3').each((_j: number, h3: AnyNode) => {
      const $h3 = $(h3);
      const year = $h3.text().trim();

      if (!eventlistInfo.years.includes(year)) {
        eventlistInfo.years.push(year);
      }

      if (!eventlistInfo.events[year]) {
        eventlistInfo.events[year] = [];
      }

      const $ul = $h3.next('ul');
      if ($ul.length > 0) {
        const yearEventlist = parseEventlist($ul, $);
        eventlistInfo.events[year].push(...yearEventlist);
        
        // Sort by startdate
        eventlistInfo.events[year].sort((a, b) => {
          const dateA = a.startdate || '';
          const dateB = b.startdate || '';
          return dateA.localeCompare(dateB);
        });
      }
    });
  });

  // Sort years
  eventlistInfo.years.sort();

  return eventlistInfo;
}

function parseEventlist(
  $list: cheerio.Cheerio<AnyNode>,
  $: cheerio.CheerioAPI
): Array<{
  link: string;
  names: Record<string, string>;
  shortname?: string;
  startdate?: string;
  enddate?: string;
}> {
  const eventlist: Array<{
    link: string;
    names: Record<string, string>;
    shortname?: string;
    startdate?: string;
    enddate?: string;
  }> = [];

  $list.children('div').each((_i: number, div: AnyNode) => {
    const $div = $(div);
    const event = parseEvent($div, $);
    eventlist.push(event);
  });

  return eventlist;
}

function parseEvent(
  $event: cheerio.Cheerio<AnyNode>,
  $: cheerio.CheerioAPI
): {
  link: string;
  names: Record<string, string>;
  shortname?: string;
  startdate?: string;
  enddate?: string;
} {
  const $h3 = $event.find('h3').first();
  const $link = $h3.find('a').first();
  const info: {
    link: string;
    names: Record<string, string>;
    shortname?: string;
    startdate?: string;
    enddate?: string;
  } = parseEventlink($link, $);

  // Parse optional shortname
  const $short = $event.children('a').first();
  if ($short.length > 0) {
    const $shortSpan = $short.find('span');
    if ($shortSpan.length > 0) {
      const shortname = $shortSpan.text().trim();
      if (shortname) {
        info.shortname = shortname;
      }
    }
  }

  // Parse dates
  const $dateDiv = $event.children('div').first();
  if ($dateDiv.length > 0) {
    const dateText = $dateDiv.text().trim();
    const dates = dateText.split('to');
    
    const startDate = parseUtils.parseDateTime(dates[0].trim());
    if (startDate) {
      info.startdate = startDate;
    }

    if (dates.length > 1) {
      const endDate = parseUtils.parseDateTime(dates[1].trim());
      if (endDate) {
        info.enddate = endDate;
      }
    } else if (info.startdate) {
      info.enddate = info.startdate;
    }
  }

  return info;
}

function parseEventlink(
  $link: cheerio.Cheerio<AnyNode>,
  $: cheerio.CheerioAPI
): {
  link: string;
  names: Record<string, string>;
} {
  const link = fetchUtils.trimAbsolute($link.attr('href') || '');
  const names = parseUtils.parseNames($link[0], $);

  return {
    link,
    names,
  };
}
