/**
 * Corporation Tax Calculator
 *
 * Calculates UK Corporation Tax for company profits with marginal relief.
 * Implements the 2023 Corporation Tax reform (19% small profits, 25% main rate).
 *
 * @module lib/tax/corporationTax
 * @see https://www.gov.uk/corporation-tax-rates
 * @see docs/business/DIRECTOR_TOOLS_MATH.md
 */

import { CT_RATES } from '@/constants/taxRates';

// Re-export for backwards compatibility with existing imports
export { CT_RATES } from '@/constants/taxRates';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Rate band classification for Corporation Tax
 */
export type CorporationTaxBand = 'small_profits' | 'marginal' | 'main';

/**
 * Corporation Tax calculation breakdown
 */
export interface CorporationTaxResult {
  /** The taxable profit input */
  taxableProfit: number;

  /** The Corporation Tax due */
  corporationTax: number;

  /** The effective tax rate (as decimal, e.g., 0.19 for 19%) */
  effectiveRate: number;

  /** Which rate band applies */
  rateBand: CorporationTaxBand;

  /** Marginal relief amount (0 if not applicable) */
  marginalRelief: number;
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate Corporation Tax with full breakdown
 *
 * Implements the 2023 Corporation Tax reform:
 * - Profits ≤ £50,000: 19% (small profits rate)
 * - Profits ≥ £250,000: 25% (main rate)
 * - Between: Marginal relief applies
 *
 * ## Marginal Relief Formula
 *
 * The marginal relief formula prevents a "cliff edge" at £50,000:
 *
 * ```
 * Tax = (Profits × Main Rate) - Marginal Relief
 * Marginal Relief = (Upper Limit - Profits) × (Profits / Upper Limit) × Fraction
 * ```
 *
 * Where Fraction = 3/200 (the standard marginal relief fraction)
 *
 * @param taxableProfit - Company's taxable profit after allowable deductions
 * @returns Full calculation result with breakdown
 *
 * @example
 * ```typescript
 * // Small profits (19% rate)
 * const result = calculateCorporationTax(40000);
 * // { corporationTax: 7600, effectiveRate: 0.19, rateBand: 'small_profits' }
 *
 * // Marginal relief (blended rate)
 * const result = calculateCorporationTax(100000);
 * // { corporationTax: 22750, effectiveRate: 0.2275, rateBand: 'marginal' }
 *
 * // Main rate (25%)
 * const result = calculateCorporationTax(300000);
 * // { corporationTax: 75000, effectiveRate: 0.25, rateBand: 'main' }
 * ```
 */
export function calculateCorporationTax(taxableProfit: number): CorporationTaxResult {
  const {
    SMALL_PROFITS_RATE,
    SMALL_PROFITS_LIMIT,
    MAIN_RATE,
    MAIN_RATE_LIMIT,
    MARGINAL_RELIEF_FRACTION,
  } = CT_RATES;

  // Handle invalid, zero, or negative profit
  if (!Number.isFinite(taxableProfit) || taxableProfit <= 0) {
    return {
      taxableProfit: Number.isFinite(taxableProfit) ? taxableProfit : 0,
      corporationTax: 0,
      effectiveRate: 0,
      rateBand: 'small_profits',
      marginalRelief: 0,
    };
  }

  // Case 1: Small profits rate (≤ £50,000)
  if (taxableProfit <= SMALL_PROFITS_LIMIT) {
    const tax = roundToPence(taxableProfit * SMALL_PROFITS_RATE);
    return {
      taxableProfit,
      corporationTax: tax,
      effectiveRate: SMALL_PROFITS_RATE,
      rateBand: 'small_profits',
      marginalRelief: 0,
    };
  }

  // Case 2: Main rate (≥ £250,000)
  if (taxableProfit >= MAIN_RATE_LIMIT) {
    const tax = roundToPence(taxableProfit * MAIN_RATE);
    return {
      taxableProfit,
      corporationTax: tax,
      effectiveRate: MAIN_RATE,
      rateBand: 'main',
      marginalRelief: 0,
    };
  }

  // Case 3: Marginal relief (between £50,000 and £250,000)
  //
  // The HMRC marginal relief formula (for single company, no associated companies):
  // Relief = F × (U - A)
  // Where: F = 3/200, U = £250,000 upper limit, A = augmented profits
  //
  // For a simple company with no exempt distributions, this simplifies to:
  // Relief = 3/200 × (250,000 - profit)
  //
  // @see https://www.gov.uk/guidance/corporation-tax-marginal-relief
  const mainRateTax = taxableProfit * MAIN_RATE;
  const marginalRelief = MARGINAL_RELIEF_FRACTION * (MAIN_RATE_LIMIT - taxableProfit);

  const tax = roundToPence(mainRateTax - marginalRelief);
  const effectiveRate = tax / taxableProfit;

  return {
    taxableProfit,
    corporationTax: tax,
    effectiveRate: roundToFourDecimals(effectiveRate),
    rateBand: 'marginal',
    marginalRelief: roundToPence(marginalRelief),
  };
}

/**
 * Get Corporation Tax amount (convenience function)
 *
 * Use this when you just need the tax amount without the full breakdown.
 *
 * @param taxableProfit - Company's taxable profit
 * @returns Corporation Tax due (rounded to pence)
 */
export function getCorporationTax(taxableProfit: number): number {
  return calculateCorporationTax(taxableProfit).corporationTax;
}

/**
 * Get effective Corporation Tax rate
 *
 * Useful for displaying the blended rate in marginal relief cases.
 *
 * @param taxableProfit - Company's taxable profit
 * @returns Effective rate as decimal (e.g., 0.22 for 22%)
 */
export function getEffectiveCTRate(taxableProfit: number): number {
  return calculateCorporationTax(taxableProfit).effectiveRate;
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
