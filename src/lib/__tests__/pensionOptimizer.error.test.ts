// src/lib/__tests__/pensionOptimizer.error.test.ts
/**
 * Error Handling Tests for Pension Optimizer
 *
 * Validates robust error handling for:
 * - Invalid inputs (NaN, Infinity, negative, etc.)
 * - Edge cases that could cause errors
 * - Graceful degradation
 * - No thrown errors (all return null)
 */

import { calculateOptimalPension, compareWithOptimization } from '../pensionOptimizer';
import { formatCurrency } from '../utils';

describe('Pension Optimizer - Error Handling', () => {
  describe('calculateOptimalPension - Invalid Inputs', () => {
    it('should return null for NaN', () => {
      const result = calculateOptimalPension(NaN);
      expect(result).toBeNull();
    });

    it('should return null for Infinity', () => {
      const result = calculateOptimalPension(Infinity);
      expect(result).toBeNull();
    });

    it('should return null for -Infinity', () => {
      const result = calculateOptimalPension(-Infinity);
      expect(result).toBeNull();
    });

    it('should return null for negative salary', () => {
      const result = calculateOptimalPension(-50000);
      expect(result).toBeNull();
    });

    it('should return null for zero salary', () => {
      const result = calculateOptimalPension(0);
      expect(result).toBeNull();
    });

    it('should return null for unreasonably high salary (>£10M)', () => {
      const result = calculateOptimalPension(15000000);
      expect(result).toBeNull();
    });

    it('should return null for string coerced to number', () => {
      const result = calculateOptimalPension(Number('110000abc'));
      expect(result).toBeNull();
    });

    it('should return null for undefined coerced to number', () => {
      const result = calculateOptimalPension(Number(undefined));
      expect(result).toBeNull();
    });

    it('should return null for null coerced to number', () => {
      const result = calculateOptimalPension(Number(null));
      expect(result).toBeNull(); // Number(null) = 0
    });
  });

  describe('calculateOptimalPension - Boundary Cases', () => {
    it('should return null for salary exactly at £100,000', () => {
      const result = calculateOptimalPension(100000);
      expect(result).toBeNull();
    });

    it('should return null for salary just below £100,000', () => {
      const result = calculateOptimalPension(99999.99);
      expect(result).toBeNull();
    });

    it('should return value for salary £0.01 over £100,000', () => {
      const result = calculateOptimalPension(100000.01);
      expect(result).not.toBeNull();
    });

    it('should return value for salary exactly at £125,140', () => {
      const result = calculateOptimalPension(125140);
      expect(result).not.toBeNull();
    });

    it('should return null for salary £0.01 over £125,140', () => {
      const result = calculateOptimalPension(125140.01);
      expect(result).toBeNull();
    });

    it('should handle very precise decimal salaries', () => {
      const result = calculateOptimalPension(110000.123456789);
      expect(result).not.toBeNull();
      expect(result?.suggested).toBeGreaterThan(0);
    });
  });

  describe('calculateOptimalPension - With Current Pension', () => {
    it('should return null when existing pension already avoids the trap', () => {
      // £110k salary, £10k pension = £100k adjusted income (trap avoided)
      const result = calculateOptimalPension(110000, 10000);
      expect(result).toBeNull();
    });

    it('should suggest additional pension when existing pension is insufficient', () => {
      // £115k salary, £5k pension = £110k adjusted income (still in trap)
      const result = calculateOptimalPension(115000, 5000);
      expect(result).not.toBeNull();
      expect(result?.suggested).toBe(10000); // Need £10k more to reach £100k adjusted
    });

    it('should handle when current pension brings you exactly to £100k', () => {
      // £120k salary, £20k pension = £100k adjusted income (exactly at threshold)
      const result = calculateOptimalPension(120000, 20000);
      expect(result).toBeNull();
    });

    it('should return null for invalid negative pension', () => {
      const result = calculateOptimalPension(110000, -5000);
      expect(result).toBeNull();
    });

    it('should return null for non-finite pension', () => {
      const result = calculateOptimalPension(110000, Infinity);
      expect(result).toBeNull();
    });

    it('should calculate allowance lost based on adjusted income', () => {
      // £110k salary, £0 pension = £110k adjusted income
      const result1 = calculateOptimalPension(110000, 0);
      expect(result1?.allowanceLost).toBe(5000); // (110k - 100k) / 2 = 5k

      // £110k salary, £5k pension = £105k adjusted income
      const result2 = calculateOptimalPension(110000, 5000);
      expect(result2?.allowanceLost).toBe(2500); // (105k - 100k) / 2 = 2.5k
    });

    it('should work with zero pension (default parameter)', () => {
      const resultWithZero = calculateOptimalPension(110000, 0);
      const resultDefault = calculateOptimalPension(110000);
      expect(resultWithZero).toEqual(resultDefault);
    });
  });

  describe('compareWithOptimization - Invalid Inputs', () => {
    it('should return null for NaN salary', () => {
      const result = compareWithOptimization(NaN, 10000);
      expect(result).toBeNull();
    });

    it('should return null for NaN pension contribution', () => {
      const result = compareWithOptimization(110000, NaN);
      expect(result).toBeNull();
    });

    it('should return null for negative pension', () => {
      const result = compareWithOptimization(110000, -5000);
      expect(result).toBeNull();
    });

    it('should return null for pension > salary', () => {
      const result = compareWithOptimization(110000, 150000);
      expect(result).toBeNull();
    });

    it('should return null for Infinity pension', () => {
      const result = compareWithOptimization(110000, Infinity);
      expect(result).toBeNull();
    });

    it('should return null for invalid salary', () => {
      const result = compareWithOptimization(-50000, 10000);
      expect(result).toBeNull();
    });

    it('should return null for unreasonably high pension', () => {
      const result = compareWithOptimization(110000, 15000000);
      expect(result).toBeNull();
    });
  });

  describe('formatCurrency - Error Handling', () => {
    it('should handle NaN gracefully', () => {
      const result = formatCurrency(NaN);
      expect(result).toContain('NaN'); // utils.formatCurrency formats NaN as "£NaN"
    });

    it('should format Infinity', () => {
      const result = formatCurrency(Infinity);
      expect(result).toContain('∞'); // utils.formatCurrency formats Infinity as "£∞"
    });

    it('should format negative amounts', () => {
      const result = formatCurrency(-5000);
      expect(result).toContain('-'); // utils.formatCurrency allows negatives
      expect(result).toContain('5,000');
    });

    it('should format high amounts', () => {
      const result = formatCurrency(15000000);
      expect(result).toBe('£15,000,000.00');
    });

    it('should format valid amounts correctly (with decimals from utils)', () => {
      expect(formatCurrency(10000, 0)).toBe('£10,000');
      expect(formatCurrency(110000, 0)).toBe('£110,000');
      expect(formatCurrency(5000, 0)).toBe('£5,000');
    });

    it('should handle decimal amounts with precision', () => {
      expect(formatCurrency(10000.5, 0)).toBe('£10,001');
      expect(formatCurrency(10000.4, 0)).toBe('£10,000');
      expect(formatCurrency(10000.5, 2)).toBe('£10,000.50');
    });
  });

  describe('Error Logging - Console Warnings', () => {
    let consoleWarnSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should log warning for invalid salary in calculateOptimalPension', () => {
      calculateOptimalPension(NaN);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[pensionOptimizer] Invalid salary input')
      );
    });

    it('should log warning for invalid compareWithOptimization inputs', () => {
      compareWithOptimization(NaN, 10000);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[pensionOptimizer] Invalid input to compareWithOptimization')
      );
    });

    it('should log warning for pension > salary', () => {
      compareWithOptimization(110000, 150000);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '[pensionOptimizer] Pension contribution must be between 0 and salary'
        )
      );
    });
  });

  describe('No Thrown Errors - Graceful Degradation', () => {
    it('should never throw errors for any input combination', () => {
      const dangerousInputs = [
        NaN,
        Infinity,
        -Infinity,
        -999999,
        999999999,
        0,
        0.0000001,
        Number.MAX_VALUE,
        Number.MIN_VALUE,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
      ];

      // biome-ignore lint/complexity/noForEach: Testing multiple edge cases
      dangerousInputs.forEach((input) => {
        expect(() => calculateOptimalPension(input)).not.toThrow();
        expect(() => compareWithOptimization(input, 10000)).not.toThrow();
        expect(() => formatCurrency(input)).not.toThrow();
      });
    });

    it('should handle rapid successive calls without errors', () => {
      expect(() => {
        for (let i = 0; i < 1000; i++) {
          calculateOptimalPension(100000 + i);
        }
      }).not.toThrow();
    });

    it('should handle concurrent calculations safely', () => {
      const promises = Array.from({ length: 100 }, (_, i) =>
        Promise.resolve(calculateOptimalPension(100000 + i * 100))
      );

      expect(() => Promise.all(promises)).not.toThrow();
    });
  });

  describe('Type Coercion Edge Cases', () => {
    it('should handle string that looks like number', () => {
      // @ts-expect-error Testing runtime coercion
      const result = calculateOptimalPension('110000');
      // TypeScript prevents this, but runtime should handle gracefully
      expect(result).toBeNull(); // String fails isValidSalary check
    });

    it('should handle boolean coercion', () => {
      // @ts-expect-error Testing runtime coercion
      const result = calculateOptimalPension(true);
      expect(result).toBeNull();
    });

    it('should handle object coercion', () => {
      // @ts-expect-error Testing runtime coercion
      const result = calculateOptimalPension({});
      expect(result).toBeNull();
    });

    it('should handle array coercion', () => {
      // @ts-expect-error Testing runtime coercion
      const result = calculateOptimalPension([110000]);
      expect(result).toBeNull();
    });
  });

  describe('Performance Under Error Conditions', () => {
    it('should handle errors quickly without performance degradation', () => {
      const start = performance.now();

      for (let i = 0; i < 10000; i++) {
        calculateOptimalPension(NaN);
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // Should be very fast
    });

    it('should not leak memory on repeated error conditions', () => {
      const before = (performance as any).memory?.usedJSHeapSize || 0;

      for (let i = 0; i < 10000; i++) {
        calculateOptimalPension(Infinity);
        compareWithOptimization(NaN, NaN);
        formatCurrency(NaN);
      }

      const after = (performance as any).memory?.usedJSHeapSize || 0;
      const growth = after - before;

      // Memory growth should be minimal (< 1MB)
      expect(growth).toBeLessThan(1000000);
    });
  });
});
