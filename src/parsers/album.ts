import * as cheerio from 'cheerio';
import { Cheerio, CheerioAPI } from 'cheerio';
import { AnyNode } from 'domhandler';
import { AlbumInfo, Disc, Track } from '../types';
import * as fetchUtils from '../utils/fetch';
import * as parseUtils from '../utils/parse';

export async function fetchAlbumPage(id: string): Promise<string> {
  return fetchUtils.fetchInfoPage('album', id);
}

export function parseAlbumPage(htmlSource: string): AlbumInfo | null {
  const html = fetchUtils.fixInvalidTable(htmlSource);
  const $ = cheerio.load(html);

  const $profile = $('#innermain');
  if ($profile.length === 0) {
    return null;
  }

  const albumInfo: AlbumInfo = {
    names: {},
    name: '',
    arrangers: [],
    performers: [],
    composers: [],
    lyricists: [],
    organizations: [],
  };

  // parse names
  const $names = $profile.find('h1').first();
  if ($names.length > 0) {
    albumInfo.names = parseUtils.parseNames($names[0], $);
    albumInfo.name =
      albumInfo.names['en'] || Object.values(albumInfo.names)[0] || '';
  }

  // main cover
  const $cover = $('#coverart');
  if ($cover.length > 0) {
    const style = $cover.attr('style') || '';
    const mediumLink = fetchUtils.extractBackgroundImage(style);
    if (mediumLink) {
      const absoluteLink = fetchUtils.forceAbsolute(mediumLink);
      albumInfo.picture_thumb = fetchUtils.mediaThumb(absoluteLink);
      albumInfo.picture_small = absoluteLink;
      albumInfo.picture_full = fetchUtils.mediaFull(absoluteLink);
    }
  }

  // main info header
  const $rightfloat = $profile.find('#rightfloat');
  if ($rightfloat.length > 0) {
    const $infoTable = $rightfloat.find('table').first();
    if ($infoTable.length > 0) {
      Object.assign(albumInfo, parseAlbumInfo($infoTable, $));
    }
  }

  // credit list
  const $creditHead = findElementNamed($profile, 'span', 'Credits', $);
  if ($creditHead.length > 0) {
    const $creditInfo = $creditHead.parent().parent();
    const $creditList = $creditInfo.find('table').first();
    if ($creditList.length > 0) {
      Object.assign(albumInfo, parseAlbumInfo($creditList, $));
    }
  }

  // track list
  const $tracklistHead = findElementNamed($profile, 'h3', 'Tracklist', $);
  if ($tracklistHead.length > 0) {
    const $tracklist = $tracklistHead.parent().parent();
    albumInfo.discs = parseTracklist($tracklist, $);
  }

  // notes section
  const $notesHead = findElementNamed($profile, 'h3', 'Notes', $);
  if ($notesHead.length > 0) {
    const $notesContainer = $notesHead.parent();
    const $notesDiv = $notesContainer.find('div div').first();
    if ($notesDiv.length > 0) {
      const notes = parseUtils.parseString($notesDiv[0], $).trim();
      if (notes) {
        albumInfo.notes = notes;
      }
    }
  }

  // right column (stats, related, stores, websites, covers, meta)
  const $rightColumn = $('#rightcolumn');
  if ($rightColumn.length > 0) {
    Object.assign(albumInfo, parseRightColumn($rightColumn, $));
  }

  // ensure required arrays exist
  if (!albumInfo.covers) albumInfo.covers = [];

  return albumInfo;
}

function findElementNamed(
  $parent: Cheerio<AnyNode>,
  tagname: string,
  name: string,
  $: CheerioAPI
): Cheerio<AnyNode> {
  const elements = $parent.find(tagname);
  for (let i = 0; i < elements.length; i++) {
    const el = elements.eq(i);
    // Get the text content, which includes text from all child nodes
    const text = el.text().trim();
    // Check if the text starts with the name (to handle cases where there are links/images after)
    if (text === name || text.startsWith(name + ' ')) {
      return el;
    }
  }
  return $();
}

