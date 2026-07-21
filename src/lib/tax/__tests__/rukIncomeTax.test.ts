/**
 * Shared rUK progressive band mechanic.
 *
 * What bug will this test find?
 * - BAND-MATH: wrong allocation at exact boundaries or in the open top band
 * - PARITY-DRIFT: divergence from the three pre-unification band loops
 *   (engine rUK branch, standalone calculateIncomeTax, marriage allowance)
 * - OVERRIDE-LEAK: tax-code band overrides entering the progressive slicer
 */

import { calculateIncomeTax, calculateTax, type RukTaxableIncomeBand } from '@/lib/tax';
import { sliceRukTaxableIncome } from '../rukIncomeTax';

// 2025-26 statutory taxable-income upper bounds.
const BANDS: RukTaxableIncomeBand[] = [
  { name: 'Basic rate', rate: 20, taxableIncomeUpperBound: 37_700 },
  { name: 'Higher rate', rate: 40, taxableIncomeUpperBound: 125_140 },
  { name: 'Additional rate', rate: 45, taxableIncomeUpperBound: Number.POSITIVE_INFINITY },
];

describe('sliceRukTaxableIncome', () => {
  it('returns no slices and no tax for zero, negative and non-finite income', () => {
    for (const income of [0, -1, Number.NaN, Number.NEGATIVE_INFINITY]) {
      const result = sliceRukTaxableIncome(income, BANDS);
      expect(result.taxableIncome).toBe(0);
      expect(result.incomeTax).toBe(0);
      expect(result.slices).toEqual([]);
    }
  });

  it('taxes income inside the basic band at 20% only', () => {
    const result = sliceRukTaxableIncome(10_000, BANDS);
    expect(result.incomeTax).toBe(2_000);
    expect(result.slices).toEqual([
      {
        name: 'Basic rate',
        rate: 20,
        taxableIncomeLowerBound: 0,
        taxableIncomeUpperBound: 37_700,
        taxableAmount: 10_000,
        tax: 2_000,
      },
    ]);
  });

  it('fills the basic band exactly at its boundary without opening the higher band', () => {
    const result = sliceRukTaxableIncome(37_700, BANDS);
    expect(result.incomeTax).toBe(7_540);
    expect(result.slices).toHaveLength(1);
    expect(result.slices[0]?.taxableAmount).toBe(37_700);
  });

  it('allocates a single pound crossing the basic boundary to the higher band', () => {
    const result = sliceRukTaxableIncome(37_701, BANDS);
    expect(result.slices).toHaveLength(2);
    expect(result.slices[0]?.taxableAmount).toBe(37_700);
    expect(result.slices[1]?.taxableAmount).toBe(1);
    expect(result.incomeTax).toBeCloseTo(7_540.4, 10);
  });

  it('fills the higher band exactly at its boundary without opening the additional band', () => {
    const result = sliceRukTaxableIncome(125_140, BANDS);
    expect(result.slices).toHaveLength(2);
    expect(result.slices[1]?.taxableAmount).toBe(125_140 - 37_700);
    expect(result.incomeTax).toBe(7_540 + 34_976);
  });

  it('allocates income reaching the open-ended additional band across all three bands', () => {
    const result = sliceRukTaxableIncome(150_000, BANDS);
    expect(result.slices).toHaveLength(3);
    expect(result.slices.map((slice) => slice.taxableAmount)).toEqual([37_700, 87_440, 24_860]);
    expect(result.incomeTax).toBe(7_540 + 34_976 + 11_187);
    const sliceSum = result.slices.reduce((sum, slice) => sum + slice.tax, 0);
    expect(sliceSum).toBe(result.incomeTax);
  });

  it('applies each band exactly once with contiguous bounds', () => {
    const result = sliceRukTaxableIncome(200_000, BANDS);
    expect(new Set(result.slices.map((slice) => slice.name)).size).toBe(result.slices.length);
    let expectedLowerBound = 0;
    for (const slice of result.slices) {
      expect(slice.taxableIncomeLowerBound).toBe(expectedLowerBound);
      expectedLowerBound = slice.taxableIncomeUpperBound;
    }
  });

  it('never produces a negative allocation from a degenerate band table', () => {
    const degenerate: RukTaxableIncomeBand[] = [
      { name: 'Basic rate', rate: 20, taxableIncomeUpperBound: 37_700 },
      // Duplicate and regressive bounds collapse to zero-width bands, not
      // negative tax — stricter than the loops this mechanic replaced.
      { name: 'Duplicate', rate: 40, taxableIncomeUpperBound: 37_700 },
      { name: 'Regressive', rate: 45, taxableIncomeUpperBound: 20_000 },
      { name: 'Open', rate: 45, taxableIncomeUpperBound: Number.POSITIVE_INFINITY },
    ];

    const result = sliceRukTaxableIncome(50_000, degenerate);
    expect(result.slices.map((slice) => slice.name)).toEqual(['Basic rate', 'Open']);
    expect(result.slices.every((slice) => slice.taxableAmount > 0)).toBe(true);
    expect(result.incomeTax).toBe(7_540 + 5_535);
  });

  it('returns no slices for an empty band table', () => {
    const result = sliceRukTaxableIncome(50_000, []);
    expect(result.incomeTax).toBe(0);
    expect(result.slices).toEqual([]);
  });
});

