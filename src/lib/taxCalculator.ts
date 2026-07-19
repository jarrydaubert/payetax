// src/lib/taxCalculator.ts
/**
 * Core UK PAYE Tax Calculation Engine
 *
 * This module implements comprehensive UK tax calculations following HMRC rules and regulations.
 * It provides accurate computations for income tax, National Insurance contributions, student loan
 * repayments, pension contributions, and various allowances based on official government rates.
 *
 * ## HMRC Compliance & Implementation Notes
 *
 * ### Tax Calculation Methodology
 * The calculator uses a **hybrid monthly-annual approach** for payslip-style estimates:
 * 1. **Annual Conversion**: All inputs are normalized to annual amounts for consistency
 * 2. **Monthly Processing**: Tax calculations are performed using monthly payroll thresholds
 * 3. **Period Scaling**: Results are scaled to all requested pay periods from monthly base
 *
 * This approach ensures:
 * - Accurate month-1 style PAYE and NI estimates for common employee scenarios
 * - Proper handling of tax bands and thresholds
 * - Consistency across different pay period inputs
 *
 * ### Key HMRC References
 * - **Income Tax**: Based on Income Tax Act 2007 and annual Finance Acts
 * - **National Insurance**: Social Security Contributions and Benefits Act 1992
 * - **Student Loans**: Education (Student Loans) (Repayment) Regulations
 * - **Scottish Tax**: Scotland Act 2016 - devolved income tax powers
 *
 * ### Calculation Order (HMRC Compliant)
 * 1. Gross salary normalization and period conversion
 * 2. Personal allowance calculation (with tax code interpretation)
 * 3. Pre-tax deductions (pension contributions, salary sacrifice)
 * 4. Taxable income determination
 * 5. Income tax calculation using progressive bands
 * 6. National Insurance contributions (employee and employer)
 * 7. Student loan repayments (on gross salary)
 * 8. Net pay calculation with post-tax allowances
 *
 * @see {@link https://www.gov.uk/income-tax-rates} HMRC Tax Rates
 * @see {@link https://www.gov.uk/national-insurance-rates} HMRC NI Rates
 * @see {@link https://www.gov.uk/repaying-your-student-loan} Student Loan Repayment
 */

import {
  CURRENT_TAX_YEAR,
  DEFAULT_HOURS_PER_WEEK,
  DEFAULT_TAX_CODE,
  PAYROLL_PERIOD_THRESHOLDS,
  type PayPeriod,
  PERIOD_CONVERSION_FACTORS,
  PERIODS,
  SCOTTISH_PREFIX,
  SCOTTISH_TAX_RATES,
  type StudentLoanSelection,
  TAX_RATES,
  type TaxYear,
  WEEKS_PER_YEAR,
} from '@/constants/taxRates';
import type { TaxCalculationInput, TaxCalculationResults } from '@/lib/types/calculator';
import { convertPeriodToAnnual } from './periodCalculator';
import { sliceScottishTaxableIncome } from './tax/scottishIncomeTax';
import { roundToPence } from './tax/utils';

export type { TaxCalculationInput, TaxCalculationResults } from '@/lib/types/calculator';

const AVERAGE_WEEKS_PER_MONTH = WEEKS_PER_YEAR / 12;

function getMonthlyPayrollFreePay(
  annualTaxFreeAmount: number,
  standardPersonalAllowance: number,
  taxYear: TaxYear,
): number {
  if (annualTaxFreeAmount <= 0) {
    return annualTaxFreeAmount / 12;
  }

  const thresholds = PAYROLL_PERIOD_THRESHOLDS[taxYear];

  if (annualTaxFreeAmount === standardPersonalAllowance) {
    return thresholds.monthly.payeFreePay;
  }

  return Math.ceil(annualTaxFreeAmount / 12);
}

