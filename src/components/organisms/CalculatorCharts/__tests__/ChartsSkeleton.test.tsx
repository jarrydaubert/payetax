/**
 * ChartsSkeleton Component Tests
 * Phase 4: Fix coverage threshold violations
 *
 * Tests the loading skeleton displayed while charts are lazy-loaded.
 * Critical for preventing CLS (Cumulative Layout Shift).
 */

import { render, screen } from '@testing-library/react';
import { ChartsSkeleton } from '../ChartsSkeleton';

describe('ChartsSkeleton', () => {
  describe('Rendering', () => {
    it('should render skeleton component', () => {
      const { container } = render(<ChartsSkeleton />);

      // Component should render
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render multiple skeleton placeholders', () => {
      render(<ChartsSkeleton />);

      // Should have many skeleton elements (animate-pulse class)
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render grid container', () => {
      const { container } = render(<ChartsSkeleton />);

      const gridContainer = container.firstChild as HTMLElement;
      expect(gridContainer).toHaveClass('grid');
    });
  });

  describe('Layout', () => {
    it('should use grid layout for responsive design', () => {
      const { container } = render(<ChartsSkeleton />);

      const gridContainer = container.firstChild as HTMLElement;
      expect(gridContainer).toHaveClass('grid');
    });

    it('should have 2-column layout on medium screens', () => {
      const { container } = render(<ChartsSkeleton />);

      const gridContainer = container.firstChild as HTMLElement;
      expect(gridContainer).toHaveClass('md:grid-cols-2');
    });

    it('should have proper spacing between cards', () => {
      const { container } = render(<ChartsSkeleton />);

      const gridContainer = container.firstChild as HTMLElement;
      // Uses SPACING.GAP_6 which is gap-6
      expect(gridContainer.className).toMatch(/gap-/);
    });

    it('should have top margin for spacing from content above', () => {
      const { container } = render(<ChartsSkeleton />);

      const gridContainer = container.firstChild as HTMLElement;
      // Uses SPACING.MT_6 which is mt-6
      expect(gridContainer.className).toMatch(/mt-/);
    });
  });

  describe('Accessibility', () => {
    it('should not have any interactive elements', () => {
      render(<ChartsSkeleton />);

      // Skeletons should not be interactive - no buttons or links
      expect(screen.queryAllByRole('button')).toHaveLength(0);
      expect(screen.queryAllByRole('link')).toHaveLength(0);
    });

    it('should render skeletons with animate-pulse class', () => {
      render(<ChartsSkeleton />);

      // Skeleton elements use animate-pulse for loading animation
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('CLS Prevention', () => {
    it('should render fixed-height skeleton elements', () => {
      render(<ChartsSkeleton />);

      // Should have skeleton elements with defined dimensions
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);

      // Check that some skeletons have height classes
      const hasHeightSkeletons = Array.from(skeletons).some((s) => s.className.includes('h-'));
      expect(hasHeightSkeletons).toBe(true);
    });
  });
});
