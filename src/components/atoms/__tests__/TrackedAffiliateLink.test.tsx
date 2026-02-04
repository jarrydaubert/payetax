import { fireEvent, render, screen } from '@/test/testing-library';

import { TrackedAffiliateLink } from '../TrackedAffiliateLink';
import type { Competitor } from '@/data/competitors';

const trackAffiliateClick = jest.fn();

jest.mock('@/lib/analytics', () => ({
  trackAffiliateClick: (...args: unknown[]) => trackAffiliateClick(...args),
}));

const baseCompetitor: Competitor = {
  slug: 'test-competitor',
  name: 'Test Competitor',
  shortName: 'Test',
  url: 'https://example.com',
  affiliateUrl: 'https://aff.example.com',
  affiliateProgram: 'Test Program',
  description: 'Test description',
  strengths: ['One'],
  weaknesses: ['Two'],
  features: {
    takeHomePay: true,
    scottishRates: false,
    studentLoans: false,
    pension: false,
    whatIf: false,
    mobileFirst: false,
    adFree: false,
    historicYears: false,
  },
  payeTaxAdvantages: ['Advantage'],
  bestFor: ['Best for'],
};

describe('TrackedAffiliateLink', () => {
  it('uses affiliate url and tracks clicks', () => {
    render(
      <TrackedAffiliateLink competitor={baseCompetitor} pageType='hub'>
        Visit site
      </TrackedAffiliateLink>,
    );

    const link = screen.getByRole('link', { name: /Visit site/i });
    expect(link).toHaveAttribute('href', 'https://aff.example.com');
    expect(link).toHaveAttribute('rel', 'nofollow noopener noreferrer sponsored');

    fireEvent.click(link);
    expect(trackAffiliateClick).toHaveBeenCalledWith(
      'test-competitor',
      'Test Competitor',
      'Test Program',
      'hub',
    );
  });

  it('falls back to standard url when no affiliate program', () => {
    const noAffiliate = { ...baseCompetitor, affiliateUrl: undefined, affiliateProgram: undefined };

    render(
      <TrackedAffiliateLink competitor={noAffiliate} pageType='vs'>
        Visit site
      </TrackedAffiliateLink>,
    );

    const link = screen.getByRole('link', { name: /Visit site/i });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
