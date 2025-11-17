import * as cheerio from 'cheerio';
import { CheerioAPI, Cheerio } from 'cheerio';
import { AnyNode } from 'domhandler';
import { OrgInfo } from '../types';
import * as fetchUtils from '../utils/fetch';
import * as parseUtils from '../utils/parse';

export async function fetchOrgPage(id: string): Promise<string> {
  return fetchUtils.fetchInfoPage('org', id);
}

export function parseOrgPage(htmlSource: string): OrgInfo | null {
  const html = fetchUtils.fixInvalidTable(htmlSource);
  const $ = cheerio.load(html);

  const $profile = $('#innermain');
  const $rightColumn = $('#rightcolumn');
  
  if ($profile.length === 0) {
    return null;
  }

  const orgInfo: OrgInfo = {
    names: {},
    name: '',
    websites: {},
    staff: [],
    releases: [],
    type: 'Label / Imprint',
  };

  // Parse name
  const $nameDiv = $profile.prev('div');
  const $h1 = $nameDiv.find('h1');
  if ($h1.length > 0) {
    orgInfo.name = $h1.text().trim();
    orgInfo.names = { en: orgInfo.name };
  }

  const $divs = $profile.children('div');
  const $picDiv = $divs.eq(0);
  const $infoDiv = $divs.eq(1);

  // Parse picture
  const $picLink = $picDiv.find('a').first();
  if ($picLink.length > 0) {
    const fullLink = $picLink.attr('href');
    if (fullLink) {
      orgInfo.picture_full = fetchUtils.forceAbsolute(fullLink);
    }

    const $img = $picLink.find('img');
    if ($img.length > 0) {
      const mediumLink = $img.attr('src');
      if (mediumLink) {
        orgInfo.picture_small = fetchUtils.forceAbsolute(mediumLink);
      }
    }
  }

  // Parse org info
  const $dl = $infoDiv.find('dl').first();
  if ($dl.length > 0) {
    Object.assign(orgInfo, parseOrgInfo($dl, $));
  }

  // Parse releases
  const $table = $profile.find('table').first();
  if ($table.length > 0) {
    orgInfo.releases = parseOrgReleases($table, $);
  }

  // Parse websites
  const $rightDivs = $rightColumn.children('div');
  $rightDivs.each((_i: number, div: AnyNode) => {
    const $div = $(div);
    const $h3 = $div.find('h3');
    if ($h3.length > 0 && $h3.text().trim() === 'Websites') {
      const $nextDiv = $div.next('div');
      const $websitesDiv = $nextDiv.find('div').first();
      if ($websitesDiv.length > 0) {
        orgInfo.websites = parseWebsites($websitesDiv, $);
      }
    }
  });

  return orgInfo;
}

function parseOrgInfo(
  $dl: Cheerio<AnyNode>,
  $: CheerioAPI
): Partial<OrgInfo> {
  const info: Partial<OrgInfo> = {
    staff: [],
    description: '',
    type: 'Label / Imprint',
  };

  let currentName: string | null = null;

  $dl.children().each((_i: number, child: AnyNode) => {
    const $child = $(child);

    if ($child.is('dt')) {
      const $b = $child.find('b');
      currentName = $b.text().trim();
    } else if ($child.is('dd') && currentName) {
      if (currentName === 'Type') {
        info.type = $child.text().trim();
      } else if (currentName === 'Region') {
        info.region = $child.text().trim();
      } else if (currentName === 'Staff') {
        const staff: Array<{
          names: Record<string, string>;
          link: string;
          owner: boolean;
        }> = [];
        
        $child.find('a').each((_j: number, a: AnyNode) => {
          const $a = $(a);
          const names = parseUtils.parseNames(a, $);
          const link = fetchUtils.trimAbsolute($a.attr('href') || '');
          let owner = false;

          const $sibling = $a.next();
          if ($sibling.is('img') && $sibling.attr('title') === 'Owner, Leader or Representative') {
            owner = true;
          }

          staff.push({ names, link, owner });
        });
        
        info.staff = staff;
      } else if (currentName === 'Description') {
        const $span = $child.find('span');
        if ($span.length > 0) {
          info.description = $span.text().trim();
        } else {
          info.description = $child.text().trim();
        }
      }
    }
  });

  return info;
}

