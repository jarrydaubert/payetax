/**
 * Tax Calculator Invariants
 *
 * What bugs will these tests find?
 * - CALC-DRIFT: refactors that accidentally break internal accounting identities
 * - MULTI-INCOME: regressions in how total income is composed vs what is taxed/NI'd
 * - ROUNDING: regressions that cause inconsistent totals (net not reconciling)
 */

import { calculateTax, type TaxCalculationInput } from '../taxCalculator';

const createInput = (overrides: Partial<TaxCalculationInput> = {}): TaxCalculationInput => ({
  salary: 30000,
  payPeriod: 'annually',
  taxYear: '2025-2026',
  taxCode: '1257L',
  isScottish: false,
  isMarried: false,
  partnerGrossWage: 0,
  isBlind: false,
  age: undefined,
  payNoNI: false,
  pensionContribution: 0,
  pensionContributionType: 'percentage',
  studentLoanPlans: 'none',
  niCategory: 'A',
  hoursPerWeek: 40,
  ...overrides,
});

function totalGrossAnnual(results: ReturnType<typeof calculateTax>): number {
  return results.incomeBreakdown?.total ?? results.grossSalary.annually;
}

describe('Tax Calculator invariants', () => {
  it('net pay reconciles: net = gross - pension - tax - NI - SL + nonTaxableAllowances', () => {
    const input = createInput({
      salary: 49131,
      pensionContribution: 4,
      pensionContributionType: 'percentage',
      allowancesDeductions: 312,
      studentLoanPlans: ['plan2'],
    });
    const r = calculateTax(input);

    const gross = totalGrossAnnual(r);
    const allowances = input.allowancesDeductions ?? 0;
    const expectedNet =
      gross -
      r.pensionContribution.annually -
      r.incomeTax.annually -
      r.nationalInsurance.annually -
      r.studentLoan.annually +
      allowances;

    expect(r.netPay.annually).toBeCloseTo(expectedNet, 2);
  });

  it('non-employment income increases gross and tax, but does not change NI or PAYE student loan', () => {
    const base = calculateTax(createInput({ salary: 30000, studentLoanPlans: ['plan2'] }));
    const withRental = calculateTax(
      createInput({
        salary: 30000,
        studentLoanPlans: ['plan2'],
        incomeSources: [{ id: 'r1', type: 'rental', amount: 10000, period: 'annually' }],
      }),
    );

    expect(totalGrossAnnual(withRental)).toBe(40000);
    expect(withRental.incomeTax.annually).toBeGreaterThan(base.incomeTax.annually);
    expect(withRental.nationalInsurance.annually).toBeCloseTo(base.nationalInsurance.annually, 2);
    expect(withRental.studentLoan.annually).toBeCloseTo(base.studentLoan.annually, 2);
  });

  it('BR tax code implies 0 allowance and a single-rate income tax calculation', () => {
    const r = calculateTax(createInput({ salary: 25000, taxCode: 'BR' }));
    expect(r.taxFreeAmount).toBe(0);
    expect(r.incomeTax.annually).toBeCloseTo(5000.04, 2);
  });

  it('K-code increases taxable income (negative allowance)', () => {
    const r = calculateTax(createInput({ salary: 40000, taxCode: 'K100' }));
    expect(r.taxFreeAmount).toBe(-1000);
    // Taxable income is higher than salary (after pension) because allowance is negative.
    expect(r.taxableIncome).toBeGreaterThan(40000);
  });
});
