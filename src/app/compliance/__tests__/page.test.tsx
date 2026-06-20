import { render, screen } from '@testing-library/react';
import CompliancePage from '../page';

describe('CompliancePage', () => {
  it('renders the compliance hero and contact footer', () => {
    render(<CompliancePage />);

    expect(screen.getByText('Official HMRC')).toBeInTheDocument();
    expect(screen.getByText('Tax Rates & Compliance')).toBeInTheDocument();
    expect(screen.getByText('Questions About Compliance?')).toBeInTheDocument();
  });

  it('renders source review notes and visible repository proof', () => {
    render(<CompliancePage />);

    expect(screen.getByText('Recent Source Checks')).toBeInTheDocument();
    expect(screen.getByText('GOV.UK employer rates update checked')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View repository/i })).toHaveAttribute(
      'href',
      'https://github.com/jarrydaubert/payetax',
    );
  });
});
