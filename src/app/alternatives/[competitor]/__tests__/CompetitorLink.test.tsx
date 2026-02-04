import type { Competitor } from '@/data/competitors';
import { render, screen } from '@/test/testing-library';
import { CompetitorLink } from '../CompetitorLink';

const competitor: Competitor = {
  slug: 'example',
  name: 'Example Competitor',
  shortName: 'Example',
  url: 'https://example.com',
  affiliateUrl: 'https://aff.example.com',
  affiliateProgram: 'Program',
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

describe('CompetitorLink', () => {
  it('renders the visit link and disclosure', () => {
    render(<CompetitorLink competitor={competitor} />);

    expect(screen.getByRole('link', { name: /Visit Example/i })).toHaveAttribute(
      'href',
      'https://aff.example.com',
    );

    expect(screen.getByText(/External link. May be an affiliate link./i)).toBeInTheDocument();
  });
});
