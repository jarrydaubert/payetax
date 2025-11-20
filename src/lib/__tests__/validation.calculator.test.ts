/**
 * Tests for Calculator Input Validation Schemas
 * PAYTAX-127 (Calculator Validation)
 *
 * Testing schemas moved from inline component definitions to centralized validation.ts:
 * - WhatIfValueSchema (from WhatIfInputs.tsx)
 * - ComparisonValueSchema (from ComparisonInputs.tsx)
 *
 * Testing strategy:
 * - Happy path (valid inputs for all modes/types)
 * - Edge cases (boundaries, min/max values)
 * - Invalid inputs (out of range, wrong types)
 * - Helper functions (validateWhatIfValue, validateComparisonValue)
 */

import { describe, expect, it } from '@jest/globals';
import {
  ComparisonValueSchema,
  validateComparisonValue,
  validateWhatIfValue,
  WhatIfValueSchema,
} from '../validation';

describe('WhatIfValueSchema', () => {
  describe('percentage type', () => {
    describe('valid percentages', () => {
      it('should accept +10% increase', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'percentage', value: 10 });
        expect(result.success).toBe(true);
      });

      it('should accept -50% decrease', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'percentage', value: -50 });
        expect(result.success).toBe(true);
      });

      it('should accept minimum -100% (salary to zero)', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'percentage', value: -100 });
        expect(result.success).toBe(true);
      });

      it('should accept maximum 1000% (10x salary)', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'percentage', value: 1000 });
        expect(result.success).toBe(true);
      });

      it('should accept decimal 7.5%', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'percentage', value: 7.5 });
        expect(result.success).toBe(true);
      });

      it('should accept 0% (no change)', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'percentage', value: 0 });
        expect(result.success).toBe(true);
      });
    });

    describe('invalid percentages', () => {
      it('should reject < -100%', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'percentage', value: -101 });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('-100%');
        }
      });

      it('should reject > 1000%', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'percentage', value: 1001 });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('1000%');
        }
      });

      it('should reject Infinity', () => {
        const result = WhatIfValueSchema.safeParse({
          type: 'percentage',
          value: Number.POSITIVE_INFINITY,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          // Zod detects Infinity - schema has .finite() check
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });

      it('should reject NaN', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'percentage', value: Number.NaN });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('amount type', () => {
    describe('valid amounts', () => {
      it('should accept +£5000 increase', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'amount', value: 5000 });
        expect(result.success).toBe(true);
      });

      it('should accept -£3000 decrease', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'amount', value: -3000 });
        expect(result.success).toBe(true);
      });

      it('should accept minimum -£10M', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'amount', value: -10000000 });
        expect(result.success).toBe(true);
      });

      it('should accept maximum +£10M', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'amount', value: 10000000 });
        expect(result.success).toBe(true);
      });

      it('should accept £0 (no change)', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'amount', value: 0 });
        expect(result.success).toBe(true);
      });

      it('should accept decimal £2500.50', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'amount', value: 2500.5 });
        expect(result.success).toBe(true);
      });
    });

    describe('invalid amounts', () => {
      it('should reject < -£10M', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'amount', value: -10000001 });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('£10M');
        }
      });

      it('should reject > £10M', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'amount', value: 10000001 });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('£10M');
        }
      });

      it('should reject Infinity', () => {
        const result = WhatIfValueSchema.safeParse({
          type: 'amount',
          value: Number.POSITIVE_INFINITY,
        });
        expect(result.success).toBe(false);
      });

      it('should reject NaN', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'amount', value: Number.NaN });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('total type', () => {
    describe('valid totals', () => {
      it('should accept £50000 new salary', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'total', value: 50000 });
        expect(result.success).toBe(true);
      });

      it('should accept £0 (zero salary)', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'total', value: 0 });
        expect(result.success).toBe(true);
      });

      it('should accept maximum £10M', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'total', value: 10000000 });
        expect(result.success).toBe(true);
      });

      it('should accept £1 minimum working salary', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'total', value: 1 });
        expect(result.success).toBe(true);
      });

      it('should accept decimal £45123.75', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'total', value: 45123.75 });
        expect(result.success).toBe(true);
      });
    });

    describe('invalid totals', () => {
      it('should reject negative salary', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'total', value: -1 });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('cannot be negative');
        }
      });

      it('should reject > £10M', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'total', value: 10000001 });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('£10M');
        }
      });

      it('should reject Infinity', () => {
        const result = WhatIfValueSchema.safeParse({
          type: 'total',
          value: Number.POSITIVE_INFINITY,
        });
        expect(result.success).toBe(false);
      });

      it('should reject NaN', () => {
        const result = WhatIfValueSchema.safeParse({ type: 'total', value: Number.NaN });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('type validation', () => {
    it('should reject invalid type', () => {
      const result = WhatIfValueSchema.safeParse({ type: 'invalid', value: 100 });
      expect(result.success).toBe(false);
    });

    it('should reject missing type', () => {
      const result = WhatIfValueSchema.safeParse({ value: 100 });
      expect(result.success).toBe(false);
    });

    it('should reject missing value', () => {
      const result = WhatIfValueSchema.safeParse({ type: 'percentage' });
      expect(result.success).toBe(false);
    });
  });
});

