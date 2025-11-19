import { readFileSync } from 'fs';
import { join } from 'path';
import { parseEventPage } from './event';

describe('Event Parser', () => {
  it('should parse event CM54 HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/event_cm54.html'),
      'utf-8'
    );

    const event = parseEventPage(html);

    expect(event).not.toBeNull();
    if (!event) return;

    expect(event.name).toBeDefined();
    expect(event.name.length).toBeGreaterThan(0);
  });

  it('should parse event M3 HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/event_m3.html'),
      'utf-8'
    );

    const event = parseEventPage(html);

    expect(event).not.toBeNull();
    if (!event) return;

    expect(event.name).toBeDefined();
    expect(event.name.length).toBeGreaterThan(0);
  });

  it('should return null for invalid HTML', () => {
    const html = '<html><body>Invalid page</body></html>';

    const event = parseEventPage(html);

    expect(event).toBeNull();
  });
});
