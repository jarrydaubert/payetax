/**
 * Dividend Tax Calculator
 *
 * Calculates UK Dividend Tax for company directors.
 * Dividends are taxed at different rates based on total income band.
 *
 * @module lib/tax/dividendTax
 * @see https://www.gov.uk/tax-on-dividends
 * @see src/constants/taxRates.ts
 *
 * ## Key Rules
 *
 * 1. Dividends use UK rates for ALL UK residents (including Scottish)
 * 2. The dividend allowance (£500 for 2025-26) is tax-free
 * 3. Dividends "stack" on top of other income for band calculation
 * 4. Dividend rates are lower than income tax rates (to account for CT already paid)
 */

import type { TaxYear } from '@/constants/taxRates';
import { DIVIDEND_RATES, TAX_RATES } from '@/constants/taxRates';
import { roundToPence } from './utils';

// Re-export for backwards compatibility with existing imports
export { DIVIDEND_RATES } from '@/constants/taxRates';

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
 * 1. First, any unused Personal Allowance shelters dividends (0% tax)
 * 2. Then, the dividend allowance (£500) is applied
 * 3. Then, remaining dividends are taxed at the rate corresponding
 *    to the band they fall into (based on total income)
 *
 * @param dividends - Total dividend amount to be taxed
 * @param otherIncome - Other taxable income (e.g., salary) - for band calculation
 * @param taxYear - Tax year for rates (defaults to 2025-2026)
 * @returns Full calculation result with breakdown
 *
 * @example
 * ```typescript
 * // Director with £12,570 salary and £50,000 dividends (PA fully used)
 * const result = calculateDividendTax(50000, 12570);
 * // result.dividendTax ≈ £4,331
 *
 * // Director with £0 salary and £50,000 dividends (PA shelters dividends)
 * const result = calculateDividendTax(50000, 0);
 * // result.dividendTax ≈ £3,231 (£12,570 sheltered by unused PA)
 * ```
 */
export function calculateDividendTax(
  dividends: number,
  otherIncome: number,
  taxYear: TaxYear = '2025-2026',
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
  const basePersonalAllowance = rates.personalAllowance;
  const taperThreshold = rates.personalAllowanceReductionThreshold; // £100,000
  const taperRate = rates.personalAllowanceReductionRate; // 0.5 (£1 per £2)

  // Calculate Personal Allowance with taper for high earners
  // PA reduces by £1 for every £2 over £100k, hitting zero at £125,140
  // Total income for taper = other income + dividends
  const totalIncome = safeOtherIncome + dividends;
  let personalAllowance = basePersonalAllowance;
  if (totalIncome > taperThreshold) {
    const reduction = Math.floor((totalIncome - taperThreshold) * taperRate);
    personalAllowance = Math.max(0, basePersonalAllowance - reduction);
  }

  // Get band thresholds (with fallbacks for safety)
  // Note: Band thresholds are based on BASE PA position, not tapered
  // Basic rate band ends at base PA + basic rate threshold
  const basicBandEnd = basePersonalAllowance + (rates.bands[0]?.threshold ?? 37700);
  // Higher rate band ends at £125,140 total income (threshold is already absolute, not cumulative)
  // Note: bands[1].threshold = 125140 represents the absolute income level, unlike bands[0].threshold
  // which is the cumulative taxable income amount (37700)
  const higherBandEnd = rates.bands[1]?.threshold ?? 125140;

  const { BASIC_RATE, HIGHER_RATE, ADDITIONAL_RATE } = DIVIDEND_RATES;
  const dividendAllowance = rates.dividendAllowance;

  // Step 1: Calculate unused Personal Allowance that can shelter dividends
  // If other income < tapered PA, the unused portion shelters dividends at 0% tax
  const unusedPA = Math.max(0, personalAllowance - safeOtherIncome);
  const dividendsSheltered = Math.min(dividends, unusedPA);
  const dividendsAfterPA = dividends - dividendsSheltered;

  // Step 2: Apply dividend allowance to remaining dividends
  const allowanceUsed = Math.min(dividendsAfterPA, dividendAllowance);
  const taxableDividends = Math.max(0, dividendsAfterPA - dividendAllowance);

  if (taxableDividends <= 0) {
    const bandBreakdown: DividendBandBreakdown[] = [];
    if (dividendsSheltered > 0) {
      bandBreakdown.push({
        band: 'allowance', // Using 'allowance' for PA-sheltered as well
        rate: 0,
        amount: dividendsSheltered,
        tax: 0,
      });
    }
    if (allowanceUsed > 0) {
      bandBreakdown.push({
        band: 'allowance',
        rate: 0,
        amount: allowanceUsed,
        tax: 0,
      });
    }
    return {
      totalDividends: dividends,
      allowanceUsed: dividendsSheltered + allowanceUsed, // Total tax-free amount
      taxableDividends: 0,
      dividendTax: 0,
      effectiveRate: 0,
      bandBreakdown,
    };
  }

  // Step 3: Calculate which bands the taxable dividends fall into
  // Dividends "stack" on top of other income + PA-sheltered dividends
  // The PA-sheltered dividends still use up band space
  const incomeBeforeTaxableDividends = safeOtherIncome + dividendsSheltered + allowanceUsed;

  let remainingDividends = taxableDividends;
  let totalTax = 0;
  const bandBreakdown: DividendBandBreakdown[] = [];

  // Add PA-sheltered dividends to breakdown (if any)
  if (dividendsSheltered > 0) {
    bandBreakdown.push({
      band: 'allowance',
      rate: 0,
      amount: dividendsSheltered,
      tax: 0,
    });
  }

  // Add dividend allowance to breakdown
  if (allowanceUsed > 0) {
    bandBreakdown.push({
      band: 'allowance',
      rate: 0,
      amount: allowanceUsed,
      tax: 0,
    });
  }

  // Basic rate band (up to £50,270 total income for 2025-26)
  if (incomeBeforeTaxableDividends < basicBandEnd && remainingDividends > 0) {
    const basicBandSpace = basicBandEnd - incomeBeforeTaxableDividends;
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
  if (incomeBeforeTaxableDividends < higherBandEnd && remainingDividends > 0) {
    const higherBandStart = Math.max(incomeBeforeTaxableDividends, basicBandEnd);
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
    allowanceUsed: dividendsSheltered + allowanceUsed, // Total tax-free (PA + DA)
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
  taxYear: TaxYear = '2025-2026',
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
  taxYear: TaxYear = '2025-2026',
): number {
  return calculateDividendTax(dividends, otherIncome, taxYear).effectiveRate;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Round to 4 decimal places (for rate precision)
 */
function roundToFourDecimals(value: number): number {
  return Math.round(value * 10000) / 10000;
}
