// src/components/ui/__tests__/skeleton.test.tsx
import { render, screen } from '@testing-library/react';
import { Skeleton } from '../skeleton';

describe('Skeleton Component', () => {
  describe('Rendering', () => {
    it('should render skeleton element', () => {
      render(<Skeleton data-testid='skeleton' />);
      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('should render as a div element', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild;
      expect(skeleton?.nodeName).toBe('DIV');
    });

    it('should accept children', () => {
      render(
        <Skeleton>
          <span>Loading content</span>
        </Skeleton>,
      );
      expect(screen.getByText('Loading content')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have default skeleton classes', () => {
      render(<Skeleton data-testid='skeleton' />);
      const skeleton = screen.getByTestId('skeleton');

      expect(skeleton).toHaveClass('animate-pulse');
      expect(skeleton).toHaveClass('rounded-md');
      expect(skeleton).toHaveClass('bg-muted');
    });

    it('should accept custom className', () => {
      render(<Skeleton className='custom-class' data-testid='skeleton' />);
      const skeleton = screen.getByTestId('skeleton');

      expect(skeleton).toHaveClass('custom-class');
      expect(skeleton).toHaveClass('animate-pulse'); // Still has defaults
    });

    it('should merge className properly', () => {
      render(<Skeleton className='h-4 w-full' data-testid='skeleton' />);
      const skeleton = screen.getByTestId('skeleton');

      expect(skeleton).toHaveClass('h-4');
      expect(skeleton).toHaveClass('w-full');
      expect(skeleton).toHaveClass('animate-pulse');
      expect(skeleton).toHaveClass('bg-muted');
    });
  });

  describe('HTML Attributes', () => {
    it('should support data attributes', () => {
      render(<Skeleton data-testid='test-skeleton' data-id='123' />);
      const skeleton = screen.getByTestId('test-skeleton');

      expect(skeleton).toHaveAttribute('data-id', '123');
    });

    it('should support aria attributes', () => {
      render(<Skeleton data-testid='skeleton' aria-label='Loading content' aria-busy='true' />);
      const skeleton = screen.getByTestId('skeleton');

      expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
    });

    it('should support id attribute', () => {
      // biome-ignore lint/correctness/useUniqueElementIds: Testing id attribute
      render(<Skeleton id='loading-skeleton' data-testid='skeleton' />);
      const skeleton = screen.getByTestId('skeleton');

      expect(skeleton).toHaveAttribute('id', 'loading-skeleton');
    });
  });

  describe('Common Loading Patterns', () => {
    it('should render text line skeleton', () => {
      render(<Skeleton className='h-4 w-[250px]' data-testid='text-line' />);
      const skeleton = screen.getByTestId('text-line');

      expect(skeleton).toHaveClass('h-4');
      expect(skeleton).toHaveClass('w-[250px]');
    });

    it('should render card skeleton', () => {
      render(
        <div className='flex flex-col space-y-3'>
          <Skeleton className='h-[125px] w-[250px] rounded-xl' data-testid='card' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-[250px]' />
            <Skeleton className='h-4 w-[200px]' />
          </div>
        </div>,
      );

      const cardSkeleton = screen.getByTestId('card');
      expect(cardSkeleton).toHaveClass('h-[125px]');
      expect(cardSkeleton).toHaveClass('w-[250px]');
      expect(cardSkeleton).toHaveClass('rounded-xl');
    });

    it('should render avatar skeleton', () => {
      render(<Skeleton className='size-12 rounded-full' data-testid='avatar' />);
      const skeleton = screen.getByTestId('avatar');

      expect(skeleton).toHaveClass('size-12');
      expect(skeleton).toHaveClass('rounded-full');
    });

    it('should render button skeleton', () => {
      render(<Skeleton className='h-10 w-24 rounded-md' data-testid='button' />);
      const skeleton = screen.getByTestId('button');

      expect(skeleton).toHaveClass('h-10');
      expect(skeleton).toHaveClass('w-24');
    });
  });

  describe('Accessibility', () => {
    it('should be screen reader friendly with aria-label', () => {
      render(<Skeleton aria-label='Loading user profile' data-testid='skeleton' />);
      const skeleton = screen.getByTestId('skeleton');

      expect(skeleton).toHaveAccessibleName('Loading user profile');
    });

    it('should support aria-busy for loading states', () => {
      render(<Skeleton aria-busy='true' data-testid='skeleton' />);
      const skeleton = screen.getByTestId('skeleton');

      expect(skeleton).toHaveAttribute('aria-busy', 'true');
    });

    it('should be identifiable by role when needed', () => {
      render(<Skeleton role='status' aria-label='Loading' data-testid='skeleton' />);
      const skeleton = screen.getByTestId('skeleton');

      expect(skeleton).toHaveAttribute('role', 'status');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading');
    });
  });

  describe('Animation', () => {
    it('should have pulse animation by default', () => {
      render(<Skeleton data-testid='skeleton' />);
      const skeleton = screen.getByTestId('skeleton');

      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('should allow custom animation overrides', () => {
      render(<Skeleton className='animate-none' data-testid='skeleton' />);
      const skeleton = screen.getByTestId('skeleton');

      // Custom class should override (depends on Tailwind ordering)
      expect(skeleton.className).toContain('animate-none');
    });
  });

  describe('Edge Cases', () => {
    it('should render with no props', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild;

      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('should handle multiple skeletons', () => {
      render(
        <div>
          <Skeleton data-testid='skeleton-1' />
          <Skeleton data-testid='skeleton-2' />
          <Skeleton data-testid='skeleton-3' />
        </div>,
      );

      expect(screen.getByTestId('skeleton-1')).toBeInTheDocument();
      expect(screen.getByTestId('skeleton-2')).toBeInTheDocument();
      expect(screen.getByTestId('skeleton-3')).toBeInTheDocument();
    });

    it('should work with different sizes', () => {
      const { rerender } = render(<Skeleton className='h-4 w-full' data-testid='skeleton' />);
      expect(screen.getByTestId('skeleton')).toHaveClass('h-4');

      rerender(<Skeleton className='h-8 w-full' data-testid='skeleton' />);
      expect(screen.getByTestId('skeleton')).toHaveClass('h-8');
    });
  });
});
