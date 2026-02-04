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
        expect.objectContaining({ url: 'https://example.com/blog/salary-guide', priority: 0.9 }),
        expect.objectContaining({ url: 'https://example.com/blog/category/tax-basics' }),
        expect.objectContaining({ url: 'https://example.com/alternatives/listentotaxman' }),
        expect.objectContaining({ url: 'https://example.com/vs/listentotaxman' }),
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
});
