# VGMdb API - Node.js Implementation

This is a Node.js implementation of the VGMdb API scraper, maintaining compatibility with the original Python version.

## Features

- Scrapes and parses VGMdb.net pages
- RESTful API endpoints for albums, artists, products, etc.
- Multiple output formats (JSON, YAML)
- CORS support
- Caching headers

## Installation

```bash
cd nodejs
npm install
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## API Usage

See [API.md](API.md) for complete API documentation.

### Get Album Information
```bash
# JSON format
curl http://localhost:3000/album/1

# YAML format
curl http://localhost:3000/album/1?format=yaml
```

### Get Artist Information
```bash
# JSON format
curl http://localhost:3000/artist/1

# YAML format
curl http://localhost:3000/artist/1?format=yaml
```

## Supported Endpoints

- `GET /album/:id` - Get album information
- `GET /artist/:id` - Get artist information
- `GET /` - API information

## Output Formats

The API supports multiple output formats:

1. **JSON** (default): Add `?format=json` or set `Accept: application/json` header
2. **YAML**: Add `?format=yaml` or set `Accept: application/x-yaml` header

## Testing

```bash
npm test
```

## Project Structure

```
nodejs/
├── index.js              # Main Express server
├── parsers/
│   ├── utils.js         # Utility functions
│   ├── album.js         # Album parser
│   └── artist.js        # Artist parser
└── tests/
    └── album.test.js    # Tests
```

## Implementation Notes

This Node.js implementation uses:
- **Express.js** for the web server (replaces Bottle from Python)
- **Cheerio** for HTML parsing (replaces BeautifulSoup from Python)
- **Axios** for HTTP requests
- **js-yaml** for YAML output
- **Jest** for testing

The API maintains compatibility with the original Python implementation's endpoints and response formats.

## Differences from Python Version

1. **Simplified caching**: The Node.js version doesn't include Redis/Memcached caching yet
2. **Basic parsers**: Currently implements album and artist parsers (more can be added)
3. **No RDF support**: The Node.js version focuses on JSON/YAML output
4. **No seller integration**: Seller lookup features are not yet implemented

## Future Enhancements

- [ ] Add more parsers (product, event, org, search, etc.)
- [ ] Implement caching layer (Redis)
- [ ] Add more comprehensive tests
- [ ] Add rate limiting
- [ ] Add documentation generation
- [ ] Add Docker support

## License

Same as the parent project.
