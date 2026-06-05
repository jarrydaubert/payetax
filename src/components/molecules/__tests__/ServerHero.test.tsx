/**
 * @jest-environment jsdom
 */
// src/components/molecules/__tests__/ServerHero.test.tsx
// ServerHero with Ledger design: badge, headline, dual CTAs, trust strip

import { render, screen } from '@testing-library/react';
import ServerHero from '../ServerHero';

describe('ServerHero Component', () => {
  it('should render the main heading with product and outcome text', () => {
    render(<ServerHero />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('UK PAYE tax calculator')).toBeInTheDocument();
    expect(screen.getByText('See your take-home pay')).toBeInTheDocument();
  });

  it('should render the tagline with HMRC mention', () => {
    render(<ServerHero />);

    expect(
      screen.getByText(/Estimate your take-home pay with official HMRC rates/i),
    ).toBeInTheDocument();
  });

  it('should render primary CTA link with correct href', () => {
    render(<ServerHero />);

    const ctaLink = screen.getByRole('link', { name: /See My Take Home Pay/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute('href', '#tax-calculator');
  });

  it('should render secondary CTA link', () => {
    render(<ServerHero />);

    const secondaryLink = screen.getByRole('link', { name: /Explore Tax Tools/i });
    expect(secondaryLink).toBeInTheDocument();
    expect(secondaryLink).toHaveAttribute('href', '/tools');
  });

  it('should render trust strip items', () => {
    render(<ServerHero />);

    expect(screen.getByText('Official HMRC rates')).toBeInTheDocument();
    expect(screen.getByText('Fast in-browser results')).toBeInTheDocument();
    expect(screen.getByText('Your data stays private')).toBeInTheDocument();
    expect(screen.getByText('No signup needed')).toBeInTheDocument();
  });

  it('should style the outcome line with the Ledger accent', () => {
    const { container } = render(<ServerHero />);

    const accentText = screen.getByText('See your take-home pay');
    expect(accentText).toHaveClass('text-primary');
    expect(container.querySelector('.text-gradient-brand')).not.toBeInTheDocument();
  });

  it('should accept and apply custom className', () => {
    const { container } = render(<ServerHero className='custom-class' />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('custom-class');
  });
});
