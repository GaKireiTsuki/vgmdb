const express = require('express');
const yaml = require('js-yaml');
const album = require('./parsers/album');
const artist = require('./parsers/artist');
const product = require('./parsers/product');
const search = require('./parsers/search');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  const headers = req.headers['access-control-request-headers'] || 'Origin, User-Agent, If-Modified-Since, Cache-Control';
  res.header('Access-Control-Allow-Headers', headers);
  next();
});

// Handle OPTIONS requests
app.options('*', (req, res) => {
  res.status(200).send('Of course, this API is free for everyone!');
});

// Helper function to determine output format
function getOutputFormat(req) {
  const format = req.query.format;
  if (format) {
    return format.toLowerCase();
  }
  
  const accept = req.headers.accept || '';
  if (accept.includes('application/json')) {
    return 'json';
  } else if (accept.includes('application/x-yaml') || accept.includes('text/yaml')) {
    return 'yaml';
  }
  
  return 'json'; // default
}

// Helper function to send response in appropriate format
function sendResponse(res, data, format) {
  if (format === 'yaml') {
    res.header('Content-Type', 'application/x-yaml');
    res.send(yaml.dump(data));
  } else {
    res.header('Content-Type', 'application/json');
    res.json(data);
  }
}

// Helper function to set cache headers
function setCacheHeaders(res, info) {
  const ttl = (info.meta && info.meta.ttl) || 86400; // 1 day default
  res.header('Cache-Control', `max-age=${ttl},public`);
  
  if (info.meta && info.meta.edited_date) {
    res.header('Last-Modified', new Date(info.meta.edited_date).toUTCString());
  }
}

// Routes
app.get('/hello', (req, res) => {
  res.send('Hello!');
});

app.get('/album/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const htmlSource = await album.fetchPage(id);
    const info = album.parsePage(htmlSource);
    
    if (!info) {
      return res.status(404).send('Album not found');
    }
    
    info.link = `album/${id}`;
    info.vgmdb_link = await album.fetchUrl(id);
    
    const format = getOutputFormat(req);
    setCacheHeaders(res, info);
    sendResponse(res, info, format);
  } catch (error) {
    console.error('Error fetching album:', error);
    res.status(503).send('vgmdb.net is temporarily unavailable');
  }
});

app.get('/artist/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const htmlSource = await artist.fetchPage(id);
    const info = artist.parsePage(htmlSource);
    
    if (!info) {
      return res.status(404).send('Artist not found');
    }
    
    info.link = `artist/${id}`;
    info.vgmdb_link = await artist.fetchUrl(id);
    
    const format = getOutputFormat(req);
    setCacheHeaders(res, info);
    sendResponse(res, info, format);
  } catch (error) {
    console.error('Error fetching artist:', error);
    res.status(503).send('vgmdb.net is temporarily unavailable');
  }
});

app.get('/product/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const htmlSource = await product.fetchPage(id);
    const info = product.parsePage(htmlSource);
    
    if (!info) {
      return res.status(404).send('Product not found');
    }
    
    info.link = `product/${id}`;
    info.vgmdb_link = await product.fetchUrl(id);
    
    const format = getOutputFormat(req);
    setCacheHeaders(res, info);
    sendResponse(res, info, format);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(503).send('vgmdb.net is temporarily unavailable');
  }
});

app.get('/search/:query?', async (req, res) => {
  try {
    const query = req.params.query || req.query.q || '';
    
    if (!query) {
      return res.status(400).send('Search query required');
    }
    
    const htmlSource = await search.fetchPage(query);
    const info = search.parsePage(htmlSource);
    
    info.query = query;
    info.link = `search/${encodeURIComponent(query)}`;
    info.vgmdb_link = await search.fetchUrl(query);
    
    const format = getOutputFormat(req);
    setCacheHeaders(res, info);
    sendResponse(res, info, format);
  } catch (error) {
    console.error('Error searching:', error);
    res.status(503).send('vgmdb.net is temporarily unavailable');
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'VGMdb API - Node.js Implementation',
    version: '1.0.0',
    description: 'A Node.js implementation of the VGMdb scraper API',
    endpoints: {
      album: '/album/:id - Get album information',
      artist: '/artist/:id - Get artist information',
      product: '/product/:id - Get product (game) information',
      search: '/search/:query or /search?q=query - Search across all categories'
    },
    formats: {
      json: 'Add ?format=json or set Accept: application/json (default)',
      yaml: 'Add ?format=yaml or set Accept: application/x-yaml'
    },
    examples: {
      album: `http://localhost:${PORT}/album/1`,
      artist: `http://localhost:${PORT}/artist/1`,
      product: `http://localhost:${PORT}/product/1`,
      search: `http://localhost:${PORT}/search/final%20fantasy`
    }
  });
});

app.listen(PORT, () => {
  console.log(`VGMdb API server running on port ${PORT}`);
  console.log(`Try: http://localhost:${PORT}/album/1`);
});

module.exports = app;
