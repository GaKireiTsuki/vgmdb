import express, { Request, Response, NextFunction } from 'express';
import * as yaml from 'js-yaml';
import { fetchAlbumPage, parseAlbumPage } from './parsers/album';
import { fetchArtistPage, parseArtistPage } from './parsers/artist';
import { fetchProductPage, parseProductPage } from './parsers/product';
import { fetchEventPage, parseEventPage } from './parsers/event';
import { fetchOrgPage, parseOrgPage } from './parsers/org';
import { fetchAlbumlistPage, parseAlbumlistPage } from './parsers/albumlist';

const app = express();
const PORT = process.env.PORT || 9990;

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  const headers = req.headers['access-control-request-headers'] || 
    'Origin, User-Agent, If-Modified-Since, Cache-Control';
  res.setHeader('Access-Control-Allow-Headers', headers);
  next();
});

// Handle OPTIONS requests
app.options('*', (req: Request, res: Response) => {
  res.status(200).send('Of course, this API is free for everyone!');
});

// Hello endpoint
app.get('/hello', (req: Request, res: Response) => {
  res.send('Hello from VGMdb TypeScript Node.js!');
});

// Album endpoint
app.get('/album/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const format = (req.query.format as string) || '';

    const html = await fetchAlbumPage(id);
    const albumInfo = parseAlbumPage(html);

    if (!albumInfo) {
      return res.status(404).json({ error: 'Album not found' });
    }

    // Set cache header
    res.setHeader('Cache-Control', 'max-age=86400,public');

    // Determine output format
    if (format === 'yaml' || req.accepts('yaml')) {
      res.setHeader('Content-Type', 'application/x-yaml');
      return res.send(yaml.dump(albumInfo));
    } else if (format === 'json' || format === '' || req.accepts('json')) {
      res.setHeader('Content-Type', 'application/json');
      return res.json(albumInfo);
    } else {
      // Default to JSON
      res.setHeader('Content-Type', 'application/json');
      return res.json(albumInfo);
    }
  } catch (error) {
    console.error('Error fetching album:', error);
    
    if (error instanceof Error && error.message.includes('503')) {
      return res.status(503).json({ error: 'vgmdb.net is temporarily unavailable' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Artist endpoint
app.get('/artist/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const format = (req.query.format as string) || '';

    const html = await fetchArtistPage(id);
    const artistInfo = parseArtistPage(html);

    if (!artistInfo) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Set cache header
    res.setHeader('Cache-Control', 'max-age=86400,public');

    // Determine output format
    if (format === 'yaml' || req.accepts('yaml')) {
      res.setHeader('Content-Type', 'application/x-yaml');
      return res.send(yaml.dump(artistInfo));
    } else if (format === 'json' || format === '' || req.accepts('json')) {
      res.setHeader('Content-Type', 'application/json');
      return res.json(artistInfo);
    } else {
      // Default to JSON
      res.setHeader('Content-Type', 'application/json');
      return res.json(artistInfo);
    }
  } catch (error) {
    console.error('Error fetching artist:', error);
    
    if (error instanceof Error && error.message.includes('503')) {
      return res.status(503).json({ error: 'vgmdb.net is temporarily unavailable' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Product endpoint
app.get('/product/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const format = (req.query.format as string) || '';

    const html = await fetchProductPage(id);
    const productInfo = parseProductPage(html);

    if (!productInfo) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Set cache header
    res.setHeader('Cache-Control', 'max-age=86400,public');

    // Determine output format
    if (format === 'yaml' || req.accepts('yaml')) {
      res.setHeader('Content-Type', 'application/x-yaml');
      return res.send(yaml.dump(productInfo));
    } else if (format === 'json' || format === '' || req.accepts('json')) {
      res.setHeader('Content-Type', 'application/json');
      return res.json(productInfo);
    } else {
      // Default to JSON
      res.setHeader('Content-Type', 'application/json');
      return res.json(productInfo);
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    
    if (error instanceof Error && error.message.includes('503')) {
      return res.status(503).json({ error: 'vgmdb.net is temporarily unavailable' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Event endpoint
app.get('/event/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const format = (req.query.format as string) || '';

    const html = await fetchEventPage(id);
    const eventInfo = parseEventPage(html);

    if (!eventInfo) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Set cache header
    res.setHeader('Cache-Control', 'max-age=86400,public');

    // Determine output format
    if (format === 'yaml' || req.accepts('yaml')) {
      res.setHeader('Content-Type', 'application/x-yaml');
      return res.send(yaml.dump(eventInfo));
    } else if (format === 'json' || format === '' || req.accepts('json')) {
      res.setHeader('Content-Type', 'application/json');
      return res.json(eventInfo);
    } else {
      // Default to JSON
      res.setHeader('Content-Type', 'application/json');
      return res.json(eventInfo);
    }
  } catch (error) {
    console.error('Error fetching event:', error);
    
    if (error instanceof Error && error.message.includes('503')) {
      return res.status(503).json({ error: 'vgmdb.net is temporarily unavailable' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Organization endpoint
app.get('/org/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const format = (req.query.format as string) || '';

    const html = await fetchOrgPage(id);
    const orgInfo = parseOrgPage(html);

    if (!orgInfo) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Set cache header
    res.setHeader('Cache-Control', 'max-age=86400,public');

    // Determine output format
    if (format === 'yaml' || req.accepts('yaml')) {
      res.setHeader('Content-Type', 'application/x-yaml');
      return res.send(yaml.dump(orgInfo));
    } else if (format === 'json' || format === '' || req.accepts('json')) {
      res.setHeader('Content-Type', 'application/json');
      return res.json(orgInfo);
    } else {
      // Default to JSON
      res.setHeader('Content-Type', 'application/json');
      return res.json(orgInfo);
    }
  } catch (error) {
    console.error('Error fetching organization:', error);
    
    if (error instanceof Error && error.message.includes('503')) {
      return res.status(503).json({ error: 'vgmdb.net is temporarily unavailable' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Albumlist endpoint
app.get('/albumlist/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const format = (req.query.format as string) || '';

    const html = await fetchAlbumlistPage(id);
    const albumlistInfo = parseAlbumlistPage(html);

    if (!albumlistInfo) {
      return res.status(404).json({ error: 'Album list not found' });
    }

    // Set cache header
    res.setHeader('Cache-Control', 'max-age=86400,public');

    // Determine output format
    if (format === 'yaml' || req.accepts('yaml')) {
      res.setHeader('Content-Type', 'application/x-yaml');
      return res.send(yaml.dump(albumlistInfo));
    } else if (format === 'json' || format === '' || req.accepts('json')) {
      res.setHeader('Content-Type', 'application/json');
      return res.json(albumlistInfo);
    } else {
      // Default to JSON
      res.setHeader('Content-Type', 'application/json');
      return res.json(albumlistInfo);
    }
  } catch (error) {
    console.error('Error fetching album list:', error);
    
    if (error instanceof Error && error.message.includes('503')) {
      return res.status(503).json({ error: 'vgmdb.net is temporarily unavailable' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`VGMdb API server listening on port ${PORT}`);
  console.log(`Try: http://localhost:${PORT}/hello`);
  console.log(`Try: http://localhost:${PORT}/album/79?format=json`);
  console.log(`Try: http://localhost:${PORT}/artist/137?format=json`);
  console.log(`Try: http://localhost:${PORT}/product/241?format=json`);
  console.log(`Try: http://localhost:${PORT}/event/138?format=json`);
  console.log(`Try: http://localhost:${PORT}/org/67?format=json`);
  console.log(`Try: http://localhost:${PORT}/albumlist/A1?format=json`);
});

export default app;
