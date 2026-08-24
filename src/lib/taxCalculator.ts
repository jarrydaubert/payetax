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
 * 2. **Payroll Processing**: Tax and NI use the month-1 model; Student Loans use
 *    monthly or weekly-family thresholds according to the input pay period
 * 3. **Period Scaling**: Results are reconciled through annual/monthly output bases
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
  DEFAULT_TAX_CODE,
  type PayPeriod,
  PERIODS,
  type StudentLoanPlan,
} from '@/constants/taxRates';
import type { TaxCalculationInput, TaxCalculationResults } from '@/lib/types/calculator';
import { convertAnnualToPeriod, convertMonthlyToPeriod } from './periodCalculator';
import {
  calculateMonth1ProgressiveIncomeTax,
  getExactMonth1Threshold,
  getWholePoundMonth1TaxablePay,
  roundDownPayeTaxToPence,
} from './tax/month1IncomeTax';
import {
  getClass1PeriodThresholds,
  getEmployeeClass1MonthSegments,
  isEmployeeNIExempt,
  sliceClass1EmployeeEarnings,
  sliceClass1EmployerEarnings,
} from './tax/nationalInsurance';
import { derivePayePayBasis } from './tax/payePayBasis';
import { sliceRukTaxableIncome } from './tax/rukIncomeTax';
import { sliceScottishTaxableIncome } from './tax/scottishIncomeTax';
import {
  normalizeStudentLoanPlansForCalculation,
  type StudentLoanPlanPolicy,
  sliceStudentLoanRepayments,
} from './tax/studentLoan';
import {
  getMonthlyKCodeAdditionalPay,
  getMonthlyTaxCodeFreePay,
  getTaxCodeRegionOverride,
  parseTaxCode,
} from './tax/taxCode';
import { selectTaxPolicy } from './tax/taxPolicy';
import { roundToPence } from './tax/utils';

export type { TaxCalculationInput, TaxCalculationResults } from '@/lib/types/calculator';

function getMonthlyPayrollFreePay(annualTaxFreeAmount: number): number {
  if (annualTaxFreeAmount < 0) {
    // HMRC Tables A derives K-code additional pay from the code number, not
    // by simply dividing its public number×10 explanation by 12. The lookup
    // includes the code-range rounding and treats each complete 500 block
    // separately. Returning a negative value lets the common subtraction
    // below add this period-specific amount to taxable pay.
    return -getMonthlyKCodeAdditionalPay(Math.abs(annualTaxFreeAmount));
  }

  if (annualTaxFreeAmount === 0) {
    return 0;
  }

  // Both an explicit numeric code and a policy-derived amount use one HMRC
  // Tables A basis. Policy amounts first become a whole-number code by dropping
  // the final digit, matching HMRC's published code-construction rule.
  return getMonthlyTaxCodeFreePay(annualTaxFreeAmount);
}

// ============================================================================
// HELPER FUNCTIONS - Extracted for maintainability
// Exported for testing. Used by calculateTax() for consistent behavior.
// ============================================================================

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

interface StudentLoanEmployment {
  earnings: number;
  payPeriod: PayPeriod;
}

