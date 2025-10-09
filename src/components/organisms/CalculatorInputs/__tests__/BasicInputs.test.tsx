// src/components/organisms/CalculatorInputs/__tests__/BasicInputs.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { useCalculatorActions, useCalculatorStore } from '@/store/calculatorStore';
import { BasicInputs } from '../BasicInputs';

// Mock the store
jest.mock('@/store/calculatorStore');

describe('BasicInputs Component', () => {
  const mockSetSalary = jest.fn();
  const mockSetPayPeriod = jest.fn();
  const mockSetTaxYear = jest.fn();
  const mockSetTaxCode = jest.fn();
  const mockSetRegion = jest.fn();
  const mockSetIsMarried = jest.fn();
  const mockSetPartnerGrossWage = jest.fn();
  const mockSetIsBlind = jest.fn();
  const mockSetPayNoNI = jest.fn();
  const mockSetStudentLoanPlan = jest.fn();
  const mockSetPensionContributionType = jest.fn();
  const mockSetPensionContribution = jest.fn();

  const defaultInput = {
    salary: 30000,
    payPeriod: 'annually' as const,
    taxYear: 2024,
    taxCode: '1257L',
    region: 'England' as const,
    isMarried: false,
    partnerGrossWage: 0,
    isBlind: false,
    payNoNI: false,
    studentLoanPlan: 'None' as const,
    pensionContributionType: 'percentage' as const,
    pensionContribution: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ input: defaultInput })
    );

    (useCalculatorActions as jest.Mock).mockReturnValue({
      setSalary: mockSetSalary,
      setPayPeriod: mockSetPayPeriod,
      setTaxYear: mockSetTaxYear,
      setTaxCode: mockSetTaxCode,
      setRegion: mockSetRegion,
      setIsMarried: mockSetIsMarried,
      setPartnerGrossWage: mockSetPartnerGrossWage,
      setIsBlind: mockSetIsBlind,
      setPayNoNI: mockSetPayNoNI,
      setStudentLoanPlan: mockSetStudentLoanPlan,
      setPensionContributionType: mockSetPensionContributionType,
      setPensionContribution: mockSetPensionContribution,
    });
  });

  describe('Rendering', () => {
    it('should render salary input', () => {
      render(<BasicInputs />);

      expect(screen.getByText('Salary')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /salary/i })).toBeInTheDocument();
    });

    it('should render pay period select', () => {
      render(<BasicInputs />);

      expect(screen.getByText('Pay Period')).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /pay period/i })).toBeInTheDocument();
    });

    it('should render tax year select', () => {
      render(<BasicInputs />);

      expect(screen.getByText('Tax Year')).toBeInTheDocument();
    });

    it('should render tax code input', () => {
      render(<BasicInputs />);

      expect(screen.getByText('Tax Code')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1257L')).toBeInTheDocument();
    });

    it('should render region select', () => {
      render(<BasicInputs />);

      expect(screen.getByText('Region')).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /region/i })).toBeInTheDocument();
    });

    it('should render married checkbox', () => {
      render(<BasicInputs />);

      expect(screen.getByText('Married')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /married/i })).toBeInTheDocument();
    });

    it('should render blind allowance checkbox', () => {
      render(<BasicInputs />);

      expect(screen.getByText('Blind Allowance')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /blind allowance/i })).toBeInTheDocument();
    });

    it('should render pay no NI checkbox', () => {
      render(<BasicInputs />);

      expect(screen.getByText('I pay no NI')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /i pay no ni/i })).toBeInTheDocument();
    });

    it('should render student loan select', () => {
      render(<BasicInputs />);

      expect(screen.getByText('Student Loan')).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /student loan/i })).toBeInTheDocument();
    });

    it('should render pension type select', () => {
      render(<BasicInputs />);

      expect(screen.getByText('Pension Type')).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /pension type/i })).toBeInTheDocument();
    });

    it('should render pension contribution input', () => {
      render(<BasicInputs />);

      expect(screen.getByText('Pension Contribution %')).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should not show partner wage input when not married', () => {
      render(<BasicInputs />);

      expect(screen.queryByText("Partner's Gross Wage")).not.toBeInTheDocument();
    });

    it('should show partner wage input when married', () => {
      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { ...defaultInput, isMarried: true } })
      );

      render(<BasicInputs />);

      expect(screen.getByText("Partner's Gross Wage")).toBeInTheDocument();
    });

    it('should show percentage input when pension type is percentage', () => {
      render(<BasicInputs />);

      expect(screen.getByText('Pension Contribution %')).toBeInTheDocument();
      expect(screen.getByText('%')).toBeInTheDocument();
    });

    it('should show amount input when pension type is amount', () => {
      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { ...defaultInput, pensionContributionType: 'amount' } })
      );

      render(<BasicInputs />);

      expect(screen.getByText('Pension Contribution')).toBeInTheDocument();
      expect(screen.queryByText('Pension Contribution %')).not.toBeInTheDocument();
    });
  });

  describe('Store Integration', () => {
    it('should call setTaxCode when tax code changes', () => {
      render(<BasicInputs />);

      const taxCodeInput = screen.getByDisplayValue('1257L');
      fireEvent.change(taxCodeInput, { target: { value: '1260L' } });

      expect(mockSetTaxCode).toHaveBeenCalledWith('1260L');
    });

    it('should call setIsMarried when married checkbox is clicked', () => {
      render(<BasicInputs />);

      const marriedCheckbox = screen.getByRole('checkbox', { name: /married/i });
      fireEvent.click(marriedCheckbox);

      expect(mockSetIsMarried).toHaveBeenCalled();
    });

    it('should call setIsBlind when blind checkbox is clicked', () => {
      render(<BasicInputs />);

      const blindCheckbox = screen.getByRole('checkbox', { name: /blind allowance/i });
      fireEvent.click(blindCheckbox);

      expect(mockSetIsBlind).toHaveBeenCalled();
    });

    it('should call setPayNoNI when pay no NI checkbox is clicked', () => {
      render(<BasicInputs />);

      const payNoNICheckbox = screen.getByRole('checkbox', { name: /i pay no ni/i });
      fireEvent.click(payNoNICheckbox);

      expect(mockSetPayNoNI).toHaveBeenCalled();
    });

    it('should call setPensionContribution when percentage input changes', () => {
      render(<BasicInputs />);

      const pensionInput = screen.getByPlaceholderText('5.00');
      fireEvent.change(pensionInput, { target: { value: '10' } });
      fireEvent.blur(pensionInput);

      expect(mockSetPensionContribution).toHaveBeenCalledWith(10);
    });

    it('should call setPensionContribution with 0 when percentage input is empty', () => {
      render(<BasicInputs />);

      const pensionInput = screen.getByPlaceholderText('5.00');
      fireEvent.change(pensionInput, { target: { value: '' } });
      fireEvent.blur(pensionInput);

      expect(mockSetPensionContribution).toHaveBeenCalledWith(0);
    });
  });

  describe('Select Inputs', () => {
    it('should render pay period select', () => {
      render(<BasicInputs />);

      const payPeriodSelect = screen.getByRole('combobox', { name: /pay period/i });
      expect(payPeriodSelect).toBeInTheDocument();
    });

    it('should render region select', () => {
      render(<BasicInputs />);

      const regionSelect = screen.getByRole('combobox', { name: /region/i });
      expect(regionSelect).toBeInTheDocument();
    });

    it('should render student loan select', () => {
      render(<BasicInputs />);

      const studentLoanSelect = screen.getByRole('combobox', { name: /student loan/i });
      expect(studentLoanSelect).toBeInTheDocument();
    });

    it('should render pension type select', () => {
      render(<BasicInputs />);

      const pensionTypeSelect = screen.getByRole('combobox', { name: /pension type/i });
      expect(pensionTypeSelect).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have labels associated with inputs', () => {
      render(<BasicInputs />);

      const taxCodeInput = screen.getByDisplayValue('1257L');
      expect(taxCodeInput).toHaveAttribute('id');

      const labels = screen.getAllByText('Tax Code');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should use semantic HTML', () => {
      render(<BasicInputs />);

      expect(screen.getByRole('textbox', { name: /tax code/i })).toBeInTheDocument();
      expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0);
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
    });

    it('should have unique IDs for all inputs', () => {
      const { container } = render(<BasicInputs />);

      const inputs = container.querySelectorAll('input, select, button[role="combobox"]');
      const ids = Array.from(inputs)
        .map((input) => input.getAttribute('id'))
        .filter(Boolean);

      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Animation', () => {
    it('should render with Framer Motion wrapper', () => {
      const { container } = render(<BasicInputs />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should not throw errors when unmounting', () => {
      const { unmount } = render(<BasicInputs />);

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero salary', () => {
      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { ...defaultInput, salary: 0 } })
      );

      render(<BasicInputs />);

      expect(screen.getByRole('textbox', { name: /salary/i })).toBeInTheDocument();
    });

    it('should handle large salary values', () => {
      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { ...defaultInput, salary: 999999999 } })
      );

      render(<BasicInputs />);

      expect(screen.getByRole('textbox', { name: /salary/i })).toBeInTheDocument();
    });

    it('should handle invalid tax code', () => {
      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { ...defaultInput, taxCode: '' } })
      );

      render(<BasicInputs />);

      expect(screen.getByRole('textbox', { name: /tax code/i })).toBeInTheDocument();
    });

    it('should handle all checkboxes checked', () => {
      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { ...defaultInput, isMarried: true, isBlind: true, payNoNI: true } })
      );

      render(<BasicInputs />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should handle 100% pension contribution', () => {
      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { ...defaultInput, pensionContribution: 100 } })
      );

      render(<BasicInputs />);

      expect(screen.getByDisplayValue('100.00')).toBeInTheDocument();
    });

    it('should handle zero pension contribution', () => {
      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { ...defaultInput, pensionContribution: 0 } })
      );

      render(<BasicInputs />);

      const pensionInput = screen.getByPlaceholderText('5.00') as HTMLInputElement;
      expect(pensionInput.value).toBe('0.00');
    });
  });

  describe('Form Layout', () => {
    it('should render key inputs', () => {
      render(<BasicInputs />);

      expect(screen.getByText('Salary')).toBeInTheDocument();
      expect(screen.getByText('Pay Period')).toBeInTheDocument();
      expect(screen.getByText('Tax Year')).toBeInTheDocument();
    });

    it('should have proper spacing classes', () => {
      const { container } = render(<BasicInputs />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('space-y-3');
    });
  });

  describe('Pension Input Switching', () => {
    it('should switch from percentage to amount when pension type changes', () => {
      const { rerender } = render(<BasicInputs />);

      expect(screen.getByText('Pension Contribution %')).toBeInTheDocument();

      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { ...defaultInput, pensionContributionType: 'amount' } })
      );

      rerender(<BasicInputs />);

      expect(screen.queryByText('Pension Contribution %')).not.toBeInTheDocument();
      expect(screen.getByText('Pension Contribution')).toBeInTheDocument();
    });
  });

  describe('Partner Wage Visibility', () => {
    it('should toggle partner wage visibility when married status changes', () => {
      const { rerender } = render(<BasicInputs />);

      expect(screen.queryByText("Partner's Gross Wage")).not.toBeInTheDocument();

      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { ...defaultInput, isMarried: true } })
      );

      rerender(<BasicInputs />);

      expect(screen.getByText("Partner's Gross Wage")).toBeInTheDocument();
    });
  });
});
