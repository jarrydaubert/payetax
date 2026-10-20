// src/components/atoms/__tests__/NumberInput.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CURRENCY_INPUT_ERRORS, PERCENTAGE_INPUT_ERRORS } from '@/lib/currencyInput';
import NumberInput from '../NumberInput';

describe('NumberInput Component', () => {
  describe('Regression Tests - Critical Features', () => {
    it('should allow decimals when decimals prop is set', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(<NumberInput value={0} onChange={mockOnChange} decimals={2} />);

      const input = screen.getByRole('spinbutton') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, '123.45');

      expect(input.value).toBe('123.45');
    });

    it('should keep typed text unchanged while focused and add separators on blur', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(<NumberInput value={0} onChange={mockOnChange} decimals={2} />);

      const input = screen.getByRole('spinbutton') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, '12345.67');
      expect(input.value).toBe('12345.67');

      await user.tab();
      expect(input.value).toBe('12,345.67');
      expect(mockOnChange).toHaveBeenCalledWith(12345.67);
    });

    it('should preserve decimal point while typing', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(<NumberInput value={0} onChange={mockOnChange} decimals={2} />);

      const input = screen.getByRole('spinbutton') as HTMLInputElement;
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
      const input = screen.getByRole('spinbutton') as HTMLInputElement;
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
      const input = screen.getByRole('spinbutton');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '500' } });
      fireEvent.blur(input);

      expect(mockOnChange).toHaveBeenCalledWith(500);
    });

    it('should handle decimal values when decimals prop is set', () => {
      render(<NumberInput value={0} onChange={mockOnChange} decimals={2} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '10.50' } });
      fireEvent.blur(input);

      expect(mockOnChange).toHaveBeenCalledWith(10.5);
    });

    it('should handle formatted values with commas', () => {
      render(<NumberInput value={0} onChange={mockOnChange} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '1,000' } });
      fireEvent.blur(input);

      expect(mockOnChange).toHaveBeenCalledWith(1000);
    });

    it('should reject invalid input visibly instead of committing another amount', () => {
      render(<NumberInput value={100} onChange={mockOnChange} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'abc' } });
      fireEvent.blur(input);

      expect(mockOnChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('abc');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText(CURRENCY_INPUT_ERRORS.malformed)).toBeInTheDocument();
    });
  });

  describe('Amount integrity (shared currency parser)', () => {
    const commit = (input: HTMLElement, text: string) => {
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: text } });
      fireEvent.blur(input);
    };

    it.each([
      ['1234.56', 1234.56],
      ['£1,234.56', 1234.56],
      ['1,234', 1234],
      ['0.5', 0.5],
    ])('keeps pence in %j as %d, never scaling the amount', (text, expected) => {
      render(<NumberInput value={0} onChange={mockOnChange} decimals={2} prefix='£' />);
      commit(screen.getByRole('spinbutton'), text);

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith(expected);
    });

    it.each([
      ['-500', CURRENCY_INPUT_ERRORS.negative],
      ['−500', CURRENCY_INPUT_ERRORS.negative],
      ['abc', CURRENCY_INPUT_ERRORS.malformed],
      ['1.2.3', CURRENCY_INPUT_ERRORS.malformed],
      ['1234.567', CURRENCY_INPUT_ERRORS.decimals],
      ['12,34', CURRENCY_INPUT_ERRORS.commas],
    ])('rejects %j with a specific, associated error', (text, error) => {
      const onValidityChange = jest.fn();
      render(
        // biome-ignore lint/correctness/useUniqueElementIds: Testing the error id derived from a fixed id
        <NumberInput
          id='amount'
          value={30000}
          onChange={mockOnChange}
          onValidityChange={onValidityChange}
          decimals={2}
        />,
      );
      const input = screen.getByRole('spinbutton');
      commit(input, text);

      expect(mockOnChange).not.toHaveBeenCalled();
      expect(input).toHaveValue(text);
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'amount-error');
      expect(input).not.toHaveAttribute('aria-valuenow');
      expect(screen.getByText(error)).toHaveAttribute('id', 'amount-error');
      expect(onValidityChange).toHaveBeenLastCalledWith({ text, error });
    });

    it('rejects pence in a whole-units field rather than dropping the decimal point', () => {
      render(<NumberInput value={0} onChange={mockOnChange} decimals={0} />);
      const input = screen.getByRole('spinbutton');
      commit(input, '1234.56');

      expect(mockOnChange).not.toHaveBeenCalled();
      expect(screen.getByText(CURRENCY_INPUT_ERRORS.wholePounds)).toBeInTheDocument();
    });

    it('rejects amounts above max instead of clamping them', () => {
      render(<NumberInput value={0} onChange={mockOnChange} decimals={2} max={10_000_000} />);
      commit(screen.getByRole('spinbutton'), '20000000');

      expect(mockOnChange).not.toHaveBeenCalled();
      expect(screen.getByText('Enter an amount no more than £10,000,000.')).toBeInTheDocument();
    });

    it('does not report empty text as invalid', () => {
      const onValidityChange = jest.fn();
      render(
        <NumberInput
          value={0}
          onChange={mockOnChange}
          onValidityChange={onValidityChange}
          decimals={2}
        />,
      );
      commit(screen.getByRole('spinbutton'), '');

      expect(onValidityChange).not.toHaveBeenCalled();
      expect(screen.getByRole('spinbutton')).not.toHaveAttribute('aria-invalid');
    });

    it('recovers when invalid text is corrected', () => {
      const onValidityChange = jest.fn();
      render(
        <NumberInput
          value={100}
          onChange={mockOnChange}
          onValidityChange={onValidityChange}
          decimals={2}
        />,
      );
      const input = screen.getByRole('spinbutton');
      commit(input, '-5');
      expect(onValidityChange).toHaveBeenLastCalledWith({
        text: '-5',
        error: CURRENCY_INPUT_ERRORS.negative,
      });

      commit(input, '5');
      expect(onValidityChange).toHaveBeenLastCalledWith(null);
      expect(mockOnChange).toHaveBeenCalledWith(5);
      expect(input).toHaveValue('5.00');
      expect(input).not.toHaveAttribute('aria-invalid');
      expect(screen.queryByText(CURRENCY_INPUT_ERRORS.negative)).not.toBeInTheDocument();
    });

    it('keeps invalid text on focus so it can be corrected', () => {
      render(<NumberInput value={100} onChange={mockOnChange} decimals={2} />);
      const input = screen.getByRole('spinbutton');
      commit(input, 'abc');

      fireEvent.focus(input);
      expect(input).toHaveValue('abc');
    });

    it('updates the visible error live once shown', () => {
      render(<NumberInput value={100} onChange={mockOnChange} decimals={2} />);
      const input = screen.getByRole('spinbutton');
      commit(input, 'abc');
      fireEvent.focus(input);

      fireEvent.change(input, { target: { value: '-1' } });
      expect(screen.getByText(CURRENCY_INPUT_ERRORS.negative)).toBeInTheDocument();

      fireEvent.change(input, { target: { value: '1' } });
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('shows invalid text held by the owner on mount, and drops it when the owner clears it', () => {
      const draft = { text: '1.2.3', error: CURRENCY_INPUT_ERRORS.malformed };
      const { rerender } = render(
        <NumberInput value={250} onChange={mockOnChange} decimals={2} invalidDraft={draft} />,
      );
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue('1.2.3');
      expect(screen.getByText(CURRENCY_INPUT_ERRORS.malformed)).toBeInTheDocument();

      rerender(<NumberInput value={250} onChange={mockOnChange} decimals={2} />);
      expect(input).toHaveValue('250.00');
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('drops invalid text when the value changes externally (reset or applied suggestion)', () => {
      const onValidityChange = jest.fn();
      const { rerender } = render(
        <NumberInput
          value={100}
          onChange={mockOnChange}
          onValidityChange={onValidityChange}
          decimals={2}
        />,
      );
      const input = screen.getByRole('spinbutton');
      commit(input, 'abc');

      rerender(
        <NumberInput
          value={200}
          onChange={mockOnChange}
          onValidityChange={onValidityChange}
          decimals={2}
        />,
      );
      expect(input).toHaveValue('200.00');
      expect(onValidityChange).toHaveBeenLastCalledWith(null);
    });

    describe('percentage unit', () => {
      it('accepts a trailing % and commits the percentage', () => {
        render(
          <NumberInput
            value={0}
            onChange={mockOnChange}
            decimals={2}
            unit='percent'
            suffix='%'
            max={100}
          />,
        );
        commit(screen.getByRole('spinbutton'), '5.5%');
        expect(mockOnChange).toHaveBeenCalledWith(5.5);
      });

      it.each([
        ['-5', PERCENTAGE_INPUT_ERRORS.negative],
        ['abc', PERCENTAGE_INPUT_ERRORS.malformed],
        ['£5', PERCENTAGE_INPUT_ERRORS.malformed],
        ['150', 'Enter a percentage no more than 100%.'],
      ])('rejects %j with a percentage message', (text, error) => {
        render(
          <NumberInput
            value={5}
            onChange={mockOnChange}
            decimals={2}
            unit='percent'
            suffix='%'
            max={100}
          />,
        );
        commit(screen.getByRole('spinbutton'), text);
        expect(mockOnChange).not.toHaveBeenCalled();
        expect(screen.getByText(error)).toBeInTheDocument();
      });

      it('re-checks held text when the unit changes, committing it once it is valid', () => {
        const onValidityChange = jest.fn();
        const props = {
          value: 5,
          onChange: mockOnChange,
          onValidityChange,
          decimals: 2 as const,
        };
        const { rerender } = render(<NumberInput {...props} unit='percent' suffix='%' max={100} />);
        const input = screen.getByRole('spinbutton');
        commit(input, '150');
        expect(screen.getByText('Enter a percentage no more than 100%.')).toBeInTheDocument();

        rerender(<NumberInput {...props} unit='pounds' prefix='£' max={10_000_000} />);
        expect(mockOnChange).toHaveBeenCalledWith(150);
        expect(onValidityChange).toHaveBeenLastCalledWith(null);
        expect(input).toHaveValue('150.00');
      });
    });
  });

  describe('Focus Behavior', () => {
    it('should clear value on focus when clearOnFocus is true', () => {
      render(<NumberInput value={1000} onChange={mockOnChange} clearOnFocus={true} />);
      const input = screen.getByRole('spinbutton') as HTMLInputElement;

      fireEvent.focus(input);

      expect(input.value).toBe('');
    });

    it('should not clear value on focus when clearOnFocus is false', () => {
      render(<NumberInput value={1000} onChange={mockOnChange} clearOnFocus={false} />);
      const input = screen.getByRole('spinbutton') as HTMLInputElement;

      fireEvent.focus(input);

      expect(input.value).toBe('1,000');
    });

    it('should format value on blur', () => {
      const { rerender } = render(
        <NumberInput value={1000} onChange={mockOnChange} decimals={2} />,
      );
      const input = screen.getByRole('spinbutton') as HTMLInputElement;

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
      const input = screen.getByRole('spinbutton');

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
      const input = screen.getByRole('spinbutton');

      expect(input).toHaveAttribute('aria-label', 'Test input');
    });

    it('should support keyboard navigation when controls are enabled', () => {
      render(<NumberInput value={10} onChange={mockOnChange} showControls={true} />);
      const input = screen.getByRole('spinbutton');

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
      const input = screen.getByRole('spinbutton') as HTMLInputElement;

      expect(input.value).toBe('0');
    });

    it('should handle negative values', () => {
      render(<NumberInput value={-100} onChange={mockOnChange} />);
      const input = screen.getByRole('spinbutton') as HTMLInputElement;

      expect(input.value).toBe('-100');
    });

    it('should handle very large numbers', () => {
      render(<NumberInput value={1000000} onChange={mockOnChange} />);
      const input = screen.getByRole('spinbutton') as HTMLInputElement;

      // Should format with commas
      expect(input.value).toBe('1,000,000');
    });

    it('should handle decimal precision correctly', () => {
      render(<NumberInput value={10.555} onChange={mockOnChange} decimals={2} />);
      const input = screen.getByRole('spinbutton') as HTMLInputElement;

      // Should round to 2 decimal places
      expect(input.value).toBe('10.56');
    });
  });
});
