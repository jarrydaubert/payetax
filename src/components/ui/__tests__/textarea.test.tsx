// src/components/ui/__tests__/textarea.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { Textarea } from '../textarea';

describe('Textarea Component', () => {
  it('should render textarea element', () => {
    render(<Textarea />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('should render with placeholder', () => {
    render(<Textarea placeholder='Enter your message' />);
    expect(screen.getByPlaceholderText('Enter your message')).toBeInTheDocument();
  });

  it('should accept custom className', () => {
    render(<Textarea className='custom-class' />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-class');
  });

  describe('Value Handling', () => {
    it('should accept value prop', () => {
      render(<Textarea value='test value' readOnly />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('test value');
    });

    it('should call onChange when value changes', () => {
      const handleChange = jest.fn();
      render(<Textarea onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'new value' } });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should support controlled textarea', () => {
      const handleChange = jest.fn();
      const { rerender } = render(<Textarea value='' onChange={handleChange} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('');

      rerender(<Textarea value='updated text' onChange={handleChange} />);
      expect(textarea.value).toBe('updated text');
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('should have disabled styling', () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('disabled:cursor-not-allowed');
      expect(textarea).toHaveClass('disabled:opacity-50');
    });
  });

  describe('Read-only State', () => {
    it('should be read-only when readOnly prop is true', () => {
      render(<Textarea readOnly />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('readonly');
    });

    it('should accept value but not allow changes', () => {
      render(<Textarea value='readonly text' readOnly />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('readonly text');
      expect(textarea).toHaveAttribute('readonly');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Textarea aria-label='Message' />);
      expect(screen.getByLabelText('Message')).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(<Textarea aria-describedby='textarea-description' />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'textarea-description');
    });

    it('should support aria-invalid', () => {
      render(<Textarea aria-invalid='true' />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('should support id attribute', () => {
      render(<Textarea id='test-textarea' />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'test-textarea');
    });

    it('should have focus-visible styles', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('focus-visible:outline-none');
      expect(textarea).toHaveClass('focus-visible:ring-1');
    });
  });

  describe('Styling', () => {
    it('should have default styling classes', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      expect(textarea).toHaveClass('flex');
      expect(textarea).toHaveClass('min-h-[60px]');
      expect(textarea).toHaveClass('w-full');
      expect(textarea).toHaveClass('rounded-md');
      expect(textarea).toHaveClass('border');
    });

    it('should have background and text styling', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      expect(textarea).toHaveClass('bg-transparent');
      expect(textarea).toHaveClass('text-base');
    });

    it('should have placeholder styling', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      expect(textarea).toHaveClass('placeholder:text-muted-foreground');
    });
  });

  describe('Additional Props', () => {
    it('should support name attribute', () => {
      render(<Textarea name='message' />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('name', 'message');
    });

    it('should support required attribute', () => {
      render(<Textarea required />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeRequired();
    });

    it('should support rows attribute', () => {
      render(<Textarea rows={5} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('should support cols attribute', () => {
      render(<Textarea cols={40} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('cols', '40');
    });

    it('should support maxLength attribute', () => {
      render(<Textarea maxLength={100} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxLength', '100');
    });

    it('should support autoFocus attribute', () => {
      render(<Textarea autoFocus />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveFocus();
    });
  });

  describe('Event Handlers', () => {
    it('should call onFocus when focused', () => {
      const handleFocus = jest.fn();
      render(<Textarea onFocus={handleFocus} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.focus(textarea);

      expect(handleFocus).toHaveBeenCalled();
    });

    it('should call onBlur when blurred', () => {
      const handleBlur = jest.fn();
      render(<Textarea onBlur={handleBlur} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.blur(textarea);

      expect(handleBlur).toHaveBeenCalled();
    });

    it('should call onKeyDown when key is pressed', () => {
      const handleKeyDown = jest.fn();
      render(<Textarea onKeyDown={handleKeyDown} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.keyDown(textarea, { key: 'Enter' });

      expect(handleKeyDown).toHaveBeenCalled();
    });
  });
});
