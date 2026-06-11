// src/components/ui/__tests__/checkbox.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { Checkbox } from '../checkbox';

describe('Checkbox Component', () => {
  describe('Rendering', () => {
    it('should render checkbox', () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should render unchecked by default', () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should render checked when checked prop is true', () => {
      render(<Checkbox checked={true} onCheckedChange={() => {}} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should render with aria-label', () => {
      render(<Checkbox aria-label='Accept terms' />);
      expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Checkbox className='custom-checkbox' />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('custom-checkbox');
    });
  });

  describe('Interactions', () => {
    it('should call onCheckedChange when clicked', () => {
      const handleChange = jest.fn();
      render(<Checkbox onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('should toggle between checked and unchecked', () => {
      const handleChange = jest.fn();
      render(<Checkbox onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');

      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenNthCalledWith(1, true);

      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenNthCalledWith(2, false);
    });

    it('should work as controlled component', () => {
      const TestComponent = () => {
        const [checked, setChecked] = React.useState(false);
        return (
          <Checkbox checked={checked} onCheckedChange={(value) => setChecked(value === true)} />
        );
      };

      render(<TestComponent />);
      const checkbox = screen.getByRole('checkbox');

      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should be keyboard accessible', () => {
      const handleChange = jest.fn();
      render(<Checkbox onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();

      // Radix handles keyboard natively, just verify it's focusable
      expect(checkbox).toHaveFocus();
    });
  });

  describe('Disabled State', () => {
    it('should render disabled checkbox', () => {
      render(<Checkbox disabled />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('should not call onCheckedChange when disabled', () => {
      const handleChange = jest.fn();
      render(<Checkbox disabled onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should have disabled styling', () => {
      render(<Checkbox disabled />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('disabled:cursor-not-allowed');
      expect(checkbox).toHaveClass('disabled:opacity-50');
    });

    it('should render checked and disabled', () => {
      render(<Checkbox checked={true} disabled onCheckedChange={() => {}} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
      expect(checkbox).toBeDisabled();
    });
  });

  describe('Indeterminate State', () => {
    it('should support indeterminate state', () => {
      render(<Checkbox checked='indeterminate' onCheckedChange={() => {}} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
    });

    it('should call onCheckedChange from indeterminate state', () => {
      const handleChange = jest.fn();
      render(<Checkbox checked='indeterminate' onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<Checkbox aria-label='Test checkbox' />);
      const checkbox = screen.getByRole('checkbox');

      checkbox.focus();
      expect(checkbox).toHaveFocus();
    });

    it('should support aria-describedby', () => {
      render(<Checkbox aria-describedby='checkbox-description' />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-describedby', 'checkbox-description');
    });

    it('should support required attribute', () => {
      render(<Checkbox required />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeRequired();
    });

    it('should support id attribute', () => {
      // biome-ignore lint/correctness/useUniqueElementIds: Testing id attribute in isolation
      render(<Checkbox id='terms-checkbox' />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('id', 'terms-checkbox');
    });
  });

  describe('Form Integration', () => {
    it('should work in form context with name attribute', () => {
      const handleSubmit = jest.fn((e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        return formData.get('terms');
      });

      render(
        <form onSubmit={handleSubmit}>
          <Checkbox name='terms' value='accepted' defaultChecked />
          <button type='submit'>Submit</button>
        </form>,
      );

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should support default checked state', () => {
      render(<Checkbox defaultChecked />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid clicking', () => {
      const handleChange = jest.fn();
      render(<Checkbox onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');

      fireEvent.click(checkbox);
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);

      expect(handleChange).toHaveBeenCalledTimes(3);
    });

    it('should handle unmounting', () => {
      const { unmount } = render(<Checkbox />);
      expect(() => unmount()).not.toThrow();
    });

    it('should handle re-rendering with different props', () => {
      const { rerender } = render(<Checkbox checked={false} onCheckedChange={() => {}} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      rerender(<Checkbox checked={true} onCheckedChange={() => {}} />);
      expect(checkbox).toBeChecked();
    });
  });
});

// Import React for controlled component test
import * as React from 'react';
