// src/lib/__tests__/salaryComparison.error.test.ts
import { calculateNewSalary } from '../salaryComparison';

describe('Salary Comparison - Error Handling', () => {
  describe('Invalid Inputs', () => {
    it('should handle NaN value', () => {
      const result = calculateNewSalary({
        mode: 'percentage',
        value: NaN,
        currentSalary: 40000,
      });
      expect(result).toBeNull();
    });

    it('should handle Infinity', () => {
      const result = calculateNewSalary({
        mode: 'amount',
        value: Infinity,
        currentSalary: 40000,
      });
      expect(result).toBeNull();
    });

    it('should handle negative current salary', () => {
      const result = calculateNewSalary({
        mode: 'percentage',
        value: 10,
        currentSalary: -40000,
      });
      expect(result).toBeNull();
    });

    it('should reject unreasonable percentage (>1000%)', () => {
      const result = calculateNewSalary({
        mode: 'percentage',
        value: 2000,
        currentSalary: 40000,
      });
      expect(result).toBeNull();
    });

    it('should reject new salary > 10M', () => {
      const result = calculateNewSalary({
        mode: 'total',
        value: 15000000,
        currentSalary: 40000,
      });
      expect(result).toBeNull();
    });
  });

  describe('Never Throws', () => {
    it('should handle all dangerous inputs gracefully', () => {
      const dangerousInputs = [NaN, Infinity, -Infinity, Number.MAX_VALUE, Number.MIN_VALUE];

      // biome-ignore lint/complexity/noForEach: Testing multiple edge cases
      dangerousInputs.forEach((value) => {
        expect(() =>
          calculateNewSalary({
            mode: 'percentage',
            value,
            currentSalary: 40000,
          })
        ).not.toThrow();
      });
    });
  });
});
