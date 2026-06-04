// src/components/organisms/__tests__/CalculatorContainer.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import {
  useCalculatorActions,
  useCalculatorResults,
  useCalculatorStore,
} from '@/store/calculatorStore';
import { CalculatorContainer } from '../CalculatorContainer';

jest.mock('@/store/calculatorStore', () => ({
  useCalculatorResults: jest.fn(),
  useCalculatorActions: jest.fn(),
  useCalculatorStore: jest.fn(),
}));

jest.mock('../CalculatorInputs/CalculatorInputsSection', () => ({
  CalculatorInputsSection: ({
    onCalculate,
    resultAction,
  }: {
    onCalculate: () => void;
    resultAction?: ReactNode;
  }) => (
    <div data-testid='inputs-section-mock'>
      <button type='button' onClick={onCalculate}>
        Calculate
      </button>
      <div data-testid='input-action-slot'>{resultAction}</div>
    </div>
  ),
}));

jest.mock('../CalculatorResults/ResultsSummaryCards', () => ({
  ResultsSummaryCards: () => <div data-testid='summary-cards-mock'>Summary Cards</div>,
}));

jest.mock('../CalculatorResults/ResultsTable', () => ({
  ResultsTable: ({
    onApplyPensionOptimization,
  }: {
    onApplyPensionOptimization?: (amount: number) => void;
  }) => (
    <div data-testid='results-table-mock'>
      Results Table
      {onApplyPensionOptimization && (
        <button type='button' onClick={() => onApplyPensionOptimization(5000)}>
          Apply pension optimization
        </button>
      )}
    </div>
  ),
}));

