// src/components/organisms/CalculatorResults/__tests__/ResultsSummaryCards.test.tsx
import { render, screen } from '@testing-library/react';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { ResultsSummaryCards } from '../ResultsSummaryCards';

describe('ResultsSummaryCards Component', () => {
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

  describe('Rendering', () => {
    it('should render all four summary cards', () => {
      render(<ResultsSummaryCards results={mockResults} />);

      expect(screen.getByText('Annual Take-Home')).toBeInTheDocument();
      expect(screen.getByText('Monthly Take-Home')).toBeInTheDocument();
      expect(screen.getByText('Total Tax & NI')).toBeInTheDocument();
      expect(screen.getByText('Effective Tax Rate')).toBeInTheDocument();
    });

    it('should display correct annual take-home value', () => {
      render(<ResultsSummaryCards results={mockResults} />);

      expect(screen.getByText('£24,486.00')).toBeInTheDocument();
    });

    it('should display correct monthly take-home value', () => {
      render(<ResultsSummaryCards results={mockResults} />);

      expect(screen.getByText('£2,040.50')).toBeInTheDocument();
    });

    it('should display correct total tax and NI', () => {
      render(<ResultsSummaryCards results={mockResults} />);

      // Total tax: 3486 + 2028 = 5514
      expect(screen.getByText('£5,514.00')).toBeInTheDocument();
    });

    it('should display correct effective tax rate', () => {
      render(<ResultsSummaryCards results={mockResults} />);

      // (5514 / 30000) * 100 = 18.38%
      expect(screen.getByText('18.4%')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const { container } = render(<ResultsSummaryCards results={mockResults} />);

      const section = container.querySelector('section');
      expect(section).toHaveAttribute('aria-live', 'polite');
      expect(section).toHaveAttribute('aria-atomic', 'true');
      expect(section).toHaveAttribute('aria-label', 'Tax calculation summary results');
    });

    it('should render as a semantic section', () => {
      const { container } = render(<ResultsSummaryCards results={mockResults} />);

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero salary correctly', () => {
      const zeroResults: TaxCalculationResults = {
        ...mockResults,
        grossSalary: { ...mockResults.grossSalary, annually: 0 },
        netPay: { ...mockResults.netPay, annually: 0, monthly: 0 },
        incomeTax: { ...mockResults.incomeTax, annually: 0 },
        nationalInsurance: { ...mockResults.nationalInsurance, annually: 0 },
      };

      render(<ResultsSummaryCards results={zeroResults} />);

      // Multiple £0.00 values expected (annual, monthly, total tax)
      const zeroValues = screen.getAllByText('£0.00');
      expect(zeroValues.length).toBeGreaterThan(0);

      expect(screen.getByText('0.0%')).toBeInTheDocument(); // Effective rate
    });

    it('should handle high salary with correct formatting', () => {
      const highSalaryResults: TaxCalculationResults = {
        ...mockResults,
        grossSalary: { ...mockResults.grossSalary, annually: 150000 },
        netPay: { ...mockResults.netPay, annually: 85000, monthly: 7083.33 },
        incomeTax: { ...mockResults.incomeTax, annually: 50000 },
        nationalInsurance: { ...mockResults.nationalInsurance, annually: 6500 },
      };

      render(<ResultsSummaryCards results={highSalaryResults} />);

      expect(screen.getByText('£85,000.00')).toBeInTheDocument();
      expect(screen.getByText('£7,083.33')).toBeInTheDocument();
      expect(screen.getByText('£56,500.00')).toBeInTheDocument(); // Total tax: 50000 + 6500
    });

    it('should calculate effective tax rate correctly for high earners', () => {
      const highTaxResults: TaxCalculationResults = {
        ...mockResults,
        grossSalary: { ...mockResults.grossSalary, annually: 100000 },
        netPay: { ...mockResults.netPay, annually: 66000 },
        incomeTax: { ...mockResults.incomeTax, annually: 28000 },
        nationalInsurance: { ...mockResults.nationalInsurance, annually: 6000 },
      };

      render(<ResultsSummaryCards results={highTaxResults} />);

      // (28000 + 6000) / 100000 * 100 = 34%
      expect(screen.getByText('34.0%')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have grid layout classes', () => {
      const { container } = render(<ResultsSummaryCards results={mockResults} />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('grid');
      expect(section).toHaveClass('gap-4');
      expect(section).toHaveClass('md:grid-cols-2');
      expect(section).toHaveClass('lg:grid-cols-4');
    });
  });

  describe('Integration with ResultCard', () => {
    it('should pass correct variant to each card', () => {
      render(<ResultsSummaryCards results={mockResults} />);

      // Cards are rendered by ResultCard component
      // We just verify they're present with correct text
      expect(screen.getByText('Annual Take-Home')).toBeInTheDocument();
      expect(screen.getByText('Monthly Take-Home')).toBeInTheDocument();
      expect(screen.getByText('Total Tax & NI')).toBeInTheDocument();
      expect(screen.getByText('Effective Tax Rate')).toBeInTheDocument();
    });

    it('should render all cards with icons', () => {
      const { container } = render(<ResultsSummaryCards results={mockResults} />);

      // ResultCard components render svg icons
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Calculation Logic', () => {
    it('should correctly sum income tax and NI for total tax', () => {
      const customResults: TaxCalculationResults = {
        ...mockResults,
        incomeTax: { ...mockResults.incomeTax, annually: 10000 },
        nationalInsurance: { ...mockResults.nationalInsurance, annually: 5000 },
      };

      render(<ResultsSummaryCards results={customResults} />);

      // 10000 + 5000 = 15000
      expect(screen.getByText('£15,000.00')).toBeInTheDocument();
    });

    it('should calculate effective rate with one decimal place', () => {
      const customResults: TaxCalculationResults = {
        ...mockResults,
        grossSalary: { ...mockResults.grossSalary, annually: 45678 },
        incomeTax: { ...mockResults.incomeTax, annually: 6543.21 },
        nationalInsurance: { ...mockResults.nationalInsurance, annually: 3210.45 },
      };

      render(<ResultsSummaryCards results={customResults} />);

      // (6543.21 + 3210.45) / 45678 * 100 = 21.36%
      expect(screen.getByText('21.4%')).toBeInTheDocument();
    });
  });
});
