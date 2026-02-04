import { render, screen } from '@testing-library/react';
import { COMPETITORS } from '@/data/competitors';
import { VsPageContent } from '../VsPageContent';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('VsPageContent', () => {
  it('renders comparison summary with competitor context', () => {
    const competitor = COMPETITORS[0];
    if (!competitor) throw new Error('Missing competitor fixture');

    render(<VsPageContent competitor={competitor} />);

    expect(screen.getByText('Quick Summary')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: new RegExp(`PayeTax\\s+vs\\s+${competitor.name}`),
      }),
    ).toBeInTheDocument();

    const summary = screen.getByText(/is better suited for/i);
    expect(summary.textContent).toContain('and more');
  });
});
