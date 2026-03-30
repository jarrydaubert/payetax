import { render, screen } from '@testing-library/react';
import BestUKTaxCalculatorsPage from '../page';

describe('BestUKTaxCalculatorsPage', () => {
  it('renders comparison page headings', () => {
    render(<BestUKTaxCalculatorsPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /UK Tax Calculators/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('At-a-Glance Comparison')).toBeInTheDocument();
  });

  it('uses the canonical alternatives route for direct comparison links', () => {
    render(<BestUKTaxCalculatorsPage />);

    const comparisonLink = screen.getAllByRole('link', {
      name: /^PayeTax vs /i,
    })[0];

    expect(comparisonLink).toBeDefined();
    expect(comparisonLink).toHaveAttribute('href', expect.stringMatching(/^\/alternatives\//));
  });
});
