import { render, screen } from '@testing-library/react';

import { LatestArticles } from '../LatestArticles';
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

const makePost = (index: number): BlogPost => ({
  id: `post-${index}`,
  title: `Post ${index}`,
  slug: `post-${index}`,
  excerpt: `Excerpt ${index}`,
  publishedAt: `2026-02-${String(index).padStart(2, '0')}`,
  category: 'tax-basics',
  content: 'Body',
  readTime: '4 min read',
});

describe('LatestArticles', () => {
  it('renders list semantics for featured and small posts', () => {
    const posts = [1, 2, 3, 4, 5, 6].map((index) => makePost(index));

    render(<LatestArticles posts={posts} />);

    const lists = screen.getAllByRole('list');
    expect(lists).toHaveLength(1);

    // Featured + 4 small posts
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });
});
