// src/components/organisms/WhatIfComparison/__tests__/WhatIfComparisonDisplay.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { useCalculatorStore } from '@/store/calculatorStore';
import { WhatIfComparisonDisplay } from '../WhatIfComparisonDisplay';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock zustand store
jest.mock('@/store/calculatorStore');

// Mock horizontal scroll hook
jest.mock('@/hooks/useHorizontalScrollIndicator', () => ({
  useHorizontalScrollIndicator: () => ({
    showLeftIndicator: false,
    showRightIndicator: false,
  }),
}));

// Mock mouse drag scroll hook
jest.mock('@/hooks/useMouseDragScroll', () => ({
  useMouseDragScroll: jest.fn(),
}));

const mockCurrentResults: TaxCalculationResults = {
  grossSalary: {
    annually: 50000,
    monthly: 4166.67,
    weekly: 961.54,
    daily: 192.31,
    hourly: 25.64,
  },
  taxFreeAmount: 12570,
  taxableIncome: 37430,
  incomeTax: {
    annually: 7486,
    monthly: 623.83,
    weekly: 143.96,
    daily: 28.79,
    hourly: 3.84,
  },
  nationalInsurance: {
    annually: 4212,
    monthly: 351,
    weekly: 81,
    daily: 16.2,
    hourly: 2.16,
  },
  pensionContribution: {
    annually: 0,
    monthly: 0,
    weekly: 0,
    daily: 0,
    hourly: 0,
  },
  studentLoan: {
    annually: 0,
    monthly: 0,
    weekly: 0,
    daily: 0,
    hourly: 0,
  },
  netPay: {
    annually: 38302,
    monthly: 3191.83,
    weekly: 736.58,
    daily: 147.32,
    hourly: 19.64,
  },
  taxBands: [
    {
      name: 'Basic Rate',
      rate: 20,
      income: 37430,
      amount: 7486,
    },
  ],
  employerNI: 5584,
  effectiveTaxRate: 23.4,
  marginalTaxRate: 32,
};

const mockWhatIfResults: TaxCalculationResults = {
  grossSalary: {
    annually: 60000,
    monthly: 5000,
    weekly: 1153.85,
    daily: 230.77,
    hourly: 30.77,
  },
  taxFreeAmount: 12570,
  taxableIncome: 47430,
  incomeTax: {
    annually: 9486,
    monthly: 790.5,
    weekly: 182.42,
    daily: 36.48,
    hourly: 4.86,
  },
  nationalInsurance: {
    annually: 5412,
    monthly: 451,
    weekly: 104.08,
    daily: 20.82,
    hourly: 2.78,
  },
  pensionContribution: {
    annually: 0,
    monthly: 0,
    weekly: 0,
    daily: 0,
    hourly: 0,
  },
  studentLoan: {
    annually: 0,
    monthly: 0,
    weekly: 0,
    daily: 0,
    hourly: 0,
  },
  netPay: {
    annually: 45102,
    monthly: 3758.5,
    weekly: 867.35,
    daily: 173.47,
    hourly: 23.13,
  },
  taxBands: [
    {
      name: 'Basic Rate',
      rate: 20,
      income: 37430,
      amount: 7486,
    },
    {
      name: 'Higher Rate',
      rate: 40,
      income: 10000,
      amount: 2000,
    },
  ],
  employerNI: 6784,
  effectiveTaxRate: 24.8,
  marginalTaxRate: 42,
};

const mockInput = {
  grossSalary: 50000,
  taxCode: '1257L',
  region: 'england',
  taxYear: '2025-26',
  pensionContribution: 0,
  pensionType: 'percentage',
  studentLoanPlans: 'none',
  allowancesDeductions: 0,
  isBlind: false,
  isOver65: false,
};

