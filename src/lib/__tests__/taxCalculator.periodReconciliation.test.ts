/**
 * Period Reconciliation Tests
 *
 * What bug will this test find?
 * - ROUNDING: net pay not reconciling across periods after scaling
 * - CALC-DRIFT: period conversions accidentally break net calculations
 */

import { type PayPeriod, PERIODS } from '@/constants/taxRates';
import { convertMonthlyToPeriod } from '../periodCalculator';
import { roundToPence } from '../tax/utils';
import { calculateTax, type TaxCalculationInput } from '../taxCalculator';

const input: TaxCalculationInput = {
  salary: 49131,
  payPeriod: 'annually',
  taxYear: '2025-2026',
  taxCode: '1257L',
  isScottish: false,
  isMarried: false,
  partnerGrossWage: 0,
  isBlind: false,
  age: undefined,
  payNoNI: false,
  pensionContribution: 4,
  pensionContributionType: 'percentage',
  studentLoanPlans: ['plan2'],
  niCategory: 'A',
  hoursPerWeek: 37.5,
  allowancesDeductions: 312,
};

function allowanceForPeriod(
  period: PayPeriod,
  annualAllowance: number,
  hoursPerWeek: number,
): number {
  if (period === PERIODS.ANNUALLY) {
    return roundToPence(annualAllowance);
  }

  const monthlyAllowance = roundToPence(annualAllowance / 12);
  return roundToPence(convertMonthlyToPeriod(monthlyAllowance, period, hoursPerWeek));
}

describe('Tax Calculator period reconciliation', () => {
  it('preserves the established monthly-base projections for every output period', () => {
    const result = calculateTax(input);

    expect({
      grossSalary: result.grossSalary,
      incomeTax: result.incomeTax,
      nationalInsurance: result.nationalInsurance,
      studentLoan: result.studentLoan,
      pensionContribution: result.pensionContribution,
      netPay: result.netPay,
    }).toEqual({
      grossSalary: {
        annually: 49131,
        monthly: 4094.25,
        fourWeekly: 3779.31,
        fortnightly: 1889.65,
        weekly: 944.83,
        daily: 188.97,
        hourly: 25.2,
      },
      incomeTax: {
        annually: 6916.799999999999,
        monthly: 576.4,
        fourWeekly: 532.06,
        fortnightly: 266.03,
        weekly: 133.02,
        daily: 26.6,
        hourly: 3.55,
      },
      nationalInsurance: {
        annually: 2767.2,
        monthly: 230.6,
        fourWeekly: 212.86,
        fortnightly: 106.43,
        weekly: 53.22,
        daily: 10.64,
        hourly: 1.42,
      },
      studentLoan: {
        annually: 1859.52,
        monthly: 154.96,
        fourWeekly: 143.04,
        fortnightly: 71.52,
        weekly: 35.76,
        daily: 7.15,
        hourly: 0.95,
      },
      pensionContribution: {
        annually: 1965.24,
        monthly: 163.77,
        fourWeekly: 151.17,
        fortnightly: 75.59,
        weekly: 37.79,
        daily: 7.56,
        hourly: 1.01,
      },
      netPay: {
        annually: 35934.24,
        monthly: 2994.52,
        fourWeekly: 2764.17,
        fortnightly: 1382.09,
        weekly: 691.04,
        daily: 138.21,
        hourly: 18.43,
      },
    });
  });

  it('keeps zero, missing and non-finite hours on the 40-hour engine fallback', () => {
    const defaultHours = calculateTax({ ...input, hoursPerWeek: 40 });
    const zeroHours = calculateTax({ ...input, hoursPerWeek: 0 });
    const nonFiniteHours = calculateTax({ ...input, hoursPerWeek: Number.NaN });
    const { hoursPerWeek: _hoursPerWeek, ...missingHoursInput } = input;
    const missingHours = calculateTax(missingHoursInput as TaxCalculationInput);

    for (const result of [zeroHours, nonFiniteHours, missingHours]) {
      expect(result.grossSalary.hourly).toBe(defaultHours.grossSalary.hourly);
      expect(result.incomeTax.hourly).toBe(defaultHours.incomeTax.hourly);
      expect(result.nationalInsurance.hourly).toBe(defaultHours.nationalInsurance.hourly);
      expect(result.studentLoan.hourly).toBe(defaultHours.studentLoan.hourly);
      expect(result.pensionContribution.hourly).toBe(defaultHours.pensionContribution.hourly);
      expect(result.netPay.hourly).toBe(defaultHours.netPay.hourly);
    }
  });

  it('keeps an unsupported runtime pay period on the established annual fallback', () => {
    const annualInput = calculateTax(input);
    const unsupportedInput = calculateTax({
      ...input,
      payPeriod: 'quarterly' as PayPeriod,
    });

    expect(unsupportedInput).toEqual(annualInput);
  });

  it('net pay reconciles across all pay periods', () => {
    const result = calculateTax(input);
    const annualAllowance = input.allowancesDeductions ?? 0;

    const periods: PayPeriod[] = [
      PERIODS.ANNUALLY,
      PERIODS.MONTHLY,
      PERIODS.FOUR_WEEKLY,
      PERIODS.FORTNIGHTLY,
      PERIODS.WEEKLY,
      PERIODS.DAILY,
      PERIODS.HOURLY,
    ];

    for (const period of periods) {
      const allowance = allowanceForPeriod(period, annualAllowance, input.hoursPerWeek);
      const expected =
        result.grossSalary[period] -
        result.incomeTax[period] -
        result.nationalInsurance[period] -
        result.studentLoan[period] -
        result.pensionContribution[period] +
        allowance;

      const delta = Math.abs(result.netPay[period] - expected);
      expect(delta).toBeLessThanOrEqual(0.02);
    }
  });
});
