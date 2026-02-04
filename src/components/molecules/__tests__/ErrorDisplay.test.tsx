import { fireEvent, render, screen } from '@/test/testing-library';

import { ErrorDisplay } from '../ErrorDisplay';

describe('ErrorDisplay', () => {
  it('renders default content and triggers reset', () => {
    const reset = jest.fn();

    render(<ErrorDisplay errorId='error-12345678' reset={reset} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/Error ID: 12345678/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);

    const homeLink = screen.getByRole('link', { name: /Go home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
