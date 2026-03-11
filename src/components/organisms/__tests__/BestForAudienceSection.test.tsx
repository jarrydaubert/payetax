import { USE_CASES } from '@/data/useCases';
import { render, screen } from '@/test/testing-library';
import { BestForAudienceSection } from '../BestForAudienceSection';

describe('BestForAudienceSection', () => {
  it('renders links for every best-for use case', () => {
    render(<BestForAudienceSection />);

    for (const useCase of USE_CASES) {
      expect(screen.getByTestId(`best-for-link-${useCase.slug}`)).toHaveAttribute(
        'href',
        `/best-for/${useCase.slug}`,
      );
    }
  });

  it('renders the provided heading copy', () => {
    render(
      <BestForAudienceSection
        title='Choose a Tax Calculator by Situation'
        subtitle='Audience-specific entry points for common PAYE scenarios.'
      />,
    );

    expect(screen.getByText('Choose a Tax Calculator by Situation')).toBeInTheDocument();
    expect(
      screen.getByText('Audience-specific entry points for common PAYE scenarios.'),
    ).toBeInTheDocument();
  });
});
