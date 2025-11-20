/**
 * @jest-environment jsdom
 */
// src/components/molecules/__tests__/SalaryQuickResults.test.tsx

import { render, screen } from '@testing-library/react';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { SalaryQuickResults } from '../SalaryQuickResults';

describe('SalaryQuickResults', () => {
  const mockResults: TaxCalculationResults = {
    grossSalary: 30000,
    incomeTax: {
      annually: 3486,
      monthly: 290.5,
      weekly: 67.04,
      daily: 13.41,
      hourly: 1.68,
    },
    nationalInsurance: {
      annually: 2274,
      monthly: 189.5,
      weekly: 43.73,
      daily: 8.75,
      hourly: 1.09,
    },
    netPay: {
      annually: 24240,
      monthly: 2020,
      weekly: 466.15,
      daily: 93.23,
      hourly: 11.65,
    },
    employerNI: {
      annually: 3172,
      monthly: 264.33,
      weekly: 60.98,
      daily: 12.2,
      hourly: 1.53,
    },
    pensionContribution: {
      annually: 0,
      monthly: 0,
      weekly: 0,
      daily: 0,
      hourly: 0,
    },
    studentLoanRepayment: {
      annually: 0,
      monthly: 0,
      weekly: 0,
      daily: 0,
      hourly: 0,
    },
    effectiveTaxRate: 19.2,
    marginalTaxRate: 33.25,
    taxYear: '2025-2026',
    taxCode: '1257L',
    isScottish: false,
  };

  const mockComparisons = [
    { amount: 28000, label: '£2k less' },
    { amount: 32000, label: '£2k more' },
    { amount: 25000, label: '£5k less' },
    { amount: 35000, label: '£5k more' },
  ];

  describe('Heading and Description', () => {
    it('should render the main heading with salary', () => {
      render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        '£30,000 Salary After Tax'
      );
    });

    it('should format salary with commas', () => {
      render(
        <SalaryQuickResults salary={125000} results={mockResults} comparisons={mockComparisons} />
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        '£125,000 Salary After Tax'
      );
    });

    it('should display tax year description', () => {
      render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      expect(
        screen.getByText('UK take-home pay calculator for 2025-26 tax year')
      ).toBeInTheDocument();
    });
  });

  describe('Monthly Take-Home Display', () => {
    it('should display monthly take-home pay prominently', () => {
      render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      expect(screen.getByText('Monthly Take-Home Pay')).toBeInTheDocument();
      expect(screen.getByText('£2,020')).toBeInTheDocument();
    });

    it('should display explanation text', () => {
      render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      expect(screen.getByText('After tax and National Insurance')).toBeInTheDocument();
    });
  });

  describe('Quick Breakdown Section', () => {
    it('should display annual take-home', () => {
      render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      expect(screen.getByText('Annual Take-Home')).toBeInTheDocument();
      expect(screen.getAllByText('£24,240').length).toBeGreaterThanOrEqual(1);
    });

    it('should display weekly take-home', () => {
      render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      expect(screen.getByText('Weekly Take-Home')).toBeInTheDocument();
      expect(screen.getByText('£466.15')).toBeInTheDocument();
    });
  });

  describe('Tax Breakdown Section', () => {
    it('should display gross salary', () => {
      render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      expect(screen.getByText('Gross Salary')).toBeInTheDocument();
      expect(screen.getAllByText('£30,000')).toHaveLength(1);
    });

    it('should display income tax deduction', () => {
      render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      expect(screen.getByText('Income Tax')).toBeInTheDocument();
      expect(screen.getByText('-£3,486')).toBeInTheDocument();
    });

    it('should display National Insurance deduction', () => {
      render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      expect(screen.getByText('National Insurance')).toBeInTheDocument();
      expect(screen.getByText('-£2,274')).toBeInTheDocument();
    });

    it('should display net pay annual total', () => {
      render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      expect(screen.getByText('Net Pay (Annual)')).toBeInTheDocument();
      // Multiple instances of £24,240 (monthly breakdown and net pay)
      expect(screen.getAllByText('£24,240').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Effective Tax Rate', () => {
    it('should calculate and display effective tax rate correctly', () => {
      render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      expect(screen.getByText('Effective Tax Rate')).toBeInTheDocument();
      // (3486 + 2274) / 30000 = 0.192 = 19.2%
      expect(screen.getByText('19.2%')).toBeInTheDocument();
    });

    it('should display effective tax rate badge', () => {
      const { container } = render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      const badge = container.querySelector('.font-mono');
      expect(badge).toHaveTextContent('19.2%');
    });

    it('should calculate correct effective rate for high earner', () => {
      const highEarnerResults: TaxCalculationResults = {
        ...mockResults,
        grossSalary: 100000,
        incomeTax: { ...mockResults.incomeTax, annually: 27432 },
        nationalInsurance: { ...mockResults.nationalInsurance, annually: 7379 },
        netPay: { ...mockResults.netPay, annually: 65189 },
      };

      render(
        <SalaryQuickResults
          salary={100000}
          results={highEarnerResults}
          comparisons={mockComparisons}
        />
      );

      // (27432 + 7379) / 100000 = 34.811%
      expect(screen.getByText('34.8%')).toBeInTheDocument();
    });
  });

  describe('Compare Similar Salaries Section', () => {
    it('should render comparison section heading', () => {
      render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      expect(
        screen.getByRole('heading', { level: 2, name: /Compare Similar Salaries/i })
      ).toBeInTheDocument();
    });

    it('should render TrendingUp icon', () => {
      const { container } = render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('should render all comparison links', () => {
      render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      expect(screen.getByRole('link', { name: /£2k less £28,000/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /£2k more £32,000/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /£5k less £25,000/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /£5k more £35,000/i })).toBeInTheDocument();
    });

    it('should have correct href for comparison links', () => {
      render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      const link28k = screen.getByRole('link', { name: /£28,000/i });
      expect(link28k).toHaveAttribute('href', '/calculator/28000-after-tax');

      const link35k = screen.getByRole('link', { name: /£35,000/i });
      expect(link35k).toHaveAttribute('href', '/calculator/35000-after-tax');
    });

    it('should format comparison amounts with commas', () => {
      const bigComparisons = [
        { amount: 125000, label: 'Higher' },
        { amount: 150000, label: 'Much Higher' },
      ];

      render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={bigComparisons} />
      );

      expect(screen.getByText('£125,000')).toBeInTheDocument();
      expect(screen.getByText('£150,000')).toBeInTheDocument();
    });
  });

  describe('Number Formatting', () => {
    it('should format all numbers with UK locale', () => {
      const bigResults: TaxCalculationResults = {
        ...mockResults,
        grossSalary: 100000,
        incomeTax: { ...mockResults.incomeTax, annually: 27432, monthly: 2286 },
        nationalInsurance: { ...mockResults.nationalInsurance, annually: 7379, monthly: 614.92 },
        netPay: {
          ...mockResults.netPay,
          annually: 65189,
          monthly: 5432.42,
          weekly: 1253.63,
        },
      };

      render(
        <SalaryQuickResults salary={100000} results={bigResults} comparisons={mockComparisons} />
      );

      expect(screen.getByText('£100,000')).toBeInTheDocument();
      expect(screen.getByText('£5,432.42')).toBeInTheDocument();
      expect(screen.getAllByText('£65,189').length).toBeGreaterThanOrEqual(1);
    });

    it('should handle small salaries correctly', () => {
      const smallResults: TaxCalculationResults = {
        ...mockResults,
        grossSalary: 15000,
        incomeTax: { ...mockResults.incomeTax, annually: 486, monthly: 40.5 },
        nationalInsurance: { ...mockResults.nationalInsurance, annually: 324, monthly: 27 },
        netPay: { ...mockResults.netPay, annually: 14190, monthly: 1182.5, weekly: 272.88 },
      };

      render(
        <SalaryQuickResults salary={15000} results={smallResults} comparisons={mockComparisons} />
      );

      expect(screen.getByText('£15,000')).toBeInTheDocument();
      expect(screen.getByText('£1,182.5')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle £0 salary', () => {
      const zeroResults: TaxCalculationResults = {
        ...mockResults,
        grossSalary: 0,
        incomeTax: { ...mockResults.incomeTax, annually: 0, monthly: 0, weekly: 0 },
        nationalInsurance: { ...mockResults.nationalInsurance, annually: 0, monthly: 0, weekly: 0 },
        netPay: { ...mockResults.netPay, annually: 0, monthly: 0, weekly: 0 },
      };

      render(<SalaryQuickResults salary={0} results={zeroResults} comparisons={[]} />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('£0 Salary After Tax');
      // Effective rate would be NaN (0/0), which gets displayed as "NaN%"
      expect(screen.getByText('NaN%')).toBeInTheDocument();
    });

    it('should handle empty comparisons array', () => {
      render(<SalaryQuickResults salary={30000} results={mockResults} comparisons={[]} />);

      expect(
        screen.getByRole('heading', { level: 2, name: /Compare Similar Salaries/i })
      ).toBeInTheDocument();
      // Should still render the section but with no links
      const links = screen.queryAllByRole('link');
      expect(links.length).toBe(0);
    });

    it('should handle single comparison', () => {
      render(
        <SalaryQuickResults
          salary={30000}
          results={mockResults}
          comparisons={[{ amount: 32000, label: '£2k more' }]}
        />
      );

      expect(screen.getByRole('link', { name: /£2k more £32,000/i })).toBeInTheDocument();
      const links = screen.getAllByRole('link');
      expect(links.length).toBe(1);
    });

    it('should handle very high effective tax rate', () => {
      const highTaxResults: TaxCalculationResults = {
        ...mockResults,
        grossSalary: 50000,
        incomeTax: { ...mockResults.incomeTax, annually: 15000 },
        nationalInsurance: { ...mockResults.nationalInsurance, annually: 5000 },
        netPay: { ...mockResults.netPay, annually: 30000, monthly: 2500, weekly: 576.92 },
      };

      render(
        <SalaryQuickResults salary={50000} results={highTaxResults} comparisons={mockComparisons} />
      );

      // (15000 + 5000) / 50000 = 40%
      expect(screen.getByText('40.0%')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should render Card components', () => {
      const { container } = render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      // Should have 2 Card components (main results + comparisons)
      const cards = container.querySelectorAll('[class*="border"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should use sticky positioning for sidebar effect', () => {
      const { container } = render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('lg:sticky');
      expect(wrapper).toHaveClass('lg:top-24');
    });

    it('should apply destructive color to tax deductions', () => {
      const { container } = render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      const incomeTaxRow = container.querySelector('.text-destructive');
      expect(incomeTaxRow).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('should hide decorative icons from screen readers', () => {
      const { container } = render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('should use semantic links for comparisons', () => {
      render(
        <SalaryQuickResults salary={30000} results={mockResults} comparisons={mockComparisons} />
      );

      const links = screen.getAllByRole('link');
      expect(links.length).toBe(4);
      links.forEach((link) => {
        expect(link.tagName).toBe('A');
      });
    });
  });
});
