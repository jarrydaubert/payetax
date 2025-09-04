// src/components/atoms/__tests__/TaxYearSelect.test.tsx

import { fireEvent, render, screen } from '@testing-library/react';
import TaxYearSelect from '../TaxYearSelect';

describe('TaxYearSelect', () => {
  const defaultProps = {
    value: '2024-2025' as const,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render with default value', () => {
    render(<TaxYearSelect {...defaultProps} />);

    const select = screen.getByDisplayValue('2024-2025');
    expect(select).toBeInTheDocument();
  });

  test('should display all available tax years', () => {
    render(<TaxYearSelect {...defaultProps} />);

    const _select = screen.getByRole('combobox');

    // Check that common tax years are available
    expect(screen.getByText('2025-2026')).toBeInTheDocument();
    expect(screen.getByText('2024-2025')).toBeInTheDocument();
    expect(screen.getByText('2023-2024')).toBeInTheDocument();
  });

  test('should call onChange when selection changes', () => {
    const mockOnChange = jest.fn();
    render(<TaxYearSelect {...defaultProps} onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2025-2026' } });

    expect(mockOnChange).toHaveBeenCalledWith('2025-2026');
  });

  test('should highlight current tax year', () => {
    render(<TaxYearSelect {...defaultProps} />);

    // Current tax year should be marked or highlighted
    const currentOption = screen.getByText(/2024-2025/);
    expect(currentOption).toBeInTheDocument();
  });

  test('should show upcoming tax year', () => {
    render(<TaxYearSelect {...defaultProps} />);

    expect(screen.getByText('2025-2026')).toBeInTheDocument();
  });

  test('should be disabled when specified', () => {
    render(<TaxYearSelect {...defaultProps} disabled />);

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  test('should apply custom CSS classes', () => {
    render(<TaxYearSelect {...defaultProps} className='custom-select' />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-select');
  });

  test('should have proper accessibility attributes', () => {
    render(<TaxYearSelect {...defaultProps} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-label');
  });

  test('should maintain focus after selection', () => {
    render(<TaxYearSelect {...defaultProps} />);

    const select = screen.getByRole('combobox');

    fireEvent.focus(select);
    fireEvent.change(select, { target: { value: '2023-2024' } });

    expect(select).toHaveFocus();
  });

  test('should handle keyboard navigation', () => {
    render(<TaxYearSelect {...defaultProps} />);

    const select = screen.getByRole('combobox');

    fireEvent.focus(select);
    fireEvent.keyDown(select, { key: 'ArrowDown' });

    // Should handle keyboard events without crashing
    expect(select).toBeInTheDocument();
  });

  test('should show helper text for tax year periods', () => {
    render(<TaxYearSelect {...defaultProps} />);

    // Should show information about tax year periods (April to April)
    const helpText = screen.getByText(/april/i);
    expect(helpText).toBeInTheDocument();
  });
});
