const cheerio = require('cheerio');
const utils = require('./utils');

async function fetchUrl(id) {
  return utils.urlInfoPage('artist', id);
}

async function fetchPage(id) {
  return await utils.fetchInfoPage('artist', id);
}

function parsePage(htmlSource) {
  const artistInfo = {};
  
  htmlSource = utils.fixInvalidTable(htmlSource);
  const $ = cheerio.load(htmlSource);
  
  const soupProfile = $('#innermain');
  if (soupProfile.length === 0) {
    return null;
  }
  
  // Parse names
  const soupNames = soupProfile.find('h1').first();
  artistInfo.names = utils.parseNames(soupNames);
  artistInfo.name = artistInfo.names.en;
  
  // Parse picture
  const soupCover = $('#coverart');
  if (soupCover.length > 0) {
    const style = soupCover.attr('style') || '';
    const mediumLink = utils.extractBackgroundImage(style);
    if (mediumLink) {
      const absoluteLink = utils.forceAbsolute(mediumLink);
      artistInfo.picture_thumb = utils.mediaThumb(absoluteLink);
      artistInfo.picture_small = absoluteLink;
      artistInfo.picture_full = utils.mediaFull(absoluteLink);
    }
  }
  
  // Parse info table
  const infoTable = soupProfile.find('#rightfloat div div table').first();
  Object.assign(artistInfo, parseArtistInfo($, infoTable));
  
  // Parse discography sections
  artistInfo.discography = parseDiscography($, soupProfile);
  
  // Parse notes
  const notesHeader = findElementNamed($, soupProfile, 'h3', 'Notes');
  if (notesHeader) {
    const notesContainer = $(notesHeader).parent();
    const notesDiv = notesContainer.find('div div').first();
    if (notesDiv.length > 0) {
      artistInfo.notes = utils.parseString(notesDiv).trim();
    }
  }
  
  return artistInfo;
}

function findElementNamed($, container, tagName, name) {
  let found = null;
  container.find(tagName).each((i, el) => {
    const text = $(el).text().trim();
    if (text === name) {
      found = el;
      return false;
    }
  });
  return found;
}

function parseArtistInfo($, table) {
  const info = {};
  
  if (!table || table.length === 0) {
    return info;
  }
  
  const tbody = table.find('tbody').length > 0 ? table.find('tbody') : table;
  const rows = tbody.find('> tr');
  
  rows.each((i, row) => {
    const $row = $(row);
    const td = $row.find('td').first();
    if (td.length === 0) return;
    
    const nameElem = td.find('b');
    if (nameElem.length === 0) return;
    
    const name = nameElem.text().trim();
    const valueCell = td.next('td');
    
    if (name === 'Birthdate') {
      info.birthdate = valueCell.text().trim();
    } else if (name === 'Birthplace') {
      info.birthplace = valueCell.text().trim();
    } else if (name === 'Website') {
      const link = valueCell.find('a');
      if (link.length > 0) {
        info.website = {
          name: link.text().trim(),
          link: link.attr('href')
        };
      }
    }
  });
  
  return info;
}

function parseDiscography($, container) {
  const discography = [];
  
  // Find discography sections
  container.find('h3').each((i, header) => {
    const $header = $(header);
    const headerText = $header.text().trim();
    
    // Skip non-discography headers
    if (headerText === 'Notes' || headerText === 'Biography') {
      return;
    }
    
    const section = {
      type: headerText,
      albums: []
    };
    
    // Find the table following this header
    const table = $header.parent().parent().find('table').first();
    if (table.length > 0) {
      table.find('tr').each((j, row) => {
        const $row = $(row);
        const link = $row.find('a[href*="/album/"]');
        
        if (link.length > 0) {
          const album = {
            name: link.text().trim(),
            link: link.attr('href').replace(/^\//, '')
          };
          
          // Try to get date
          const dateCell = $row.find('td').first();
          if (dateCell.length > 0) {
            album.date = dateCell.text().trim();
          }
          
          section.albums.push(album);
        }
      });
    }
    
    if (section.albums.length > 0) {
      discography.push(section);
    }
  });
  
  return discography;
}

module.exports = {
  fetchUrl,
  fetchPage,
  parsePage
};
