import { render, screen } from '@testing-library/react';
import ToolsPage from '../page';

describe('ToolsPage', () => {
  it('renders tools list with key links', () => {
    render(<ToolsPage />);

    expect(screen.getByText('Free UK Tax')).toBeInTheDocument();
    expect(screen.getByTestId('tools-link-director-guide')).toBeInTheDocument();
    expect(screen.getByTestId('tools-link-tax-code-decoder')).toBeInTheDocument();
  });

  it('renders best-for audience links alongside the tools hub', () => {
    render(<ToolsPage />);

    expect(screen.getByText('Choose a Tax Calculator by Situation')).toBeInTheDocument();
    expect(screen.getByTestId('best-for-link-high-earners')).toHaveAttribute(
      'href',
      '/best-for/high-earners',
    );
    expect(screen.getByTestId('best-for-link-first-job')).toHaveAttribute(
      'href',
      '/best-for/first-job',
    );
  });
});
