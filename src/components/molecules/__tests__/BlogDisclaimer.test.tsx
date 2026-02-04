import { render, screen } from '@/test/testing-library';

import { BlogDisclaimer } from '../BlogDisclaimer';

describe('BlogDisclaimer', () => {
  it('renders a note with HMRC link', () => {
    render(<BlogDisclaimer />);

    const note = screen.getByRole('note');
    expect(note).toBeInTheDocument();

    expect(
      screen.getByText('Important: This is for informational purposes only'),
    ).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /official HMRC sources/i });
    expect(link).toHaveAttribute(
      'href',
      'https://www.gov.uk/government/organisations/hm-revenue-customs',
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
