/**
 * @jest-environment jsdom
 */
// src/components/molecules/__tests__/ServerHero.test.tsx
// ServerHero with new payetax-web design: badge, headline, dual CTAs, trust strip, bento grid

import { render, screen } from '@testing-library/react';
import ServerHero from '../ServerHero';

describe('ServerHero Component', () => {
  it('should render the main heading with correct text', () => {
    render(<ServerHero />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('See exactly what')).toBeInTheDocument();
    expect(screen.getByText("you'll take home")).toBeInTheDocument();
  });

  it('should render badge with HMRC rates', () => {
    render(<ServerHero />);

    expect(screen.getByText('Official HMRC 2025-26 Rates')).toBeInTheDocument();
  });

  it('should render the tagline with HMRC mention', () => {
    render(<ServerHero />);

    expect(
      screen.getByText(/Free UK tax calculator with official HMRC rates/i),
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

    const secondaryLink = screen.getByRole('link', { name: /See What's Included/i });
    expect(secondaryLink).toBeInTheDocument();
    expect(secondaryLink).toHaveAttribute('href', '#features');
  });

  it('should render trust strip items', () => {
    render(<ServerHero />);

    expect(screen.getByText('Official HMRC rates')).toBeInTheDocument();
    expect(screen.getByText('Matches your payslip')).toBeInTheDocument();
    expect(screen.getByText('Your data stays private')).toBeInTheDocument();
    expect(screen.getByText('No signup needed')).toBeInTheDocument();
  });

  it('should render bento grid items', () => {
    render(<ServerHero />);

    expect(screen.getByText('HMRC Accurate')).toBeInTheDocument();
    expect(screen.getByText('Instant Results')).toBeInTheDocument();
    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.getByText('UK Coverage')).toBeInTheDocument();
  });

  it('should have text-gradient-new class on headline text', () => {
    const { container } = render(<ServerHero />);

    const gradientText = container.querySelector('.text-gradient-new');
    expect(gradientText).toBeInTheDocument();
    expect(gradientText?.textContent).toBe("you'll take home");
  });

  it('should accept and apply custom className', () => {
    const { container } = render(<ServerHero className='custom-class' />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('custom-class');
  });
});