function parseAlbumInfo(
  $infoTable: Cheerio<AnyNode>,
  $: CheerioAPI
): Partial<AlbumInfo> {
  const info: Partial<AlbumInfo> = {};

  const $rows = $infoTable.find('tr');

  $rows.each((_i: number, row: AnyNode) => {
    const $row = $(row);
    const $td = $row.find('td').first();
    if ($td.length === 0) return;

    const $b = $td.find('b');
    if ($b.length === 0) return;

    const names = parseUtils.parseNames($b[0], $);
    const fieldName = names['en'] || '';
    const $value = $td.next('td');

    if (fieldName === 'Catalog Number') {
      const text = $value.text().trim();
      info.catalog = text.split('(')[0].trim();
    } else if (fieldName === 'Release Date') {
      const dateText = $value.text().trim();
      const normalizedDate = fetchUtils.normalizeDottedDate(dateText);
      if (normalizedDate) {
        info.release_date = normalizedDate;
      }
    } else if (fieldName === 'Publish Format') {
      info.media_format = $value.text().trim();
    } else if (fieldName === 'Media Format') {
      info.media_format = $value.text().trim();
    } else if (fieldName === 'Classification') {
      info.classification = $value.text().trim();
    } else if (
      ['Publisher', 'Label', 'Distributor', 'Retailer'].includes(fieldName)
    ) {
      const $link = $value.find('a').first();
      if ($link.length > 0) {
        const orgLink = fetchUtils.trimAbsolute($link.attr('href') || '');
        const orgNames = parseUtils.parseNames($link[0], $);

        if (!info.organizations) {
          info.organizations = [];
        }

        const orgInfo = {
          names: orgNames,
          link: orgLink,
          role: fieldName.toLowerCase(),
        };

        info.organizations.push(orgInfo);

        if (fieldName === 'Publisher' || fieldName === 'Label') {
          info.publisher = {
            names: orgNames,
            link: orgLink,
          };
        }
      }
    } else if (
      [
        'Composed by',
        'Arranged by',
        'Performed by',
        'Lyrics by',
        'Composer',
        'Arranger',
        'Performer',
        'Lyricist',
      ].includes(fieldName)
    ) {
      const artists = $value
        .find('a')
        .map((_, a) => $(a).text().trim())
        .get();

      if (
        fieldName === 'Composed by' ||
        fieldName === 'Composer' ||
        fieldName.includes('Composed')
      ) {
        if (!info.composers) info.composers = [];
        info.composers.push(...artists);
      } else if (
        fieldName === 'Arranged by' ||
        fieldName === 'Arranger' ||
        fieldName.includes('Arranged')
      ) {
        if (!info.arrangers) info.arrangers = [];
        info.arrangers.push(...artists);
      } else if (fieldName === 'Performed by' || fieldName === 'Performer') {
        if (!info.performers) info.performers = [];
        info.performers.push(...artists);
      } else if (fieldName === 'Lyrics by' || fieldName === 'Lyricist') {
        if (!info.lyricists) info.lyricists = [];
        info.lyricists.push(...artists);
      }
    }
  });

  return info;
}

function parseTracklist($tracklist: Cheerio<AnyNode>, $: CheerioAPI): Disc[] {
  const discs: Disc[] = [];

  // Find the tracklist sections
  const $sections = $tracklist.find('div').children('div');

  if ($sections.length < 2) {
    return discs;
  }

  // Try to find the language tabs first - they determine how many language versions there are
  const $tabsSection = $sections.eq(1);

  // Find all span tabs (each language has its own tab)
  const $tabs = $tabsSection.find('div').first().children('span');

  // For each language tab
  $tabs.each((tabIndex: number, tab: AnyNode) => {
    const $tab = $(tab);

    // Find all disc sections within this tab
    const $discSpans = $tab.find('span').filter((_i: number, span: AnyNode) => {
      const $span = $(span);
      // Disc headers have a <b> tag
      return $span.find('b').length > 0;
    });

    $discSpans.each((_discIndex: number, discSpan: AnyNode) => {
      const $discSpan = $(discSpan);

      // Get disc name
      const $discName = $discSpan.find('b').first();
      const discName = $discName.text().trim();

      // Find the table following this disc span
      const $trackTable = $discSpan.next('table');

      if ($trackTable.length > 0 && tabIndex === 0) {
        // Only parse the first language tab to avoid duplicates
        const disc: Disc = {
          name: discName,
          tracks: [],
        };

        // Parse tracks
        $trackTable.find('tr').each((_rowIndex: number, row: AnyNode) => {
          const $row = $(row);
          const $cells = $row.find('td');

          if ($cells.length >= 2) {
            const $titleCell = $cells.eq(1);
            const $titleSpan = $titleCell.find('span.label').first();

            if ($titleSpan.length > 0) {
              const track: Track = {
                names: parseUtils.parseNames($titleSpan[0], $),
              };

              // Get track length - it's usually the last cell or in the track info
              const $lengthCell = $cells.last();
              const lengthText = $lengthCell.text().trim();
              if (lengthText.match(/\d+:\d+/)) {
                track.track_length = lengthText;
              }

              disc.tracks.push(track);
            }
          }
        });

        if (disc.tracks.length > 0) {
          discs.push(disc);
        }
      }
    });
  });

  return discs;
}

