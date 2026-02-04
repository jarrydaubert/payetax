import { fireEvent, render, screen } from '@/test/testing-library';

import CalculatorError from '../error';

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

describe('CalculatorError', () => {
  it('renders error UI and allows retry', () => {
    const reset = jest.fn();
    render(<CalculatorError error={new Error('Boom')} reset={reset} />);

    expect(screen.getByText('Calculation error')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));
    expect(reset).toHaveBeenCalled();
  });
});
