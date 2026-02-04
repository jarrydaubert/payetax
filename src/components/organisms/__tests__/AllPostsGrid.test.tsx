import { render, screen } from '@testing-library/react';

import { AllPostsGrid } from '../AllPostsGrid';
import type { BlogPost } from '@/types/blog';

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
    // eslint-disable-next-line @next/next/no-img-element
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
});
