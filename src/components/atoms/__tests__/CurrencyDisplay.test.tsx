/**
 * CurrencyDisplay Component Tests
 *
 * Tests for the CurrencyDisplay atom component.
 * Created as part of PAYTAX-90 atomic design refactoring.
 */

import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { CurrencyDisplay } from '../CurrencyDisplay';

describe('CurrencyDisplay', () => {
  describe('Basic Rendering', () => {
    it('should render with currency symbol by default', () => {
      render(<CurrencyDisplay amount={30000} />);
      expect(screen.getByText(/£30,000/)).toBeInTheDocument();
    });

    it('should render without currency symbol when showCurrency is false', () => {
      const { container } = render(<CurrencyDisplay amount={30000} showCurrency={false} />);
      expect(container.textContent).toBe('30,000');
      expect(container.textContent).not.toContain('£');
    });

    it('should render zero correctly', () => {
      render(<CurrencyDisplay amount={0} />);
      expect(screen.getByText(/£0/)).toBeInTheDocument();
    });

    it('should render negative amounts correctly', () => {
      const { container } = render(<CurrencyDisplay amount={-1500} />);
      expect(container.textContent).toBe('£-1,500');
    });
  });

  describe('Formatting', () => {
    it('should format with thousand separators', () => {
      render(<CurrencyDisplay amount={1234567} />);
      expect(screen.getByText(/£1,234,567/)).toBeInTheDocument();
    });

    it('should format with specified precision for decimals', () => {
      render(<CurrencyDisplay amount={1234.56} precision={2} />);
      expect(screen.getByText(/£1,234.56/)).toBeInTheDocument();
    });

    it('should format with zero decimal places by default', () => {
      const { container } = render(<CurrencyDisplay amount={1234.99} />);
      expect(container.textContent).toBe('£1,235');
    });

    it('should handle very large numbers', () => {
      render(<CurrencyDisplay amount={1000000000} />);
      expect(screen.getByText(/£1,000,000,000/)).toBeInTheDocument();
    });

    it('should respect custom locale', () => {
      render(<CurrencyDisplay amount={1234.56} precision={2} locale='en-US' />);
      // US locale still uses commas for thousands
      expect(screen.getByText(/£1,234.56/)).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should apply default variant classes', () => {
      const { container } = render(<CurrencyDisplay amount={30000} variant='default' />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('text-foreground');
    });

    it('should apply large variant classes', () => {
      const { container } = render(<CurrencyDisplay amount={30000} variant='large' />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('font-bold', 'text-2xl', 'text-foreground');
    });

    it('should apply small variant classes', () => {
      const { container } = render(<CurrencyDisplay amount={30000} variant='small' />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('text-sm', 'text-foreground');
    });

    it('should apply muted variant classes', () => {
      const { container } = render(<CurrencyDisplay amount={30000} variant='muted' />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('text-muted-foreground');
    });
  });

  describe('Custom Styling', () => {
    it('should accept and apply custom className', () => {
      const { container } = render(<CurrencyDisplay amount={30000} className='custom-class' />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('custom-class');
    });

    it('should merge custom className with variant classes', () => {
      const { container } = render(
        <CurrencyDisplay amount={30000} variant='large' className='text-blue-500' />
      );
      const span = container.querySelector('span');
      expect(span).toHaveClass('font-bold', 'text-2xl', 'text-blue-500');
    });
  });

  describe('Real-world Tax Calculator Values', () => {
    it('should format typical UK salary (£30,000)', () => {
      render(<CurrencyDisplay amount={30000} />);
      expect(screen.getByText(/£30,000/)).toBeInTheDocument();
    });

    it('should format high salary (£150,000)', () => {
      render(<CurrencyDisplay amount={150000} />);
      expect(screen.getByText(/£150,000/)).toBeInTheDocument();
    });

    it('should format tax deduction (£6,486.50)', () => {
      render(<CurrencyDisplay amount={6486.5} precision={2} />);
      expect(screen.getByText(/£6,486.50/)).toBeInTheDocument();
    });

    it('should format take-home pay', () => {
      render(<CurrencyDisplay amount={23513.75} precision={2} />);
      expect(screen.getByText(/£23,513.75/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small amounts', () => {
      render(<CurrencyDisplay amount={0.01} precision={2} />);
      expect(screen.getByText(/£0.01/)).toBeInTheDocument();
    });

    it('should handle fractional pennies with rounding', () => {
      render(<CurrencyDisplay amount={123.456} precision={2} />);
      expect(screen.getByText(/£123.46/)).toBeInTheDocument();
    });

    it('should handle precision of 0 explicitly', () => {
      const { container } = render(<CurrencyDisplay amount={123.99} precision={0} />);
      expect(container.textContent).toBe('£124');
    });

    it('should handle precision of 3 for detailed calculations', () => {
      render(<CurrencyDisplay amount={123.456} precision={3} />);
      expect(screen.getByText(/£123.456/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render as span element', () => {
      const { container } = render(<CurrencyDisplay amount={30000} />);
      expect(container.querySelector('span')).toBeInTheDocument();
    });

    it('should have readable text content', () => {
      const { container } = render(<CurrencyDisplay amount={30000} />);
      expect(container.textContent).toBe('£30,000');
    });

    it('should be screen reader friendly', () => {
      const { container } = render(<CurrencyDisplay amount={30000} />);
      const span = container.querySelector('span');
      expect(span?.textContent).toMatch(/£30,000/);
    });
  });
});
