import { readFileSync } from 'fs';
import { join } from 'path';
import { parseRecentPage } from './recent';

describe('Recent Parser', () => {
  it('should parse recent albums HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/recent_albums.html'),
      'utf-8'
    );

    const recent = parseRecentPage(html);

    expect(recent).not.toBeNull();
    if (!recent) return;

    expect(recent.updates).toBeDefined();
    expect(Array.isArray(recent.updates)).toBe(true);
  });

  it('should parse recent artists HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/recent_artists.html'),
      'utf-8'
    );

    const recent = parseRecentPage(html);

    expect(recent).not.toBeNull();
    if (!recent) return;

    expect(recent.updates).toBeDefined();
    expect(Array.isArray(recent.updates)).toBe(true);
  });

  it('should parse recent products HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/recent_products.html'),
      'utf-8'
    );

    const recent = parseRecentPage(html);

    expect(recent).not.toBeNull();
    if (!recent) return;

    expect(recent.updates).toBeDefined();
    expect(Array.isArray(recent.updates)).toBe(true);
  });

  it('should parse recent labels HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/recent_labels.html'),
      'utf-8'
    );

    const recent = parseRecentPage(html);

    expect(recent).not.toBeNull();
    if (!recent) return;

    expect(recent.updates).toBeDefined();
    expect(Array.isArray(recent.updates)).toBe(true);
  });

  it('should parse recent links HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/recent_links.html'),
      'utf-8'
    );

    const recent = parseRecentPage(html);

    expect(recent).not.toBeNull();
    if (!recent) return;

    expect(recent.updates).toBeDefined();
    expect(Array.isArray(recent.updates)).toBe(true);
  });

  it('should parse recent media HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/recent_media.html'),
      'utf-8'
    );

    const recent = parseRecentPage(html);

    expect(recent).not.toBeNull();
    if (!recent) return;

    expect(recent.updates).toBeDefined();
    expect(Array.isArray(recent.updates)).toBe(true);
  });

  it('should parse recent ratings HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/recent_ratings.html'),
      'utf-8'
    );

    const recent = parseRecentPage(html);

    expect(recent).not.toBeNull();
    if (!recent) return;

    expect(recent.updates).toBeDefined();
    expect(Array.isArray(recent.updates)).toBe(true);
  });

  it('should parse recent scans HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/recent_scans.html'),
      'utf-8'
    );

    const recent = parseRecentPage(html);

    expect(recent).not.toBeNull();
    if (!recent) return;

    expect(recent.updates).toBeDefined();
    expect(Array.isArray(recent.updates)).toBe(true);
  });

  it('should parse recent tracklists HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/recent_tracklists.html'),
      'utf-8'
    );

    const recent = parseRecentPage(html);

    expect(recent).not.toBeNull();
    if (!recent) return;

    expect(recent.updates).toBeDefined();
    expect(Array.isArray(recent.updates)).toBe(true);
  });

  it('should return null for invalid HTML', () => {
    const html = '<html><body>Invalid page</body></html>';

    const recent = parseRecentPage(html);

    expect(recent).toBeNull();
  });
});
