import { readFileSync } from 'fs';
import { join } from 'path';
import { parseEventlistPage } from './eventlist';

describe('EventList Parser', () => {
  it('should parse eventlist HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/eventlist.html'),
      'utf-8'
    );

    const eventlist = parseEventlistPage(html);

    expect(eventlist).not.toBeNull();
    if (!eventlist) return;

    expect(eventlist.events).toBeDefined();
    expect(typeof eventlist.events).toBe('object');
    
    // Check that there are some years with events
    const years = Object.keys(eventlist.events);
    expect(years.length).toBeGreaterThan(0);
    
    // Check first year has events
    const firstYear = years[0];
    const eventsInFirstYear = eventlist.events[firstYear];
    expect(Array.isArray(eventsInFirstYear)).toBe(true);
    expect(eventsInFirstYear.length).toBeGreaterThan(0);
    
    // Check first event has required properties
    const firstEvent = eventsInFirstYear[0];
    expect(firstEvent.link).toBeDefined();
    expect(firstEvent.names).toBeDefined();
  });

  it('should return null for invalid HTML', () => {
    const html = '<html><body>Invalid page</body></html>';

    const eventlist = parseEventlistPage(html);

    expect(eventlist).toBeNull();
  });
});
