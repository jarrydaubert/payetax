/**
 * Tax Code Override Tests
 *
 * What bug will this test find?
 * - TAX-CODE-OVERRIDES: BR/D0/D1/NT/0T rules regressing or not applying
 */

import { calculateTax, type TaxCalculationInput } from '../taxCalculator';

const baseInput: TaxCalculationInput = {
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
};

describe('Tax code overrides', () => {
  it('BR taxes all income at 20% with zero allowance', () => {
    const result = calculateTax({ ...baseInput, taxCode: 'BR' });

    expect(result.taxFreeAmount).toBe(0);
    expect(result.incomeTax.annually).toBeCloseTo(6000, 2); // 20% of 30,000
  });

  it('D0 taxes all income at 40% with zero allowance', () => {
    const result = calculateTax({ ...baseInput, taxCode: 'D0' });

    expect(result.taxFreeAmount).toBe(0);
    expect(result.incomeTax.annually).toBeCloseTo(12000, 2); // 40% of 30,000
  });

  it('D1 taxes all income at 45% with zero allowance', () => {
    const result = calculateTax({ ...baseInput, taxCode: 'D1' });

    expect(result.taxFreeAmount).toBe(0);
    expect(result.incomeTax.annually).toBeCloseTo(13500, 2); // 45% of 30,000
  });

  it('NT applies no income tax', () => {
    const result = calculateTax({ ...baseInput, taxCode: 'NT' });

    expect(result.taxFreeAmount).toBe(0);
    expect(result.incomeTax.annually).toBe(0);
  });

  it('0T applies normal bands with zero allowance', () => {
    const result = calculateTax({ ...baseInput, taxCode: '0T', salary: 10000 });

    // No allowance, so full income is taxable at 20% basic rate
    expect(result.taxFreeAmount).toBe(0);
    expect(result.incomeTax.annually).toBeCloseTo(1999.2, 2);
  });

  it('K codes create negative allowance and increase taxable income', () => {
    const result = calculateTax({ ...baseInput, taxCode: 'K100' });

    expect(result.taxFreeAmount).toBe(-1000);
    expect(result.taxableIncome).toBeCloseTo(30996, 2);
  });

  describe('Scottish flat-rate codes in years without an Advanced rate band', () => {
    // 2023-24 Scotland had five bands (no Advanced rate): SD2 was the top-rate
    // code that year, so the top-band fallback is the statutorily correct rate.
    it('SD2 in 2023-24 falls back to the top rate (47%) and is labelled as such', () => {
      const result = calculateTax({ ...baseInput, taxYear: '2023-2024', taxCode: 'SD2' });

      expect(result.taxFreeAmount).toBe(0);
      expect(result.taxBands).toHaveLength(1);
      expect(result.taxBands[0]?.rate).toBe(47);
      // No Advanced rate existed in 2023-24, so the label must say Top Rate.
      expect(result.taxBands[0]?.name).toBe('Scottish Top Rate (SD2 code)');
      expect(result.incomeTax.annually).toBeCloseTo(14100, 2); // 47% of £30,000
    });

    it('SD3 in 2023-24 resolves to the top rate (47%)', () => {
      const result = calculateTax({ ...baseInput, taxYear: '2023-2024', taxCode: 'SD3' });

      expect(result.taxBands[0]?.rate).toBe(47);
      expect(result.incomeTax.annually).toBeCloseTo(14100, 2);
    });
  });
});
