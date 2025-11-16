# VGMdb API Documentation

## Overview

The VGMdb API provides programmatic access to information from VGMdb.net, a comprehensive database of video game music. This Node.js implementation offers RESTful endpoints to fetch and parse information about albums, artists, products (games), and search capabilities.

## Base URL

```
http://localhost:3000
```

(Replace with your actual deployment URL)

## Authentication

No authentication is required. The API is free and open for everyone.

## Output Formats

The API supports multiple output formats:

### JSON (Default)
```bash
GET /album/1
GET /album/1?format=json
```

Or use the Accept header:
```bash
curl -H "Accept: application/json" http://localhost:3000/album/1
```

### YAML
```bash
GET /album/1?format=yaml
```

Or use the Accept header:
```bash
curl -H "Accept: application/x-yaml" http://localhost:3000/album/1
```

## Endpoints

### 1. Get Album Information

**Endpoint:** `GET /album/:id`

Retrieves detailed information about a specific album.

**Parameters:**
- `id` (path parameter, required): Album ID from VGMdb

**Query Parameters:**
- `format` (optional): Output format (`json` or `yaml`)

**Response:**
```json
{
  "name": "Album Name",
  "names": {
    "en": "Album Name",
    "ja": "アルバム名",
    "ja_latn": "Album Name"
  },
  "catalog": "ABCD-1234",
  "release_date": "Jan 21, 2005",
  "classification": "Game",
  "media_format": "CD",
  "publisher": {
    "name": "Publisher Name",
    "link": "org/123"
  },
  "picture_thumb": "https://vgmdb.net/images/thumb/...",
  "picture_small": "https://vgmdb.net/images/medium/...",
  "picture_full": "https://vgmdb.net/images/full/...",
  "discs": [
    {
      "name": "Disc 1",
      "tracks": [
        {
          "track_number": "1",
          "name": {
            "en": "Track Name",
            "ja": "トラック名"
          },
          "track_length": "4:30"
        }
      ]
    }
  ],
  "notes": "Album notes and description",
  "arrangers": [],
  "composers": [],
  "covers": [],
  "lyricists": [],
  "organizations": [],
  "performers": [],
  "link": "album/1",
  "vgmdb_link": "https://vgmdb.net/album/1"
}
```

**Example:**
```bash
curl http://localhost:3000/album/1
```

### 2. Get Artist Information

**Endpoint:** `GET /artist/:id`

Retrieves detailed information about a specific artist.

**Parameters:**
- `id` (path parameter, required): Artist ID from VGMdb

**Query Parameters:**
- `format` (optional): Output format (`json` or `yaml`)

**Response:**
```json
{
  "name": "Artist Name",
  "names": {
    "en": "Artist Name",
    "ja": "アーティスト名",
    "ja_latn": "Artist Name"
  },
  "birthdate": "Jan 1, 1980",
  "birthplace": "Tokyo, Japan",
  "website": {
    "name": "Official Website",
    "link": "https://example.com"
  },
  "picture_thumb": "https://vgmdb.net/images/thumb/...",
  "picture_small": "https://vgmdb.net/images/medium/...",
  "picture_full": "https://vgmdb.net/images/full/...",
  "discography": [
    {
      "type": "Composer",
      "albums": [
        {
          "name": "Album Name",
          "link": "album/123",
          "date": "2005"
        }
      ]
    }
  ],
  "notes": "Artist biography and notes",
  "link": "artist/1",
  "vgmdb_link": "https://vgmdb.net/artist/1"
}
```

**Example:**
```bash
curl http://localhost:3000/artist/1
```

### 3. Get Product (Game) Information

**Endpoint:** `GET /product/:id`

Retrieves detailed information about a specific product (video game).

**Parameters:**
- `id` (path parameter, required): Product ID from VGMdb

**Query Parameters:**
- `format` (optional): Output format (`json` or `yaml`)

**Response:**
```json
{
  "name": "Game Name",
  "names": {
    "en": "Game Name",
    "ja": "ゲーム名",
    "ja_latn": "Game Name"
  },
  "release_date": "Jan 1, 2005",
  "franchise": "Game Series",
  "developer": "Developer Name",
  "publisher": "Publisher Name",
  "platforms": ["PlayStation 2", "Xbox"],
  "picture_thumb": "https://vgmdb.net/images/thumb/...",
  "picture_small": "https://vgmdb.net/images/medium/...",
  "picture_full": "https://vgmdb.net/images/full/...",
  "albums": [
    {
      "name": "Soundtrack Album",
      "link": "album/123",
      "catalog": "ABCD-1234"
    }
  ],
  "notes": "Product description and notes",
  "link": "product/1",
  "vgmdb_link": "https://vgmdb.net/product/1"
}
```

