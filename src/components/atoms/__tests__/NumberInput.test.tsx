// src/components/atoms/__tests__/NumberInput.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NumberInput from '../NumberInput';

describe('NumberInput Component', () => {
  describe('Regression Tests - Critical Features', () => {
    it('should allow decimals when decimals prop is set', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(<NumberInput value={0} onChange={mockOnChange} decimals={2} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, '123.45');

      expect(input.value).toBe('123.45');
    });

    it('should show thousand separators (commas) as user types', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(<NumberInput value={0} onChange={mockOnChange} decimals={0} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, '1234567');

      // Should format as 1,234,567
      expect(input.value).toBe('1,234,567');
    });

    it('should show commas with decimals', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(<NumberInput value={0} onChange={mockOnChange} decimals={2} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, '12345.67');

      // Should format as 12,345.67
      expect(input.value).toBe('12,345.67');
    });

    it('should preserve decimal point while typing', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(<NumberInput value={0} onChange={mockOnChange} decimals={2} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, '100.');

      // Should allow typing decimal point
      expect(input.value).toBe('100.');
    });
  });

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render with initial value', () => {
      render(<NumberInput value={1000} onChange={mockOnChange} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('1,000');
    });

    it('should render with prefix', () => {
      render(<NumberInput value={100} onChange={mockOnChange} prefix='£' />);
      expect(screen.getByText('£')).toBeInTheDocument();
    });

    it('should render with suffix', () => {
      render(<NumberInput value={5} onChange={mockOnChange} suffix='%' />);
      expect(screen.getByText('%')).toBeInTheDocument();
    });

    it('should render with both prefix and suffix', () => {
      render(<NumberInput value={100} onChange={mockOnChange} prefix='£' suffix='GBP' />);
      expect(screen.getByText('£')).toBeInTheDocument();
      expect(screen.getByText('GBP')).toBeInTheDocument();
    });
  });

  describe('Value Changes', () => {
    it('should call onChange when user types a value and blurs', () => {
      render(<NumberInput value={0} onChange={mockOnChange} />);
      const input = screen.getByRole('textbox');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '500' } });
      fireEvent.blur(input);

      expect(mockOnChange).toHaveBeenCalledWith(500);
    });

    it('should handle decimal values when decimals prop is set', () => {
      render(<NumberInput value={0} onChange={mockOnChange} decimals={2} />);
      const input = screen.getByRole('textbox');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '10.50' } });
      fireEvent.blur(input);

      expect(mockOnChange).toHaveBeenCalledWith(10.5);
    });

    it('should handle formatted values with commas', () => {
      render(<NumberInput value={0} onChange={mockOnChange} />);
      const input = screen.getByRole('textbox');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '1,000' } });
      fireEvent.blur(input);

      expect(mockOnChange).toHaveBeenCalledWith(1000);
    });

    it('should handle invalid input gracefully', () => {
      render(<NumberInput value={100} onChange={mockOnChange} />);
      const input = screen.getByRole('textbox');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'abc' } });
      fireEvent.blur(input);

      // Should call onChange with 0 for invalid input
      expect(mockOnChange).toHaveBeenCalledWith(0);
    });
  });

  describe('Focus Behavior', () => {
    it('should clear value on focus when clearOnFocus is true', () => {
      render(<NumberInput value={1000} onChange={mockOnChange} clearOnFocus={true} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      fireEvent.focus(input);

      expect(input.value).toBe('');
    });

    it('should not clear value on focus when clearOnFocus is false', () => {
      render(<NumberInput value={1000} onChange={mockOnChange} clearOnFocus={false} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      fireEvent.focus(input);

      expect(input.value).toBe('1,000');
    });

    it('should format value on blur', () => {
      const { rerender } = render(
        <NumberInput value={1000} onChange={mockOnChange} decimals={2} />,
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '500' } });
      fireEvent.blur(input);

      // Simulate parent updating value after onChange
      rerender(<NumberInput value={500} onChange={mockOnChange} decimals={2} />);

      // Should format to show decimals
      expect(input.value).toBe('500.00');
    });
  });

  describe('Increment/Decrement Controls', () => {
    it('should show controls when showControls is true', () => {
      render(<NumberInput value={10} onChange={mockOnChange} showControls={true} />);

      const incrementButton = screen.getByLabelText(/increment/i);
      const decrementButton = screen.getByLabelText(/decrement/i);

      expect(incrementButton).toBeInTheDocument();
      expect(decrementButton).toBeInTheDocument();
    });

    it('should not show controls when showControls is false', () => {
      render(<NumberInput value={10} onChange={mockOnChange} showControls={false} />);

      const incrementButton = screen.queryByLabelText(/increment/i);
      const decrementButton = screen.queryByLabelText(/decrement/i);

      expect(incrementButton).not.toBeInTheDocument();
      expect(decrementButton).not.toBeInTheDocument();
    });

    it('should increment value when increment button clicked', () => {
      render(<NumberInput value={10} onChange={mockOnChange} showControls={true} />);

      const incrementButton = screen.getByLabelText(/increment/i);
      fireEvent.click(incrementButton);

      expect(mockOnChange).toHaveBeenCalledWith(11);
    });

    it('should decrement value when decrement button clicked', () => {
      render(<NumberInput value={10} onChange={mockOnChange} showControls={true} />);

      const decrementButton = screen.getByLabelText(/decrement/i);
      fireEvent.click(decrementButton);

      expect(mockOnChange).toHaveBeenCalledWith(9);
    });

    it('should not go below 0 when decrementing', () => {
      render(<NumberInput value={2} onChange={mockOnChange} showControls={true} />);

      const decrementButton = screen.getByLabelText(/decrement/i);

      // Decrement 3 times (should stop at 0)
      for (let i = 0; i < 3; i++) {
        fireEvent.click(decrementButton);
      }

      expect(mockOnChange).toHaveBeenLastCalledWith(0);
    });

    it('should increment value beyond initial value', () => {
      render(<NumberInput value={8} onChange={mockOnChange} showControls={true} />);

      const incrementButton = screen.getByLabelText(/increment/i);

      // Increment 3 times
      for (let i = 0; i < 3; i++) {
        fireEvent.click(incrementButton);
      }

      expect(mockOnChange).toHaveBeenLastCalledWith(11);
    });
  });

  describe('Disabled State', () => {
    it('should not allow changes when disabled', () => {
      render(<NumberInput value={100} onChange={mockOnChange} disabled={true} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: '200' } });

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should disable controls when disabled', () => {
      render(
        <NumberInput value={10} onChange={mockOnChange} disabled={true} showControls={true} />,
      );

      const incrementButton = screen.getByLabelText(/increment/i);
      const decrementButton = screen.getByLabelText(/decrement/i);

      expect(incrementButton).toBeDisabled();
      expect(decrementButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<NumberInput value={100} onChange={mockOnChange} aria-label='Test input' />);
      const input = screen.getByRole('textbox');

      expect(input).toHaveAttribute('aria-label', 'Test input');
    });

    it('should support keyboard navigation when controls are enabled', () => {
      render(<NumberInput value={10} onChange={mockOnChange} showControls={true} />);
      const input = screen.getByRole('textbox');

      // Arrow up should increment
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(mockOnChange).toHaveBeenNthCalledWith(1, 11);

      // Arrow down should decrement (from the new value of 11, since displayValue updates)
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(mockOnChange).toHaveBeenNthCalledWith(2, 10);
    });

    it('should have unique IDs for accessibility', () => {
      const { container } = render(
        // biome-ignore lint/correctness/useUniqueElementIds: Testing id attribute in isolation
        <NumberInput value={10} onChange={mockOnChange} id='test-input' />,
      );
      const input = container.querySelector('#test-input');

      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'test-input');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero value', () => {
      render(<NumberInput value={0} onChange={mockOnChange} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      expect(input.value).toBe('0');
    });

    it('should handle negative values', () => {
      render(<NumberInput value={-100} onChange={mockOnChange} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      expect(input.value).toBe('-100');
    });

    it('should handle very large numbers', () => {
      render(<NumberInput value={1000000} onChange={mockOnChange} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      // Should format with commas
      expect(input.value).toBe('1,000,000');
    });

    it('should handle decimal precision correctly', () => {
      render(<NumberInput value={10.555} onChange={mockOnChange} decimals={2} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      // Should round to 2 decimal places
      expect(input.value).toBe('10.56');
    });
  });
});
