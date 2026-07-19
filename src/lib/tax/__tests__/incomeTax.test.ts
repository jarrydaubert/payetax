/**
 * Income Tax calculator boundary tests.
 *
 * These tests target pure function boundaries so regressions are caught
 * without relying on larger integration suites.
 */

import { calculateIncomeTax, getIncomeTax } from '../incomeTax';

describe('Income Tax Calculator', () => {
  describe('calculateIncomeTax (rUK)', () => {
    it('returns zero tax for non-finite or non-positive salary', () => {
      expect(calculateIncomeTax(Number.NaN, 'rUK')).toMatchObject({
        salary: 0,
        incomeTax: 0,
        personalAllowance: 12570,
        taxableIncome: 0,
        effectiveRate: 0,
      });
      expect(calculateIncomeTax(Number.POSITIVE_INFINITY, 'rUK').incomeTax).toBe(0);
      expect(calculateIncomeTax(Number.NEGATIVE_INFINITY, 'rUK').incomeTax).toBe(0);
      expect(calculateIncomeTax(0, 'rUK').incomeTax).toBe(0);
      expect(calculateIncomeTax(-1000, 'rUK').incomeTax).toBe(0);
    });

    it('handles basic-rate boundary correctly', () => {
      expect(calculateIncomeTax(12570, 'rUK')).toMatchObject({
        incomeTax: 0,
        personalAllowance: 12570,
        taxableIncome: 0,
      });
      expect(calculateIncomeTax(12571, 'rUK').incomeTax).toBeCloseTo(0.2, 2);
      expect(calculateIncomeTax(50270, 'rUK').incomeTax).toBeCloseTo(7540, 2);
      expect(calculateIncomeTax(50271, 'rUK').incomeTax).toBeCloseTo(7540.4, 2);
    });

    it('handles higher and additional-rate boundaries correctly', () => {
      expect(calculateIncomeTax(125140, 'rUK')).toMatchObject({
        incomeTax: 42516,
        personalAllowance: 0,
        taxableIncome: 125140,
      });
      expect(calculateIncomeTax(125141, 'rUK').incomeTax).toBeCloseTo(42516.45, 2);
    });

    it('applies the HMRC whole-pound personal allowance taper at odd-pound boundaries', () => {
      expect(calculateIncomeTax(100001, 'rUK').personalAllowance).toBe(12570);
      expect(calculateIncomeTax(100003, 'rUK').personalAllowance).toBe(12569);
      expect(calculateIncomeTax(112570, 'rUK').personalAllowance).toBe(6285);
      expect(calculateIncomeTax(125139, 'rUK').personalAllowance).toBe(1);
      expect(calculateIncomeTax(125140, 'rUK').personalAllowance).toBe(0);
    });

    it('can taper salary tax using dividend-inclusive adjusted net income', () => {
      const result = calculateIncomeTax(12570, 'rUK', '2026-2027', 116496.46);

      expect(result.personalAllowance).toBe(4322);
      expect(result.taxableIncome).toBe(8248);
      expect(result.incomeTax).toBe(1649.6);
    });
  });

  describe('calculateIncomeTax (Scotland)', () => {
    it('handles Scottish 2026-27 band boundaries', () => {
      expect(calculateIncomeTax(15397, 'scotland').incomeTax).toBeCloseTo(537.13, 2);
      expect(calculateIncomeTax(27491, 'scotland').incomeTax).toBeCloseTo(2944.53, 2);
      expect(calculateIncomeTax(43662, 'scotland').incomeTax).toBeCloseTo(6320.09, 2);
      expect(calculateIncomeTax(75000, 'scotland').incomeTax).toBeCloseTo(19482.05, 2);
      // Advanced band runs to £125,140 TAXABLE (SRR); at £125,140 total income
      // the PA is fully tapered, so nothing is taxed at the 48% top rate yet:
      // 3,967x19% + 12,989x20% + 14,136x21% + 31,338x42% + 62,710x45% = 47,701.55
      expect(calculateIncomeTax(125140, 'scotland').incomeTax).toBeCloseTo(47701.55, 2);
    });

    it('taxes the first pound into the next band at each boundary', () => {
      expect(calculateIncomeTax(15398, 'scotland').incomeTax).toBeCloseTo(537.32, 2);
      expect(calculateIncomeTax(27492, 'scotland').incomeTax).toBeCloseTo(2944.73, 2);
      expect(calculateIncomeTax(43663, 'scotland').incomeTax).toBeCloseTo(6320.51, 2);
      expect(calculateIncomeTax(75001, 'scotland').incomeTax).toBeCloseTo(19482.5, 2);
      // First pound above the £125,140 taxable boundary is taxed at 48%.
      expect(calculateIncomeTax(125141, 'scotland').incomeTax).toBeCloseTo(47702.03, 2);
    });
  });

  describe('getIncomeTax', () => {
    it('returns the same value as calculateIncomeTax().incomeTax', () => {
      const salary = 60000;
      const detailed = calculateIncomeTax(salary, 'rUK', '2025-2026');
      expect(getIncomeTax(salary, 'rUK', '2025-2026')).toBe(detailed.incomeTax);
    });

    it('defaults to the latest supported tax year', () => {
      expect(getIncomeTax(60000, 'rUK')).toBe(getIncomeTax(60000, 'rUK', '2026-2027'));
    });
  });
});
