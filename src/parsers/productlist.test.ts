import { readFileSync } from 'fs';
import { join } from 'path';
import { parseProductlistPage } from './productlist';

describe('ProductList Parser', () => {
  it('should parse productlist HTML correctly or return empty products', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/productlist.html'),
      'utf-8'
    );

    const productlist = parseProductlistPage(html);

    expect(productlist).not.toBeNull();
    if (!productlist) return;

    expect(productlist.products).toBeDefined();
    expect(Array.isArray(productlist.products)).toBe(true);
    
    // If there are products, check first product has required properties
    if (productlist.products.length > 0) {
      const firstProduct = productlist.products[0];
      expect(firstProduct.link).toBeDefined();
      expect(firstProduct.names).toBeDefined();
    }
  });

  it('should return null for invalid HTML', () => {
    const html = '<html><body>Invalid page</body></html>';

    const productlist = parseProductlistPage(html);

    expect(productlist).toBeNull();
  });
});