function parseRightColumn(
  $rightColumn: Cheerio<AnyNode>,
  $: CheerioAPI
): Partial<AlbumInfo> {
  const info: Partial<AlbumInfo> = {};

  let $div = $rightColumn.children('div').first();

  while ($div.length > 0) {
    const $section = $div.next('div');
    const $h3 = $div.find('div h3').first();

    if ($h3.length > 0) {
      const sectionTitle = $h3.text().trim();

      if (sectionTitle === 'Album Stats') {
        const $statsDiv = $section.find('div').first();
        if ($statsDiv.length > 0) {
          Object.assign(info, parseAlbumStats($statsDiv, $));
        }
      } else if (sectionTitle === 'Related Albums') {
        const $relatedSpan = $section.find('span').first();
        if ($relatedSpan.length > 0) {
          info.related = parseRelatedAlbums($relatedSpan, $);
        }
      } else if (sectionTitle === 'Available at') {
        const $storesDiv = $section.find('div').first();
        if ($storesDiv.length > 0) {
          info.stores = parseStores($storesDiv, $);
        }
      } else if (sectionTitle === 'Websites') {
        const $websitesDiv = $section.find('div').first();
        if ($websitesDiv.length > 0) {
          info.websites = parseWebsites($websitesDiv, $);
        }
      } else if (sectionTitle === 'Covers') {
        const $coversDiv = $div.find('div#cover_gallery').first();
        if ($coversDiv.length > 0) {
          info.covers = parseCovers($coversDiv, $);
        }
      }

      $div = $section.next('div');
    } else {
      // Entry stats (meta information)
      const $metaDiv = $div.find('div').first();
      if ($metaDiv.length > 0) {
        info.meta = parseUtils.parseMeta($metaDiv, $);
      }
      $div = $();
    }
  }

  return info;
}

function parseAlbumStats(
  $section: Cheerio<AnyNode>,
  $: CheerioAPI
): Partial<AlbumInfo> {
  const info: Partial<AlbumInfo> = {};
  const $divs = $section.children('div');

  // Parse rating
  const $rating = $divs.eq(0).children('span');
  if ($rating.length <= 1) {
    info.votes = 0;
  } else {
    const ratingText = $rating.eq(1).text();
    const splits = ratingText.split(/\s+/);
    if (splits[0] === 'Nobody') {
      info.votes = 0;
    } else {
      info.rating = parseFloat(splits[1]);
      info.votes = parseInt(splits[3]);
    }
  }

  // Parse other stats
  $divs.slice(1).each((_i: number, div: AnyNode) => {
    const $div = $(div);
    const $b = $div.find('b').first();
    if ($b.length === 0) return;

    const divName = $b.text().trim();
    let divValue: string | undefined;

    $div.contents().each((_j, node) => {
      if (node.type === 'text') {
        const text = $(node).text().trim();
        if (text) divValue = text;
      }
    });

    if (divName === 'Category' && typeof divValue === 'string') {
      const categories = divValue.split(',').map((c: string) => c.trim());
      info.category = categories[0];
      info.categories = categories;
    } else if (divName === 'Products represented') {
      const products: Array<{ names: Record<string, string>; link?: string }> =
        [];
      $div.find('a').each((_j: number, a: AnyNode) => {
        const $a = $(a);
        const product: { names: Record<string, string>; link?: string } = {
          names: parseUtils.parseNames(a, $),
        };
        const link = fetchUtils.trimAbsolute($a.attr('href') || '');
        if (link && !link.startsWith('search?')) {
          product.link = link;
        }
        products.push(product);
      });

      // Also parse non-linked products
      const $br = $div.find('br');
      if ($br.length > 0) {
        const nextNode = $br[0].nextSibling;
        if (nextNode && nextNode.type === 'text') {
          const text = $(nextNode).text();
          text.split(',').forEach((productName) => {
            const trimmed = productName.trim();
            if (trimmed) {
              products.push({ names: { en: trimmed } });
            }
          });
        }
      }

      info.products = products;
    } else if (
      divName === 'Platforms represented' &&
      typeof divValue === 'string'
    ) {
      info.platforms = divValue.split(',').map((p: string) => p.trim());
    }
  });

  return info;
}

