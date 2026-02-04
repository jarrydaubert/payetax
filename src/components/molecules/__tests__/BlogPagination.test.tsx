import { render, screen } from '@/test/testing-library';

import { BlogPagination } from '../BlogPagination';

describe('BlogPagination', () => {
  it('renders nothing when only one page', () => {
    const { container } = render(<BlogPagination currentPage={1} totalPages={1} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders prev/next links and ellipses for large page ranges', () => {
    render(<BlogPagination currentPage={5} totalPages={10} scrollToId='all-posts-heading' />);

    expect(screen.getByRole('link', { name: /Prev/i })).toHaveAttribute(
      'href',
      '/blog?page=4#all-posts-heading',
    );
    expect(screen.getByRole('link', { name: /Next/i })).toHaveAttribute(
      'href',
      '/blog?page=6#all-posts-heading',
    );

    // Should render ellipses when gaps exist
    expect(screen.getAllByText('…').length).toBeGreaterThan(0);

    // Current page has aria-current
    expect(screen.getByRole('link', { name: '5' })).toHaveAttribute('aria-current', 'page');
  });

  it('disables prev link on first page', () => {
    render(<BlogPagination currentPage={1} totalPages={3} />);

    expect(screen.queryByRole('link', { name: /Prev/i })).not.toBeInTheDocument();
    expect(screen.getByText('Prev')).toHaveAttribute('aria-disabled', 'true');
  });
});
