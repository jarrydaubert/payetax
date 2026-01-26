/**
 * Dividend Tax Calculator
 *
 * Calculates UK Dividend Tax for company directors.
 * Dividends are taxed at different rates based on total income band.
 *
 * @module lib/tax/dividendTax
 * @see https://www.gov.uk/tax-on-dividends
 * @see docs/business/DIRECTOR_TOOLS_MATH.md
 *
 * ## Key Rules
 *
 * 1. Dividends use UK rates for ALL UK residents (including Scottish)
 * 2. The dividend allowance (£500 for 2025-26) is tax-free
 * 3. Dividends "stack" on top of other income for band calculation
 * 4. Dividend rates are lower than income tax rates (to account for CT already paid)
 */

import type { TaxYear } from '@/constants/taxRates';
import { TAX_RATES } from '@/constants/taxRates';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Dividend tax rates for 2025-26
 *
 * These rates are LOWER than income tax rates because the company
 * has already paid Corporation Tax on the profits.
 *
 * @see https://www.gov.uk/tax-on-dividends
 */
export const DIVIDEND_RATES = {
  /** Tax-free dividend allowance */
  ALLOWANCE: 500,

  /** Basic rate (8.75%) - for income up to £50,270 */
  BASIC_RATE: 0.0875,

  /** Higher rate (33.75%) - for income £50,271 to £125,140 */
  HIGHER_RATE: 0.3375,

  /** Additional rate (39.35%) - for income above £125,140 */
  ADDITIONAL_RATE: 0.3935,
} as const;

// ============================================================================
// TYPES
// ============================================================================

/**
 * Dividend tax band classification
 */
export type DividendTaxBand = 'allowance' | 'basic' | 'higher' | 'additional';

/**
 * Band breakdown for dividend tax calculation
 */
export interface DividendBandBreakdown {
  /** Name of the band */
  band: DividendTaxBand;
  /** Tax rate applied (as decimal) */
  rate: number;
  /** Amount of dividends taxed at this rate */
  amount: number;
  /** Tax due for this band */
  tax: number;
}

/**
 * Full dividend tax calculation result
 */
