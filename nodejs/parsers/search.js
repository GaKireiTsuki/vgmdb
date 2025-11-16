const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://vgmdb.net';

async function fetchUrl(query) {
  return `${BASE_URL}/search?q=${encodeURIComponent(query)}`;
}

async function fetchPage(query) {
  const url = await fetchUrl(query);
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch search: ${error.message}`);
  }
}

function parsePage(htmlSource) {
  const searchInfo = {
    query: '',
    sections: {
      albums: [],
      artists: [],
      orgs: [],
      products: []
    }
  };
  
  const $ = cheerio.load(htmlSource);
  
  // Parse search results sections
  $('#innermain').find('h3').each((i, header) => {
    const $header = $(header);
    const sectionTitle = $header.text().trim().toLowerCase();
    
    let section = null;
    if (sectionTitle.includes('album')) {
      section = 'albums';
    } else if (sectionTitle.includes('artist')) {
      section = 'artists';
    } else if (sectionTitle.includes('org')) {
      section = 'orgs';
    } else if (sectionTitle.includes('product')) {
      section = 'products';
    }
    
    if (section) {
      const table = $header.parent().find('table').first();
      if (table.length > 0) {
        searchInfo.sections[section] = parseSearchResults($, table, section);
      }
    }
  });
  
  return searchInfo;
}

function parseSearchResults($, table, type) {
  const results = [];
  
  table.find('tr').each((i, row) => {
    const $row = $(row);
    const link = $row.find('a').first();
    
    if (link.length > 0) {
      const result = {
        name: link.text().trim(),
        link: link.attr('href').replace(/^\//, '')
      };
      
      // Add type-specific information
      if (type === 'albums') {
        const catalogCell = $row.find('td.catalog');
        if (catalogCell.length > 0) {
          result.catalog = catalogCell.text().trim();
        }
      }
      
      results.push(result);
    }
  });
  
  return results;
}

module.exports = {
  fetchUrl,
  fetchPage,
  parsePage
};
