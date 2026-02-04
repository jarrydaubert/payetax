import { render, screen } from '@/test/testing-library';

import { BlogNav } from '../BlogNav';

describe('BlogNav', () => {
  it('marks the All Articles link as current when no active group', () => {
    render(<BlogNav />);

    const allLink = screen.getByRole('link', { name: 'All Articles' });
    expect(allLink).toHaveAttribute('href', '/blog');
    expect(allLink).toHaveAttribute('aria-current', 'page');
  });

  it('marks the active group link as current', () => {
    render(<BlogNav activeGroup='news' />);

    const allLink = screen.getByRole('link', { name: 'All Articles' });
    expect(allLink).not.toHaveAttribute('aria-current');

    const newsLink = screen.getByRole('link', { name: 'News' });
    expect(newsLink).toHaveAttribute('href', '/blog/category/news');
    expect(newsLink).toHaveAttribute('aria-current', 'page');
  });
});