export interface DividendTaxResult {
  /** Total dividends input */
  totalDividends: number;
  /** Amount covered by dividend allowance (tax-free) */
  allowanceUsed: number;
  /** Taxable dividends after allowance */
  taxableDividends: number;
  /** Total dividend tax due */
  dividendTax: number;
  /** Effective tax rate on dividends (as decimal) */
  effectiveRate: number;
  /** Breakdown by tax band */
  bandBreakdown: DividendBandBreakdown[];
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate Dividend Tax with full breakdown
 *
 * Dividends are taxed based on the individual's total income:
 * 1. First, the dividend allowance (£500) is applied
 * 2. Then, remaining dividends are taxed at the rate corresponding
 *    to the band they fall into (based on total income)
 *
 * @param dividends - Total dividend amount to be taxed
 * @param otherIncome - Other taxable income (e.g., salary) - for band calculation
 * @param taxYear - Tax year for rates (defaults to 2025-2026)
 * @returns Full calculation result with breakdown
 *
 * @example
 * ```typescript
 * // Director with £12,570 salary and £50,000 dividends
 * const result = calculateDividendTax(50000, 12570);
 * // result.dividendTax ≈ £4,331
 * // result.effectiveRate ≈ 0.0866
 * ```
 */
export function calculateDividendTax(
  dividends: number,
  otherIncome: number,
  taxYear: TaxYear = '2025-2026'
): DividendTaxResult {
  // Handle invalid, zero, or negative dividends
  if (!Number.isFinite(dividends) || dividends <= 0) {
    return {
      totalDividends: Number.isFinite(dividends) ? dividends : 0,
      allowanceUsed: 0,
      taxableDividends: 0,
      dividendTax: 0,
      effectiveRate: 0,
      bandBreakdown: [],
    };
  }

  // Sanitize otherIncome (treat NaN/Infinity as 0)
  const safeOtherIncome = Number.isFinite(otherIncome) ? otherIncome : 0;

  const rates = TAX_RATES[taxYear];
  const personalAllowance = rates.personalAllowance;

  // Get band thresholds
  // Basic rate band ends at PA + basic rate threshold
  const basicBandEnd = personalAllowance + rates.bands[0].threshold;
  // Higher rate band ends at PA + higher rate threshold
  const higherBandEnd = personalAllowance + rates.bands[1].threshold;

  const { ALLOWANCE, BASIC_RATE, HIGHER_RATE, ADDITIONAL_RATE } = DIVIDEND_RATES;

  // Step 1: Apply dividend allowance
  const allowanceUsed = Math.min(dividends, ALLOWANCE);
  const taxableDividends = Math.max(0, dividends - ALLOWANCE);

  if (taxableDividends <= 0) {
    return {
      totalDividends: dividends,
      allowanceUsed,
      taxableDividends: 0,
      dividendTax: 0,
      effectiveRate: 0,
      bandBreakdown: [
        {
          band: 'allowance',
          rate: 0,
          amount: allowanceUsed,
          tax: 0,
        },
      ],
    };
  }

  // Step 2: Calculate which bands the dividends fall into
  // Dividends "stack" on top of other income
  const incomeBeforeDividends = safeOtherIncome;

  let remainingDividends = taxableDividends;
  let totalTax = 0;
  const bandBreakdown: DividendBandBreakdown[] = [];

  // Add allowance to breakdown
  if (allowanceUsed > 0) {
    bandBreakdown.push({
      band: 'allowance',
      rate: 0,
      amount: allowanceUsed,
      tax: 0,
    });
  }

  // Basic rate band (up to £50,270 total income for 2025-26)
  if (incomeBeforeDividends < basicBandEnd && remainingDividends > 0) {
    const basicBandSpace = basicBandEnd - incomeBeforeDividends;
    const dividendsInBasicBand = Math.min(remainingDividends, basicBandSpace);
    const taxInBasicBand = roundToPence(dividendsInBasicBand * BASIC_RATE);

    if (dividendsInBasicBand > 0) {
      bandBreakdown.push({
        band: 'basic',
        rate: BASIC_RATE,
        amount: dividendsInBasicBand,
        tax: taxInBasicBand,
      });
      totalTax += taxInBasicBand;
      remainingDividends -= dividendsInBasicBand;
    }
  }

  // Higher rate band (£50,271 - £125,140)
  if (incomeBeforeDividends < higherBandEnd && remainingDividends > 0) {
    const higherBandStart = Math.max(incomeBeforeDividends, basicBandEnd);
    const higherBandSpace = higherBandEnd - higherBandStart;
    const dividendsInHigherBand = Math.min(remainingDividends, higherBandSpace);
    const taxInHigherBand = roundToPence(dividendsInHigherBand * HIGHER_RATE);

    if (dividendsInHigherBand > 0) {
      bandBreakdown.push({
        band: 'higher',
        rate: HIGHER_RATE,
        amount: dividendsInHigherBand,
        tax: taxInHigherBand,
      });
      totalTax += taxInHigherBand;
      remainingDividends -= dividendsInHigherBand;
    }
  }

  // Additional rate band (above £125,140)
  if (remainingDividends > 0) {
    const taxInAdditionalBand = roundToPence(remainingDividends * ADDITIONAL_RATE);

    bandBreakdown.push({
      band: 'additional',
      rate: ADDITIONAL_RATE,
      amount: remainingDividends,
      tax: taxInAdditionalBand,
    });
    totalTax += taxInAdditionalBand;
  }

  // Calculate effective rate
  const effectiveRate = dividends > 0 ? totalTax / dividends : 0;

  return {
    totalDividends: dividends,
    allowanceUsed,
    taxableDividends,
    dividendTax: roundToPence(totalTax),
    effectiveRate: roundToFourDecimals(effectiveRate),
    bandBreakdown,
  };
}

/**
 * Get Dividend Tax amount (convenience function)
 *
 * Use this when you just need the tax amount without the full breakdown.
 *
 * @param dividends - Total dividend amount
 * @param otherIncome - Other taxable income (e.g., salary)
 * @param taxYear - Tax year for rates
 * @returns Dividend tax due (rounded to pence)
 */
export function getDividendTax(
  dividends: number,
  otherIncome: number,
  taxYear: TaxYear = '2025-2026'
): number {
  return calculateDividendTax(dividends, otherIncome, taxYear).dividendTax;
}

/**
 * Get effective Dividend Tax rate
 *
 * @param dividends - Total dividend amount
 * @param otherIncome - Other taxable income
 * @param taxYear - Tax year for rates
 * @returns Effective rate as decimal (e.g., 0.08 for 8%)
 */
export function getEffectiveDividendRate(
  dividends: number,
  otherIncome: number,
  taxYear: TaxYear = '2025-2026'
): number {
  return calculateDividendTax(dividends, otherIncome, taxYear).effectiveRate;
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

/**
 * Round to 4 decimal places (for rate precision)
 */
function roundToFourDecimals(value: number): number {
  return Math.round(value * 10000) / 10000;
}
