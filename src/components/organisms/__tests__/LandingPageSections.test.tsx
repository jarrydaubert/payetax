import { render, screen } from '@/test/testing-library';

import LandingPageSections from '../LandingPageSections';

describe('LandingPageSections', () => {
  it('renders major landing sections', () => {
    render(<LandingPageSections />);

    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();

    const ctaLink = screen.getByRole('link', { name: /Show My Take Home Pay/i });
    expect(ctaLink).toHaveAttribute('href', '#tax-calculator');
  });
});
