// src/components/organisms/__tests__/EnhancedPayslipTable.test.tsx

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import EnhancedPayslipTable from '../EnhancedPayslipTable';

// Mock tax calculation results for testing
const mockResults: TaxCalculationResults = {
  grossSalary: {
    annually: 50000,
    monthly: 4166.67,
    fourWeekly: 3846.15,
    fortnightly: 1923.08,
    weekly: 961.54,
    daily: 192.31,
    hourly: 25.64,
  },
  taxFreeAmount: 12570,
  taxableIncome: 37430,
  incomeTax: {
    annually: 7486,
    monthly: 623.83,
    fourWeekly: 575.85,
    fortnightly: 287.92,
    weekly: 144.35,
    daily: 28.87,
    hourly: 3.84,
  },
  nationalInsurance: {
    annually: 4491.6,
    monthly: 374.3,
    fourWeekly: 345.51,
    fortnightly: 172.75,
    weekly: 86.38,
    daily: 17.28,
    hourly: 2.3,
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
    annually: 2500,
    monthly: 208.33,
    fourWeekly: 192.31,
    fortnightly: 96.15,
    weekly: 48.08,
    daily: 9.62,
    hourly: 1.28,
  },
  netPay: {
    annually: 35522.4,
    monthly: 2960.2,
    fourWeekly: 2732.49,
    fortnightly: 1366.25,
    weekly: 682.74,
    daily: 136.62,
    hourly: 18.22,
  },
  employerNI: 6197.64,
  taxBands: [
    {
      name: '20% Rate',
      rate: 20,
      amount: 7486,
    },
  ],
};

