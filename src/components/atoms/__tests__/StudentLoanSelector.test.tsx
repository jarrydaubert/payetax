// src/components/atoms/__tests__/StudentLoanSelector.test.tsx

import { fireEvent, render, screen } from '@testing-library/react';
import StudentLoanSelector from '../StudentLoanSelector';

describe('StudentLoanSelector', () => {
  const defaultProps = {
    selectedPlans: [],
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render all student loan plan options', () => {
    render(<StudentLoanSelector {...defaultProps} />);

    expect(screen.getByText('Plan 1')).toBeInTheDocument();
    expect(screen.getByText('Plan 2')).toBeInTheDocument();
    expect(screen.getByText('Plan 4')).toBeInTheDocument();
    expect(screen.getByText('Plan 5')).toBeInTheDocument();
    expect(screen.getByText('Postgrad')).toBeInTheDocument();
  });

  test('should show plan descriptions', () => {
    render(<StudentLoanSelector {...defaultProps} />);

    // Should show threshold information
    expect(screen.getByText(/£22,015/)).toBeInTheDocument(); // Plan 1 threshold
    expect(screen.getByText(/£27,295/)).toBeInTheDocument(); // Plan 2 threshold
    expect(screen.getByText(/£31,395/)).toBeInTheDocument(); // Plan 4 threshold
    expect(screen.getByText(/£25,000/)).toBeInTheDocument(); // Plan 5 threshold
    expect(screen.getByText(/£21,000/)).toBeInTheDocument(); // Postgraduate threshold
  });

  test('should handle single plan selection', () => {
    const mockOnChange = jest.fn();
    render(<StudentLoanSelector {...defaultProps} onChange={mockOnChange} />);

    const plan2Checkbox = screen.getByLabelText(/Plan 2/);
    fireEvent.click(plan2Checkbox);

    expect(mockOnChange).toHaveBeenCalledWith(['plan2']);
  });

  test('should handle multiple plan selection', () => {
    const mockOnChange = jest.fn();
    render(
      <StudentLoanSelector {...defaultProps} selectedPlans={['plan2']} onChange={mockOnChange} />
    );

    const postgraduateCheckbox = screen.getByLabelText(/Postgraduate/);
    fireEvent.click(postgraduateCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(['plan2', 'postgraduate']);
  });

  test('should handle plan deselection', () => {
    const mockOnChange = jest.fn();
    render(
      <StudentLoanSelector
        {...defaultProps}
        selectedPlans={['plan1', 'plan2']}
        onChange={mockOnChange}
      />
    );

    const plan1Checkbox = screen.getByLabelText(/Plan 1/);
    fireEvent.click(plan1Checkbox);

    expect(mockOnChange).toHaveBeenCalledWith(['plan2']);
  });

  test('should show selected plans as checked', () => {
    render(<StudentLoanSelector {...defaultProps} selectedPlans={['plan2', 'postgrad']} />);

    const plan2Checkbox = screen.getByLabelText(/Plan 2/) as HTMLInputElement;
    const postgraduateCheckbox = screen.getByLabelText(/Postgraduate/) as HTMLInputElement;
    const plan1Checkbox = screen.getByLabelText(/Plan 1/) as HTMLInputElement;

    expect(plan2Checkbox.checked).toBe(true);
    expect(postgraduateCheckbox.checked).toBe(true);
    expect(plan1Checkbox.checked).toBe(false);
  });

  test('should show repayment rate information', () => {
    render(<StudentLoanSelector {...defaultProps} />);

    // All undergraduate plans should show 9% rate
    const ninePercentTexts = screen.getAllByText(/9%/);
    expect(ninePercentTexts).toHaveLength(4); // Plans 1, 2, 4, 5

    // Postgraduate should show 6% rate
    expect(screen.getByText(/6%/)).toBeInTheDocument();
  });

  test('should show plan eligibility information', () => {
    render(<StudentLoanSelector {...defaultProps} />);

    // Should show when each plan applies
    expect(screen.getByText(/pre-2012/i)).toBeInTheDocument(); // Plan 1
    expect(screen.getByText(/2012/i)).toBeInTheDocument(); // Plan 2
    expect(screen.getByText(/scotland/i)).toBeInTheDocument(); // Plan 4
    expect(screen.getByText(/2023/i)).toBeInTheDocument(); // Plan 5
  });

  test('should be accessible with proper labels', () => {
    render(<StudentLoanSelector {...defaultProps} />);

    const plan1Checkbox = screen.getByLabelText(/Plan 1/);
    const plan2Checkbox = screen.getByLabelText(/Plan 2/);

    expect(plan1Checkbox).toHaveAttribute('type', 'checkbox');
    expect(plan2Checkbox).toHaveAttribute('type', 'checkbox');
  });

  test('should handle no plans selected', () => {
    render(<StudentLoanSelector {...defaultProps} selectedPlans={[]} />);

    const checkboxes = screen.getAllByRole('checkbox');
    for (const checkbox of checkboxes) {
      expect(checkbox).not.toBeChecked();
    }
  });

  test('should allow combining undergraduate and postgraduate loans', () => {
    const mockOnChange = jest.fn();
    render(
      <StudentLoanSelector {...defaultProps} selectedPlans={['plan2']} onChange={mockOnChange} />
    );

    const postgraduateCheckbox = screen.getByLabelText(/Postgraduate/);
    fireEvent.click(postgraduateCheckbox);

    // Should allow both undergraduate and postgraduate
    expect(mockOnChange).toHaveBeenCalledWith(['plan2', 'postgraduate']);
  });

  test('should show helpful context for each plan', () => {
    render(<StudentLoanSelector {...defaultProps} />);

    // Each plan should have contextual information
    expect(screen.getByText(/Started university before/)).toBeInTheDocument();
    expect(screen.getByText(/Started university 2012-2022/)).toBeInTheDocument();
    expect(screen.getByText(/Scottish residents/)).toBeInTheDocument();
    expect(screen.getByText(/Started university 2023/)).toBeInTheDocument();
    expect(screen.getByText(/Postgraduate loan/)).toBeInTheDocument();
  });
});
