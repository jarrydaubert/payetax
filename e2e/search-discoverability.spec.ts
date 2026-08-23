import { type APIRequestContext, expect, test } from '@playwright/test';

interface CrawlFinding {
  path: string;
  detail: string;
}

const ROBOTS_META_NAMES = new Set(['robots', 'googlebot', 'bingbot']);

function extractAttribute(tag: string, attribute: string): string | null {
  const match = tag.match(new RegExp(`${attribute}=["']([^"']+)["']`, 'i'));
  return match?.[1] ?? null;
}

async function crawlSitemapPage(request: APIRequestContext, publicUrl: string) {
  const parsedUrl = new URL(publicUrl);
  const localPath = `${parsedUrl.pathname}${parsedUrl.search}`;
  const response = await request.get(localPath, { maxRedirects: 0 });
  const status = response.status();
  const contentType = response.headers()['content-type'] ?? '';
  const robotsHeader = response.headers()['x-robots-tag'] ?? '';
  const redirect: CrawlFinding | null =
    status >= 300 && status < 400 ? { path: localPath, detail: `HTTP ${status}` } : null;
  const unexpectedStatus: CrawlFinding | null =
    status === 200 ? null : { path: localPath, detail: `HTTP ${status}` };
  const noindex: CrawlFinding[] = [];
  const toolsRedirectLinks: CrawlFinding[] = [];

  if (robotsHeader.toLowerCase().includes('noindex')) {
    noindex.push({ path: localPath, detail: robotsHeader });
  }

  if (contentType.includes('text/html')) {
    const html = await response.text();
    const robotsMeta = (html.match(/<meta\b[^>]*>/gi) ?? []).filter((tag) => {
      const name = extractAttribute(tag, 'name');
      const content = extractAttribute(tag, 'content');
      return (
        ROBOTS_META_NAMES.has(name?.toLowerCase() ?? '') &&
        content?.toLowerCase().includes('noindex')
      );
    });

    if (robotsMeta.length > 0) {
      noindex.push({ path: localPath, detail: robotsMeta.join(' ') });
    }

    for (const tag of html.match(/<a\b[^>]*>/gi) ?? []) {
      const href = extractAttribute(tag, 'href');
      if (!href) continue;

      const target = new URL(href, publicUrl);
      const isInternal = href.startsWith('/') || target.origin === parsedUrl.origin;
      if (isInternal && target.pathname === '/tools/') {
        toolsRedirectLinks.push({ path: localPath, detail: href });
      }
    }
  }

  await response.dispose();
  return { redirect, unexpectedStatus, noindex, toolsRedirectLinks };
}

test('published sitemap has no redirects, no noindex pages, and no /tools/ link hops', async ({
  request,
}) => {
  const sitemapResponse = await request.get('/sitemap.xml', { maxRedirects: 0 });
  expect(sitemapResponse.status()).toBe(200);
  const sitemapXml = await sitemapResponse.text();
  const publicUrls = Array.from(sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g), ([, url]) =>
    url.replaceAll('&amp;', '&'),
  );
  await sitemapResponse.dispose();

  expect(publicUrls.length).toBeGreaterThan(0);

  const results = [];
  for (let index = 0; index < publicUrls.length; index += 8) {
    results.push(
      ...(await Promise.all(
        publicUrls.slice(index, index + 8).map((url) => crawlSitemapPage(request, url)),
      )),
    );
  }

  const redirects = results.flatMap(({ redirect }) => (redirect ? [redirect] : []));
  const unexpectedStatuses = results.flatMap(({ unexpectedStatus }) =>
    unexpectedStatus ? [unexpectedStatus] : [],
  );
  const noindexPages = results.flatMap(({ noindex }) => noindex);
  const toolsRedirectLinks = results.flatMap(({ toolsRedirectLinks: links }) => links);

  expect(redirects, 'sitemap URLs that redirect').toEqual([]);
  expect(unexpectedStatuses, 'sitemap URLs without HTTP 200').toEqual([]);
  expect(noindexPages, 'sitemap URLs marked noindex').toEqual([]);
  expect(toolsRedirectLinks, 'internal links that point to /tools/').toEqual([]);
});
