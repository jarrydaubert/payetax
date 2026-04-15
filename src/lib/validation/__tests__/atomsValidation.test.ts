/**
 * Tests for Atoms Component Validation Schemas
 * PAYTAX-126 (Component Props Validation)
 *
 * Testing strategy:
 * - Happy path (valid inputs)
 * - Edge cases (boundaries, special values)
 * - Invalid inputs (type errors, out of range)
 * - Helper functions (validateSalary, validateTaxYear, etc.)
 */

import { describe, expect, it } from '@jest/globals';
import {
  NumberInputSchema,
  PensionPercentageSchema,
  PeriodSchema,
  SalaryInputSchema,
  TaxYearSchema,
  validatePensionPercentage,
  validatePeriod,
  validateSalary,
  validateTaxYear,
} from '../atomsValidation';

describe('NumberInputSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid number', () => {
      const result = NumberInputSchema.safeParse({ value: 50000 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.value).toBe(50000);
      }
    });

    it('should accept zero', () => {
      const result = NumberInputSchema.safeParse({ value: 0 });
      expect(result.success).toBe(true);
    });

    it('should accept very large number at limit', () => {
      const result = NumberInputSchema.safeParse({ value: 100_000_000 });
      expect(result.success).toBe(true);
    });

    it('should accept number with optional decimals config', () => {
      const result = NumberInputSchema.safeParse({ value: 1234.56, decimals: 2 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.decimals).toBe(2);
      }
    });

    it('should accept decimals=0 (no decimal places)', () => {
      const result = NumberInputSchema.safeParse({ value: 1000, decimals: 0 });
      expect(result.success).toBe(true);
    });

    it('should accept decimals=4 (max precision)', () => {
      const result = NumberInputSchema.safeParse({ value: 1234.5678, decimals: 4 });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject negative numbers', () => {
      const result = NumberInputSchema.safeParse({ value: -100 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('non-negative');
      }
    });

    it('should reject numbers exceeding maximum limit', () => {
      const result = NumberInputSchema.safeParse({ value: 100_000_001 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('maximum limit');
      }
    });

    it('should reject Infinity', () => {
      const result = NumberInputSchema.safeParse({ value: Number.POSITIVE_INFINITY });
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod detects Infinity but reports it as "expected number, received number"
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should reject negative Infinity', () => {
      const result = NumberInputSchema.safeParse({ value: Number.NEGATIVE_INFINITY });
      expect(result.success).toBe(false);
    });

    it('should reject NaN', () => {
      const result = NumberInputSchema.safeParse({ value: Number.NaN });
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod detects NaN and reports "expected number, received NaN"
        expect(result.error.issues[0].message).toContain('NaN');
      }
    });

    it('should reject negative decimals', () => {
      const result = NumberInputSchema.safeParse({ value: 1000, decimals: -1 });
      expect(result.success).toBe(false);
    });

    it('should reject decimals > 4', () => {
      const result = NumberInputSchema.safeParse({ value: 1000, decimals: 5 });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer decimals', () => {
      const result = NumberInputSchema.safeParse({ value: 1000, decimals: 2.5 });
      expect(result.success).toBe(false);
    });
  });
});

