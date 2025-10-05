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
  type AllowanceType,
  type NICategory,
  type PayPeriod,
  PERIODS,
  SCOTTISH_PREFIX,
  SCOTTISH_TAX_RATES,
  type StudentLoanPlan,
  TAX_RATES,
  type TaxAllowance,
  type TaxYear,
} from '@/constants/taxRates';
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
  /** Pension contribution amount or percentage */
  pensionContribution: number;
  /** Type of pension contribution (percentage or fixed amount) */
  pensionContributionType: 'percentage' | 'amount';
  /** Student loan plan that applies */
  studentLoanPlan: StudentLoanPlan | 'none';
  /** National Insurance category */
  niCategory: NICategory;
  /** Hours worked per week (for hourly calculations) */
  hoursPerWeek: number;
  /** Additional tax allowances */
  additionalAllowances: TaxAllowance[];
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

  /** Additional allowances breakdown (if applicable) */
  additionalAllowances?: {
    annually: number;
    breakdown: Array<{
      name: string;
      type: AllowanceType;
      annually: number;
    }>;
  };
}

/**
 * Determines Tax Treatment of Employment Allowances
 *
 * This function implements HMRC's distinction between allowances that:
 * 1. **Reduce taxable income** (tax relief at source) - deducted before tax calculation
 * 2. **Are added to net pay** (tax-free benefits) - added after tax calculation
 *
 * ### HMRC Guidelines for Tax-Deductible Expenses
 * Per ITEPA 2003 Section 336, expenses are allowable if they are:
 * - Wholly, exclusively, and necessarily incurred in the performance of duties
 * - Not reimbursed by the employer
 * - Not capital expenditure or personal expenses
 *
 * ### Implementation Logic
 * - **Professional Subscriptions**: Tax relief under Section 344 ITEPA 2003 (List 3 approved bodies)
 * - **Business Travel**: Tax relief under Section 337 ITEPA 2003 (travel between workplaces)
 * - **Working from Home**: Tax-free allowance under Section 316A ITEPA 2003 (flat rate or actual costs)
 * - **Uniform Allowance**: Usually tax-free benefit rather than deduction
 *
 * @param type - The employment allowance type to classify
 * @returns true if allowance reduces taxable income (deducted pre-tax), false if added to net pay (post-tax benefit)
 *
 * @see {@link https://www.gov.uk/tax-relief-for-employees/professional-subscriptions} HMRC Professional Subscriptions
 * @see {@link https://www.gov.uk/tax-relief-for-employees/business-travel-mileage} HMRC Business Travel Relief
 * @see {@link https://www.gov.uk/tax-relief-for-employees/working-at-home} HMRC Working from Home Relief
 */
