/**
 * Example usage of the VGMdb API - Node.js implementation
 * 
 * This file demonstrates how to use the VGMdb parsers programmatically
 */

const album = require('./parsers/album');
const artist = require('./parsers/artist');
const product = require('./parsers/product');
const search = require('./parsers/search');

async function exampleAlbumParsing() {
  console.log('=== Album Parsing Example ===');
  try {
    // Fetch and parse album with ID 1
    const htmlSource = await album.fetchPage(1);
    const albumInfo = album.parsePage(htmlSource);
    
    if (albumInfo) {
      console.log(`Album Name: ${albumInfo.name}`);
      console.log(`Catalog: ${albumInfo.catalog || 'N/A'}`);
      console.log(`Release Date: ${albumInfo.release_date || 'N/A'}`);
      console.log(`Number of discs: ${albumInfo.discs ? albumInfo.discs.length : 0}`);
    } else {
      console.log('Album not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();
}

async function exampleArtistParsing() {
  console.log('=== Artist Parsing Example ===');
  try {
    // Fetch and parse artist with ID 1
    const htmlSource = await artist.fetchPage(1);
    const artistInfo = artist.parsePage(htmlSource);
    
    if (artistInfo) {
      console.log(`Artist Name: ${artistInfo.name}`);
      console.log(`Birthdate: ${artistInfo.birthdate || 'N/A'}`);
      console.log(`Discography sections: ${artistInfo.discography ? artistInfo.discography.length : 0}`);
    } else {
      console.log('Artist not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();
}

async function exampleProductParsing() {
  console.log('=== Product Parsing Example ===');
  try {
    // Fetch and parse product with ID 1
    const htmlSource = await product.fetchPage(1);
    const productInfo = product.parsePage(htmlSource);
    
    if (productInfo) {
      console.log(`Product Name: ${productInfo.name}`);
      console.log(`Release Date: ${productInfo.release_date || 'N/A'}`);
      console.log(`Platforms: ${productInfo.platforms ? productInfo.platforms.join(', ') : 'N/A'}`);
      console.log(`Related Albums: ${productInfo.albums ? productInfo.albums.length : 0}`);
    } else {
      console.log('Product not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();
}

async function exampleSearch() {
  console.log('=== Search Example ===');
  try {
    // Search for "final fantasy"
    const htmlSource = await search.fetchPage('final fantasy');
    const searchInfo = search.parsePage(htmlSource);
    
    console.log(`Albums found: ${searchInfo.sections.albums.length}`);
    console.log(`Artists found: ${searchInfo.sections.artists.length}`);
    console.log(`Products found: ${searchInfo.sections.products.length}`);
    
    if (searchInfo.sections.albums.length > 0) {
      console.log(`\nFirst album result: ${searchInfo.sections.albums[0].name}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();
}

// Main execution
async function main() {
  console.log('VGMdb API - Node.js Implementation Examples\n');
  
  // Note: These examples make real network requests to vgmdb.net
  // Uncomment the ones you want to test:
  
  // await exampleAlbumParsing();
  // await exampleArtistParsing();
  // await exampleProductParsing();
  // await exampleSearch();
  
  console.log('Examples complete. Uncomment function calls in examples.js to run them.');
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  exampleAlbumParsing,
  exampleArtistParsing,
  exampleProductParsing,
  exampleSearch
};
