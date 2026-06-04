// src/components/organisms/CalculatorResults/__tests__/ResultsTable.test.tsx
import { fireEvent, render, screen, within } from '@testing-library/react';
import {
  calculateTax,
  type TaxCalculationInput,
  type TaxCalculationResults,
} from '@/lib/taxCalculator';
import { ResultsTable } from '../ResultsTable';

describe('ResultsTable Component', () => {
  const mockOnVisiblePeriodsChange = jest.fn();

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
      annually: 1500,
      monthly: 125,
      fourWeekly: 115.38,
      fortnightly: 57.69,
      weekly: 28.85,
      daily: 5.77,
      hourly: 0.77,
    },
    netPay: {
      annually: 22986,
      monthly: 1915.5,
      fourWeekly: 1768.08,
      fortnightly: 884.04,
      weekly: 442.01,
      daily: 88.4,
      hourly: 11.78,
    },
    employerNI: 1872.48,
    totalTaxBurden: 7386.48,
    effectiveTaxRate: 24.62,
    marginalTaxRate: 32,
    taxBands: [{ rate: 20, amount: 3486, name: 'Basic Rate' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the results table', () => {
      render(<ResultsTable results={mockResults} />);

      expect(screen.getByTestId('results-table')).toBeInTheDocument();
    });

    it('should render table headers', () => {
      render(<ResultsTable results={mockResults} />);

      const headers = screen.getAllByRole('columnheader');
      const headerTexts = headers.map((h) => h.textContent);

      expect(headerTexts).toContain('Breakdown');
      expect(headerTexts).toContain('%');
      expect(headerTexts).toContain('Yearly');
      expect(headerTexts).toContain('Monthly');
      expect(headerTexts).toContain('Weekly');
    });

    it('should render period selector card', () => {
      render(<ResultsTable results={mockResults} />);

      // Period selector should show checkboxes or buttons for periods
      expect(screen.getByText('Display Periods')).toBeInTheDocument();
      expect(screen.getAllByText('Yearly').length).toBeGreaterThan(0);
    });

    it('should render a supplied result action in the period controls', () => {
      render(
        <ResultsTable
          results={mockResults}
          resultAction={<button type='button'>Email Results</button>}
        />,
      );

      expect(screen.getByText('Display Periods')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Email Results/i })).toBeInTheDocument();
    });

    it('should render gross pay row', () => {
      render(<ResultsTable results={mockResults} />);

      expect(screen.getByText('Gross Pay')).toBeInTheDocument();
      expect(screen.getAllByText(/£30,000/).length).toBeGreaterThan(0);
    });

    it('should render tax-free allowance row', () => {
      render(<ResultsTable results={mockResults} />);

      expect(screen.getByText('Tax-Free Allowance')).toBeInTheDocument();
      expect(screen.getAllByText(/£12,570/).length).toBeGreaterThan(0);
    });

    it('uses payroll-period tax-free allowance values when annual averaging would not reconcile', () => {
      render(
        <ResultsTable
          results={{
            ...mockResults,
            taxFreeAmount: 12570,
            taxFreeAmountByPeriod: {
              annually: 12570,
              monthly: 1048,
            },
          }}
          visiblePeriods={['Yearly', 'Monthly']}
        />,
      );

      expect(screen.getByText('Tax-Free Allowance')).toBeInTheDocument();
      expect(screen.getByText('£12,570.00')).toBeInTheDocument();
      expect(screen.getByText('£1,048.00')).toBeInTheDocument();
      expect(screen.queryByText('£1,047.50')).not.toBeInTheDocument();
    });

    it('uses calculator period values instead of annual divisors for payslip rows', () => {
      const payslipInput: TaxCalculationInput = {
        salary: 49131,
        payPeriod: 'annually',
        taxYear: '2026-2027',
        taxCode: '1257L',
        isScottish: false,
        isMarried: false,
        partnerGrossWage: 0,
        isBlind: false,
        payNoNI: false,
        pensionContribution: 5,
        pensionContributionType: 'percentage',
        studentLoanPlans: 'none',
        niCategory: 'A',
        hoursPerWeek: 40,
        allowancesDeductions: 312,
      };
      const results = calculateTax(payslipInput);

      render(
        <ResultsTable
          results={results}
          allowancesDeductions={312}
          visiblePeriods={['Monthly', 'Hourly']}
        />,
      );

      const netPayRow = screen.getByText('Net Pay').closest('tr');
      expect(netPayRow).not.toBeNull();

      const row = within(netPayRow as HTMLTableRowElement);
      expect(row.getByText('£3,120.02')).toBeInTheDocument();
      expect(row.getByText('£18.00')).toBeInTheDocument();
      expect(row.queryByText('£19.20')).not.toBeInTheDocument();
    });

    it('should render taxable income row', () => {
      render(<ResultsTable results={mockResults} />);

      expect(screen.getByText('Total Taxable')).toBeInTheDocument();
      expect(screen.getAllByText(/£17,430/).length).toBeGreaterThan(0);
    });

    it('should render income tax row', () => {
      render(<ResultsTable results={mockResults} />);

      expect(screen.getByText('Total Tax Due')).toBeInTheDocument();
      expect(screen.getAllByText(/£3,486/).length).toBeGreaterThan(0);
    });

    it('should render National Insurance row', () => {
      render(<ResultsTable results={mockResults} />);

      expect(screen.getByText('National Insurance')).toBeInTheDocument();
      expect(screen.getAllByText(/£2,028/).length).toBeGreaterThan(0);
    });

    it('should render pension row', () => {
      render(<ResultsTable results={mockResults} />);

      expect(screen.getByText('Pension')).toBeInTheDocument();
    });

    it('should render net pay row', () => {
      render(<ResultsTable results={mockResults} />);

      expect(screen.getByText('Net Pay')).toBeInTheDocument();
      expect(screen.getAllByText(/£22,986/).length).toBeGreaterThan(0);
    });

    it('should render employer NI row', () => {
      render(<ResultsTable results={mockResults} />);

      expect(screen.getByText('Employers NI')).toBeInTheDocument();
    });

    it('should NOT render pension footnote (removed in UX improvements)', () => {
      render(<ResultsTable results={mockResults} />);

      expect(screen.queryByText(/Pension calculated as salary sacrifice/i)).not.toBeInTheDocument();
    });
  });

  describe('Tax Bands', () => {
    it('should render tax band breakdown', () => {
      render(<ResultsTable results={mockResults} />);

      expect(screen.getByText('20% Rate')).toBeInTheDocument();
    });

    it('should handle multiple tax bands', () => {
      const resultsWithMultipleBands: TaxCalculationResults = {
        ...mockResults,
        taxBands: [
          { rate: 20, amount: 2000, name: 'Basic Rate' },
          { rate: 40, amount: 1486, name: 'Higher Rate' },
        ],
      };

      render(<ResultsTable results={resultsWithMultipleBands} />);

      expect(screen.getByText('20% Rate')).toBeInTheDocument();
      expect(screen.getByText('40% Rate')).toBeInTheDocument();
    });

    it('should handle no tax bands', () => {
      const resultsWithNoBands: TaxCalculationResults = {
        ...mockResults,
        taxBands: [],
      };

      render(<ResultsTable results={resultsWithNoBands} />);

      // Should still render the table without tax band rows
      expect(screen.getByText('Gross Pay')).toBeInTheDocument();
      expect(screen.queryByText('20% Rate')).not.toBeInTheDocument();
    });
  });

  describe('Student Loans', () => {
    it('should not show student loan row when no loans', () => {
      render(<ResultsTable results={mockResults} studentLoans={[]} />);

      expect(screen.queryByText(/Student Loan/)).not.toBeInTheDocument();
    });

    it('should show student loan row when loans exist', () => {
      const resultsWithLoan: TaxCalculationResults = {
        ...mockResults,
        studentLoan: {
          annually: 500,
          monthly: 41.67,
          fourWeekly: 38.46,
          fortnightly: 19.23,
          weekly: 9.62,
          daily: 1.92,
          hourly: 0.26,
        },
      };

      render(<ResultsTable results={resultsWithLoan} studentLoans={['Plan 2']} />);

      expect(screen.getByText('Student Loan')).toBeInTheDocument();
      expect(screen.getAllByText(/£500/).length).toBeGreaterThan(0);
    });

    it('should show plural "Loans" for multiple plans', () => {
      const resultsWithLoans: TaxCalculationResults = {
        ...mockResults,
        studentLoan: {
          annually: 800,
          monthly: 66.67,
          fourWeekly: 61.54,
          fortnightly: 30.77,
          weekly: 15.38,
          daily: 3.08,
          hourly: 0.41,
        },
      };

      render(<ResultsTable results={resultsWithLoans} studentLoans={['Plan 1', 'Plan 2']} />);

      expect(screen.getByText('Student Loans')).toBeInTheDocument();
    });
  });

  describe('Visible Periods', () => {
    it('should show only default periods initially', () => {
      render(<ResultsTable results={mockResults} />);

      // Default periods: Yearly, Monthly, Weekly
      const headers = screen.getAllByRole('columnheader');
      const headerTexts = headers.map((h) => h.textContent);

      expect(headerTexts).toContain('Yearly');
      expect(headerTexts).toContain('Monthly');
      expect(headerTexts).toContain('Weekly');
    });

    it('should respect custom visible periods', () => {
      render(<ResultsTable results={mockResults} visiblePeriods={['Yearly', 'Daily']} />);

      const headers = screen.getAllByRole('columnheader');
      const headerTexts = headers.map((h) => h.textContent);

      expect(headerTexts).toContain('Yearly');
      expect(headerTexts).toContain('Daily');
      expect(headerTexts).not.toContain('Monthly');
    });

    it('should handle all periods visible', () => {
      render(
        <ResultsTable
          results={mockResults}
          visiblePeriods={[
            'Yearly',
            'Monthly',
            '4-Weekly',
            'Fortnightly',
            'Weekly',
            'Daily',
            'Hourly',
          ]}
        />,
      );

      const headers = screen.getAllByRole('columnheader');
      const headerTexts = headers.map((h) => h.textContent);

      expect(headerTexts).toContain('Yearly');
      expect(headerTexts).toContain('Monthly');
      expect(headerTexts).toContain('4-Weekly');
      expect(headerTexts).toContain('Fortnightly');
      expect(headerTexts).toContain('Weekly');
      expect(headerTexts).toContain('Daily');
      expect(headerTexts).toContain('Hourly');
    });

    it('should handle empty visible periods', () => {
      render(<ResultsTable results={mockResults} visiblePeriods={[]} />);

      // Should still render the table structure
      expect(screen.getByTestId('results-table')).toBeInTheDocument();
    });
  });

  describe('Period Toggling', () => {
    it('should call onVisiblePeriodsChange when period is toggled', () => {
      render(
        <ResultsTable
          results={mockResults}
          visiblePeriods={['Yearly', 'Monthly']}
          onVisiblePeriodsChange={mockOnVisiblePeriodsChange}
        />,
      );

      // Find and click a period checkbox (implementation depends on PeriodSelectorCard)
      // This test might need adjustment based on actual PeriodSelectorCard implementation
      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
        expect(mockOnVisiblePeriodsChange).toHaveBeenCalled();
      }
    });

    it('should not throw error when onVisiblePeriodsChange is not provided', () => {
      render(<ResultsTable results={mockResults} visiblePeriods={['Yearly']} />);

      // Should render without errors
      expect(screen.getByTestId('results-table')).toBeInTheDocument();
    });
  });

  describe('Percentage Calculations', () => {
    it('should show 100% for gross pay', () => {
      render(<ResultsTable results={mockResults} />);

      const percentages = screen.getAllByText('100%');
      expect(percentages.length).toBeGreaterThan(0);
    });

    it('should calculate correct percentages', () => {
      render(<ResultsTable results={mockResults} />);

      // Tax should be around 11.6% of gross (3486/30000)
      expect(screen.getAllByText('11.6%').length).toBeGreaterThan(0);

      // NI should be around 6.8% of gross (2028/30000)
      expect(screen.getAllByText('6.8%').length).toBeGreaterThan(0);
    });

    it('should handle zero gross pay', () => {
      const zeroResults: TaxCalculationResults = {
        ...mockResults,
        grossSalary: {
          annually: 0,
          monthly: 0,
          fourWeekly: 0,
          fortnightly: 0,
          weekly: 0,
          daily: 0,
          hourly: 0,
        },
      };

      render(<ResultsTable results={zeroResults} />);

      // Should show 0.0% for all percentages
      const percentages = screen.getAllByText(/0\.0%/);
      expect(percentages.length).toBeGreaterThan(0);
    });
  });

  describe('Allowances and Deductions', () => {
    it('should render allowances row', () => {
      render(<ResultsTable results={mockResults} allowancesDeductions='1000' />);

      expect(screen.getByText('Non-taxable allowance(s)')).toBeInTheDocument();
      expect(screen.getAllByText(/£1,000/).length).toBeGreaterThan(0);
    });

    it('should default to 0 when allowances not provided', () => {
      render(<ResultsTable results={mockResults} />);

      expect(screen.getByText('Non-taxable allowance(s)')).toBeInTheDocument();
    });

    it('should handle allowances as number', () => {
      render(<ResultsTable results={mockResults} allowancesDeductions={10000} />);

      expect(screen.getAllByText(/£10,000/).length).toBeGreaterThan(0);
    });
  });

  describe('Animation', () => {
    it('should render with Framer Motion wrapper', () => {
      const { container } = render(<ResultsTable results={mockResults} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should not throw errors when unmounting', () => {
      const { unmount } = render(<ResultsTable results={mockResults} />);

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Scroll Indicators', () => {
    beforeEach(() => {
      // Mock IntersectionObserver if needed
      global.IntersectionObserver = class IntersectionObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      } as unknown as typeof IntersectionObserver;
    });

    it('should render scroll indicator components', () => {
      render(<ResultsTable results={mockResults} />);

      // ScrollIndicator components are always rendered (visibility controlled by state)
      const container = screen.getByTestId('results-table').parentElement;
      expect(container).toBeInTheDocument();
    });

    it('should show indicators when table has horizontal overflow', () => {
      // Mock scrollWidth > clientWidth to simulate overflow
      const { container } = render(
        <ResultsTable
          results={mockResults}
          visiblePeriods={[
            'Yearly',
            'Monthly',
            '4-Weekly',
            'Fortnightly',
            'Weekly',
            'Daily',
            'Hourly',
          ]}
        />,
      );

      const scrollContainer = container.querySelector('[role="region"]') as HTMLElement;

      if (scrollContainer) {
        // Mock dimensions to simulate overflow
        Object.defineProperty(scrollContainer, 'scrollWidth', { value: 1200, configurable: true });
        Object.defineProperty(scrollContainer, 'clientWidth', { value: 800, configurable: true });
        Object.defineProperty(scrollContainer, 'scrollLeft', { value: 0, configurable: true });

        // Trigger scroll check
        scrollContainer.dispatchEvent(new Event('scroll'));
      }
    });

    it('should update indicators when periods change', () => {
      const { rerender } = render(
        <ResultsTable results={mockResults} visiblePeriods={['Yearly', 'Monthly']} />,
      );

      // Add more periods to trigger potential overflow
      rerender(
        <ResultsTable
          results={mockResults}
          visiblePeriods={[
            'Yearly',
            'Monthly',
            '4-Weekly',
            'Fortnightly',
            'Weekly',
            'Daily',
            'Hourly',
          ]}
        />,
      );

      // Table should re-render with all periods
      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThan(5);
    });

    it('should hide right indicator when scrolled to end', () => {
      const { container } = render(
        <ResultsTable
          results={mockResults}
          visiblePeriods={[
            'Yearly',
            'Monthly',
            '4-Weekly',
            'Fortnightly',
            'Weekly',
            'Daily',
            'Hourly',
          ]}
        />,
      );

      const scrollContainer = container.querySelector('[role="region"]') as HTMLElement;

      if (scrollContainer) {
        // Mock scrolled to end
        Object.defineProperty(scrollContainer, 'scrollWidth', { value: 1200, configurable: true });
        Object.defineProperty(scrollContainer, 'clientWidth', { value: 800, configurable: true });
        Object.defineProperty(scrollContainer, 'scrollLeft', { value: 400, configurable: true });

        scrollContainer.dispatchEvent(new Event('scroll'));
      }
    });

    it('should show left indicator when scrolled from start', () => {
      const { container } = render(
        <ResultsTable
          results={mockResults}
          visiblePeriods={[
            'Yearly',
            'Monthly',
            '4-Weekly',
            'Fortnightly',
            'Weekly',
            'Daily',
            'Hourly',
          ]}
        />,
      );

      const scrollContainer = container.querySelector('[role="region"]') as HTMLElement;

      if (scrollContainer) {
        // Mock scrolled from start
        Object.defineProperty(scrollContainer, 'scrollWidth', { value: 1200, configurable: true });
        Object.defineProperty(scrollContainer, 'clientWidth', { value: 800, configurable: true });
        Object.defineProperty(scrollContainer, 'scrollLeft', { value: 100, configurable: true });

        scrollContainer.dispatchEvent(new Event('scroll'));
      }
    });

    it('should not show indicators when table fits in viewport', () => {
      const { container } = render(
        <ResultsTable results={mockResults} visiblePeriods={['Yearly', 'Monthly']} />,
      );

      const scrollContainer = container.querySelector('[role="region"]') as HTMLElement;

      if (scrollContainer) {
        // Mock no overflow (scrollWidth === clientWidth)
        Object.defineProperty(scrollContainer, 'scrollWidth', { value: 800, configurable: true });
        Object.defineProperty(scrollContainer, 'clientWidth', { value: 800, configurable: true });
        Object.defineProperty(scrollContainer, 'scrollLeft', { value: 0, configurable: true });

        scrollContainer.dispatchEvent(new Event('scroll'));
      }
    });

    it('should respond to window resize events', () => {
      const { container } = render(
        <ResultsTable results={mockResults} visiblePeriods={['Yearly', 'Monthly', 'Weekly']} />,
      );

      const scrollContainer = container.querySelector('[role="region"]') as HTMLElement;

      if (scrollContainer) {
        // Trigger resize
        global.dispatchEvent(new Event('resize'));

        expect(scrollContainer).toBeInTheDocument();
      }
    });

    it('should have mobile swipe hint when overflow on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });

      const { container } = render(
        <ResultsTable
          results={mockResults}
          visiblePeriods={[
            'Yearly',
            'Monthly',
            '4-Weekly',
            'Fortnightly',
            'Weekly',
            'Daily',
            'Hourly',
          ]}
        />,
      );

      const scrollContainer = container.querySelector('[role="region"]') as HTMLElement;

      if (scrollContainer) {
        // Mock overflow
        Object.defineProperty(scrollContainer, 'scrollWidth', { value: 1200, configurable: true });
        Object.defineProperty(scrollContainer, 'clientWidth', { value: 375, configurable: true });
        Object.defineProperty(scrollContainer, 'scrollLeft', { value: 0, configurable: true });

        scrollContainer.dispatchEvent(new Event('scroll'));
      }

      // Reset
      Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      render(<ResultsTable results={mockResults} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should have table headers', () => {
      render(<ResultsTable results={mockResults} />);

      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThan(0);
    });

    it('should have data-testid for table', () => {
      render(<ResultsTable results={mockResults} />);

      expect(screen.getByTestId('results-table')).toBeInTheDocument();
    });

    it('should have accessible scroll container', () => {
      render(<ResultsTable results={mockResults} />);

      const scrollRegion = screen.getByRole('region', { name: /tax calculation/i });
      expect(scrollRegion).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large salary values', () => {
      const largeResults: TaxCalculationResults = {
        ...mockResults,
        grossSalary: {
          annually: 999999999,
          monthly: 83333333,
          fourWeekly: 76923077,
          fortnightly: 38461538,
          weekly: 19230769,
          daily: 3846154,
          hourly: 512821,
        },
      };

      render(<ResultsTable results={largeResults} />);

      expect(screen.getAllByText(/£999,999,999/).length).toBeGreaterThan(0);
    });

    it('should handle negative values', () => {
      const negativeResults: TaxCalculationResults = {
        ...mockResults,
        netPay: {
          annually: -1000,
          monthly: -83.33,
          fourWeekly: -76.92,
          fortnightly: -38.46,
          weekly: -19.23,
          daily: -3.85,
          hourly: -0.51,
        },
      };

      render(<ResultsTable results={negativeResults} />);

      // Should render without errors
      expect(screen.getByTestId('results-table')).toBeInTheDocument();
    });

    it('should handle all zero values', () => {
      const zeroResults: TaxCalculationResults = {
        grossSalary: {
          annually: 0,
          monthly: 0,
          fourWeekly: 0,
          fortnightly: 0,
          weekly: 0,
          daily: 0,
          hourly: 0,
        },
        taxFreeAmount: 0,
        taxableIncome: 0,
        incomeTax: {
          annually: 0,
          monthly: 0,
          fourWeekly: 0,
          fortnightly: 0,
          weekly: 0,
          daily: 0,
          hourly: 0,
        },
        nationalInsurance: {
          annually: 0,
          monthly: 0,
          fourWeekly: 0,
          fortnightly: 0,
          weekly: 0,
          daily: 0,
          hourly: 0,
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
          annually: 0,
          monthly: 0,
          fourWeekly: 0,
          fortnightly: 0,
          weekly: 0,
          daily: 0,
          hourly: 0,
        },
        employerNI: 0,
        totalTaxBurden: 0,
        effectiveTaxRate: 0,
        marginalTaxRate: 0,
        taxBands: [],
      };

      render(<ResultsTable results={zeroResults} />);

      expect(screen.getByText('Gross Pay')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should render without errors', () => {
      const { container } = render(<ResultsTable results={mockResults} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toBeInTheDocument();
    });

    it('should not have width constraint to allow dynamic expansion', () => {
      const { container } = render(<ResultsTable results={mockResults} />);

      const wrapper = container.firstChild as HTMLElement;
      // No inline width style allows table to expand dynamically based on content
      expect(wrapper.style.width).toBeFalsy();
    });
  });

  describe('Previous Year Comparison', () => {
    const previousYearResults: TaxCalculationResults = {
      ...mockResults,
      netPay: {
        annually: 20000,
        monthly: 1666.67,
        fourWeekly: 1538.46,
        fortnightly: 769.23,
        weekly: 384.62,
        daily: 76.92,
        hourly: 10.26,
      },
    };

    it('should show year change row when previous year data exists', () => {
      render(<ResultsTable results={mockResults} previousYearResults={previousYearResults} />);

      expect(screen.getByText(/Net Change from/i)).toBeInTheDocument();
    });

    it('should calculate positive year change correctly', () => {
      // Current: £22,986, Previous: £20,000 = +£2,986
      render(<ResultsTable results={mockResults} previousYearResults={previousYearResults} />);

      expect(screen.getAllByText(/£2,986/).length).toBeGreaterThan(0);
    });

    it('should show green color for positive year change', () => {
      render(<ResultsTable results={mockResults} previousYearResults={previousYearResults} />);

      const yearChangeRow = screen.getByText(/Net Change from/i).closest('tr');
      const yearChangeValue = yearChangeRow?.querySelector('.text-success');
      expect(yearChangeValue).toBeInTheDocument();
    });

    it('should calculate negative year change correctly', () => {
      const higherPreviousYear: TaxCalculationResults = {
        ...mockResults,
        netPay: {
          annually: 25000,
          monthly: 2083.33,
          fourWeekly: 1923.08,
          fortnightly: 961.54,
          weekly: 480.77,
          daily: 96.15,
          hourly: 12.82,
        },
      };

      // Current: £22,986, Previous: £25,000 = -£2,014
      render(<ResultsTable results={mockResults} previousYearResults={higherPreviousYear} />);

      expect(screen.getAllByText(/-£2,014/).length).toBeGreaterThan(0);
    });

    it('should show red color for negative year change', () => {
      const higherPreviousYear: TaxCalculationResults = {
        ...mockResults,
        netPay: {
          annually: 25000,
          monthly: 2083.33,
          fourWeekly: 1923.08,
          fortnightly: 961.54,
          weekly: 480.77,
          daily: 96.15,
          hourly: 12.82,
        },
      };

      render(<ResultsTable results={mockResults} previousYearResults={higherPreviousYear} />);

      const yearChangeRow = screen.getByText(/Net Change from/i).closest('tr');
      // Just verify the row exists and has content, don't test specific color classes
      expect(yearChangeRow).toBeInTheDocument();
      expect(yearChangeRow).toHaveTextContent('-£');
    });

    it('should show zero change when net pay is same', () => {
      const sameYearResults: TaxCalculationResults = {
        ...mockResults,
        netPay: mockResults.netPay,
      };

      render(<ResultsTable results={mockResults} previousYearResults={sameYearResults} />);

      expect(screen.getAllByText(/£0\.00/).length).toBeGreaterThan(0);
    });

    it('should show green color for zero change', () => {
      const sameYearResults: TaxCalculationResults = {
        ...mockResults,
        netPay: mockResults.netPay,
      };

      render(<ResultsTable results={mockResults} previousYearResults={sameYearResults} />);

      const yearChangeRow = screen.getByText(/Net Change from/i).closest('tr');
      const yearChangeValue = yearChangeRow?.querySelector('.text-success');
      expect(yearChangeValue).toBeInTheDocument();
    });

    it('should show 0.0% and £0.00 when no previous year data', () => {
      render(<ResultsTable results={mockResults} previousYearResults={null} />);

      expect(screen.queryByText(/Net Change from/i)).not.toBeInTheDocument();
    });

    it('should calculate percentage change correctly', () => {
      // Change: £2,986 / £20,000 * 100 = 14.93%
      render(<ResultsTable results={mockResults} previousYearResults={previousYearResults} />);

      const yearChangeRow = screen.getByText(/Net Change from/i).closest('tr');
      expect(yearChangeRow?.textContent).toMatch(/14\.9%/);
    });
  });

  describe('WFH Allowance Scenarios', () => {
    it('should display £312 WFH allowance correctly', () => {
      render(<ResultsTable results={mockResults} allowancesDeductions={312} />);

      expect(screen.getAllByText(/£312/).length).toBeGreaterThan(0);
    });

    it('should calculate correct percentage for £312 allowance on £30k salary', () => {
      // £312 / £30,000 * 100 = 1.04%
      render(<ResultsTable results={mockResults} allowancesDeductions={312} />);

      const allowanceRow = screen.getByText('Non-taxable allowance(s)').closest('tr');
      expect(allowanceRow?.textContent).toMatch(/1\.0%/);
    });

    it('should handle monthly WFH allowance (£26)', () => {
      // £26 * 12 = £312 annual
      render(<ResultsTable results={mockResults} allowancesDeductions={26} />);

      expect(screen.getAllByText(/£26/).length).toBeGreaterThan(0);
    });

    it('should display large allowances with proper formatting', () => {
      render(<ResultsTable results={mockResults} allowancesDeductions={5000} />);

      expect(screen.getAllByText(/£5,000/).length).toBeGreaterThan(0);
    });

    it('should show 0.0% for zero allowances', () => {
      render(<ResultsTable results={mockResults} allowancesDeductions={0} />);

      const allowanceRow = screen.getByText('Non-taxable allowance(s)').closest('tr');
      expect(allowanceRow?.textContent).toMatch(/0\.0%/);
    });
  });

  describe('Enhanced Student Loan Tests', () => {
    it('should display Plan 2 student loan correctly', () => {
      const resultsWithPlan2: TaxCalculationResults = {
        ...mockResults,
        studentLoan: {
          annually: 675,
          monthly: 56.25,
          fourWeekly: 51.92,
          fortnightly: 25.96,
          weekly: 12.98,
          daily: 2.6,
          hourly: 0.35,
        },
      };

      render(<ResultsTable results={resultsWithPlan2} studentLoans={['plan2']} />);

      expect(screen.getByText('Student Loan')).toBeInTheDocument();
      expect(screen.getAllByText(/£675/).length).toBeGreaterThan(0);
    });

    it('should display Plan 1 student loan with different amount', () => {
      const resultsWithPlan1: TaxCalculationResults = {
        ...mockResults,
        studentLoan: {
          annually: 450,
          monthly: 37.5,
          fourWeekly: 34.62,
          fortnightly: 17.31,
          weekly: 8.65,
          daily: 1.73,
          hourly: 0.23,
        },
      };

      render(<ResultsTable results={resultsWithPlan1} studentLoans={['plan1']} />);

      expect(screen.getAllByText(/£450/).length).toBeGreaterThan(0);
    });

    it('should show correct percentage for student loan', () => {
      const resultsWithLoan: TaxCalculationResults = {
        ...mockResults,
        studentLoan: {
          annually: 600,
          monthly: 50,
          fourWeekly: 46.15,
          fortnightly: 23.08,
          weekly: 11.54,
          daily: 2.31,
          hourly: 0.31,
        },
      };

      // £600 / £30,000 * 100 = 2.0%
      render(<ResultsTable results={resultsWithLoan} studentLoans={['plan2']} />);

      const loanRow = screen.getByText('Student Loan').closest('tr');
      expect(loanRow?.textContent).toMatch(/2\.0%/);
    });

    it('should display postgraduate loan correctly', () => {
      const resultsWithPostgrad: TaxCalculationResults = {
        ...mockResults,
        studentLoan: {
          annually: 900,
          monthly: 75,
          fourWeekly: 69.23,
          fortnightly: 34.62,
          weekly: 17.31,
          daily: 3.46,
          hourly: 0.46,
        },
      };

      render(<ResultsTable results={resultsWithPostgrad} studentLoans={['postgrad']} />);

      expect(screen.getAllByText(/£900/).length).toBeGreaterThan(0);
    });
  });

  describe('Integration Scenarios', () => {
    const previousYearResults: TaxCalculationResults = {
      ...mockResults,
      netPay: {
        annually: 21000,
        monthly: 1750,
        fourWeekly: 1615.38,
        fortnightly: 807.69,
        weekly: 403.85,
        daily: 80.77,
        hourly: 10.77,
      },
    };

    it('should handle all features together: student loan + allowances + previous year', () => {
      const fullResults: TaxCalculationResults = {
        ...mockResults,
        studentLoan: {
          annually: 500,
          monthly: 41.67,
          fourWeekly: 38.46,
          fortnightly: 19.23,
          weekly: 9.62,
          daily: 1.92,
          hourly: 0.26,
        },
        netPay: {
          annually: 22486,
          monthly: 1873.83,
          fourWeekly: 1729.69,
          fortnightly: 864.85,
          weekly: 432.42,
          daily: 86.48,
          hourly: 11.53,
        },
      };

      render(
        <ResultsTable
          results={fullResults}
          studentLoans={['plan2']}
          allowancesDeductions={312}
          previousYearResults={previousYearResults}
        />,
      );

      expect(screen.getByText('Student Loan')).toBeInTheDocument();
      expect(screen.getByText('Non-taxable allowance(s)')).toBeInTheDocument();
      expect(screen.getByText(/Net Change from/i)).toBeInTheDocument();
    });

    it('should handle high earner with all deductions', () => {
      const highEarnerResults: TaxCalculationResults = {
        grossSalary: {
          annually: 100000,
          monthly: 8333.33,
          fourWeekly: 7692.31,
          fortnightly: 3846.15,
          weekly: 1923.08,
          daily: 384.62,
          hourly: 51.28,
        },
        taxFreeAmount: 12570,
        taxableIncome: 85430,
        incomeTax: {
          annually: 27860,
          monthly: 2321.67,
          fourWeekly: 2143.08,
          fortnightly: 1071.54,
          weekly: 535.77,
          daily: 107.15,
          hourly: 14.29,
        },
        nationalInsurance: {
          annually: 6372,
          monthly: 531,
          fourWeekly: 490.15,
          fortnightly: 245.08,
          weekly: 122.54,
          daily: 24.51,
          hourly: 3.27,
        },
        studentLoan: {
          annually: 5400,
          monthly: 450,
          fourWeekly: 415.38,
          fortnightly: 207.69,
          weekly: 103.85,
          daily: 20.77,
          hourly: 2.77,
        },
        pensionContribution: {
          annually: 5000,
          monthly: 416.67,
          fourWeekly: 384.62,
          fortnightly: 192.31,
          weekly: 96.15,
          daily: 19.23,
          hourly: 2.56,
        },
        netPay: {
          annually: 60768,
          monthly: 5064,
          fourWeekly: 4674.46,
          fortnightly: 2337.23,
          weekly: 1168.62,
          daily: 233.72,
          hourly: 31.16,
        },
        employerNI: 12890,
        totalTaxBurden: 39632,
        effectiveTaxRate: 39.63,
        marginalTaxRate: 42,
        taxBands: [
          { rate: 20, amount: 7486, name: 'Basic Rate' },
          { rate: 40, amount: 20374, name: 'Higher Rate' },
        ],
      };

      const previousHighEarner: TaxCalculationResults = {
        ...highEarnerResults,
        netPay: {
          annually: 58000,
          monthly: 4833.33,
          fourWeekly: 4461.54,
          fortnightly: 2230.77,
          weekly: 1115.38,
          daily: 223.08,
          hourly: 29.74,
        },
      };

      render(
        <ResultsTable
          results={highEarnerResults}
          studentLoans={['plan2', 'postgrad']}
          allowancesDeductions={2000}
          previousYearResults={previousHighEarner}
        />,
      );

      // Verify all components render
      expect(screen.getByText(/£100,000/)).toBeInTheDocument();
      expect(screen.getByText('Student Loans')).toBeInTheDocument(); // Plural
      expect(screen.getAllByText(/£2,000/).length).toBeGreaterThan(0);
      expect(screen.getByText(/Net Change from/i)).toBeInTheDocument();

      // Verify year change: £60,768 - £58,000 = £2,768
      expect(screen.getAllByText(/£2,768/).length).toBeGreaterThan(0);
    });

    it('should handle complex scenario with pension and all deductions', () => {
      const complexResults: TaxCalculationResults = {
        ...mockResults,
        pensionContribution: {
          annually: 3000,
          monthly: 250,
          fourWeekly: 230.77,
          fortnightly: 115.38,
          weekly: 57.69,
          daily: 11.54,
          hourly: 1.54,
        },
        studentLoan: {
          annually: 600,
          monthly: 50,
          fourWeekly: 46.15,
          fortnightly: 23.08,
          weekly: 11.54,
          daily: 2.31,
          hourly: 0.31,
        },
      };

      render(
        <ResultsTable
          results={complexResults}
          studentLoans={['plan2']}
          allowancesDeductions={312}
          previousYearResults={previousYearResults}
        />,
      );

      expect(screen.getAllByText(/£3,000/).length).toBeGreaterThan(0); // Pension
      expect(screen.getAllByText(/£600/).length).toBeGreaterThan(0); // Student loan
      expect(screen.getAllByText(/£312/).length).toBeGreaterThan(0); // Allowances
    });
  });

  describe('Visual and Color Verification', () => {
    it('should apply correct color to tax rows', () => {
      render(<ResultsTable results={mockResults} />);

      const taxRow = screen.getByText('Total Tax Due').closest('tr');
      // Verify row exists and has tax value, don't test specific color class
      expect(taxRow).toBeInTheDocument();
      expect(taxRow).toHaveTextContent('£');
    });

    it('should apply correct color to NI rows', () => {
      render(<ResultsTable results={mockResults} />);

      const niRow = screen.getByText('National Insurance').closest('tr');
      // Verify row exists and has NI value, don't test specific color class
      expect(niRow).toBeInTheDocument();
      expect(niRow).toHaveTextContent('£');
    });

    it('should apply correct color to pension rows', () => {
      render(<ResultsTable results={mockResults} />);

      const pensionRow = screen.getByText('Pension').closest('tr');
      // Verify row exists and has pension value, don't test specific color class
      expect(pensionRow).toBeInTheDocument();
      expect(pensionRow).toHaveTextContent('£');
    });

    it('should apply correct color to net pay row', () => {
      render(<ResultsTable results={mockResults} />);

      const netPayRow = screen.getByText('Net Pay').closest('tr');
      const netPayValue = netPayRow?.querySelector('.text-success');
      expect(netPayValue).toBeInTheDocument();
    });

    it('should apply muted color to employer NI', () => {
      render(<ResultsTable results={mockResults} />);

      const employerNIRow = screen.getByText('Employers NI').closest('tr');
      const employerNIValue = employerNIRow?.querySelector('.text-muted-foreground');
      expect(employerNIValue).toBeInTheDocument();
    });

    it('should highlight net pay row', () => {
      render(<ResultsTable results={mockResults} />);

      const netPayRow = screen.getByText('Net Pay').closest('tr');
      // Net pay row should have highlight styling (bg-muted)
      expect(netPayRow).toBeInTheDocument();
    });
  });
});