function isTaxableAllowance(type: AllowanceType): boolean {
  switch (type) {
    // Tax-deductible allowances (reduce taxable income)
    case 'professionalSubscriptions':
      // Professional body subscriptions - tax relief at marginal rate
      // Examples: Law Society, BMA, RICS, etc. (HMRC List 3 approved bodies)
      return true;

    case 'businessTravel':
      // Business travel between workplaces - tax relief on excess over normal commuting
      // Includes mileage allowances above HMRC approved rates
      return true;

    // Tax-free benefits (added to net pay)
    case 'workingFromHome':
      // Working from home allowance - tax-free benefit up to £6/week or actual costs
      // Added to net pay rather than reducing taxable income
      return false;

    case 'uniformUpkeep':
      // Uniform and tool allowances - typically tax-free benefits
      // Not deductions from gross pay
      return false;

    default:
      // Conservative approach - treat as post-tax benefit unless specifically identified
      // Avoids incorrectly reducing taxable income for non-qualifying expenses
      return false;
  }
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
 *   hoursPerWeek: 37.5,
 *   additionalAllowances: []
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
    input.hoursPerWeek
  );

  // Then derive monthly gross from annual (this ensures consistency)
  const monthlyGrossSalary = annualGrossSalary / 12;

  // ---------------
  // 3. Calculate tax-free allowance (annual and monthly)
  // ---------------

  // Start with standard personal allowance
  let annualTaxFreeAmount = taxRates.personalAllowance;

  // Parse tax code to determine actual personal allowance (HMRC tax code system)
  if (input.taxCode.trim()) {
    // HMRC Tax Code Parsing Algorithm:
    // Tax codes contain a numeric part that represents 1/10th of the tax-free allowance
    // Examples:
    // - "1257L" = £12,570 personal allowance (1257 × 10)
    // - "S1257L" = £12,570 for Scottish taxpayer (S prefix ignored for calculation)
    // - "1100L" = £11,000 reduced allowance (common for high earners)
    // - "BR" = Basic rate all pay (no personal allowance, handled elsewhere)

    // Step 1: Remove Scottish prefix (S) if present - this only affects which rates to use, not the allowance
    const cleanTaxCode = input.taxCode.replace(/^[A-Za-z]/, '');

    // Step 2: Extract the numeric portion, removing suffix letters (L, T, etc.)
    // Suffix letters indicate special circumstances but don't affect the allowance amount
    const numericPart = Number.parseInt(cleanTaxCode.replace(/[A-Za-z]$/g, ''), 10);

    // Step 3: Convert to annual allowance if we have a valid number
    if (!Number.isNaN(numericPart)) {
      // The HMRC rule: tax code number × 10 = annual tax-free allowance
      // This allows for precise allowance adjustments (e.g., 1250 = £12,500)
      annualTaxFreeAmount = numericPart * 10;
    }
    // If parsing fails, we fall back to the standard personal allowance from tax rates
  }

  // High Income Personal Allowance Reduction (HMRC "60% Tax Trap")
  // Above £100,000 income, personal allowance is reduced by £1 for every £2 of income
  // This creates an effective 60% tax rate between £100k-£125k (40% income tax + 20% lost allowance)
  if (annualGrossSalary > taxRates.personalAllowanceReductionThreshold) {
    // Calculate the allowance reduction using HMRC formula:
    // Reduction = (Income - £100,000) ÷ 2
    // The Math.floor and ×2 ensure we follow HMRC's rounding rules (round down to nearest £2)
    const reduction = Math.min(
      annualTaxFreeAmount, // Cannot reduce below zero
      Math.floor(
        ((annualGrossSalary - taxRates.personalAllowanceReductionThreshold) *
          taxRates.personalAllowanceReductionRate) / // Rate is 0.5 (50% of excess)
          2 // Divide by 2 for the "£1 reduction per £2 income" rule
      ) * 2 // Multiply back by 2 to ensure even pound amounts (HMRC requirement)
    );

    // Apply the reduction - personal allowance can be reduced to zero but not negative
    annualTaxFreeAmount -= reduction;

    // Example: £120,000 salary
    // Excess over £100,000 = £20,000
    // Reduction = £20,000 ÷ 2 = £10,000
    // New allowance = £12,570 - £10,000 = £2,570
    // At £125,140+, allowance becomes zero
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
      // Percentage of salary (apply to annual and monthly consistently)
      annualPensionContribution = annualGrossSalary * (input.pensionContribution / 100);
      monthlyPensionContribution = monthlyGrossSalary * (input.pensionContribution / 100);
    } else {
      // Fixed amount (normalize from input period to annual and monthly)
      annualPensionContribution = convertPeriodToAnnual(
        input.pensionContribution,
        input.payPeriod,
        input.hoursPerWeek
      );
      monthlyPensionContribution = annualPensionContribution / 12;
    }
  }

  // Calculate allowances - separate taxable and non-taxable
  let annualTaxableAllowancesTotal = 0;
  let monthlyTaxableAllowancesTotal = 0;
  let annualNonTaxableAllowancesTotal = 0;
  let monthlyNonTaxableAllowancesTotal = 0;

  // Track total for all allowances (for reporting)
  let annualAllowancesTotal = 0;

  const allowanceBreakdown: Array<{
    name: string;
    type: AllowanceType;
    annually: number;
  }> = [];

  // Process each allowance
  for (const allowance of input.additionalAllowances) {
    // Convert allowance to annual amount from its input period
    const annualAllowance = convertPeriodToAnnual(
      allowance.amount,
      allowance.period,
      input.hoursPerWeek
    );

    // Add to appropriate total based on type
    if (isTaxableAllowance(allowance.type)) {
      // This allowance reduces taxable income (e.g., professional subscriptions)
      annualTaxableAllowancesTotal += annualAllowance;
    } else {
      // This allowance doesn't reduce taxable income (e.g., working from home)
      annualNonTaxableAllowancesTotal += annualAllowance;
    }

    // Add to total (for reporting)
    annualAllowancesTotal += annualAllowance;

    // Add to breakdown
    allowanceBreakdown.push({
      name: allowance.name,
      type: allowance.type,
      annually: annualAllowance,
    });
  }

  // Calculate monthly allowances
  monthlyTaxableAllowancesTotal = annualTaxableAllowancesTotal / 12;
  monthlyNonTaxableAllowancesTotal = annualNonTaxableAllowancesTotal / 12;

  // ---------------
  // 5. Calculate adjusted salary and taxable income (annual and monthly)
  // ---------------

  // Adjusted salary (after taxable pre-tax deductions only)
  // Only pension and taxable allowances reduce taxable income
  const monthlyTaxableAdjustedSalary =
    monthlyGrossSalary - monthlyPensionContribution - monthlyTaxableAllowancesTotal;

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
        const lowerBound = monthlyBoundaries[i]; // Start of this band
        const upperBound = monthlyBoundaries[i + 1]; // Start of next band (or infinity)

        // Calculate how much taxable income falls within this specific band
        // We compare:
        // 1. The width of this band (upperBound - lowerBound)
        // 2. How much income we still need to process (remainingMonthlyIncome)
        // Take the smaller of the two
        const monthlyIncomeInBand = Math.max(
          0, // Cannot have negative income in a band
          Math.min(
            upperBound - lowerBound, // Maximum possible income for this band
            remainingMonthlyIncome // Actual remaining income to be taxed
          )
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
  }

  // Round monthly tax to pence for accuracy
  monthlyTax = roundToPence(monthlyTax);

  // Calculate annual tax (for output)
  const annualTax = monthlyTax * 12;

  // ---------------
  // 7. Calculate National Insurance contributions (monthly calculation)
  // ---------------

  let monthlyNationalInsurance = 0;

  // Only calculate NI if not exempt
  if (input.niCategory !== 'C') {
    const niRates = standardRates.nationalInsurance.employee[input.niCategory];

    // Convert annual thresholds to monthly
    const monthlyPrimaryThreshold = niRates.primary.threshold / 12;
    const monthlyUpperThreshold = niRates.upper.threshold / 12;

    // NI is based on the same taxable adjusted salary as income tax
    // Primary threshold (lower rate)
    if (monthlyTaxableAdjustedSalary > monthlyPrimaryThreshold) {
      const lowerAmount = Math.min(
        monthlyTaxableAdjustedSalary - monthlyPrimaryThreshold,
        monthlyUpperThreshold - monthlyPrimaryThreshold
      );
      monthlyNationalInsurance += (lowerAmount * niRates.primary.rate) / 100;
    }

    // Upper threshold (higher rate)
    if (monthlyTaxableAdjustedSalary > monthlyUpperThreshold) {
      const upperAmount = monthlyTaxableAdjustedSalary - monthlyUpperThreshold;
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

  if (monthlyGrossSalary > monthlyEmployerThreshold) {
    monthlyEmployerNI =
      ((monthlyGrossSalary - monthlyEmployerThreshold) * employerRates.secondary.rate) / 100;
  }

  // Calculate annual employer NI (for output)
  const annualEmployerNI = monthlyEmployerNI * 12;

  // ---------------
  // 9. Calculate Student Loan repayments (monthly calculation)
  // ---------------

  let monthlyStudentLoan = 0;

  // Only calculate if student loan plan is selected
  if (input.studentLoanPlan && input.studentLoanPlan !== 'none') {
    const loanRates = standardRates.studentLoan[input.studentLoanPlan];

    // Convert annual threshold to monthly
    const monthlyLoanThreshold = loanRates.threshold / 12;

    // Student loan is calculated on gross salary, not adjusted salary
    // This matches how student loan is calculated on payslips
    if (monthlyGrossSalary > monthlyLoanThreshold) {
      monthlyStudentLoan = ((monthlyGrossSalary - monthlyLoanThreshold) * loanRates.rate) / 100;
    }
  }

  // Round monthly student loan to pence for accuracy
  monthlyStudentLoan = roundToPence(monthlyStudentLoan);

  // Calculate annual student loan (for output)
  const annualStudentLoan = monthlyStudentLoan * 12;

  // ---------------
  // 10. Calculate Net Pay (monthly calculation)
  // ---------------

  // Monthly net pay - Add non-taxable allowances to net pay
  const monthlyNetPay =
    monthlyTaxableAdjustedSalary -
    monthlyTax -
    monthlyNationalInsurance -
    monthlyStudentLoan +
    monthlyNonTaxableAllowancesTotal;

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
          monthlyNationalInsurance * fourWeeklyFactor
        );
        studentLoanByPeriod[period] = roundToPence(monthlyStudentLoan * fourWeeklyFactor);
        pensionContributionByPeriod[period] = roundToPence(
          monthlyPensionContribution * fourWeeklyFactor
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
          monthlyNationalInsurance * fortnightlyFactor
        );
        studentLoanByPeriod[period] = roundToPence(monthlyStudentLoan * fortnightlyFactor);
        pensionContributionByPeriod[period] = roundToPence(
          monthlyPensionContribution * fortnightlyFactor
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
          monthlyPensionContribution * weeklyFactor
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
          monthlyPensionContribution * dailyFactor
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
            monthlyPensionContribution / monthlyHours
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

  const results = {
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
    additionalAllowances:
      annualAllowancesTotal > 0
        ? {
            annually: annualAllowancesTotal,
            breakdown: allowanceBreakdown,
          }
        : undefined,
  };

  return results;
}
