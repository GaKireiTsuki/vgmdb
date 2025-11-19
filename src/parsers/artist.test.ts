import { readFileSync } from 'fs';
import { join } from 'path';
import { parseArtistPage } from './artist';

describe('Artist Parser', () => {
  it('should parse artist Nobuo Uematsu HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/artist_nobuo.html'),
      'utf-8'
    );

    const artist = parseArtistPage(html);

    expect(artist).not.toBeNull();
    if (!artist) return;

    expect(artist.names).toBeDefined();
    expect(artist.name).toBeDefined();
    expect(artist.name.length).toBeGreaterThan(0);
  });

  it('should parse artist Key Sounds Label HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/artist_key.html'),
      'utf-8'
    );

    const artist = parseArtistPage(html);

    expect(artist).not.toBeNull();
    if (!artist) return;

    expect(artist.names).toBeDefined();
    expect(artist.name).toBeDefined();
  });

  it('should parse artist S.S. HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/artist_s_s.html'),
      'utf-8'
    );

    const artist = parseArtistPage(html);

    expect(artist).not.toBeNull();
    if (!artist) return;

    expect(artist.names).toBeDefined();
    expect(artist.name).toBeDefined();
  });

  it('should parse artist Horie Yui HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/artist_horie.html'),
      'utf-8'
    );

    const artist = parseArtistPage(html);

    expect(artist).not.toBeNull();
    if (!artist) return;

    expect(artist.names).toBeDefined();
    expect(artist.name).toBeDefined();
  });

  it('should return null for invalid HTML', () => {
    const html = '<html><body>Invalid page</body></html>';

    const artist = parseArtistPage(html);

    expect(artist).toBeNull();
  });
});
