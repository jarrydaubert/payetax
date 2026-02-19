import { render, screen } from '@testing-library/react';
import PrivacyPage from '../page';

describe('PrivacyPage', () => {
  it('renders hero copy and last updated date', () => {
    render(<PrivacyPage />);

    expect(screen.getByText('Your Data Stays')).toBeInTheDocument();
    expect(screen.getByText('In Your Browser')).toBeInTheDocument();
    expect(screen.getByText('Last updated: February 19, 2026')).toBeInTheDocument();
  });
});
