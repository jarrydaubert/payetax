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
  reachedStatePensionAge: false,
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

  it.each([
    ['', 457],
    ['1257L', 290.2],
  ])(
    'adds rent to gross and uses the matching PAYE scope for code "%s"',
    (taxCode, monthlyTaxWithRent) => {
      const input = createInput({ salary: 30000, taxCode, studentLoanPlans: ['plan2'] });
      const base = calculateTax(input);
      const withRental = calculateTax({
        ...input,
        incomeSources: [{ id: 'r1', type: 'rental', amount: 10000, period: 'annually' }],
      });

      // 2025/26, Month 1 Tables A free pay of £1,048.26 leaves £1,451 of
      // £2,500 wages or £2,285 of £40,000/12 combined pay at 20%.
      expect(totalGrossAnnual(base)).toBe(30000);
      expect(totalGrossAnnual(withRental)).toBe(40000);
      expect(base.incomeTax.monthly).toBe(290.2);
      expect(withRental.incomeTax.monthly).toBe(monthlyTaxWithRent);
      // NI and Plan 2 are both calculated on the £2,500 wage. Their monthly
      // thresholds are £1,048 at 8% and £2,372.50 at 9% (down to whole pounds).
      for (const result of [base, withRental]) {
        expect(result.nationalInsurance.monthly).toBe(116.16);
        expect(result.studentLoan.monthly).toBe(11);
      }
    },
  );

  it('BR tax code implies 0 allowance and a single-rate income tax calculation', () => {
    const r = calculateTax(createInput({ salary: 25000, taxCode: 'BR' }));
    expect(r.taxFreeAmount).toBe(0);
    expect(r.incomeTax.annually).toBeCloseTo(4999.2, 2);
  });

  it('K-code increases taxable income (negative allowance)', () => {
    const r = calculateTax(createInput({ salary: 40000, taxCode: 'K100' }));
    expect(r.taxFreeAmount).toBe(-1000);
    // Taxable income is higher than salary (after pension) because allowance is negative.
    expect(r.taxableIncome).toBeGreaterThan(40000);
  });

  it('sampled salary grid keeps accounting sanity: non-negative deductions and net <= gross', () => {
    const salaries = [12570, 18000, 30000, 50270, 75000, 99999, 120000];

    for (const salary of salaries) {
      const r = calculateTax(createInput({ salary }));
      const gross = totalGrossAnnual(r);

      expect(r.incomeTax.annually).toBeGreaterThanOrEqual(0);
      expect(r.nationalInsurance.annually).toBeGreaterThanOrEqual(0);
      expect(r.studentLoan.annually).toBeGreaterThanOrEqual(0);
      expect(r.netPay.annually).toBeLessThanOrEqual(gross);
    }
  });

  it('sampled salary grid is monotonic for annual net pay (rUK + Scottish)', () => {
    const salaries = [12000, 18000, 25000, 35000, 50000, 70000, 90000];

    const assertNonDecreasing = (region: 'rUK' | 'Scotland') => {
      let lastNet = Number.NEGATIVE_INFINITY;
      for (const salary of salaries) {
        const r = calculateTax(
          createInput({
            salary,
            isScottish: region === 'Scotland',
            taxCode: region === 'Scotland' ? 'S1257L' : '1257L',
          }),
        );
        expect(r.netPay.annually).toBeGreaterThanOrEqual(lastNet);
        lastNet = r.netPay.annually;
      }
    };

    assertNonDecreasing('rUK');
    assertNonDecreasing('Scotland');
  });
});
