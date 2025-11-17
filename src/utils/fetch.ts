import axios from 'axios';

const USER_AGENT = 'VGMdb/1.0 vgmdb.info';
const BASE_URL = 'https://vgmdb.net';

export async function fetchPage(url: string, retries = 2): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`HTTPError ${error.response?.status} while fetching ${url}`);
      if (error.response?.status === 503 && retries > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 2500 + 500)
        );
        return fetchPage(url, retries - 1);
      }
    }
    throw error;
  }
}

export function urlInfoPage(type: string, id: string): string {
  return `${BASE_URL}/${type}/${id}?perpage=99999`;
}

export async function fetchInfoPage(
  type: string,
  id: string
): Promise<string> {
  return fetchPage(urlInfoPage(type, id));
}

export function urlListPage(type: string, id: string): string {
  let page = 1;
  if (id.length > 1) {
    page = parseInt(id.substring(1), 10);
  }
  return `${BASE_URL}/db/${type}.php?ltr=${id}&field=title&perpage=100&page=${page}`;
}

export async function fetchListPage(type: string, id: string): Promise<string> {
  return fetchPage(urlListPage(type, id));
}

export function urlSinglelistPage(type: string): string {
  return `${BASE_URL}/db/${type}.php`;
}

export async function fetchSinglelistPage(type: string): Promise<string> {
  return fetchPage(urlSinglelistPage(type));
}

export function fixInvalidTable(htmlSource: string): string {
  let html = htmlSource;

  // fix missing </table>
  let start = 0;
  while (true) {
    start = html.indexOf('<table', start + 1);
    if (start === -1) break;

    const searchStart = Math.max(0, start - 40);
    const prevtagEnd = html.lastIndexOf('>', start);
    if (prevtagEnd < searchStart) continue;
    
    const prevtagStart = html.lastIndexOf('<', prevtagEnd);
    if (prevtagStart < searchStart) continue;
    
    const prevtag = html.substring(prevtagStart, prevtagEnd + 1);

    if (prevtag === '</tr>') {
      html =
        html.substring(0, prevtagEnd + 1) +
        '</table>' +
        html.substring(prevtagEnd + 1);
      start = html.indexOf('<table', prevtagStart);
    }
  }

  // fix duplicate <tr>
  start = 0;
  while (true) {
    start = html.indexOf('<tr>', start + 1);
    if (start === -1) break;

    const searchStart = Math.max(0, start - 40);
    const prevtagEnd = html.lastIndexOf('>', start);
    if (prevtagEnd < searchStart) continue;
    
    const prevtagStart = html.lastIndexOf('<', prevtagEnd);
    if (prevtagStart < searchStart) continue;
    
    const prevtag = html.substring(prevtagStart, prevtagEnd + 1);

    if (prevtag === '<tr>') {
      html = html.substring(0, prevtagStart) + html.substring(prevtagEnd + 1);
      start = prevtagEnd;
    }
  }

  // fix duplicate </tr>
  start = 0;
  while (true) {
    start = html.indexOf('</tr>', start + 1);
    if (start === -1) break;

    const searchStart = Math.max(0, start - 40);
    const prevtagEnd = html.lastIndexOf('>', start);
    if (prevtagEnd < searchStart) continue;
    
    const prevtagStart = html.lastIndexOf('<', prevtagEnd);
    if (prevtagStart < searchStart) continue;
    
    const prevtag = html.substring(prevtagStart, prevtagEnd + 1);

    if (prevtag === '</tr>') {
      html = html.substring(0, prevtagStart) + html.substring(prevtagEnd + 1);
      start = prevtagEnd;
    }
  }

  return html;
}

export function trimAbsolute(link: string): string {
  let result = link;
  if (result.startsWith('http://vgmdb.net/')) {
    result = result.substring('http://vgmdb.net/'.length);
  }
  if (result.startsWith('https://vgmdb.net/')) {
    result = result.substring('https://vgmdb.net/'.length);
  }
  if (result.length > 0 && result[0] === '/') {
    result = result.substring(1);
  }
  return result;
}

export function forceAbsolute(link: string): string {
  if (link.startsWith('http://') || link.startsWith('https://')) {
    return link;
  }
  return new URL(link, BASE_URL).toString();
}

export function extractBackgroundImage(style: string): string | null {
  const match = style.match(/background-image:\s*url\('([^)]*)'\)/);
  return match ? match[1] : null;
}

export function mediaThumb(mediumLink: string): string {
  return mediumLink.replace('medium-media', 'thumb-media');
}

export function mediaFull(mediumLink: string): string {
  return mediumLink.replace('medium-media', 'media');
}

export function stripRedirect(link: string): string {
  let result = forceAbsolute(link);
  let index = -1;

  if (result.startsWith('http://vgmdb.net/redirect')) {
    index = result.indexOf('/', 'http://vgmdb.net/redirect/'.length);
  }
  if (result.startsWith('https://vgmdb.net/redirect')) {
    index = result.indexOf('/', 'https://vgmdb.net/redirect/'.length);
  }

  if (index > 0) {
    result = result.substring(index + 1);
    if (!result.startsWith('http://') && !result.startsWith('https://')) {
      result = 'http://' + result;
    }
    return stripRedirect(result);
  }

  return result;
}

export function normalizeDottedDate(weirdDate: string | null): string | null {
  return normalizeSeparatedDate(weirdDate, '.');
}

export function normalizeDashedDate(weirdDate: string | null): string | null {
  return normalizeSeparatedDate(weirdDate, '-');
}

function normalizeSeparatedDate(
  weirdDate: string | null,
  split: string
): string | null {
  if (!weirdDate) return null;

  const elements = weirdDate.split(split);
  const output = elements
    .filter((x) => x.length > 0 && x[0] !== '?')
    .map((x) => parseInt(x, 10));

  if (output.length === 0) return null;

  const stringedOutput = [output[0].toString().padStart(4, '0')];
  stringedOutput.push(
    ...output.slice(1).map((x) => x.toString().padStart(2, '0'))
  );

  return stringedOutput.join('-');
}
