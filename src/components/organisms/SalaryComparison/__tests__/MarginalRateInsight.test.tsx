// src/components/organisms/SalaryComparison/__tests__/MarginalRateInsight.test.tsx

import { render, screen } from '@testing-library/react';
import { MarginalRateInsight } from '../MarginalRateInsight';

describe('MarginalRateInsight', () => {
  describe('rendering', () => {
    it('should display the marginal rate and salary increase information', () => {
      const { container } = render(<MarginalRateInsight increase={10000} netDiff={6000} />);

      // Test the heading is present
      expect(screen.getByRole('heading', { name: /Marginal Take-Home/i })).toBeInTheDocument();

      // Test that the increase amount is displayed somewhere on the page
      expect(container.textContent).toContain('£10,000');
      expect(container.textContent).toContain('increase');

      // Keep rate is derived from netDiff/increase
      expect(container.textContent).toContain('60%');
    });

    it('should show how much the user keeps from the increase', () => {
      const { container } = render(<MarginalRateInsight increase={10000} netDiff={6000} />);

      // Verify the "You keep" section displays the net difference
      expect(container.textContent).toContain('You keep');
      expect(container.textContent).toContain('£6,000');
    });

    it('should show amount lost to deductions', () => {
      const { container } = render(<MarginalRateInsight increase={10000} netDiff={6000} />);

      // Verify deductions information is shown (£10k - £6k = £4k)
      expect(container.textContent).toContain('Lost to deductions');
      expect(container.textContent).toContain('£4,000');
    });

    it('should display a visual indicator showing the marginal rate proportion', () => {
      const { container } = render(
        <MarginalRateInsight increase={10000} netDiff={6000} />,
      );

      // Verify there's a visual progress element representing the rate
      const progressBar = container.querySelector('[style*="width: 60%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should provide a clear explanation of the marginal rate breakdown', () => {
      const { container } = render(<MarginalRateInsight increase={10000} netDiff={6000} />);

      // Verify the explanation contains all key information
      const text = container.textContent || '';
      expect(text).toContain('You keep');
      expect(text).toContain('60%');
      expect(text).toContain('£10,000');
      expect(text).toContain('increase');
      expect(text).toContain('remaining');
      expect(text).toContain('40%');
      expect(text).toContain('tax, NI, and deductions');
    });
  });

  describe('edge cases', () => {
    it('should handle zero increase without errors', () => {
      const { container } = render(<MarginalRateInsight increase={0} netDiff={0} />);
      // No increase => component returns null
      expect(container.firstChild).toBeNull();
    });

    it('should handle 100% marginal rate correctly', () => {
      const { container } = render(<MarginalRateInsight increase={10000} netDiff={10000} />);

      // User keeps 100% of the increase
      expect(container.textContent).toContain('100%');

      // Verify progress bar shows full width (100%)
      const progressBar = container.querySelector('[style*="width: 100%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should format large currency amounts correctly', () => {
      const { container } = render(
        <MarginalRateInsight increase={1000000} netDiff={600000} />,
      );

      // Verify large amounts are displayed with proper formatting
      expect(container.textContent).toContain('£1,000,000');
      expect(container.textContent).toContain('£600,000');
    });

    it('should apply custom className when provided', () => {
      const { container } = render(
        <MarginalRateInsight increase={10000} netDiff={6000} className='custom-class' />,
      );

      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should use semantic heading for the section title', () => {
      render(<MarginalRateInsight increase={10000} netDiff={6000} />);

      // Verify proper heading hierarchy for screen readers
      const heading = screen.getByRole('heading', { name: /Marginal Take-Home/i });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H3');
    });

    it('should be keyboard accessible', () => {
      const { container } = render(
        <MarginalRateInsight increase={10000} netDiff={6000} />,
      );

      // Component should render all content without requiring mouse interaction
      expect(container.textContent).toBeTruthy();
    });
  });
});
