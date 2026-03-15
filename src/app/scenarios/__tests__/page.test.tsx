import { render, screen } from '@testing-library/react';
import { SCENARIOS } from '@/data/scenarios';
import ScenariosPage from '../page';

describe('ScenariosPage', () => {
  it('renders the scenarios hero and quick stats', () => {
    render(<ScenariosPage />);

    expect(screen.getByText('Tax Scenarios')).toBeInTheDocument();
    expect(screen.getByText('Scenarios')).toBeInTheDocument();
    expect(screen.getByText(SCENARIOS.length.toString())).toBeInTheDocument();
    expect(screen.getByText('Tax Year')).toBeInTheDocument();
  });

  it('renders best-for audience links alongside the scenarios hub', () => {
    render(<ScenariosPage />);

    expect(screen.getByText('Find the Right Calculator by Situation')).toBeInTheDocument();
    expect(screen.getByTestId('best-for-link-contractors')).toHaveAttribute(
      'href',
      '/best-for/contractors',
    );
    expect(screen.getByTestId('best-for-link-pensioners')).toHaveAttribute(
      'href',
      '/best-for/pensioners',
    );
  });
});
