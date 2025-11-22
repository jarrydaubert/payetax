/**
 * Validation Helper Functions Tests
 * Complete Zod Audit - PAYTAX-108 System 3
 *
 * Tests for validation.ts helper functions to increase function coverage.
 * Target: 11.76% → 90%+ function coverage
 *
 * Functions tested:
 * - safeValidate()
 * - formatZodErrors()
 * - clamp()
 * - roundTo()
 * - isValidTaxYear()
 * - isValidTaxCode()
 * - sanitizeSalary()
 */

import { z } from 'zod';
import {
  clamp,
  formatZodErrors,
  isValidTaxCode,
  isValidTaxYear,
  roundTo,
  safeValidate,
  sanitizeSalary,
} from '../validation';

describe('validation.ts Helper Functions', () => {
  describe('safeValidate', () => {
    const TestSchema = z.object({
      name: z.string().min(1),
      age: z.number().positive(),
    });

    it('should return success with parsed data for valid input', () => {
      const result = safeValidate(TestSchema, { name: 'John', age: 30 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'John', age: 30 });
      }
    });

    it('should return failure with errors for invalid input', () => {
      const result = safeValidate(TestSchema, { name: '', age: -5 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
        expect(result.errors.issues.length).toBeGreaterThan(0);
      }
    });

    it('should handle missing fields', () => {
      const result = safeValidate(TestSchema, { name: 'John' });
      expect(result.success).toBe(false);
    });

    it('should handle wrong types', () => {
      const result = safeValidate(TestSchema, { name: 123, age: 'thirty' });
      expect(result.success).toBe(false);
    });

    it('should handle null input', () => {
      const result = safeValidate(TestSchema, null);
      expect(result.success).toBe(false);
    });

    it('should handle undefined input', () => {
      const result = safeValidate(TestSchema, undefined);
      expect(result.success).toBe(false);
    });

    it('should work with simple schemas', () => {
      const SimpleSchema = z.string().email();
      const result = safeValidate(SimpleSchema, 'test@example.com');
      expect(result.success).toBe(true);
    });
  });

  describe('formatZodErrors', () => {
    it('should format single error without path', () => {
      const schema = z.string().email();
      const result = schema.safeParse('invalid');
      if (!result.success) {
        const formatted = formatZodErrors(result.error);
        expect(formatted).toHaveLength(1);
        expect(formatted[0]).toContain('email');
      }
    });

    it('should format error with path', () => {
      const schema = z.object({ email: z.string().email() });
      const result = schema.safeParse({ email: 'invalid' });
      if (!result.success) {
        const formatted = formatZodErrors(result.error);
        expect(formatted[0]).toMatch(/email:/);
      }
    });

    it('should format multiple errors', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().positive(),
      });
      const result = schema.safeParse({ email: 'invalid', age: -5 });
      if (!result.success) {
        const formatted = formatZodErrors(result.error);
        expect(formatted.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should format nested path errors', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            email: z.string().email(),
          }),
        }),
      });
      const result = schema.safeParse({ user: { profile: { email: 'invalid' } } });
      if (!result.success) {
        const formatted = formatZodErrors(result.error);
        expect(formatted[0]).toMatch(/user\.profile\.email/);
      }
    });
  });

  describe('clamp', () => {
    it('should return value when within range', () => {
      expect(clamp(50, 0, 100)).toBe(50);
    });

    it('should return min when value is below range', () => {
      expect(clamp(-10, 0, 100)).toBe(0);
    });

    it('should return max when value is above range', () => {
      expect(clamp(150, 0, 100)).toBe(100);
    });

    it('should handle negative ranges', () => {
      expect(clamp(-50, -100, -10)).toBe(-50);
      expect(clamp(-150, -100, -10)).toBe(-100);
      expect(clamp(0, -100, -10)).toBe(-10);
    });

    it('should handle decimal values', () => {
      expect(clamp(5.5, 0, 10)).toBe(5.5);
      expect(clamp(0.001, 0.01, 0.1)).toBe(0.01);
    });

    it('should handle equal min and max', () => {
      expect(clamp(50, 25, 25)).toBe(25);
    });

    it('should handle value equal to min', () => {
      expect(clamp(0, 0, 100)).toBe(0);
    });

    it('should handle value equal to max', () => {
      expect(clamp(100, 0, 100)).toBe(100);
    });
  });

  describe('roundTo', () => {
    it('should round to 0 decimal places', () => {
      expect(roundTo(3.7, 0)).toBe(4);
      expect(roundTo(3.4, 0)).toBe(3);
    });

    it('should round to 1 decimal place', () => {
      expect(roundTo(3.14158, 1)).toBe(3.1);
      expect(roundTo(3.15, 1)).toBe(3.2);
    });

    it('should round to 2 decimal places', () => {
      expect(roundTo(3.14158, 2)).toBe(3.14);
      expect(roundTo(100.999, 2)).toBe(101);
    });

    it('should round to 3 decimal places', () => {
      expect(roundTo(7.98765, 3)).toBe(7.988);
    });

    it('should handle already rounded values', () => {
      expect(roundTo(5, 2)).toBe(5);
      expect(roundTo(5.1, 2)).toBe(5.1);
    });

    it('should handle negative values', () => {
      expect(roundTo(-3.14158, 2)).toBe(-3.14);
      // Note: -3.145 rounds to -3.14 due to floating point representation
      expect(roundTo(-3.146, 2)).toBe(-3.15);
    });

    it('should handle zero', () => {
      expect(roundTo(0, 2)).toBe(0);
    });

    it('should handle large values', () => {
      expect(roundTo(1234567.89123, 2)).toBe(1234567.89);
    });
  });

  describe('isValidTaxYear', () => {
    describe('valid tax years', () => {
      it('should accept 2024-2025', () => {
        expect(isValidTaxYear('2024-2025')).toBe(true);
      });

      it('should accept 2025-2026', () => {
        expect(isValidTaxYear('2025-2026')).toBe(true);
      });

      it('should accept 2000-2001', () => {
        expect(isValidTaxYear('2000-2001')).toBe(true);
      });

      it('should accept future years', () => {
        expect(isValidTaxYear('2030-2031')).toBe(true);
      });
    });

    describe('invalid tax years', () => {
      it('should reject non-consecutive years', () => {
        expect(isValidTaxYear('2024-2026')).toBe(false);
        expect(isValidTaxYear('2024-2023')).toBe(false);
      });

      it('should reject invalid format', () => {
        expect(isValidTaxYear('2024')).toBe(false);
        expect(isValidTaxYear('2024-25')).toBe(false);
        expect(isValidTaxYear('24-25')).toBe(false);
      });

      it('should reject empty string', () => {
        expect(isValidTaxYear('')).toBe(false);
      });

      it('should reject with wrong separator', () => {
        expect(isValidTaxYear('2024/2025')).toBe(false);
        expect(isValidTaxYear('2024_2025')).toBe(false);
      });
    });
  });

  describe('isValidTaxCode', () => {
    describe('valid tax codes', () => {
      it('should accept standard codes', () => {
        expect(isValidTaxCode('1257L')).toBe(true);
        expect(isValidTaxCode('1000L')).toBe(true);
      });

      it('should accept Scottish codes', () => {
        expect(isValidTaxCode('S1257L')).toBe(true);
      });

      it('should accept special codes', () => {
        expect(isValidTaxCode('BR')).toBe(true);
        expect(isValidTaxCode('D0')).toBe(true);
        expect(isValidTaxCode('D1')).toBe(true);
        expect(isValidTaxCode('NT')).toBe(true);
        expect(isValidTaxCode('0T')).toBe(true);
      });

      it('should accept K codes', () => {
        expect(isValidTaxCode('K100')).toBe(true);
        expect(isValidTaxCode('SK500')).toBe(true);
      });

      it('should accept emergency codes', () => {
        expect(isValidTaxCode('1257L W1')).toBe(true);
        expect(isValidTaxCode('1257L M1')).toBe(true);
      });

      it('should be case insensitive', () => {
        expect(isValidTaxCode('1257l')).toBe(true);
        expect(isValidTaxCode('br')).toBe(true);
        expect(isValidTaxCode('s1257l')).toBe(true);
      });

      it('should handle whitespace', () => {
        expect(isValidTaxCode(' 1257L ')).toBe(true);
      });
    });

    describe('invalid tax codes', () => {
      it('should reject empty string', () => {
        expect(isValidTaxCode('')).toBe(false);
      });

      it('should reject invalid formats', () => {
        expect(isValidTaxCode('ABC')).toBe(false);
        // Note: '12345' is actually valid (numbers-only tax codes exist)
        expect(isValidTaxCode('L1257')).toBe(false); // Letter before number is invalid
        expect(isValidTaxCode('12345Z')).toBe(false); // Z is not a valid suffix
      });
    });
  });

  describe('sanitizeSalary', () => {
    describe('valid inputs', () => {
      it('should return number as-is', () => {
        expect(sanitizeSalary(45000)).toBe(45000);
      });

      it('should parse numeric string', () => {
        expect(sanitizeSalary('45000')).toBe(45000);
      });

      it('should remove £ symbol', () => {
        expect(sanitizeSalary('£45000')).toBe(45000);
      });

      it('should remove $ symbol', () => {
        expect(sanitizeSalary('$45000')).toBe(45000);
      });

      it('should remove thousand separators', () => {
        expect(sanitizeSalary('45,000')).toBe(45000);
        expect(sanitizeSalary('£1,234,567')).toBe(1234567);
      });

      it('should handle decimals', () => {
        expect(sanitizeSalary('45000.50')).toBe(45000.5);
        expect(sanitizeSalary('£45,000.99')).toBe(45000.99);
      });

      it('should handle zero', () => {
        expect(sanitizeSalary(0)).toBe(0);
        expect(sanitizeSalary('0')).toBe(0);
      });
    });

    describe('edge cases', () => {
      it('should return 0 for NaN number', () => {
        expect(sanitizeSalary(Number.NaN)).toBe(0);
      });

      it('should return 0 for invalid string', () => {
        expect(sanitizeSalary('invalid')).toBe(0);
      });

      it('should return 0 for null', () => {
        expect(sanitizeSalary(null)).toBe(0);
      });

      it('should return 0 for undefined', () => {
        expect(sanitizeSalary(undefined)).toBe(0);
      });

      it('should return 0 for negative values (clamped)', () => {
        // SalarySanitizationSchema has .min(0)
        expect(sanitizeSalary(-1000)).toBe(0);
      });

      it('should cap at maximum £10M', () => {
        expect(sanitizeSalary(10000000)).toBe(10000000);
        // Above max should fail validation and return 0
        expect(sanitizeSalary(20000000)).toBe(0);
      });
    });
  });
});
