import { render, screen } from '@testing-library/react';
import ToolsPage from '../page';

describe('ToolsPage', () => {
  it('renders tools list with key links', () => {
    render(<ToolsPage />);

    expect(screen.getByText('Free UK Tax')).toBeInTheDocument();
    expect(screen.getByTestId('tools-link-director-guide')).toBeInTheDocument();
    expect(screen.getByTestId('tools-link-tax-code-decoder')).toBeInTheDocument();
  });
});
