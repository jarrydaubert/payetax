import { render, screen } from '@testing-library/react';
import type { BlogPost } from '@/types/blog';
import { AllPostsGrid } from '../AllPostsGrid';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt = '',
    src = '',
    fill: _fill,
    priority: _priority,
    blurDataURL: _blurDataURL,
    ...props
  }: {
    alt?: string;
    src?: string;
    fill?: boolean;
    priority?: boolean;
    blurDataURL?: string;
  }) => (
    // biome-ignore lint/performance/noImgElement: test mock for next/image
    <img alt={alt} src={src} {...props} />
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

describe('AllPostsGrid', () => {
  it('renders empty state when no posts', () => {
    render(<AllPostsGrid posts={[]} currentPage={1} totalPages={1} totalPosts={0} />);

    expect(screen.getByText('No articles found.')).toBeInTheDocument();
  });

  it('renders list semantics for posts', () => {
    const posts = [
      makePost({ id: 'post-1', slug: 'post-1', title: 'First' }),
      makePost({ id: 'post-2', slug: 'post-2', title: 'Second' }),
    ];

    render(<AllPostsGrid posts={posts} currentPage={1} totalPages={2} totalPosts={2} />);

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('keeps pagination anchored to all-posts heading', () => {
    const posts = [makePost({ id: 'post-1', slug: 'post-1', title: 'First' })];

    render(<AllPostsGrid posts={posts} currentPage={1} totalPages={2} totalPosts={2} />);

    expect(screen.getByRole('link', { name: /Next/i })).toHaveAttribute(
      'href',
      '/blog?page=2#all-posts-heading',
    );
  });

});
