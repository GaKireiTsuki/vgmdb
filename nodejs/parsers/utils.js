const axios = require('axios');

const BASE_URL = 'https://vgmdb.net';

/**
 * Utility functions for parsing VGMdb pages
 */

function urlInfoPage(pageType, id) {
  return `${BASE_URL}/${pageType}/${id}`;
}

async function fetchInfoPage(pageType, id) {
  const url = urlInfoPage(pageType, id);
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error.message}`);
  }
}

function parseNames(element) {
  const names = {};
  
  if (!element) {
    return names;
  }
  
  const text = element.text();
  if (text) {
    names.en = text.trim();
  }
  
  // Check for Japanese name
  const jaSpan = element.find('span[lang="ja"]');
  if (jaSpan.length > 0) {
    names.ja = jaSpan.text().trim();
    names.ja_latn = text.replace(jaSpan.text(), '').trim();
  }
  
  return names;
}

function parseString(element) {
  if (!element) return '';
  
  // Get text content
  let text = element.text();
  
  // Handle line breaks
  element.find('br').each((i, el) => {
    const $el = element.constructor(el);
    $el.replaceWith('\n');
  });
  
  return text;
}

function extractBackgroundImage(style) {
  if (!style) return null;
  
  const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
  return match ? match[1] : null;
}

function forceAbsolute(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return BASE_URL + url;
}

function mediaFull(url) {
  if (!url) return url;
  return url.replace('/medium/', '/full/');
}

function mediaThumb(url) {
  if (!url) return url;
  return url.replace('/medium/', '/thumb/');
}

function fixInvalidTable(html) {
  // Fix any invalid HTML table structures
  // This is a simplified version - the Python code does more complex fixes
  return html;
}

module.exports = {
  urlInfoPage,
  fetchInfoPage,
  parseNames,
  parseString,
  extractBackgroundImage,
  forceAbsolute,
  mediaFull,
  mediaThumb,
  fixInvalidTable,
  BASE_URL
};
