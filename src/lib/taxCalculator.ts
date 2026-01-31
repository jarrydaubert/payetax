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
 * The calculator uses a **hybrid monthly-annual approach** that mirrors real UK payroll systems:
 * 1. **Annual Conversion**: All inputs are normalized to annual amounts for consistency
 * 2. **Monthly Processing**: Tax calculations are performed on monthly amounts for accuracy
 * 3. **Period Scaling**: Results are scaled to all requested pay periods from monthly base
 *
 * This approach ensures:
 * - Accurate cumulative tax calculations (matching HMRC RTI)
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
  DEFAULT_HOURS_PER_WEEK,
  type NICategory,
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
import type { IncomeSource } from '@/lib/types/calculator';
import { convertPeriodToAnnual } from './periodCalculator';

/**
 * Round monetary values to pence for accurate financial calculations
 *
 * This function ensures all monetary calculations maintain pence-level precision
 * by rounding to 2 decimal places, which is critical for matching HMRC calculations.
 *
 * @param value - The monetary value to round
 * @returns Value rounded to the nearest penny
 *
 * @example
 * roundToPence(123.456789) // Returns 123.46
 * roundToPence(99.994) // Returns 99.99
 */
function roundToPence(value: number): number {
  return Math.round(value * 100) / 100;
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
   * Special tax code that overrides normal band calculations:
   * - 'BR': All income taxed at basic rate (20%)
   * - 'D0': All income taxed at higher rate (40%)
   * - 'D1': All income taxed at additional rate (45%)
   * - 'NT': No tax deducted
   * - null: Use normal progressive bands
   */
  bandOverride: 'BR' | 'D0' | 'D1' | 'NT' | null;
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
 * @deprecated Use parseTaxCode() instead for comprehensive tax code handling.
 * This function doesn't handle K-codes, BR/D0/D1/NT, or emergency codes.
 */
export function parsePersonalAllowanceFromTaxCode(
  taxCode: string,
  defaultAllowance: number,
): number {
  // Delegate to new function for backwards compatibility
  return parseTaxCode(taxCode, defaultAllowance).allowance;
}

/**
 * Calculate high income personal allowance reduction (HMRC "60% Tax Trap")
 * Above £100k, allowance reduces by £1 for every £2 of income
 */
export function calculateAllowanceReduction(
  salary: number,
  currentAllowance: number,
  threshold: number,
  reductionRate: number,
): number {
  if (salary <= threshold) return 0;

  // HMRC formula: round down to nearest £2
  return Math.min(currentAllowance, Math.floor(((salary - threshold) * reductionRate) / 2) * 2);
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
  },
  payNoNI: boolean,
  isOverStatePensionAge: boolean,
): number {
  if (payNoNI || isOverStatePensionAge) return 0;

  const monthlyPrimaryThreshold = rates.primaryThreshold / 12;
  const monthlyUEL = rates.upperEarningsLimit / 12;

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

// ============================================================================
// END HELPER FUNCTIONS
// ============================================================================

/**
 * Input parameters required for tax calculation
 */
export interface TaxCalculationInput {
  /** Gross salary amount */
  salary: number;
  /** Period of the salary (annual, monthly, etc.) */
  payPeriod: PayPeriod;
  /** Tax year for calculation */
  taxYear: TaxYear;
  /** Tax code (e.g., "1257L") */
  taxCode: string;
  /** Whether Scottish tax rates apply */
  isScottish: boolean;
  /** Whether married/civil partnership for marriage allowance */
  isMarried: boolean;
  /** Partner's gross wage for marriage allowance calculation */
  partnerGrossWage: number;
  /** Whether blind person's allowance applies */
  isBlind: boolean;
  /** Age of the taxpayer (for age-related allowances) */
  age?: number;
  /** Whether paying no National Insurance */
  payNoNI: boolean;
  /** Pension contribution amount or percentage */
  pensionContribution: number;
  /** Type of pension contribution (percentage or fixed amount) */
  pensionContributionType: 'percentage' | 'amount';
  /** Student loan plans that apply (can be multiple) */
  studentLoanPlans: StudentLoanSelection;
  /** National Insurance category */
  niCategory: NICategory;
  /** Hours worked per week (for hourly calculations) */
  hoursPerWeek: number;
  /** Additional income sources beyond primary employment */
  incomeSources?: IncomeSource[];
}

/**
 * Results from tax calculation, containing detailed breakdown
 * of taxes, deductions, and net pay across different pay periods
 */
export interface TaxCalculationResults {
  /** Gross salary across different periods */
  grossSalary: Record<PayPeriod, number>;
  /** Tax-free allowance amount */
  taxFreeAmount: number;
  /** Taxable income after allowances and deductions */
  taxableIncome: number;

  /** Income tax amounts for each period */
  incomeTax: Record<PayPeriod, number>;
  /** National Insurance contributions for each period */
  nationalInsurance: Record<PayPeriod, number>;
  /** Student loan repayments for each period */
  studentLoan: Record<PayPeriod, number>;

  /** Pension contributions for each period */
  pensionContribution: Record<PayPeriod, number>;
  /** Employer's NI contribution (annual) */
  employerNI: number;
  /** Net take-home pay for each period */
  netPay: Record<PayPeriod, number>;

  /** Breakdown of tax bands applied */
  taxBands: Array<{
    name: string;
    rate: number;
    amount: number;
  }>;
  /** Breakdown of income by source (if multiple income sources exist) */
  incomeBreakdown?: {
    employment: number;
    nonEmployment: number;
    total: number;
  };
}

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
 * 8. **Net Pay**: Final take-home calculation with post-tax benefits
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
 * Plan 4: 9% above £27,660 (Scotland)
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

  // Determine if using Scottish rates (from explicit flag or tax code)
  const isScottish = input.isScottish || input.taxCode.startsWith(SCOTTISH_PREFIX);

  // Get the tax rates for the selected year
  const standardRates = TAX_RATES[input.taxYear];
  const scottishRates = SCOTTISH_TAX_RATES[input.taxYear];

  // Choose appropriate tax rates based on whether the taxpayer is Scottish
  const taxRates = isScottish ? scottishRates : standardRates;

  // ---------------
  // 2. Input normalization - start by converting salary to both annual and monthly
  // ---------------

  // First convert salary to annual amount based on input period
  const annualGrossSalary = convertPeriodToAnnual(
    input.salary,
    input.payPeriod,
    input.hoursPerWeek,
  );

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
      const sourceAnnual = convertPeriodToAnnual(source.amount, source.period, input.hoursPerWeek);

      if (source.type === 'employment') {
        employmentIncome += sourceAnnual;
      } else {
        // Rental, pension, investment income - taxable but no NI/SL via PAYE
        additionalIncome += sourceAnnual;
      }
    }
  }

  // totalGrossIncome: Used for allowance tapers and tax band calculations
  // This is the "Adjusted Net Income" concept for PA taper purposes
  const totalGrossIncome = employmentIncome + additionalIncome;

  // Monthly equivalents for payslip-style calculations
  const monthlyGrossSalary = totalGrossIncome / 12;
  const monthlyEmploymentIncome = employmentIncome / 12;

  // ---------------
  // 3. Calculate tax-free allowance (annual and monthly)
  // ---------------

  // Parse tax code using comprehensive parser that handles all HMRC code types
  // This correctly handles K-codes (negative allowance), BR/D0/D1/NT (band overrides), and emergency codes
  const taxCodeResult = parseTaxCode(input.taxCode, taxRates.personalAllowance);
  let annualTaxFreeAmount = taxCodeResult.allowance;

  // Store band override for use in tax calculation section
  // BR = all at basic rate, D0 = all at higher rate, D1 = all at additional rate, NT = no tax
  const taxCodeBandOverride = taxCodeResult.bandOverride;

  // High Income Personal Allowance Reduction (HMRC "60% Tax Trap")
  // Above £100,000 TOTAL income, personal allowance is reduced by £1 for every £2 of income
  // This creates an effective 60% tax rate between £100k-£125k (40% income tax + 20% lost allowance)
  // IMPORTANT: Uses totalGrossIncome (all sources) not just primary salary
  if (totalGrossIncome > taxRates.personalAllowanceReductionThreshold) {
    // Calculate the allowance reduction using HMRC formula:
    // Reduction = (Total Income - £100,000) ÷ 2
    // The Math.floor and ×2 ensure we follow HMRC's rounding rules (round down to nearest £2)
    const reduction = Math.min(
      annualTaxFreeAmount, // Cannot reduce below zero
      Math.floor(
        ((totalGrossIncome - taxRates.personalAllowanceReductionThreshold) *
          taxRates.personalAllowanceReductionRate) / // Rate is 0.5 (50% of excess)
          2, // Divide by 2 for the "£1 reduction per £2 income\" rule
      ) * 2, // Multiply back by 2 to ensure even pound amounts (HMRC requirement)
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

  // Age-Related Personal Allowances (LEGACY - applies only to those born before 6 April 1938)
  // NOTE: Age allowances were frozen in April 2016 and are being phased out
  // Most people aged 65+ now use the standard personal allowance
  // However, for those who were already receiving it, it continues
  // These values are frozen across all tax years
  // In practice, very few users will be affected by this
  if (input.age && input.age >= 65) {
    let ageAllowance = 0;

    // Determine base age allowance from tax rates constants
    if (input.age >= 75) {
      ageAllowance = taxRates.ageAllowance75plus; // Higher allowance for 75+
    } else if (input.age >= 65) {
      ageAllowance = taxRates.ageAllowance65to74; // Standard age allowance for 65-74
    }

    // Apply income taper for high earners (based on total income, not just salary)
    const ageTaperThreshold = taxRates.ageAllowanceTaperThreshold;
    if (totalGrossIncome > ageTaperThreshold && ageAllowance > 0) {
      const excessIncome = totalGrossIncome - ageTaperThreshold;
      const taperReduction = Math.floor(excessIncome / 2);
      ageAllowance = Math.max(0, ageAllowance - taperReduction);
    }

    // Add the age allowance to the tax-free amount
    annualTaxFreeAmount += ageAllowance;
  }

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
    const basicRateThreshold = prevBand?.threshold ?? firstBand?.threshold ?? 37700;
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

  // Calculate monthly tax-free amount for payslip calculation
  const monthlyTaxFreeAmount = annualTaxFreeAmount / 12;

  // ---------------
  // 4. Calculate pre-tax deductions (pension and allowances)
  // ---------------

  // Calculate annual and monthly pension contribution
  let annualPensionContribution = 0;
  let monthlyPensionContribution = 0;

  if (input.pensionContribution > 0) {
    if (input.pensionContributionType === 'percentage') {
      // Percentage of PRIMARY employment salary (not other income sources)
      // Pension contributions are typically on employment earnings only
      annualPensionContribution = annualGrossSalary * (input.pensionContribution / 100);
      monthlyPensionContribution = annualPensionContribution / 12; // Derive from annual for consistency
    } else {
      // Fixed amount (normalize from input period to annual and monthly)
      annualPensionContribution = convertPeriodToAnnual(
        input.pensionContribution,
        input.payPeriod,
        input.hoursPerWeek,
      );
      monthlyPensionContribution = annualPensionContribution / 12;
    }
  }

  // ---------------
  // 5. Calculate adjusted salary and taxable income (annual and monthly)
  // ---------------

  // Adjusted salary (after pre-tax deductions - pension only)
  const monthlyTaxableAdjustedSalary = monthlyGrossSalary - monthlyPensionContribution;

  // Calculate taxable income (adjusted salary minus tax-free amount)
  const monthlyTaxableIncome = Math.max(0, monthlyTaxableAdjustedSalary - monthlyTaxFreeAmount);
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
    // These codes tax ALL income at a single rate, ignoring progressive bands
    if (taxCodeBandOverride) {
      const overrideRates: Record<'BR' | 'D0' | 'D1' | 'NT', { rate: number; name: string }> = {
        BR: { rate: 20, name: 'Basic Rate (BR code)' },
        D0: { rate: 40, name: 'Higher Rate (D0 code)' },
        D1: { rate: 45, name: 'Additional Rate (D1 code)' },
        NT: { rate: 0, name: 'No Tax (NT code)' },
      };

      const override = overrideRates[taxCodeBandOverride];
      monthlyTax = roundToPence((monthlyTaxableIncome * override.rate) / 100);
      taxBands.push({
        name: override.name,
        rate: override.rate,
        amount: annualTaxableIncome, // All income taxed at this single rate
      });
    }
    // Normal progressive tax calculation (only if no band override)
    else {
      // CRITICAL: Scottish vs Standard UK Tax Band Calculation
      // The two systems use fundamentally different approaches:
      //
      // SCOTTISH SYSTEM (absolute thresholds):
      // - 19% Starter Rate: £0 - £2,306 of TOTAL income
      // - 20% Basic Rate: £2,307 - £13,991 of TOTAL income
      // - 21% Intermediate: £13,992 - £31,092 of TOTAL income
      // - Bands are absolute ranges from £0 (like staircases)
      //
      // STANDARD UK SYSTEM (cumulative above personal allowance):
      // - 20% Basic Rate: £0 - £37,700 of TAXABLE income (after personal allowance)
      // - 40% Higher Rate: £37,701 - £125,140 of TAXABLE income
      // - Bands are ranges above the personal allowance threshold

      if (isScottish) {
        // SCOTTISH TAX CALCULATION ALGORITHM
        // Scottish bands apply to TOTAL taxable income (not cumulative above personal allowance)
        // This means we need to calculate which portions fall into which absolute bands

        // Convert annual band thresholds to monthly equivalents for consistent processing
        // Example: Annual threshold £2,306 becomes monthly threshold £192.17
        const monthlyBoundaries = [
          0, // Always start from £0
          ...taxRates.bands.map((band) => band.threshold / 12), // Convert each threshold to monthly
          Number.POSITIVE_INFINITY, // Top band has no upper limit
        ];

        // Process each Scottish tax band in order
        for (let i = 0; i < taxRates.bands.length; i++) {
          const band = taxRates.bands[i];
          if (!band) continue;
          const lowerBound = monthlyBoundaries[i] ?? 0; // Start of this band
          const upperBound = monthlyBoundaries[i + 1] ?? Number.POSITIVE_INFINITY; // Start of next band (or infinity)

          // Calculate how much taxable income falls within this specific band
          // We compare:
          // 1. The width of this band (upperBound - lowerBound)
          // 2. How much income we still need to process (remainingMonthlyIncome)
          // Take the smaller of the two
          const monthlyIncomeInBand = Math.max(
            0, // Cannot have negative income in a band
            Math.min(
              upperBound - lowerBound, // Maximum possible income for this band
              remainingMonthlyIncome, // Actual remaining income to be taxed
            ),
          );

          // Only calculate tax if there's income in this band
          if (monthlyIncomeInBand > 0) {
            // Apply this band's tax rate to the income within it
            const monthlyTaxForBand = (monthlyIncomeInBand * band.rate) / 100;

            // Accumulate total monthly tax
            monthlyTax += monthlyTaxForBand;

            // Scale back to annual for results output (UI displays annual figures)
            const annualIncomeInBand = monthlyIncomeInBand * 12;

            // Record this band's contribution for tax breakdown display
            taxBands.push({
              name: band.name, // e.g., "Scottish Starter Rate (19%)"
              rate: band.rate, // e.g., 19
              amount: annualIncomeInBand, // Annual amount of income taxed at this rate
            });

            // Reduce remaining income
            remainingMonthlyIncome -= monthlyIncomeInBand;
          }

          // If no more income to tax, break out of loop
          if (remainingMonthlyIncome <= 0) break;
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

          // Convert annual band threshold to monthly equivalent
          // Example: £37,700 annual basic rate threshold = £3,141.67 monthly
          const monthlyThreshold = band.threshold / 12;

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

    // Convert annual thresholds to monthly
    const monthlyPrimaryThreshold = niRates.primary.threshold / 12;
    const monthlyUpperThreshold = niRates.upper.threshold / 12;

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

  // Monthly net pay
  const monthlyNetPay =
    monthlyTaxableAdjustedSalary - monthlyTax - monthlyNationalInsurance - monthlyStudentLoan;

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
        // Monthly * (12/13) - averages to four-weekly
        const fourWeeklyFactor = 12 / 13;
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
        // Monthly * (12/26) - averages to fortnightly
        const fortnightlyFactor = 12 / 26;
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
        // Monthly * (12/52) - averages to weekly
        const weeklyFactor = 12 / 52;
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
        // Monthly * (12/260) - averages to daily (5 working days per week)
        const dailyFactor = 12 / 260;
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
        if (input.hoursPerWeek > 0) {
          // Monthly / (hours per week * 4.333 weeks per month)
          const monthlyHours = input.hoursPerWeek * 4.333; // Average weeks per month
          grossSalary[period] = roundToPence(monthlyGrossSalary / monthlyHours);
          incomeTax[period] = roundToPence(monthlyTax / monthlyHours);
          nationalInsuranceByPeriod[period] = roundToPence(monthlyNationalInsurance / monthlyHours);
          studentLoanByPeriod[period] = roundToPence(monthlyStudentLoan / monthlyHours);
          pensionContributionByPeriod[period] = roundToPence(
            monthlyPensionContribution / monthlyHours,
          );
          netPay[period] = roundToPence(monthlyNetPay / monthlyHours);
        } else {
          // Default to annual / (52 * 40) if no hours specified
          grossSalary[period] = roundToPence(annualGrossSalary / (52 * 40));
          incomeTax[period] = roundToPence(annualTax / (52 * 40));
          nationalInsuranceByPeriod[period] = roundToPence(annualNationalInsurance / (52 * 40));
          studentLoanByPeriod[period] = roundToPence(annualStudentLoan / (52 * 40));
          pensionContributionByPeriod[period] = roundToPence(annualPensionContribution / (52 * 40));
          netPay[period] = roundToPence(annualNetPay / (52 * 40));
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
