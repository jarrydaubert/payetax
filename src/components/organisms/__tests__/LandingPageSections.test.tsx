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
    expect(screen.getByText('Can I use it offline?')).toBeInTheDocument();
  });

  it('explains pension support limits with a link to official guidance', () => {
    render(<LandingPageSections />);
    expect(
      screen.getByText(/Choose salary sacrifice or net pay to match your pension scheme/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Relief at source requires a separate calculation/),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pension arrangements explained' })).toHaveAttribute(
      'href',
      'https://www.gov.uk/workplace-pensions/managing-your-pension',
    );
  });

  it('renders the tools directory linking to every tool', () => {
    render(<LandingPageSections />);

    expect(screen.getByText('Go deeper than take-home')).toBeInTheDocument();
    expect(screen.getByTestId('home-tool-director-guide')).toHaveAttribute(
      'href',
      '/tools/director-guide',
    );
    expect(screen.getByTestId('home-tool-tax-code-decoder')).toBeInTheDocument();
    expect(screen.getByTestId('home-tool-scottish-tax-calculator')).toBeInTheDocument();
    expect(screen.getByTestId('home-tool-national-insurance-calculator')).toBeInTheDocument();
    expect(screen.getByTestId('home-tool-marriage-allowance-calculator')).toBeInTheDocument();
  });

  it('shows the corrected annual salary-sacrifice example in the homepage FAQ', () => {
    render(<LandingPageSections />);

    // HMRC 2026/27: both salaries are in the 20% Income Tax and 8% category A NI bands.
    // £50,000 × 5% = £2,500. Income Tax falls £500 and employee NI falls £200.
    const example = screen.getByText(/£50,000 a year.*5%/);
    expect(example).toHaveTextContent('2026/27');
    expect(example).toHaveTextContent(
      /£2,500.*£500 in Income Tax.*£200 in employee National Insurance.*£1,800/,
    );
  });
});
