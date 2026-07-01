/**
 * Income Tax Calculator
 *
 * Calculates Income Tax on salary using UK or Scottish rates.
 * Handles personal allowance and progressive tax bands.
 *
 * @module lib/tax/incomeTax
 * @see https://www.gov.uk/income-tax-rates
 *
 * ## Key Points for 2025-26
 *
 * - Personal Allowance: £12,570 (tax-free)
 * - Basic rate (20%): £12,571 - £50,270
 * - Higher rate (40%): £50,271 - £125,140
 * - Additional rate (45%): Over £125,140
 *
 * Scotland has different rates (starter, basic, intermediate, higher, advanced, top).
 */

import {
  CURRENT_TAX_YEAR,
  SCOTTISH_TAX_RATES,
  TAX_RATES,
  type TaxYear,
} from '@/constants/taxRates';
import type { Region } from '@/lib/validation/directorValidation';
import { getAdjustedPersonalAllowance } from './personalAllowance';
import { roundToPence } from './utils';

// ============================================================================
// TYPES
// ============================================================================

export interface IncomeTaxResult {
  salary: number;
  incomeTax: number;
  personalAllowance: number;
  taxableIncome: number;
  effectiveRate: number;
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate Income Tax on salary
 *
 * Income Tax is calculated after deducting the Personal Allowance.
 * Salary above the PA is taxed in progressive bands.
 *
 * Note: Personal Allowance reduces by £1 for every £2 over £100k.
 * HMRC Tax Logic guide pseudocode uses:
 * roundDown((adjustedNetIncome - reducedAllowanceLimit) / 2, 0)
 * https://developer.service.hmrc.gov.uk/guides/tax-logic-service-guide/documentation/allowances-and-reliefs.html
 *
 * @param salary - Annual salary amount
 * @param region - 'rUK' or 'scotland' for rate determination
 * @param taxYear - Tax year for rates (defaults to the latest supported tax year)
 * @param adjustedNetIncome - Income used only for Personal Allowance taper
 * @returns Full calculation result with breakdown
 */
export function calculateIncomeTax(
  salary: number,
  region: Region,
  taxYear: TaxYear = CURRENT_TAX_YEAR,
  adjustedNetIncome: number = salary,
): IncomeTaxResult {
  const rates = region === 'scotland' ? SCOTTISH_TAX_RATES[taxYear] : TAX_RATES[taxYear];

  const personalAllowance = getAdjustedPersonalAllowance(adjustedNetIncome, taxYear);

  if (!Number.isFinite(salary) || salary <= 0) {
    return {
      salary: Number.isFinite(salary) ? salary : 0,
      incomeTax: 0,
      personalAllowance,
      taxableIncome: 0,
      effectiveRate: 0,
    };
  }

  // Calculate taxable income
  const taxableIncome = Math.max(0, salary - personalAllowance);

  if (taxableIncome <= 0) {
    return {
      salary,
      incomeTax: 0,
      personalAllowance,
      taxableIncome: 0,
      effectiveRate: 0,
    };
  }

  // Calculate tax using progressive bands
  let incomeTax = 0;
  let remainingIncome = taxableIncome;
  let previousThreshold = 0;

  for (const band of rates.bands) {
    if (remainingIncome <= 0) break;

    const bandWidth = band.threshold - previousThreshold;
    const incomeInBand = Math.min(remainingIncome, bandWidth);
    incomeTax += incomeInBand * (band.rate / 100);
    remainingIncome -= incomeInBand;
    previousThreshold = band.threshold;
  }

  const effectiveRate = salary > 0 ? (incomeTax / salary) * 100 : 0;

  return {
    salary,
    incomeTax: roundToPence(incomeTax),
    personalAllowance,
    taxableIncome,
    effectiveRate: roundToPence(effectiveRate),
  };
}

/**
 * Get Income Tax amount (convenience function)
 */
export function getIncomeTax(
  salary: number,
  region: Region,
  taxYear: TaxYear = CURRENT_TAX_YEAR,
  adjustedNetIncome: number = salary,
): number {
  return calculateIncomeTax(salary, region, taxYear, adjustedNetIncome).incomeTax;
}
