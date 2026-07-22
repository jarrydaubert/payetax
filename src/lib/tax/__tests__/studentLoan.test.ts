import { calculateTax, type TaxCalculationInput } from '@/lib/tax';
import {
  getStudentLoanRepayment,
  getStudentLoanThreshold,
  sliceStudentLoanRepayments,
} from '../studentLoan';

describe('Student Loan Calculator', () => {
  const taxYear = '2025-2026';
  const previousTaxYear = '2024-2025';

  describe('getStudentLoanRepayment', () => {
    it('returns zero for empty plans array', () => {
      const result = getStudentLoanRepayment(50000, [], taxYear);
      expect(result.total).toBe(0);
    });

    it('returns zero for income below threshold', () => {
      // Plan 2 threshold is £28,470
      const result = getStudentLoanRepayment(25000, ['plan2'], taxYear);
      expect(result.total).toBe(0);
      expect(result.plan2).toBe(0);
    });

    it('calculates Plan 2 correctly for director with salary + dividends', () => {
      // Director with £12,570 salary + £35,000 dividends = £47,570 total
      // Plan 2: 9% of (£47,570 - £28,470) = 9% of £19,100 = £1,719
      const result = getStudentLoanRepayment(47570, ['plan2'], taxYear);
      expect(result.plan2).toBe(1719);
      expect(result.total).toBe(1719);
    });

    it('calculates Plan 1 correctly', () => {
      // Plan 1 threshold is £26,065
      // 9% of (£50,000 - £26,065) = 9% of £23,935 = £2,154.15
      const result = getStudentLoanRepayment(50000, ['plan1'], taxYear);
      expect(result.plan1).toBeCloseTo(2154.15, 2);
      expect(result.total).toBeCloseTo(2154.15, 2);
    });

    it('calculates postgrad loan at 6%', () => {
      // Postgrad threshold is £21,000
      // 6% of (£50,000 - £21,000) = 6% of £29,000 = £1,740
      const result = getStudentLoanRepayment(50000, ['postgrad'], taxYear);
      expect(result.postgrad).toBe(1740);
      expect(result.total).toBe(1740);
    });

    it('calculates multiple loans together', () => {
      // Plan 2: 9% of (£60,000 - £28,470) = £2,837.70
      // Postgrad: 6% of (£60,000 - £21,000) = £2,340
      // Total: £5,177.70
      const result = getStudentLoanRepayment(60000, ['plan2', 'postgrad'], taxYear);
      expect(result.plan2).toBeCloseTo(2837.7, 2);
      expect(result.postgrad).toBeCloseTo(2340, 2);
      expect(result.total).toBeCloseTo(5177.7, 2);
    });

    it('handles zero income', () => {
      const result = getStudentLoanRepayment(0, ['plan2'], taxYear);
      expect(result.total).toBe(0);
    });

    it('handles negative income', () => {
      const result = getStudentLoanRepayment(-5000, ['plan2'], taxYear);
      expect(result.total).toBe(0);
    });
  });

  describe('getStudentLoanThreshold', () => {
    it('returns correct thresholds for 2025-26', () => {
      expect(getStudentLoanThreshold('plan1', taxYear)).toBe(26065);
      expect(getStudentLoanThreshold('plan2', taxYear)).toBe(28470);
      expect(getStudentLoanThreshold('plan4', taxYear)).toBe(32745);
      expect(getStudentLoanThreshold('postgrad', taxYear)).toBe(21000);
    });

    it('returns the corrected Plan 4 threshold for 2024-25', () => {
      expect(getStudentLoanThreshold('plan4', previousTaxYear)).toBe(31395);
    });
  });

  describe('2024-25 Plan 4 regression', () => {
    it('does not repay at the threshold and starts above it', () => {
      const atThreshold = getStudentLoanRepayment(31395, ['plan4'], previousTaxYear);
      const aboveThreshold = getStudentLoanRepayment(31396, ['plan4'], previousTaxYear);

      expect(atThreshold.plan4).toBe(0);
      expect(atThreshold.total).toBe(0);
      expect(aboveThreshold.plan4).toBeCloseTo(0.09, 2);
      expect(aboveThreshold.total).toBeCloseTo(0.09, 2);
    });
  });

  describe('Integration with director scenarios', () => {
    it('correctly calculates student loan on £12,570 salary + dividends', () => {
      // Typical director: £12,570 salary, £40,000 dividends = £52,570 total
      // Plan 2: 9% of (£52,570 - £28,470) = 9% of £24,100 = £2,169
      const result = getStudentLoanRepayment(52570, ['plan2'], taxYear);
      expect(result.plan2).toBe(2169);
    });

    it('shows dividend income IS subject to student loans via SA', () => {
      // If someone thought dividends avoid student loans, they'd expect £0
      // But dividends DO count via Self Assessment
      const totalIncome = 12570 + 50000; // salary + dividends
      const result = getStudentLoanRepayment(totalIncome, ['plan2'], taxYear);
      expect(result.plan2).toBeGreaterThan(0);
      // 9% of (£62,570 - £28,470) = 9% of £34,100 = £3,069
      expect(result.plan2).toBe(3069);
    });
  });
});

