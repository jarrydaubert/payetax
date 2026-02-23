import { render, screen } from '@testing-library/react';
import AboutPage from '../page';

describe('AboutPage', () => {
  it('renders redesigned narrative sections and primary CTAs', () => {
    render(<AboutPage />);

    expect(
      screen.getByRole('heading', {
        name: /Built to help you trust your numbers without trading your privacy/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /How PayeTax differs in practice/i }),
    ).toBeInTheDocument();

    const openCalculatorLink = screen.getByRole('link', {
      name: /Open Calculator/i,
    });
    expect(openCalculatorLink).toHaveAttribute('href', '/');
    expect(openCalculatorLink).toHaveClass('w-full');

    const complianceLink = screen.getByRole('link', {
      name: /Compliance & Sources/i,
    });
    expect(complianceLink).toHaveAttribute('href', '/compliance');
    expect(complianceLink).toHaveClass('w-full');

    const installLink = screen.getByRole('link', {
      name: /Install App/i,
    });
    expect(installLink).toHaveAttribute('href', '/install');
    expect(installLink).toHaveClass('w-full');

    expect(
      screen.getByRole('button', {
        name: /Send feedback/i,
      }),
    ).toBeInTheDocument();
  });
});
