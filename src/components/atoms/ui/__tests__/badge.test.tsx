// src/components/ui/__tests__/badge.test.tsx

import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';

describe('Badge', () => {
  describe('rendering', () => {
    it('should render badge with text content', () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('should render badge as a div element', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.firstChild;
      expect(badge?.nodeName).toBe('DIV');
    });
  });

  describe('variants', () => {
    it('should render default variant', () => {
      const { container } = render(<Badge>Default</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-primary');
      expect(badge.className).toContain('text-primary-foreground');
    });

    it('should render secondary variant', () => {
      const { container } = render(<Badge variant='secondary'>Secondary</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-secondary');
      expect(badge.className).toContain('text-secondary-foreground');
    });

    it('should render destructive variant', () => {
      const { container } = render(<Badge variant='destructive'>Destructive</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-destructive');
      expect(badge.className).toContain('text-destructive-foreground');
    });

    it('should render outline variant', () => {
      const { container } = render(<Badge variant='outline'>Outline</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('text-foreground');
    });
  });

  describe('styling', () => {
    it('should apply base classes', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('inline-flex');
      expect(badge.className).toContain('items-center');
      expect(badge.className).toContain('rounded-full');
      expect(badge.className).toContain('border');
    });

    it('should merge custom className with variant classes', () => {
      const { container } = render(<Badge className='custom-class'>Test</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('custom-class');
      expect(badge.className).toContain('bg-primary'); // Default variant
    });

    it('should apply custom className correctly', () => {
      render(<Badge className='test-custom-class'>Test</Badge>);
      const badge = screen.getByText('Test');
      expect(badge).toHaveClass('test-custom-class');
    });
  });

  describe('props', () => {
    it('should spread additional HTML attributes', () => {
      render(
        <Badge data-testid='custom-badge' aria-label='Custom Badge'>
          Test
        </Badge>,
      );
      const badge = screen.getByTestId('custom-badge');
      expect(badge).toHaveAttribute('aria-label', 'Custom Badge');
    });

    it('should handle onClick event', () => {
      const handleClick = jest.fn();
      render(<Badge onClick={handleClick}>Clickable</Badge>);
      const badge = screen.getByText('Clickable');
      badge.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should accept data-testid prop', () => {
      render(<Badge data-testid='test-badge'>Test</Badge>);
      const badge = screen.getByTestId('test-badge');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should support aria-label', () => {
      render(<Badge aria-label='Status badge'>Active</Badge>);
      const badge = screen.getByLabelText('Status badge');
      expect(badge).toBeInTheDocument();
    });

    it('should support aria attributes', () => {
      render(
        <Badge aria-label='Status badge' data-testid='status-badge'>
          Active
        </Badge>,
      );
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveAttribute('aria-label', 'Status badge');
    });
  });

  describe('content types', () => {
    it('should render with number content', () => {
      render(<Badge>42</Badge>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render with multiple children', () => {
      render(
        <Badge>
          <span>Icon</span>
          <span>Text</span>
        </Badge>,
      );
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('should render empty badge', () => {
      const { container } = render(<Badge />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toBeInTheDocument();
      expect(badge.textContent).toBe('');
    });
  });
});
