import type { MetadataRoute } from 'next';

jest.mock('@/lib/blog', () => ({
  getBlogPosts: jest.fn(),
  getBlogCategories: jest.fn(),
}));

jest.mock('@/data/competitors', () => ({
  getAllCompetitorSlugs: jest.fn(() => ['listentotaxman']),
}));

jest.mock('@/data/scenarios', () => ({
  getAllScenarioSlugs: jest.fn(() => ['tax-trap-100k']),
}));

jest.mock('@/data/useCases', () => ({
  getAllUseCaseSlugs: jest.fn(() => ['contractors']),
}));

const { getBlogPosts, getBlogCategories } = jest.requireMock('@/lib/blog') as {
  getBlogPosts: jest.Mock;
  getBlogCategories: jest.Mock;
};
const { getAllCompetitorSlugs } = jest.requireMock('@/data/competitors') as {
  getAllCompetitorSlugs: jest.Mock;
};

describe('sitemap', () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('includes static, blog, competitor, scenario, and use case entries', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

    getBlogPosts.mockResolvedValue([
      {
        slug: 'salary-guide',
        updatedAt: '2026-01-02',
        publishedAt: '2026-01-01',
        featured: true,
      },
    ]);
    getBlogCategories.mockResolvedValue([{ slug: 'tax-basics' }]);

    const { default: sitemap } = await import('../sitemap');
    const entries = (await sitemap()) as MetadataRoute.Sitemap;

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: 'https://example.com/' }),
        expect.objectContaining({ url: 'https://example.com/privacy' }),
        expect.objectContaining({ url: 'https://example.com/install' }),
        expect.objectContaining({ url: 'https://example.com/blog/salary-guide', priority: 0.9 }),
        expect.objectContaining({ url: 'https://example.com/blog/category/tax-basics' }),
        expect.objectContaining({ url: 'https://example.com/alternatives/listentotaxman' }),
        expect.objectContaining({ url: 'https://example.com/scenarios' }),
        expect.objectContaining({ url: 'https://example.com/scenarios/tax-trap-100k' }),
        expect.objectContaining({ url: 'https://example.com/best-for/contractors' }),
        expect.objectContaining({ url: 'https://example.com/calculator/30000-after-tax' }),
      ]),
    );
  });

  it('falls back to default blog/category entries when data fetch fails', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

    getBlogPosts.mockRejectedValueOnce(new Error('blog fail'));
    getBlogCategories.mockRejectedValueOnce(new Error('category fail'));

    const { default: sitemap } = await import('../sitemap');
    const entries = (await sitemap()) as MetadataRoute.Sitemap;

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: 'https://example.com/blog/understanding-uk-tax-codes',
        }),
        expect.objectContaining({
          url: 'https://example.com/blog/category/tax-basics',
        }),
      ]),
    );
  });

  it('caps long-tail programmatic URLs for crawl-budget focus', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

    getBlogPosts.mockResolvedValue([]);
    getBlogCategories.mockResolvedValue([]);
    getAllCompetitorSlugs.mockReturnValue([
      'gov-uk-calculator',
      'salary-calculator',
      'listentotaxman',
      'moneysavingexpert',
      'xero-calculator',
      'sage-calculator',
      'quickbooks-calculator',
      'reed-calculator',
      'freelancer-calculator',
      'contractor-calculator',
      'taxscouts',
      'salarybot',
      'extra-1',
      'extra-2',
    ]);

    const { default: sitemap } = await import('../sitemap');
    const entries = (await sitemap()) as MetadataRoute.Sitemap;
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://example.com/calculator/30000-after-tax');
    expect(urls).toContain('https://example.com/calculator/57000-after-tax');
    expect(urls).toContain('https://example.com/calculator/78000-after-tax');
    expect(urls).not.toContain('https://example.com/calculator/19000-after-tax');
    expect(urls).not.toContain('https://example.com/calculator/104000-after-tax');
    expect(urls).not.toContain('https://example.com/calculator/275000-after-tax');
    expect(urls).not.toContain('https://example.com/calculator/370000-after-tax');

    const alternativesCount = urls.filter((url) => url.includes('/alternatives/')).length;
    expect(alternativesCount).toBeLessThanOrEqual(12);
    expect(urls.some((url) => url.includes('/vs/'))).toBe(false);
  });
});
