// src/components/atoms/__tests__/NumberInput.test.tsx

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import NumberInput from '../NumberInput';

describe('NumberInput', () => {
  const defaultProps = {
    value: 0,
    onChange: jest.fn(),
    label: 'Test Input',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render with label', () => {
    render(<NumberInput {...defaultProps} />);
    const input = screen.getByDisplayValue('0');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('label', 'Test Input');
  });

  test('should display the current value', () => {
    render(<NumberInput {...defaultProps} value={50000} />);
    const input = screen.getByDisplayValue('50,000');
    expect(input).toBeInTheDocument();
  });

  test('should call onChange when value changes', async () => {
    const mockOnChange = jest.fn();
    render(<NumberInput {...defaultProps} onChange={mockOnChange} />);

    const input = screen.getByDisplayValue('0');
    fireEvent.change(input, { target: { value: '30000' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(30000);
    });
  });

  test('should format numbers with commas', () => {
    render(<NumberInput {...defaultProps} value={1234567} />);
    expect(screen.getByDisplayValue('1,234,567')).toBeInTheDocument();
  });

  test('should handle decimal values', () => {
    render(<NumberInput {...defaultProps} value={1234.56} />);
    expect(screen.getByDisplayValue('1,234.56')).toBeInTheDocument();
  });

  test('should prevent negative values when specified', () => {
    const mockOnChange = jest.fn();
    render(<NumberInput {...defaultProps} onChange={mockOnChange} min={0} />);

    const input = screen.getByDisplayValue('0');
    fireEvent.change(input, { target: { value: '-1000' } });

    expect(mockOnChange).not.toHaveBeenCalledWith(-1000);
  });

  test('should handle maximum value constraint', () => {
    const mockOnChange = jest.fn();
    render(<NumberInput {...defaultProps} onChange={mockOnChange} max={999999} />);

    const input = screen.getByDisplayValue('0');
    fireEvent.change(input, { target: { value: '1000000' } });

    expect(mockOnChange).not.toHaveBeenCalledWith(1000000);
  });

  test('should show placeholder text', () => {
    render(<NumberInput {...defaultProps} value={0} placeholder='Enter amount' />);

    expect(screen.getByPlaceholderText('Enter amount')).toBeInTheDocument();
  });

  test('should handle focus and blur events', () => {
    render(<NumberInput {...defaultProps} />);

    const input = screen.getByDisplayValue('0');

    fireEvent.focus(input);
    expect(input).toHaveFocus();

    fireEvent.blur(input);
    expect(input).not.toHaveFocus();
  });

  test('should be disabled when specified', () => {
    render(<NumberInput {...defaultProps} disabled />);

    const input = screen.getByDisplayValue('0');
    expect(input).toBeDisabled();
  });

  test('should handle empty input', () => {
    const mockOnChange = jest.fn();
    render(<NumberInput {...defaultProps} onChange={mockOnChange} />);

    const input = screen.getByDisplayValue('0');
    fireEvent.change(input, { target: { value: '' } });

    expect(mockOnChange).toHaveBeenCalledWith(0);
  });

  test('should handle invalid input gracefully', () => {
    const mockOnChange = jest.fn();
    render(<NumberInput {...defaultProps} onChange={mockOnChange} />);

    const input = screen.getByDisplayValue('0');
    fireEvent.change(input, { target: { value: 'abc' } });

    // Should not crash - the component should handle invalid input
    expect(input).toBeInTheDocument();
  });

  test('should apply custom CSS classes', () => {
    render(<NumberInput {...defaultProps} className='custom-input' />);

    const container = screen.getByDisplayValue('0').parentElement;
    expect(container).toHaveClass('custom-input');
  });
});
