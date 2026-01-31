/**
 * Employee National Insurance Calculator
 *
 * Calculates Employee's National Insurance contributions on salary.
 * For directors, this reduces their take-home pay from salary.
 *
 * @module lib/tax/employeeNI
 * @see https://www.gov.uk/national-insurance-rates-letters
 *
 * ## Key Points for 2025-26
 *
 * - Primary threshold: £12,570 (below this = no employee NI)
 * - Upper earnings limit: £50,270
 * - Rate between thresholds: 8%
 * - Rate above UEL: 2%
 */

import type { TaxYear } from '@/constants/taxRates';
import { TAX_RATES } from '@/constants/taxRates';

// ============================================================================
// TYPES
// ============================================================================

export interface EmployeeNIResult {
  salary: number;
  employeeNI: number;
  primaryThreshold: number;
  upperEarningsLimit: number;
  primaryRate: number;
  upperRate: number;
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate Employee National Insurance
 *
 * Employee NI is charged in two bands:
 * - 8% on earnings between primary threshold and upper earnings limit
 * - 2% on earnings above upper earnings limit
 *
 * @param salary - Annual salary amount
 * @param taxYear - Tax year for rates (defaults to 2025-2026)
 * @returns Full calculation result with breakdown
 */
export function calculateEmployeeNI(
  salary: number,
  taxYear: TaxYear = '2025-2026',
): EmployeeNIResult {
  const rates = TAX_RATES[taxYear];
  const employeeRates = rates.nationalInsurance.employee.A;

  const primaryThreshold = employeeRates.primary.threshold;
  const upperEarningsLimit = employeeRates.upper.threshold;
  const primaryRate = employeeRates.primary.rate / 100;
  const upperRate = employeeRates.upper.rate / 100;

  if (!Number.isFinite(salary) || salary <= 0 || salary <= primaryThreshold) {
    return {
      salary: Number.isFinite(salary) ? salary : 0,
      employeeNI: 0,
      primaryThreshold,
      upperEarningsLimit,
      primaryRate,
      upperRate,
    };
  }

  let employeeNI = 0;

  // NI on earnings between primary threshold and UEL
  const earningsInPrimaryBand = Math.min(salary, upperEarningsLimit) - primaryThreshold;
  if (earningsInPrimaryBand > 0) {
    employeeNI += earningsInPrimaryBand * primaryRate;
  }

  // NI on earnings above UEL
  if (salary > upperEarningsLimit) {
    employeeNI += (salary - upperEarningsLimit) * upperRate;
  }

  return {
    salary,
    employeeNI: roundToPence(employeeNI),
    primaryThreshold,
    upperEarningsLimit,
    primaryRate,
    upperRate,
  };
}

/**
 * Get Employee NI amount (convenience function)
 */
export function getEmployeeNI(salary: number, taxYear: TaxYear = '2025-2026'): number {
  return calculateEmployeeNI(salary, taxYear).employeeNI;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function roundToPence(value: number): number {
  return Math.round(value * 100) / 100;
}
