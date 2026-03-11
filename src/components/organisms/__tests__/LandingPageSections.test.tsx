import { render, screen } from '@/test/testing-library';

import LandingPageSections from '../LandingPageSections';

describe('LandingPageSections', () => {
  it('renders major landing sections', () => {
    render(<LandingPageSections />);

    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Trust')).toBeInTheDocument();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();

    const ctaLink = screen.getByRole('link', { name: /Show My Take Home Pay/i });
    expect(ctaLink).toHaveAttribute('href', '#tax-calculator');
  });

  it('includes offline availability FAQ entry', () => {
    render(<LandingPageSections />);
    expect(screen.getByText('Can I use PayeTax offline?')).toBeInTheDocument();
  });

  it('includes high-intent FAQ links', () => {
    render(<LandingPageSections />);

    expect(screen.getByText('How much tax do I pay on £30,000?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '£30,000 after tax' })).toHaveAttribute(
      'href',
      '/calculator/30000-after-tax',
    );
  });

  it('includes best-for audience links on the homepage', () => {
    render(<LandingPageSections />);

    expect(screen.getByText('Find the Right Starting Point')).toBeInTheDocument();
    expect(screen.getByTestId('best-for-link-contractors')).toHaveAttribute(
      'href',
      '/best-for/contractors',
    );
    expect(screen.getByTestId('best-for-link-students')).toHaveAttribute(
      'href',
      '/best-for/students',
    );
  });
});
