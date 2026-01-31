/**
 * Accessibility Tests for Calculator Charts
 * Uses jest-axe to check for WCAG violations
 *
 * Tests all Recharts 3.3.0 visualization components for:
 * - WCAG 2.1 Level AA compliance
 * - ARIA label presence
 * - Role attribute correctness
 * - Screen reader compatibility
 */

import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { ChartsContainer } from '../ChartsContainer';
import { EffectiveTaxRateChart } from '../EffectiveTaxRateChart';
import { IncomeBreakdownChart } from '../IncomeBreakdownChart';
import { NetIncomeComparisonChart } from '../NetIncomeComparisonChart';
import { TaxLiabilityChart } from '../TaxLiabilityChart';

expect.extend(toHaveNoViolations);

// Mock calculation results for a £45,000 salary
const mockResults: TaxCalculationResults = {
  grossSalary: {
    annually: 45000,
    monthly: 3750,
    fourWeekly: 3461.54,
    fortnightly: 1730.77,
    weekly: 865.38,
  },
  incomeTax: {
    annually: 6486,
    monthly: 540.5,
    fourWeekly: 498.46,
    fortnightly: 249.23,
    weekly: 124.62,
  },
  nationalInsurance: {
    annually: 3732,
    monthly: 311,
    fourWeekly: 286.69,
    fortnightly: 143.35,
    weekly: 71.77,
  },
  studentLoan: {
    annually: 0,
    monthly: 0,
    fourWeekly: 0,
    fortnightly: 0,
    weekly: 0,
  },
  pensionContribution: {
    annually: 0,
    monthly: 0,
    fourWeekly: 0,
    fortnightly: 0,
    weekly: 0,
  },
  netPay: {
    annually: 34782,
    monthly: 2898.5,
    fourWeekly: 2676.39,
    fortnightly: 1338.19,
    weekly: 669.0,
  },
  taxFreeAllowance: 12570,
  effectiveTaxRate: 22.7,
  marginalTaxRate: 32,
  region: 'england',
  taxYear: '2025-26',
  calculatedAt: new Date('2025-11-07'),
};

// Mock results with multiple income sources
const mockMultiSourceResults: TaxCalculationResults = {
  ...mockResults,
  incomeBreakdown: {
    employment: 35000,
    nonEmployment: 10000,
  },
};

// Mock "What If" results for comparison
const mockWhatIfResults: TaxCalculationResults = {
  ...mockResults,
  grossSalary: {
    annually: 50000,
    monthly: 4166.67,
    fourWeekly: 3846.15,
    fortnightly: 1923.08,
    weekly: 961.54,
  },
  incomeTax: {
    annually: 7486,
    monthly: 623.83,
    fourWeekly: 575.08,
    fortnightly: 287.54,
    weekly: 143.77,
  },
  nationalInsurance: {
    annually: 4332,
    monthly: 361,
    fourWeekly: 332.77,
    fortnightly: 166.38,
    weekly: 83.31,
  },
  netPay: {
    annually: 38182,
    monthly: 3181.83,
    fourWeekly: 2938.3,
    fortnightly: 1469.16,
    weekly: 734.46,
  },
  effectiveTaxRate: 23.6,
  marginalTaxRate: 32,
};

