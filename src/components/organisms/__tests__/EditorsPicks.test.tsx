import { render, screen } from '@/test/testing-library';

import { EditorsPicks } from '../EditorsPicks';
import type { BlogPost } from '@/types/blog';

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

    expect(screen.getAllByText("Editor's Picks").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(5);
    expect(screen.getAllByText('01').length).toBeGreaterThanOrEqual(2);
  });

  it('renders a mobile summary element for the accordion', () => {
    const posts = [1].map((index) => makePost(index));

    const { container } = render(<EditorsPicks posts={posts} />);

    const summary = container.querySelector(
      "summary[aria-label=\"Toggle Editor's Picks section\"]",
    );
    expect(summary).toBeInTheDocument();
  });
});
