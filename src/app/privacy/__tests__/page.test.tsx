import { render, screen } from '@testing-library/react';
import PrivacyPage from '../page';

describe('PrivacyPage', () => {
  it('renders hero copy and last updated date', () => {
    render(<PrivacyPage />);

    expect(screen.getByText('Your Figures, Calculated')).toBeInTheDocument();
    expect(screen.getByText('In Your Browser')).toBeInTheDocument();
    expect(screen.getByText('Last updated: 27 October 2026')).toBeInTheDocument();
    expect(screen.getByText('tax-calculator-storage')).toBeInTheDocument();
    expect(screen.getByText('director-guide-storage')).toBeInTheDocument();
    expect(
      screen.getByText(/Calculator inputs are currently remembered automatically/),
    ).toBeInTheDocument();
  });

  it('renders the formal UK GDPR policy sections', () => {
    render(<PrivacyPage />);

    // Mandatory UK GDPR disclosures must be present.
    expect(screen.getByRole('heading', { name: /Who we are/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Data we process/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Third parties we rely on/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Your rights/i })).toBeInTheDocument();
    expect(screen.getByText('Support messages')).toBeInTheDocument();
    expect(screen.getByText('Cloudflare')).toBeInTheDocument();

    // Right to complain to the ICO.
    expect(screen.getByRole('link', { name: /ico\.org\.uk/i })).toHaveAttribute(
      'href',
      'https://ico.org.uk',
    );
  });
});
