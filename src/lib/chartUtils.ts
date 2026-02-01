/**
 * Chart Data Transformation Utilities
 *
 * Transforms tax calculation results into chart-ready data formats
 * for income breakdown, tax liability, and effective rate visualizations.
 */

import { SCOTTISH_TAX_RATES, TAX_RATES } from '@/constants/taxRates';
import type { TaxCalculationResults } from './taxCalculator';
import { formatCurrency } from './utils';

// Get tax thresholds from the single source of truth
const CURRENT_TAX_YEAR = '2025-2026' as const;
const currentRates = TAX_RATES[CURRENT_TAX_YEAR];
const currentScottishRates = SCOTTISH_TAX_RATES[CURRENT_TAX_YEAR];

/**
 * Income Breakdown Chart Data
 * Shows proportion of income from different sources (Employment vs Other)
 *
 * Note: Index signature required by Recharts ChartDataInput type
 * Recharts needs this to allow flexible data property access
 */
export interface IncomeBreakdownData {
  name: string;
  value: number;
  percentage: number;
  color: string;
  label: string;
  [key: string]: string | number;
}

export function getIncomeBreakdownData(
  results: TaxCalculationResults,
): IncomeBreakdownData[] | null {
  // Only show if there's an income breakdown (multiple sources)
  if (!results.incomeBreakdown) return null;

  const total = results.grossSalary.annually;
  const data: IncomeBreakdownData[] = [];

  // Employment income (subject to NI)
  if (results.incomeBreakdown.employment > 0) {
    data.push({
      name: 'Employment',
      value: results.incomeBreakdown.employment,
      percentage: (results.incomeBreakdown.employment / total) * 100,
      color: 'hsl(var(--chart-1))',
      label: formatCurrency(results.incomeBreakdown.employment),
    });
  }

  // Other income (no NI - dividends, rental, etc.)
  if (results.incomeBreakdown.nonEmployment > 0) {
    data.push({
      name: 'Other Income',
      value: results.incomeBreakdown.nonEmployment,
      percentage: (results.incomeBreakdown.nonEmployment / total) * 100,
      color: 'hsl(var(--chart-2))',
      label: formatCurrency(results.incomeBreakdown.nonEmployment),
    });
  }

  // Only show chart if there are multiple income sources
  return data.length > 1 ? data : null;
}

/**
 * Canonical category keys for tax liability chart.
 * Used to ensure consistency between data generation and chart rendering.
 */
export type TaxLiabilityCategory =
  | 'Income Tax'
  | 'National Insurance'
  | 'Student Loan'
  | 'Pension'
  | 'Net Pay';

/**
 * Tax Liability Chart Data
 * Shows breakdown of where gross income goes (taxes, NI, pension, net pay)
 */
export interface TaxLiabilityData {
  category: TaxLiabilityCategory;
  amount: number;
  percentage: number;
  color: string;
  label: string;
}

export function getTaxLiabilityData(
  results: TaxCalculationResults,
  whatIfResults?: TaxCalculationResults | null,
): {
  current: TaxLiabilityData[];
  whatIf?: TaxLiabilityData[];
} {
  const buildData = (res: TaxCalculationResults): TaxLiabilityData[] => {
    const gross = res.grossSalary.annually;

    const data: TaxLiabilityData[] = [
      {
        category: 'Income Tax' as const,
        amount: res.incomeTax.annually,
        percentage: (res.incomeTax.annually / gross) * 100,
        color: 'hsl(var(--chart-3))',
        label: formatCurrency(res.incomeTax.annually),
      },
      {
        category: 'National Insurance' as const,
        amount: res.nationalInsurance.annually,
        percentage: (res.nationalInsurance.annually / gross) * 100,
        color: 'hsl(var(--chart-4))',
        label: formatCurrency(res.nationalInsurance.annually),
      },
    ];

    // Only include student loan if there's a balance
    if (res.studentLoan.annually > 0) {
      data.push({
        category: 'Student Loan' as const,
        amount: res.studentLoan.annually,
        percentage: (res.studentLoan.annually / gross) * 100,
        color: 'hsl(var(--chart-5))',
        label: formatCurrency(res.studentLoan.annually),
      });
    }

    data.push(
      {
        category: 'Pension' as const,
        amount: res.pensionContribution.annually,
        percentage: (res.pensionContribution.annually / gross) * 100,
        color: 'hsl(var(--chart-2))',
        label: formatCurrency(res.pensionContribution.annually),
      },
      {
        category: 'Net Pay' as const,
        amount: res.netPay.annually,
        percentage: (res.netPay.annually / gross) * 100,
        color: 'hsl(var(--chart-6))',
        label: formatCurrency(res.netPay.annually),
      },
    );

    return data;
  };

  return {
    current: buildData(results),
    whatIf: whatIfResults ? buildData(whatIfResults) : undefined,
  };
}

/**
 * Effective Tax Rate Chart Data
 * Shows effective and marginal tax rates across a salary range
 */
export interface EffectiveTaxRateData {
  salary: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
  takeHomeRate: number;
  salaryLabel: string;
}

/**
 * Calculate effective tax rate (total tax / gross income)
 */
