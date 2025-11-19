import { readFileSync } from 'fs';
import { join } from 'path';
import { parseSearchPage } from './search';

describe('Search Parser', () => {
  it('should parse search HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/search.html'),
      'utf-8'
    );

    const search = parseSearchPage(html);

    expect(search).not.toBeNull();
    if (!search) return;

    // Search results should have sections
    expect(search.sections).toBeDefined();
    expect(Array.isArray(search.sections)).toBe(true);
  });

  it('should parse search quotes HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/search_quotes.html'),
      'utf-8'
    );

    const search = parseSearchPage(html);

    expect(search).not.toBeNull();
    if (!search) return;

    expect(search.sections).toBeDefined();
    expect(Array.isArray(search.sections)).toBe(true);
  });

  it('should return null for invalid HTML', () => {
    const html = '<html><body>Invalid page</body></html>';

    const search = parseSearchPage(html);

    expect(search).toBeNull();
  });
});
