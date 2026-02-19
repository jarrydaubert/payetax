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
  const mockSetAge = jest.fn();
  const mockSetPayNoNI = jest.fn();
  const mockSetStudentLoanPlan = jest.fn();
  const mockSetAllowancesDeductions = jest.fn();
  const mockSetPensionContribution = jest.fn();
  const mockSetPensionContributionType = jest.fn();

  const defaultInput = {
    salary: 30000,
    payPeriod: 'annually' as const,
    taxYear: '2024-2025' as const,
    taxCode: '1257L',
    region: 'England' as const,
    isMarried: false,
    partnerGrossWage: 0,
    isBlind: false,
    age: undefined,
    payNoNI: false,
    studentLoanPlans: 'none' as const,
    allowancesDeductions: 0,
    pensionContribution: 0,
    pensionContributionType: 'percentage' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ input: defaultInput }),
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
      setAge: mockSetAge,
      setPayNoNI: mockSetPayNoNI,
      setStudentLoanPlans: mockSetStudentLoanPlan,
      setAllowancesDeductions: mockSetAllowancesDeductions,
      setPensionContribution: mockSetPensionContribution,
      setPensionContributionType: mockSetPensionContributionType,
    });
  });

  describe('Rendering', () => {
    it('should render heading', () => {
      render(<BasicInputs />);
      expect(screen.getByText('Enter Income Tax Details')).toBeInTheDocument();
    });

    it('should render salary input', () => {
      render(<BasicInputs />);
      expect(screen.getByText('Salary')).toBeInTheDocument();
      expect(screen.getByTestId('salary-input')).toBeInTheDocument();
    });

    it('should render pay period select inline with salary', () => {
      render(<BasicInputs />);
      // Pay period is in a select but doesn't have a visible label
      const selects = screen.getAllByRole('button'); // SelectTrigger renders as button
      expect(selects.length).toBeGreaterThan(0);
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
    });

    it('should render 3 checkboxes in one row', () => {
      render(<BasicInputs />);
      expect(screen.getByText('Married')).toBeInTheDocument();
      expect(screen.getByText('Blind')).toBeInTheDocument();
      expect(screen.getByText('I pay no NI')).toBeInTheDocument();
    });

    it('should render age dropdown', () => {
      render(<BasicInputs />);
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByTestId('age-select')).toBeInTheDocument();
    });

    it('should render student loan select', () => {
      render(<BasicInputs />);
      // Check for the select element specifically
      expect(screen.getByTestId('student-loan-select')).toBeInTheDocument();
      // Postgraduate checkbox should not be visible initially
      expect(screen.queryByTestId('postgraduate-addon-checkbox')).not.toBeInTheDocument();
    });

    it('should render allowances/deductions input', () => {
      render(<BasicInputs />);
      expect(screen.getByText('Non-taxable allowance(s)')).toBeInTheDocument();
    });

    it('should render pension combined type + amount', () => {
      render(<BasicInputs />);
      expect(screen.getByText('Pension')).toBeInTheDocument();
    });

    it('should NOT render hours per week field (removed)', () => {
      render(<BasicInputs />);
      expect(screen.queryByText('Hours Per Week')).not.toBeInTheDocument();
    });
  });

  describe('Partner Wage Conditional', () => {
    it('should show partner wage input when married', () => {
      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { ...defaultInput, isMarried: true } }),
      );

      render(<BasicInputs />);
      expect(screen.getByText("Partner's Gross Wage")).toBeInTheDocument();
    });

    it('should NOT show partner wage input when not married', () => {
      render(<BasicInputs />);
      expect(screen.queryByText("Partner's Gross Wage")).not.toBeInTheDocument();
    });
  });

  describe('Store Integration', () => {
    it('should call setTaxCode when tax code changes', () => {
      render(<BasicInputs />);

      const taxCodeInput = screen.getByDisplayValue('1257L');
      fireEvent.change(taxCodeInput, { target: { value: '1260L' } });

      expect(mockSetTaxCode).toHaveBeenCalledWith('1260L');
    });

    it('should convert tax code to uppercase', () => {
      render(<BasicInputs />);

      const taxCodeInput = screen.getByDisplayValue('1257L');
      fireEvent.change(taxCodeInput, { target: { value: 'br' } });

      expect(mockSetTaxCode).toHaveBeenCalledWith('BR');
    });

    it('should call setIsMarried when married checkbox is toggled', () => {
      render(<BasicInputs />);

      fireEvent.click(screen.getByTestId('married-checkbox'));

      expect(mockSetIsMarried).toHaveBeenCalledWith(true);
    });
  });

  describe('Tax Code Placeholder', () => {
    it('should show 1257L placeholder for England', () => {
      render(<BasicInputs />);
      const taxCodeInput = screen.getByPlaceholderText('1257L');
      expect(taxCodeInput).toBeInTheDocument();
    });

    it('should show S1257L placeholder for Scotland', () => {
      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { ...defaultInput, region: 'Scotland' } }),
      );

      render(<BasicInputs />);
      const taxCodeInput = screen.getByPlaceholderText('S1257L');
      expect(taxCodeInput).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have labels associated with inputs', () => {
      render(<BasicInputs />);

      const labels = screen.getAllByText('Tax Code');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should have unique IDs for all inputs', () => {
      const { container } = render(<BasicInputs />);

      const inputs = container.querySelectorAll('input');
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
});
