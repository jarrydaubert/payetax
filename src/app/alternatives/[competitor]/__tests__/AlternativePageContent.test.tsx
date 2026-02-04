import { render, screen } from '@testing-library/react';
import { COMPETITORS } from '@/data/competitors';
import { AlternativePageContent } from '../AlternativePageContent';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('AlternativePageContent', () => {
  it('renders competitor-specific copy and comparison section', () => {
    const competitor = COMPETITORS[0];
    if (!competitor) throw new Error('Missing competitor fixture');

    render(<AlternativePageContent competitor={competitor} />);

    expect(
      screen.getByText(`Why People Search for ${competitor.shortName} Alternatives`),
    ).toBeInTheDocument();
    expect(screen.getByText('Feature Comparison')).toBeInTheDocument();
    expect(screen.getByText(competitor.name)).toBeInTheDocument();
  });

  it('omits the advantages section when none are provided', () => {
    const competitor = COMPETITORS[0];
    if (!competitor) throw new Error('Missing competitor fixture');

    render(
      <AlternativePageContent
        competitor={{
          ...competitor,
          payeTaxAdvantages: [],
        }}
      />,
    );

    expect(
      screen.queryByText(`Why Choose PayeTax Over ${competitor.shortName}`),
    ).not.toBeInTheDocument();
  });
});