function calculateEffectiveRate(
  incomeTax: number,
  ni: number,
  studentLoan: number,
  grossSalary: number,
): number {
  if (grossSalary === 0) return 0;
  const totalDeductions = incomeTax + ni + studentLoan;
  return (totalDeductions / grossSalary) * 100;
}

/**
 * Estimate marginal tax rate for a salary point
 * Uses thresholds from taxRates.ts single source of truth
 */
function estimateMarginalRate(salary: number, isScottish = false): number {
  const personalAllowance = currentRates.personalAllowance;
  const basicRateThreshold = personalAllowance + (currentRates.bands[0]?.threshold ?? 0);
  const higherRateThreshold = personalAllowance + (currentRates.bands[1]?.threshold ?? 0);

  if (isScottish) {
    // Scottish has 6 bands - use intermediate rate threshold
    const scottishIntermediateThreshold =
      currentScottishRates.personalAllowance + (currentScottishRates.bands[2]?.threshold ?? 0);
    if (salary <= personalAllowance) return 0;
    if (salary <= scottishIntermediateThreshold) return currentScottishRates.bands[2]?.rate ?? 0;
    if (salary <= higherRateThreshold) return currentScottishRates.bands[3]?.rate ?? 0;
    return currentScottishRates.bands[5]?.rate ?? 0;
  }

  // UK (England, Wales, NI) rates
  if (salary <= personalAllowance) return 0;
  if (salary <= basicRateThreshold) return currentRates.bands[0]?.rate ?? 0;
  if (salary <= higherRateThreshold) return currentRates.bands[1]?.rate ?? 0;
  return currentRates.bands[2]?.rate ?? 0;
}

export function getEffectiveTaxRateData(
  currentSalary: number,
  results: TaxCalculationResults,
  isScottish = false,
): EffectiveTaxRateData[] {
  const range = currentSalary * 0.3; // ±30% range
  const minSalary = Math.max(10000, currentSalary - range);
  const maxSalary = currentSalary + range;
  const steps = 20;
  const stepSize = (maxSalary - minSalary) / steps;

  const dataPoints: EffectiveTaxRateData[] = [];

  for (let i = 0; i <= steps; i++) {
    const salary = minSalary + stepSize * i;

    // For the current salary, use actual calculated rates
    if (Math.abs(salary - currentSalary) < stepSize / 2) {
      const effectiveRate = calculateEffectiveRate(
        results.incomeTax.annually,
        results.nationalInsurance.annually,
        results.studentLoan.annually,
        results.grossSalary.annually,
      );

      dataPoints.push({
        salary: Math.round(salary),
        effectiveTaxRate: Number(effectiveRate.toFixed(1)),
        marginalTaxRate: estimateMarginalRate(salary, isScottish),
        takeHomeRate: Number((100 - effectiveRate).toFixed(1)),
        salaryLabel: formatCurrency(salary),
      });
    } else {
      // For other points, estimate based on typical rates
      // This is a simplified estimation - in a real implementation,
      // you might want to recalculate the full tax for each point
      const scaleFactor = salary / currentSalary;
      const estimatedEffectiveRate =
        calculateEffectiveRate(
          results.incomeTax.annually,
          results.nationalInsurance.annually,
          results.studentLoan.annually,
          results.grossSalary.annually,
        ) *
        scaleFactor ** 0.3; // Gentle scaling

      dataPoints.push({
        salary: Math.round(salary),
        effectiveTaxRate: Number(Math.min(estimatedEffectiveRate, 50).toFixed(1)),
        marginalTaxRate: estimateMarginalRate(salary, isScottish),
        takeHomeRate: Number((100 - Math.min(estimatedEffectiveRate, 50)).toFixed(1)),
        salaryLabel: formatCurrency(salary),
      });
    }
  }

  return dataPoints;
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Get chart config for consistent styling
 */
export function getChartConfig(type: 'income' | 'liability' | 'rate') {
  const baseConfig = {
    income: {
      employment: {
        label: 'Employment Income',
        color: 'hsl(var(--chart-1))',
      },
      other: {
        label: 'Other Income',
        color: 'hsl(var(--chart-2))',
      },
    },
    liability: {
      incomeTax: {
        label: 'Income Tax',
        color: 'hsl(var(--chart-3))',
      },
      ni: {
        label: 'National Insurance',
        color: 'hsl(var(--chart-4))',
      },
      studentLoan: {
        label: 'Student Loan',
        color: 'hsl(var(--chart-5))',
      },
      pension: {
        label: 'Pension',
        color: 'hsl(var(--chart-2))',
      },
      netPay: {
        label: 'Net Pay',
        color: 'hsl(var(--chart-6))',
      },
    },
    rate: {
      effectiveTaxRate: {
        label: 'Effective Rate',
        color: 'hsl(var(--chart-3))',
      },
      marginalTaxRate: {
        label: 'Marginal Rate',
        color: 'hsl(var(--chart-4))',
      },
      takeHomeRate: {
        label: 'Take Home %',
        color: 'hsl(var(--chart-6))',
      },
    },
  };

  return baseConfig[type];
}
