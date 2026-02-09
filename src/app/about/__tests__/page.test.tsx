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

    expect(
      screen.getByRole('link', {
        name: /Open Calculator/i,
      }),
    ).toHaveAttribute('href', '/');

    expect(
      screen.getByRole('link', {
        name: /Compliance & Sources/i,
      }),
    ).toHaveAttribute('href', '/compliance');

    expect(
      screen.getByRole('link', {
        name: /Install App/i,
      }),
    ).toHaveAttribute('href', '/install');
  });
});
