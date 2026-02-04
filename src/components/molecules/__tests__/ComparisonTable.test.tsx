import type { Competitor } from '@/data/competitors';
import { render, screen } from '@/test/testing-library';
import { ComparisonTable, TwoColumnComparison } from '../ComparisonTable';

const competitor: Competitor = {
  slug: 'example',
  name: 'Example',
  shortName: 'Example',
  url: 'https://example.com',
  description: 'Example description',
  strengths: ['One'],
  weaknesses: ['Two'],
  features: {
    takeHomePay: true,
    scottishRates: false,
    studentLoans: true,
    pension: false,
    whatIf: false,
    mobileFirst: false,
    adFree: false,
    historicYears: false,
  },
  verification: { status: 'needs-review', lastVerified: null },
  payeTaxAdvantages: ['Advantage'],
  bestFor: ['Best for'],
};

describe('ComparisonTable', () => {
  it('renders headers and feature rows', () => {
    render(
      <ComparisonTable
        competitors={[competitor]}
        features={['takeHomePay', 'scottishRates']}
        highlightPayeTax
      />,
    );

    expect(screen.getByText('Feature')).toBeInTheDocument();
    expect(screen.getByText('PayeTax')).toBeInTheDocument();
    expect(screen.getByText('Example')).toBeInTheDocument();

    expect(screen.getByText('Take-Home Pay')).toBeInTheDocument();
    expect(screen.getByText('Scottish Tax Rates')).toBeInTheDocument();
  });

  it('renders two-column comparison', () => {
    render(<TwoColumnComparison competitor={competitor} />);

    expect(screen.getByText('PayeTax')).toBeInTheDocument();
    expect(screen.getByText('Example')).toBeInTheDocument();
  });
});
