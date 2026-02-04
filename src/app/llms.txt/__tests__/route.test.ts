import { GET } from '../route';
import { getBlogCategories, getBlogPosts } from '@/lib/blog';

jest.mock('@/lib/blog', () => ({
  getBlogPosts: jest.fn(),
  getBlogCategories: jest.fn(),
}));

describe('llms.txt route', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-02-03T12:00:00Z'));
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
    expect(text).toContain('Last updated: 2026-02-03');
    expect(text).toContain('## Blog Posts - Tax Basics');
    expect(text).toContain('- [\\[Tax\\] Basics](https://payetax.co.uk/blog/intro-tax):');
    expect(text).toContain(`${longExcerpt.slice(0, 150)}...`);
    expect(text).not.toContain('## Blog Posts - Empty');
  });
});