describe('ComparisonValueSchema', () => {
  describe('percentage mode', () => {
    describe('valid percentages', () => {
      it('should accept 5% increase with percentage field', () => {
        const result = ComparisonValueSchema.safeParse({
          mode: 'percentage',
          value: 5,
          percentage: 5,
        });
        expect(result.success).toBe(true);
      });

      it('should accept minimum 0.01%', () => {
        const result = ComparisonValueSchema.safeParse({
          mode: 'percentage',
          value: 0.01,
          percentage: 0.01,
        });
        expect(result.success).toBe(true);
      });

      it('should accept maximum 1000%', () => {
        const result = ComparisonValueSchema.safeParse({
          mode: 'percentage',
          value: 1000,
          percentage: 1000,
        });
        expect(result.success).toBe(true);
      });

      it('should accept without optional percentage field', () => {
        const result = ComparisonValueSchema.safeParse({ mode: 'percentage', value: 10 });
        expect(result.success).toBe(true);
      });

      it('should accept decimal 7.5%', () => {
        const result = ComparisonValueSchema.safeParse({
          mode: 'percentage',
          value: 7.5,
          percentage: 7.5,
        });
        expect(result.success).toBe(true);
      });
    });

    describe('invalid percentages', () => {
      it('should reject 0% (must be > 0)', () => {
        const result = ComparisonValueSchema.safeParse({
          mode: 'percentage',
          value: 0,
          percentage: 0,
        });
        expect(result.success).toBe(false);
      });

      it('should reject negative percentage', () => {
        const result = ComparisonValueSchema.safeParse({
          mode: 'percentage',
          value: -5,
          percentage: -5,
        });
        expect(result.success).toBe(false);
      });

      it('should reject percentage < 0.01%', () => {
        const result = ComparisonValueSchema.safeParse({
          mode: 'percentage',
          value: 0.001,
          percentage: 0.001,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('0.01%');
        }
      });

      it('should reject percentage > 1000%', () => {
        const result = ComparisonValueSchema.safeParse({
          mode: 'percentage',
          value: 1001,
          percentage: 1001,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('1000%');
        }
      });
    });
  });

  describe('amount mode', () => {
    describe('valid amounts', () => {
      it('should accept £5000 increase', () => {
        const result = ComparisonValueSchema.safeParse({
          mode: 'amount',
          value: 5000,
          amount: 5000,
        });
        expect(result.success).toBe(true);
      });

      it('should accept minimum £1', () => {
        const result = ComparisonValueSchema.safeParse({ mode: 'amount', value: 1, amount: 1 });
        expect(result.success).toBe(true);
      });

      it('should accept maximum £10M', () => {
        const result = ComparisonValueSchema.safeParse({
          mode: 'amount',
          value: 10000000,
          amount: 10000000,
        });
        expect(result.success).toBe(true);
      });

      it('should accept without optional amount field', () => {
        const result = ComparisonValueSchema.safeParse({ mode: 'amount', value: 2500 });
        expect(result.success).toBe(true);
      });

      it('should accept decimal £2500.50', () => {
        const result = ComparisonValueSchema.safeParse({
          mode: 'amount',
          value: 2500.5,
          amount: 2500.5,
        });
        expect(result.success).toBe(true);
      });
    });

    describe('invalid amounts', () => {
      it('should reject £0', () => {
        const result = ComparisonValueSchema.safeParse({ mode: 'amount', value: 0, amount: 0 });
        expect(result.success).toBe(false);
      });

      it('should reject negative amount', () => {
        const result = ComparisonValueSchema.safeParse({
          mode: 'amount',
          value: -100,
          amount: -100,
        });
        expect(result.success).toBe(false);
      });

      it('should reject amount < £1', () => {
        const result = ComparisonValueSchema.safeParse({
          mode: 'amount',
          value: 0.5,
          amount: 0.5,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('£1');
        }
      });

      it('should reject amount > £10M', () => {
        const result = ComparisonValueSchema.safeParse({
          mode: 'amount',
          value: 10000001,
          amount: 10000001,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('£10M');
        }
      });
    });
  });

  describe('total mode', () => {
    describe('valid totals', () => {
      it('should accept £60000 total salary', () => {
        const result = ComparisonValueSchema.safeParse({
          mode: 'total',
          value: 60000,
          total: 60000,
        });
        expect(result.success).toBe(true);
      });

      it('should accept minimum £1', () => {
        const result = ComparisonValueSchema.safeParse({ mode: 'total', value: 1, total: 1 });
        expect(result.success).toBe(true);
      });

      it('should accept maximum £10M', () => {
        const result = ComparisonValueSchema.safeParse({
          mode: 'total',
          value: 10000000,
          total: 10000000,
        });
        expect(result.success).toBe(true);
      });

      it('should accept without optional total field', () => {
        const result = ComparisonValueSchema.safeParse({ mode: 'total', value: 55000 });
        expect(result.success).toBe(true);
      });
    });

    describe('invalid totals', () => {
      it('should reject £0 salary', () => {
        const result = ComparisonValueSchema.safeParse({ mode: 'total', value: 0, total: 0 });
        expect(result.success).toBe(false);
      });

      it('should reject negative salary', () => {
        const result = ComparisonValueSchema.safeParse({
          mode: 'total',
          value: -1000,
          total: -1000,
        });
        expect(result.success).toBe(false);
      });

      it('should reject total < £1', () => {
        const result = ComparisonValueSchema.safeParse({
          mode: 'total',
          value: 0.5,
          total: 0.5,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('£1');
        }
      });

      it('should reject total > £10M', () => {
        const result = ComparisonValueSchema.safeParse({
          mode: 'total',
          value: 10000001,
          total: 10000001,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('£10M');
        }
      });
    });
  });

  describe('mode validation', () => {
    it('should reject invalid mode', () => {
      const result = ComparisonValueSchema.safeParse({ mode: 'invalid', value: 100 });
      expect(result.success).toBe(false);
    });

    it('should reject missing mode', () => {
      const result = ComparisonValueSchema.safeParse({ value: 100 });
      expect(result.success).toBe(false);
    });

    it('should reject missing value', () => {
      const result = ComparisonValueSchema.safeParse({ mode: 'percentage' });
      expect(result.success).toBe(false);
    });
  });
});

describe('Helper Functions', () => {
  describe('validateWhatIfValue', () => {
    it('should validate percentage increase', () => {
      const result = validateWhatIfValue('percentage', 10);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('percentage');
        expect(result.data.value).toBe(10);
      }
    });

    it('should validate amount decrease', () => {
      const result = validateWhatIfValue('amount', -5000);
      expect(result.success).toBe(true);
    });

    it('should validate new total', () => {
      const result = validateWhatIfValue('total', 55000);
      expect(result.success).toBe(true);
    });

    it('should reject invalid percentage', () => {
      const result = validateWhatIfValue('percentage', -150);
      expect(result.success).toBe(false);
    });

    it('should reject invalid amount', () => {
      const result = validateWhatIfValue('amount', 20000000);
      expect(result.success).toBe(false);
    });

    it('should reject invalid total', () => {
      const result = validateWhatIfValue('total', -1);
      expect(result.success).toBe(false);
    });
  });

  describe('validateComparisonValue', () => {
    it('should validate percentage with mode value', () => {
      const result = validateComparisonValue('percentage', 5, 5);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.mode).toBe('percentage');
        expect(result.data.value).toBe(5);
        expect(result.data.percentage).toBe(5);
      }
    });

    it('should validate amount with mode value', () => {
      const result = validateComparisonValue('amount', 5000, 5000);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(5000);
      }
    });

    it('should validate total with mode value', () => {
      const result = validateComparisonValue('total', 60000, 60000);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.total).toBe(60000);
      }
    });

    it('should validate without mode value', () => {
      const result = validateComparisonValue('percentage', 10);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.percentage).toBeUndefined();
      }
    });

    it('should reject invalid percentage', () => {
      const result = validateComparisonValue('percentage', 0.001, 0.001);
      expect(result.success).toBe(false);
    });

    it('should reject invalid amount', () => {
      const result = validateComparisonValue('amount', 0, 0);
      expect(result.success).toBe(false);
    });

    it('should reject invalid total', () => {
      const result = validateComparisonValue('total', -1000, -1000);
      expect(result.success).toBe(false);
    });
  });
});
