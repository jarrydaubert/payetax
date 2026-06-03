import { render, screen } from '@/test/testing-library';

import LandingPageSections from '../LandingPageSections';

describe('LandingPageSections', () => {
  it('renders the retained supporting sections', () => {
    render(<LandingPageSections />);

    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText(/HMRC rates verified/)).toBeInTheDocument();
  });

  it('does not render removed promotional sections', () => {
    render(<LandingPageSections />);

    expect(screen.queryByText('How It Works')).not.toBeInTheDocument();
    expect(screen.queryByText('Features')).not.toBeInTheDocument();
    expect(screen.queryByText('For Directors')).not.toBeInTheDocument();
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

  it('includes offline availability FAQ entry', () => {
    render(<LandingPageSections />);
    expect(screen.getByText('Can I use PayeTax offline?')).toBeInTheDocument();
  });
});
