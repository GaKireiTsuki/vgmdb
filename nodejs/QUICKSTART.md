# Quick Start Guide - VGMdb Node.js API

Get started with the VGMdb Node.js API in just a few steps!

## Prerequisites

- Node.js 14.0.0 or higher
- npm (comes with Node.js)

## Installation & Setup

### Option 1: Quick Start (Recommended)

```bash
# Navigate to the nodejs directory
cd nodejs

# Run the start script (installs dependencies if needed)
./start.sh
```

That's it! The server will start on http://localhost:3000

### Option 2: Manual Setup

```bash
# Navigate to the nodejs directory
cd nodejs

# Install dependencies
npm install

# Start the server
npm start
```

### Option 3: Development Mode

```bash
cd nodejs
npm install
npm run dev  # Uses nodemon for auto-reload on changes
```

### Option 4: Docker

```bash
cd nodejs
docker build -t vgmdb-nodejs .
docker run -p 3000:3000 vgmdb-nodejs
```

## Your First API Request

Once the server is running, try these commands:

### Using cURL

```bash
# Get information about album #1
curl http://localhost:3000/album/1

# Search for "final fantasy"
curl "http://localhost:3000/search?q=final%20fantasy"

# Get artist information
curl http://localhost:3000/artist/1

# Get YAML format
curl http://localhost:3000/album/1?format=yaml
```

### Using a Web Browser

Simply open these URLs in your browser:

- http://localhost:3000/ - API information
- http://localhost:3000/album/1 - View album data
- http://localhost:3000/artist/1 - View artist data
- http://localhost:3000/search/chrono%20trigger - Search results

### Using JavaScript

```javascript
fetch('http://localhost:3000/album/1')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## Available Endpoints

| Endpoint | Description | Example |
|----------|-------------|---------|
| `GET /` | API information | http://localhost:3000/ |
| `GET /album/:id` | Get album info | http://localhost:3000/album/1 |
| `GET /artist/:id` | Get artist info | http://localhost:3000/artist/1 |
| `GET /product/:id` | Get product info | http://localhost:3000/product/1 |
| `GET /search/:query` | Search all categories | http://localhost:3000/search/zelda |

## Configuration

### Change Port

Set the `PORT` environment variable:

```bash
PORT=8080 npm start
```

### Production Mode

```bash
NODE_ENV=production npm start
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Get test coverage:

```bash
npm run test:coverage
```

## Next Steps

- Read the [API Documentation](API.md) for detailed endpoint information
- Check out [README.md](README.md) for more configuration options
- See [examples.js](examples.js) for programmatic usage examples
- Review [DOCKER.md](DOCKER.md) for Docker deployment details

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
PORT=8080 npm start
```

### Dependencies Installation Failed

Try clearing npm cache and reinstalling:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Cannot Connect to VGMdb.net

This usually means VGMdb.net is temporarily unavailable. The API will return a 503 error. Try again later.

## Getting Help

- Review the [API Documentation](API.md)
- Check [README.md](README.md) for detailed information
- Report issues on GitHub

## License

Same as the parent project (MIT).
