import { render, screen } from '@testing-library/react';
import AlternativesIndexPage from '../page';

describe('AlternativesIndexPage', () => {
  it('renders the alternatives overview sections', () => {
    render(<AlternativesIndexPage />);

    expect(screen.getByText('Calculator Alternatives')).toBeInTheDocument();
    expect(screen.getByText('Common Frustrations with Tax Calculators')).toBeInTheDocument();
  });
});
