# Getting Started with VGMdb TypeScript Node.js

This guide will help you get started with the VGMdb TypeScript Node.js implementation.

## Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

## Installation

1. Clone the repository:
```bash
git clone https://github.com/GaKireiTsuki/vgmdb.git
cd vgmdb
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Running the Server

### Development Mode

For development with hot reload:
```bash
npm run dev
```

### Production Mode

Build and run:
```bash
npm run build
npm start
```

The server will start on port 9990 by default.

## Testing the API

Once the server is running, you can test it with curl:

```bash
# Health check
curl http://localhost:9990/hello

# Get album information (JSON)
curl http://localhost:9990/album/79

# Get album information (YAML)
curl http://localhost:9990/album/79?format=yaml

# Get artist information
curl http://localhost:9990/artist/137
```

## Using with Docker

Build the Docker image:
```bash
docker build -f Dockerfile.node -t vgmdb-node .
```

Run the container:
```bash
docker run -p 9990:9990 vgmdb-node
```

## Development

### Project Structure

```
src/
├── index.ts              # Express server entry point
├── parsers/              # HTML parsers
│   ├── album.ts         # Album parser
│   ├── album.test.ts    # Album parser tests
│   └── artist.ts        # Artist parser
├── types/               # TypeScript type definitions
│   └── index.ts
└── utils/               # Utility functions
    ├── fetch.ts         # HTTP fetching
    └── parse.ts         # HTML parsing helpers
```

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Code Formatting

```bash
npm run format
```

## API Usage Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

// Get album information
const response = await axios.get('http://localhost:9990/album/79');
console.log(response.data);

// Output:
// {
//   "names": {
//     "en": "Final Fantasy VIII Original Soundtrack",
//     "ja": "ファイナルファンタジーVIII オリジナル・サウンドトラック"
//   },
//   "name": "Final Fantasy VIII Original Soundtrack",
//   ...
// }
```

### Python

```python
import requests

# Get album information
response = requests.get('http://localhost:9990/album/79')
album = response.json()
print(album['name'])
```

### curl

```bash
# Get album and save to file
curl http://localhost:9990/album/79 > album.json

# Get multiple albums
for id in 79 80 81; do
  curl http://localhost:9990/album/$id > album_$id.json
done
```

## Parsing HTML Directly

You can also use the parsers directly without running the server:

```typescript
import { parseAlbumPage } from './src/parsers/album';
import { readFileSync } from 'fs';

// Read HTML from file
const html = readFileSync('album.html', 'utf-8');

// Parse it
const album = parseAlbumPage(html);

console.log(album?.name);
console.log(album?.catalog);
```

## Environment Variables

- `PORT` - Server port (default: 9990)
- `NODE_ENV` - Environment mode (development/production)

Example:
```bash
PORT=3000 NODE_ENV=production npm start
```

## Next Steps

- Read the [TypeScript-specific README](README-TYPESCRIPT.md) for more details
- Check the [Comparison document](COMPARISON.md) to see how it differs from the Python version
- Run the examples: `ts-node src/examples.ts`
- Explore the test files to understand the parser behavior
- Contribute by implementing more parsers (product, event, org, etc.)

## Troubleshooting

### Port already in use

If you get an error that port 9990 is already in use:
```bash
# Use a different port
PORT=3000 npm start
```

### Build errors

If you encounter TypeScript compilation errors:
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Test failures

If tests fail:
```bash
# Make sure you have the test HTML files
ls tests/*.html

# Run tests with verbose output
npm test -- --verbose
```

## Getting Help

- Check the [README-TYPESCRIPT.md](README-TYPESCRIPT.md) for API documentation
- Review the [COMPARISON.md](COMPARISON.md) for differences from Python version
- Look at the test files for usage examples
- Open an issue on GitHub for bugs or questions

## Contributing

We welcome contributions! Areas that need work:

1. Implement product parser
2. Implement event parser
3. Implement organization parser
4. Add search functionality
5. Add Redis caching support
6. Add more comprehensive tests
7. Improve documentation

See the main README for contribution guidelines.
