import { readFileSync } from 'fs';
import { join } from 'path';
import { parseOrglistPage } from './orglist';

describe('OrgList Parser', () => {
  it('should parse orglist HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/orglist.html'),
      'utf-8'
    );

    const orglist = parseOrglistPage(html);

    expect(orglist).not.toBeNull();
    if (!orglist) return;

    expect(orglist.orgs).toBeDefined();
    expect(typeof orglist.orgs).toBe('object');
    
    // Check that there are some letters with orgs
    const letters = Object.keys(orglist.orgs);
    expect(letters.length).toBeGreaterThan(0);
    
    // Check first letter has orgs
    const firstLetter = letters[0];
    const orgsInFirstLetter = orglist.orgs[firstLetter];
    expect(Array.isArray(orgsInFirstLetter)).toBe(true);
    expect(orgsInFirstLetter.length).toBeGreaterThan(0);
    
    // Check first org has required properties
    const firstOrg = orgsInFirstLetter[0];
    expect(firstOrg.link).toBeDefined();
    expect(firstOrg.names).toBeDefined();
  });

  it('should return null for invalid HTML', () => {
    const html = '<html><body>Invalid page</body></html>';

    const orglist = parseOrglistPage(html);

    expect(orglist).toBeNull();
  });
});