describe('SalaryInputSchema', () => {
  describe('valid salaries', () => {
    it('should accept typical UK salary (£30k)', () => {
      const result = SalaryInputSchema.safeParse({ value: 30000 });
      expect(result.success).toBe(true);
    });

    it('should accept zero salary', () => {
      const result = SalaryInputSchema.safeParse({ value: 0 });
      expect(result.success).toBe(true);
    });

    it('should accept high salary (£500k)', () => {
      const result = SalaryInputSchema.safeParse({ value: 500000 });
      expect(result.success).toBe(true);
    });

    it('should accept maximum salary (£10M)', () => {
      const result = SalaryInputSchema.safeParse({ value: 10_000_000 });
      expect(result.success).toBe(true);
    });

    it('should accept salary just below maximum', () => {
      const result = SalaryInputSchema.safeParse({ value: 9_999_999 });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid salaries', () => {
    it('should reject negative salary', () => {
      const result = SalaryInputSchema.safeParse({ value: -50000 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('non-negative');
      }
    });

    it('should reject salary exceeding £10M', () => {
      const result = SalaryInputSchema.safeParse({ value: 10_000_001 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('£10M');
      }
    });

    it('should reject Infinity', () => {
      const result = SalaryInputSchema.safeParse({ value: Number.POSITIVE_INFINITY });
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod detects Infinity but reports it as "expected number, received number"
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should reject NaN', () => {
      const result = SalaryInputSchema.safeParse({ value: Number.NaN });
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod detects NaN and reports "expected number, received NaN"
        expect(result.error.issues[0].message).toContain('NaN');
      }
    });
  });
});

describe('PensionPercentageSchema', () => {
  describe('valid percentages', () => {
    it('should accept 0% (no pension)', () => {
      const result = PensionPercentageSchema.safeParse({ value: 0 });
      expect(result.success).toBe(true);
    });

    it('should accept typical pension (5%)', () => {
      const result = PensionPercentageSchema.safeParse({ value: 5 });
      expect(result.success).toBe(true);
    });

    it('should accept high pension (40%)', () => {
      const result = PensionPercentageSchema.safeParse({ value: 40 });
      expect(result.success).toBe(true);
    });

    it('should accept maximum pension (100%)', () => {
      const result = PensionPercentageSchema.safeParse({ value: 100 });
      expect(result.success).toBe(true);
    });

    it('should accept decimal percentage (7.5%)', () => {
      const result = PensionPercentageSchema.safeParse({ value: 7.5 });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid percentages', () => {
    it('should reject negative percentage', () => {
      const result = PensionPercentageSchema.safeParse({ value: -5 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('non-negative');
      }
    });

    it('should reject percentage > 100%', () => {
      const result = PensionPercentageSchema.safeParse({ value: 101 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('100%');
      }
    });

    it('should reject Infinity', () => {
      const result = PensionPercentageSchema.safeParse({ value: Number.POSITIVE_INFINITY });
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod detects Infinity but reports it as "expected number, received number"
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should reject NaN', () => {
      const result = PensionPercentageSchema.safeParse({ value: Number.NaN });
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod detects NaN and reports "expected number, received NaN"
        expect(result.error.issues[0].message).toContain('NaN');
      }
    });
  });
});

describe('TaxYearSchema', () => {
  describe('valid tax years', () => {
    it('should accept 2026-2027 (current)', () => {
      const result = TaxYearSchema.safeParse('2026-2027');
      expect(result.success).toBe(true);
    });

    it('should accept 2025-2026', () => {
      const result = TaxYearSchema.safeParse('2025-2026');
      expect(result.success).toBe(true);
    });

    it('should accept 2024-2025', () => {
      const result = TaxYearSchema.safeParse('2024-2025');
      expect(result.success).toBe(true);
    });

    it('should accept 2023-2024', () => {
      const result = TaxYearSchema.safeParse('2023-2024');
      expect(result.success).toBe(true);
    });
  });

  describe('invalid tax years', () => {
    it('should reject invalid tax year format', () => {
      const result = TaxYearSchema.safeParse('2025-26');
      expect(result.success).toBe(false);
    });

    it('should reject future tax year not in TAX_YEARS', () => {
      const result = TaxYearSchema.safeParse('2027-2028');
      expect(result.success).toBe(false);
    });

    it('should reject old tax year not in TAX_YEARS', () => {
      const result = TaxYearSchema.safeParse('2022-2023');
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = TaxYearSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject random string', () => {
      const result = TaxYearSchema.safeParse('not-a-tax-year');
      expect(result.success).toBe(false);
    });

    it('should reject number instead of string', () => {
      const result = TaxYearSchema.safeParse(2025);
      expect(result.success).toBe(false);
    });
  });
});

describe('PeriodSchema', () => {
  describe('valid periods', () => {
    it('should accept "Annually"', () => {
      const result = PeriodSchema.safeParse('Annually');
      expect(result.success).toBe(true);
    });

    it('should accept "Monthly"', () => {
      const result = PeriodSchema.safeParse('Monthly');
      expect(result.success).toBe(true);
    });

    it('should accept "Weekly"', () => {
      const result = PeriodSchema.safeParse('Weekly');
      expect(result.success).toBe(true);
    });

    it('should accept "Daily"', () => {
      const result = PeriodSchema.safeParse('Daily');
      expect(result.success).toBe(true);
    });
  });

  describe('invalid periods', () => {
    it('should reject lowercase "annually"', () => {
      const result = PeriodSchema.safeParse('annually');
      expect(result.success).toBe(false);
    });

    it('should reject "Yearly" (not in enum)', () => {
      const result = PeriodSchema.safeParse('Yearly');
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = PeriodSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject random string', () => {
      const result = PeriodSchema.safeParse('Quarterly');
      expect(result.success).toBe(false);
    });

    it('should reject number', () => {
      const result = PeriodSchema.safeParse(12);
      expect(result.success).toBe(false);
    });
  });
});

describe('Helper Functions', () => {
  describe('validateSalary', () => {
    it('should validate valid salary (£50k)', () => {
      const result = validateSalary(50000);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(50000);
      }
    });

    it('should validate zero salary', () => {
      const result = validateSalary(0);
      expect(result.success).toBe(true);
    });

    it('should reject negative salary', () => {
      const result = validateSalary(-100);
      expect(result.success).toBe(false);
    });

    it('should reject salary > £10M', () => {
      const result = validateSalary(10_000_001);
      expect(result.success).toBe(false);
    });

    it('should reject Infinity', () => {
      const result = validateSalary(Number.POSITIVE_INFINITY);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should reject NaN', () => {
      const result = validateSalary(Number.NaN);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('NaN');
      }
    });
  });

  describe('validateTaxYear', () => {
    it('should validate current tax year (2026-2027)', () => {
      const result = validateTaxYear('2026-2027');
      expect(result.success).toBe(true);
    });

    it('should validate 2025-2026', () => {
      const result = validateTaxYear('2025-2026');
      expect(result.success).toBe(true);
    });

    it('should validate 2024-2025', () => {
      const result = validateTaxYear('2024-2025');
      expect(result.success).toBe(true);
    });

    it('should validate 2023-2024', () => {
      const result = validateTaxYear('2023-2024');
      expect(result.success).toBe(true);
    });

    it('should reject invalid format', () => {
      const result = validateTaxYear('2025-26');
      expect(result.success).toBe(false);
    });

    it('should reject future tax year', () => {
      const result = validateTaxYear('2027-2028');
      expect(result.success).toBe(false);
    });

    it('should reject old tax year', () => {
      const result = validateTaxYear('2022-2023');
      expect(result.success).toBe(false);
    });
  });

  describe('validatePensionPercentage', () => {
    it('should validate 0%', () => {
      const result = validatePensionPercentage(0);
      expect(result.success).toBe(true);
    });

    it('should validate typical 5%', () => {
      const result = validatePensionPercentage(5);
      expect(result.success).toBe(true);
    });

    it('should validate maximum 100%', () => {
      const result = validatePensionPercentage(100);
      expect(result.success).toBe(true);
    });

    it('should validate decimal 7.5%', () => {
      const result = validatePensionPercentage(7.5);
      expect(result.success).toBe(true);
    });

    it('should reject negative percentage', () => {
      const result = validatePensionPercentage(-5);
      expect(result.success).toBe(false);
    });

    it('should reject > 100%', () => {
      const result = validatePensionPercentage(101);
      expect(result.success).toBe(false);
    });

    it('should reject Infinity', () => {
      const result = validatePensionPercentage(Number.POSITIVE_INFINITY);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should reject NaN', () => {
      const result = validatePensionPercentage(Number.NaN);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('NaN');
      }
    });
  });

  describe('validatePeriod', () => {
    it('should validate "Annually"', () => {
      const result = validatePeriod('Annually');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('Annually');
      }
    });

    it('should validate "Monthly"', () => {
      const result = validatePeriod('Monthly');
      expect(result.success).toBe(true);
    });

    it('should validate "Weekly"', () => {
      const result = validatePeriod('Weekly');
      expect(result.success).toBe(true);
    });

    it('should validate "Daily"', () => {
      const result = validatePeriod('Daily');
      expect(result.success).toBe(true);
    });

    it('should reject lowercase "annually"', () => {
      const result = validatePeriod('annually');
      expect(result.success).toBe(false);
    });

    it('should reject "Yearly"', () => {
      const result = validatePeriod('Yearly');
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = validatePeriod('');
      expect(result.success).toBe(false);
    });

    it('should reject "Quarterly"', () => {
      const result = validatePeriod('Quarterly');
      expect(result.success).toBe(false);
    });
  });
});
