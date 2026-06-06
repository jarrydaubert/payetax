import { fireEvent, render, screen } from '@/test/testing-library';

import ToolsError from '../error';

const captureException = jest.fn();

jest.mock('@sentry/nextjs', () => ({
  captureException: (...args: unknown[]) => captureException(...args),
}));

describe('ToolsError', () => {
  beforeEach(() => {
    captureException.mockClear();
    window.history.pushState({}, '', '/tools/tax-code-decoder');
  });

  it('renders error UI and allows retry', () => {
    const reset = jest.fn();
    render(<ToolsError error={new Error('Boom')} reset={reset} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));
    expect(reset).toHaveBeenCalled();

    expect(screen.getByText(/Error ID:/i)).toBeInTheDocument();
  });

  it('does not report non-director tool errors to Sentry', () => {
    render(<ToolsError error={new Error('Boom')} reset={jest.fn()} />);

    expect(captureException).not.toHaveBeenCalled();
  });

  it('reports Director Intelligence errors to Sentry', () => {
    window.history.pushState({}, '', '/tools/director-guide');

    render(<ToolsError error={new Error('Boom')} reset={jest.fn()} />);

    expect(captureException).toHaveBeenCalled();
  });
});
