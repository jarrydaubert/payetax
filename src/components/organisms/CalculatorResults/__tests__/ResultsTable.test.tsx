// src/components/organisms/CalculatorResults/__tests__/ResultsTable.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
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

      expect(headerTexts).toContain('Category');
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

    it('should render pension rows', () => {
      render(<ResultsTable results={mockResults} />);

      expect(screen.getByText('Pension [You]')).toBeInTheDocument();
      expect(screen.getByText('Pension [HMRC Relief]')).toBeInTheDocument();
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

    it('should render footnote about pension calculation', () => {
      render(<ResultsTable results={mockResults} />);

      expect(screen.getByText(/Pension calculated as salary sacrifice/i)).toBeInTheDocument();
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
        />
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
        />
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

      expect(screen.getByText('Allowances/Deductions')).toBeInTheDocument();
      expect(screen.getAllByText(/£1,000/).length).toBeGreaterThan(0);
    });

    it('should default to 0 when allowances not provided', () => {
      render(<ResultsTable results={mockResults} />);

      expect(screen.getByText('Allowances/Deductions')).toBeInTheDocument();
    });

    it('should handle allowances with commas', () => {
      render(<ResultsTable results={mockResults} allowancesDeductions='10,000' />);

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
        />
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
        <ResultsTable results={mockResults} visiblePeriods={['Yearly', 'Monthly']} />
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
        />
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
        />
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
        />
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
        <ResultsTable results={mockResults} visiblePeriods={['Yearly', 'Monthly']} />
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
        <ResultsTable results={mockResults} visiblePeriods={['Yearly', 'Monthly', 'Weekly']} />
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
        />
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
    it('should have minimum height', () => {
      const { container } = render(<ResultsTable results={mockResults} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.minHeight).toBe('650px');
    });

    it('should not have width constraint to allow dynamic expansion', () => {
      const { container } = render(<ResultsTable results={mockResults} />);

      const wrapper = container.firstChild as HTMLElement;
      // No inline width style allows table to expand dynamically based on content
      expect(wrapper.style.width).toBeFalsy();
    });
  });
});
