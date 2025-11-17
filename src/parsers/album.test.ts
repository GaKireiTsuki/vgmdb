import { readFileSync } from 'fs';
import { join } from 'path';
import { parseAlbumPage } from '../parsers/album';

describe('Album Parser', () => {
  it('should parse album FF8 HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/album_ff8.html'),
      'utf-8'
    );

    const album = parseAlbumPage(html);

    expect(album).not.toBeNull();
    if (!album) return;

    // Check basic properties
    expect(album.names).toBeDefined();
    expect(album.name).toBeDefined();
    expect(album.name.length).toBeGreaterThan(0);

    // Check if it has English and Japanese names
    expect(album.names['en'] || album.names['ja']).toBeDefined();

    // Check catalog number
    expect(album.catalog).toBeDefined();

    // Check discs
    expect(album.discs).toBeDefined();
    expect(Array.isArray(album.discs)).toBe(true);
  });

  it('should parse album Arciel HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/album_arciel.html'),
      'utf-8'
    );

    const album = parseAlbumPage(html);

    expect(album).not.toBeNull();
    if (!album) return;

    expect(album.names).toBeDefined();
    expect(album.name).toBeDefined();
    expect(album.catalog).toBeDefined();
  });

  it('should return null for invalid HTML', () => {
    const html = '<html><body>Invalid page</body></html>';

    const album = parseAlbumPage(html);

    expect(album).toBeNull();
  });
});
