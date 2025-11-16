const utils = require('../parsers/utils');

describe('Utils', () => {
  test('urlInfoPage should generate correct URL', () => {
    const url = utils.urlInfoPage('album', 123);
    expect(url).toBe('https://vgmdb.net/album/123');
  });
  
  test('forceAbsolute should handle relative URLs', () => {
    const relative = '/images/test.jpg';
    const absolute = utils.forceAbsolute(relative);
    expect(absolute).toBe('https://vgmdb.net/images/test.jpg');
  });
  
  test('forceAbsolute should not change absolute URLs', () => {
    const absolute = 'https://example.com/test.jpg';
    const result = utils.forceAbsolute(absolute);
    expect(result).toBe(absolute);
  });
  
  test('extractBackgroundImage should extract URL from style', () => {
    const style = 'background-image: url("/images/test.jpg")';
    const url = utils.extractBackgroundImage(style);
    expect(url).toBe('/images/test.jpg');
  });
  
  test('mediaFull should replace medium with full', () => {
    const medium = 'https://vgmdb.net/images/medium/test.jpg';
    const full = utils.mediaFull(medium);
    expect(full).toBe('https://vgmdb.net/images/full/test.jpg');
  });
  
  test('mediaThumb should replace medium with thumb', () => {
    const medium = 'https://vgmdb.net/images/medium/test.jpg';
    const thumb = utils.mediaThumb(medium);
    expect(thumb).toBe('https://vgmdb.net/images/thumb/test.jpg');
  });
});
