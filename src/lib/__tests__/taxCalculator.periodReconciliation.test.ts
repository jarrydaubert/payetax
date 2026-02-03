/**
 * Period Reconciliation Tests
 *
 * What bug will this test find?
 * - ROUNDING: net pay not reconciling across periods after scaling
 * - CALC-DRIFT: period conversions accidentally break net calculations
 */

import { PERIOD_CONVERSION_FACTORS, PERIODS } from '@/constants/taxRates';
import { calculateTax, type TaxCalculationInput } from '../taxCalculator';

function roundToPence(value: number): number {
  return Math.round(value * 100) / 100;
}

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
  hoursPerWeek: 40,
  allowancesDeductions: 312,
};

function allowanceForPeriod(period: string, annualAllowance: number, hoursPerWeek: number): number {
  const monthlyAllowance = annualAllowance / 12;
  switch (period) {
    case PERIODS.ANNUALLY:
      return roundToPence(annualAllowance);
    case PERIODS.MONTHLY:
      return roundToPence(monthlyAllowance);
    case PERIODS.FOUR_WEEKLY:
      return roundToPence(monthlyAllowance * PERIOD_CONVERSION_FACTORS.FOUR_WEEKLY);
    case PERIODS.FORTNIGHTLY:
      return roundToPence(monthlyAllowance * PERIOD_CONVERSION_FACTORS.FORTNIGHTLY);
    case PERIODS.WEEKLY:
      return roundToPence(monthlyAllowance * PERIOD_CONVERSION_FACTORS.WEEKLY);
    case PERIODS.DAILY:
      return roundToPence(monthlyAllowance * PERIOD_CONVERSION_FACTORS.DAILY);
    case PERIODS.HOURLY: {
      const monthlyHours = hoursPerWeek * 4.333;
      return roundToPence(monthlyAllowance / monthlyHours);
    }
    default:
      return roundToPence(monthlyAllowance);
  }
}

describe('Tax Calculator period reconciliation', () => {
  it('net pay reconciles across all pay periods', () => {
    const result = calculateTax(input);
    const annualAllowance = input.allowancesDeductions ?? 0;

    const periods = [
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
