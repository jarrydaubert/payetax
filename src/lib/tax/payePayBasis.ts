import { DEFAULT_HOURS_PER_WEEK, PERIODS } from '@/constants/taxRates';
import { convertAnnualToPeriod, convertPeriodToAnnual } from '@/lib/periodCalculator';
import {
  DEFAULT_PENSION_METHOD,
  type PensionMethod,
  type TaxCalculationInput,
} from '@/lib/types/calculator';

type PayBasisInput = Pick<
  TaxCalculationInput,
  | 'salary'
  | 'payPeriod'
  | 'hoursPerWeek'
  | 'incomeSources'
  | 'pensionContribution'
  | 'pensionContributionType'
  | 'pensionMethod'
>;

export interface AnnualMonthlyPayBasis {
  readonly annual: number;
  readonly monthly: number;
}

/** Canonical income and deduction bases consumed by the PAYE engine. */
export interface PayePayBasis {
  readonly hoursPerWeek: number;
  readonly primaryEmploymentGross: AnnualMonthlyPayBasis;
  readonly totalEmploymentGross: AnnualMonthlyPayBasis;
  readonly nonEmploymentTaxableIncome: AnnualMonthlyPayBasis;
  readonly totalGrossIncome: AnnualMonthlyPayBasis;
  readonly pensionMethod: PensionMethod;
  readonly pensionDeduction: AnnualMonthlyPayBasis;
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

  let pensionAnnual = 0;
  if (input.pensionContribution > 0) {
    if (input.pensionContributionType === 'percentage') {
      pensionAnnual = primaryEmploymentGross.annual * (input.pensionContribution / 100);
    } else {
      const requestedAnnualPension = convertPeriodToAnnual(
        input.pensionContribution,
        input.payPeriod,
        hoursPerWeek,
      );
      pensionAnnual = Math.min(requestedAnnualPension, primaryEmploymentGross.annual);
    }
  }

  const pensionMethod = input.pensionMethod ?? DEFAULT_PENSION_METHOD;
  const pensionDeduction = annualMonthly(pensionAnnual, hoursPerWeek);
  // Net pay reduces taxable pay, while only salary sacrifice reduces NI and loan earnings.
  const sacrificedPay =
    pensionMethod === 'salary-sacrifice' ? pensionDeduction : { annual: 0, monthly: 0 };
  const adjustedNetIncome = annualMonthly(
    Math.max(0, totalGrossIncome.annual - pensionDeduction.annual),
    hoursPerWeek,
  );
  const payeAdjustedPayment = Object.freeze({
    annual: totalGrossIncome.annual - pensionDeduction.annual,
    monthly: totalGrossIncome.monthly - pensionDeduction.monthly,
  });
  const niableEmploymentEarnings = Object.freeze({
    annual: totalEmploymentGross.annual - sacrificedPay.annual,
    monthly: totalEmploymentGross.monthly - sacrificedPay.monthly,
  });
  const studentLoanEmploymentEarnings = annualMonthly(
    Math.max(0, primaryEmploymentGross.annual - sacrificedPay.annual),
    hoursPerWeek,
  );

  return Object.freeze({
    hoursPerWeek,
    primaryEmploymentGross,
    totalEmploymentGross,
    nonEmploymentTaxableIncome,
    totalGrossIncome,
    pensionMethod,
    pensionDeduction,
    adjustedNetIncome,
    payeAdjustedPayment,
    niableEmploymentEarnings,
    // Student Loan deductions are calculated separately for each employment.
    // This basis is the primary employment after salary sacrifice; additional
    // employments are handled independently by the calculator.
    studentLoanEmploymentEarnings,
  });
}
