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

    it('applies personal allowance taper using the current £2-step rule', () => {
      expect(calculateIncomeTax(100003, 'rUK').personalAllowance).toBe(12570);
      expect(calculateIncomeTax(100004, 'rUK').personalAllowance).toBe(12568);
      expect(calculateIncomeTax(112570, 'rUK').personalAllowance).toBe(6286);
      expect(calculateIncomeTax(125139, 'rUK').personalAllowance).toBe(2);
      expect(calculateIncomeTax(125140, 'rUK').personalAllowance).toBe(0);
    });
  });

  describe('calculateIncomeTax (Scotland)', () => {
    it('handles Scottish 2025-26 band boundaries', () => {
      expect(calculateIncomeTax(15397, 'scotland').incomeTax).toBeCloseTo(537.13, 2);
      expect(calculateIncomeTax(27491, 'scotland').incomeTax).toBeCloseTo(2955.93, 2);
      expect(calculateIncomeTax(43662, 'scotland').incomeTax).toBeCloseTo(6351.84, 2);
      expect(calculateIncomeTax(75000, 'scotland').incomeTax).toBeCloseTo(19513.8, 2);
      expect(calculateIncomeTax(125140, 'scotland').incomeTax).toBeCloseTo(48110.4, 2);
    });

    it('taxes the first pound into the next band at each boundary', () => {
      expect(calculateIncomeTax(15398, 'scotland').incomeTax).toBeCloseTo(537.33, 2);
      expect(calculateIncomeTax(27492, 'scotland').incomeTax).toBeCloseTo(2956.14, 2);
      expect(calculateIncomeTax(43663, 'scotland').incomeTax).toBeCloseTo(6352.26, 2);
      expect(calculateIncomeTax(75001, 'scotland').incomeTax).toBeCloseTo(19514.25, 2);
      expect(calculateIncomeTax(125141, 'scotland').incomeTax).toBeCloseTo(48110.88, 2);
    });
  });

  describe('getIncomeTax', () => {
    it('returns the same value as calculateIncomeTax().incomeTax', () => {
      const salary = 60000;
      const detailed = calculateIncomeTax(salary, 'rUK', '2025-2026');
      expect(getIncomeTax(salary, 'rUK', '2025-2026')).toBe(detailed.incomeTax);
    });

    it('defaults to 2025-2026 tax year', () => {
      expect(getIncomeTax(60000, 'rUK')).toBe(getIncomeTax(60000, 'rUK', '2025-2026'));
    });
  });
});