function parseRelatedAlbums(
  $div: Cheerio<AnyNode>,
  $: CheerioAPI
): Array<{
  catalog: string;
  link: string;
  type: string;
  names: Record<string, string>;
  date?: string;
}> {
  const albums: Array<{
    catalog: string;
    link: string;
    type: string;
    names: Record<string, string>;
    date?: string;
  }> = [];

  $div.children('div').each((_i: number, albumDiv: AnyNode) => {
    const $albumDiv = $(albumDiv);
    const $ul = $albumDiv.find('ul');

    let catalog = '';
    let names: Record<string, string> = {};
    let albumType = '';
    let link = '';
    let date: string | undefined;

    if ($ul.length > 0) {
      // Has thumbnails
      const $rows = $ul.children('li');
      const $catalogSpan = $rows.eq(1).find('span').first();
      catalog = $catalogSpan.text().trim();

      const $titleLink = $rows.eq(0).find('a').first();
      names = parseUtils.parseNames($titleLink[0], $);
      const classes = $titleLink.attr('class') || '';
      albumType = classes.split('-').pop() || '';
      link = fetchUtils.trimAbsolute($titleLink.attr('href') || '');

      const dateText = $rows.eq(2).text().trim();
      const parsedDate = parseUtils.parseDateTime(dateText);
      date = parsedDate || undefined;
    } else {
      // No thumbnails
      const $catalogSpan = $albumDiv.children('span').first();
      catalog = $catalogSpan.text().trim();

      const $titleLink = $albumDiv.find('a').first();
      names = parseUtils.parseNames($titleLink[0], $);
      const classes = $titleLink.attr('class') || '';
      albumType = classes.split('-').pop() || '';
      link = fetchUtils.trimAbsolute($titleLink.attr('href') || '');
    }

    const album: {
      catalog: string;
      link: string;
      type: string;
      names: Record<string, string>;
      date?: string;
    } = { catalog, link, type: albumType, names };

    if (date) {
      album.date = date;
    }

    albums.push(album);
  });

  return albums;
}

function parseStores(
  $div: Cheerio<AnyNode>,
  $: CheerioAPI
): Array<{ link: string; name: string }> {
  const links: Array<{ link: string; name: string }> = [];

  $div.children('span').each((_i: number, span: AnyNode) => {
    const $span = $(span);
    const $link = $span.find('a');
    if ($link.length === 0) return;

    let link = $link.attr('href') || '';
    const name = $link.text();

    if (link.startsWith('/redirect')) {
      link = fetchUtils.stripRedirect(link);
    }

    links.push({ link, name });
  });

  return links;
}

function parseWebsites(
  $div: Cheerio<AnyNode>,
  $: CheerioAPI
): Record<string, Array<{ link: string; name: string }>> {
  const sites: Record<string, Array<{ link: string; name: string }>> = {};

  $div.children('div').each((_i: number, categoryDiv: AnyNode) => {
    const $categoryDiv = $(categoryDiv);
    const category = $categoryDiv.find('b').text();
    const links: Array<{ link: string; name: string }> = [];

    $categoryDiv.children('span').each((_j: number, span: AnyNode) => {
      const $span = $(span);
      const $link = $span.find('a');
      if ($link.length === 0) return;

      let link = $link.attr('href') || '';
      const name = $link.text();

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

function parseCovers(
  $div: Cheerio<AnyNode>,
  $: CheerioAPI
): Array<{ name: string; thumb: string; medium: string; full: string }> {
  const covers: Array<{
    name: string;
    thumb: string;
    medium: string;
    full: string;
  }> = [];

  $div.find('table').each((_i: number, table: AnyNode) => {
    const $table = $(table);
    $table.find('tr').each((_j: number, row: AnyNode) => {
      const $row = $(row);
      $row.find('td').each((_k: number, cell: AnyNode) => {
        const $cell = $(cell);
        const $link = $cell.find('a');
        if ($link.length === 0) return;

        const mediumLink = fetchUtils.forceAbsolute($link.attr('href') || '');
        const fullLink = fetchUtils.mediaFull(mediumLink);
        const thumbLink = fetchUtils.mediaThumb(mediumLink);

        const $h4 = $link.find('h4');
        const name = $h4.length > 0 ? $h4.text().trim() : '';

        covers.push({
          name,
          thumb: thumbLink,
          medium: mediumLink,
          full: fullLink,
        });
      });
    });
  });

  return covers;
}
