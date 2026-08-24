import {
  calculateMonth1ProgressiveIncomeTax,
  getExactMonth1Threshold,
  getMonth1Cvalue,
  type Month1IncomeTaxBand,
  roundDownPayeTaxToPence,
} from '../month1IncomeTax';

// Independent literals from HMRC PAYE routines v24.0 appendices A and B.
// These are deliberately not imported from production policy.
const RUK_2026_27_BANDS: Month1IncomeTaxBand[] = [
  { rate: 20, taxableIncomeUpperBound: 37_700 },
  { rate: 40, taxableIncomeUpperBound: 125_140 },
  { rate: 45, taxableIncomeUpperBound: Number.POSITIVE_INFINITY },
];

const SCOTTISH_2026_27_BANDS: Month1IncomeTaxBand[] = [
  { rate: 19, taxableIncomeUpperBound: 3_967 },
  { rate: 20, taxableIncomeUpperBound: 16_956 },
  { rate: 21, taxableIncomeUpperBound: 31_092 },
  { rate: 42, taxableIncomeUpperBound: 62_430 },
  { rate: 45, taxableIncomeUpperBound: 125_140 },
  { rate: 48, taxableIncomeUpperBound: Number.POSITIVE_INFINITY },
];

describe('HMRC Month 1 progressive Income Tax routine', () => {
  it('keeps the exact accrued threshold separate from rounded-up Cvalue', () => {
    expect(getExactMonth1Threshold(37_700)).toBe(3_141.6666);
    expect(getMonth1Cvalue(37_700)).toBe(3_142);
  });

  it('selects the rUK formula with Cvalue but calculates from exact threshold values', () => {
    const result = calculateMonth1ProgressiveIncomeTax(3_951.74, RUK_2026_27_BANDS);

    expect(result.formulaIndex).toBe(1);
    expect(result.wholePoundTaxablePay).toBe(3_951);
    expect(result.cvalue).toBe(3_142);
    expect(result.exactThreshold).toBe(3_141.6666);
    expect(result.exactThresholdTax).toBe(628.3333);
    expect(result.incomeTaxAtFourDecimals).toBe(952.0666);
    expect(roundDownPayeTaxToPence(result.incomeTaxAtFourDecimals)).toBe(952.06);
  });

  it('uses unrounded Scottish taxable pay for SCvalue formula selection', () => {
    const result = calculateMonth1ProgressiveIncomeTax(5_203.5, SCOTTISH_2026_27_BANDS);

    // U=£5,203.50 exceeds SCvalue £5,203, so formula 5 applies even though T=£5,203.
    expect(result.formulaIndex).toBe(4);
    expect(result.wholePoundTaxablePay).toBe(5_203);
    expect(result.cvalue).toBe(5_203);
    expect(result.exactThreshold).toBe(5_202.5);
    expect(result.exactThresholdTax).toBe(1_623.5041);
    expect(result.incomeTaxAtFourDecimals).toBe(1_623.7291);
    expect(roundDownPayeTaxToPence(result.incomeTaxAtFourDecimals)).toBe(1_623.72);
  });

  it('does not let binary noise move an exact SCvalue into the next formula', () => {
    const result = calculateMonth1ProgressiveIncomeTax(
      5_203.000_000_000_001,
      SCOTTISH_2026_27_BANDS,
    );

    expect(result.formulaIndex).toBe(3);
    expect(result.wholePoundTaxablePay).toBe(5_203);
    expect(roundDownPayeTaxToPence(result.incomeTaxAtFourDecimals)).toBe(1_623.71);
  });

  it('does not floor a whole-pound value down because of binary noise', () => {
    const result = calculateMonth1ProgressiveIncomeTax(
      5_202.999_999_999_999,
      SCOTTISH_2026_27_BANDS,
    );

    expect(result.formulaIndex).toBe(3);
    expect(result.wholePoundTaxablePay).toBe(5_203);
    expect(roundDownPayeTaxToPence(result.incomeTaxAtFourDecimals)).toBe(1_623.71);
  });

  it('uses exact Scottish threshold tax rather than rounded SCvalue band slices', () => {
    const result = calculateMonth1ProgressiveIncomeTax(9_785, SCOTTISH_2026_27_BANDS);

    expect(result.formulaIndex).toBe(4);
    expect(result.incomeTaxAtFourDecimals).toBe(3_685.6291);
    expect(roundDownPayeTaxToPence(result.incomeTaxAtFourDecimals)).toBe(3_685.62);
  });

  it('rounds an exact £4.60 result down without losing a penny to binary floating point', () => {
    const result = calculateMonth1ProgressiveIncomeTax(23.0733, RUK_2026_27_BANDS);

    expect(result.incomeTaxAtFourDecimals).toBe(4.6);
    expect(roundDownPayeTaxToPence(result.incomeTaxAtFourDecimals)).toBe(4.6);
    expect(roundDownPayeTaxToPence(4.599_999)).toBe(4.59);
  });
});
