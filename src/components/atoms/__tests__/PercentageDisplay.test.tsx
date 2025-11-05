/**
 * PercentageDisplay Component Tests
 *
 * Tests for the PercentageDisplay atom component.
 * Created as part of PAYTAX-90 atomic design refactoring.
 */

import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { PercentageDisplay } from '../PercentageDisplay';

describe('PercentageDisplay', () => {
  describe('Basic Rendering', () => {
    it('should render percentage value', () => {
      render(<PercentageDisplay value={20} />);
      expect(screen.getByText('20.0%')).toBeInTheDocument();
    });

    it('should render zero percentage', () => {
      render(<PercentageDisplay value={0} />);
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });

    it('should render negative percentage', () => {
      render(<PercentageDisplay value={-5} />);
      expect(screen.getByText('-5.0%')).toBeInTheDocument();
    });

    it('should handle very small percentages', () => {
      render(<PercentageDisplay value={0.5} precision={2} />);
      // 0.5 is auto-converted to 50%
      expect(screen.getByText('50.00%')).toBeInTheDocument();
    });
  });

  describe('Value Conversion', () => {
    it('should auto-convert decimal to percentage (0.45 → 45%)', () => {
      render(<PercentageDisplay value={0.45} />);
      expect(screen.getByText('45.0%')).toBeInTheDocument();
    });

    it('should auto-convert negative decimal (-0.15 → -15%)', () => {
      render(<PercentageDisplay value={-0.15} />);
      expect(screen.getByText('-15.0%')).toBeInTheDocument();
    });

    it('should not convert values >= 1', () => {
      render(<PercentageDisplay value={25} />);
      expect(screen.getByText('25.0%')).toBeInTheDocument();
    });

    it('should not convert values <= -1', () => {
      render(<PercentageDisplay value={-20} />);
      expect(screen.getByText('-20.0%')).toBeInTheDocument();
    });

    it('should handle edge case of exactly 1', () => {
      render(<PercentageDisplay value={1} />);
      expect(screen.getByText('1.0%')).toBeInTheDocument();
    });
  });

  describe('Precision', () => {
    it('should use 1 decimal place by default', () => {
      render(<PercentageDisplay value={20.555} />);
      expect(screen.getByText('20.6%')).toBeInTheDocument();
    });

    it('should format with 0 decimal places', () => {
      render(<PercentageDisplay value={20.9} precision={0} />);
      expect(screen.getByText('21%')).toBeInTheDocument();
    });

    it('should format with 2 decimal places', () => {
      render(<PercentageDisplay value={20.456} precision={2} />);
      expect(screen.getByText('20.46%')).toBeInTheDocument();
    });

    it('should format with 3 decimal places', () => {
      render(<PercentageDisplay value={20.12345} precision={3} />);
      expect(screen.getByText('20.123%')).toBeInTheDocument();
    });
  });

  describe('Sign Display', () => {
    it('should show + sign for positive values when showSign is true', () => {
      render(<PercentageDisplay value={15} showSign />);
      expect(screen.getByText('+15.0%')).toBeInTheDocument();
    });

    it('should show - sign for negative values always', () => {
      render(<PercentageDisplay value={-15} showSign />);
      expect(screen.getByText('-15.0%')).toBeInTheDocument();
    });

    it('should not show + sign by default', () => {
      render(<PercentageDisplay value={15} />);
      expect(screen.getByText('15.0%')).toBeInTheDocument();
    });

    it('should not show sign for zero', () => {
      render(<PercentageDisplay value={0} showSign />);
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should apply default variant for zero', () => {
      const { container } = render(<PercentageDisplay value={0} />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('text-foreground');
    });

    it('should auto-apply success variant for positive values', () => {
      const { container } = render(<PercentageDisplay value={15} />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('text-green-600');
    });

    it('should auto-apply destructive variant for negative values', () => {
      const { container } = render(<PercentageDisplay value={-15} />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('text-red-600');
    });

    it('should use explicit success variant', () => {
      const { container } = render(<PercentageDisplay value={15} variant='success' />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('text-green-600');
    });

    it('should use explicit warning variant', () => {
      const { container } = render(<PercentageDisplay value={15} variant='warning' />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('text-yellow-600');
    });

    it('should use explicit destructive variant', () => {
      const { container } = render(<PercentageDisplay value={15} variant='destructive' />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('text-red-600');
    });
  });

  describe('Badge Display', () => {
    it('should render as badge when asBadge is true', () => {
      render(<PercentageDisplay value={20} asBadge />);
      // Badge component should be present
      const badge = screen.getByText('20.0%');
      expect(badge).toBeInTheDocument();
    });

    it('should render as span by default', () => {
      const { container } = render(<PercentageDisplay value={20} />);
      const span = container.querySelector('span');
      expect(span).toBeInTheDocument();
      expect(span).toHaveClass('font-mono');
    });

    it('should apply badge variant for success', () => {
      render(<PercentageDisplay value={20} asBadge variant='success' />);
      expect(screen.getByText('20.0%')).toBeInTheDocument();
    });

    it('should apply badge variant for warning', () => {
      render(<PercentageDisplay value={20} asBadge variant='warning' />);
      expect(screen.getByText('20.0%')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should accept custom className', () => {
      const { container } = render(<PercentageDisplay value={20} className='custom-class' />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('custom-class');
    });

    it('should merge custom className with variant classes', () => {
      const { container } = render(
        <PercentageDisplay value={20} variant='success' className='font-bold' />
      );
      const span = container.querySelector('span');
      expect(span).toHaveClass('text-green-600', 'font-bold');
    });

    it('should apply font-mono class by default', () => {
      const { container } = render(<PercentageDisplay value={20} />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('font-mono');
    });
  });

  describe('Real-world Tax Calculator Values', () => {
    it('should display basic tax rate (20%)', () => {
      render(<PercentageDisplay value={20} precision={0} />);
      expect(screen.getByText('20%')).toBeInTheDocument();
    });

    it('should display higher tax rate (40%)', () => {
      render(<PercentageDisplay value={40} precision={0} />);
      expect(screen.getByText('40%')).toBeInTheDocument();
    });

    it('should display additional tax rate (45%)', () => {
      render(<PercentageDisplay value={45} precision={0} />);
      expect(screen.getByText('45%')).toBeInTheDocument();
    });

    it('should display effective tax rate (25.3%)', () => {
      render(<PercentageDisplay value={25.3} />);
      expect(screen.getByText('25.3%')).toBeInTheDocument();
    });

    it('should display NI rate (12%)', () => {
      render(<PercentageDisplay value={12} precision={0} />);
      expect(screen.getByText('12%')).toBeInTheDocument();
    });

    it('should display marginal rate (60% for £100k trap)', () => {
      render(<PercentageDisplay value={60} precision={0} />);
      expect(screen.getByText('60%')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large percentages', () => {
      render(<PercentageDisplay value={1000} />);
      expect(screen.getByText('1000.0%')).toBeInTheDocument();
    });

    it('should handle very small negative percentages', () => {
      render(<PercentageDisplay value={-0.01} precision={2} />);
      expect(screen.getByText('-1.00%')).toBeInTheDocument();
    });

    it('should round correctly', () => {
      render(<PercentageDisplay value={20.45} precision={1} />);
      // JavaScript toFixed() rounds 20.45 to 20.4
      expect(screen.getByText('20.4%')).toBeInTheDocument();
    });

    it('should handle scientific notation input', () => {
      render(<PercentageDisplay value={1e-4} precision={4} />);
      expect(screen.getByText('0.0100%')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render as span element', () => {
      const { container } = render(<PercentageDisplay value={20} />);
      expect(container.querySelector('span')).toBeInTheDocument();
    });

    it('should have readable text content', () => {
      const { container } = render(<PercentageDisplay value={20} />);
      expect(container.textContent).toBe('20.0%');
    });

    it('should be screen reader friendly', () => {
      const { container } = render(<PercentageDisplay value={25.5} />);
      const span = container.querySelector('span');
      expect(span?.textContent).toBe('25.5%');
    });
  });
});