function parseOrgReleases(
  $table: Cheerio<AnyNode>,
  $: CheerioAPI
): Array<{
  role: string;
  catalog: string;
  reprint?: boolean;
  event?: {
    link: string;
    name: string;
    shortname: string;
  };
  date?: string;
  link?: string;
  titles: Record<string, string>;
  type?: string;
}> {
  const releases: Array<{
    role: string;
    catalog: string;
    reprint?: boolean;
    event?: {
      link: string;
      name: string;
      shortname: string;
    };
    date?: string;
    link?: string;
    titles: Record<string, string>;
    type?: string;
  }> = [];

  const $rows = $table.children('tr');
  
  $rows.slice(1).each((_i: number, row: AnyNode) => {
    const $row = $(row);
    const $cells = $row.children('td');
    
    if ($cells.length < 6) return;
    
    const release: {
      role: string;
      catalog: string;
      reprint?: boolean;
      event?: {
        link: string;
        name: string;
        shortname: string;
      };
      date?: string;
      link?: string;
      titles: Record<string, string>;
      type?: string;
    } = {
      role: '',
      catalog: '',
      titles: {},
    };
    
    // Role
    const $role = $cells.eq(0).find('span');
    if ($role.length > 0) {
      release.role = $role.text().trim();
    }
    
    // Catalog
    const $catalog = $cells.eq(1).find('span');
    if ($catalog.length > 0) {
      release.catalog = $catalog.text().trim();
    }
    
    // Reprint
    if ($cells.eq(2).find('img').length > 0) {
      release.reprint = true;
    }
    
    // Album info
    const $albumCell = $cells.eq(3);
    const $albumLink = $albumCell.find('a');
    if ($albumLink.length > 0) {
      release.link = fetchUtils.trimAbsolute($albumLink.attr('href') || '');
      release.titles = parseUtils.parseNames($albumLink[0], $);
      
      const albumClass = $albumLink.attr('class') || '';
      const classes = albumClass.split(' ');
      for (const cls of classes) {
        if (cls.includes('-')) {
          const parts = cls.split('-');
          if (parts.length === 2) {
            release.type = parts[1];
            break;
          }
        }
      }
    } else {
      const albumText = $albumCell.text().trim();
      if (albumText) {
        release.titles = { en: albumText };
      }
    }
    
    // Event
    const $eventLink = $cells.eq(4).find('a');
    if ($eventLink.length > 0) {
      release.event = {
        link: fetchUtils.trimAbsolute($eventLink.attr('href') || ''),
        name: $eventLink.attr('title') || '',
        shortname: $eventLink.find('span').text().trim(),
      };
    }
    
    // Date
    const $dateCell = $cells.eq(5).find('span');
    if ($dateCell.length > 0) {
      const $dateLink = $dateCell.find('a');
      const dateText = $dateLink.length > 0 ? $dateLink.text().trim() : $dateCell.text().trim();
      const parsed = parseUtils.parseDateTime(dateText);
      if (parsed) {
        release.date = parsed;
      }
    }
    
    releases.push(release);
  });

  return releases.sort((a, b) => {
    const dateA = a.date || '';
    const dateB = b.date || '';
    return dateA.localeCompare(dateB);
  });
}

function parseWebsites(
  $websitesDiv: Cheerio<AnyNode>,
  $: CheerioAPI
): Record<string, Array<{ link: string; name: string }>> {
  const sites: Record<string, Array<{ link: string; name: string }>> = {};

  $websitesDiv.children('div').each((_i: number, div: AnyNode) => {
    const $div = $(div);
    const category = $div.find('b').text().trim();
    const links: Array<{ link: string; name: string }> = [];
    
    $div.find('a').each((_j: number, a: AnyNode) => {
      const $a = $(a);
      let link = $a.attr('href') || '';
      link = fetchUtils.stripRedirect(link);
      const name = $a.text().trim();
      links.push({ link, name });
    });
    
    if (category && links.length > 0) {
      sites[category] = links;
    }
  });

  return sites;
}
