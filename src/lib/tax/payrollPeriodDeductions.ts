import {
  CURRENT_TAX_YEAR,
  PAYROLL_PERIOD_THRESHOLDS,
  type PayPeriod,
  PERIODS,
  TAX_RATES,
  type TaxYear,
} from '@/constants/taxRates';
import {
  calculateAllowanceReduction,
  parseTaxCode,
  type TaxCalculationInput,
} from '@/lib/taxCalculator';
import { roundToPence } from './utils';

type PayrollDeductionPeriod = Extract<
  PayPeriod,
  'monthly' | 'weekly' | 'fortnightly' | 'fourWeekly'
>;

interface PayrollPeriodBasis {
  periodsPerYear: number;
  weeksPerPeriod?: number;
}

const PAYROLL_PERIOD_BASIS: Record<PayrollDeductionPeriod, PayrollPeriodBasis> = {
  monthly: { periodsPerYear: 12 },
  weekly: { periodsPerYear: 52, weeksPerPeriod: 1 },
  fortnightly: { periodsPerYear: 26, weeksPerPeriod: 2 },
  fourWeekly: { periodsPerYear: 13, weeksPerPeriod: 4 },
};

export interface PayrollPeriodCalculationInput {
  grossPay: number;
  payPeriod: PayrollDeductionPeriod;
  periodNumber: number;
  taxYear: TaxYear;
  taxCode: string;
  niCategory: TaxCalculationInput['niCategory'];
  previousGrossPay?: number;
  previousTaxPaid?: number;
}

export interface PayrollPeriodCalculationResults {
  grossPay: number;
  grossPayToDate: number;
  taxablePayToDate: number;
  taxFreePayToDate: number;
  incomeTaxToDate: number;
  incomeTax: number;
  nationalInsurance: number;
  netPay: number;
}

function getPayrollPeriodThresholds(
  period: PayrollDeductionPeriod,
  taxYear: TaxYear,
): { payeFreePay: number; niPrimary: number; niUpper: number } {
  const thresholds = PAYROLL_PERIOD_THRESHOLDS[taxYear];

  if (period === PERIODS.MONTHLY) {
    return thresholds.monthly;
  }

  const weeksPerPeriod = PAYROLL_PERIOD_BASIS[period].weeksPerPeriod ?? 1;

  return {
    payeFreePay: thresholds.weekly.payeFreePay * weeksPerPeriod,
    niPrimary: thresholds.weekly.niPrimary * weeksPerPeriod,
    niUpper: thresholds.weekly.niUpper * weeksPerPeriod,
  };
}

function getProjectedAnnualGrossPay(
  grossPayToDate: number,
  periodNumber: number,
  periodsPerYear: number,
): number {
  if (periodNumber <= 0) {
    return 0;
  }

  return (grossPayToDate / periodNumber) * periodsPerYear;
}

function calculateCumulativeIncomeTax(
  taxablePayToDate: number,
  taxRates: (typeof TAX_RATES)[TaxYear],
  periodNumber: number,
  periodsPerYear: number,
  bandOverride: 'BR' | 'D0' | 'D1' | 'NT' | null,
): number {
  if (bandOverride === 'NT') {
    return 0;
  }

  if (bandOverride) {
    const overrideRates = {
      BR: 20,
      D0: 40,
      D1: 45,
    } as const;

    return roundToPence((taxablePayToDate * overrideRates[bandOverride]) / 100);
  }

  let remainingPay = taxablePayToDate;
  let previousThreshold = 0;
  let taxDue = 0;

  for (const band of taxRates.bands) {
    if (remainingPay <= 0) break;

    const cumulativeThreshold = Number.isFinite(band.threshold)
      ? Math.ceil((band.threshold * periodNumber) / periodsPerYear)
      : Number.POSITIVE_INFINITY;
    const bandWidth = cumulativeThreshold - previousThreshold;
    const payInBand = Math.min(remainingPay, bandWidth);

    if (payInBand > 0) {
      taxDue += (payInBand * band.rate) / 100;
      remainingPay -= payInBand;
    }

    previousThreshold = cumulativeThreshold;
  }

  return roundToPence(taxDue);
}

