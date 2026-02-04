/**
 * @jest-environment jsdom
 */
// src/components/molecules/__tests__/SalarySEOContent.test.tsx

import { render, screen } from '@testing-library/react';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { SalarySEOContent } from '../SalarySEOContent';

describe('SalarySEOContent', () => {
  const createMockResults = (
    overrides: Partial<TaxCalculationResults> = {},
  ): TaxCalculationResults => ({
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
    studentLoan: {
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
    ...overrides,
  });

  describe('Main Heading and Intro', () => {
    it('should render the main heading', () => {
      const mockResults = createMockResults();
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      expect(
        screen.getByRole('heading', { level: 2, name: 'Take-Home Pay Breakdown' }),
      ).toBeInTheDocument();
    });

    it('should display gross salary in intro paragraph', () => {
      const mockResults = createMockResults();
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      expect(screen.getByText(/gross annual salary of/)).toBeInTheDocument();
      expect(screen.getAllByText(/£30,000/).length).toBeGreaterThanOrEqual(1);
    });

    it('should display annual and monthly take-home in intro', () => {
      const mockResults = createMockResults();
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      expect(screen.getByText(/£24,240/)).toBeInTheDocument();
      expect(screen.getAllByText(/per year/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/£2,020/)).toBeInTheDocument();
      expect(screen.getAllByText(/per month/).length).toBeGreaterThanOrEqual(1);
    });

    it('should mention 2025-26 tax year', () => {
      const mockResults = createMockResults();
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      expect(screen.getByText(/2025-26 tax year/)).toBeInTheDocument();
    });
  });

  describe('Tax and National Insurance Deductions Section', () => {
    it('should render deductions section heading', () => {
      const mockResults = createMockResults();
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      expect(
        screen.getByRole('heading', { level: 3, name: 'Tax and National Insurance Deductions' }),
      ).toBeInTheDocument();
    });

    it('should display income tax amount and percentage', () => {
      const mockResults = createMockResults();
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      expect(screen.getByText(/Income Tax:/)).toBeInTheDocument();
      expect(screen.getByText(/£3,486\/year/)).toBeInTheDocument();
      expect(screen.getByText(/\(11.6%\)/)).toBeInTheDocument();
    });

    it('should calculate income tax percentage correctly', () => {
      // Test with different salary to verify calculation
      const mockResults = createMockResults({
        grossSalary: 50000,
        incomeTax: { ...createMockResults().incomeTax, annually: 7486 },
      });
      render(<SalarySEOContent salary={50000} results={mockResults} />);

      // 7486 / 50000 = 14.972% ≈ 15.0%
      expect(screen.getByText(/\(15.0%\)/)).toBeInTheDocument();
    });

    it('should display National Insurance amount and percentage', () => {
      const mockResults = createMockResults();
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      expect(screen.getByText(/National Insurance:/)).toBeInTheDocument();
      expect(screen.getByText(/£2,274\/year/)).toBeInTheDocument();
      expect(screen.getByText(/\(7.6%\)/)).toBeInTheDocument();
    });

    it('should calculate National Insurance percentage correctly', () => {
      const mockResults = createMockResults({
        grossSalary: 50000,
        nationalInsurance: { ...createMockResults().nationalInsurance, annually: 5274 },
      });
      render(<SalarySEOContent salary={50000} results={mockResults} />);

      // 5274 / 50000 = 10.548% ≈ 10.5%
      expect(screen.getByText(/\(10.5%\)/)).toBeInTheDocument();
    });

    it('should display total deductions (income tax + NI)', () => {
      const mockResults = createMockResults();
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      expect(screen.getByText(/Total Deductions:/)).toBeInTheDocument();
      // 3486 + 2274 = 5760
      expect(screen.getByText(/£5,760\/year/)).toBeInTheDocument();
    });

    it('should calculate effective tax rate correctly', () => {
      const mockResults = createMockResults();
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      // Effective rate = (3486 + 2274) / 30000 = 19.2%
      // Check for the percentage in the Total Deductions line
      expect(screen.getByText(/\(19.2%\)/)).toBeInTheDocument();
    });
  });

  describe('Salary Context Section - Conditional Logic', () => {
    it('should render salary context heading with salary', () => {
      const mockResults = createMockResults();
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      expect(
        screen.getByRole('heading', { level: 3, name: /Is £30,000 a Good Salary in 2025/i }),
      ).toBeInTheDocument();
    });

    // CRITICAL: These tests verify the conditional salary bracket logic
    it('should show "top 5% of UK earners" for salary > £100k', () => {
      const mockResults = createMockResults({ grossSalary: 110000 });
      render(<SalarySEOContent salary={110000} results={mockResults} />);

      expect(screen.getByText(/in the top 5% of UK earners/)).toBeInTheDocument();
    });

    it('should show "top 5% of UK earners" for salary exactly £100,001', () => {
      const mockResults = createMockResults({ grossSalary: 100001 });
      render(<SalarySEOContent salary={100001} results={mockResults} />);

      expect(screen.getByText(/in the top 5% of UK earners/)).toBeInTheDocument();
    });

    it('should show "top 10% of UK earners" for salary £70k-£100k', () => {
      const mockResults = createMockResults({ grossSalary: 80000 });
      render(<SalarySEOContent salary={80000} results={mockResults} />);

      expect(screen.getByText(/in the top 10% of UK earners/)).toBeInTheDocument();
    });

    it('should show "top 10% of UK earners" at boundary £70,000', () => {
      const mockResults = createMockResults({ grossSalary: 70000 });
      render(<SalarySEOContent salary={70000} results={mockResults} />);

      expect(screen.getByText(/in the top 10% of UK earners/)).toBeInTheDocument();
    });

    it('should show "top 10% of UK earners" at boundary £100,000', () => {
      const mockResults = createMockResults({ grossSalary: 100000 });
      render(<SalarySEOContent salary={100000} results={mockResults} />);

      expect(screen.getByText(/in the top 10% of UK earners/)).toBeInTheDocument();
    });

    it('should show "well above the UK median" for salary £50k-£69,999', () => {
      const mockResults = createMockResults({ grossSalary: 60000 });
      render(<SalarySEOContent salary={60000} results={mockResults} />);

      expect(screen.getByText(/well above the UK median salary/)).toBeInTheDocument();
    });

    it('should show "well above the UK median" at boundary £50,000', () => {
      const mockResults = createMockResults({ grossSalary: 50000 });
      render(<SalarySEOContent salary={50000} results={mockResults} />);

      expect(screen.getByText(/well above the UK median salary/)).toBeInTheDocument();
    });

    it('should show "around the UK median" for salary £30k-£49,999', () => {
      const mockResults = createMockResults({ grossSalary: 35000 });
      render(<SalarySEOContent salary={35000} results={mockResults} />);

      expect(screen.getByText(/around the UK median salary/)).toBeInTheDocument();
    });

    it('should show "around the UK median" at boundary £30,000', () => {
      const mockResults = createMockResults();
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      expect(screen.getByText(/around the UK median salary/)).toBeInTheDocument();
    });

    it('should show "below the UK median" for salary < £30k', () => {
      const mockResults = createMockResults({ grossSalary: 25000 });
      render(<SalarySEOContent salary={25000} results={mockResults} />);

      expect(
        screen.getByText(/below the UK median salary, but above minimum wage/),
      ).toBeInTheDocument();
    });

    it('should show "below the UK median" at boundary £29,999', () => {
      const mockResults = createMockResults({ grossSalary: 29999 });
      render(<SalarySEOContent salary={29999} results={mockResults} />);

      expect(
        screen.getByText(/below the UK median salary, but above minimum wage/),
      ).toBeInTheDocument();
    });

    it('should always mention UK median salary reference', () => {
      const mockResults = createMockResults();
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      expect(
        screen.getByText(/This is around the UK median full-time salary/),
      ).toBeInTheDocument();
    });
  });

  describe('Customize Your Calculation Section', () => {
    it('should render customization heading', () => {
      const mockResults = createMockResults();
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      expect(
        screen.getByRole('heading', { level: 3, name: 'Customize Your Calculation' }),
      ).toBeInTheDocument();
    });

    it('should explain standard assumptions', () => {
      const mockResults = createMockResults();
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      expect(
        screen.getByText(/tax code 1257L, no student loan, no pension contributions/),
      ).toBeInTheDocument();
    });

    it('should list student loan customization options', () => {
      const mockResults = createMockResults();
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      expect(screen.getByText(/Add student loan repayments/)).toBeInTheDocument();
      expect(screen.getByText(/Plans 1, 2, 4, 5, or Postgraduate/)).toBeInTheDocument();
    });

    it('should mention pension contributions with tax relief', () => {
      const mockResults = createMockResults();
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      expect(
        screen.getByText(/Include pension contributions.*with tax relief/),
      ).toBeInTheDocument();
    });

    it('should mention Scottish tax rates option', () => {
      const mockResults = createMockResults();
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      expect(screen.getByText(/Apply Scottish tax rates if applicable/)).toBeInTheDocument();
    });

    it('should mention tax code adjustment', () => {
      const mockResults = createMockResults();
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      expect(screen.getByText(/Adjust your tax code/)).toBeInTheDocument();
    });

    it('should mention salary sacrifice schemes', () => {
      const mockResults = createMockResults();
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      expect(screen.getByText(/Account for salary sacrifice schemes/)).toBeInTheDocument();
    });
  });

  describe('Formatting and Edge Cases', () => {
    it('should format very large salaries correctly', () => {
      const mockResults = createMockResults({
        grossSalary: 500000,
        netPay: { ...createMockResults().netPay, annually: 280000, monthly: 23333.33 },
      });
      render(<SalarySEOContent salary={500000} results={mockResults} />);

      expect(screen.getAllByText(/£500,000/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/£280,000/)).toBeInTheDocument();
      expect(screen.getByText(/£23,333.33/)).toBeInTheDocument();
    });

    it('should format small salaries correctly', () => {
      const mockResults = createMockResults({
        grossSalary: 18000,
        netPay: { ...createMockResults().netPay, annually: 17000, monthly: 1416.67 },
      });
      render(<SalarySEOContent salary={18000} results={mockResults} />);

      expect(screen.getAllByText(/£18,000/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/£17,000/)).toBeInTheDocument();
    });

    it('should handle zero income tax (below PA)', () => {
      const mockResults = createMockResults({
        grossSalary: 12000,
        incomeTax: { ...createMockResults().incomeTax, annually: 0 },
        nationalInsurance: { ...createMockResults().nationalInsurance, annually: 0 },
      });
      render(<SalarySEOContent salary={12000} results={mockResults} />);

      expect(screen.getByText(/Income Tax:/)).toBeInTheDocument();
      expect(screen.getAllByText(/£0\/year/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/\(0.0%\)/).length).toBeGreaterThanOrEqual(1);
    });

    it('should handle zero National Insurance', () => {
      const mockResults = createMockResults({
        nationalInsurance: { ...createMockResults().nationalInsurance, annually: 0 },
      });
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      expect(screen.getByText(/National Insurance:/)).toBeInTheDocument();
      expect(screen.getAllByText(/\(0.0%\)/).length).toBeGreaterThanOrEqual(1);
    });

    it('should use correct styling classes', () => {
      const mockResults = createMockResults();
      const { container } = render(<SalarySEOContent salary={30000} results={mockResults} />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('space-y-6');
      expect(wrapper).toHaveClass('text-sm');
    });
  });

  describe('Critical Calculations - Regression Tests', () => {
    it('should correctly calculate percentages to 1 decimal place', () => {
      const mockResults = createMockResults({
        grossSalary: 33333,
        incomeTax: { ...createMockResults().incomeTax, annually: 4166.6 },
      });
      render(<SalarySEOContent salary={33333} results={mockResults} />);

      // 4166.6 / 33333 = 12.5% (exactly)
      expect(screen.getByText(/\(12.5%\)/)).toBeInTheDocument();
    });

    it('should round percentages correctly (not truncate)', () => {
      const mockResults = createMockResults({
        grossSalary: 30000,
        incomeTax: { ...createMockResults().incomeTax, annually: 3499 },
      });
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      // 3499 / 30000 = 11.663% → should round to 11.7%
      expect(screen.getByText(/\(11.7%\)/)).toBeInTheDocument();
    });

    it('should calculate total deductions correctly (income tax + NI)', () => {
      const mockResults = createMockResults({
        incomeTax: { ...createMockResults().incomeTax, annually: 5000 },
        nationalInsurance: { ...createMockResults().nationalInsurance, annually: 3000 },
      });
      render(<SalarySEOContent salary={30000} results={mockResults} />);

      // 5000 + 3000 = 8,000 (student loan not included in display)
      expect(screen.getByText(/£8,000\/year/)).toBeInTheDocument();
    });
  });
});
