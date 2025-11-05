/**
 * RateLabel Component Tests
 *
 * Tests for the RateLabel atom component.
 * Created as part of PAYTAX-90 atomic design refactoring.
 */

import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { RateLabel } from '../RateLabel';

describe('RateLabel', () => {
  describe('Basic Rendering', () => {
    it('should render label and rate', () => {
      render(<RateLabel label='Effective Rate' rate={25.3} />);
      expect(screen.getByText('Effective Rate:')).toBeInTheDocument();
      expect(screen.getByText('25.3%')).toBeInTheDocument();
    });

    it('should render with zero rate', () => {
      render(<RateLabel label='Tax Rate' rate={0} />);
      expect(screen.getByText('Tax Rate:')).toBeInTheDocument();
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });

    it('should render with negative rate', () => {
      render(<RateLabel label='Adjustment' rate={-5} />);
      expect(screen.getByText('Adjustment:')).toBeInTheDocument();
      expect(screen.getByText('-5.0%')).toBeInTheDocument();
    });

    it('should include colon after label', () => {
      render(<RateLabel label='Marginal Rate' rate={40} />);
      expect(screen.getByText('Marginal Rate:')).toBeInTheDocument();
    });
  });

  describe('Layout Modes', () => {
    it('should render as block layout by default', () => {
      const { container } = render(<RateLabel label='Effective Rate' rate={25} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'items-center', 'justify-between');
      expect(wrapper).not.toHaveClass('inline-flex');
    });

    it('should render as inline layout when inline prop is true', () => {
      const { container } = render(<RateLabel label='Effective Rate' rate={25} inline />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('inline-flex', 'items-center', 'gap-2');
      expect(wrapper).not.toHaveClass('justify-between');
    });

    it('should have proper spacing in block mode', () => {
      const { container } = render(<RateLabel label='Rate' rate={25} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('justify-between');
    });

    it('should have proper spacing in inline mode', () => {
      const { container } = render(<RateLabel label='Rate' rate={25} inline />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('gap-2');
    });
  });

  describe('Precision', () => {
    it('should use 1 decimal place by default', () => {
      render(<RateLabel label='Rate' rate={25.555} />);
      expect(screen.getByText('25.6%')).toBeInTheDocument();
    });

    it('should format with 0 decimal places', () => {
      render(<RateLabel label='Rate' rate={25.9} precision={0} />);
      expect(screen.getByText('26%')).toBeInTheDocument();
    });

    it('should format with 2 decimal places', () => {
      render(<RateLabel label='Rate' rate={25.456} precision={2} />);
      expect(screen.getByText('25.46%')).toBeInTheDocument();
    });

    it('should format with 3 decimal places', () => {
      render(<RateLabel label='Rate' rate={25.12345} precision={3} />);
      expect(screen.getByText('25.123%')).toBeInTheDocument();
    });

    it('should pad zeros when needed', () => {
      render(<RateLabel label='Rate' rate={25} precision={2} />);
      expect(screen.getByText('25.00%')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should apply default variant classes', () => {
      render(<RateLabel label='Rate' rate={25} variant='default' />);
      const label = screen.getByText('Rate:');
      expect(label).toHaveClass('text-foreground');
    });

    it('should apply muted variant classes', () => {
      render(<RateLabel label='Rate' rate={25} variant='muted' />);
      const label = screen.getByText('Rate:');
      expect(label).toHaveClass('text-muted-foreground');
    });

    it('should apply accent variant classes', () => {
      render(<RateLabel label='Rate' rate={25} variant='accent' />);
      const label = screen.getByText('Rate:');
      expect(label).toHaveClass('text-primary');
    });

    it('should apply variant to both label and rate', () => {
      render(<RateLabel label='Rate' rate={25} variant='muted' />);
      const label = screen.getByText('Rate:');
      const rate = screen.getByText('25.0%');
      expect(label).toHaveClass('text-muted-foreground');
      expect(rate).toHaveClass('text-muted-foreground');
    });
  });

  describe('Typography', () => {
    it('should apply font-medium to label', () => {
      render(<RateLabel label='Rate' rate={25} />);
      const label = screen.getByText('Rate:');
      expect(label).toHaveClass('font-medium');
    });

    it('should apply font-mono and font-semibold to rate', () => {
      render(<RateLabel label='Rate' rate={25} />);
      const rate = screen.getByText('25.0%');
      expect(rate).toHaveClass('font-mono', 'font-semibold');
    });

    it('should apply text-sm to both elements', () => {
      render(<RateLabel label='Rate' rate={25} />);
      const label = screen.getByText('Rate:');
      const rate = screen.getByText('25.0%');
      expect(label).toHaveClass('text-sm');
      expect(rate).toHaveClass('text-sm');
    });
  });

  describe('Custom Styling', () => {
    it('should accept custom className', () => {
      const { container } = render(<RateLabel label='Rate' rate={25} className='custom-class' />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(<RateLabel label='Rate' rate={25} className='p-4 text-xl' />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'text-xl', 'p-4');
    });
  });

  describe('Real-world Tax Calculator Values', () => {
    it('should display effective tax rate', () => {
      render(<RateLabel label='Effective Rate' rate={25.3} />);
      expect(screen.getByText('Effective Rate:')).toBeInTheDocument();
      expect(screen.getByText('25.3%')).toBeInTheDocument();
    });

    it('should display marginal tax rate', () => {
      render(<RateLabel label='Marginal Rate' rate={40} precision={0} />);
      expect(screen.getByText('Marginal Rate:')).toBeInTheDocument();
      expect(screen.getByText('40%')).toBeInTheDocument();
    });

    it('should display NI rate', () => {
      render(<RateLabel label='NI Rate' rate={12} precision={0} />);
      expect(screen.getByText('NI Rate:')).toBeInTheDocument();
      expect(screen.getByText('12%')).toBeInTheDocument();
    });

    it('should display £100k tax trap rate (60%)', () => {
      render(<RateLabel label='Trap Zone Rate' rate={60} precision={0} />);
      expect(screen.getByText('Trap Zone Rate:')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('should display Scottish intermediate rate', () => {
      render(<RateLabel label='Scottish Rate' rate={21} precision={0} />);
      expect(screen.getByText('Scottish Rate:')).toBeInTheDocument();
      expect(screen.getByText('21%')).toBeInTheDocument();
    });

    it('should display combined rate with precision', () => {
      render(<RateLabel label='Combined Rate' rate={52.73} precision={2} />);
      expect(screen.getByText('Combined Rate:')).toBeInTheDocument();
      expect(screen.getByText('52.73%')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large rates', () => {
      render(<RateLabel label='Large Rate' rate={999.99} precision={2} />);
      expect(screen.getByText('999.99%')).toBeInTheDocument();
    });

    it('should handle very small rates', () => {
      render(<RateLabel label='Small Rate' rate={0.01} precision={2} />);
      expect(screen.getByText('0.01%')).toBeInTheDocument();
    });

    it('should handle negative rates', () => {
      render(<RateLabel label='Negative Rate' rate={-15.5} />);
      expect(screen.getByText('-15.5%')).toBeInTheDocument();
    });

    it('should handle empty label gracefully', () => {
      render(<RateLabel label='' rate={25} />);
      expect(screen.getByText(':')).toBeInTheDocument();
      expect(screen.getByText('25.0%')).toBeInTheDocument();
    });

    it('should handle very long labels', () => {
      const longLabel = 'This is a very long label for testing purposes';
      render(<RateLabel label={longLabel} rate={25} />);
      expect(screen.getByText(`${longLabel}:`)).toBeInTheDocument();
    });

    it('should handle unicode characters in label', () => {
      render(<RateLabel label='UK 🇬🇧 Rate' rate={20} />);
      expect(screen.getByText('UK 🇬🇧 Rate:')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render as semantic div element', () => {
      const { container } = render(<RateLabel label='Rate' rate={25} />);
      expect(container.firstChild?.nodeName).toBe('DIV');
    });

    it('should have proper text content for screen readers', () => {
      const { container } = render(<RateLabel label='Effective Rate' rate={25.3} />);
      expect(container.textContent).toContain('Effective Rate:');
      expect(container.textContent).toContain('25.3%');
    });

    it('should maintain reading order (label before rate)', () => {
      const { container } = render(<RateLabel label='Rate' rate={25} />);
      const text = container.textContent || '';
      const labelIndex = text.indexOf('Rate:');
      const rateIndex = text.indexOf('25.0%');
      expect(labelIndex).toBeLessThan(rateIndex);
    });

    it('should have clear visual hierarchy', () => {
      render(<RateLabel label='Tax Rate' rate={20} />);
      const label = screen.getByText('Tax Rate:');
      const rate = screen.getByText('20.0%');
      expect(label).toHaveClass('font-medium');
      expect(rate).toHaveClass('font-semibold');
    });
  });

  describe('Use Cases', () => {
    it('should work well in a results summary (block layout)', () => {
      const { container } = render(<RateLabel label='Effective Rate' rate={25.3} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('justify-between');
    });

    it('should work well inline in paragraphs (inline layout)', () => {
      const { container } = render(<RateLabel label='Rate' rate={20} inline />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('inline-flex');
    });

    it('should work well in muted contexts', () => {
      render(<RateLabel label='Secondary Rate' rate={8} variant='muted' />);
      const label = screen.getByText('Secondary Rate:');
      expect(label).toHaveClass('text-muted-foreground');
    });

    it('should work well for highlighted rates', () => {
      render(<RateLabel label='Important Rate' rate={60} variant='accent' />);
      const label = screen.getByText('Important Rate:');
      expect(label).toHaveClass('text-primary');
    });
  });
});