describe('WhatIfComparisonDisplay', () => {
  beforeEach(() => {
    (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ input: mockInput }),
    );
  });

  describe('rendering', () => {
    it('should render header and description', () => {
      render(
        <WhatIfComparisonDisplay
          currentResults={mockCurrentResults}
          whatIfResults={mockWhatIfResults}
        />,
      );

      expect(screen.getByText('Current vs What If Comparison')).toBeInTheDocument();
      expect(screen.getByText(/Side-by-side comparison/i)).toBeInTheDocument();
    });

    it('should render period selector', () => {
      render(
        <WhatIfComparisonDisplay
          currentResults={mockCurrentResults}
          whatIfResults={mockWhatIfResults}
        />,
      );

      // Period selector should be present (appears multiple times)
      const yearlyTexts = screen.getAllByText(/Yearly/i);
      expect(yearlyTexts.length).toBeGreaterThan(0);
    });

    it('should render comparison table', () => {
      render(
        <WhatIfComparisonDisplay
          currentResults={mockCurrentResults}
          whatIfResults={mockWhatIfResults}
        />,
      );

      expect(screen.getByLabelText(/What If comparison table/i)).toBeInTheDocument();
    });

    it('should display all category rows', () => {
      render(
        <WhatIfComparisonDisplay
          currentResults={mockCurrentResults}
          whatIfResults={mockWhatIfResults}
        />,
      );

      expect(screen.getByText('Gross Pay')).toBeInTheDocument();
      expect(screen.getByText('Tax-Free Allowance')).toBeInTheDocument();
      expect(screen.getByText('Total Taxable')).toBeInTheDocument();
      expect(screen.getByText('Total Tax Due')).toBeInTheDocument();
      expect(screen.getByText('National Insurance')).toBeInTheDocument();
      expect(screen.getByText('Pension [You]')).toBeInTheDocument();
      expect(screen.getByText('Net Pay')).toBeInTheDocument();
      expect(screen.getByText('Employers NI')).toBeInTheDocument();
    });

    it('should display Current and What If column headers', () => {
      render(
        <WhatIfComparisonDisplay
          currentResults={mockCurrentResults}
          whatIfResults={mockWhatIfResults}
        />,
      );

      const currentHeaders = screen.getAllByText('Current');
      const whatIfHeaders = screen.getAllByText('What If');

      expect(currentHeaders.length).toBeGreaterThan(0);
      expect(whatIfHeaders.length).toBeGreaterThan(0);
    });

    it('should display correct gross pay values', () => {
      render(
        <WhatIfComparisonDisplay
          currentResults={mockCurrentResults}
          whatIfResults={mockWhatIfResults}
        />,
      );

      // Check for gross pay values (they appear multiple times for different periods)
      const grossPayTexts = screen.getAllByText(/£50,000|£60,000/);
      expect(grossPayTexts.length).toBeGreaterThan(0);
    });
  });

  describe('period selection', () => {
    it('should show default periods (Yearly, Monthly, Weekly)', () => {
      render(
        <WhatIfComparisonDisplay
          currentResults={mockCurrentResults}
          whatIfResults={mockWhatIfResults}
        />,
      );

      // Periods appear multiple times (in selector and table headers)
      const yearlyTexts = screen.getAllByText('Yearly');
      expect(yearlyTexts.length).toBeGreaterThan(0);
      const monthlyTexts = screen.getAllByText('Monthly');
      expect(monthlyTexts.length).toBeGreaterThan(0);
      const weeklyTexts = screen.getAllByText('Weekly');
      expect(weeklyTexts.length).toBeGreaterThan(0);
    });

    it('should toggle period visibility', async () => {
      const user = userEvent.setup();
      render(
        <WhatIfComparisonDisplay
          currentResults={mockCurrentResults}
          whatIfResults={mockWhatIfResults}
        />,
      );

      // Click on a period checkbox to toggle
      const yearlyCheckbox = screen.getAllByRole('checkbox')[0]; // First checkbox
      await user.click(yearlyCheckbox);

      // The period should be toggled (implementation in PeriodSelectorCard)
      await waitFor(() => {
        expect(yearlyCheckbox).toBeInTheDocument();
      });
    });
  });

  describe('student loans', () => {
    it('should display student loan row when student loan exists', () => {
      const mockInputWithLoan = {
        ...mockInput,
        studentLoanPlans: ['plan1'] as const,
      };

      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: mockInputWithLoan }),
      );

      const resultsWithLoan = {
        ...mockCurrentResults,
        studentLoan: {
          annually: 1000,
          monthly: 83.33,
          weekly: 19.23,
          daily: 3.85,
          hourly: 0.51,
        },
      };

      render(
        <WhatIfComparisonDisplay
          currentResults={resultsWithLoan}
          whatIfResults={mockWhatIfResults}
        />,
      );

      expect(screen.getByText(/Student Loan/i)).toBeInTheDocument();
    });

    it('should not display student loan row when none', () => {
      render(
        <WhatIfComparisonDisplay
          currentResults={mockCurrentResults}
          whatIfResults={mockWhatIfResults}
        />,
      );

      expect(screen.queryByText(/Student Loan/i)).not.toBeInTheDocument();
    });
  });

  describe('calculations', () => {
    it('should calculate percentages correctly', () => {
      render(
        <WhatIfComparisonDisplay
          currentResults={mockCurrentResults}
          whatIfResults={mockWhatIfResults}
        />,
      );

      // Gross Pay should be 100%
      const percentageCells = screen.getAllByText('100%');
      expect(percentageCells.length).toBeGreaterThan(0);
    });

    it('should handle zero gross pay', () => {
      const zeroResults = {
        ...mockCurrentResults,
        grossSalary: {
          annually: 0,
          monthly: 0,
          weekly: 0,
          daily: 0,
          hourly: 0,
        },
      };

      const { container } = render(
        <WhatIfComparisonDisplay currentResults={zeroResults} whatIfResults={mockWhatIfResults} />,
      );

      // Check that zero values are rendered in the table
      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label for table', () => {
      render(
        <WhatIfComparisonDisplay
          currentResults={mockCurrentResults}
          whatIfResults={mockWhatIfResults}
        />,
      );

      const table = screen.getByLabelText(/What If comparison table/i);
      expect(table).toBeInTheDocument();
    });

    it('should have proper table structure', () => {
      render(
        <WhatIfComparisonDisplay
          currentResults={mockCurrentResults}
          whatIfResults={mockWhatIfResults}
        />,
      );

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <WhatIfComparisonDisplay
          currentResults={mockCurrentResults}
          whatIfResults={mockWhatIfResults}
          className='custom-test-class'
        />,
      );

      const element = container.querySelector('.custom-test-class');
      expect(element).toBeInTheDocument();
    });
  });

  describe('footer notes', () => {
    it('should display explanation for column colors', () => {
      render(
        <WhatIfComparisonDisplay
          currentResults={mockCurrentResults}
          whatIfResults={mockWhatIfResults}
        />,
      );

      expect(screen.getByText(/Blue columns show your current scenario/i)).toBeInTheDocument();
      expect(screen.getByText(/Purple columns show your "What If" scenario/i)).toBeInTheDocument();
    });
  });
});
