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
    expect(screen.getByText('Free UK PAYE Tax Calculator')).toBeInTheDocument();
    expect(screen.getByText('See your take-home pay')).toBeInTheDocument();
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

    const secondaryLink = screen.getByRole('link', { name: /Explore Tax Tools/i });
    expect(secondaryLink).toBeInTheDocument();
    expect(secondaryLink).toHaveAttribute('href', '/tools');
  });

  it('should render trust strip items', () => {
    render(<ServerHero />);

    expect(screen.getByText('Official HMRC rates')).toBeInTheDocument();
    expect(screen.getAllByText(/Updated for/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Your data stays private')).toBeInTheDocument();
    expect(screen.getByText('No signup needed')).toBeInTheDocument();
  });

  it('should render bento grid items', () => {
    render(<ServerHero />);

    expect(screen.getByText('HMRC-Based')).toBeInTheDocument();
    expect(screen.getByText('Fast Results')).toBeInTheDocument();
    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.getByText('UK Coverage')).toBeInTheDocument();
  });

  it('should have text-gradient-new class on headline text', () => {
    const { container } = render(<ServerHero />);

    const gradientText = container.querySelector('.text-gradient-new');
    expect(gradientText).toBeInTheDocument();
    expect(gradientText?.textContent).toBe('See your take-home pay');
  });

  it('should accept and apply custom className', () => {
    const { container } = render(<ServerHero className='custom-class' />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('custom-class');
  });
});
