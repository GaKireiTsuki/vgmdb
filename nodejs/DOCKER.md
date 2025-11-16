# VGMdb Node.js API - Docker

Build and run the Node.js VGMdb API in a Docker container.

## Build the Docker image

```bash
docker build -t vgmdb-nodejs .
```

## Run the container

```bash
docker run -p 3000:3000 vgmdb-nodejs
```

The API will be available at http://localhost:3000

## Using Docker Compose

If you want to use Docker Compose, add this service to your `docker-compose.yml`:

```yaml
services:
  vgmdb-nodejs:
    build: ./nodejs
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

Then run:

```bash
docker-compose up -d vgmdb-nodejs
```
