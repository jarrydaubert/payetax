import type { MetadataRoute } from 'next';
import { RATES_LAST_VERIFIED } from '@/constants/freshness';

jest.mock('@/lib/blog', () => ({
  getBlogPosts: jest.fn(),
  getBlogCategories: jest.fn(),
}));

const { getBlogPosts, getBlogCategories } = jest.requireMock('@/lib/blog') as {
  getBlogPosts: jest.Mock;
  getBlogCategories: jest.Mock;
};

const ratesLastVerifiedSitemapDate = new Date(`${RATES_LAST_VERIFIED}T00:00:00.000Z`).toISOString();

describe('sitemap', () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('includes retained static routes, tools, blog posts, and blog categories', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

    getBlogPosts.mockResolvedValue([
      {
        slug: 'salary-guide',
        updatedAt: '2026-01-02',
        publishedAt: '2026-01-01',
        featured: true,
      },
    ]);
    getBlogCategories.mockResolvedValue([{ slug: 'tax-basics', count: 1 }]);

    const { default: sitemap } = await import('../sitemap');
    const entries = (await sitemap()) as MetadataRoute.Sitemap;

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: 'https://example.com/',
          lastModified: ratesLastVerifiedSitemapDate,
        }),
        expect.objectContaining({
          url: 'https://example.com/blog',
          lastModified: '2026-01-02T00:00:00.000Z',
        }),
        expect.objectContaining({
          url: 'https://example.com/about',
          lastModified: '2026-06-19T00:00:00.000Z',
        }),
        expect.objectContaining({
          url: 'https://example.com/privacy',
          lastModified: '2026-07-17T00:00:00.000Z',
        }),
        expect.objectContaining({
          url: 'https://example.com/install',
          lastModified: '2026-06-07T00:00:00.000Z',
        }),
        expect.objectContaining({
          url: 'https://example.com/tools/director-guide',
          lastModified: ratesLastVerifiedSitemapDate,
        }),
        expect.objectContaining({
          url: 'https://example.com/tools/national-insurance-calculator',
          lastModified: ratesLastVerifiedSitemapDate,
        }),
        expect.objectContaining({
          url: 'https://example.com/blog/salary-guide',
          lastModified: '2026-01-02T00:00:00.000Z',
          priority: 0.85,
        }),
        expect.objectContaining({
          url: 'https://example.com/blog/category/tax-basics',
          lastModified: '2026-01-02T00:00:00.000Z',
        }),
      ]),
    );
  });

  it('emits rounded sitemap priorities', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

    getBlogPosts.mockResolvedValue([]);
    getBlogCategories.mockResolvedValue([]);

    const { default: sitemap } = await import('../sitemap');
    const entries = (await sitemap()) as MetadataRoute.Sitemap;

    for (const entry of entries) {
      expect(entry.priority).toBe(Number(entry.priority?.toFixed(2)));
    }
  });

  it('falls back to static routes when blog data fetch fails', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

    getBlogPosts.mockRejectedValueOnce(new Error('blog fail'));
    getBlogCategories.mockRejectedValueOnce(new Error('category fail'));

    const { default: sitemap } = await import('../sitemap');
    const entries = (await sitemap()) as MetadataRoute.Sitemap;
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://example.com/');
    expect(urls).toContain('https://example.com/tools');
    const retiredRouteFragments = [
      '/calculator',
      '/calculator/',
      '/scenarios',
      '/alternatives',
      '/best-for',
      '/best-uk-tax-calculators',
      '/vs',
    ];

    for (const fragment of retiredRouteFragments) {
      expect(urls.some((url) => url.includes(fragment))).toBe(false);
    }
  });
});