describe('Calculator Charts - Accessibility', () => {
  describe('NetIncomeComparisonChart', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<NetIncomeComparisonChart results={mockResults} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have role="img" attribute', () => {
      const { container } = render(<NetIncomeComparisonChart results={mockResults} />);

      const chartContainer = container.querySelector('[role="img"]');
      expect(chartContainer).toBeInTheDocument();
    });

    it('should have descriptive aria-label', () => {
      const { container } = render(<NetIncomeComparisonChart results={mockResults} />);

      const chartContainer = container.querySelector('[role="img"]');
      expect(chartContainer).toHaveAttribute('aria-label');
      expect(chartContainer?.getAttribute('aria-label')).toContain('Bar chart');
      expect(chartContainer?.getAttribute('aria-label')).toContain('salary');
    });

    it('should have no violations with different salary amounts', async () => {
      const highSalaryResults = {
        ...mockResults,
        grossSalary: { ...mockResults.grossSalary, annually: 150000 },
      };
      const { container } = render(<NetIncomeComparisonChart results={highSalaryResults} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('IncomeBreakdownChart', () => {
    it('should have no accessibility violations with multiple income sources', async () => {
      const { container } = render(<IncomeBreakdownChart results={mockMultiSourceResults} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have role="img" attribute when rendered', () => {
      const { container } = render(<IncomeBreakdownChart results={mockMultiSourceResults} />);

      const chartContainer = container.querySelector('[role="img"]');
      expect(chartContainer).toBeInTheDocument();
    });

    it('should have descriptive aria-label for income sources', () => {
      const { container } = render(<IncomeBreakdownChart results={mockMultiSourceResults} />);

      const chartContainer = container.querySelector('[role="img"]');
      expect(chartContainer).toHaveAttribute('aria-label');
      expect(chartContainer?.getAttribute('aria-label')).toContain('Pie chart');
      expect(chartContainer?.getAttribute('aria-label')).toContain('income');
    });

    it('should not render when only one income source (no violations)', async () => {
      const singleSourceResults = { ...mockResults, incomeBreakdown: undefined };
      const { container } = render(<IncomeBreakdownChart results={singleSourceResults} />);

      // Chart should not render, so no role="img" should exist
      const chartContainer = container.querySelector('[role="img"]');
      expect(chartContainer).not.toBeInTheDocument();

      // Even empty container should have no violations
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('TaxLiabilityChart', () => {
    it('should have no accessibility violations (single scenario)', async () => {
      const { container } = render(<TaxLiabilityChart results={mockResults} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations (comparison mode)', async () => {
      const { container } = render(
        <TaxLiabilityChart results={mockResults} whatIfResults={mockWhatIfResults} />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have role="img" attribute', () => {
      const { container } = render(<TaxLiabilityChart results={mockResults} />);

      const chartContainer = container.querySelector('[role="img"]');
      expect(chartContainer).toBeInTheDocument();
    });

    it('should have descriptive aria-label for single scenario', () => {
      const { container } = render(<TaxLiabilityChart results={mockResults} />);

      const chartContainer = container.querySelector('[role="img"]');
      expect(chartContainer).toHaveAttribute('aria-label');
      expect(chartContainer?.getAttribute('aria-label')).toContain('Stacked bar chart');
      expect(chartContainer?.getAttribute('aria-label')).toContain('tax breakdown');
      expect(chartContainer?.getAttribute('aria-label')).not.toContain('what-if');
    });

    it('should have descriptive aria-label for comparison mode', () => {
      const { container } = render(
        <TaxLiabilityChart results={mockResults} whatIfResults={mockWhatIfResults} />,
      );

      const chartContainer = container.querySelector('[role="img"]');
      expect(chartContainer).toHaveAttribute('aria-label');
      expect(chartContainer?.getAttribute('aria-label')).toContain('comparing');
      expect(chartContainer?.getAttribute('aria-label')).toContain('what-if');
    });

    it('should have no violations with student loan', async () => {
      const withStudentLoan = {
        ...mockResults,
        studentLoan: {
          annually: 1200,
          monthly: 100,
          fourWeekly: 92.31,
          fortnightly: 46.15,
          weekly: 23.08,
        },
      };
      const { container } = render(<TaxLiabilityChart results={withStudentLoan} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('EffectiveTaxRateChart', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<EffectiveTaxRateChart results={mockResults} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations for Scottish taxpayers', async () => {
      const { container } = render(
        <EffectiveTaxRateChart results={mockResults} isScottish={true} />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have role="img" attribute', () => {
      const { container } = render(<EffectiveTaxRateChart results={mockResults} />);

      const chartContainer = container.querySelector('[role="img"]');
      expect(chartContainer).toBeInTheDocument();
    });

    it('should have descriptive aria-label', () => {
      const { container } = render(<EffectiveTaxRateChart results={mockResults} />);

      const chartContainer = container.querySelector('[role="img"]');
      expect(chartContainer).toHaveAttribute('aria-label');
      expect(chartContainer?.getAttribute('aria-label')).toContain('Area chart');
      expect(chartContainer?.getAttribute('aria-label')).toContain('tax rate');
    });

    it('should have no violations with high salary (tax trap zone)', async () => {
      const taxTrapResults = {
        ...mockResults,
        grossSalary: { ...mockResults.grossSalary, annually: 110000 },
        effectiveTaxRate: 38.5,
        marginalTaxRate: 60, // Personal allowance taper zone
      };
      const { container } = render(<EffectiveTaxRateChart results={taxTrapResults} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ChartsContainer', () => {
    it('should have no accessibility violations (single scenario)', async () => {
      const { container } = render(<ChartsContainer results={mockMultiSourceResults} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations (comparison mode)', async () => {
      const { container } = render(
        <ChartsContainer results={mockMultiSourceResults} whatIfResults={mockWhatIfResults} />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations for Scottish taxpayers', async () => {
      const { container } = render(
        <ChartsContainer results={mockMultiSourceResults} isScottish={true} />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should render multiple charts with role="img"', () => {
      const { container } = render(<ChartsContainer results={mockMultiSourceResults} />);

      const chartContainers = container.querySelectorAll('[role="img"]');
      expect(chartContainers.length).toBeGreaterThanOrEqual(2); // At least 2 charts visible
    });

    it('should have unique aria-labels for each chart', () => {
      const { container } = render(<ChartsContainer results={mockMultiSourceResults} />);

      const chartContainers = container.querySelectorAll('[role="img"]');
      const ariaLabels = Array.from(chartContainers).map((el) => el.getAttribute('aria-label'));

      // All labels should be unique
      const uniqueLabels = new Set(ariaLabels);
      expect(uniqueLabels.size).toBe(ariaLabels.length);

      // All labels should be descriptive (not empty)
      for (const label of ariaLabels) {
        expect(label).toBeTruthy();
        expect(label?.length).toBeGreaterThan(20); // Should be descriptive
      }
    });
  });

  describe('Charts - Color Contrast (Manual Check)', () => {
    /**
     * Note: jest-axe cannot fully test color contrast in SVG charts
     * because Recharts renders dynamic SVG elements.
     *
     * Manual testing required:
     * 1. Visual inspection in light/dark modes
     * 2. Browser DevTools color picker for contrast ratios
     * 3. axe DevTools browser extension on running app
     *
     * All chart colors use theme CSS variables which are
     * designed to meet WCAG AA contrast requirements.
     */
    it('should use theme-aware colors (documented)', () => {
      const { container } = render(<NetIncomeComparisonChart results={mockResults} />);

      // Verify chart renders (indirect check for theme colors)
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });
  });

  describe('Charts - Combined Scenarios', () => {
    it('should have no violations with all charts visible', async () => {
      const { container } = render(
        <div>
          <NetIncomeComparisonChart results={mockResults} />
          <IncomeBreakdownChart results={mockMultiSourceResults} />
          <TaxLiabilityChart results={mockResults} whatIfResults={mockWhatIfResults} />
          <EffectiveTaxRateChart results={mockResults} />
        </div>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with minimum data', async () => {
      const minimalResults: TaxCalculationResults = {
        grossSalary: {
          annually: 10000,
          monthly: 833.33,
          fourWeekly: 769.23,
          fortnightly: 384.62,
          weekly: 192.31,
        },
        incomeTax: { annually: 0, monthly: 0, fourWeekly: 0, fortnightly: 0, weekly: 0 },
        nationalInsurance: { annually: 0, monthly: 0, fourWeekly: 0, fortnightly: 0, weekly: 0 },
        studentLoan: { annually: 0, monthly: 0, fourWeekly: 0, fortnightly: 0, weekly: 0 },
        pensionContribution: { annually: 0, monthly: 0, fourWeekly: 0, fortnightly: 0, weekly: 0 },
        netPay: {
          annually: 10000,
          monthly: 833.33,
          fourWeekly: 769.23,
          fortnightly: 384.62,
          weekly: 192.31,
        },
        taxFreeAllowance: 12570,
        effectiveTaxRate: 0,
        marginalTaxRate: 0,
        region: 'england',
        taxYear: '2025-26',
        calculatedAt: new Date(),
      };

      const { container } = render(<ChartsContainer results={minimalResults} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with maximum data', async () => {
      const maximalResults: TaxCalculationResults = {
        grossSalary: {
          annually: 500000,
          monthly: 41666.67,
          fourWeekly: 38461.54,
          fortnightly: 19230.77,
          weekly: 9615.38,
        },
        incomeTax: {
          annually: 218486,
          monthly: 18207.17,
          fourWeekly: 16806.62,
          fortnightly: 8403.31,
          weekly: 4201.65,
        },
        nationalInsurance: {
          annually: 12732,
          monthly: 1061,
          fourWeekly: 978.69,
          fortnightly: 489.35,
          weekly: 244.85,
        },
        studentLoan: {
          annually: 27000,
          monthly: 2250,
          fourWeekly: 2076.92,
          fortnightly: 1038.46,
          weekly: 519.23,
        },
        pensionContribution: {
          annually: 25000,
          monthly: 2083.33,
          fourWeekly: 1923.08,
          fortnightly: 961.54,
          weekly: 480.77,
        },
        netPay: {
          annually: 216782,
          monthly: 18065.17,
          fourWeekly: 16675.23,
          fortnightly: 8337.61,
          weekly: 4168.88,
        },
        taxFreeAllowance: 0, // Tapered away
        effectiveTaxRate: 51.6,
        marginalTaxRate: 45,
        region: 'england',
        taxYear: '2025-26',
        calculatedAt: new Date(),
        incomeBreakdown: {
          employment: 450000,
          nonEmployment: 50000,
        },
      };

      const { container } = render(<ChartsContainer results={maximalResults} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
