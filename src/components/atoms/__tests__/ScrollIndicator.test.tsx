// src/components/atoms/__tests__/ScrollIndicator.test.tsx
import { render } from '@testing-library/react';
import { ScrollIndicator } from '../ScrollIndicator';

describe('ScrollIndicator Component', () => {
  describe('Rendering', () => {
    it('should render left indicator', () => {
      const { container } = render(<ScrollIndicator direction='left' visible={true} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render right indicator', () => {
      const { container } = render(<ScrollIndicator direction='right' visible={true} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render when visible is true', () => {
      const { container } = render(<ScrollIndicator direction='left' visible={true} />);

      const indicator = container.firstChild;
      expect(indicator).toBeInTheDocument();
    });

    it('should render when visible is false', () => {
      const { container } = render(<ScrollIndicator direction='left' visible={false} />);

      // Component still renders but with opacity 0
      const indicator = container.firstChild;
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Direction - Left', () => {
    it('should position left indicator correctly', () => {
      const { container } = render(<ScrollIndicator direction='left' visible={true} />);

      const indicator = container.firstChild as HTMLElement;
      expect(indicator.className).toContain('left-0');
      expect(indicator.className).toContain('justify-start');
    });

    it('should have correct gradient for left', () => {
      const { container } = render(<ScrollIndicator direction='left' visible={true} />);

      const indicator = container.firstChild as HTMLElement;
      expect(indicator.className).toContain('bg-gradient-to-r');
    });

    it('should render ChevronLeft icon', () => {
      const { container } = render(<ScrollIndicator direction='left' visible={true} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Direction - Right', () => {
    it('should position right indicator correctly', () => {
      const { container } = render(<ScrollIndicator direction='right' visible={true} />);

      const indicator = container.firstChild as HTMLElement;
      expect(indicator.className).toContain('right-0');
      expect(indicator.className).toContain('justify-end');
    });

    it('should have correct gradient for right', () => {
      const { container } = render(<ScrollIndicator direction='right' visible={true} />);

      const indicator = container.firstChild as HTMLElement;
      expect(indicator.className).toContain('bg-gradient-to-l');
    });

    it('should render ChevronRight icon', () => {
      const { container } = render(<ScrollIndicator direction='right' visible={true} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Visibility', () => {
    it('should be visible when visible prop is true', () => {
      const { container } = render(<ScrollIndicator direction='left' visible={true} />);

      const indicator = container.firstChild;
      expect(indicator).toBeInTheDocument();
    });

    it('should render with opacity when visible is false', () => {
      const { container } = render(<ScrollIndicator direction='left' visible={false} />);

      const indicator = container.firstChild;
      expect(indicator).toBeInTheDocument();
    });

    it('should update when visible prop changes', () => {
      const { container, rerender } = render(<ScrollIndicator direction='left' visible={false} />);

      let indicator = container.firstChild;
      expect(indicator).toBeInTheDocument();

      rerender(<ScrollIndicator direction='left' visible={true} />);

      indicator = container.firstChild;
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have pointer-events-none class', () => {
      const { container } = render(<ScrollIndicator direction='left' visible={true} />);

      const indicator = container.firstChild as HTMLElement;
      expect(indicator.className).toContain('pointer-events-none');
    });

    it('should have absolute positioning', () => {
      const { container } = render(<ScrollIndicator direction='left' visible={true} />);

      const indicator = container.firstChild as HTMLElement;
      expect(indicator.className).toContain('absolute');
    });

    it('should have z-index class', () => {
      const { container } = render(<ScrollIndicator direction='left' visible={true} />);

      const indicator = container.firstChild as HTMLElement;
      expect(indicator.className).toContain('z-10');
    });

    it('should have flex display', () => {
      const { container } = render(<ScrollIndicator direction='left' visible={true} />);

      const indicator = container.firstChild as HTMLElement;
      expect(indicator.className).toContain('flex');
      expect(indicator.className).toContain('items-center');
    });

    it('should have gradient background classes', () => {
      const { container } = render(<ScrollIndicator direction='left' visible={true} />);

      const indicator = container.firstChild as HTMLElement;
      expect(indicator.className).toContain('from-background');
      expect(indicator.className).toContain('to-transparent');
    });

    it('should have width classes', () => {
      const { container } = render(<ScrollIndicator direction='left' visible={true} />);

      const indicator = container.firstChild as HTMLElement;
      expect(indicator.className).toContain('w-16');
      expect(indicator.className).toContain('md:w-20');
    });
  });

  describe('Icon Styling', () => {
    it('should have primary color on icon', () => {
      const { container } = render(<ScrollIndicator direction='left' visible={true} />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('text-primary');
    });

    it('should have drop shadow on icon', () => {
      const { container } = render(<ScrollIndicator direction='left' visible={true} />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('drop-shadow-lg');
    });

    it('should have responsive size classes on icon', () => {
      const { container } = render(<ScrollIndicator direction='left' visible={true} />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('size-5');
      expect(icon).toHaveClass('md:size-6');
    });
  });

  describe('Animation Props', () => {
    it('should render with Framer Motion component', () => {
      const { container } = render(<ScrollIndicator direction='left' visible={true} />);

      const indicator = container.firstChild;
      expect(indicator).toBeInTheDocument();
    });

    it('should render different directions without errors', () => {
      const { rerender } = render(<ScrollIndicator direction='left' visible={true} />);

      expect(() => {
        rerender(<ScrollIndicator direction='right' visible={true} />);
      }).not.toThrow();
    });

    it('should toggle visibility without errors', () => {
      const { rerender } = render(<ScrollIndicator direction='left' visible={true} />);

      expect(() => {
        rerender(<ScrollIndicator direction='left' visible={false} />);
        rerender(<ScrollIndicator direction='left' visible={true} />);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle unmounting', () => {
      const { unmount } = render(<ScrollIndicator direction='left' visible={true} />);

      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid visibility changes', () => {
      const { rerender } = render(<ScrollIndicator direction='left' visible={true} />);

      expect(() => {
        for (let i = 0; i < 5; i++) {
          rerender(<ScrollIndicator direction='left' visible={i % 2 === 0} />);
        }
      }).not.toThrow();
    });

    it('should handle rapid direction changes', () => {
      const { rerender } = render(<ScrollIndicator direction='left' visible={true} />);

      expect(() => {
        for (let i = 0; i < 5; i++) {
          rerender(<ScrollIndicator direction={i % 2 === 0 ? 'left' : 'right'} visible={true} />);
        }
      }).not.toThrow();
    });

    it('should handle both props changing simultaneously', () => {
      const { rerender } = render(<ScrollIndicator direction='left' visible={true} />);

      expect(() => {
        rerender(<ScrollIndicator direction='right' visible={false} />);
      }).not.toThrow();
    });
  });
});
