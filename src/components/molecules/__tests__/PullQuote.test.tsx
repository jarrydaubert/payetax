import { render, screen } from '@/test/testing-library';

import { PullQuote } from '../PullQuote';

describe('PullQuote', () => {
  it('renders quote text and attribution', () => {
    render(<PullQuote text='Great calculators save time.' attribution='Tax Pro' />);

    expect(screen.getByRole('note')).toBeInTheDocument();
    expect(screen.getByText(/Great calculators save time./i)).toBeInTheDocument();
    expect(screen.getByText('— Tax Pro')).toBeInTheDocument();
  });
});
