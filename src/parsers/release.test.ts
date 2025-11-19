import { readFileSync } from 'fs';
import { join } from 'path';
import { parseReleasePage } from './release';

describe('Release Parser', () => {
  it('should parse release Hollow Ataraxia PC HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/release_hollowataraxiapc.html'),
      'utf-8'
    );

    const release = parseReleasePage(html);

    expect(release).not.toBeNull();
    if (!release) return;

    expect(release.name).toBeDefined();
    expect(release.name.length).toBeGreaterThan(0);
  });

  it('should parse release Hollow Ataraxia Vita HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/release_hollowataraxiavita.html'),
      'utf-8'
    );

    const release = parseReleasePage(html);

    expect(release).not.toBeNull();
    if (!release) return;

    expect(release.name).toBeDefined();
    expect(release.name.length).toBeGreaterThan(0);
  });

  it('should return null for invalid HTML', () => {
    const html = '<html><body>Invalid page</body></html>';

    const release = parseReleasePage(html);

    expect(release).toBeNull();
  });
});
