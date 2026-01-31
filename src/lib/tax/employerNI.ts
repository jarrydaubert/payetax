/**
 * Employer National Insurance Calculator
 *
 * Calculates Employer's National Insurance contributions on employee salaries.
 * For directors paying themselves a salary, this is a company cost that reduces
 * the profit available for dividends.
 *
 * @module lib/tax/employerNI
 * @see https://www.gov.uk/national-insurance-rates-letters
 * @see docs/business/DIRECTOR_TOOLS_MATH.md
 *
 * ## Key Points for Directors
 *
 * 1. Employer NI is paid BY THE COMPANY (not the individual)
 * 2. It's a deductible expense for Corporation Tax purposes
 * 3. For 2025-26: 15% on salary above £5,000
 * 4. This is why we recommend £12,570 salary (uses PA but triggers some Employer NI)
 */

import type { TaxYear } from '@/constants/taxRates';
import { TAX_RATES } from '@/constants/taxRates';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Employer NI calculation result
 */
export interface EmployerNIResult {
  /** The salary amount input */
  salary: number;
  /** Employer NI due */
  employerNI: number;
  /** The threshold used (salary below this = no NI) */
  threshold: number;
  /** The rate applied (as decimal) */
  rate: number;
  /** Amount of salary above threshold */
  salaryAboveThreshold: number;
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate Employer National Insurance
 *
 * Employer NI is charged on salary above the secondary threshold.
 * For 2025-26:
 * - Threshold: £5,000 per year
 * - Rate: 15%
 *
 * Note: This changed in the October 2024 Budget (previously 13.8% above £9,100)
 *
 * @param salary - Annual salary amount
 * @param taxYear - Tax year for rates (defaults to 2025-2026)
 * @returns Full calculation result with breakdown
 *
 * @example
 * ```typescript
 * // Director taking £12,570 salary
 * const result = calculateEmployerNI(12570);
 * // result.employerNI = 1135.50 ((12570 - 5000) × 0.15)
 * ```
 */
export function calculateEmployerNI(
  salary: number,
  taxYear: TaxYear = '2025-2026',
): EmployerNIResult {
  // Get employer NI rates from tax rates constant
  const rates = TAX_RATES[taxYear];
  const employerRates = rates.nationalInsurance.employer.A.secondary;

  const threshold = employerRates.threshold;
  const rate = employerRates.rate / 100; // Convert from percentage to decimal

  // Handle invalid, zero, or negative salary
  if (!Number.isFinite(salary) || salary <= 0) {
    return {
      salary: Number.isFinite(salary) ? salary : 0,
      employerNI: 0,
      threshold,
      rate,
      salaryAboveThreshold: 0,
    };
  }

  // Calculate salary above threshold
  const salaryAboveThreshold = Math.max(0, salary - threshold);

  // Calculate Employer NI
  const employerNI = roundToPence(salaryAboveThreshold * rate);

  return {
    salary,
    employerNI,
    threshold,
    rate,
    salaryAboveThreshold,
  };
}

/**
 * Get Employer NI amount (convenience function)
 *
 * Use this when you just need the NI amount without the full breakdown.
 *
 * @param salary - Annual salary amount
 * @param taxYear - Tax year for rates
 * @returns Employer NI due (rounded to pence)
 */
export function getEmployerNI(salary: number, taxYear: TaxYear = '2025-2026'): number {
  return calculateEmployerNI(salary, taxYear).employerNI;
}

/**
 * Get Employer NI threshold for a tax year
 *
 * Useful for displaying threshold information to users.
 *
 * @param taxYear - Tax year for rates
 * @returns Annual threshold amount
 */
export function getEmployerNIThreshold(taxYear: TaxYear = '2025-2026'): number {
  const rates = TAX_RATES[taxYear];
  return rates.nationalInsurance.employer.A.secondary.threshold;
}

/**
 * Get Employer NI rate for a tax year
 *
 * @param taxYear - Tax year for rates
 * @returns Rate as decimal (e.g., 0.15 for 15%)
 */
export function getEmployerNIRate(taxYear: TaxYear = '2025-2026'): number {
  const rates = TAX_RATES[taxYear];
  return rates.nationalInsurance.employer.A.secondary.rate / 100;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Round to nearest penny (2 decimal places)
 */
function roundToPence(value: number): number {
  return Math.round(value * 100) / 100;
}
