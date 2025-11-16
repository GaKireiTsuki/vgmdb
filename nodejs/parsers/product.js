const cheerio = require('cheerio');
const utils = require('./utils');

async function fetchUrl(id) {
  return utils.urlInfoPage('product', id);
}

async function fetchPage(id) {
  return await utils.fetchInfoPage('product', id);
}

function parsePage(htmlSource) {
  const productInfo = {};
  
  htmlSource = utils.fixInvalidTable(htmlSource);
  const $ = cheerio.load(htmlSource);
  
  const soupProfile = $('#innermain');
  if (soupProfile.length === 0) {
    return null;
  }
  
  // Parse names
  const soupNames = soupProfile.find('h1').first();
  productInfo.names = utils.parseNames(soupNames);
  productInfo.name = productInfo.names.en;
  
  // Parse picture
  const soupCover = $('#coverart');
  if (soupCover.length > 0) {
    const style = soupCover.attr('style') || '';
    const mediumLink = utils.extractBackgroundImage(style);
    if (mediumLink) {
      const absoluteLink = utils.forceAbsolute(mediumLink);
      productInfo.picture_thumb = utils.mediaThumb(absoluteLink);
      productInfo.picture_small = absoluteLink;
      productInfo.picture_full = utils.mediaFull(absoluteLink);
    }
  }
  
  // Parse info table
  const infoTable = soupProfile.find('#rightfloat div div table').first();
  Object.assign(productInfo, parseProductInfo($, infoTable));
  
  // Parse related albums
  productInfo.albums = parseRelatedAlbums($, soupProfile);
  
  // Parse notes
  const notesHeader = findElementNamed($, soupProfile, 'h3', 'Notes');
  if (notesHeader) {
    const notesContainer = $(notesHeader).parent();
    const notesDiv = notesContainer.find('div div').first();
    if (notesDiv.length > 0) {
      productInfo.notes = utils.parseString(notesDiv).trim();
    }
  }
  
  return productInfo;
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

function parseProductInfo($, table) {
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
    
    if (name === 'Release Date') {
      info.release_date = valueCell.text().trim();
    } else if (name === 'Franchise') {
      info.franchise = valueCell.text().trim();
    } else if (name === 'Developer') {
      info.developer = valueCell.text().trim();
    } else if (name === 'Publisher') {
      info.publisher = valueCell.text().trim();
    } else if (name === 'Platform') {
      info.platforms = valueCell.text().split(',').map(p => p.trim());
    }
  });
  
  return info;
}

function parseRelatedAlbums($, container) {
  const albums = [];
  
  // Find albums section
  const albumsHeader = findElementNamed($, container, 'h3', 'Releases');
  if (!albumsHeader) {
    return albums;
  }
  
  const albumsContainer = $(albumsHeader).parent().parent();
  const albumLinks = albumsContainer.find('a[href*="/album/"]');
  
  albumLinks.each((i, link) => {
    const $link = $(link);
    const album = {
      name: $link.text().trim(),
      link: $link.attr('href').replace(/^\//, '')
    };
    
    // Try to get catalog number
    const catalogSpan = $link.parent().find('.catalog');
    if (catalogSpan.length > 0) {
      album.catalog = catalogSpan.text().trim();
    }
    
    albums.push(album);
  });
  
  return albums;
}

module.exports = {
  fetchUrl,
  fetchPage,
  parsePage
};