**Example:**
```bash
curl http://localhost:3000/product/1
```

### 4. Search

**Endpoint:** `GET /search/:query` or `GET /search?q=query`

Searches across all categories (albums, artists, organizations, products).

**Parameters:**
- `query` (path parameter or query parameter, required): Search query string

**Query Parameters:**
- `q` (optional): Alternative way to provide search query
- `format` (optional): Output format (`json` or `yaml`)

**Response:**
```json
{
  "query": "final fantasy",
  "sections": {
    "albums": [
      {
        "name": "Album Name",
        "link": "album/123",
        "catalog": "SQEX-12345"
      }
    ],
    "artists": [
      {
        "name": "Artist Name",
        "link": "artist/456"
      }
    ],
    "orgs": [
      {
        "name": "Organization Name",
        "link": "org/789"
      }
    ],
    "products": [
      {
        "name": "Product Name",
        "link": "product/101"
      }
    ]
  },
  "link": "search/final%20fantasy",
  "vgmdb_link": "https://vgmdb.net/search?q=final%20fantasy"
}
```

**Examples:**
```bash
curl http://localhost:3000/search/final%20fantasy
curl "http://localhost:3000/search?q=final%20fantasy"
```

### 5. API Information

**Endpoint:** `GET /`

Returns information about the API, available endpoints, and examples.

**Response:**
```json
{
  "message": "VGMdb API - Node.js Implementation",
  "version": "1.0.0",
  "description": "A Node.js implementation of the VGMdb scraper API",
  "endpoints": {
    "album": "/album/:id - Get album information",
    "artist": "/artist/:id - Get artist information",
    "product": "/product/:id - Get product (game) information",
    "search": "/search/:query or /search?q=query - Search across all categories"
  },
  "formats": {
    "json": "Add ?format=json or set Accept: application/json (default)",
    "yaml": "Add ?format=yaml or set Accept: application/x-yaml"
  },
  "examples": {
    "album": "http://localhost:3000/album/1",
    "artist": "http://localhost:3000/artist/1",
    "product": "http://localhost:3000/product/1",
    "search": "http://localhost:3000/search/final%20fantasy"
  }
}
```

**Example:**
```bash
curl http://localhost:3000/
```

## CORS Support

The API includes CORS (Cross-Origin Resource Sharing) support, allowing requests from any origin. The following headers are set:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: Origin, User-Agent, If-Modified-Since, Cache-Control
```

## Caching

The API sets appropriate caching headers based on the content:

- `Cache-Control`: Set based on content age (newer content has shorter TTL)
- `Last-Modified`: Set based on when the content was last edited on VGMdb

## Error Responses

### 404 Not Found
Returned when the requested resource doesn't exist on VGMdb.

```json
{
  "error": "Album not found"
}
```

### 503 Service Unavailable
Returned when VGMdb.net is temporarily unavailable.

```json
{
  "error": "vgmdb.net is temporarily unavailable"
}
```

### 400 Bad Request
Returned when required parameters are missing.

```json
{
  "error": "Search query required"
}
```

## Rate Limiting

Currently, there is no rate limiting implemented. However, please be respectful of VGMdb.net's servers and avoid making excessive requests.

## Best Practices

1. **Cache responses**: Implement client-side caching to reduce load on the API
2. **Respect TTL**: Honor the `Cache-Control` headers in responses
3. **Handle errors gracefully**: Implement proper error handling for 4xx and 5xx responses
4. **Use appropriate timeouts**: Set reasonable timeouts for your HTTP client

## Code Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

async function getAlbum(id) {
  try {
    const response = await axios.get(`http://localhost:3000/album/${id}`);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getAlbum(1);
```

### Python
```python
import requests

def get_album(album_id):
    try:
        response = requests.get(f'http://localhost:3000/album/{album_id}')
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'Error: {e}')

album = get_album(1)
print(album)
```

### cURL
```bash
# Get album in JSON format
curl http://localhost:3000/album/1

# Get album in YAML format
curl http://localhost:3000/album/1?format=yaml

# Search for albums
curl "http://localhost:3000/search?q=chrono+trigger"

# Get artist information
curl http://localhost:3000/artist/137
```

## Deployment

### Docker
```bash
docker build -t vgmdb-nodejs .
docker run -p 3000:3000 vgmdb-nodejs
```

### Environment Variables
- `PORT`: Port to run the server on (default: 3000)
- `NODE_ENV`: Environment (development/production)

## Support and Contributing

For issues, feature requests, or contributions, please visit the GitHub repository.

## License

Same as the parent project.
