import { fireEvent, render, screen } from '@/test/testing-library';

import ToolsError from '../error';

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

describe('ToolsError', () => {
  it('renders error UI and allows retry', () => {
    const reset = jest.fn();
    render(<ToolsError error={new Error('Boom')} reset={reset} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));
    expect(reset).toHaveBeenCalled();

    expect(screen.getByText(/Error ID:/i)).toBeInTheDocument();
  });
});
