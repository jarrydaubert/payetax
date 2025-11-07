/**
 * Chart Data Transformation Utilities
 *
 * Transforms tax calculation results into chart-ready data formats
 * for income breakdown, tax liability, and effective rate visualizations.
 */

import type { TaxCalculationResults } from './taxCalculator';
import { formatCurrency } from './utils';

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
  results: TaxCalculationResults
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
 * Tax Liability Chart Data
 * Shows breakdown of where gross income goes (taxes, NI, pension, net pay)
 */
export interface TaxLiabilityData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  label: string;
}

export function getTaxLiabilityData(
  results: TaxCalculationResults,
  whatIfResults?: TaxCalculationResults | null
): {
  current: TaxLiabilityData[];
  whatIf?: TaxLiabilityData[];
} {
  const buildData = (res: TaxCalculationResults): TaxLiabilityData[] => {
    const gross = res.grossSalary.annually;

    return [
      {
        category: 'Income Tax',
        amount: res.incomeTax.annually,
        percentage: (res.incomeTax.annually / gross) * 100,
        color: 'hsl(var(--chart-3))',
        label: formatCurrency(res.incomeTax.annually),
      },
      {
        category: 'National Insurance',
        amount: res.nationalInsurance.annually,
        percentage: (res.nationalInsurance.annually / gross) * 100,
        color: 'hsl(var(--chart-4))',
        label: formatCurrency(res.nationalInsurance.annually),
      },
      ...(res.studentLoan.annually > 0
        ? [
            {
              category: 'Student Loan',
              amount: res.studentLoan.annually,
              percentage: (res.studentLoan.annually / gross) * 100,
              color: 'hsl(var(--chart-5))',
              label: formatCurrency(res.studentLoan.annually),
            },
          ]
        : []),
      {
        category: 'Pension',
        amount: res.pensionContribution.annually,
        percentage: (res.pensionContribution.annually / gross) * 100,
        color: 'hsl(var(--chart-2))',
        label: formatCurrency(res.pensionContribution.annually),
      },
      {
        category: 'Net Pay',
        amount: res.netPay.annually,
        percentage: (res.netPay.annually / gross) * 100,
        color: 'hsl(var(--chart-6))',
        label: formatCurrency(res.netPay.annually),
      },
    ];
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
  grossSalary: number
): number {
  if (grossSalary === 0) return 0;
  const totalDeductions = incomeTax + ni + studentLoan;
  return (totalDeductions / grossSalary) * 100;
}

/**
 * Estimate marginal tax rate for a salary point
 * This is a simplified calculation based on common tax bands
 */
function estimateMarginalRate(salary: number, isScottish = false): number {
  // Simplified UK/Scottish tax bands (2025-26)
  if (salary <= 12570) return 0; // Personal allowance
  if (salary <= 50270) return 20; // Basic rate
  if (isScottish && salary <= 43662) return 21; // Scottish intermediate
  if (salary <= 125140) return 40; // Higher rate
  return 45; // Additional rate
}

export function getEffectiveTaxRateData(
  currentSalary: number,
  results: TaxCalculationResults,
  isScottish = false
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
        results.grossSalary.annually
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
          results.grossSalary.annually
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
