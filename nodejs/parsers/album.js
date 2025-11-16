const cheerio = require('cheerio');
const utils = require('./utils');

async function fetchUrl(id) {
  return utils.urlInfoPage('album', id);
}

async function fetchPage(id) {
  return await utils.fetchInfoPage('album', id);
}

function parsePage(htmlSource) {
  const albumInfo = {};
  
  htmlSource = utils.fixInvalidTable(htmlSource);
  const $ = cheerio.load(htmlSource);
  
  const soupProfile = $('#innermain');
  const soupRightColumn = $('#rightcolumn');
  
  if (soupProfile.length === 0) {
    return null; // info not found
  }
  
  // Parse names
  const soupNames = soupProfile.find('h1').first();
  albumInfo.names = utils.parseNames(soupNames);
  albumInfo.name = albumInfo.names.en;
  
  // Main cover
  const soupCover = $('#coverart');
  if (soupCover.length > 0) {
    const style = soupCover.attr('style') || '';
    const mediumLink = utils.extractBackgroundImage(style);
    if (mediumLink) {
      const absoluteLink = utils.forceAbsolute(mediumLink);
      albumInfo.picture_thumb = utils.mediaThumb(absoluteLink);
      albumInfo.picture_small = absoluteLink;
      albumInfo.picture_full = utils.mediaFull(absoluteLink);
    }
  }
  
  // Main info header
  const soupInfo = soupProfile.find('#rightfloat div div table').first();
  Object.assign(albumInfo, parseAlbumInfo($, soupInfo));
  
  // Track list
  const tracklistHeader = findElementNamed($, soupProfile, 'h3', 'Tracklist');
  if (tracklistHeader) {
    const soupTracklist = $(tracklistHeader).parent().parent();
    albumInfo.discs = parseTracklist($, soupTracklist);
  }
  
  // Notes
  const notesHeader = findElementNamed($, soupProfile, 'h3', 'Notes');
  if (notesHeader) {
    const notesContainer = $(notesHeader).parent();
    const notesDiv = notesContainer.find('div div').first();
    albumInfo.notes = utils.parseString(notesDiv).trim();
  }
  
  // Add any required properties
  const requiredLists = ['arrangers', 'composers', 'covers', 'lyricists', 'organizations', 'performers'];
  for (const key of requiredLists) {
    if (!(key in albumInfo)) {
      albumInfo[key] = [];
    }
  }
  
  return albumInfo;
}

function findElementNamed($, container, tagName, name) {
  let found = null;
  container.find(tagName).each((i, el) => {
    const text = $(el).text().trim();
    if (text === name) {
      found = el;
      return false; // break
    }
  });
  return found;
}

function parseAlbumInfo($, soupInfo) {
  const albumInfo = {};
  
  if (!soupInfo || soupInfo.length === 0) {
    return albumInfo;
  }
  
  // Check for bootleg
  const classAttr = soupInfo.attr('class');
  if (classAttr && classAttr.includes('bootleg')) {
    albumInfo.bootleg = true;
  }
  
  const tbody = soupInfo.find('tbody').length > 0 ? soupInfo.find('tbody') : soupInfo;
  const rows = tbody.find('> tr');
  
  rows.each((i, row) => {
    const $row = $(row);
    const td = $row.find('td').first();
    if (td.length === 0) return;
    
    const nameElem = td.find('b');
    if (nameElem.length === 0) return;
    
    const name = utils.parseNames(nameElem).en;
    const valueCell = td.next('td');
    
    // Parse different field types
    if (name === 'Catalog Number') {
      albumInfo.catalog = valueCell.text().trim();
    } else if (name === 'Release Date') {
      albumInfo.release_date = valueCell.text().trim();
    } else if (name === 'Classification') {
      albumInfo.classification = valueCell.text().trim();
    } else if (name === 'Publisher') {
      albumInfo.publisher = parseLinkInfo($, valueCell);
    } else if (name === 'Media Format') {
      albumInfo.media_format = valueCell.text().trim();
    }
  });
  
  return albumInfo;
}

function parseTracklist($, container) {
  const discs = [];
  
  // Find all disc divs
  container.find('.smallfont').each((i, elem) => {
    const $elem = $(elem);
    const disc = {
      name: '',
      tracks: []
    };
    
    // Parse disc name
    const discName = $elem.find('span b').first();
    if (discName.length > 0) {
      disc.name = discName.text().trim();
    }
    
    // Parse tracks
    const trackTable = $elem.find('table');
    if (trackTable.length > 0) {
      trackTable.find('tr').each((j, row) => {
        const $row = $(row);
        const cells = $row.find('td');
        
        if (cells.length >= 2) {
          const track = {
            track_number: cells.eq(0).text().trim(),
            name: {}
          };
          
          const nameCell = cells.eq(1);
          track.name.en = nameCell.text().trim();
          
          // Check for Japanese name
          const jaSpan = nameCell.find('span[lang="ja"]');
          if (jaSpan.length > 0) {
            track.name.ja = jaSpan.text().trim();
          }
          
          // Parse track length if available
          if (cells.length >= 3) {
            track.track_length = cells.eq(2).text().trim();
          }
          
          disc.tracks.push(track);
        }
      });
    }
    
    discs.push(disc);
  });
  
  return discs;
}

function parseLinkInfo($, element) {
  const info = {
    name: element.text().trim()
  };
  
  const link = element.find('a');
  if (link.length > 0) {
    const href = link.attr('href');
    if (href) {
      info.link = href.replace(/^\//, '');
    }
  }
  
  return info;
}

module.exports = {
  fetchUrl,
  fetchPage,
  parsePage
};