/**
 * Calculate a single payroll period using cumulative PAYE and period-specific NI.
 *
 * This helper exists to anchor HMRC payroll fixture tests without changing the
 * main public calculator's annual/monthly estimate flow.
 */
export function calculatePayrollPeriodDeductions(
  input: PayrollPeriodCalculationInput,
): PayrollPeriodCalculationResults {
  const taxYear = input.taxYear in TAX_RATES ? input.taxYear : CURRENT_TAX_YEAR;
  const taxRates = TAX_RATES[taxYear];
  const periodBasis = PAYROLL_PERIOD_BASIS[input.payPeriod];
  const safePeriodNumber = Math.max(1, Math.floor(input.periodNumber));
  const grossPay = roundToPence(Math.max(0, input.grossPay));
  const previousGrossPay = Math.max(0, input.previousGrossPay ?? 0);
  const previousTaxPaid = roundToPence(Math.max(0, input.previousTaxPaid ?? 0));
  const grossPayToDate = roundToPence(previousGrossPay + grossPay);

  const parsedTaxCode = parseTaxCode(input.taxCode, taxRates.personalAllowance);
  const projectedAnnualGrossPay = getProjectedAnnualGrossPay(
    grossPayToDate,
    safePeriodNumber,
    periodBasis.periodsPerYear,
  );
  const allowanceReduction = calculateAllowanceReduction(
    projectedAnnualGrossPay,
    parsedTaxCode.allowance,
    taxRates.personalAllowanceReductionThreshold,
    taxRates.personalAllowanceReductionRate,
  );
  const annualTaxFreeAmount = Math.max(0, parsedTaxCode.allowance - allowanceReduction);
  const periodThresholds = getPayrollPeriodThresholds(input.payPeriod, taxYear);
  const taxFreePayToDate =
    annualTaxFreeAmount === taxRates.personalAllowance
      ? periodThresholds.payeFreePay * safePeriodNumber
      : Math.ceil((annualTaxFreeAmount * safePeriodNumber) / periodBasis.periodsPerYear);
  const taxablePayToDate = Math.floor(Math.max(0, grossPayToDate - taxFreePayToDate));
  // This helper models rUK cumulative PAYE only. Scottish-only D2/D3 flat-rate
  // codes are outside its scope: fall back to progressive bands on the zero
  // allowance the parser already assigned, rather than inventing an rUK rate.
  const bandOverride =
    parsedTaxCode.bandOverride === 'D2' || parsedTaxCode.bandOverride === 'D3'
      ? null
      : parsedTaxCode.bandOverride;
  const incomeTaxToDate = calculateCumulativeIncomeTax(
    taxablePayToDate,
    taxRates,
    safePeriodNumber,
    periodBasis.periodsPerYear,
    bandOverride,
  );
  const incomeTax = roundToPence(Math.max(0, incomeTaxToDate - previousTaxPaid));

  const niRates = taxRates.nationalInsurance.employee[input.niCategory];
  let nationalInsurance = 0;

  if (grossPay > periodThresholds.niPrimary) {
    nationalInsurance +=
      Math.min(
        grossPay - periodThresholds.niPrimary,
        periodThresholds.niUpper - periodThresholds.niPrimary,
      ) *
      (niRates.primary.rate / 100);

    if (grossPay > periodThresholds.niUpper) {
      nationalInsurance += (grossPay - periodThresholds.niUpper) * (niRates.upper.rate / 100);
    }
  }

  nationalInsurance = roundToPence(nationalInsurance);
  const netPay = roundToPence(grossPay - incomeTax - nationalInsurance);

  return {
    grossPay,
    grossPayToDate,
    taxablePayToDate,
    taxFreePayToDate,
    incomeTaxToDate,
    incomeTax,
    nationalInsurance,
    netPay,
  };
}
