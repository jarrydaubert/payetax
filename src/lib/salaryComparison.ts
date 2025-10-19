// src/lib/salaryComparison.ts
/**
 * Salary Comparison Calculator
 *
 * Calculates side-by-side comparison of current vs new salary with marginal rate analysis.
 *
 * Features:
 * - 3 input modes: percentage, amount, or total new salary
 * - Automatic application of all deductions
 * - Marginal rate calculation (% of increase kept)
 * - Diff highlighting for all metrics
 *
 * @module lib/salaryComparison
 * @since 2.0.0
 */

import {
  calculateTax,
  type TaxCalculationInput,
  type TaxCalculationResults,
} from './taxCalculator';

/**
 * Comparison input mode
 */
export type ComparisonMode = 'percentage' | 'amount' | 'total';

/**
 * Input for salary comparison
 */
export interface ComparisonInput {
  /** Mode of comparison */
  mode: ComparisonMode;
  /** Value based on mode (%, £ amount, or new total) */
  value: number;
  /** Current salary for reference */
  currentSalary: number;
}

/**
 * Complete comparison results
 */
export interface ComparisonResults {
  /** Current salary */
  currentSalary: number;
  /** New salary */
  newSalary: number;
  /** Gross increase */
  increase: number;
  /** Increase as percentage */
  increasePercentage: number;

  /** Current tax calculation */
  currentResults: TaxCalculationResults;
  /** New salary tax calculation */
  newResults: TaxCalculationResults;

  /** Differences */
  grossDiff: number;
  taxDiff: number;
  niDiff: number;
  studentLoanDiff: number;
  pensionDiff: number;
  netDiff: number;

  /** Marginal analysis */
  marginalRate: number; // % of increase kept
  effectiveRate: number; // % of increase lost
}

/**
 * Calculate new salary based on comparison mode
 *
 * @param input - Comparison input
 * @returns New salary amount or null if invalid
 *
 * @example
 * calculateNewSalary({ mode: 'percentage', value: 10, currentSalary: 40000 }); // 44000
 * calculateNewSalary({ mode: 'amount', value: 5000, currentSalary: 40000 }); // 45000
 * calculateNewSalary({ mode: 'total', value: 50000, currentSalary: 40000 }); // 50000
 */
export function calculateNewSalary(input: ComparisonInput): number | null {
  try {
    if (!isValidComparisonInput(input)) {
      console.warn('[salaryComparison] Invalid comparison input:', input);
      return null;
    }

    const { mode, value, currentSalary } = input;

    switch (mode) {
      case 'percentage':
        // Percentage increase
        return currentSalary * (1 + value / 100);

      case 'amount':
        // Fixed amount increase
        return currentSalary + value;

      case 'total':
        // New total salary
        return value;

      default:
        return null;
    }
  } catch (error) {
    console.error('[salaryComparison] Error calculating new salary:', error);
    return null;
  }
}

/**
 * Calculate full salary comparison
 *
 * @param currentInput - Current tax calculation input
 * @param comparisonInput - Comparison parameters
 * @returns Complete comparison results or null if invalid
 *
 * @example
 * const comparison = calculateComparison(currentInput, {
 *   mode: 'amount',
 *   value: 10000,
 *   currentSalary: 40000
 * });
 */
export function calculateComparison(
  currentInput: TaxCalculationInput,
  comparisonInput: ComparisonInput
): ComparisonResults | null {
  try {
    // Calculate new salary
    const newSalary = calculateNewSalary(comparisonInput);
    if (!newSalary) return null;

    // Get current results (should already be calculated)
    const currentResults = calculateTax(currentInput);

    // Calculate new results with same settings but new salary
    const newInput: TaxCalculationInput = {
      ...currentInput,
      salary: newSalary,
    };
    const newResults = calculateTax(newInput);

    // Calculate differences
    const increase = newSalary - comparisonInput.currentSalary;
    const increasePercentage = (increase / comparisonInput.currentSalary) * 100;

    const grossDiff = newResults.grossSalary.annually - currentResults.grossSalary.annually;
    const taxDiff = newResults.incomeTax.annually - currentResults.incomeTax.annually;
    const niDiff =
      newResults.nationalInsurance.annually - currentResults.nationalInsurance.annually;
    const studentLoanDiff = newResults.studentLoan.annually - currentResults.studentLoan.annually;
    const pensionDiff =
      newResults.pensionContribution.annually - currentResults.pensionContribution.annually;
    const netDiff = newResults.netPay.annually - currentResults.netPay.annually;

    // Calculate marginal rate (% of increase kept)
    const { marginalRate, effectiveRate } = calculateMarginalRate(increase, netDiff);

    return {
      currentSalary: comparisonInput.currentSalary,
      newSalary,
      increase,
      increasePercentage,
      currentResults,
      newResults,
      grossDiff,
      taxDiff,
      niDiff,
      studentLoanDiff,
      pensionDiff,
      netDiff,
      marginalRate,
      effectiveRate,
    };
  } catch (error) {
    console.error('[salaryComparison] Error calculating comparison:', error);
    return null;
  }
}

/**
 * Calculate marginal rate on salary increase
 *
 * Shows what % of the increase the user keeps after all deductions
 *
 * @param increase - Gross salary increase
 * @param netIncrease - Net pay increase
 * @returns Marginal rate and effective rate
 *
 * @example
 * calculateMarginalRate(10000, 6600); // { marginalRate: 66, effectiveRate: 34 }
 */
export function calculateMarginalRate(
  increase: number,
  netIncrease: number
): { marginalRate: number; effectiveRate: number } {
  try {
    if (increase <= 0) {
      return { marginalRate: 0, effectiveRate: 100 };
    }

    const marginalRate = Math.round((netIncrease / increase) * 100);
    const effectiveRate = 100 - marginalRate;

    return {
      marginalRate: Math.max(0, Math.min(100, marginalRate)), // Clamp 0-100
      effectiveRate: Math.max(0, Math.min(100, effectiveRate)),
    };
  } catch (error) {
    console.error('[salaryComparison] Error calculating marginal rate:', error);
    return { marginalRate: 0, effectiveRate: 100 };
  }
}

/**
 * Validate comparison input
 * @internal
 */
function isValidComparisonInput(input: ComparisonInput): boolean {
  if (!input || typeof input !== 'object') return false;

  const { mode, value, currentSalary } = input;

  // Validate mode
  if (!['percentage', 'amount', 'total'].includes(mode)) return false;

  // Validate numbers
  if (
    typeof value !== 'number' ||
    typeof currentSalary !== 'number' ||
    Number.isNaN(value) ||
    Number.isNaN(currentSalary) ||
    !Number.isFinite(value) ||
    !Number.isFinite(currentSalary)
  ) {
    return false;
  }

  // Current salary must be positive
  if (currentSalary <= 0) {
    return false;
  }

  // Mode-specific validation
  switch (mode) {
    case 'percentage':
      // Allow -100% to +1000% (reasonable range)
      return value >= -100 && value <= 1000;

    case 'amount':
      // Can be negative (pay cut) or positive
      // New salary must be >= 0
      return currentSalary + value >= 0;

    case 'total':
      // New salary must be >= 0 and <= 10M
      return value >= 0 && value <= 10000000;

    default:
      return false;
  }
}
