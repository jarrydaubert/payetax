jest.mock('@/lib/blog', () => ({
  getBlogPostsCount: jest.fn().mockResolvedValue(30),
}));

describe('blog metadata', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('uses evergreen source-backed copy rather than stale tax-year wording', async () => {
    const { generateMetadata } = await import('../page');

    const metadata = await generateMetadata({
      searchParams: Promise.resolve({}),
    });

    expect(metadata.description).toContain('official HMRC rates');
    expect(metadata.description).toContain('financial-year explainers');
    expect(metadata.description).not.toContain('2025-26');
    expect(metadata.description).not.toContain('qualified experts');
  });
});
