import { DEFAULT_HOURS_PER_WEEK, PERIODS } from '@/constants/taxRates';
import { convertAnnualToPeriod, convertPeriodToAnnual } from '@/lib/periodCalculator';
import type { TaxCalculationInput } from '@/lib/types/calculator';

type PayBasisInput = Pick<
  TaxCalculationInput,
  | 'salary'
  | 'payPeriod'
  | 'hoursPerWeek'
  | 'incomeSources'
  | 'pensionContribution'
  | 'pensionContributionType'
>;

export interface AnnualMonthlyPayBasis {
  readonly annual: number;
  readonly monthly: number;
}

/**
 * Canonical income and deduction bases consumed by the PAYE engine.
 *
 * The existing pension input is modelled as salary sacrifice for PAYE,
 * employee NI and the primary employment's Student Loan earnings basis.
 */
export interface PayePayBasis {
  readonly hoursPerWeek: number;
  readonly primaryEmploymentGross: AnnualMonthlyPayBasis;
  readonly totalEmploymentGross: AnnualMonthlyPayBasis;
  readonly nonEmploymentTaxableIncome: AnnualMonthlyPayBasis;
  readonly totalGrossIncome: AnnualMonthlyPayBasis;
  readonly salarySacrificePensionDeduction: AnnualMonthlyPayBasis;
  readonly adjustedNetIncome: AnnualMonthlyPayBasis;
  readonly payeAdjustedPayment: AnnualMonthlyPayBasis;
  readonly niableEmploymentEarnings: AnnualMonthlyPayBasis;
  readonly studentLoanEmploymentEarnings: AnnualMonthlyPayBasis;
}

function annualMonthly(annual: number, hoursPerWeek: number): AnnualMonthlyPayBasis {
  return Object.freeze({
    annual,
    monthly: convertAnnualToPeriod(annual, PERIODS.MONTHLY, hoursPerWeek),
  });
}

export function derivePayePayBasis(input: PayBasisInput): PayePayBasis {
  const salaryInput = Number.isFinite(input.salary) && input.salary > 0 ? input.salary : 0;
  const hoursPerWeek =
    Number.isFinite(input.hoursPerWeek) && input.hoursPerWeek > 0
      ? input.hoursPerWeek
      : DEFAULT_HOURS_PER_WEEK;

  const primaryEmploymentGross = annualMonthly(
    convertPeriodToAnnual(salaryInput, input.payPeriod, hoursPerWeek),
    hoursPerWeek,
  );

  let totalEmploymentAnnual = primaryEmploymentGross.annual;
  let nonEmploymentTaxableAnnual = 0;

  for (const source of input.incomeSources ?? []) {
    const sourceAnnual = convertPeriodToAnnual(source.amount, source.period, hoursPerWeek);

    if (source.type === 'employment') {
      totalEmploymentAnnual += sourceAnnual;
    } else {
      nonEmploymentTaxableAnnual += sourceAnnual;
    }
  }

  const totalEmploymentGross = annualMonthly(totalEmploymentAnnual, hoursPerWeek);
  const nonEmploymentTaxableIncome = annualMonthly(nonEmploymentTaxableAnnual, hoursPerWeek);
  const totalGrossIncome = annualMonthly(
    totalEmploymentAnnual + nonEmploymentTaxableAnnual,
    hoursPerWeek,
  );

  let salarySacrificePensionAnnual = 0;
  if (input.pensionContribution > 0) {
    if (input.pensionContributionType === 'percentage') {
      salarySacrificePensionAnnual =
        primaryEmploymentGross.annual * (input.pensionContribution / 100);
    } else {
      const requestedAnnualPension = convertPeriodToAnnual(
        input.pensionContribution,
        input.payPeriod,
        hoursPerWeek,
      );
      salarySacrificePensionAnnual = Math.min(
        requestedAnnualPension,
        primaryEmploymentGross.annual,
      );
    }
  }

  const salarySacrificePensionDeduction = annualMonthly(salarySacrificePensionAnnual, hoursPerWeek);
  const adjustedNetIncome = annualMonthly(
    Math.max(0, totalGrossIncome.annual - salarySacrificePensionDeduction.annual),
    hoursPerWeek,
  );
  const payeAdjustedPayment = Object.freeze({
    annual: totalGrossIncome.annual - salarySacrificePensionDeduction.annual,
    monthly: totalGrossIncome.monthly - salarySacrificePensionDeduction.monthly,
  });
  const niableEmploymentEarnings = Object.freeze({
    annual: totalEmploymentGross.annual - salarySacrificePensionDeduction.annual,
    monthly: totalEmploymentGross.monthly - salarySacrificePensionDeduction.monthly,
  });
  const studentLoanEmploymentEarnings = annualMonthly(
    Math.max(0, primaryEmploymentGross.annual - salarySacrificePensionDeduction.annual),
    hoursPerWeek,
  );

  return Object.freeze({
    hoursPerWeek,
    primaryEmploymentGross,
    totalEmploymentGross,
    nonEmploymentTaxableIncome,
    totalGrossIncome,
    salarySacrificePensionDeduction,
    adjustedNetIncome,
    payeAdjustedPayment,
    niableEmploymentEarnings,
    // Student Loan deductions are calculated separately for each employment.
    // This basis is the primary employment after salary sacrifice; additional
    // employments are handled independently by the calculator.
    studentLoanEmploymentEarnings,
  });
}
