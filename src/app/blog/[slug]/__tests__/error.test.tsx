import { fireEvent, render, screen } from '@/test/testing-library';

import BlogPostError from '../error';

describe('BlogPostError', () => {
  it('renders error UI and allows retry', () => {
    const reset = jest.fn();
    render(<BlogPostError error={new Error('Boom')} reset={reset} />);

    expect(screen.getByText('Article not available')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));
    expect(reset).toHaveBeenCalled();

    expect(screen.getByText(/Error ID:/i)).toBeInTheDocument();
  });
});
