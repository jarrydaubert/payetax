// src/lib/taxCalculator.ts
/**
 * Core tax calculation engine for UK PAYE income tax
 *
 * This module provides the primary tax calculation logic that powers the application.
 * It implements the UK tax rules including income tax, National Insurance, student loan
 * repayments, and various allowances and deductions.
 *
 * The implementation uses a hybrid monthly-annual approach to match how payslips
 * typically calculate taxes in the UK system.
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
  /** Student loan plans that apply */
  studentLoanPlans: StudentLoanPlan[];
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
 * Determines if an allowance type should reduce taxable income
 *
 * Some allowances directly reduce taxable income, while others
 * are added back after tax calculation.
 *
 * @param type - The allowance type to check
 * @returns True if this allowance should reduce taxable income
 */
function isTaxableAllowance(type: AllowanceType): boolean {
  // Only specific allowances reduce taxable income
  // Most standard allowances (like working from home) don't reduce the taxable amount
  // They are benefits added after tax/NI calculation
  switch (type) {
    case 'professionalSubscriptions':
    case 'businessTravel':
      return true;
    default:
      return false;
  }
}

/**
 * Main tax calculation function
 *
 * Calculates detailed tax breakdown for a given set of input parameters.
 * The calculation follows UK tax rules including Scottish variations,
 * student loan repayments, pension contributions, and various allowances.
 *
 * @param input - Tax calculation parameters
 * @returns Detailed tax calculation results
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

  // Parse tax code (if provided)
  if (input.taxCode.trim()) {
    // Extract numeric part of tax code (e.g., 1257 from "1257L" or "S1257L")
    const cleanTaxCode = input.taxCode.replace(/^[A-Za-z]/, '');
    const numericPart = Number.parseInt(cleanTaxCode.replace(/[A-Za-z]$/g, ''), 10);

    if (!Number.isNaN(numericPart)) {
      // Tax code determines tax-free amount (multiply by 10)
      annualTaxFreeAmount = numericPart * 10;
    }
  }

  // High income reduction of personal allowance
  if (annualGrossSalary > taxRates.personalAllowanceReductionThreshold) {
    const reduction = Math.min(
      annualTaxFreeAmount,
      Math.floor(
        ((annualGrossSalary - taxRates.personalAllowanceReductionThreshold) *
          taxRates.personalAllowanceReductionRate) /
          2
      ) * 2
    );
    annualTaxFreeAmount -= reduction;
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
  const _annualTaxableAdjustedSalary = monthlyTaxableAdjustedSalary * 12;

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

    // Process each tax band, treating Scottish and standard UK bands differently
    if (isScottish) {
      // Scottish tax bands are defined as absolute values from £0
      // We need to prorate thresholds to monthly values

      // Temporarily store the monthly boundaries for easy reference
      const monthlyBoundaries = [
        0, // Start at 0
        ...taxRates.bands.map((band) => band.threshold / 12), // Prorate thresholds to monthly
        Number.POSITIVE_INFINITY, // End with infinity
      ];

      // Process each band
      for (let i = 0; i < taxRates.bands.length; i++) {
        const band = taxRates.bands[i];
        const lowerBound = monthlyBoundaries[i];
        const upperBound = monthlyBoundaries[i + 1];

        // Calculate the amount of income in this band (monthly)
        const monthlyIncomeInBand = Math.max(
          0,
          Math.min(
            upperBound - lowerBound, // Band width
            remainingMonthlyIncome // Available income
          )
        );

        // Only process if there's income in this band
        if (monthlyIncomeInBand > 0) {
          // Calculate monthly tax for this band
          const monthlyTaxForBand = (monthlyIncomeInBand * band.rate) / 100;

          // Add to monthly tax total
          monthlyTax += monthlyTaxForBand;

          // Scale to annual for output
          const annualIncomeInBand = monthlyIncomeInBand * 12;

          // Add to bands breakdown (using annual amounts for consistency in output)
          taxBands.push({
            name: band.name,
            rate: band.rate,
            amount: annualIncomeInBand,
          });

          // Reduce remaining income
          remainingMonthlyIncome -= monthlyIncomeInBand;
        }

        // If no more income to tax, break out of loop
        if (remainingMonthlyIncome <= 0) break;
      }
    } else {
      // Standard UK tax bands are defined relative to personal allowance
      let previousMonthlyThreshold = 0;

      for (let i = 0; i < taxRates.bands.length; i++) {
        const band = taxRates.bands[i];

        // Convert to monthly threshold
        const monthlyThreshold = band.threshold / 12;

        // Calculate the width of this band
        const monthlyBandWidth = monthlyThreshold - previousMonthlyThreshold;

        // Calculate the amount of income in this band
        const monthlyIncomeInBand = Math.min(remainingMonthlyIncome, monthlyBandWidth);

        // Only process if there's income in this band
        if (monthlyIncomeInBand > 0) {
          // Calculate monthly tax for this band
          const monthlyTaxForBand = (monthlyIncomeInBand * band.rate) / 100;

          // Add to total tax
          monthlyTax += monthlyTaxForBand;

          // Scale to annual for output
          const annualIncomeInBand = monthlyIncomeInBand * 12;

          // Add to bands breakdown (using annual amounts for consistency in output)
          taxBands.push({
            name: band.name,
            rate: band.rate,
            amount: annualIncomeInBand,
          });

          // Reduce remaining income
          remainingMonthlyIncome -= monthlyIncomeInBand;
        }

        // If no more income to tax, break out of loop
        if (remainingMonthlyIncome <= 0) break;
        previousMonthlyThreshold = monthlyThreshold;
      }
    }
  }

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

  // Only calculate if student loan plans are selected
  if (!input.studentLoanPlans.includes('none')) {
    // Process each selected plan
    for (const plan of input.studentLoanPlans) {
      if (plan !== 'none') {
        const loanRates = standardRates.studentLoan[plan];

        // Convert annual threshold to monthly
        const monthlyLoanThreshold = loanRates.threshold / 12;

        // Student loan is calculated on gross salary, not adjusted salary
        // This matches how student loan is calculated on payslips
        if (monthlyGrossSalary > monthlyLoanThreshold) {
          monthlyStudentLoan +=
            ((monthlyGrossSalary - monthlyLoanThreshold) * loanRates.rate) / 100;
        }
      }
    }
  }

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
        grossSalary[period] = monthlyGrossSalary * fourWeeklyFactor;
        incomeTax[period] = monthlyTax * fourWeeklyFactor;
        nationalInsuranceByPeriod[period] = monthlyNationalInsurance * fourWeeklyFactor;
        studentLoanByPeriod[period] = monthlyStudentLoan * fourWeeklyFactor;
        pensionContributionByPeriod[period] = monthlyPensionContribution * fourWeeklyFactor;
        netPay[period] = monthlyNetPay * fourWeeklyFactor;
        break;
      }

      case PERIODS.FORTNIGHTLY: {
        // Monthly * (12/26) - averages to fortnightly
        const fortnightlyFactor = 12 / 26;
        grossSalary[period] = monthlyGrossSalary * fortnightlyFactor;
        incomeTax[period] = monthlyTax * fortnightlyFactor;
        nationalInsuranceByPeriod[period] = monthlyNationalInsurance * fortnightlyFactor;
        studentLoanByPeriod[period] = monthlyStudentLoan * fortnightlyFactor;
        pensionContributionByPeriod[period] = monthlyPensionContribution * fortnightlyFactor;
        netPay[period] = monthlyNetPay * fortnightlyFactor;
        break;
      }

      case PERIODS.WEEKLY: {
        // Monthly * (12/52) - averages to weekly
        const weeklyFactor = 12 / 52;
        grossSalary[period] = monthlyGrossSalary * weeklyFactor;
        incomeTax[period] = monthlyTax * weeklyFactor;
        nationalInsuranceByPeriod[period] = monthlyNationalInsurance * weeklyFactor;
        studentLoanByPeriod[period] = monthlyStudentLoan * weeklyFactor;
        pensionContributionByPeriod[period] = monthlyPensionContribution * weeklyFactor;
        netPay[period] = monthlyNetPay * weeklyFactor;
        break;
      }

      case PERIODS.DAILY: {
        // Monthly * (12/260) - averages to daily (5 working days per week)
        const dailyFactor = 12 / 260;
        grossSalary[period] = monthlyGrossSalary * dailyFactor;
        incomeTax[period] = monthlyTax * dailyFactor;
        nationalInsuranceByPeriod[period] = monthlyNationalInsurance * dailyFactor;
        studentLoanByPeriod[period] = monthlyStudentLoan * dailyFactor;
        pensionContributionByPeriod[period] = monthlyPensionContribution * dailyFactor;
        netPay[period] = monthlyNetPay * dailyFactor;
        break;
      }

      case PERIODS.HOURLY:
        // Special case for hourly rate
        if (input.hoursPerWeek > 0) {
          // Monthly / (hours per week * 4.333 weeks per month)
          const monthlyHours = input.hoursPerWeek * 4.333; // Average weeks per month
          grossSalary[period] = monthlyGrossSalary / monthlyHours;
          incomeTax[period] = monthlyTax / monthlyHours;
          nationalInsuranceByPeriod[period] = monthlyNationalInsurance / monthlyHours;
          studentLoanByPeriod[period] = monthlyStudentLoan / monthlyHours;
          pensionContributionByPeriod[period] = monthlyPensionContribution / monthlyHours;
          netPay[period] = monthlyNetPay / monthlyHours;
        } else {
          // Default to annual / (52 * 40) if no hours specified
          grossSalary[period] = annualGrossSalary / (52 * 40);
          incomeTax[period] = annualTax / (52 * 40);
          nationalInsuranceByPeriod[period] = annualNationalInsurance / (52 * 40);
          studentLoanByPeriod[period] = annualStudentLoan / (52 * 40);
          pensionContributionByPeriod[period] = annualPensionContribution / (52 * 40);
          netPay[period] = annualNetPay / (52 * 40);
        }
        break;
    }
  }

  // ---------------
  // 12. Return results
  // ---------------

  return {
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
}
