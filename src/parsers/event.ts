import * as cheerio from 'cheerio';
import { CheerioAPI, Cheerio } from 'cheerio';
import { AnyNode } from 'domhandler';
import { EventInfo } from '../types';
import * as fetchUtils from '../utils/fetch';
import * as parseUtils from '../utils/parse';

export async function fetchEventPage(id: string): Promise<string> {
  return fetchUtils.fetchInfoPage('event', id);
}

export function parseEventPage(htmlSource: string): EventInfo | null {
  const html = fetchUtils.fixInvalidTable(htmlSource);
  const $ = cheerio.load(html);

  const $innermain = $('#innermain');
  if ($innermain.length === 0) {
    return null;
  }

  const eventInfo: EventInfo = {
    name: '',
    releases: [],
  };

  const $sections = $innermain.parent().children('div');
  const $titleSpans = $sections.eq(0).children('span');

  // Parse event name
  const $nameSpan = $titleSpans.eq(1).find('span.albumtitle');
  if ($nameSpan.length > 0) {
    eventInfo.name = $nameSpan.text().trim();
  }

  // Parse dates
  const $dateSpan = $titleSpans.eq(2);
  if ($dateSpan.length > 0) {
    const dateText = $dateSpan.text().trim();
    const datePieces = dateText.split('to');
    
    if (datePieces.length > 0) {
      const startDate = parseUtils.parseDateTime(datePieces[0].trim());
      if (startDate) {
        eventInfo.startdate = startDate;
      }
    }
    
    if (datePieces.length > 1) {
      const endDate = parseUtils.parseDateTime(datePieces[datePieces.length - 1].trim());
      if (endDate) {
        eventInfo.enddate = endDate;
      }
    } else if (datePieces.length === 1 && eventInfo.startdate) {
      eventInfo.enddate = eventInfo.startdate;
    }
  }

  // Parse notes
  const $notesDiv = $innermain.find('div').first();
  if ($notesDiv.length > 0) {
    const notes = parseUtils.parseString($notesDiv[0], $).trim();
    if (notes) {
      eventInfo.notes = notes;
    }
  }

  // Parse releases
  const $releaseTable = $sections.eq(2).find('table').first();
  if ($releaseTable.length > 0) {
    eventInfo.releases = parseEventReleases($releaseTable, $);
  }

  return eventInfo;
}

function parseEventReleases(
  $table: Cheerio<AnyNode>,
  $: CheerioAPI
): Array<{
  release_type?: string;
  catalog: string;
  album_type?: string;
  titles: Record<string, string>;
  link: string;
  release_date?: string;
  publisher?: {
    link?: string;
    names: Record<string, string>;
  };
}> {
  const releases: Array<{
    release_type?: string;
    catalog: string;
    album_type?: string;
    titles: Record<string, string>;
    link: string;
    release_date?: string;
    publisher?: {
      link?: string;
      names: Record<string, string>;
    };
  }> = [];

  const $rows = $table.children('tr');
  
  $rows.slice(1).each((_i: number, row: AnyNode) => {
    const $row = $(row);
    const $cells = $row.children('td');
    
    if ($cells.length < 5) return;
    
    const release: {
      release_type?: string;
      catalog: string;
      album_type?: string;
      titles: Record<string, string>;
      link: string;
      release_date?: string;
      publisher?: {
        link?: string;
        names: Record<string, string>;
      };
    } = {
      catalog: '',
      titles: {},
      link: '',
    };
    
    // Release type
    const $releaseType = $cells.eq(0).find('span');
    if ($releaseType.length > 0) {
      release.release_type = $releaseType.text().trim();
    }
    
    // Catalog
    const $catalogSpan = $cells.eq(1).find('span');
    if ($catalogSpan.length > 0) {
      release.catalog = $catalogSpan.text().trim();
      
      const spanClass = $catalogSpan.attr('class') || '';
      const classes = spanClass.split(' ');
      for (const cls of classes) {
        if (cls.includes('-')) {
          const parts = cls.split('-');
          if (parts.length === 2) {
            release.album_type = parts[1];
            break;
          }
        }
      }
    }
    
    // Titles and link
    const $titleLink = $cells.eq(3).find('a');
    if ($titleLink.length > 0) {
      release.titles = parseUtils.parseNames($titleLink[0], $);
      release.link = fetchUtils.trimAbsolute($titleLink.attr('href') || '');
    }
    
    // Publisher
    const $publisherCell = $cells.eq(4);
    const $publisherLink = $publisherCell.find('a');
    if ($publisherLink.length > 0) {
      release.publisher = {
        link: fetchUtils.trimAbsolute($publisherLink.attr('href') || ''),
        names: parseUtils.parseNames($publisherLink[0], $),
      };
    } else {
      const publisherText = $publisherCell.text().trim();
      if (publisherText) {
        release.publisher = {
          names: { en: publisherText },
        };
      }
    }
    
    // Release date
    if ($cells.length > 5) {
      const $dateSpan = $cells.eq(5).find('span');
      if ($dateSpan.length > 0) {
        const dateText = $dateSpan.text().trim();
        const parsed = parseUtils.parseDateTime(dateText);
        if (parsed) {
          release.release_date = parsed;
        }
      }
    }
    
    releases.push(release);
  });

  return releases;
}
