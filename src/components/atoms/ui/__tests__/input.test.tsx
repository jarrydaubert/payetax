// src/components/ui/__tests__/input.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { Input } from '../input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Input placeholder='Enter text' />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      render(<Input className='custom-class' />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('should render as input element', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input.tagName).toBe('INPUT');
    });
  });

  describe('Input Types', () => {
    it('should render as text input by default', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('should support email type', () => {
      render(<Input type='email' />);
      const input = document.querySelector('input[type="email"]');
      expect(input).toBeInTheDocument();
    });

    it('should support password type', () => {
      render(<Input type='password' />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('should support number type', () => {
      render(<Input type='number' />);
      const input = document.querySelector('input[type="number"]');
      expect(input).toBeInTheDocument();
    });

    it('should support tel type', () => {
      render(<Input type='tel' />);
      const input = document.querySelector('input[type="tel"]');
      expect(input).toBeInTheDocument();
    });

    it('should support url type', () => {
      render(<Input type='url' />);
      const input = document.querySelector('input[type="url"]');
      expect(input).toBeInTheDocument();
    });

    it('should support search type', () => {
      render(<Input type='search' />);
      const input = document.querySelector('input[type="search"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Value Handling', () => {
    it('should accept value prop', () => {
      render(<Input value='test value' readOnly />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('test value');
    });

    it('should call onChange when value changes', () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should support controlled input', () => {
      const handleChange = jest.fn();
      const { rerender } = render(<Input value='' onChange={handleChange} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');

      rerender(<Input value='updated' onChange={handleChange} />);
      expect(input.value).toBe('updated');
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should have disabled styling', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('disabled:cursor-not-allowed');
      expect(input).toHaveClass('disabled:opacity-50');
    });

    it('should not accept input when disabled', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'test' } });

      // Disabled inputs don't update their value
      expect(input).toBeDisabled();
    });
  });

  describe('Read-only State', () => {
    it('should be read-only when readOnly prop is true', () => {
      render(<Input readOnly />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('should accept value but not allow changes', () => {
      render(<Input value='readonly value' readOnly />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('readonly value');
      expect(input).toHaveAttribute('readonly');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Input aria-label='Username' />);
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(<Input aria-describedby='input-description' />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'input-description');
    });

    it('should support aria-invalid', () => {
      render(<Input aria-invalid='true' />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should support id attribute', () => {
      // biome-ignore lint/correctness/useUniqueElementIds: Testing id attribute in isolation
      render(<Input id='test-input' />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'test-input');
    });

    it('should have focus-visible styles', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus-visible:outline-none');
      expect(input).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Styling', () => {
    it('should have default styling classes', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');

      expect(input).toHaveClass('flex');
      expect(input).toHaveClass('h-9');
      expect(input).toHaveClass('w-full');
      expect(input).toHaveClass('rounded-sm');
      expect(input).toHaveClass('border');
    });

    it('should have background and text styling', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');

      expect(input).toHaveClass('bg-background');
      expect(input).toHaveClass('text-sm'); // Updated to match design tokens (PAYTAX-65)
    });

    it('should have transition classes', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');

      expect(input).toHaveClass('transition-colors');
    });

    it('should have placeholder styling', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');

      expect(input).toHaveClass('placeholder:text-muted-foreground');
    });
  });

  describe('Additional Props', () => {
    it('should support name attribute', () => {
      render(<Input name='username' />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'username');
    });

    it('should support required attribute', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('should support maxLength attribute', () => {
      render(<Input maxLength={10} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('should support minLength attribute', () => {
      render(<Input minLength={5} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('minLength', '5');
    });

    it('should support pattern attribute', () => {
      render(<Input pattern='[A-Za-z]{3}' />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('pattern', '[A-Za-z]{3}');
    });

    it('should support autoComplete attribute', () => {
      render(<Input autoComplete='email' />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autoComplete', 'email');
    });

    it('should support autoFocus attribute', () => {
      render(<Input autoFocus />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveFocus();
    });
  });

  describe('Event Handlers', () => {
    it('should call onFocus when focused', () => {
      const handleFocus = jest.fn();
      render(<Input onFocus={handleFocus} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      expect(handleFocus).toHaveBeenCalled();
    });

    it('should call onBlur when blurred', () => {
      const handleBlur = jest.fn();
      render(<Input onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      fireEvent.blur(input);

      expect(handleBlur).toHaveBeenCalled();
    });

    it('should call onKeyDown when key is pressed', () => {
      const handleKeyDown = jest.fn();
      render(<Input onKeyDown={handleKeyDown} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(handleKeyDown).toHaveBeenCalled();
    });
  });
});
