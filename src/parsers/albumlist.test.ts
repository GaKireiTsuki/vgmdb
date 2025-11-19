import { readFileSync } from 'fs';
import { join } from 'path';
import { parseAlbumlistPage } from './albumlist';

describe('AlbumList Parser', () => {
  it('should parse albumlist HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/albumlist.html'),
      'utf-8'
    );

    const albumlist = parseAlbumlistPage(html);

    expect(albumlist).not.toBeNull();
    if (!albumlist) return;

    expect(albumlist.albums).toBeDefined();
    expect(Array.isArray(albumlist.albums)).toBe(true);
    expect(albumlist.albums.length).toBeGreaterThan(0);
    
    // Check first album has required properties
    const firstAlbum = albumlist.albums[0];
    expect(firstAlbum.link).toBeDefined();
    expect(firstAlbum.catalog).toBeDefined();
  });

  it('should return null for invalid HTML', () => {
    const html = '<html><body>Invalid page</body></html>';

    const albumlist = parseAlbumlistPage(html);

    expect(albumlist).toBeNull();
  });
});
