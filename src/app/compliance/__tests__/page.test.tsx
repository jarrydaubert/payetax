import { render, screen } from '@testing-library/react';
import CompliancePage from '../page';

describe('CompliancePage', () => {
  it('renders the compliance hero and contact footer', () => {
    render(<CompliancePage />);

    expect(screen.getByText('Official HMRC')).toBeInTheDocument();
    expect(screen.getByText('Tax Rates & Compliance')).toBeInTheDocument();
    expect(screen.getByText('Questions About Compliance?')).toBeInTheDocument();
  });
});