function getMonthlyPayrollBandThreshold(annualThreshold: number): number {
  if (!Number.isFinite(annualThreshold)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.ceil(annualThreshold / 12);
}

function resolveSupportedTaxYear(taxYear: string | undefined): TaxYear {
  if (typeof taxYear !== 'string') {
    return CURRENT_TAX_YEAR;
  }

  const [start, endRaw] = taxYear.split('-');
  if (!(start && endRaw)) {
    return CURRENT_TAX_YEAR;
  }

  const normalizedEnd = endRaw.length === 2 ? `20${endRaw}` : endRaw;
  const normalizedTaxYear = `${start}-${normalizedEnd}`;

  return normalizedTaxYear in TAX_RATES ? (normalizedTaxYear as TaxYear) : CURRENT_TAX_YEAR;
}

// ============================================================================
// HELPER FUNCTIONS - Extracted for maintainability
// Exported for testing. Used by calculateTax() for consistent behavior.
// ============================================================================

/**
 * Result of parsing a UK HMRC tax code.
 *
 * Tax codes control how much tax-free allowance an employee receives.
 * Special codes override normal progressive band calculations.
 *
 * @see https://www.gov.uk/tax-codes
 */
export interface TaxCodeParseResult {
  /** Personal allowance amount. Negative for K-codes (adds to taxable income). */
  allowance: number;
  /**
   * Special tax code that overrides normal band calculations.
   * The flat rate applied depends on the regime (rUK vs Scottish):
   * - 'BR': all income at the basic rate (rUK 20% / Scottish basic 20%)
   * - 'D0': rUK higher rate (40%) / Scottish intermediate rate (21%)
   * - 'D1': rUK additional rate (45%) / Scottish higher rate (42%)
   * - 'D2': Scottish advanced rate only (45%) — no rUK equivalent
   * - 'D3': Scottish top rate only (48%) — no rUK equivalent
   * - 'NT': No tax deducted
   * - null: Use normal progressive bands
   */
  bandOverride: 'BR' | 'D0' | 'D1' | 'D2' | 'D3' | 'NT' | null;
  /** Whether this is a K-code (benefits/underpayment exceed allowance) */
  isKCode: boolean;
  /** Whether W1/M1/X suffix present (non-cumulative/emergency basis) */
  isEmergency: boolean;
}

/**
 * Parse UK HMRC tax code into its components.
 *
 * Handles all standard HMRC tax code formats:
 * - Standard codes: 1257L, 1100T, 1000M (number × 10 = allowance)
 * - Scottish/Welsh prefixes: S1257L, C1257L (same calculation, different rates)
 * - K-codes: K100, SK500 (NEGATIVE allowance - adds to taxable income)
 * - Special codes: BR, D0, D1, NT, 0T (override normal band logic)
 * - Emergency suffixes: W1, M1, X (non-cumulative basis - not modeled here)
 *
 * @param taxCode - The HMRC tax code string (e.g., "1257L", "K100", "BR")
 * @param defaultAllowance - Fallback allowance if code cannot be parsed
 * @returns Parsed tax code components for use in calculations
 *
 * @example
 * parseTaxCode("1257L", 12570) // { allowance: 12570, bandOverride: null, isKCode: false }
 * parseTaxCode("K100", 12570)  // { allowance: -1000, bandOverride: null, isKCode: true }
 * parseTaxCode("BR", 12570)    // { allowance: 0, bandOverride: 'BR', isKCode: false }
 */
export function parseTaxCode(taxCode: string, defaultAllowance: number): TaxCodeParseResult {
  const result: TaxCodeParseResult = {
    allowance: defaultAllowance,
    bandOverride: null,
    isKCode: false,
    isEmergency: false,
  };

  if (!taxCode?.trim()) return result;

  const code = taxCode.toUpperCase().trim();

  // Check for emergency/non-cumulative suffixes (W1, M1, X)
  // These indicate HMRC doesn't have full year info - each period calculated independently
  // Note: We flag but don't model non-cumulative basis (would need period-by-period tracking)
  result.isEmergency = /[WM]1$|X$/.test(code);
  const codeWithoutEmergency = code.replace(/[WM]1$|X$/, '');

  // Remove Scottish (S) or Welsh (C) prefix - affects which tax rates to use, not allowance
  const hasScottishPrefix = codeWithoutEmergency.startsWith('S');
  const codeWithoutPrefix = codeWithoutEmergency.replace(/^[SC]/, '');

  // Handle special codes that override normal band calculations
  // These codes mean ALL income is taxed at a specific rate (no allowance)
  if (codeWithoutPrefix === 'BR') {
    return { ...result, allowance: 0, bandOverride: 'BR' };
  }
  if (codeWithoutPrefix === 'D0') {
    return { ...result, allowance: 0, bandOverride: 'D0' };
  }
  if (codeWithoutPrefix === 'D1') {
    return { ...result, allowance: 0, bandOverride: 'D1' };
  }
  // SD2/SD3 exist only in the Scottish regime (advanced and top rate codes).
  // A bare D2/D3 is not an HMRC code, so it falls through to the default allowance.
  if ((codeWithoutPrefix === 'D2' || codeWithoutPrefix === 'D3') && hasScottishPrefix) {
    return { ...result, allowance: 0, bandOverride: codeWithoutPrefix };
  }
  if (codeWithoutPrefix === 'NT') {
    return { ...result, allowance: 0, bandOverride: 'NT' };
  }
  // 0T = zero allowance but normal progressive bands (often used when HMRC reviewing)
  if (codeWithoutPrefix === '0T') {
    return { ...result, allowance: 0 };
  }

  // Handle K-codes: Kxxx means NEGATIVE allowance (adds to taxable income)
  // Used when benefits-in-kind or previous underpayments exceed personal allowance
  // Example: K100 means add £1,000 to taxable income
  if (codeWithoutPrefix.startsWith('K')) {
    const numericPart = Number.parseInt(codeWithoutPrefix.substring(1), 10);
    if (!Number.isNaN(numericPart)) {
      return { ...result, allowance: -(numericPart * 10), isKCode: true };
    }
    // Invalid K-code format - fall through to default
  }

  // Standard tax codes: number followed by optional letter (L, M, N, T, etc.)
  // The number × 10 = annual tax-free allowance
  // Example: 1257L = £12,570 allowance (the standard personal allowance)
  const standardMatch = codeWithoutPrefix.match(/^(\d+)[LMNTKX]?$/);
  if (standardMatch?.[1]) {
    const numericPart = Number.parseInt(standardMatch[1], 10);
    if (!Number.isNaN(numericPart)) {
      return { ...result, allowance: numericPart * 10 };
    }
  }

  // Unrecognized format - return default allowance
  return result;
}

/**
 * Calculate high income personal allowance reduction (HMRC "60% Tax Trap")
 * Above £100k, allowance reduces by £1 for every £2 of income
 *
 * HMRC Tax Logic guide pseudocode:
 * roundDown((adjustedNetIncome - reducedAllowanceLimit) / 2, 0)
 * https://developer.service.hmrc.gov.uk/guides/tax-logic-service-guide/documentation/allowances-and-reliefs.html
 */
export function calculateAllowanceReduction(
  salary: number,
  currentAllowance: number,
  threshold: number,
  reductionRate: number,
): number {
  if (salary <= threshold) return 0;

  return Math.min(currentAllowance, Math.floor((salary - threshold) * reductionRate));
}

/**
 * Calculate pension contribution (handles both percentage and fixed amount)
 */
export function calculatePensionAmount(
  salary: number,
  contribution: number,
  contributionType: 'percentage' | 'amount',
): number {
  if (contributionType === 'percentage') {
    return (salary * contribution) / 100;
  }
  // Fixed amount - convert to monthly equivalent
  return contribution / 12;
}

/**
 * Calculate income tax using progressive tax bands
 * Returns { totalTax, taxBands } for the given monthly income
 */
export function calculateIncomeTaxFromBands(
  monthlyTaxableIncome: number,
  taxBands: Array<{ name: string; rate: number; threshold: number }>,
  monthlyAllowance: number,
): { monthlyTax: number; taxBandsApplied: Array<{ name: string; rate: number; amount: number }> } {
  let remainingIncome = monthlyTaxableIncome;
  let monthlyTax = 0;
  const taxBandsApplied: Array<{ name: string; rate: number; amount: number }> = [];

  for (let i = 0; i < taxBands.length; i++) {
    if (remainingIncome <= 0) break;

    const band = taxBands[i];
    if (!band) continue;
    const nextBand = taxBands[i + 1];
    const prevBand = taxBands[i - 1];

    // Calculate band boundaries (monthly)
    const bandStart = i === 0 ? 0 : ((prevBand?.threshold ?? 0) - monthlyAllowance * 12) / 12;
    const bandEnd = nextBand
      ? (band.threshold - monthlyAllowance * 12) / 12
      : Number.POSITIVE_INFINITY;
    const bandWidth = Math.max(0, bandEnd - Math.max(0, bandStart));

    // Calculate tax for this band
    const incomeInBand = Math.min(remainingIncome, bandWidth);
    const taxForBand = roundToPence((incomeInBand * band.rate) / 100);

    if (taxForBand > 0) {
      monthlyTax += taxForBand;
      taxBandsApplied.push({
        name: band.name,
        rate: band.rate,
        amount: roundToPence(taxForBand * 12), // Store as annual
      });
    }

    remainingIncome -= incomeInBand;
  }

  return { monthlyTax: roundToPence(monthlyTax), taxBandsApplied };
}

/**
 * Calculate National Insurance contributions
 */
export function calculateNIContributions(
  monthlyEmploymentIncome: number,
  rates: {
    primaryThreshold: number;
    upperEarningsLimit: number;
    employeeRate: number;
    employeeRateAboveUEL: number;
    monthlyPrimaryThreshold?: number;
    monthlyUpperEarningsLimit?: number;
  },
  payNoNI: boolean,
  isOverStatePensionAge: boolean,
): number {
  if (payNoNI || isOverStatePensionAge) return 0;

  const monthlyPrimaryThreshold = rates.monthlyPrimaryThreshold ?? rates.primaryThreshold / 12;
  const monthlyUEL = rates.monthlyUpperEarningsLimit ?? rates.upperEarningsLimit / 12;

  let monthlyNI = 0;

  if (monthlyEmploymentIncome > monthlyPrimaryThreshold) {
    // NI on income between primary threshold and UEL
    const incomeInMainBand = Math.min(
      monthlyEmploymentIncome - monthlyPrimaryThreshold,
      monthlyUEL - monthlyPrimaryThreshold,
    );
    monthlyNI += (incomeInMainBand * rates.employeeRate) / 100;

    // NI on income above UEL (lower rate)
    if (monthlyEmploymentIncome > monthlyUEL) {
      const incomeAboveUEL = monthlyEmploymentIncome - monthlyUEL;
      monthlyNI += (incomeAboveUEL * rates.employeeRateAboveUEL) / 100;
    }
  }

  return roundToPence(monthlyNI);
}

/**
 * Calculate student loan repayments for all selected plans
 */
export function calculateStudentLoanRepayments(
  monthlyGrossSalary: number,
  studentLoanPlans: StudentLoanSelection,
  loanRates: Record<string, { threshold: number; rate: number }>,
): number {
  if (!Array.isArray(studentLoanPlans) || studentLoanPlans.length === 0) {
    return 0;
  }

  let monthlyRepayment = 0;

  for (const plan of studentLoanPlans) {
    const rates = loanRates[plan];
    if (!rates) continue;
    const monthlyThreshold = rates.threshold / 12;

    if (monthlyGrossSalary > monthlyThreshold) {
      monthlyRepayment += ((monthlyGrossSalary - monthlyThreshold) * rates.rate) / 100;
    }
  }

  return roundToPence(monthlyRepayment);
}

/**
 * Convert values to different pay periods
 */
export function convertToPeriods(
  annualValues: {
    gross: number;
    tax: number;
    ni: number;
    studentLoan: number;
    pension: number;
    net: number;
  },
  hoursPerWeek: number,
): Record<
  PayPeriod,
  { gross: number; tax: number; ni: number; studentLoan: number; pension: number; net: number }
> {
  const monthly = {
    gross: annualValues.gross / 12,
    tax: annualValues.tax / 12,
    ni: annualValues.ni / 12,
    studentLoan: annualValues.studentLoan / 12,
    pension: annualValues.pension / 12,
    net: annualValues.net / 12,
  };

  const fourWeeklyFactor = PERIOD_CONVERSION_FACTORS.FOUR_WEEKLY;
  const fortnightlyFactor = PERIOD_CONVERSION_FACTORS.FORTNIGHTLY;
  const weeklyFactor = PERIOD_CONVERSION_FACTORS.WEEKLY;
  const dailyFactor = PERIOD_CONVERSION_FACTORS.DAILY;
  const monthlyHours = hoursPerWeek * (WEEKS_PER_YEAR / 12);

  return {
    annually: annualValues,
    monthly: {
      gross: roundToPence(monthly.gross),
      tax: roundToPence(monthly.tax),
      ni: roundToPence(monthly.ni),
      studentLoan: roundToPence(monthly.studentLoan),
      pension: roundToPence(monthly.pension),
      net: roundToPence(monthly.net),
    },
    fourWeekly: {
      gross: roundToPence(monthly.gross * fourWeeklyFactor),
      tax: roundToPence(monthly.tax * fourWeeklyFactor),
      ni: roundToPence(monthly.ni * fourWeeklyFactor),
      studentLoan: roundToPence(monthly.studentLoan * fourWeeklyFactor),
      pension: roundToPence(monthly.pension * fourWeeklyFactor),
      net: roundToPence(monthly.net * fourWeeklyFactor),
    },
    fortnightly: {
      gross: roundToPence(monthly.gross * fortnightlyFactor),
      tax: roundToPence(monthly.tax * fortnightlyFactor),
      ni: roundToPence(monthly.ni * fortnightlyFactor),
      studentLoan: roundToPence(monthly.studentLoan * fortnightlyFactor),
      pension: roundToPence(monthly.pension * fortnightlyFactor),
      net: roundToPence(monthly.net * fortnightlyFactor),
    },
    weekly: {
      gross: roundToPence(monthly.gross * weeklyFactor),
      tax: roundToPence(monthly.tax * weeklyFactor),
      ni: roundToPence(monthly.ni * weeklyFactor),
      studentLoan: roundToPence(monthly.studentLoan * weeklyFactor),
      pension: roundToPence(monthly.pension * weeklyFactor),
      net: roundToPence(monthly.net * weeklyFactor),
    },
    daily: {
      gross: roundToPence(monthly.gross * dailyFactor),
      tax: roundToPence(monthly.tax * dailyFactor),
      ni: roundToPence(monthly.ni * dailyFactor),
      studentLoan: roundToPence(monthly.studentLoan * dailyFactor),
      pension: roundToPence(monthly.pension * dailyFactor),
      net: roundToPence(monthly.net * dailyFactor),
    },
    hourly:
      hoursPerWeek > 0
        ? {
            gross: roundToPence(monthly.gross / monthlyHours),
            tax: roundToPence(monthly.tax / monthlyHours),
            ni: roundToPence(monthly.ni / monthlyHours),
            studentLoan: roundToPence(monthly.studentLoan / monthlyHours),
            pension: roundToPence(monthly.pension / monthlyHours),
            net: roundToPence(monthly.net / monthlyHours),
          }
        : {
            // Fallback: assume standard working hours when hoursPerWeek is 0
            gross: roundToPence(annualValues.gross / (WEEKS_PER_YEAR * DEFAULT_HOURS_PER_WEEK)),
            tax: roundToPence(annualValues.tax / (WEEKS_PER_YEAR * DEFAULT_HOURS_PER_WEEK)),
            ni: roundToPence(annualValues.ni / (WEEKS_PER_YEAR * DEFAULT_HOURS_PER_WEEK)),
            studentLoan: roundToPence(
              annualValues.studentLoan / (WEEKS_PER_YEAR * DEFAULT_HOURS_PER_WEEK),
            ),
            pension: roundToPence(annualValues.pension / (WEEKS_PER_YEAR * DEFAULT_HOURS_PER_WEEK)),
            net: roundToPence(annualValues.net / (WEEKS_PER_YEAR * DEFAULT_HOURS_PER_WEEK)),
          },
  };
}

type BandOverrideCode = 'BR' | 'D0' | 'D1' | 'D2' | 'D3' | 'NT';

/** Which band's rate each flat-rate code uses, per regime. */
const RUK_OVERRIDE_BANDS: Partial<Record<BandOverrideCode, { bandName: string; label: string }>> = {
  BR: { bandName: 'Basic rate', label: 'Basic Rate (BR code)' },
  D0: { bandName: 'Higher rate', label: 'Higher Rate (D0 code)' },
  D1: { bandName: 'Additional rate', label: 'Additional Rate (D1 code)' },
};

const SCOTTISH_OVERRIDE_BANDS: Partial<
  Record<BandOverrideCode, { bandName: string; label: string }>
> = {
  BR: { bandName: 'Basic rate', label: 'Scottish Basic Rate (SBR code)' },
  D0: { bandName: 'Intermediate rate', label: 'Scottish Intermediate Rate (SD0 code)' },
  D1: { bandName: 'Higher rate', label: 'Scottish Higher Rate (SD1 code)' },
  D2: { bandName: 'Advanced rate', label: 'Scottish Advanced Rate (SD2 code)' },
  D3: { bandName: 'Top rate', label: 'Scottish Top Rate (SD3 code)' },
};

/**
 * Resolve the flat rate for a band-override tax code from the year's band table.
 *
 * Scottish codes use Scottish band rates (SD0 = intermediate 21%, SD1 = higher 42%,
 * SD2 = advanced 45%, SD3 = top 48%); rUK codes use rUK band rates (D0 = 40%,
 * D1 = 45%). Falls back to the year's highest band when a named band is absent
 * (e.g. SD2 in 2023-24, before the advanced rate existed, resolves to the top rate).
 */
function resolveBandOverride(
  code: BandOverrideCode,
  hasScottishPrefix: boolean,
  bands: Array<{ name: string; rate: number; threshold: number }>,
): { rate: number; name: string } {
  if (code === 'NT') {
    return { rate: 0, name: 'No Tax (NT code)' };
  }

  const mapping = (hasScottishPrefix ? SCOTTISH_OVERRIDE_BANDS : RUK_OVERRIDE_BANDS)[code];
  const topBand = bands[bands.length - 1];
  const namedBand = bands.find((candidate) => candidate.name === mapping?.bandName);
  const band = namedBand ?? topBand;

  // When the named band is absent (e.g. SD2 in 2023-24, before the Advanced
  // rate existed), the code resolves to the top band — label it as such rather
  // than claiming a band that year did not have.
  let name = `Flat Rate (${code} code)`;
  if (namedBand && mapping) {
    name = mapping.label;
  } else if (!namedBand && hasScottishPrefix) {
    name = `Scottish Top Rate (S${code} code)`;
  }

  return {
    rate: band?.rate ?? 0,
    name,
  };
}

// ============================================================================
// END HELPER FUNCTIONS
// ============================================================================

/**
 * Comprehensive UK PAYE Tax Calculation Engine
 *
 * This function performs complete UK tax calculations following HMRC regulations for the current tax year.
 * It implements all major aspects of the UK tax system including progressive income tax bands,
 * National Insurance contributions, student loan repayments, and various employment allowances.
 *
 * ### Algorithm Overview
 * The calculation follows the official HMRC process used in payroll systems (RTI - Real Time Information):
 *
 * 1. **Income Normalization**: Convert input salary to annual and monthly amounts
 * 2. **Personal Allowance**: Apply tax code and high-income reduction rules
 * 3. **Pre-Tax Deductions**: Subtract pension contributions and qualifying allowances
 * 4. **Taxable Income**: Calculate income subject to tax after allowances
 * 5. **Progressive Taxation**: Apply income tax bands (20%, 40%, 45% or Scottish rates)
 * 6. **National Insurance**: Calculate employee and employer contributions
 * 7. **Student Loans**: Apply income-contingent repayments
 * 8. **Net Pay**: Final take-home calculation (adds non-taxable allowances if provided)
 *
 * ### HMRC Formula Implementation
 *
 * #### Personal Allowance Calculation
 * ```
 * Base Allowance = £12,570 (2024-25) or Tax Code × 10
 * High Income Reduction = max(0, (Gross Income - £100,000) ÷ 2)
 * Final Allowance = max(0, Base Allowance - High Income Reduction)
 * ```
 *
 * #### Income Tax Calculation (Standard UK Rates 2024-25)
 * ```
 * Taxable Income = Gross Income - Personal Allowance - Pension - Qualifying Allowances
 * Basic Rate (20%):    £0 - £37,700 of taxable income
 * Higher Rate (40%):   £37,701 - £125,140 of taxable income
 * Additional Rate (45%): £125,141+ of taxable income
 * ```
 *
 * #### National Insurance Calculation (Class 1 Employee 2024-25)
 * ```
 * NI Income = Gross Income - Pension Contributions (salary sacrifice only)
 * Primary Rate (8%):    £12,570 - £50,270 annually
 * Upper Rate (2%):      £50,271+ annually
 * ```
 *
 * #### Student Loan Repayments (Income-Contingent)
 * ```
 * Repayment = max(0, (Gross Income - Threshold) × Rate)
 * Plan 1: 9% above £22,015
 * Plan 2: 9% above £27,295
 * Plan 4: 9% above £31,395 (Scotland)
 * Plan 5: 9% above £25,000
 * Postgraduate: 6% above £21,000
 * ```
 *
 * ### Scottish Tax Variations
 * Scottish taxpayers (S tax code prefix) use different income tax bands but identical
 * National Insurance and student loan rules. Scottish rates are typically more progressive
 * with additional bands (starter, intermediate, advanced rates).
 *
 * ### Implementation Notes
 * - Uses monthly calculations to avoid rounding errors in annual scaling
 * - Handles tax code interpretation including emergency codes (1257L, BR, D0, etc.)
 * - Properly sequences deductions (pension before tax, benefits after tax)
 * - Supports multiple student loan plans simultaneously
 * - Accounts for employer NI liability for payroll cost calculations
 *
 * @param input - Complete tax calculation parameters including salary, period, tax code, and deductions
 * @returns Comprehensive tax breakdown with amounts for all pay periods, tax band analysis, and net pay
 *
 * @throws {Error} If input parameters are invalid or tax rates are not available for the specified year
 *
 * @see {@link https://www.gov.uk/government/publications/rates-and-allowances-income-tax} HMRC Income Tax Rates
 * @see {@link https://www.gov.uk/government/publications/rates-and-allowances-national-insurance-contributions} HMRC NI Rates
 * @see {@link https://www.gov.uk/government/publications/student-loan-interest-rates-and-repayment-thresholds} Student Loan Thresholds
 * @see {@link https://www.revenue.scot/income-tax/scottish-income-tax-2024-25} Scottish Income Tax Rates
 *
 * @example
 * ```typescript
 * // Calculate tax for £40,000 annual salary with standard tax code
 * const result = calculateTax({
 *   salary: 40000,
 *   payPeriod: 'annually',
 *   taxYear: '2024-25',
 *   taxCode: '1257L',
 *   isScottish: false,
 *   pensionContribution: 5,
 *   pensionContributionType: 'percentage',
 *   studentLoanPlan: 'plan2',
 *   niCategory: 'A',
 *   hoursPerWeek: 37.5
 * });
 *
 * console.log(`Net pay: £${result.netPay.annually.toFixed(2)}`);
 * console.log(`Income tax: £${result.incomeTax.annually.toFixed(2)}`);
 * ```
 */
export function calculateTax(input: TaxCalculationInput): TaxCalculationResults {
  // ---------------
  // 1. Prepare input data and tax rates
  // ---------------

  // Defensive normalization for adversarial runtime inputs.
  // Boundary validation should reject these first, but core math should stay finite.
  const salaryInput = Number.isFinite(input.salary) && input.salary > 0 ? input.salary : 0;
  const hoursPerWeek =
    Number.isFinite(input.hoursPerWeek) && input.hoursPerWeek > 0
      ? input.hoursPerWeek
      : DEFAULT_HOURS_PER_WEEK;
  const taxCodeInput =
    typeof input.taxCode === 'string' && input.taxCode.trim().length > 0
      ? input.taxCode
      : DEFAULT_TAX_CODE;

  // Determine if using Scottish rates.
  // Prefix precedence: Welsh C-prefix always uses rUK bands, Scottish S-prefix always uses Scottish bands.
  const normalizedTaxCode = taxCodeInput.toUpperCase().trim();
  const hasScottishPrefix = normalizedTaxCode.startsWith(SCOTTISH_PREFIX);
  const hasWelshPrefix = normalizedTaxCode.startsWith('C');
  const isScottish = hasWelshPrefix ? false : input.isScottish || hasScottishPrefix;
  const taxYear = resolveSupportedTaxYear(input.taxYear);

  // Get the tax rates for the selected year
  const standardRates = TAX_RATES[taxYear];
  const scottishRates = SCOTTISH_TAX_RATES[taxYear];

  // Choose appropriate tax rates based on whether the taxpayer is Scottish
  const taxRates = isScottish ? scottishRates : standardRates;

  // ---------------
  // 2. Input normalization - start by converting salary to both annual and monthly
  // ---------------

  // First convert salary to annual amount based on input period
  const annualGrossSalary = convertPeriodToAnnual(salaryInput, input.payPeriod, hoursPerWeek);

  // ---------------
  // 2.5. Calculate additional income from other sources
  // ---------------
  //
  // CRITICAL: We maintain TWO income buckets for HMRC compliance:
  //
  // 1. employmentIncome - Subject to:
  //    - Income Tax (via PAYE bands)
  //    - Employee National Insurance (Class 1)
  //    - Employer National Insurance (Class 1)
  //    - Student Loan deductions via PAYE
  //
  // 2. additionalIncome (rental, pensions, investments) - Subject to:
  //    - Income Tax only (via PAYE bands)
  //    - NO National Insurance (not employment earnings)
  //    - NO Student Loan via PAYE (handled via Self Assessment)
  //
  // Both contribute to totalGrossIncome for:
  //    - Personal Allowance £100k taper calculation
  //    - Tax band threshold determination
  //    - Marriage Allowance eligibility
  //
  let additionalIncome = 0;
  let employmentIncome = annualGrossSalary; // Primary salary

  if (input.incomeSources && input.incomeSources.length > 0) {
    for (const source of input.incomeSources) {
      const sourceAnnual = convertPeriodToAnnual(source.amount, source.period, hoursPerWeek);

      if (source.type === 'employment') {
        employmentIncome += sourceAnnual;
      } else {
        // Rental, pension, investment income - taxable but no NI/SL via PAYE
        additionalIncome += sourceAnnual;
      }
    }
  }

  // totalGrossIncome: Used for tax band calculations and as the base for adjusted net income
  // Adjusted net income (for PA taper) is calculated later after pension contributions
  const totalGrossIncome = employmentIncome + additionalIncome;

  // Monthly equivalents for payslip-style calculations
  const monthlyGrossSalary = totalGrossIncome / 12;
  const monthlyEmploymentIncome = employmentIncome / 12;

  // ---------------
  // 3. Calculate pre-tax deductions (pension and allowances)
  // ---------------

  // Calculate annual and monthly pension contribution
  let annualPensionContribution = 0;
  let monthlyPensionContribution = 0;

  if (input.pensionContribution > 0) {
    if (input.pensionContributionType === 'percentage') {
      // Input is validated at the boundary (Zod) to stay within 0-100%.
      // Percentage of PRIMARY employment salary (not other income sources)
      // Pension contributions are typically on employment earnings only
      annualPensionContribution = annualGrossSalary * (input.pensionContribution / 100);
      monthlyPensionContribution = annualPensionContribution / 12; // Derive from annual for consistency
    } else {
      // Fixed amount (normalize from input period to annual and monthly)
      const requestedAnnualPensionContribution = convertPeriodToAnnual(
        input.pensionContribution,
        input.payPeriod,
        hoursPerWeek,
      );
      annualPensionContribution = Math.min(requestedAnnualPensionContribution, annualGrossSalary);
      monthlyPensionContribution = annualPensionContribution / 12;
    }
  }

  // ---------------
  // 4. Calculate tax-free allowance (annual and monthly)
  // ---------------

  // Parse tax code using comprehensive parser that handles all HMRC code types
  // This correctly handles K-codes (negative allowance), BR/D0/D1/NT (band overrides), and emergency codes
  const taxCodeResult = parseTaxCode(taxCodeInput, taxRates.personalAllowance);
  let annualTaxFreeAmount = taxCodeResult.allowance;

  // Store band override for use in tax calculation section
  // BR = all at basic rate, D0 = all at higher rate, D1 = all at additional rate, NT = no tax
  const taxCodeBandOverride = taxCodeResult.bandOverride;

  // High Income Personal Allowance Reduction (HMRC "60% Tax Trap")
  // Above £100,000 ADJUSTED NET income, personal allowance is reduced by £1 for every £2 of income
  // This creates an effective 60% tax rate between £100k-£125k (40% income tax + 20% lost allowance)
  // IMPORTANT: Pension contributions reduce adjusted net income, so they can restore allowance
  const adjustedNetIncome = Math.max(0, totalGrossIncome - annualPensionContribution);
  if (adjustedNetIncome > taxRates.personalAllowanceReductionThreshold) {
    const reduction = calculateAllowanceReduction(
      adjustedNetIncome,
      annualTaxFreeAmount,
      taxRates.personalAllowanceReductionThreshold,
      taxRates.personalAllowanceReductionRate,
    );

    // Apply the reduction - personal allowance can be reduced to zero but not negative
    annualTaxFreeAmount -= reduction;

    // Example: £120,000 salary
    // Excess over £100,000 = £20,000
    // Reduction = £20,000 ÷ 2 = £10,000
    // New allowance = £12,570 - £10,000 = £2,570
    // At £125,140+, allowance becomes zero
  }

  // Blind Person's Allowance (additional allowance for registered blind)
  // This is an additional allowance that's added on top of the Personal Allowance
  // For 2024-25: £2,870, For 2025-26: £3,070
  if (input.isBlind) {
    annualTaxFreeAmount += taxRates.blindPersonsAllowance;
  }

  // NOTE: Age does NOT change the Personal Allowance. Age-related allowances were
  // abolished from 2016-17 (Finance Act 2015) — everyone gets the standard allowance
  // regardless of date of birth. Age only affects employee NI (see State Pension age
  // exemption in the NI section below).

  // Marriage Allowance (transferable allowance for married couples/civil partners)
  // CRITICAL FIX: Logic was backwards!
  // CORRECT RULES: The LOWER earner (earning < PA) transfers £1,260 to their partner
  // - The transferring partner must earn LESS than the Personal Allowance
  // - The receiving partner (user) must be a basic rate taxpayer
  // This saves up to £252/year (£1,260 at 20% basic rate)
  if (input.isMarried && input.partnerGrossWage >= 0) {
    // Find the threshold where "Higher rate" (40% or 42%) starts
    const higherRateBandIndex = taxRates.bands.findIndex((band) => band.rate >= 40);
    const prevBand = higherRateBandIndex > 0 ? taxRates.bands[higherRateBandIndex - 1] : null;
    const firstBand = taxRates.bands[0];
    const basicRateThreshold = prevBand?.threshold ?? firstBand?.threshold ?? 0;
    const higherRateThreshold = taxRates.personalAllowance + basicRateThreshold;

    // Check if USER can RECEIVE marriage allowance from their partner:
    // 1. Partner must earn LESS than personal allowance (they transfer it)
    // 2. User must earn MORE than personal allowance (they pay tax)
    // 3. User must be a basic rate taxpayer (not higher rate) - based on TOTAL income
    if (
      input.partnerGrossWage < taxRates.personalAllowance && // Partner earns LESS than PA
      totalGrossIncome > taxRates.personalAllowance && // User pays tax (total income)
      totalGrossIncome <= higherRateThreshold // User is basic rate taxpayer (total income)
    ) {
      // User RECEIVES the marriage allowance from their lower-earning partner
      annualTaxFreeAmount += taxRates.marriageAllowance;
    }
  }

  // Calculate monthly tax-free amount for payslip calculation.
  const monthlyTaxFreeAmount = getMonthlyPayrollFreePay(
    annualTaxFreeAmount,
    taxRates.personalAllowance,
    taxYear,
  );

  // ---------------
  // 5. Calculate adjusted salary and taxable income (annual and monthly)
  // ---------------

  // Adjusted salary (after pre-tax deductions - pension only)
  const monthlyTaxableAdjustedSalary = monthlyGrossSalary - monthlyPensionContribution;

  // HMRC manual PAYE tables use whole-pound taxable pay after pay adjustment.
  const monthlyTaxableIncome = Math.floor(
    Math.max(0, monthlyTaxableAdjustedSalary - monthlyTaxFreeAmount),
  );
  const annualTaxableIncome = monthlyTaxableIncome * 12;

  // ---------------
  // 6. Calculate income tax using bands (monthly calculation, annual storage)
  // ---------------

  let monthlyTax = 0;
  const taxBands: Array<{
    name: string;
    rate: number;
    amount: number; // Stored as annual for output
  }> = [];

  // If there's taxable income, calculate tax bands
  if (monthlyTaxableIncome > 0) {
    let remainingMonthlyIncome = monthlyTaxableIncome;

    // Handle special tax codes that override normal band calculations
    // These codes tax ALL income at a single rate, ignoring progressive bands.
    // The rate depends on the regime: rUK BR/D0/D1 map to basic/higher/additional,
    // while Scottish SBR/SD0/SD1/SD2/SD3 map to basic/intermediate/higher/advanced/top.
    // The regime comes from the CODE's prefix, not the region toggle — HMRC bakes
    // the regime into the code it issues (a bare D0 deducts rUK 40% wherever the
    // employee lives), which also keeps the calculator consistent with the decoder.
    // Rates are resolved from the year's band table so they stay single-sourced.
    // @see https://www.gov.uk/tax-codes/what-your-tax-code-means
    if (taxCodeBandOverride) {
      const override = resolveBandOverride(
        taxCodeBandOverride,
        hasScottishPrefix,
        hasScottishPrefix ? scottishRates.bands : standardRates.bands,
      );
      monthlyTax = roundToPence((monthlyTaxableIncome * override.rate) / 100);
      taxBands.push({
        name: override.name,
        rate: override.rate,
        amount: annualTaxableIncome, // All income taxed at this single rate
      });
    }
    // Normal progressive tax calculation (only if no band override)
    else {
      if (isScottish) {
        // Canonical policy thresholds are annual taxable-income upper bounds.
        // Period conversion and PAYE rounding stay outside the shared slicer.
        const calculation = sliceScottishTaxableIncome(
          monthlyTaxableIncome,
          taxRates.bands.map((band) => ({
            name: band.name,
            rate: band.rate,
            taxableIncomeUpperBound: getMonthlyPayrollBandThreshold(band.threshold),
          })),
        );
        monthlyTax = calculation.incomeTax;

        for (const slice of calculation.slices) {
          taxBands.push({
            name: slice.name,
            rate: slice.rate,
            amount: slice.taxableAmount * 12,
          });
        }
      } else {
        // STANDARD UK TAX CALCULATION ALGORITHM
        // Standard UK bands apply CUMULATIVELY above the personal allowance
        // This is the "traditional" system used in England, Wales, and Northern Ireland
        //
        // Key difference from Scottish: bands are "stacked" on top of each other
        // Example with £50,000 taxable income:
        // - First £37,700: 20% basic rate
        // - Next £12,300: 40% higher rate
        // Each band only applies to income WITHIN that band's range

        let previousMonthlyThreshold = 0; // Track cumulative band positions

        // Process each standard UK tax band sequentially
        for (let i = 0; i < taxRates.bands.length; i++) {
          const band = taxRates.bands[i];
          if (!band) continue;

          // Convert annual band threshold to the whole-pound monthly payroll threshold.
          const monthlyThreshold = getMonthlyPayrollBandThreshold(band.threshold);

          // Calculate the "width" of this tax band
          // This is how much income can be taxed at this band's rate
          // Example: Basic rate width = £3,141.67 - £0 = £3,141.67
          const monthlyBandWidth = monthlyThreshold - previousMonthlyThreshold;

          // Determine how much of the taxpayer's income falls into this band
          // Takes the minimum of:
          // 1. How much income is left to be taxed
          // 2. How much this band can accommodate
          const monthlyIncomeInBand = Math.min(remainingMonthlyIncome, monthlyBandWidth);

          // Only process bands that have taxable income
          if (monthlyIncomeInBand > 0) {
            // Apply this band's tax rate to the income portion within it
            // Example: £1,000 in basic rate band = £1,000 × 20% = £200 tax
            const monthlyTaxForBand = (monthlyIncomeInBand * band.rate) / 100;

            // Accumulate total monthly tax from all bands
            monthlyTax += monthlyTaxForBand;

            // Convert back to annual for results display consistency
            const annualIncomeInBand = monthlyIncomeInBand * 12;

            // Record this band's contribution for tax breakdown UI
            taxBands.push({
              name: band.name, // e.g., "Basic Rate (20%)", "Higher Rate (40%)"
              rate: band.rate, // e.g., 20, 40, 45
              amount: annualIncomeInBand, // Annual income amount taxed at this rate
            });

            // Remove processed income from remaining total
            // This ensures we don't double-tax the same income
            remainingMonthlyIncome -= monthlyIncomeInBand;
          }

          // Early exit optimization: if all income has been processed, stop
          // This prevents unnecessary loop iterations for lower earners
          if (remainingMonthlyIncome <= 0) break;

          // Update threshold for next band calculation
          // This builds the "cumulative" nature of standard UK bands
          previousMonthlyThreshold = monthlyThreshold;
        }
      }
    } // Close the else block for taxCodeBandOverride check
  }

  // Round monthly tax to pence for accuracy
  monthlyTax = roundToPence(monthlyTax);

  // Overriding limit: PAYE Regulations 2003 (SI 2003/2682) reg 2 caps the tax
  // deducted from a relevant payment at 50% of that payment. Originally a K-code
  // rule, it was extended to all tax codes from 6 April 2015 (SI 2014/2689).
  // The engine's payment base for the month is gross pay less pre-tax pension.
  // Floored to the penny: the deduction must never exceed the limit.
  const monthlyOverridingLimit =
    Math.floor(Math.max(0, monthlyTaxableAdjustedSalary) * 0.5 * 100) / 100;
  if (monthlyTax > monthlyOverridingLimit) {
    monthlyTax = monthlyOverridingLimit;
  }

  // Calculate annual tax (for output)
  const annualTax = monthlyTax * 12;

  // ---------------
  // 7. Calculate National Insurance contributions (monthly calculation)
  // ---------------
  //
  // IMPORTANT: NI is levied on EMPLOYMENT income only, NOT total income.
  // This is a fundamental HMRC rule - rental income, investment income, and
  // pension income are NOT subject to National Insurance contributions.
  //
  // We use monthlyEmploymentIncome (not monthlyGrossSalary which includes all sources)
  // to ensure NI is calculated correctly for people with multiple income types.
  //

  let monthlyNationalInsurance = 0;

  // Auto-detect state pension age for NI exemption
  // State Pension Age: 66 (current), rising to 67 by 2028
  // Source: https://www.gov.uk/state-pension-age
  const isOverStatePensionAge = input.age !== undefined && input.age >= 66;

  // Only calculate employee NI if not exempt
  // Exemptions:
  // - payNoNI flag: Manual override (e.g., other exemption reasons)
  // - NI Category 'C': Employees over State Pension age (employer still pays)
  // - Age >= 66: Automatic exemption at State Pension Age
  if (!input.payNoNI && input.niCategory !== 'C' && !isOverStatePensionAge) {
    const niRates = standardRates.nationalInsurance.employee[input.niCategory];
    const periodThresholds = PAYROLL_PERIOD_THRESHOLDS[taxYear].monthly;

    const monthlyPrimaryThreshold = periodThresholds.niPrimary;
    const monthlyUpperThreshold = periodThresholds.niUpper;

    // NI base: Employment income minus pension (salary sacrifice reduces NI liability)
    const monthlyTaxableAdjustedEmploymentIncome =
      monthlyEmploymentIncome - monthlyPensionContribution;

    // Primary threshold (lower rate)
    if (monthlyTaxableAdjustedEmploymentIncome > monthlyPrimaryThreshold) {
      const lowerAmount = Math.min(
        monthlyTaxableAdjustedEmploymentIncome - monthlyPrimaryThreshold,
        monthlyUpperThreshold - monthlyPrimaryThreshold,
      );
      monthlyNationalInsurance += (lowerAmount * niRates.primary.rate) / 100;
    }

    // Upper threshold (higher rate)
    if (monthlyTaxableAdjustedEmploymentIncome > monthlyUpperThreshold) {
      const upperAmount = monthlyTaxableAdjustedEmploymentIncome - monthlyUpperThreshold;
      monthlyNationalInsurance += (upperAmount * niRates.upper.rate) / 100;
    }
  }

  // Round monthly NI to pence for accuracy
  monthlyNationalInsurance = roundToPence(monthlyNationalInsurance);

  // Calculate annual NI (for output)
  const annualNationalInsurance = monthlyNationalInsurance * 12;

  // ---------------
  // 8. Calculate Employer's NI (monthly calculation)
  // ---------------

  let monthlyEmployerNI = 0;

  // Calculate employer's NI (even if employee is exempt)
  const employerRates = standardRates.nationalInsurance.employer[input.niCategory];

  // Convert employer threshold to monthly
  const monthlyEmployerThreshold = employerRates.secondary.threshold / 12;

  // Employer NI is calculated on employment income only (not rental, pension income, etc.)
  if (monthlyEmploymentIncome > monthlyEmployerThreshold) {
    monthlyEmployerNI =
      ((monthlyEmploymentIncome - monthlyEmployerThreshold) * employerRates.secondary.rate) / 100;
  }

  // Calculate annual employer NI (for output)
  const annualEmployerNI = monthlyEmployerNI * 12;

  // ---------------
  // 9. Calculate Student Loan repayments (monthly calculation)
  // ---------------
  //
  // IMPORTANT: Student Loan via PAYE is calculated on EMPLOYMENT income only.
  //
  // For employees with non-employment income (rental, dividends, investments):
  // - PAYE deducts SL based on employment earnings only (what we calculate here)
  // - Additional SL on other income is collected via Self Assessment tax return
  //
  // This is why we use monthlyEmploymentIncome, not monthlyGrossSalary.
  // If we used total income, we'd double-count income that HMRC handles via SA.
  //

  let monthlyStudentLoan = 0;

  // Calculate repayments for multiple student loans if selected
  // Each loan is calculated independently and summed (HMRC rules)
  if (Array.isArray(input.studentLoanPlans) && input.studentLoanPlans.length > 0) {
    for (const plan of input.studentLoanPlans) {
      const loanRates = standardRates.studentLoan[plan];

      // Convert annual threshold to monthly
      const monthlyLoanThreshold = loanRates.threshold / 12;

      // SL repayment = 9% (or 6% for PG) of employment income above threshold
      if (monthlyEmploymentIncome > monthlyLoanThreshold) {
        monthlyStudentLoan +=
          ((monthlyEmploymentIncome - monthlyLoanThreshold) * loanRates.rate) / 100;
      }
    }
  }

  // Round monthly student loan to pence for accuracy
  monthlyStudentLoan = roundToPence(monthlyStudentLoan);

  // Calculate annual student loan (for output)
  const annualStudentLoan = monthlyStudentLoan * 12;

  // ---------------
  // 10. Calculate Net Pay (monthly calculation)
  // ---------------

  // Non-taxable allowances (annual) - add to net pay only, not taxable pay.
  const monthlyNonTaxableAllowances = roundToPence((input.allowancesDeductions ?? 0) / 12);

  // Monthly net pay
  const monthlyNetPay =
    monthlyTaxableAdjustedSalary -
    monthlyTax -
    monthlyNationalInsurance -
    monthlyStudentLoan +
    monthlyNonTaxableAllowances;

  // Annual net pay (for output)
  const annualNetPay = monthlyNetPay * 12;

  // ---------------
  // 11. Format results for different pay periods
  // ---------------

  const periodsToCalculate: PayPeriod[] = [
    PERIODS.ANNUALLY,
    PERIODS.MONTHLY,
    PERIODS.FOUR_WEEKLY,
    PERIODS.FORTNIGHTLY,
    PERIODS.WEEKLY,
    PERIODS.DAILY,
    PERIODS.HOURLY,
  ];

  // Create formatted results for all periods
  const grossSalary: Record<PayPeriod, number> = {} as Record<PayPeriod, number>;
  const incomeTax: Record<PayPeriod, number> = {} as Record<PayPeriod, number>;
  const nationalInsuranceByPeriod: Record<PayPeriod, number> = {} as Record<PayPeriod, number>;
  const studentLoanByPeriod: Record<PayPeriod, number> = {} as Record<PayPeriod, number>;
  const pensionContributionByPeriod: Record<PayPeriod, number> = {} as Record<PayPeriod, number>;
  const netPay: Record<PayPeriod, number> = {} as Record<PayPeriod, number>;

  // Calculate values for each period using monthly values as the base
  for (const period of periodsToCalculate) {
    switch (period) {
      case PERIODS.ANNUALLY:
        // Use annual values calculated above
        grossSalary[period] = annualGrossSalary;
        incomeTax[period] = annualTax;
        nationalInsuranceByPeriod[period] = annualNationalInsurance;
        studentLoanByPeriod[period] = annualStudentLoan;
        pensionContributionByPeriod[period] = annualPensionContribution;
        netPay[period] = annualNetPay;
        break;

      case PERIODS.MONTHLY:
        // Use monthly values calculated above
        grossSalary[period] = monthlyGrossSalary;
        incomeTax[period] = monthlyTax;
        nationalInsuranceByPeriod[period] = monthlyNationalInsurance;
        studentLoanByPeriod[period] = monthlyStudentLoan;
        pensionContributionByPeriod[period] = monthlyPensionContribution;
        netPay[period] = monthlyNetPay;
        break;

      case PERIODS.FOUR_WEEKLY: {
        // Monthly * factor - averages to four-weekly
        const fourWeeklyFactor = PERIOD_CONVERSION_FACTORS.FOUR_WEEKLY;
        grossSalary[period] = roundToPence(monthlyGrossSalary * fourWeeklyFactor);
        incomeTax[period] = roundToPence(monthlyTax * fourWeeklyFactor);
        nationalInsuranceByPeriod[period] = roundToPence(
          monthlyNationalInsurance * fourWeeklyFactor,
        );
        studentLoanByPeriod[period] = roundToPence(monthlyStudentLoan * fourWeeklyFactor);
        pensionContributionByPeriod[period] = roundToPence(
          monthlyPensionContribution * fourWeeklyFactor,
        );
        netPay[period] = roundToPence(monthlyNetPay * fourWeeklyFactor);
        break;
      }

      case PERIODS.FORTNIGHTLY: {
        // Monthly * factor - averages to fortnightly
        const fortnightlyFactor = PERIOD_CONVERSION_FACTORS.FORTNIGHTLY;
        grossSalary[period] = roundToPence(monthlyGrossSalary * fortnightlyFactor);
        incomeTax[period] = roundToPence(monthlyTax * fortnightlyFactor);
        nationalInsuranceByPeriod[period] = roundToPence(
          monthlyNationalInsurance * fortnightlyFactor,
        );
        studentLoanByPeriod[period] = roundToPence(monthlyStudentLoan * fortnightlyFactor);
        pensionContributionByPeriod[period] = roundToPence(
          monthlyPensionContribution * fortnightlyFactor,
        );
        netPay[period] = roundToPence(monthlyNetPay * fortnightlyFactor);
        break;
      }

      case PERIODS.WEEKLY: {
        // Monthly * factor - averages to weekly
        const weeklyFactor = PERIOD_CONVERSION_FACTORS.WEEKLY;
        grossSalary[period] = roundToPence(monthlyGrossSalary * weeklyFactor);
        incomeTax[period] = roundToPence(monthlyTax * weeklyFactor);
        nationalInsuranceByPeriod[period] = roundToPence(monthlyNationalInsurance * weeklyFactor);
        studentLoanByPeriod[period] = roundToPence(monthlyStudentLoan * weeklyFactor);
        pensionContributionByPeriod[period] = roundToPence(
          monthlyPensionContribution * weeklyFactor,
        );
        netPay[period] = roundToPence(monthlyNetPay * weeklyFactor);
        break;
      }

      case PERIODS.DAILY: {
        // Monthly * factor - averages to daily (5 working days per week)
        const dailyFactor = PERIOD_CONVERSION_FACTORS.DAILY;
        grossSalary[period] = roundToPence(monthlyGrossSalary * dailyFactor);
        incomeTax[period] = roundToPence(monthlyTax * dailyFactor);
        nationalInsuranceByPeriod[period] = roundToPence(monthlyNationalInsurance * dailyFactor);
        studentLoanByPeriod[period] = roundToPence(monthlyStudentLoan * dailyFactor);
        pensionContributionByPeriod[period] = roundToPence(
          monthlyPensionContribution * dailyFactor,
        );
        netPay[period] = roundToPence(monthlyNetPay * dailyFactor);
        break;
      }

      case PERIODS.HOURLY:
        // Special case for hourly rate
        if (hoursPerWeek > 0) {
          // Monthly / (hours per week * average weeks per month)
          const monthlyHours = hoursPerWeek * AVERAGE_WEEKS_PER_MONTH;
          grossSalary[period] = roundToPence(monthlyGrossSalary / monthlyHours);
          incomeTax[period] = roundToPence(monthlyTax / monthlyHours);
          nationalInsuranceByPeriod[period] = roundToPence(monthlyNationalInsurance / monthlyHours);
          studentLoanByPeriod[period] = roundToPence(monthlyStudentLoan / monthlyHours);
          pensionContributionByPeriod[period] = roundToPence(
            monthlyPensionContribution / monthlyHours,
          );
          netPay[period] = roundToPence(monthlyNetPay / monthlyHours);
        } else {
          // Default to annual / (weeks * default hours) if no hours specified
          const annualDefaultHours = WEEKS_PER_YEAR * DEFAULT_HOURS_PER_WEEK;
          grossSalary[period] = roundToPence(annualGrossSalary / annualDefaultHours);
          incomeTax[period] = roundToPence(annualTax / annualDefaultHours);
          nationalInsuranceByPeriod[period] = roundToPence(
            annualNationalInsurance / annualDefaultHours,
          );
          studentLoanByPeriod[period] = roundToPence(annualStudentLoan / annualDefaultHours);
          pensionContributionByPeriod[period] = roundToPence(
            annualPensionContribution / annualDefaultHours,
          );
          netPay[period] = roundToPence(annualNetPay / annualDefaultHours);
        }
        break;
    }
  }

  // ---------------
  // 12. Return results
  // ---------------

  const results: TaxCalculationResults = {
    grossSalary,
    taxFreeAmount: annualTaxFreeAmount,
    taxFreeAmountByPeriod: {
      annually: annualTaxFreeAmount,
      monthly: monthlyTaxFreeAmount,
    },
    taxableIncome: annualTaxableIncome,
    incomeTax: incomeTax,
    nationalInsurance: nationalInsuranceByPeriod,
    studentLoan: studentLoanByPeriod,
    pensionContribution: pensionContributionByPeriod,
    employerNI: annualEmployerNI,
    netPay,
    taxBands,
    // Add income breakdown if multiple income sources exist
    incomeBreakdown:
      input.incomeSources && input.incomeSources.length > 0
        ? {
            employment: employmentIncome,
            nonEmployment: additionalIncome,
            total: totalGrossIncome,
          }
        : undefined,
  };

  return results;
}
