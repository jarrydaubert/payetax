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
});