function calculateAnnualStudentLoanForEmployment(
  employment: StudentLoanEmployment,
  hoursPerWeek: number,
  plans: readonly StudentLoanPlan[],
  annualPolicy: Readonly<Record<StudentLoanPlan, StudentLoanPlanPolicy>>,
): number {
  const payPeriod = Object.values(PERIODS).includes(employment.payPeriod)
    ? employment.payPeriod
    : PERIODS.ANNUALLY;
  const usesMonthlyThreshold = payPeriod === PERIODS.ANNUALLY || payPeriod === PERIODS.MONTHLY;
  const thresholdPeriodsPerYear = usesMonthlyThreshold ? 12 : 52;

  let calculationEarnings = employment.earnings;
  let calculationPeriodsPerYear = thresholdPeriodsPerYear;

  switch (payPeriod) {
    case PERIODS.ANNUALLY:
      calculationEarnings = employment.earnings / 12;
      break;
    case PERIODS.FOUR_WEEKLY:
      calculationEarnings = employment.earnings / 4;
      break;
    case PERIODS.FORTNIGHTLY:
      calculationEarnings = employment.earnings / 2;
      break;
    case PERIODS.DAILY:
      // HMRC uses the weekly threshold, unchanged, for an NI earnings period
      // shorter than seven days.
      calculationPeriodsPerYear = 260;
      break;
    case PERIODS.HOURLY:
      // The hourly input is a wage unit, not an NI earnings period. Model the
      // user's stated weekly hours as weekly-paid earnings.
      calculationEarnings = employment.earnings * hoursPerWeek;
      calculationPeriodsPerYear = 52;
      break;
    default:
      break;
  }

  const periodPolicy: Partial<Record<StudentLoanPlan, StudentLoanPlanPolicy>> = {};
  for (const plan of plans) {
    const loanRates = annualPolicy[plan];
    periodPolicy[plan] = {
      threshold: Math.floor((loanRates.threshold / thresholdPeriodsPerYear) * 100) / 100,
      rate: loanRates.rate,
    };
  }

  const normalizedPlans = normalizeStudentLoanPlansForCalculation(plans, periodPolicy);
  const repayments = sliceStudentLoanRepayments(
    calculationEarnings,
    normalizedPlans,
    periodPolicy,
  ).repayments;
  const wholePoundsPerCalculationPeriod = repayments.reduce(
    (total, repayment) => total + Math.floor(repayment.repayment),
    0,
  );

  return wholePoundsPerCalculationPeriod * calculationPeriodsPerYear;
}

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

  const payBasis = derivePayePayBasis(input);
  const { hoursPerWeek } = payBasis;
  const suppliedTaxCode = typeof input.taxCode === 'string' ? input.taxCode.trim() : '';
  const taxCodeInput = suppliedTaxCode || DEFAULT_TAX_CODE;

  // Resolve the supported tax year and select both policy records through the
  // single tax-domain selector (normalises short/long forms, falls back to the
  // current year for missing/unsupported input).
  const { taxYear, ruk: standardRates, scottish: scottishRates } = selectTaxPolicy(input.taxYear);

  // Prefix classification belongs to the shared tax-code grammar. A valid Welsh
  // C-prefix takes precedence over a region toggle; a valid Scottish S-prefix
  // selects Scottish rates. Malformed partial codes must not change the region.
  const taxCodeResult = parseTaxCode(taxCodeInput, standardRates.personalAllowance);
  const codeRegionOverride = getTaxCodeRegionOverride(taxCodeResult);
  const isScottish =
    codeRegionOverride === 'Scotland' || (codeRegionOverride === null && input.isScottish);

  // Choose appropriate tax rates based on whether the taxpayer is Scottish
  const taxRates = isScottish ? scottishRates : standardRates;

  // ---------------
  // 2. Calculate tax-free allowance (annual and monthly)
  // ---------------

  const hasExplicitValidTaxCode = suppliedTaxCode !== '' && taxCodeResult.isValid;

  // Independently derive the policy-only amount even when a valid code is
  // supplied. An explicit HMRC code owns source-specific coding adjustments;
  // the policy amount is retained only to disclose the basis and any divergence.
  let policyDerivedTaxFreeAmount = taxRates.personalAllowance;

  // Store band override for use in tax calculation section
  // BR = all at basic rate, D0 = all at higher rate, D1 = all at additional rate, NT = no tax
  const taxCodeBandOverride = taxCodeResult.bandOverride;

  // High Income Personal Allowance Reduction (HMRC "60% Tax Trap")
  // Above £100,000 ADJUSTED NET income, personal allowance is reduced by £1 for every £2 of income
  // This creates an effective 60% tax rate between £100k-£125k (40% income tax + 20% lost allowance)
  // IMPORTANT: Pension contributions reduce adjusted net income, so they can restore allowance
  const adjustedNetIncome = payBasis.adjustedNetIncome.annual;
  if (
    policyDerivedTaxFreeAmount > 0 &&
    adjustedNetIncome > taxRates.personalAllowanceReductionThreshold
  ) {
    const reduction = calculateAllowanceReduction(
      adjustedNetIncome,
      policyDerivedTaxFreeAmount,
      taxRates.personalAllowanceReductionThreshold,
      taxRates.personalAllowanceReductionRate,
    );

    // Apply the reduction - personal allowance can be reduced to zero but not negative
    policyDerivedTaxFreeAmount -= reduction;

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
    policyDerivedTaxFreeAmount += taxRates.blindPersonsAllowance;
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
  let policyIncludesMarriageAllowance = false;
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
      payBasis.totalGrossIncome.annual > taxRates.personalAllowance && // User pays tax (total income)
      payBasis.totalGrossIncome.annual <= higherRateThreshold // User is basic rate taxpayer (total income)
    ) {
      // User RECEIVES the marriage allowance from their lower-earning partner
      policyDerivedTaxFreeAmount += taxRates.marriageAllowance;
      policyIncludesMarriageAllowance = true;
    }
  }

  // Use the shared interpretation for supported explicit tax-code forms,
  // including K codes and flat-rate overrides. With no usable explicit code,
  // use the independently derived policy amount above.
  const annualTaxFreeAmount = hasExplicitValidTaxCode
    ? taxCodeResult.allowance
    : policyDerivedTaxFreeAmount;

  // Calculate monthly tax-free amount for payslip calculation.
  const monthlyTaxFreeAmount = getMonthlyPayrollFreePay(annualTaxFreeAmount);

  // ---------------
  // 3. Calculate adjusted salary and taxable income (annual and monthly)
  // ---------------

  // Adjusted salary (after pre-tax deductions - pension only)
  const monthlyTaxableAdjustedSalary = payBasis.payeAdjustedPayment.monthly;

  // HMRC first retains taxable pay U (including pence) to select a formula via
  // Cvalue/SCvalue, then rounds U down to whole-pound T inside that formula.
  const unroundedMonthlyTaxableIncome = Math.max(
    0,
    monthlyTaxableAdjustedSalary - monthlyTaxFreeAmount,
  );
  const monthlyTaxableIncome = getWholePoundMonth1TaxablePay(unroundedMonthlyTaxableIncome);
  const annualTaxableIncome = monthlyTaxableIncome * 12;

  // ---------------
  // 4. Calculate income tax using bands (monthly calculation, annual storage)
  // ---------------

  let monthlyTax = 0;
  const taxBands: Array<{
    name: string;
    rate: number;
    amount: number; // Stored as annual for output
  }> = [];

  // If there's taxable income, calculate tax bands
  if (monthlyTaxableIncome > 0) {
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
        taxCodeResult.isScottish,
        taxCodeResult.isScottish ? scottishRates.bands : standardRates.bands,
      );
      monthlyTax = (monthlyTaxableIncome * override.rate) / 100;
      taxBands.push({
        name: override.name,
        rate: override.rate,
        amount: annualTaxableIncome, // All income taxed at this single rate
      });
    }
    // Normal progressive tax calculation (only if no band override)
    else {
      const month1Calculation = calculateMonth1ProgressiveIncomeTax(
        unroundedMonthlyTaxableIncome,
        taxRates.bands.map((band) => ({
          rate: band.rate,
          taxableIncomeUpperBound: band.threshold,
        })),
      );
      monthlyTax = month1Calculation.incomeTaxAtFourDecimals;

      if (isScottish) {
        // The shared slicer supplies result-band allocation only. The PAYE tax
        // amount above comes from HMRC's separate formula-selection routine.
        const calculation = sliceScottishTaxableIncome(
          monthlyTaxableIncome,
          taxRates.bands.map((band) => ({
            name: band.name,
            rate: band.rate,
            taxableIncomeUpperBound: getExactMonth1Threshold(band.threshold),
          })),
        );

        for (const slice of calculation.slices) {
          taxBands.push({
            name: slice.name,
            rate: slice.rate,
            amount: roundToPence(slice.taxableAmount * 12),
          });
        }
      } else {
        // The shared slicer supplies result-band allocation only. The PAYE tax
        // amount above comes from HMRC's separate formula-selection routine.
        const calculation = sliceRukTaxableIncome(
          monthlyTaxableIncome,
          taxRates.bands.map((band) => ({
            name: band.name,
            rate: band.rate,
            taxableIncomeUpperBound: getExactMonth1Threshold(band.threshold),
          })),
        );

        for (const slice of calculation.slices) {
          taxBands.push({
            name: slice.name,
            rate: slice.rate,
            amount: roundToPence(slice.taxableAmount * 12),
          });
        }
      }
    } // Close the else block for taxCodeBandOverride check
  }

  // HMRC's computerised PAYE routine rounds tax due down to the penny for
  // rUK, Welsh and Scottish calculations alike.
  monthlyTax = roundDownPayeTaxToPence(monthlyTax);

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
  // 5. Calculate National Insurance contributions (monthly calculation)
  // ---------------
  //
  // IMPORTANT: NI is levied on EMPLOYMENT income only, NOT total income.
  // This is a fundamental HMRC rule - rental income, investment income, and
  // pension income are NOT subject to National Insurance contributions.
  //
  // We use the NI-able employment basis (not total gross, which includes all sources)
  // to ensure NI is calculated correctly for people with multiple income types.
  //

  // Employee NI is exempt for payNoNI, category C, or State Pension age.
  // Employer NI below is charged regardless.
  const employeeNIExempt = isEmployeeNIExempt({
    age: input.age,
    niCategory: input.niCategory,
    payNoNI: input.payNoNI,
  });

  // Where a primary rate changed mid-year, the year splits into rate segments by
  // tax month. Each segment is rounded as its own payroll month and multiplied by
  // the months it covers, so no rate is averaged across the year. Single-rate
  // years return one 12-month segment, which reduces to the long-standing
  // `roundToPence(monthly) * 12` arithmetic exactly. Effective dates live in the
  // canonical policy record.
  let annualNationalInsurance = 0;

  if (!employeeNIExempt) {
    const periodThresholds = getClass1PeriodThresholds(taxYear, input.niCategory, PERIODS.MONTHLY);
    const upperRate = standardRates.nationalInsurance.employee[input.niCategory].upper.rate;

    // NI base: Employment income minus pension (salary sacrifice reduces NI liability)
    for (const segment of getEmployeeClass1MonthSegments(taxYear, input.niCategory)) {
      const segmentMonthlyNI = roundToPence(
        sliceClass1EmployeeEarnings(payBasis.niableEmploymentEarnings.monthly, {
          primaryThreshold: periodThresholds.primary,
          upperEarningsLimit: periodThresholds.upper,
          primaryRate: segment.rate,
          upperRate,
        }).employeeNI,
      );

      annualNationalInsurance += segmentMonthlyNI * segment.months;
    }
  }

  // Monthly NI drives net pay and every period conversion below. For a year with
  // one rate this returns the same figure the segment loop rounded.
  const monthlyNationalInsurance = roundToPence(annualNationalInsurance / 12);

  // ---------------
  // 6. Calculate Employer's NI (monthly calculation)
  // ---------------

  // Employer NI is charged even when the employee is exempt (e.g. State Pension age).
  // The monthly secondary threshold is HMRC's published period figure, which is not
  // the annual threshold divided by 12; both live in the canonical policy record.
  // Employer NI is calculated on employment income only (not rental, pension income, etc.)
  const employerRates = standardRates.nationalInsurance.employer[input.niCategory];
  const monthlyEmployerNI = sliceClass1EmployerEarnings(payBasis.totalEmploymentGross.monthly, {
    secondaryThreshold: getClass1PeriodThresholds(taxYear, input.niCategory, PERIODS.MONTHLY)
      .secondary,
    secondaryRate: employerRates.secondary.rate,
  }).employerNI;

  // Calculate annual employer NI (for output). Rounded per month before scaling,
  // matching both real payroll and the employee path above, which rounds each
  // payroll month before multiplying by the months in its rate segment.
  const annualEmployerNI = roundToPence(roundToPence(monthlyEmployerNI) * 12);

  // ---------------
  // 7. Calculate Student Loan repayments (monthly calculation)
  // ---------------
  //
  // IMPORTANT: Student Loan via PAYE is calculated on EMPLOYMENT income only.
  //
  // For employees with non-employment income (rental, dividends, investments):
  // - PAYE deducts SL based on employment earnings only (what we calculate here)
  // - Additional SL on other income is collected via Self Assessment tax return
  //
  // This is why we use the Student Loan employment basis, not total gross.
  // Using total income would double-count income that HMRC handles via SA.
  //

  let annualStudentLoan = 0;

  if (Array.isArray(input.studentLoanPlans) && input.studentLoanPlans.length > 0) {
    const primaryStudentLoanEarnings = convertAnnualToPeriod(
      payBasis.studentLoanEmploymentEarnings.annual,
      input.payPeriod,
      payBasis.hoursPerWeek,
    );
    annualStudentLoan = calculateAnnualStudentLoanForEmployment(
      {
        earnings: primaryStudentLoanEarnings,
        payPeriod: input.payPeriod,
      },
      payBasis.hoursPerWeek,
      input.studentLoanPlans,
      standardRates.studentLoan,
    );

    // Employers ordinarily calculate Student Loan deductions independently.
    // Additional employment sources therefore receive their own threshold
    // calculation instead of being combined with the primary employment.
    for (const source of input.incomeSources ?? []) {
      if (source.type !== 'employment') continue;

      annualStudentLoan += calculateAnnualStudentLoanForEmployment(
        {
          earnings: source.amount,
          payPeriod: source.period,
        },
        payBasis.hoursPerWeek,
        input.studentLoanPlans,
        standardRates.studentLoan,
      );
    }
  }

  // The engine's common output basis remains monthly. The annual figure above
  // preserves whole-pound deductions in each employment's actual pay period
  // before conversion to the other display periods.
  const monthlyStudentLoan = annualStudentLoan / 12;

  // ---------------
  // 8. Calculate Net Pay (monthly calculation)
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
  // 9. Format results for different pay periods
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
        grossSalary[period] = payBasis.primaryEmploymentGross.annual;
        incomeTax[period] = annualTax;
        nationalInsuranceByPeriod[period] = annualNationalInsurance;
        studentLoanByPeriod[period] = annualStudentLoan;
        pensionContributionByPeriod[period] = payBasis.salarySacrificePensionDeduction.annual;
        netPay[period] = annualNetPay;
        break;

      case PERIODS.MONTHLY:
        // Use monthly values calculated above
        grossSalary[period] = payBasis.totalGrossIncome.monthly;
        incomeTax[period] = monthlyTax;
        nationalInsuranceByPeriod[period] = monthlyNationalInsurance;
        studentLoanByPeriod[period] = monthlyStudentLoan;
        pensionContributionByPeriod[period] = payBasis.salarySacrificePensionDeduction.monthly;
        netPay[period] = monthlyNetPay;
        break;

      case PERIODS.FOUR_WEEKLY:
      case PERIODS.FORTNIGHTLY:
      case PERIODS.WEEKLY:
      case PERIODS.DAILY:
      case PERIODS.HOURLY:
        grossSalary[period] = roundToPence(
          convertMonthlyToPeriod(payBasis.totalGrossIncome.monthly, period, hoursPerWeek),
        );
        incomeTax[period] = roundToPence(convertMonthlyToPeriod(monthlyTax, period, hoursPerWeek));
        nationalInsuranceByPeriod[period] = roundToPence(
          convertMonthlyToPeriod(monthlyNationalInsurance, period, hoursPerWeek),
        );
        studentLoanByPeriod[period] = roundToPence(
          convertMonthlyToPeriod(monthlyStudentLoan, period, hoursPerWeek),
        );
        pensionContributionByPeriod[period] = roundToPence(
          convertMonthlyToPeriod(
            payBasis.salarySacrificePensionDeduction.monthly,
            period,
            hoursPerWeek,
          ),
        );
        netPay[period] = roundToPence(convertMonthlyToPeriod(monthlyNetPay, period, hoursPerWeek));
        break;
    }
  }

  // ---------------
  // 10. Return results
  // ---------------

  const results: TaxCalculationResults = {
    grossSalary,
    taxFreeAmount: annualTaxFreeAmount,
    taxFreeAmountByPeriod: {
      annually: annualTaxFreeAmount,
      monthly: monthlyTaxFreeAmount,
    },
    taxCodeBasis: {
      kind: hasExplicitValidTaxCode
        ? 'supplied-code'
        : suppliedTaxCode
          ? 'invalid-code-fallback'
          : 'policy-derived',
      appliedCode: hasExplicitValidTaxCode ? taxCodeResult.normalizedCode : null,
      policyDerivedTaxFreeAmount,
      suppliedTaxFreeAmount:
        hasExplicitValidTaxCode &&
        (taxCodeResult.classification === 'standard' ||
          taxCodeResult.classification === 'zero-allowance')
          ? Math.max(0, taxCodeResult.allowance)
          : undefined,
      periodAdjustment:
        taxCodeResult.classification === 'k-code'
          ? 'additional-pay'
          : hasExplicitValidTaxCode &&
              (taxCodeResult.classification === 'flat-rate' ||
                taxCodeResult.classification === 'no-tax' ||
                taxCodeResult.classification === 'zero-allowance')
            ? 'none'
            : 'free-pay',
      ignoredAdjustments: hasExplicitValidTaxCode
        ? [
            ...(input.isBlind ? (['blind-persons-allowance'] as const) : []),
            ...(policyIncludesMarriageAllowance ? (['marriage-allowance'] as const) : []),
          ]
        : [],
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
            employment: payBasis.totalEmploymentGross.annual,
            nonEmployment: payBasis.nonEmploymentTaxableIncome.annual,
            total: payBasis.totalGrossIncome.annual,
          }
        : undefined,
  };

  return results;
}