describe('parity with the replaced band loops', () => {
  // The pre-unification engine/marriage loop, preserved as an oracle:
  // cumulative thresholds, (amount * rate) / 100 ordering.
  function referenceBandLoop(taxableIncome: number, bands: RukTaxableIncomeBand[]): number {
    let remaining = Math.max(0, taxableIncome);
    let previousThreshold = 0;
    let tax = 0;
    for (const band of bands) {
      const bandWidth = Math.max(0, band.taxableIncomeUpperBound - previousThreshold);
      const incomeInBand = Math.min(remaining, bandWidth);
      if (incomeInBand > 0) {
        tax += (incomeInBand * band.rate) / 100;
        remaining -= incomeInBand;
      }
      if (remaining <= 0) break;
      previousThreshold = band.taxableIncomeUpperBound;
    }
    return tax;
  }

  it('matches the replaced loops exactly across boundaries and a broad sweep', () => {
    // Whole-pound incomes keep every intermediate value exact, so parity with
    // the reference loop is asserted bit-for-bit, not approximately.
    const incomes: number[] = [];
    for (const boundary of [37_700, 125_140]) {
      incomes.push(boundary - 1, boundary, boundary + 1);
    }
    for (let income = 0; income <= 220_000; income += 997) {
      incomes.push(income);
    }

    for (const income of incomes) {
      expect(sliceRukTaxableIncome(income, BANDS).incomeTax).toBe(referenceBandLoop(income, BANDS));
    }
  });

  it('keeps standalone rUK calculateIncomeTax values pinned', () => {
    // Hand-derived from 2025-26 statutory bands, matching pre-unification outputs.
    expect(calculateIncomeTax(50_270, 'rUK', '2025-2026').incomeTax).toBe(7_540);
    expect(calculateIncomeTax(60_000, 'rUK', '2025-2026').incomeTax).toBe(11_432);
    // £150k tapers the Personal Allowance to zero: 7,540 + 34,976 + 11,187.
    expect(calculateIncomeTax(150_000, 'rUK', '2025-2026').incomeTax).toBe(53_703);
  });

  it('keeps tax-code band overrides outside the progressive slicer', () => {
    const result = calculateTax({
      salary: 60_000,
      payPeriod: 'annually',
      taxYear: '2025-2026',
      taxCode: 'D0',
      isScottish: false,
      isMarried: false,
      partnerGrossWage: 0,
      isBlind: false,
      payNoNI: false,
      pensionContribution: 0,
      pensionContributionType: 'percentage',
      studentLoanPlans: 'none',
      niCategory: 'A',
      hoursPerWeek: 37.5,
    });

    // A D0 override taxes everything at one flat rate: exactly one band, no
    // progressive slices.
    expect(result.taxBands).toHaveLength(1);
    expect(result.taxBands[0]?.rate).toBe(40);
  });
});
