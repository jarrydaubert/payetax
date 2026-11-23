/**
 * Tests for the Director schemas shared by the store and email validation.
 */

import { describe, expect, it } from '@jest/globals';
import { CurrencyAmountSchema, DirectorTaxYearSchema, RegionSchema } from '../directorValidation';

describe('RegionSchema', () => {
  describe('valid regions', () => {
    it('should accept "scotland"', () => {
      const result = RegionSchema.safeParse('scotland');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('scotland');
      }
    });

    it('should accept "rUK"', () => {
      const result = RegionSchema.safeParse('rUK');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('rUK');
      }
    });
  });

  describe('invalid regions', () => {
    it('should reject "england"', () => {
      const result = RegionSchema.safeParse('england');
      expect(result.success).toBe(false);
    });

    it('should reject "wales"', () => {
      const result = RegionSchema.safeParse('wales');
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = RegionSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      const result = RegionSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should reject number', () => {
      const result = RegionSchema.safeParse(1);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// TAX YEAR SCHEMA TESTS
// ============================================================================

describe('DirectorTaxYearSchema', () => {
  describe('valid tax years', () => {
    it('should accept "2026-2027"', () => {
      const result = DirectorTaxYearSchema.safeParse('2026-2027');
      expect(result.success).toBe(true);
    });

    it('should accept "2025-2026"', () => {
      const result = DirectorTaxYearSchema.safeParse('2025-2026');
      expect(result.success).toBe(true);
    });
  });

  describe('invalid tax years', () => {
    it('should reject "2024-2025"', () => {
      const result = DirectorTaxYearSchema.safeParse('2024-2025');
      expect(result.success).toBe(false);
    });

    it('should reject invalid format "2025-26"', () => {
      const result = DirectorTaxYearSchema.safeParse('2025-26');
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = DirectorTaxYearSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// CURRENCY AMOUNT SCHEMA TESTS
// ============================================================================

describe('CurrencyAmountSchema', () => {
  describe('valid amounts', () => {
    it('should accept zero', () => {
      const result = CurrencyAmountSchema.safeParse(0);
      expect(result.success).toBe(true);
    });

    it('should accept typical revenue (£100k)', () => {
      const result = CurrencyAmountSchema.safeParse(100000);
      expect(result.success).toBe(true);
    });

    it('should accept maximum (£100M)', () => {
      const result = CurrencyAmountSchema.safeParse(100_000_000);
      expect(result.success).toBe(true);
    });

    it('should accept decimal amounts', () => {
      const result = CurrencyAmountSchema.safeParse(12345.67);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid amounts', () => {
    it('should reject negative amounts', () => {
      const result = CurrencyAmountSchema.safeParse(-100);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('negative');
      }
    });

    it('should reject amounts exceeding £100M', () => {
      const result = CurrencyAmountSchema.safeParse(100_000_001);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('£100M');
      }
    });

    it('should reject Infinity', () => {
      const result = CurrencyAmountSchema.safeParse(Number.POSITIVE_INFINITY);
      expect(result.success).toBe(false);
    });

    it('should reject negative Infinity', () => {
      const result = CurrencyAmountSchema.safeParse(Number.NEGATIVE_INFINITY);
      expect(result.success).toBe(false);
    });

    it('should reject NaN', () => {
      const result = CurrencyAmountSchema.safeParse(Number.NaN);
      expect(result.success).toBe(false);
    });

    it('should reject string numbers', () => {
      const result = CurrencyAmountSchema.safeParse('100000');
      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      const result = CurrencyAmountSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
});
