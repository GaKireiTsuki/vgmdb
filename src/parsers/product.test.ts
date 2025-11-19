import { readFileSync } from 'fs';
import { join } from 'path';
import { parseProductPage } from './product';

describe('Product Parser', () => {
  it('should parse product Clannad HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/product_clannad.html'),
      'utf-8'
    );

    const product = parseProductPage(html);

    expect(product).not.toBeNull();
    if (!product) return;

    expect(product.names).toBeDefined();
    expect(product.name).toBeDefined();
    expect(product.name.length).toBeGreaterThan(0);
  });

  it('should parse product Witcher HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/product_witcher.html'),
      'utf-8'
    );

    const product = parseProductPage(html);

    expect(product).not.toBeNull();
    if (!product) return;

    expect(product.names).toBeDefined();
    expect(product.name).toBeDefined();
  });

  it('should parse product Bandai HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/product_bandai.html'),
      'utf-8'
    );

    const product = parseProductPage(html);

    expect(product).not.toBeNull();
    if (!product) return;

    expect(product.names).toBeDefined();
    expect(product.name).toBeDefined();
  });

  it('should parse product Hollow Ataraxia HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/product_hollowataraxia.html'),
      'utf-8'
    );

    const product = parseProductPage(html);

    expect(product).not.toBeNull();
    if (!product) return;

    expect(product.names).toBeDefined();
    expect(product.name).toBeDefined();
  });

  it('should parse product Skyrim HTML correctly', () => {
    const html = readFileSync(
      join(__dirname, '../../tests/product_skyrim.html'),
      'utf-8'
    );

    const product = parseProductPage(html);

    expect(product).not.toBeNull();
    if (!product) return;

    expect(product.names).toBeDefined();
    expect(product.name).toBeDefined();
  });

  it('should return null for invalid HTML', () => {
    const html = '<html><body>Invalid page</body></html>';

    const product = parseProductPage(html);

    expect(product).toBeNull();
  });
});
