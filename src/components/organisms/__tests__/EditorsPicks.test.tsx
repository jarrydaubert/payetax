import { render, screen } from '@/test/testing-library';
import type { BlogPost } from '@/types/blog';
import { EditorsPicks } from '../EditorsPicks';

const makePost = (index: number): BlogPost => ({
  id: `post-${index}`,
  title: `Post ${index}`,
  slug: `post-${index}`,
  excerpt: `Excerpt ${index}`,
  publishedAt: '2026-02-01',
  category: 'tax-basics',
  content: 'Body',
  readTime: '3 min read',
});

describe('EditorsPicks', () => {
  it('renders list of picks with numbering', () => {
    const posts = [1, 2, 3, 4, 5].map((index) => makePost(index));

    render(<EditorsPicks posts={posts} />);

    expect(screen.getByRole('complementary', { name: /editor's picks/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: "Editor's Picks" })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText('01')).toBeInTheDocument();
  });

  it('renders picks once rather than duplicating responsive copies', () => {
    const posts = [1].map((index) => makePost(index));

    const { container } = render(<EditorsPicks posts={posts} />);

    expect(container.querySelectorAll('aside[aria-label="Editor\'s picks"]')).toHaveLength(1);
    expect(container.querySelector('details')).not.toBeInTheDocument();
  });
});