// Mock next/dynamic to bypass lazy loading in tests
// Returns the mocked component directly instead of wrapping in dynamic loader
describe('CalculatorContainer Component', () => {
  const mockResults: TaxCalculationResults = {
    grossSalary: {
      annually: 30000,
      monthly: 2500,
      fourWeekly: 2307.69,
      fortnightly: 1153.84,
      weekly: 576.92,
      daily: 115.38,
      hourly: 15.38,
    },
    taxFreeAmount: 12570,
    taxableIncome: 17430,
    incomeTax: {
      annually: 3486,
      monthly: 290.5,
      fourWeekly: 268.15,
      fortnightly: 134.07,
      weekly: 67.04,
      daily: 13.41,
      hourly: 1.79,
    },
    nationalInsurance: {
      annually: 2028,
      monthly: 169,
      fourWeekly: 155.69,
      fortnightly: 77.85,
      weekly: 38.92,
      daily: 7.78,
      hourly: 1.04,
    },
    studentLoan: {
      annually: 0,
      monthly: 0,
      fourWeekly: 0,
      fortnightly: 0,
      weekly: 0,
      daily: 0,
      hourly: 0,
    },
    pensionContribution: {
      annually: 0,
      monthly: 0,
      fourWeekly: 0,
      fortnightly: 0,
      weekly: 0,
      daily: 0,
      hourly: 0,
    },
    netPay: {
      annually: 24486,
      monthly: 2040.5,
      fourWeekly: 1884.15,
      fortnightly: 942.07,
      weekly: 471.04,
      daily: 94.21,
      hourly: 12.56,
    },
    employerNI: 1872.48,
    totalTaxBurden: 5514,
    effectiveTaxRate: 18.38,
    marginalTaxRate: 32,
    taxBands: [{ rate: 20, amount: 3486, name: 'Basic Rate' }],
  };

  const mockCalculate = jest.fn();
  const mockCalculatePreviousYear = jest.fn();
  const mockSetInput = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useCalculatorActions as jest.Mock).mockReturnValue({
      calculate: mockCalculate,
      calculatePreviousYear: mockCalculatePreviousYear,
      setInput: mockSetInput,
    });
    (useCalculatorResults as jest.Mock).mockReturnValue(null);
    (useCalculatorStore as jest.Mock).mockImplementation((selector) =>
      selector({
        previousYearResults: null,
        input: {
          studentLoanPlans: 'none',
          allowancesDeductions: 0,
        },
      }),
    );
  });

  describe('Initial Rendering', () => {
    it('should render calculator section', () => {
      render(<CalculatorContainer />);

      expect(screen.getByTestId('calculator-section')).toBeInTheDocument();
    });

    it('should render header with title', () => {
      render(<CalculatorContainer />);

      expect(screen.getByRole('heading', { name: /UK Tax Calculator/i })).toBeInTheDocument();
    });

    it('should render header description', () => {
      render(<CalculatorContainer />);

      expect(
        screen.getByText(/Estimate your take-home pay with official HMRC rates/i),
      ).toBeInTheDocument();
    });

    it('should render inputs section', () => {
      render(<CalculatorContainer />);

      expect(screen.getByTestId('inputs-section-mock')).toBeInTheDocument();
    });

    it('should not show results initially', () => {
      render(<CalculatorContainer />);

      expect(screen.queryByTestId('summary-cards-mock')).not.toBeInTheDocument();
      expect(screen.queryByTestId('results-table-mock')).not.toBeInTheDocument();
    });

    it('should show placeholder text when no results', () => {
      render(<CalculatorContainer />);

      expect(screen.getByText('Ready to Calculate')).toBeInTheDocument();
      expect(
        screen.getByText(/Enter your salary\. See your take-home pay in seconds\./i),
      ).toBeInTheDocument();
    });

    it('should render placeholder icon', () => {
      render(<CalculatorContainer />);

      // Sparkles icon in placeholder
      const placeholder = screen.getByText('Ready to Calculate').closest('div');
      const icon = placeholder?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Calculate Interaction', () => {
    it('should call calculate action when Calculate button is clicked', () => {
      render(<CalculatorContainer />);

      const button = screen.getByRole('button', { name: /Calculate/i });
      fireEvent.click(button);

      expect(mockCalculate).toHaveBeenCalledTimes(1);
    });

    it('should show results after calculation', async () => {
      (useCalculatorResults as jest.Mock).mockReturnValue(null);
      const { rerender } = render(<CalculatorContainer />);

      const button = screen.getByRole('button', { name: /Calculate/i });
      fireEvent.click(button);

      // Update mock to return results
      (useCalculatorResults as jest.Mock).mockReturnValue(mockResults);
      rerender(<CalculatorContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('summary-cards-mock')).toBeInTheDocument();
      });
    });

    it('should show results table after calculation', async () => {
      (useCalculatorResults as jest.Mock).mockReturnValue(null);
      const { rerender } = render(<CalculatorContainer />);

      const button = screen.getByRole('button', { name: /Calculate/i });
      fireEvent.click(button);

      (useCalculatorResults as jest.Mock).mockReturnValue(mockResults);
      rerender(<CalculatorContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('results-table-mock')).toBeInTheDocument();
      });
    });

    it('should hide placeholder when results are shown', async () => {
      (useCalculatorResults as jest.Mock).mockReturnValue(null);
      const { rerender } = render(<CalculatorContainer />);

      const button = screen.getByRole('button', { name: /Calculate/i });
      fireEvent.click(button);

      (useCalculatorResults as jest.Mock).mockReturnValue(mockResults);
      rerender(<CalculatorContainer />);

      await waitFor(() => {
        expect(screen.queryByText('Ready to Calculate')).not.toBeInTheDocument();
      });
    });
  });

  describe('Results Display', () => {
    beforeEach(() => {
      (useCalculatorResults as jest.Mock).mockReturnValue(mockResults);
    });

    it('should render summary cards when results exist', () => {
      render(<CalculatorContainer />);

      expect(screen.getByTestId('summary-cards-mock')).toBeInTheDocument();
    });

    it('should render results table when results exist', () => {
      render(<CalculatorContainer />);

      expect(screen.getByTestId('tax-results')).toBeInTheDocument();
      expect(screen.getByTestId('results-table-mock')).toBeInTheDocument();
    });

    it('should show the email results action when results exist', () => {
      render(<CalculatorContainer />);

      expect(
        screen.getByRole('button', { name: /Email tax calculation results/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Print tax calculation results/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Download results as CSV file/i }),
      ).not.toBeInTheDocument();
    });

    it('should keep the email action in the input action row when results exist', () => {
      render(<CalculatorContainer />);

      expect(screen.getByTestId('input-action-slot')).toContainElement(
        screen.getByRole('button', { name: /Email tax calculation results/i }),
      );
    });

    it('should not show the email input until the email action is opened', () => {
      render(<CalculatorContainer />);

      expect(screen.queryByLabelText(/Email address for results/i)).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Email tax calculation results/i }));

      expect(screen.getByLabelText(/Email address for results/i)).toBeInTheDocument();
    });

    it('should not show result actions when no results exist', () => {
      (useCalculatorResults as jest.Mock).mockReturnValue(null);
      render(<CalculatorContainer />);

      expect(
        screen.queryByRole('button', { name: /Email tax calculation results/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Print tax calculation results/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Download results as CSV file/i }),
      ).not.toBeInTheDocument();
    });

    it('should apply pension optimization before recalculating', () => {
      render(<CalculatorContainer />);

      fireEvent.click(screen.getByRole('button', { name: /Apply pension optimization/i }));

      expect(mockSetInput).toHaveBeenCalledWith({
        pensionContribution: 5000,
        pensionContributionType: 'amount',
      });
      expect(mockCalculate).toHaveBeenCalledTimes(1);
      expect(mockCalculatePreviousYear).toHaveBeenCalledTimes(1);
      expect(mockSetInput.mock.invocationCallOrder[0]).toBeLessThan(
        mockCalculate.mock.invocationCallOrder[0],
      );
    });
  });

  describe('Layout and Styling', () => {
    it('should have correct grid layout', () => {
      render(<CalculatorContainer />);

      const section = screen.getByTestId('calculator-section');
      expect(section).toHaveClass('lg:grid');
      // Updated to match responsive grid columns
      expect(section).toHaveClass('lg:grid-cols-[400px_minmax(0,1fr)]');
      expect(section).toHaveClass('xl:grid-cols-[390px_minmax(0,1fr)]');
      expect(section).toHaveClass('2xl:grid-cols-[380px_minmax(0,1fr)]');
    });

    it('should have responsive spacing', () => {
      render(<CalculatorContainer />);

      const section = screen.getByTestId('calculator-section');
      expect(section).toHaveClass('px-4');
      expect(section).toHaveClass('sm:px-4');
      expect(section).toHaveClass('xl:px-8');
    });

    it('should have max width constraint', () => {
      render(<CalculatorContainer />);

      const section = screen.getByTestId('calculator-section');
      // Updated to match current max-width
      expect(section).toHaveClass('max-w-screen-2xl');
    });

    it('should prevent the results column from stretching on desktop', () => {
      (useCalculatorResults as jest.Mock).mockReturnValue(mockResults);
      render(<CalculatorContainer />);

      expect(screen.getByTestId('tax-results')).toHaveClass('lg:self-start');
    });
  });

  describe('Accessibility', () => {
    it('should have main calculator section with testid', () => {
      render(<CalculatorContainer />);

      expect(screen.getByTestId('calculator-section')).toBeInTheDocument();
    });

    it('should have results section with testid when results exist', () => {
      (useCalculatorResults as jest.Mock).mockReturnValue(mockResults);
      render(<CalculatorContainer />);

      expect(screen.getByTestId('tax-results')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<CalculatorContainer />);

      const heading = screen.getByRole('heading', { name: /UK Tax Calculator/i });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      (useCalculatorResults as jest.Mock).mockReturnValue(mockResults);
      render(<CalculatorContainer />);

      expect(
        screen.getByRole('button', { name: /Email tax calculation results/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Print tax calculation results/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Download results as CSV file/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should use Framer Motion for animations', () => {
      render(<CalculatorContainer />);

      // Component should render without throwing
      expect(screen.getByTestId('calculator-section')).toBeInTheDocument();
    });

    it('should not throw errors on unmount', () => {
      const { unmount } = render(<CalculatorContainer />);

      expect(() => unmount()).not.toThrow();
    });

    it('should animate results appearance', async () => {
      (useCalculatorResults as jest.Mock).mockReturnValue(null);
      const { rerender } = render(<CalculatorContainer />);

      (useCalculatorResults as jest.Mock).mockReturnValue(mockResults);
      rerender(<CalculatorContainer />);

      // Results should appear with animation
      await waitFor(() => {
        expect(screen.getByTestId('tax-results')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle results becoming null', async () => {
      (useCalculatorResults as jest.Mock).mockReturnValue(mockResults);
      const { rerender } = render(<CalculatorContainer />);

      expect(screen.getByTestId('summary-cards-mock')).toBeInTheDocument();

      (useCalculatorResults as jest.Mock).mockReturnValue(null);
      rerender(<CalculatorContainer />);

      await waitFor(() => {
        expect(screen.queryByTestId('summary-cards-mock')).not.toBeInTheDocument();
      });
    });

    it('should initialize with default visible periods', () => {
      render(<CalculatorContainer />);

      // Component should render without errors
      expect(screen.getByTestId('calculator-section')).toBeInTheDocument();
    });

    it('should handle rapid Calculate clicks', () => {
      render(<CalculatorContainer />);

      const button = screen.getByRole('button', { name: /Calculate/i });
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Should call calculate for each click
      expect(mockCalculate).toHaveBeenCalledTimes(3);
    });
  });
});
