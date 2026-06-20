import { render, screen } from '@testing-library/react';
import ToolsPage from '../page';

describe('ToolsPage', () => {
  it('renders the tools list with key links', () => {
    render(<ToolsPage />);

    expect(screen.getByText('Free UK Tax Tools')).toBeInTheDocument();
    expect(screen.getByTestId('tools-link-director-guide')).toBeInTheDocument();
    expect(screen.getByTestId('tools-link-tax-code-decoder')).toBeInTheDocument();
    expect(screen.getByTestId('tools-link-national-insurance-calculator')).toBeInTheDocument();
  });

  it('renders crawlable chooser and limit copy', () => {
    render(<ToolsPage />);

    expect(screen.getByText('Which PayeTax tool should I use?')).toBeInTheDocument();
    expect(screen.getByText('Current coverage and limits')).toBeInTheDocument();
    expect(screen.getByText('Does not cover')).toBeInTheDocument();
    expect(
      screen.getByText('Are the tools a replacement for payroll software?'),
    ).toBeInTheDocument();
  });

  it('does not render removed audience-marketing links', () => {
    render(<ToolsPage />);

    expect(screen.queryByText('Choose a Tax Calculator by Situation')).not.toBeInTheDocument();
    expect(screen.queryByText(/HMRC Updates/i)).not.toBeInTheDocument();
  });
});
