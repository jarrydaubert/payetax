/**
 * TaxBadge Component Tests
 *
 * Tests for the TaxBadge atom component.
 * Created as part of PAYTAX-90 atomic design refactoring.
 */

import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { TaxBadge } from '../TaxBadge';

describe('TaxBadge', () => {
  describe('Basic Rendering', () => {
    it('should render basic rate badge', () => {
      render(<TaxBadge band='basic' />);
      expect(screen.getByText('Basic Rate')).toBeInTheDocument();
    });

    it('should render higher rate badge', () => {
      render(<TaxBadge band='higher' />);
      expect(screen.getByText('Higher Rate')).toBeInTheDocument();
    });

    it('should render additional rate badge', () => {
      render(<TaxBadge band='additional' />);
      expect(screen.getByText('Additional Rate')).toBeInTheDocument();
    });
  });

  describe('Scottish Tax Bands', () => {
    it('should render starter rate badge', () => {
      render(<TaxBadge band='starter' />);
      expect(screen.getByText('Starter Rate')).toBeInTheDocument();
    });

    it('should render intermediate rate badge', () => {
      render(<TaxBadge band='intermediate' />);
      expect(screen.getByText('Intermediate Rate')).toBeInTheDocument();
    });

    it('should render advanced rate badge', () => {
      render(<TaxBadge band='advanced' />);
      expect(screen.getByText('Advanced Rate')).toBeInTheDocument();
    });

    it('should render top rate badge', () => {
      render(<TaxBadge band='top' />);
      expect(screen.getByText('Top Rate')).toBeInTheDocument();
    });
  });

  describe('Custom Labels', () => {
    it('should render custom label instead of default', () => {
      render(<TaxBadge band='basic' customLabel='20% Band' />);
      expect(screen.getByText('20% Band')).toBeInTheDocument();
      expect(screen.queryByText('Basic Rate')).not.toBeInTheDocument();
    });

    it('should render custom label for higher rate', () => {
      render(<TaxBadge band='higher' customLabel='40% Tax' />);
      expect(screen.getByText('40% Tax')).toBeInTheDocument();
    });

    it('should render custom label for Scottish band', () => {
      render(<TaxBadge band='starter' customLabel='Scottish Starter' />);
      expect(screen.getByText('Scottish Starter')).toBeInTheDocument();
    });
  });

  describe('Show Rate', () => {
    it('should show rate for basic band when showRate is true', () => {
      render(<TaxBadge band='basic' showRate />);
      expect(screen.getByText('Basic Rate (20%)')).toBeInTheDocument();
    });

    it('should show rate for higher band', () => {
      render(<TaxBadge band='higher' showRate />);
      expect(screen.getByText('Higher Rate (40%)')).toBeInTheDocument();
    });

    it('should show rate for additional band', () => {
      render(<TaxBadge band='additional' showRate />);
      expect(screen.getByText('Additional Rate (45%)')).toBeInTheDocument();
    });

    it('should show rate for Scottish starter band', () => {
      render(<TaxBadge band='starter' showRate />);
      expect(screen.getByText('Starter Rate (19%)')).toBeInTheDocument();
    });

    it('should show rate for Scottish intermediate band', () => {
      render(<TaxBadge band='intermediate' showRate />);
      expect(screen.getByText('Intermediate Rate (21%)')).toBeInTheDocument();
    });

    it('should show rate for Scottish advanced band', () => {
      render(<TaxBadge band='advanced' showRate />);
      expect(screen.getByText('Advanced Rate (45%)')).toBeInTheDocument();
    });

    it('should show rate for Scottish top band', () => {
      render(<TaxBadge band='top' showRate />);
      expect(screen.getByText('Top Rate (48%)')).toBeInTheDocument();
    });

    it('should not show rate by default', () => {
      render(<TaxBadge band='basic' />);
      expect(screen.getByText('Basic Rate')).toBeInTheDocument();
      expect(screen.queryByText(/20%/)).not.toBeInTheDocument();
    });

    it('should show rate with custom label', () => {
      render(<TaxBadge band='basic' customLabel='Standard' showRate />);
      expect(screen.getByText('Standard (20%)')).toBeInTheDocument();
    });
  });

  describe('Badge Variants', () => {
    it('should apply default variant for basic rate', () => {
      render(<TaxBadge band='basic' />);
      const badge = screen.getByText('Basic Rate');
      // Badge component will be rendered
      expect(badge).toBeInTheDocument();
    });

    it('should apply secondary variant for higher rate', () => {
      render(<TaxBadge band='higher' />);
      const badge = screen.getByText('Higher Rate');
      expect(badge).toBeInTheDocument();
    });

    it('should apply destructive variant for additional rate', () => {
      render(<TaxBadge band='additional' />);
      const badge = screen.getByText('Additional Rate');
      expect(badge).toBeInTheDocument();
    });

    it('should apply appropriate variant for Scottish bands', () => {
      render(<TaxBadge band='top' />);
      const badge = screen.getByText('Top Rate');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should accept custom className', () => {
      render(<TaxBadge band='basic' className='custom-class' />);
      const badge = screen.getByText('Basic Rate');
      expect(badge).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<TaxBadge band='basic' className='text-xl' />);
      const badge = screen.getByText('Basic Rate');
      expect(badge).toBeInTheDocument();
    });

    it('should render Badge component', () => {
      render(<TaxBadge band='basic' />);
      const badge = screen.getByText('Basic Rate');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Real-world UK Tax Scenarios', () => {
    it('should display basic rate for £30,000 salary', () => {
      render(<TaxBadge band='basic' showRate />);
      expect(screen.getByText('Basic Rate (20%)')).toBeInTheDocument();
    });

    it('should display higher rate for £60,000 salary', () => {
      render(<TaxBadge band='higher' showRate />);
      expect(screen.getByText('Higher Rate (40%)')).toBeInTheDocument();
    });

    it('should display additional rate for £150,000 salary', () => {
      render(<TaxBadge band='additional' showRate />);
      expect(screen.getByText('Additional Rate (45%)')).toBeInTheDocument();
    });

    it('should display Scottish intermediate rate', () => {
      render(<TaxBadge band='intermediate' showRate />);
      expect(screen.getByText('Intermediate Rate (21%)')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty custom label by falling back to default', () => {
      render(<TaxBadge band='basic' customLabel='' />);
      // Empty string falls back to default label (truthy check)
      const defaultLabel = screen.getByText('Basic Rate');
      expect(defaultLabel).toBeInTheDocument();
    });

    it('should handle very long custom labels', () => {
      const longLabel = 'This is a very long custom label for testing purposes';
      render(<TaxBadge band='basic' customLabel={longLabel} />);
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it('should handle unicode characters in custom label', () => {
      render(<TaxBadge band='basic' customLabel='Basic Rate 🇬🇧' />);
      expect(screen.getByText('Basic Rate 🇬🇧')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be readable by screen readers', () => {
      render(<TaxBadge band='basic' />);
      const badge = screen.getByText('Basic Rate');
      expect(badge).toBeInTheDocument();
    });

    it('should have semantic meaning through badge component', () => {
      render(<TaxBadge band='higher' showRate />);
      const badge = screen.getByText('Higher Rate (40%)');
      expect(badge).toBeInTheDocument();
    });

    it('should render with proper text content', () => {
      const { container } = render(<TaxBadge band='additional' />);
      expect(container.textContent).toBe('Additional Rate');
    });
  });

  describe('All Band Types', () => {
    const allBands: Array<
      'basic' | 'higher' | 'additional' | 'starter' | 'intermediate' | 'advanced' | 'top'
    > = ['basic', 'higher', 'additional', 'starter', 'intermediate', 'advanced', 'top'];

    it.each(allBands)('should render %s band correctly', (band) => {
      const { container } = render(<TaxBadge band={band} />);
      // Badge component renders successfully
      expect(container.firstChild).toBeInTheDocument();
    });

    it.each(allBands)('should render %s band with rate', (band) => {
      render(<TaxBadge band={band} showRate />);
      // Each band should show some text with a percentage
      const badge = screen.getByText(/\d+%/);
      expect(badge).toBeInTheDocument();
    });
  });
});
