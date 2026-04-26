/**
 * Payslip Regression Tests
 *
 * What bug will this test find?
 * - ROUNDING: month/weekly/4-weekly drift vs expected payslip-style outputs
 * - CALC-DRIFT: changes in tax/NI/pension flow for common PAYE setup
 */

import { calculateTax, type TaxCalculationInput } from '../taxCalculator';

const baseInput: TaxCalculationInput = {
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
  studentLoanPlans: 'none',
  niCategory: 'A',
  hoursPerWeek: 40,
  allowancesDeductions: 312,
};

describe('Tax Calculator payslip regression', () => {
  it('matches expected monthly/weekly/4-weekly outputs for a typical PAYE case', () => {
    const result = calculateTax(baseInput);

    expect(result.grossSalary.monthly).toBeCloseTo(4094.25, 2);
    expect(result.grossSalary.weekly).toBeCloseTo(944.83, 2);
    expect(result.grossSalary.fourWeekly).toBeCloseTo(3779.31, 2);

    expect(result.incomeTax.monthly).toBeCloseTo(576.4, 2);
    expect(result.nationalInsurance.monthly).toBeCloseTo(230.6, 2);
    expect(result.pensionContribution.monthly).toBeCloseTo(163.77, 2);

    expect(result.netPay.monthly).toBeCloseTo(3149.48, 2);
    expect(result.netPay.weekly).toBeCloseTo(726.8, 2);
    expect(result.netPay.fourWeekly).toBeCloseTo(2907.21, 2);
  });

  it('matches HMRC monthly payroll rounding for the 2026-27 1257L payslip case', () => {
    const result = calculateTax({
      ...baseInput,
      taxYear: '2026-2027',
      pensionContribution: 5,
    });

    expect(result.grossSalary.monthly).toBeCloseTo(4094.25, 2);
    expect(result.pensionContribution.monthly).toBeCloseTo(204.71, 2);
    expect(result.incomeTax.monthly).toBeCloseTo(568.2, 2);
    expect(result.nationalInsurance.monthly).toBeCloseTo(227.32, 2);
    expect(result.netPay.monthly).toBeCloseTo(3120.02, 2);
  });

  it('uses whole-pound monthly payroll band thresholds for higher-rate PAYE', () => {
    const result = calculateTax({
      ...baseInput,
      salary: 80000,
      taxYear: '2026-2027',
      pensionContribution: 0,
      allowancesDeductions: 0,
    });

    expect(result.incomeTax.monthly).toBeCloseTo(1618.8, 2);
    expect(result.nationalInsurance.monthly).toBeCloseTo(300.83, 2);
  });
});
