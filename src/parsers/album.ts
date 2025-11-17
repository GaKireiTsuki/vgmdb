import * as cheerio from 'cheerio';
import { CheerioAPI, Cheerio } from 'cheerio';
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
    return null; // info not found
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
    albumInfo.name = albumInfo.names['en'] || Object.values(albumInfo.names)[0] || '';
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
    if (el.text().trim() === name) {
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
      } else if (
        fieldName === 'Performed by' ||
        fieldName === 'Performer'
      ) {
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

function parseTracklist(
  $tracklist: Cheerio<AnyNode>,
  $: CheerioAPI
): Disc[] {
  const discs: Disc[] = [];

  $tracklist.find('table').each((_i: number, table: AnyNode) => {
    const $table = $(table);
    const disc: Disc = { tracks: [] };

    // Try to find disc name
    const $discName = $table.prevAll('h3').first();
    if ($discName.length > 0) {
      disc.name = $discName.text().trim();
    }

    $table.find('tr').each((_, row) => {
      const $row = $(row);
      const $cells = $row.find('td');

      if ($cells.length >= 2) {
        const $trackInfo = $cells.eq(1);
        const $trackTitle = $trackInfo.find('span.label').first();

        if ($trackTitle.length > 0) {
          const track: Track = {
            names: parseUtils.parseNames($trackTitle[0], $),
          };

          // Try to get track length
          const $length = $cells.last();
          const lengthText = $length.text().trim();
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
  });

  return discs;
}
