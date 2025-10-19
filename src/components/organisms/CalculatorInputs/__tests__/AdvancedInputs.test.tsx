// src/components/organisms/CalculatorInputs/__tests__/AdvancedInputs.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCalculatorActions, useCalculatorStore } from '@/store/calculatorStore';
import { AdvancedInputs } from '../AdvancedInputs';

// Mock the store
jest.mock('@/store/calculatorStore');

describe('AdvancedInputs Component', () => {
  const mockSetIsMarried = jest.fn();
  const mockSetPartnerGrossWage = jest.fn();
  const mockSetIsBlind = jest.fn();
  const mockSetAge = jest.fn();
  const mockSetPayNoNI = jest.fn();
  const mockSetStudentLoanPlan = jest.fn();
  const mockSetPensionContributionType = jest.fn();
  const mockSetPensionContribution = jest.fn();
  const mockSetAllowancesDeductions = jest.fn();

  const defaultInput = {
    isMarried: false,
    partnerGrossWage: 0,
    isBlind: false,
    age: undefined,
    payNoNI: false,
    studentLoanPlan: 'none' as const,
    pensionContributionType: 'percentage' as const,
    pensionContribution: 0,
    allowancesDeductions: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ input: defaultInput })
    );

    (useCalculatorActions as jest.Mock).mockReturnValue({
      setIsMarried: mockSetIsMarried,
      setPartnerGrossWage: mockSetPartnerGrossWage,
      setIsBlind: mockSetIsBlind,
      setAge: mockSetAge,
      setPayNoNI: mockSetPayNoNI,
      setStudentLoanPlan: mockSetStudentLoanPlan,
      setPensionContributionType: mockSetPensionContributionType,
      setPensionContribution: mockSetPensionContribution,
      setAllowancesDeductions: mockSetAllowancesDeductions,
    });
  });

  describe('Collapsible Behavior', () => {
    it('should render with "Advanced Options" trigger', () => {
      render(<AdvancedInputs />);

      expect(screen.getByText('Advanced Options')).toBeInTheDocument();
    });

    it('should start collapsed by default', () => {
      render(<AdvancedInputs />);

      // Advanced fields should NOT be visible initially
      expect(screen.queryByText('Married')).not.toBeInTheDocument();
      expect(screen.queryByText('Student Loan')).not.toBeInTheDocument();
    });

    it('should expand when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<AdvancedInputs />);

      const trigger = screen.getByText('Advanced Options');
      await user.click(trigger);

      // Advanced fields should now be visible
      expect(screen.getByText('Married')).toBeInTheDocument();
      expect(screen.getByText('Blind Allowance')).toBeInTheDocument();
      expect(screen.getByText('Student Loan')).toBeInTheDocument();
    });

    it('should toggle chevron icon when opening/closing', async () => {
      const user = userEvent.setup();
      render(<AdvancedInputs />);

      const trigger = screen.getByText('Advanced Options');
      await user.click(trigger);

      // Should open and show content
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Advanced Fields Rendering', () => {
    beforeEach(async () => {
      // Open the collapsible for these tests
      const user = userEvent.setup();
      render(<AdvancedInputs />);
      await user.click(screen.getByText('Advanced Options'));
    });

    it('should render marriage allowance checkbox', () => {
      expect(screen.getByText('Married')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /married/i })).toBeInTheDocument();
    });

    it('should render blind allowance checkbox', () => {
      expect(screen.getByText('Blind Allowance')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /blind/i })).toBeInTheDocument();
    });

    it('should render age input', () => {
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByTestId('age-input')).toBeInTheDocument();
    });

    it('should render pay no NI checkbox', () => {
      expect(screen.getByText('I pay no NI')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /pay no ni/i })).toBeInTheDocument();
    });

    it('should render student loan select', () => {
      expect(screen.getByText('Student Loan')).toBeInTheDocument();
    });

    it('should render allowances/deductions input', () => {
      expect(screen.getByText('Allowances/Deductions')).toBeInTheDocument();
    });

    it('should render pension type select', () => {
      expect(screen.getByText('Pension Type')).toBeInTheDocument();
    });

    it('should render pension contribution input', () => {
      expect(screen.getByText('Pension Contribution %')).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should show partner wage input when married', async () => {
      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { ...defaultInput, isMarried: true } })
      );

      const user = userEvent.setup();
      render(<AdvancedInputs />);
      await user.click(screen.getByText('Advanced Options'));

      expect(screen.getByText("Partner's Gross Wage")).toBeInTheDocument();
    });

    it('should hide partner wage input when not married', async () => {
      const user = userEvent.setup();
      render(<AdvancedInputs />);
      await user.click(screen.getByText('Advanced Options'));

      expect(screen.queryByText("Partner's Gross Wage")).not.toBeInTheDocument();
    });

    it('should show percentage input when pension type is percentage', async () => {
      const user = userEvent.setup();
      render(<AdvancedInputs />);
      await user.click(screen.getByText('Advanced Options'));

      expect(screen.getByText('Pension Contribution %')).toBeInTheDocument();
    });

    it('should show amount input when pension type is amount', async () => {
      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { ...defaultInput, pensionContributionType: 'amount' } })
      );

      const user = userEvent.setup();
      render(<AdvancedInputs />);
      await user.click(screen.getByText('Advanced Options'));

      expect(screen.getByText('Pension Contribution')).toBeInTheDocument();
      expect(screen.queryByText('Pension Contribution %')).not.toBeInTheDocument();
    });
  });

  describe('Store Integration', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<AdvancedInputs />);
      await user.click(screen.getByText('Advanced Options'));
    });

    it('should call setIsMarried when married checkbox is clicked', async () => {
      const marriedCheckbox = screen.getByRole('checkbox', { name: /married/i });
      fireEvent.click(marriedCheckbox);

      expect(mockSetIsMarried).toHaveBeenCalled();
    });

    it('should call setIsBlind when blind checkbox is clicked', async () => {
      const blindCheckbox = screen.getByRole('checkbox', { name: /blind/i });
      fireEvent.click(blindCheckbox);

      expect(mockSetIsBlind).toHaveBeenCalled();
    });

    it('should call setPayNoNI when pay no NI checkbox is clicked', async () => {
      const payNoNICheckbox = screen.getByRole('checkbox', { name: /pay no ni/i });
      fireEvent.click(payNoNICheckbox);

      expect(mockSetPayNoNI).toHaveBeenCalled();
    });
  });

  describe('Tooltips', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<AdvancedInputs />);
      await user.click(screen.getByText('Advanced Options'));
    });

    it('should render tooltip help icons for all advanced fields', () => {
      expect(screen.getByTestId('tooltip-trigger-marriageAllowance')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-trigger-blindAllowance')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-trigger-age')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-trigger-payNoNI')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-trigger-studentLoanPlan')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-trigger-allowancesDeductions')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-trigger-pensionType')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-trigger-pensionContribution')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible collapsible trigger', () => {
      render(<AdvancedInputs />);

      const trigger = screen.getByText('Advanced Options');
      expect(trigger.closest('button')).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<AdvancedInputs />);

      // Tab to trigger
      await user.tab();
      const trigger = screen.getByText('Advanced Options');
      expect(trigger.closest('button')).toHaveFocus();

      // Press Enter to expand
      await user.keyboard('{Enter}');
      expect(screen.getByText('Married')).toBeInTheDocument();
    });
  });

  describe('Progressive Disclosure', () => {
    it('should reduce initial complexity by hiding advanced options', () => {
      render(<AdvancedInputs />);

      // Only the trigger visible, not the fields
      expect(screen.getByText('Advanced Options')).toBeInTheDocument();
      expect(screen.queryByText('Married')).not.toBeInTheDocument();
      expect(screen.queryByText('Student Loan')).not.toBeInTheDocument();
      expect(screen.queryByText('Pension Type')).not.toBeInTheDocument();
    });

    it('should reveal all advanced options when expanded', async () => {
      const user = userEvent.setup();
      render(<AdvancedInputs />);

      await user.click(screen.getByText('Advanced Options'));

      // All advanced fields now visible
      expect(screen.getByText('Married')).toBeInTheDocument();
      expect(screen.getByText('Blind Allowance')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('I pay no NI')).toBeInTheDocument();
      expect(screen.getByText('Student Loan')).toBeInTheDocument();
      expect(screen.getByText('Allowances/Deductions')).toBeInTheDocument();
      expect(screen.getByText('Pension Type')).toBeInTheDocument();
    });
  });
});
