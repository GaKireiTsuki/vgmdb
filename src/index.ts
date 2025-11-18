import express, { Request, Response, NextFunction } from 'express';
import * as yaml from 'js-yaml';
import { fetchAlbumPage, parseAlbumPage } from './parsers/album';
import { fetchArtistPage, parseArtistPage } from './parsers/artist';
import { fetchProductPage, parseProductPage } from './parsers/product';
import { fetchEventPage, parseEventPage } from './parsers/event';
import { fetchOrgPage, parseOrgPage } from './parsers/org';
import { fetchAlbumlistPage, parseAlbumlistPage } from './parsers/albumlist';
import { fetchArtistlistPage, parseArtistlistPage } from './parsers/artistlist';
import { fetchProductlistPage, parseProductlistPage } from './parsers/productlist';
import { fetchOrglistPage, parseOrglistPage } from './parsers/orglist';
import { fetchEventlistPage, parseEventlistPage } from './parsers/eventlist';
import { fetchReleasePage, parseReleasePage } from './parsers/release';

const app = express();
const PORT = process.env.PORT || 9990;
const DEFAULT_CORS_HEADERS = 'Origin, User-Agent, If-Modified-Since, Cache-Control';

// Helper function to send formatted response
function sendFormattedResponse(
  res: Response,
  data: unknown,
  format: string,
  req: Request
): void {
  res.setHeader('Cache-Control', 'max-age=86400,public');

  if (format === 'yaml' || req.accepts('yaml')) {
    res.setHeader('Content-Type', 'application/x-yaml');
    res.send(yaml.dump(data));
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.json(data);
  }
}

// Helper function to handle errors
function handleError(error: unknown, res: Response, context: string): void {
  console.error(`Error ${context}:`, error);

  if (error instanceof Error && error.message.includes('503')) {
    res.status(503).json({ error: 'vgmdb.net is temporarily unavailable' });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  const headers = req.headers['access-control-request-headers'] || DEFAULT_CORS_HEADERS;
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

    sendFormattedResponse(res, albumInfo, format, req);
  } catch (error) {
    handleError(error, res, 'fetching album');
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

    sendFormattedResponse(res, artistInfo, format, req);
  } catch (error) {
    handleError(error, res, 'fetching artist');
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

    sendFormattedResponse(res, productInfo, format, req);
  } catch (error) {
    handleError(error, res, 'fetching product');
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

    sendFormattedResponse(res, eventInfo, format, req);
  } catch (error) {
    handleError(error, res, 'fetching event');
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

    sendFormattedResponse(res, orgInfo, format, req);
  } catch (error) {
    handleError(error, res, 'fetching organization');
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

    sendFormattedResponse(res, albumlistInfo, format, req);
  } catch (error) {
    handleError(error, res, 'fetching album list');
  }
});

// Artistlist endpoint
app.get('/artistlist/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const format = (req.query.format as string) || '';

    const html = await fetchArtistlistPage(id);
    const artistlistInfo = parseArtistlistPage(html);

    if (!artistlistInfo) {
      return res.status(404).json({ error: 'Artist list not found' });
    }

    sendFormattedResponse(res, artistlistInfo, format, req);
  } catch (error) {
    handleError(error, res, 'fetching artist list');
  }
});

// Productlist endpoint
app.get('/productlist/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const format = (req.query.format as string) || '';

    const html = await fetchProductlistPage(id);
    const productlistInfo = parseProductlistPage(html);

    if (!productlistInfo) {
      return res.status(404).json({ error: 'Product list not found' });
    }

    sendFormattedResponse(res, productlistInfo, format, req);
  } catch (error) {
    handleError(error, res, 'fetching product list');
  }
});

// Orglist endpoint
app.get('/orglist', async (req: Request, res: Response) => {
  try {
    const format = (req.query.format as string) || '';

    const html = await fetchOrglistPage();
    const orglistInfo = parseOrglistPage(html);

    if (!orglistInfo) {
      return res.status(404).json({ error: 'Organization list not found' });
    }

    sendFormattedResponse(res, orglistInfo, format, req);
  } catch (error) {
    handleError(error, res, 'fetching organization list');
  }
});

// Eventlist endpoint
app.get('/eventlist', async (req: Request, res: Response) => {
  try {
    const format = (req.query.format as string) || '';

    const html = await fetchEventlistPage();
    const eventlistInfo = parseEventlistPage(html);

    if (!eventlistInfo) {
      return res.status(404).json({ error: 'Event list not found' });
    }

    sendFormattedResponse(res, eventlistInfo, format, req);
  } catch (error) {
    handleError(error, res, 'fetching event list');
  }
});

// Release endpoint
app.get('/release/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const format = (req.query.format as string) || '';

    const html = await fetchReleasePage(id);
    const releaseInfo = parseReleasePage(html);

    if (!releaseInfo) {
      return res.status(404).json({ error: 'Release not found' });
    }

    sendFormattedResponse(res, releaseInfo, format, req);
  } catch (error) {
    handleError(error, res, 'fetching release');
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
  console.log(`Try: http://localhost:${PORT}/artistlist/A1?format=json`);
  console.log(`Try: http://localhost:${PORT}/productlist/A1?format=json`);
  console.log(`Try: http://localhost:${PORT}/orglist?format=json`);
  console.log(`Try: http://localhost:${PORT}/eventlist?format=json`);
  console.log(`Try: http://localhost:${PORT}/release/1234?format=json`);
});

export default app;
