import { readFileSync } from 'fs';
import { join } from 'path';
import { parseOrgPage } from './org';

describe('Org Parser', () => {
  it('should parse org Dogear HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/org_dogear.html'),
      'utf-8'
    );

    const org = parseOrgPage(html);

    expect(org).not.toBeNull();
    if (!org) return;

    expect(org.name).toBeDefined();
    expect(org.name.length).toBeGreaterThan(0);
  });

  it('should parse org Vagrancy HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/org_vagrancy.html'),
      'utf-8'
    );

    const org = parseOrgPage(html);

    expect(org).not.toBeNull();
    if (!org) return;

    expect(org.name).toBeDefined();
    expect(org.name.length).toBeGreaterThan(0);
  });

  it('should return null for invalid HTML', () => {
    const html = '<html><body>Invalid page</body></html>';

    const org = parseOrgPage(html);

    expect(org).toBeNull();
  });
});
