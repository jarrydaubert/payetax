// src/lib/allowanceCalculator.ts
/**
 * Personal allowance calculation module
 *
 * This module provides specialized functions for calculating tax-free allowances
 * based on tax codes, marriage allowance, blindness, and income thresholds.
 * It handles various special tax codes like BR, NT, and K-codes used in the UK tax system.
 */

import { TAX_RATES, type TaxYear } from '@/constants/taxRates';

/**
 * Result of allowance calculation with various adjustments
 */
interface AllowanceCalculationResult {
  /** The final calculated allowance amount */
  allowance: number;
  /** Marriage allowance amount (if applicable) */
  marriageAllowance: number;
  /** Adjusted tax code (with prefixes removed) */
  adjustedTaxCode: string;
}

/**
 * Calculate personal allowance with adjustments for special tax codes, marriage allowance, etc.
 *
 * This function determines the tax-free allowance based on:
 * 1. Tax code (e.g., 1257L, K500, etc.)
 * 2. Personal circumstances (married, blind)
 * 3. Income adjustments for high earners
 *
 * @param annualSalary - Annual gross salary
 * @param taxCode - Tax code (e.g., "1257L", "BR", "K500")
 * @param taxYear - Tax year for calculation
 * @param isScottish - Whether Scottish tax rates apply
 * @param isBlind - Whether the person is registered blind
 * @param isMarried - Whether the person is married or in civil partnership
 * @param partnerIncome - Partner's income (for marriage allowance)
 * @returns Calculated allowance, marriage allowance, and adjusted tax code
 */
export function calculateAllowance(
  annualSalary: number,
  taxCode: string,
  taxYear: TaxYear,
  _isScottish = false,
  isBlind = false,
  isMarried = false,
  partnerIncome = 0
): AllowanceCalculationResult {
  // Get tax rates for the specified year
  const rates = TAX_RATES[taxYear];

  // Base allowance from the tax year rates
  const baseAllowance = rates.personalAllowance;

  // Clean the tax code for processing - use default if empty
  const taxCodeValue =
    taxCode.trim().toUpperCase() || `${rates.personalAllowance.toString().slice(0, -1)}L`;

  // Remove Scottish prefix for allowance calculation (it only affects rates)
  const cleanTaxCode = taxCodeValue.startsWith('S') ? taxCodeValue.substring(1) : taxCodeValue;

  // Initialize values
  let allowance = baseAllowance;
  const _adjustedTaxCode = cleanTaxCode;
  let marriageAllowance = 0;

  // Handle special tax codes that override the standard calculation
  if (cleanTaxCode === 'BR' || cleanTaxCode === 'D0' || cleanTaxCode === 'D1') {
    // BR means all income is taxed at basic rate (20%)
    // D0 means all income is taxed at higher rate (40%)
    // D1 means all income is taxed at additional rate (45%)
    allowance = 0;
  } else if (cleanTaxCode === 'NT') {
    // NT means no tax is due - effectively giving full salary as allowance
    allowance = annualSalary;
  } else if (cleanTaxCode === '0T') {
    // 0T means no personal allowance
    allowance = 0;
  } else if (/^[0-9]+[A-Za-z]$/.test(cleanTaxCode)) {
    // Standard tax code with number and letter (e.g., 1257L)
    const match = cleanTaxCode.match(/^([0-9]+)([A-Za-z])$/);
    if (match) {
      const numericPart = Number.parseInt(match[1], 10);
      const letterPart = match[2];

      // Calculate allowance based on tax code numeric part
      allowance = numericPart * 10;

      // Handle specific letter codes
      if (letterPart === 'L') {
        // L is the standard code - already handled
      } else if (letterPart === 'M') {
        // M means you've received marriage allowance from your partner
        marriageAllowance = rates.marriageAllowance || 1260;
        allowance += marriageAllowance;
      } else if (letterPart === 'N') {
        // N means you've given marriage allowance to your partner
        allowance -= rates.marriageAllowance || 1260;
      }
      // Other letter codes like T, K, etc. are handled by the basic calculation
      // or specific regex patterns below
    }
  } else if (/^K[0-9]+$/.test(cleanTaxCode)) {
    // K code means you have untaxed income which is more than your allowances
    const match = cleanTaxCode.match(/^K([0-9]+)$/);
    if (match) {
      const numericPart = Number.parseInt(match[1], 10);
      allowance = -numericPart * 10; // K codes result in negative allowance
    }
  }

  // Add blind person's allowance if applicable
  if (isBlind) {
    allowance += rates.blindPersonsAllowance || 3070;
  }

  // Calculate marriage allowance if person is married and meets criteria
  if (
    isMarried &&
    partnerIncome <= rates.personalAllowance &&
    annualSalary > rates.personalAllowance &&
    annualSalary < rates.bands[1].threshold + rates.personalAllowance
  ) {
    // Only basic rate taxpayers can receive marriage allowance
    if (!cleanTaxCode.endsWith('M')) {
      // Only apply if not already in tax code
      marriageAllowance = rates.marriageAllowance || 1260;
      allowance += marriageAllowance;
    }
  }

  // Apply personal allowance reduction for high earners
  if (annualSalary > rates.personalAllowanceReductionThreshold) {
    // Personal allowance is reduced by £1 for every £2 over the threshold
    const reduction = Math.min(
      Math.floor((annualSalary - rates.personalAllowanceReductionThreshold) / 2),
      allowance
    );
    allowance = Math.max(0, allowance - reduction);
  }

  return { allowance, marriageAllowance, adjustedTaxCode: cleanTaxCode };
}