describe('EnhancedPayslipTable', () => {
  beforeEach(() => {
    // Reset any mocks
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('should render empty state when no results provided', () => {
      render(<EnhancedPayslipTable results={null} />);

      expect(screen.getByText('Tax Summary')).toBeInTheDocument();
      expect(
        screen.getByText('Enter your salary to see detailed calculations')
      ).toBeInTheDocument();
    });

    test('should render table with results', () => {
      render(<EnhancedPayslipTable results={mockResults} />);

      expect(screen.getByText('Your Payslip Summary')).toBeInTheDocument();
      expect(screen.getByTestId('results-table')).toBeInTheDocument();
    });
  });

  describe('Period Toggle Functionality', () => {
    test('should show default periods initially', () => {
      render(<EnhancedPayslipTable results={mockResults} />);

      // Check that default period checkboxes are initially checked
      const defaultPeriods = ['Yearly', 'Monthly', 'Weekly'];
      const hiddenPeriods = ['4-Weekly', 'Fortnightly', 'Daily', 'Hourly'];

      for (const period of defaultPeriods) {
        const checkbox = screen.getByLabelText(`Toggle ${period} column visibility`);
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toBeChecked();
      }

      for (const period of hiddenPeriods) {
        const checkbox = screen.getByLabelText(`Toggle ${period} column visibility`);
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).not.toBeChecked();
      }
    });

    test('should toggle period visibility when checkbox is clicked', () => {
      render(<EnhancedPayslipTable results={mockResults} />);

      const weeklyCheckbox = screen.getByLabelText('Toggle Weekly column visibility');
      const table = screen.getByTestId('results-table');

      // Initially, Weekly column should be visible
      expect(table.querySelector('th')).toBeInTheDocument();
      expect(weeklyCheckbox).toBeChecked();

      // Uncheck Weekly
      fireEvent.click(weeklyCheckbox);

      // Weekly column should be hidden
      expect(weeklyCheckbox).not.toBeChecked();

      // Check Weekly again
      fireEvent.click(weeklyCheckbox);

      // Weekly column should be visible again
      expect(weeklyCheckbox).toBeChecked();
    });
  });

  describe('Table Content Verification', () => {
    test('should display all required categories', () => {
      render(<EnhancedPayslipTable results={mockResults} />);

      const requiredCategories = [
        'Gross Pay',
        'Tax-Free Allowance',
        'Total Taxable',
        'Total Tax Due',
        '20% Rate',
        'National Insurance',
        'Pension [You]',
        'Pension [HMRC Relief]',
        'Allowances/Deductions',
        'Net Pay',
        'Employers NI',
        'Net Change from Previous Year',
      ];

      for (const category of requiredCategories) {
        expect(screen.getByText(category)).toBeInTheDocument();
      }
    });

    test('should display correct annual values', () => {
      render(<EnhancedPayslipTable results={mockResults} />);

      // Check key annual values are formatted correctly
      expect(screen.getAllByText('50,000.00')).toHaveLength(1); // Gross Pay
      expect(screen.getAllByText('12,570.00')).toHaveLength(1); // Tax-Free Allowance
      expect(screen.getAllByText('37,430.00')).toHaveLength(1); // Total Taxable
      expect(screen.getAllByText('7,486.00')).toHaveLength(2); // Total Tax Due (appears twice for 20% rate)
      expect(screen.getAllByText('35,522.40')).toHaveLength(1); // Net Pay
    });

    test('should display correct percentages', () => {
      render(<EnhancedPayslipTable results={mockResults} />);

      // Check percentage calculations
      expect(screen.getByText('100%')).toBeInTheDocument(); // Gross Pay always 100%
      expect(screen.getByText('25.1%')).toBeInTheDocument(); // Tax-Free Allowance: 12570/50000
      expect(screen.getByText('71.0%')).toBeInTheDocument(); // Net Pay: 35522.40/50000
    });
  });

  describe('Responsive Design', () => {
    test('should have proper CSS classes for responsive design', () => {
      render(<EnhancedPayslipTable results={mockResults} />);

      const table = screen.getByTestId('results-table');
      const container = table.parentElement;

      // Check container has overflow-x-auto for horizontal scrolling
      expect(container).toHaveClass('overflow-x-auto');

      // Check table has proper styling classes
      expect(table).toHaveClass('w-full', 'text-sm', 'text-gray-100', 'border', 'border-gray-600');
    });

    test('should have sticky headers', () => {
      render(<EnhancedPayslipTable results={mockResults} />);

      // Check title has sticky class
      const title = screen.getByText('Your Payslip Summary');
      expect(title).toHaveClass('sticky', 'top-0', 'z-10');

      // Check table header has sticky class by finding the header row in thead
      const table = screen.getByTestId('results-table');
      const headerRow = table.querySelector('thead tr');
      expect(headerRow).toHaveClass('sticky', 'top-8', 'z-10');
    });
  });

  describe('Student Loans Integration', () => {
    test('should show student loan row when student loans provided', () => {
      const resultsWithStudentLoan = {
        ...mockResults,
        studentLoan: {
          annually: 693.45,
          monthly: 57.79,
          fourWeekly: 53.34,
          fortnightly: 26.67,
          weekly: 13.33,
          daily: 2.67,
          hourly: 0.36,
        },
      };

      render(<EnhancedPayslipTable results={resultsWithStudentLoan} studentLoans={['plan2']} />);

      expect(screen.getByText('Student Loan')).toBeInTheDocument();
      expect(screen.getByText('693.45')).toBeInTheDocument();
    });

    test('should show plural student loans when multiple plans', () => {
      const resultsWithStudentLoan = {
        ...mockResults,
        studentLoan: {
          annually: 1000,
          monthly: 83.33,
          fourWeekly: 76.92,
          fortnightly: 38.46,
          weekly: 19.23,
          daily: 3.85,
          hourly: 0.51,
        },
      };

      render(
        <EnhancedPayslipTable results={resultsWithStudentLoan} studentLoans={['plan1', 'plan2']} />
      );

      expect(screen.getByText('Student Loans')).toBeInTheDocument(); // Plural
    });

    test('should not show student loan row when no student loans', () => {
      render(<EnhancedPayslipTable results={mockResults} studentLoans={[]} />);

      expect(screen.queryByText('Student Loan')).not.toBeInTheDocument();
      expect(screen.queryByText('Student Loans')).not.toBeInTheDocument();
    });
  });

  describe('Marriage Allowance Integration', () => {
    test('should show marriage allowance when married and allowances present', () => {
      const resultsWithMarriageAllowance = {
        ...mockResults,
        additionalAllowances: {
          annually: 252,
          breakdown: [
            {
              name: 'Marriage Allowance',
              type: 'workingFromHome' as const,
              annually: 252,
            },
          ],
        },
      };

      render(<EnhancedPayslipTable results={resultsWithMarriageAllowance} isMarried={true} />);

      expect(screen.getByText('Marriage Allowance')).toBeInTheDocument();
      expect(screen.getByText('252.00')).toBeInTheDocument();
    });

    test('should not show marriage allowance when not married', () => {
      render(<EnhancedPayslipTable results={mockResults} isMarried={false} />);

      expect(screen.queryByText('Marriage Allowance')).not.toBeInTheDocument();
    });
  });

  describe('Data Integrity', () => {
    test('should not have text wrapping in table cells', () => {
      render(<EnhancedPayslipTable results={mockResults} />);

      // Check that cells have proper CSS to prevent wrapping
      const table = screen.getByTestId('results-table');
      const cells = table.querySelectorAll('td');

      for (const cell of cells) {
        // All cells should have compact padding (p-1 or p-2)
        expect(cell.className).toMatch(/p-[12]/);
      }
    });

    test('should format currency values correctly', () => {
      render(<EnhancedPayslipTable results={mockResults} />);

      // All monetary values should be formatted with 2 decimal places
      const monetaryRegex = /^\d{1,3}(,\d{3})*\.\d{2}$/;

      // Check a few key values
      expect(screen.getByText('50,000.00')).toBeInTheDocument();
      expect(screen.getByText('12,570.00')).toBeInTheDocument();
      expect(screen.getByText('35,522.40')).toBeInTheDocument();

      // All displayed numbers should follow this format
      const table = screen.getByTestId('results-table');
      const numberCells = Array.from(table.querySelectorAll('td')).filter((cell) =>
        /^\d/.test(cell.textContent || '')
      );

      for (const cell of numberCells) {
        if (cell.textContent && !cell.textContent.includes('%')) {
          expect(cell.textContent).toMatch(monetaryRegex);
        }
      }
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels for checkboxes', () => {
      render(<EnhancedPayslipTable results={mockResults} />);

      const periods = ['Yearly', 'Monthly', '4-Weekly', 'Fortnightly', 'Weekly', 'Daily', 'Hourly'];
      for (const period of periods) {
        const checkbox = screen.getByLabelText(`Toggle ${period} column visibility`);
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toHaveAttribute('aria-label', `Toggle ${period} column visibility`);
      }
    });

    test('should have proper table structure', () => {
      render(<EnhancedPayslipTable results={mockResults} />);

      const table = screen.getByTestId('results-table');
      expect(table).toHaveRole('table');

      // Should have thead and tbody
      expect(table.querySelector('thead')).toBeInTheDocument();
      expect(table.querySelector('tbody')).toBeInTheDocument();

      // Headers should have proper scope
      const headers = table.querySelectorAll('th');
      expect(headers.length).toBeGreaterThan(0);
    });
  });
});
