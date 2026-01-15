/**
 * @jest-environment jsdom
 */
// src/components/molecules/__tests__/ServerHero.test.tsx
// ServerHero is a server component for instant LCP optimization

import { render, screen } from '@testing-library/react';
import ServerHero from '../ServerHero';

describe('ServerHero Component', () => {
  it('should render the main heading with correct text', () => {
    render(<ServerHero />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Free UK PAYE Tax')).toBeInTheDocument();
    expect(screen.getByText('Calculator 2025-2026')).toBeInTheDocument();
  });

  it('should render the description text', () => {
    render(<ServerHero />);

    expect(screen.getByText(/Calculate your take-home pay instantly/i)).toBeInTheDocument();
  });

  it('should render CTA link with correct href', () => {
    render(<ServerHero />);

    const ctaLink = screen.getByRole('link', { name: /Calculate My Salary/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute('href', '#tax-calculator');
  });

  it('should render all feature badges', () => {
    render(<ServerHero />);

    expect(screen.getByText('Accurate Calculations')).toBeInTheDocument();
    expect(screen.getByText('2025-2026 Tax Year')).toBeInTheDocument();
    expect(screen.getByText('Scottish Tax Support')).toBeInTheDocument();
    expect(screen.getByText('Instant Results')).toBeInTheDocument();
  });

  it('should have text-gradient class on year text for visual styling', () => {
    const { container } = render(<ServerHero />);

    const gradientText = container.querySelector('.text-gradient');
    expect(gradientText).toBeInTheDocument();
    expect(gradientText?.textContent).toBe('Calculator 2025-2026');
  });

  it('should accept and apply custom className', () => {
    const { container } = render(<ServerHero className='custom-class' />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('custom-class');
  });
});