/**
 * Checks if a tax code indicates Scottish taxpayer status
 *
 * @param taxCode - The tax code to check
 * @returns True if the tax code indicates Scottish status
 */
export function isScottishTaxCode(taxCode: string): boolean {
  return taxCode.trim().toUpperCase().startsWith('S');
}

/**
 * Gets the letter suffix from a tax code if present
 *
 * @param taxCode - The tax code to extract letter from
 * @returns The letter suffix or empty string if not found
 */
export function getTaxCodeLetter(taxCode: string): string {
  // Handle special tax codes that don't have letter suffixes
  if (['BR', 'D0', 'D1', 'NT', '0T'].includes(taxCode.trim().toUpperCase())) {
    return '';
  }

  // For K codes
  if (/^K[0-9]+$/.test(taxCode.trim().toUpperCase())) {
    return 'K';
  }

  // For standard codes with letter suffix
  const match = taxCode
    .trim()
    .toUpperCase()
    .match(/^[S]?[0-9]+([A-Z])$/);
  if (match?.[1]) {
    return match[1];
  }

  return '';
}

/**
 * Extract the numeric value from a tax code
 *
 * @param taxCode - The tax code to extract from
 * @returns The numeric value that determines the allowance amount
 */
export function getTaxCodeValue(taxCode: string): number {
  // Handle special tax codes
  if (['BR', 'D0', 'D1', 'NT'].includes(taxCode.trim().toUpperCase())) {
    return 0;
  }

  if (taxCode.trim().toUpperCase() === '0T') {
    return 0;
  }

  // For K codes (negative allowance)
  const kMatch = taxCode
    .trim()
    .toUpperCase()
    .match(/^K([0-9]+)$/);
  if (kMatch?.[1]) {
    return -Number.parseInt(kMatch[1], 10) * 10;
  }

  // For standard codes
  const standardMatch = taxCode
    .trim()
    .toUpperCase()
    .match(/^[S]?([0-9]+)[A-Z]?$/);
  if (standardMatch?.[1]) {
    return Number.parseInt(standardMatch[1], 10) * 10;
  }

  // Default return 0 if code can't be parsed
  return 0;
}
