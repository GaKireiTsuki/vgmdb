#!/usr/bin/env node

/**
 * Example script demonstrating how to use the VGMdb TypeScript parsers
 */

import { parseAlbumPage } from './parsers/album';
import { parseArtistPage } from './parsers/artist';
import { readFileSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('VGMdb TypeScript Parser Examples\n');

  // Example 1: Parse album from test HTML
  console.log('1. Parsing album HTML...');
  try {
    const albumHtml = readFileSync(
      join(__dirname, '../tests/album_ff8.html'),
      'utf-8'
    );
    const album = parseAlbumPage(albumHtml);
    if (album) {
      console.log('   Album Name:', album.name);
      console.log('   Catalog:', album.catalog);
      console.log('   Release Date:', album.release_date);
      console.log('   Discs:', album.discs?.length || 0);
      console.log('   ✓ Success\n');
    }
  } catch (error) {
    console.error('   ✗ Error:', error);
  }

  // Example 2: Parse artist from test HTML
  console.log('2. Parsing artist HTML...');
  try {
    const artistHtml = readFileSync(
      join(__dirname, '../tests/artist_nobuo.html'),
      'utf-8'
    );
    const artist = parseArtistPage(artistHtml);
    if (artist) {
      console.log('   Artist Name:', artist.name);
      console.log('   Birth Place:', artist.birth_place || 'N/A');
      console.log('   Birthdate:', artist.birthdate || 'N/A');
      console.log('   Aliases:', artist.aliases?.length || 0);
      console.log('   ✓ Success\n');
    }
  } catch (error) {
    console.error('   ✗ Error:', error);
  }

  console.log('Examples completed!');
}

main().catch(console.error);
