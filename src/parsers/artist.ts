import * as cheerio from 'cheerio';
import { CheerioAPI, Cheerio } from 'cheerio';
import { AnyNode } from 'domhandler';
import { ArtistInfo } from '../types';
import * as fetchUtils from '../utils/fetch';
import * as parseUtils from '../utils/parse';

export async function fetchArtistPage(id: string): Promise<string> {
  return fetchUtils.fetchInfoPage('artist', id);
}

export function parseArtistPage(htmlSource: string): ArtistInfo | null {
  const $ = cheerio.load(htmlSource);

  const $profile = $('#innermain');
  if ($profile.length === 0) {
    return null;
  }

  const artistInfo: ArtistInfo = {
    names: {},
    name: '',
    aliases: [],
  };

  // Parse artist name
  const $spans = $profile.children('span');
  if ($spans.length > 1) {
    const $nameSpan = $spans.eq(1);
    artistInfo.name = $nameSpan.text().trim();
    artistInfo.names = { en: artistInfo.name };
  }

  const $profileDiv = $profile.children('div').first();
  const $profileLeft = $profileDiv.children('div').first();
  const $profileRight = $profileDiv.children('div').eq(1);

  // Parse picture
  const $pictureLink = $profileLeft.find('div a').first();
  if ($pictureLink.length > 0) {
    const href = $pictureLink.attr('href');
    if (href) {
      artistInfo.picture_full = fetchUtils.forceAbsolute(href);
    }
    const $img = $pictureLink.find('img');
    if ($img.length > 0) {
      const src = $img.attr('src');
      if (src) {
        artistInfo.picture_small = fetchUtils.forceAbsolute(src);
      }
    }
  }

  // Parse profile info
  const profileInfo = parseProfileInfo($profileLeft, $);
  Object.assign(artistInfo, profileInfo);

  // Parse notes
  const $notesDiv = $profileRight.find('div').eq(1).find('div');
  if ($notesDiv.length > 0) {
    const notes = parseUtils.parseString($notesDiv[0], $).trim();
    if (notes.length > 0) {
      artistInfo.notes = notes;
    }
  }

  return artistInfo;
}

function parseProfileInfo(
  $profileLeft: Cheerio<AnyNode>,
  $: CheerioAPI
): Partial<ArtistInfo> {
  const info: Partial<ArtistInfo> = {};

  $profileLeft
    .children('div')
    .slice(1)
    .each((_i: number, div: AnyNode) => {
      const $div = $(div);
      const $b = $div.find('b').first();
      if ($b.length === 0) return;

      const itemName = $b.text().trim();

      if (itemName === 'Birthplace') {
        const text = $div.text().replace(itemName, '').trim();
        info.birth_place = text;
      } else if (itemName === 'Birthdate') {
        const text = $div.text().replace(itemName, '').trim();
        const parsed = parseUtils.parseDateTime(text);
        if (parsed) {
          info.birthdate = parsed;
        }
      } else if (itemName === 'Aliases') {
        const aliases: string[] = [];
        $div.find('a').each((_j: number, a: AnyNode) => {
          const alias = $(a).text().trim();
          if (alias) {
            aliases.push(alias);
          }
        });
        if (aliases.length > 0) {
          info.aliases = aliases;
        }
      }
    });

  return info;
}
