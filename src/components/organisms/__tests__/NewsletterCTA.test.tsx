import { render, screen } from '@/test/testing-library';

import { NewsletterCTA } from '../NewsletterCTA';

describe('NewsletterCTA', () => {
  it('renders default headline and description', () => {
    render(<NewsletterCTA />);

    expect(screen.getByText('Stay Updated on UK Tax Changes')).toBeInTheDocument();
    expect(
      screen.getByText(
        'HMRC rate updates, tax-saving strategies, and deadline reminders. No spam, ever.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Privacy Policy/i })).not.toBeInTheDocument();
  });

  it('renders Kit embed configuration with expected uid and source', () => {
    const { container } = render(<NewsletterCTA />);

    const embedMount = container.querySelector('[data-kit-embed-uid="648a4b276a"]');
    expect(embedMount).toBeInTheDocument();
    expect(embedMount).toHaveAttribute(
      'data-kit-embed-src',
      'https://payetax.kit.com/648a4b276a/index.js',
    );
  });

  it('supports custom title/description props', () => {
    render(<NewsletterCTA title='Join Tax Insights' description='Weekly PAYE updates.' />);

    expect(screen.getByText('Join Tax Insights')).toBeInTheDocument();
    expect(screen.getByText('Weekly PAYE updates.')).toBeInTheDocument();
  });
});
