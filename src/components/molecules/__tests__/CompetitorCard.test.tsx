import { render, screen } from '@/test/testing-library';

import { CompetitorCard, PayeTaxCard } from '../CompetitorCard';
import type { Competitor } from '@/data/competitors';

const competitor: Competitor = {
  slug: 'example',
  name: 'Example Competitor',
  shortName: 'Example',
  url: 'https://example.com',
  description: 'Example description',
  strengths: ['Fast', 'Accurate'],
  weaknesses: ['Limited'],
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
  payeTaxAdvantages: ['Better UI', 'More features'],
  bestFor: ['Simple cases'],
};

describe('CompetitorCard', () => {
  it('renders competitor details and links', () => {
    render(
      <CompetitorCard
        competitor={competitor}
        showAdvantages
        showCompareLink
        featured
        linkVariant='alternatives'
      />,
    );

    expect(screen.getByText('Example Competitor')).toBeInTheDocument();
    expect(screen.getByText('Top Pick')).toBeInTheDocument();
    expect(screen.getByText('Why PayeTax is Better')).toBeInTheDocument();

    const compareLink = screen.getByRole('link', { name: /Full comparison/i });
    expect(compareLink).toHaveAttribute('href', '/alternatives/example');

    const visitLink = screen.getByRole('link', { name: /Visit site/i });
    expect(visitLink).toHaveAttribute('href', 'https://example.com');
  });

  it('renders the PayeTax highlight card', () => {
    render(<PayeTaxCard />);

    expect(screen.getByText('PayeTax')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Try PayeTax now/i });
    expect(link).toHaveAttribute('href', '/');
  });
});
