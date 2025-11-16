#!/bin/bash
# Convenience script to start the Node.js VGMdb API server

cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Dependencies not installed. Running npm install..."
    npm install
fi

echo "Starting VGMdb API server..."
echo "The server will be available at http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

node index.js
