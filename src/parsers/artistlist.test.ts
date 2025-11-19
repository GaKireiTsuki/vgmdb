import { readFileSync } from 'fs';
import { join } from 'path';
import { parseArtistlistPage } from './artistlist';

describe('ArtistList Parser', () => {
  it('should parse artistlist HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/artistlist.html'),
      'utf-8'
    );

    const artistlist = parseArtistlistPage(html);

    expect(artistlist).not.toBeNull();
    if (!artistlist) return;

    expect(artistlist.artists).toBeDefined();
    expect(Array.isArray(artistlist.artists)).toBe(true);
    expect(artistlist.artists.length).toBeGreaterThan(0);
    
    // Check first artist has required properties
    const firstArtist = artistlist.artists[0];
    expect(firstArtist.link).toBeDefined();
    expect(firstArtist.names).toBeDefined();
  });

  it('should return null for invalid HTML', () => {
    const html = '<html><body>Invalid page</body></html>';

    const artistlist = parseArtistlistPage(html);

    expect(artistlist).toBeNull();
  });
});
