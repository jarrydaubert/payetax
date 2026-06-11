import { render, screen } from '@testing-library/react';
import AboutPage from '../page';

describe('AboutPage', () => {
  it('renders the R&D project narrative and primary routes', () => {
    render(<AboutPage />);

    expect(
      screen.getByRole('heading', {
        name: /A UK tax calculator built as a working test lab/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /^What it is$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^What it is not$/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Boring controls on purpose/i }),
    ).toBeInTheDocument();

    const openCalculatorLink = screen.getByRole('link', {
      name: /Open calculator/i,
    });
    expect(openCalculatorLink).toHaveAttribute('href', '/');

    const complianceLinks = screen.getAllByRole('link', {
      name: /View sources|Compliance and sources/i,
    });
    expect(complianceLinks.some((link) => link.getAttribute('href') === '/compliance')).toBe(true);

    const directorLink = screen.getByRole('link', {
      name: /Director Intelligence/i,
    });
    expect(directorLink).toHaveAttribute('href', '/tools/director-guide');
    expect(screen.queryByRole('button', { name: /Send feedback/i })).not.toBeInTheDocument();
  });
});
