// src/lib/__tests__/salaryComparison.test.ts
import {
  calculateComparison,
  calculateMarginalRate,
  calculateNewSalary,
} from '../salaryComparison';
import type { TaxCalculationInput } from '../taxCalculator';

describe('Salary Comparison', () => {
  const mockCurrentInput: TaxCalculationInput = {
    salary: 40000,
    payPeriod: 'annually',
    taxYear: '2025-2026',
    taxCode: '1257L',
    region: 'England',
    isScottish: false,
    isMarried: false,
    partnerGrossWage: 0,
    isBlind: false,
    age: 30,
    payNoNI: false,
    studentLoanPlans: 'none',
    pensionContribution: 0,
    pensionContributionType: 'percentage',
    niCategory: 'A',
    hoursPerWeek: 40,
    allowancesDeductions: 0,
  };

  describe('calculateNewSalary', () => {
    it('should calculate percentage increase', () => {
      const result = calculateNewSalary({
        mode: 'percentage',
        value: 10,
        currentSalary: 40000,
      });
      expect(result).toBe(44000);
    });

    it('should calculate amount increase', () => {
      const result = calculateNewSalary({
        mode: 'amount',
        value: 5000,
        currentSalary: 40000,
      });
      expect(result).toBe(45000);
    });

    it('should return new total', () => {
      const result = calculateNewSalary({
        mode: 'total',
        value: 50000,
        currentSalary: 40000,
      });
      expect(result).toBe(50000);
    });

    it('should handle negative percentage (pay cut)', () => {
      const result = calculateNewSalary({
        mode: 'percentage',
        value: -10,
        currentSalary: 40000,
      });
      expect(result).toBe(36000);
    });

    it('should return null for invalid mode', () => {
      const result = calculateNewSalary({
        mode: 'invalid' as any,
        value: 10,
        currentSalary: 40000,
      });
      expect(result).toBeNull();
    });
  });

  describe('calculateMarginalRate', () => {
    it('should calculate marginal rate correctly', () => {
      const result = calculateMarginalRate(10000, 6600);
      expect(result).toEqual({
        marginalRate: 66,
        effectiveRate: 34,
      });
    });

    it('should handle zero increase', () => {
      const result = calculateMarginalRate(0, 0);
      expect(result).toEqual({
        marginalRate: 0,
        effectiveRate: 100,
      });
    });

    it('should clamp values to 0-100', () => {
      const result = calculateMarginalRate(1000, 1500);
      expect(result.marginalRate).toBeLessThanOrEqual(100);
      expect(result.marginalRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateComparison', () => {
    it('should calculate full comparison', () => {
      const result = calculateComparison(mockCurrentInput, {
        mode: 'amount',
        value: 10000,
        currentSalary: 40000,
      });

      expect(result).not.toBeNull();
      expect(result?.newSalary).toBe(50000);
      expect(result?.increase).toBe(10000);
      expect(result?.increasePercentage).toBe(25);
    });

    it('should calculate differences', () => {
      const result = calculateComparison(mockCurrentInput, {
        mode: 'amount',
        value: 10000,
        currentSalary: 40000,
      });

      expect(result?.grossDiff).toBe(10000);
      expect(result?.netDiff).toBeGreaterThan(0);
      expect(result?.netDiff).toBeLessThan(10000); // Some goes to tax
    });

    it('should return null for invalid input', () => {
      const result = calculateComparison(mockCurrentInput, {
        mode: 'percentage',
        value: NaN,
        currentSalary: 40000,
      });

      expect(result).toBeNull();
    });
  });
});
