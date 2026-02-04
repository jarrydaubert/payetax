import { render, screen } from '@testing-library/react';
import type { BlogPost } from '@/types/blog';
import { DeepDives } from '../DeepDives';

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

const makePost = (index: number): BlogPost => ({
  id: `post-${index}`,
  title: `Post ${index}`,
  slug: `post-${index}`,
  excerpt: `Excerpt ${index}`,
  publishedAt: `2026-02-${String(index).padStart(2, '0')}`,
  category: 'tax-basics',
  content: 'Body',
  readTime: '6 min read',
});

describe('DeepDives', () => {
  it('renders up to 6 posts with list semantics', () => {
    const posts = [1, 2, 3, 4, 5, 6, 7].map((index) => makePost(index));

    render(<DeepDives posts={posts} />);

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
  });
});
