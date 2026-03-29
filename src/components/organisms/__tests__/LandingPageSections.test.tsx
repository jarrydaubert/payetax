import { render, screen } from '@/test/testing-library';

import LandingPageSections from '../LandingPageSections';

describe('LandingPageSections', () => {
  it('renders major landing sections', () => {
    render(<LandingPageSections />);

    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('For Directors')).toBeInTheDocument();
  });

  it('renders proof strip with verification date and links', () => {
    render(<LandingPageSections />);

    expect(screen.getByText(/HMRC rates verified/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute(
      'href',
      '/privacy',
    );
    expect(screen.getByRole('link', { name: 'Compliance' })).toHaveAttribute('href', '/compliance');
  });

  it('renders director spotlight with CTA', () => {
    render(<LandingPageSections />);

    const directorLink = screen.getByRole('link', { name: /Open Director Intelligence/i });
    expect(directorLink).toHaveAttribute('href', '/tools/director-guide');
  });

  it('includes offline availability FAQ entry', () => {
    render(<LandingPageSections />);
    expect(screen.getByText('Can I use PayeTax offline?')).toBeInTheDocument();
  });
});
