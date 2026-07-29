import { CURRENT_TAX_GUIDANCE } from '@/constants/currentTaxGuidance';
import { getBlogCategories, getBlogPosts } from '@/lib/blog';
import { GET } from '../route';

jest.mock('@/lib/blog', () => ({
  getBlogPosts: jest.fn(),
  getBlogCategories: jest.fn(),
}));

describe('llms.txt route', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-11T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it('renders grouped blog sections with sanitized content', async () => {
    const longExcerpt = 'A'.repeat(160);

    (getBlogPosts as jest.Mock).mockResolvedValue([
      {
        slug: 'intro-tax',
        title: '[Tax] Basics',
        excerpt: longExcerpt,
        category: 'tax-basics',
      },
    ]);

    (getBlogCategories as jest.Mock).mockResolvedValue([
      { slug: 'tax-basics', name: 'Tax Basics' },
      { slug: 'empty', name: 'Empty' },
    ]);

    const response = await GET();
    const text = await response.text();

    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    expect(text).toContain('Last updated: 2026-06-11');
    expect(text).toContain('## Crawler Policy');
    expect(text).toContain('Search crawlers and AI crawlers are allowed.');
    expect(text).toContain('/_vercel/ remain disallowed in robots.txt');
    expect(text).toContain('## Citable PAYE Rates and Take-Home Examples');
    expect(text).toContain('Machine-readable dataset: /api/tax-rates');
    expect(text).not.toContain('/#tax-rates-and-take-home');
    expect(text).toContain('## Blog Posts - Tax Basics');
    expect(text).toContain('- [\\[Tax\\] Basics](https://payetax.co.uk/blog/intro-tax):');
    expect(text).toContain(`${longExcerpt.slice(0, 150)}...`);
    expect(text).not.toContain('## Blog Posts - Empty');
  });

  it('returns a valid response when blog data fetch fails', async () => {
    (getBlogPosts as jest.Mock).mockRejectedValue(new Error('blog fail'));
    (getBlogCategories as jest.Mock).mockRejectedValue(new Error('category fail'));

    const response = await GET();
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    expect(text).toContain('# PayeTax');
    expect(text).toContain('## Main Pages');
    expect(text).toContain('## Citable PAYE Rates and Take-Home Examples');
    expect(text).toContain('## Reviewed Current Tax Guidance');
    expect(text).toContain('No reviewed guidance entries are currently available.');
  });

  it('highlights every current guide with its dedicated review date', async () => {
    (getBlogPosts as jest.Mock).mockResolvedValue(
      CURRENT_TAX_GUIDANCE.map(({ slug }, index) => ({
        slug,
        title: `Current guide: ${slug}`,
        excerpt: 'Current PAYE guidance.',
        category: 'tax-basics',
        publishedAt: '2025-01-15',
        updatedAt: '2026-08-01',
        canonicalUrl:
          index === 0 ? 'https://payetax.co.uk/blog/canonical-current-guide' : undefined,
      })),
    );
    (getBlogCategories as jest.Mock).mockResolvedValue([
      { slug: 'tax-basics', name: 'Tax Basics' },
    ]);

    const response = await GET();
    const text = await response.text();

    expect(text).toContain('## Reviewed Current Tax Guidance');
    for (const [index, { slug, reviewedAt }] of CURRENT_TAX_GUIDANCE.entries()) {
      const expectedUrl =
        index === 0
          ? 'https://payetax.co.uk/blog/canonical-current-guide'
          : `https://payetax.co.uk/blog/${slug}`;
      expect(text).toContain(
        `- [Current guide: ${slug}](${expectedUrl}) (reviewed ${reviewedAt}): Current PAYE guidance.`,
      );
    }
    expect(text).not.toContain('(reviewed 2026-08-01)');
  });
});
