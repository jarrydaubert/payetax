/**
 * Employee National Insurance Calculator (annual earnings-period basis).
 *
 * Calculates Employee's National Insurance contributions on salary.
 * For directors, this reduces their take-home pay from salary.
 *
 * ## Basis
 *
 * This module uses the **annual earnings period**, which is the statutory basis
 * for directors: annual earnings assessed once against annual thresholds. Where
 * a primary rate changed mid-year, it applies HMRC's published blended rate for
 * that basis.
 *
 * It is deliberately not the payroll basis. A non-director paid per pay period
 * is assessed period by period at the rate in force on each pay date — see
 * `nationalInsurance.ts` and `payrollPeriodDeductions.ts`. The two bases use
 * different thresholds and do not produce the same figure.
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

import { CURRENT_TAX_YEAR, type NICategory, TAX_RATES, type TaxYear } from '@/constants/taxRates';
import { getDirectorsAnnualPrimaryRate, sliceClass1EmployeeEarnings } from './nationalInsurance';
import { roundToPence } from './utils';

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
 * Calculate Employee National Insurance on the annual earnings-period basis.
 *
 * Employee NI is charged in two bands:
 * - the primary rate on earnings between primary threshold and upper earnings limit
 * - 2% on earnings above upper earnings limit
 *
 * For a year with a mid-year rate change, the primary rate used is HMRC's
 * published blended rate for the annual earnings period (2023-24: 11.5% for
 * category A). See the module docblock for why this differs from payroll.
 *
 * @param salary - Annual salary amount
 * @param taxYear - Tax year for rates (defaults to the latest supported tax year)
 * @param options.niCategory - NI category letter (defaults to A)
 * @param options.applyPrimaryThreshold - When false, charge the primary rate from
 *   the first pound. Used where the primary threshold is already consumed by
 *   another employment.
 * @returns Full calculation result with breakdown
 */
export function calculateEmployeeNI(
  salary: number,
  taxYear: TaxYear = CURRENT_TAX_YEAR,
  options: { niCategory?: NICategory; applyPrimaryThreshold?: boolean } = {},
): EmployeeNIResult {
  const { niCategory = 'A', applyPrimaryThreshold = true } = options;
  const rates = TAX_RATES[taxYear];
  const employeeRates = rates.nationalInsurance.employee[niCategory];

  const primaryThreshold = applyPrimaryThreshold ? employeeRates.primary.threshold : 0;
  const upperEarningsLimit = employeeRates.upper.threshold;
  const primaryRate = getDirectorsAnnualPrimaryRate(taxYear, niCategory) / 100;
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

  const { employeeNI } = sliceClass1EmployeeEarnings(salary, {
    primaryThreshold,
    upperEarningsLimit,
    primaryRate: primaryRate * 100,
    upperRate: upperRate * 100,
  });

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
export function getEmployeeNI(
  salary: number,
  taxYear: TaxYear = CURRENT_TAX_YEAR,
  options: { niCategory?: NICategory; applyPrimaryThreshold?: boolean } = {},
): number {
  return calculateEmployeeNI(salary, taxYear, options).employeeNI;
}
