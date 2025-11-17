# VGMdb TypeScript Node.js Implementation

This directory contains a TypeScript Node.js implementation of the VGMdb API, which provides programmatic access to video game music information from VGMdb.net.

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

### Development

Run the development server with hot reload:

```bash
npm run dev
```

### Production

Build and start the production server:

```bash
npm run build
npm start
```

The server will start on port 9990 by default. You can override this with the `PORT` environment variable:

```bash
PORT=3000 npm start
```

## API Endpoints

### Health Check

```
GET /hello
```

Returns a simple hello message to verify the server is running.

### Album Information

```
GET /album/:id
```

Retrieve information about a specific album.

**Parameters:**
- `id` - The album ID from VGMdb.net

**Query Parameters:**
- `format` - Output format: `json` (default) or `yaml`

**Example:**
```bash
curl http://localhost:9990/album/79
curl http://localhost:9990/album/79?format=yaml
```

**Response:**
```json
{
  "names": {
    "en": "Final Fantasy VIII Original Soundtrack",
    "ja": "ファイナルファンタジーVIII オリジナル・サウンドトラック"
  },
  "name": "Final Fantasy VIII Original Soundtrack",
  "catalog": "SQEX-10001~4",
  "release_date": "1999-02-10",
  "picture_thumb": "https://...",
  "picture_small": "https://...",
  "picture_full": "https://...",
  "discs": [...],
  "composers": [...],
  "arrangers": [...],
  "performers": [...],
  "organizations": [...]
}
```

### Artist Information

```
GET /artist/:id
```

Retrieve information about a specific artist.

**Parameters:**
- `id` - The artist ID from VGMdb.net

**Query Parameters:**
- `format` - Output format: `json` (default) or `yaml`

**Example:**
```bash
curl http://localhost:9990/artist/137
curl http://localhost:9990/artist/137?format=yaml
```

**Response:**
```json
{
  "names": {
    "en": "Nobuo Uematsu"
  },
  "name": "Nobuo Uematsu",
  "picture_small": "https://...",
  "picture_full": "https://...",
  "birth_place": "...",
  "birthdate": "...",
  "aliases": [...],
  "notes": "..."
}
```

## Project Structure

```
src/
├── index.ts          # Express server entry point
├── parsers/          # HTML parsers for different page types
│   └── album.ts      # Album page parser
├── types/            # TypeScript type definitions
│   └── index.ts      # Common types
└── utils/            # Utility functions
    ├── fetch.ts      # HTTP fetching and URL utilities
    └── parse.ts      # HTML parsing utilities
```

## Development

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

### Testing

```bash
npm test
```

## Features

- ✅ Album information parsing
- ✅ Artist information parsing
- ✅ Product information parsing
- ✅ Event information parsing
- ✅ Organization information parsing
- ✅ Album list parsing
- ✅ JSON and YAML output formats
- ✅ CORS support for cross-origin requests
- ✅ TypeScript for type safety
- ✅ Caching headers
- ⏳ Artist list parsing (planned)
- ⏳ Product list parsing (planned)
- ⏳ Organization list parsing (planned)
- ⏳ Event list parsing (planned)
- ⏳ Search functionality (planned)
- ⏳ Recent updates (planned)
- ⏳ Redis caching (planned)

## Comparison with Python Implementation

This TypeScript implementation aims to provide feature parity with the original Python implementation while leveraging the Node.js ecosystem and TypeScript's type safety.

### Current Implementation Status

- Core album parsing: ✅ Implemented
- Core artist parsing: ✅ Implemented
- Core product parsing: ✅ Implemented
- Core event parsing: ✅ Implemented
- Core organization parsing: ✅ Implemented
- Album list parsing: ✅ Implemented
- Express.js API server: ✅ Implemented
- Output formats (JSON, YAML): ✅ Implemented
- CORS support: ✅ Implemented
- Other list parsers (artistlist, productlist, etc.): ⏳ Not yet implemented
- Search functionality: ⏳ Not yet implemented
- Recent updates: ⏳ Not yet implemented
- Caching with Redis: ⏳ Not yet implemented
- RDF output: ⏳ Not yet implemented

## License

Same as the main project.