describe('sliceStudentLoanRepayments', () => {
  // 2025-26 annual policy, restated literally so the mechanic is tested
  // against fixed numbers rather than the constants it must not select.
  const POLICY = {
    plan1: { threshold: 26_065, rate: 9 },
    plan2: { threshold: 28_470, rate: 9 },
    plan4: { threshold: 32_745, rate: 9 },
    plan5: { threshold: 25_000, rate: 9 },
    postgrad: { threshold: 21_000, rate: 6 },
  } as const;
  const ALL_PLANS = ['plan1', 'plan2', 'plan4', 'plan5', 'postgrad'] as const;

  it('returns nothing for zero, negative and non-finite income', () => {
    for (const income of [
      0,
      -5000,
      Number.NaN,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
    ]) {
      const result = sliceStudentLoanRepayments(income, ALL_PLANS, POLICY);
      expect(result.repayments).toEqual([]);
      expect(result.total).toBe(0);
    }
  });

  it('returns nothing when no plans are selected', () => {
    const result = sliceStudentLoanRepayments(50_000, [], POLICY);
    expect(result.repayments).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('counts a duplicated plan selection once per occurrence, as the replaced loops did', () => {
    const result = sliceStudentLoanRepayments(50_000, ['plan2', 'plan2'], POLICY);
    expect(result.repayments).toEqual([
      { plan: 'plan2', repayment: 1_937.7 },
      { plan: 'plan2', repayment: 1_937.7 },
    ]);
    expect(result.total).toBe(2 * 1_937.7);
  });

  it.each([
    ['plan1', 26_065],
    ['plan2', 28_470],
    ['plan4', 32_745],
    ['plan5', 25_000],
    ['postgrad', 21_000],
  ] as const)('%s repays nothing below or exactly at its threshold', (plan, threshold) => {
    expect(sliceStudentLoanRepayments(threshold - 1, [plan], POLICY).total).toBe(0);
    expect(sliceStudentLoanRepayments(threshold, [plan], POLICY).total).toBe(0);

    const above = sliceStudentLoanRepayments(threshold + 100, [plan], POLICY);
    const rate = POLICY[plan].rate;
    expect(above.repayments).toEqual([{ plan, repayment: (100 * rate) / 100 }]);
    expect(above.total).toBe(rate);
  });

  it.each([
    ['plan1', 2_154.15],
    ['plan2', 1_937.7],
    ['plan4', 1_552.95],
    ['plan5', 2_250],
    ['postgrad', 1_740],
  ] as const)('applies the %s rate to income above its threshold', (plan, expected) => {
    const result = sliceStudentLoanRepayments(50_000, [plan], POLICY);
    expect(result.repayments).toEqual([{ plan, repayment: expected }]);
    expect(result.total).toBe(expected);
  });

  it('calculates multiple selected plans independently and sums them', () => {
    const result = sliceStudentLoanRepayments(60_000, ['plan2', 'postgrad'], POLICY);
    expect(result.repayments).toEqual([
      { plan: 'plan2', repayment: 2_837.7 },
      { plan: 'postgrad', repayment: 2_340 },
    ]);
    expect(result.total).toBe(2_837.7 + 2_340);
  });

  it('keeps the total equal to the sum of the per-plan breakdown', () => {
    const result = sliceStudentLoanRepayments(80_000, ALL_PLANS, POLICY);
    expect(result.repayments).toHaveLength(5);
    const sum = result.repayments.reduce((acc, entry) => acc + entry.repayment, 0);
    expect(result.total).toBe(sum);
  });

  it('returns unrounded repayments so callers own their rounding convention', () => {
    const result = sliceStudentLoanRepayments(30_000.55, ['plan2'], POLICY);
    expect(result.repayments[0]?.repayment).toBeCloseTo(137.7495, 6);
    // The Self Assessment caller rounds this to pence per plan.
    expect(getStudentLoanRepayment(30_000.55, ['plan2'], '2025-2026').plan2).toBe(137.75);
  });

  it('skips plans with no policy entry rather than throwing', () => {
    const result = sliceStudentLoanRepayments(50_000, ['plan2', 'plan5'], {
      plan2: POLICY.plan2,
    });
    expect(result.repayments).toEqual([{ plan: 'plan2', repayment: 1_937.7 }]);
  });
});

describe('PAYE engine parity', () => {
  const engineInput = (
    salary: number,
    overrides: Partial<TaxCalculationInput> = {},
  ): TaxCalculationInput => ({
    salary,
    payPeriod: 'annually',
    taxYear: '2025-2026',
    taxCode: '1257L',
    isScottish: false,
    isMarried: false,
    partnerGrossWage: 0,
    isBlind: false,
    payNoNI: false,
    pensionContribution: 0,
    pensionContributionType: 'percentage',
    studentLoanPlans: ['plan2'],
    niCategory: 'A',
    hoursPerWeek: 37.5,
    ...overrides,
  });

  it('keeps the monthly sum-then-round PAYE convention pinned', () => {
    // £36,000 salary -> £3,000/month; plan 2 monthly threshold 28,470 / 12.
    // ((3,000 - 2,372.50) * 9) / 100 = 56.475 -> rounded once to 56.48.
    const result = calculateTax(engineInput(36_000));
    expect(result.studentLoan.monthly).toBe(56.48);
    expect(result.studentLoan.annually).toBeCloseTo(56.48 * 12, 10);
  });

  it('sums unrounded plan repayments before rounding, not per plan', () => {
    // £36,000.84 across plan 2 + postgrad: 56.4813 + 75.0042 per month.
    // Sum-then-round gives 131.49; round-each-then-sum would give 131.48.
    const result = calculateTax(
      engineInput(36_000.84, { studentLoanPlans: ['plan2', 'postgrad'] }),
    );
    expect(result.studentLoan.monthly).toBe(131.49);
  });

  it('keeps employment income as the PAYE basis when other income exists', () => {
    const salaryOnly = calculateTax(engineInput(36_000));
    const withRental = calculateTax(
      engineInput(36_000, {
        incomeSources: [{ id: 'rental-1', type: 'rental', amount: 24_000, period: 'annually' }],
      }),
    );

    // Rental income raises tax but must not enter the PAYE student loan basis.
    expect(withRental.studentLoan.annually).toBe(salaryOnly.studentLoan.annually);
    expect(withRental.studentLoan.monthly).toBe(salaryOnly.studentLoan.monthly);
  });
});
