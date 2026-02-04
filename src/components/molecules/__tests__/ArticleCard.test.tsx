import { render, screen } from '@/test/testing-library';
import type { BlogPost } from '@/types/blog';
import { ArticleCardDeepDive, ArticleCardLarge, ArticleCardSmall } from '../ArticleCard';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt = '',
    src = '',
    fill: _fill,
    priority: _priority,
    blurDataURL: _blurDataURL,
  }: {
    alt?: string;
    src?: string;
    fill?: boolean;
    priority?: boolean;
    blurDataURL?: string;
  }) => (
    // biome-ignore lint/performance/noImgElement: test mock for next/image
    <img alt={alt} src={src} />
  ),
}));

const makePost = (overrides: Partial<BlogPost> = {}): BlogPost => ({
  id: overrides.id ?? 'post-1',
  title: overrides.title ?? 'Test Post',
  slug: overrides.slug ?? 'test-post',
  excerpt: overrides.excerpt ?? 'Short summary',
  publishedAt: overrides.publishedAt ?? '2026-02-01',
  category: overrides.category ?? 'tax-basics',
  content: overrides.content ?? 'Body',
  readTime: overrides.readTime ?? '5 min read',
  ...overrides,
});

describe('ArticleCard variants', () => {
  it('renders a large card with link and category badge', () => {
    const post = makePost({ title: 'Large Card Title' });

    render(<ArticleCardLarge post={post} priority />);

    const link = screen.getByRole('link', { name: /Large Card Title/i });
    expect(link).toHaveAttribute('href', '/blog/test-post');
    expect(screen.getByText('Tax Basics')).toBeInTheDocument();
  });

  it('renders a small card with compact meta', () => {
    const post = makePost({ title: 'Small Card Title' });

    render(<ArticleCardSmall post={post} />);

    expect(screen.getByRole('link', { name: /Small Card Title/i })).toHaveAttribute(
      'href',
      '/blog/test-post',
    );
    expect(screen.getByText('5 min read')).toBeInTheDocument();
  });

  it('falls back to Tax Basics for invalid category', () => {
    const post = makePost({ category: 'unknown-category' });

    render(<ArticleCardDeepDive post={post} />);

    expect(screen.getByText('Tax Basics')).toBeInTheDocument();
  });
});
