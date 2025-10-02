// src/components/ui/__tests__/Button.test.tsx

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../Button';

describe('Button Component', () => {
  describe('Basic Functionality', () => {
    it('renders with text content', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
      render(<Button disabled>Disabled button</Button>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
    });
  });

  describe('Variants', () => {
    it('renders primary variant correctly', () => {
      render(<Button variant='default'>Primary</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('btn', 'btn-primary');
    });

    it('renders secondary variant correctly', () => {
      render(<Button variant='secondary'>Secondary</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('btn', 'btn-secondary');
    });

    it('renders outline variant correctly', () => {
      render(<Button variant='outline'>Outline</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('btn', 'btn-outline');
    });

    it('renders ghost variant correctly', () => {
      render(<Button variant='ghost'>Ghost</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('btn', 'btn-ghost');
    });
  });

  describe('Sizes', () => {
    it('renders small size correctly', () => {
      render(<Button size='sm'>Small</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('text-small', 'px-3', 'py-1.5');
    });

    it('renders medium size correctly (default)', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('text-body', 'px-4', 'py-2');
    });

    it('renders large size correctly', () => {
      render(<Button size='lg'>Large</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('text-large', 'px-6', 'py-3');
    });
  });

  describe('Loading State', () => {
    it('shows loading state correctly', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
      // Loading spinner should be present
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('prevents clicks when loading', () => {
      const handleClick = jest.fn();
      render(
        <Button loading onClick={handleClick}>
          Loading
        </Button>
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Icons', () => {
    const TestIcon = () => <span data-testid='test-icon'>🔥</span>;

    it('renders with left icon only', () => {
      render(<Button leftIcon={<TestIcon />}>Icon Button</Button>);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveClass('btn');
    });

    it('renders with left icon and text', () => {
      render(<Button leftIcon={<TestIcon />}>With Icon</Button>);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    it('renders with right icon and text', () => {
      render(<Button rightIcon={<TestIcon />}>With Icon</Button>);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('supports aria-label for buttons', () => {
      const TestIcon = () => <span data-testid='test-icon'>🔥</span>;
      render(
        <Button leftIcon={<TestIcon />} aria-label='Fire button'>
          Fire
        </Button>
      );

      expect(screen.getByRole('button', { name: 'Fire button' })).toBeInTheDocument();
    });

    it('supports custom aria attributes', () => {
      render(
        <Button aria-describedby='button-help' aria-expanded='false'>
          Toggle
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'button-help');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('is focusable by default', () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByRole('button');

      button.focus();
      expect(button).toHaveFocus();
    });

    it('cannot be focused when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');

      button.focus();
      expect(button).not.toHaveFocus();
    });
  });

  describe('Form Integration', () => {
    it('can submit forms', () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());
      render(
        <form onSubmit={handleSubmit}>
          <Button type='submit'>Submit</Button>
        </form>
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('can reset forms', () => {
      render(
        <form>
          <Button type='reset'>Reset</Button>
        </form>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('CSS Classes', () => {
    it('applies custom className', () => {
      render(<Button className='custom-class'>Custom</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('custom-class');
    });

    it('merges custom classes with default classes', () => {
      render(<Button className='custom-class'>Merged</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('px-4'); // Default classes should still be present
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined children gracefully', () => {
      render(<Button>{undefined}</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles empty string children', () => {
      render(<Button>{''}</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles multiple variant props (should use first valid one)', () => {
      render(<Button variant='default'>Multi Variant</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('btn-primary');
    });
  });
});
