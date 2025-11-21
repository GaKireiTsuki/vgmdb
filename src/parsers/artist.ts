import * as cheerio from 'cheerio';
import { Cheerio, CheerioAPI } from 'cheerio';
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

  // Parse artist name and type
  const $spans = $profile.children('span');
  if ($spans.length > 1) {
    const $nameSpan = $spans.eq(1);
    artistInfo.name = $nameSpan.text().trim();
    artistInfo.names = { en: artistInfo.name };
  }

  // Parse artist type and alias
  artistInfo.type = 'Individual';
  if ($spans.length > 2) {
    const $typeSpan = $spans.eq(2);
    const classes = $typeSpan.attr('class') || '';
    if (classes.includes('time')) {
      const artistType = parseUtils.parseString($typeSpan[0], $);
      if (artistType.includes('Alias')) {
        artistInfo.type = 'Alias';
        if (artistType.includes('of')) {
          const aliasInfo: { names: Record<string, string>; link?: string } = {
            names: {},
          };
          const $aliasLink = $typeSpan.find('a');
          if ($aliasLink.length > 0) {
            aliasInfo.link = fetchUtils.trimAbsolute(
              $aliasLink.attr('href') || ''
            );
            aliasInfo.names = parseUtils.parseNames($aliasLink[0], $);
          } else {
            const leftIndex = artistType.indexOf('of');
            if (leftIndex > 0) {
              const name = artistType.substring(
                leftIndex + 3,
                artistType.length - 1
              );
              aliasInfo.names = { en: name };
            }
          }
          artistInfo.alias_of = aliasInfo;
        }
      } else {
        let type = artistType;
        if (type.startsWith('(')) type = type.substring(1);
        if (type.endsWith(')')) type = type.substring(0, type.length - 1);
        artistInfo.type = type;
      }
    }

    // Check for deceased
    const typeText = $typeSpan.text();
    if (typeText && typeText.includes('deceased')) {
      const deathDate = parseUtils.parseDateTime(typeText.substring(10));
      if (deathDate) {
        artistInfo.deathdate = deathDate;
      }
    }
  }

  const $profileDiv = $profile.children('div').first();
  const $profileLeft = $profileDiv.children('div').first();
  const $profileRight = $profileDiv.children('div').eq(1);
  const $rightColumn = $('#rightcolumn');

  // Determine sex from icon
  const $sexImg = $profileLeft.find('img').first();
  if ($sexImg.length > 0) {
    const src = $sexImg.attr('src');
    if (src === '/db/icons/male.png') {
      artistInfo.sex = 'male';
    } else if (src === '/db/icons/female.png') {
      artistInfo.sex = 'female';
    }
  }

  // Parse Japanese name
  const $japanName = $profileLeft.children('span').first();
  if ($japanName.length > 0) {
    const japanNameText = $japanName.text().trim();
    Object.assign(artistInfo, parseUtils.parseFullName(japanNameText));
  }

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

  // Parse discography
  const $discoContainer = $profileRight.find('#albumlist');
  const $discoTable = $discoContainer.find('#discotable table');
  if ($discoTable.length > 0) {
    artistInfo.discography = parseUtils.parseDiscography($discoTable, $);
  } else {
    artistInfo.discography = [];
  }

  const $featuredTable = $discoContainer.find('#featuredtable table');
  if ($featuredTable.length > 0) {
    artistInfo.featured_on = parseUtils.parseDiscography($featuredTable, $);
  } else {
    artistInfo.featured_on = [];
  }

  // Parse right column (websites, meta)
  const $rightDivs = $rightColumn.children('div');
  if ($rightDivs.length > 0) {
    const $firstDiv = $rightDivs.eq(0);
    const $h3 = $firstDiv.find('div h3').first();
    if ($h3.length > 0 && $h3.text() === 'Websites') {
      const $websitesDiv = $rightDivs.eq(1).find('div').first();
      if ($websitesDiv.length > 0) {
        artistInfo.websites = parseUtils.parseWebsites($websitesDiv, $);
      }
    } else {
      artistInfo.websites = {};
    }

    // Meta is always last
    const $metaDiv = $rightDivs.last().find('div').first();
    if ($metaDiv.length > 0) {
      artistInfo.meta = parseUtils.parseMeta($metaDiv, $);
    }
  }

  // Extract Twitter handles
  const twitters: string[] = [];
  $rightColumn.find('a').each((_i: number, a: AnyNode) => {
    const $a = $(a);
    if ($a.text() === 'Twitter') {
      const href = $a.attr('href') || '';
      const index = href.indexOf('twitter.com');
      if (index > -1) {
        const slashIndex = href.indexOf('/', index);
        if (slashIndex > -1) {
          twitters.push(href.substring(slashIndex + 1));
        }
      }
    }
  });
  if (twitters.length > 0) {
    artistInfo.twitter_names = twitters;
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
