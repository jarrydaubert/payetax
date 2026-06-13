import { render, screen } from '@testing-library/react';
import PrivacyPage from '../page';

describe('PrivacyPage', () => {
  it('renders hero copy and last updated date', () => {
    render(<PrivacyPage />);

    expect(screen.getByText('Your Tax Data Stays')).toBeInTheDocument();
    expect(screen.getByText('On Your Device')).toBeInTheDocument();
    expect(screen.getByText('Last updated: 13 June 2026')).toBeInTheDocument();
  });

  it('renders the formal UK GDPR policy sections', () => {
    render(<PrivacyPage />);

    // Mandatory UK GDPR disclosures must be present.
    expect(screen.getByRole('heading', { name: /Who we are/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Data we process/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Third parties we rely on/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Your rights/i })).toBeInTheDocument();

    // Right to complain to the ICO.
    expect(screen.getByRole('link', { name: /ico\.org\.uk/i })).toHaveAttribute(
      'href',
      'https://ico.org.uk',
    );
  });
});
