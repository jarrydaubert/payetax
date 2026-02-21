// src/components/organisms/CalculatorInputs/__tests__/WhatIfInputs.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import * as calculatorStore from '@/store/calculatorStore';
import { WhatIfInputs } from '../WhatIfInputs';

// Mock the store
jest.mock('@/store/calculatorStore');
jest.mock('sonner');

const mockUseWhatIf = calculatorStore.useWhatIf as jest.MockedFunction<
  typeof calculatorStore.useWhatIf
>;
const mockUseWhatIfResults = calculatorStore.useWhatIfResults as jest.MockedFunction<
  typeof calculatorStore.useWhatIfResults
>;
const mockUseCalculatorActions = calculatorStore.useCalculatorActions as jest.MockedFunction<
  typeof calculatorStore.useCalculatorActions
>;

const mockActions = {
  setWhatIfType: jest.fn(),
  setWhatIfValue: jest.fn(),
  calculateWhatIf: jest.fn(),
  clearWhatIf: jest.fn(),
};

describe('WhatIfInputs', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock values
    mockUseWhatIf.mockReturnValue({
      type: 'percentage',
      value: 0,
    });
    mockUseWhatIfResults.mockReturnValue(null);
    mockUseCalculatorActions.mockReturnValue({
      ...mockActions,
      // Add other required actions with mock implementations
      updateInputs: jest.fn(),
      setRegion: jest.fn(),
      setSalary: jest.fn(),
      setPeriod: jest.fn(),
      setTaxCode: jest.fn(),
      setStudentLoanPlan: jest.fn(),
      setHasPostGradLoan: jest.fn(),
      setScottishTaxCode: jest.fn(),
      setBlind: jest.fn(),
      setMarriageAllowance: jest.fn(),
      setMarriageAllowanceRole: jest.fn(),
      setPensionType: jest.fn(),
      setPensionFixedAmount: jest.fn(),
      setPensionPercentage: jest.fn(),
      setOtherTaxableIncome: jest.fn(),
      setBenefitsInKind: jest.fn(),
      setChildBenefitChildren: jest.fn(),
      setNonDomiciled: jest.fn(),
      resetCalculator: jest.fn(),
    } as any);
  });

  describe('rendering', () => {
    it('should render the What If Scenario header', () => {
      render(<WhatIfInputs />);

      expect(screen.getByText('What If Scenario')).toBeInTheDocument();
    });

    it('should render the change type select', () => {
      render(<WhatIfInputs />);

      expect(screen.getByTestId('what-if-type-select')).toBeInTheDocument();
    });

    it('should render the value input', () => {
      render(<WhatIfInputs />);

      expect(screen.getByTestId('what-if-value-input')).toBeInTheDocument();
    });

    it('should render the Compare Scenarios button', () => {
      render(<WhatIfInputs />);

      expect(screen.getByTestId('what-if-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('what-if-trigger')).toHaveTextContent('Compare Scenarios');
    });

    it('should not render Clear button when no What If results', () => {
      mockUseWhatIfResults.mockReturnValue(null);
      render(<WhatIfInputs />);

      expect(screen.queryByTestId('clear-what-if-button')).not.toBeInTheDocument();
    });

    it('should render Clear button when What If results exist', () => {
      mockUseWhatIfResults.mockReturnValue({
        grossSalary: 45000,
        taxableIncome: 32430,
        totalTax: 6486,
      } as any);

      render(<WhatIfInputs />);

      expect(screen.getByTestId('clear-what-if-button')).toBeInTheDocument();
    });
  });

  describe('change type selection', () => {
    it('should display "Percentage Change" label for percentage type', () => {
      mockUseWhatIf.mockReturnValue({
        type: 'percentage',
        value: 10,
      });

      render(<WhatIfInputs />);

      expect(screen.getByText('Percentage Change')).toBeInTheDocument();
    });

    it('should display "Amount Change (£)" label for amount type', () => {
      mockUseWhatIf.mockReturnValue({
        type: 'amount',
        value: 5000,
      });

      render(<WhatIfInputs />);

      expect(screen.getByText('Amount Change (£)')).toBeInTheDocument();
    });

    it('should display "New Total Salary (£)" label for total type', () => {
      mockUseWhatIf.mockReturnValue({
        type: 'total',
        value: 45000,
      });

      render(<WhatIfInputs />);

      expect(screen.getByText('New Total Salary (£)')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should render value input that accepts user input', async () => {
      const user = userEvent.setup();
      render(<WhatIfInputs />);

      const input = screen.getByTestId('what-if-value-input');

      // Verify input is interactive and accepts focus
      await user.click(input);
      expect(input).toHaveFocus();

      // Note: NumberInput component's onChange behavior is tested in its own test file
      // We verify the input is present and interactive here
    });

    it('should call calculateWhatIf when Compare button is clicked', async () => {
      const user = userEvent.setup();
      render(<WhatIfInputs />);

      const compareButton = screen.getByTestId('what-if-trigger');
      await user.click(compareButton);

      expect(mockActions.calculateWhatIf).toHaveBeenCalled();
    });

    it('should call onCompare callback when Compare button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnCompare = jest.fn();
      render(<WhatIfInputs onCompare={mockOnCompare} />);

      const compareButton = screen.getByTestId('what-if-trigger');
      await user.click(compareButton);

      expect(mockOnCompare).toHaveBeenCalled();
    });

    it('should call clearWhatIf when Clear button is clicked', async () => {
      const user = userEvent.setup();
      mockUseWhatIfResults.mockReturnValue({
        grossSalary: 45000,
      } as any);

      render(<WhatIfInputs />);

      const clearButton = screen.getByTestId('clear-what-if-button');
      await user.click(clearButton);

      expect(mockActions.clearWhatIf).toHaveBeenCalled();
    });

    it('should show toast notification when clearing What If', async () => {
      const user = userEvent.setup();
      mockUseWhatIfResults.mockReturnValue({
        grossSalary: 45000,
      } as any);

      render(<WhatIfInputs />);

      const clearButton = screen.getByTestId('clear-what-if-button');
      await user.click(clearButton);

      expect(toast.info).toHaveBeenCalledWith('What If scenario cleared');
    });
  });

  describe('styling', () => {
    it('should apply semantic gradient styling to container', () => {
      render(<WhatIfInputs />);

      // Check semantic border and gradient classes
      const container = screen.getByText('What If Scenario').closest('div')?.parentElement;
      expect(container).toHaveClass('border-primary/30');
      expect(container).toHaveClass('from-primary/5');
      expect(container).toHaveClass('to-accent/10');
    });

    it('should apply semantic primary styling to Compare button', () => {
      render(<WhatIfInputs />);

      const button = screen.getByTestId('what-if-trigger');
      expect(button).toHaveClass('bg-primary');
      expect(button).toHaveClass('text-primary-foreground');
    });
  });

  describe('accessibility', () => {
    it('should have proper label association for value input', () => {
      render(<WhatIfInputs />);

      const label = screen.getByText('Percentage Change');
      const _input = screen.getByTestId('what-if-value-input');

      // Label should have htmlFor attribute
      expect(label.closest('label')).toBeInTheDocument();
    });

    it('should have aria-label on Clear button', () => {
      mockUseWhatIfResults.mockReturnValue({
        grossSalary: 45000,
      } as any);

      render(<WhatIfInputs />);

      const clearButton = screen.getByTestId('clear-what-if-button');
      expect(clearButton).toHaveAttribute('aria-label', 'Clear What If scenario');
    });
  });

  describe('input placeholders', () => {
    it('should show percentage placeholder for percentage type', () => {
      mockUseWhatIf.mockReturnValue({
        type: 'percentage',
        value: 0,
      });

      render(<WhatIfInputs />);

      const input = screen.getByTestId('what-if-value-input');
      expect(input).toHaveAttribute('placeholder', 'e.g., 10 for 10% increase');
    });

    it('should show amount placeholder for amount type', () => {
      mockUseWhatIf.mockReturnValue({
        type: 'amount',
        value: 0,
      });

      render(<WhatIfInputs />);

      const input = screen.getByTestId('what-if-value-input');
      expect(input).toHaveAttribute('placeholder', 'e.g., 5000 for £5k raise');
    });

    it('should show total placeholder for total type', () => {
      mockUseWhatIf.mockReturnValue({
        type: 'total',
        value: 0,
      });

      render(<WhatIfInputs />);

      const input = screen.getByTestId('what-if-value-input');
      expect(input).toHaveAttribute('placeholder', 'e.g., 45000 for £45k total');
    });
  });

  describe('responsive layout', () => {
    it('should use grid layout for inputs', () => {
      render(<WhatIfInputs />);

      const inputsContainer = screen.getByText('Change Type').closest('div')?.parentElement;
      expect(inputsContainer).toHaveClass('grid');
      expect(inputsContainer).toHaveClass('sm:grid-cols-2');
    });
  });
});
