/**
 * Validation helper function tests
 *
 * Covers active helper utilities in src/lib/validation.ts:
 * - safeValidate()
 * - formatZodErrors()
 * - clamp()
 * - roundTo()
 */

import { z } from 'zod';
import { clamp, formatZodErrors, roundTo, safeValidate } from '../validation';

describe('validation.ts helper functions', () => {
  describe('safeValidate', () => {
    const TestSchema = z.object({
      name: z.string().min(1),
      age: z.number().positive(),
    });

    it('returns parsed data for valid input', () => {
      const result = safeValidate(TestSchema, { name: 'John', age: 30 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'John', age: 30 });
      }
    });

    it('returns errors for invalid input', () => {
      const result = safeValidate(TestSchema, { name: '', age: -5 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.issues.length).toBeGreaterThan(0);
      }
    });

    it('handles missing fields', () => {
      const result = safeValidate(TestSchema, { name: 'John' });
      expect(result.success).toBe(false);
    });

    it('handles wrong types', () => {
      const result = safeValidate(TestSchema, { name: 123, age: 'thirty' });
      expect(result.success).toBe(false);
    });

    it('handles null and undefined', () => {
      expect(safeValidate(TestSchema, null).success).toBe(false);
      expect(safeValidate(TestSchema, undefined).success).toBe(false);
    });

    it('works with simple scalar schemas', () => {
      const EmailSchema = z.string().email();
      expect(safeValidate(EmailSchema, 'test@example.com').success).toBe(true);
    });
  });

  describe('formatZodErrors', () => {
    it('formats error without path', () => {
      const schema = z.string().email();
      const result = schema.safeParse('invalid');
      if (!result.success) {
        const formatted = formatZodErrors(result.error);
        expect(formatted).toHaveLength(1);
        expect(formatted[0]).toContain('email');
      }
    });

    it('formats nested error paths', () => {
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

    it('formats multiple issues', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().positive(),
      });
      const result = schema.safeParse({ email: 'invalid', age: -1 });
      if (!result.success) {
        const formatted = formatZodErrors(result.error);
        expect(formatted.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('clamp', () => {
    it('returns value when within range', () => {
      expect(clamp(50, 0, 100)).toBe(50);
    });

    it('returns min when below range', () => {
      expect(clamp(-10, 0, 100)).toBe(0);
    });

    it('returns max when above range', () => {
      expect(clamp(150, 0, 100)).toBe(100);
    });

    it('handles decimals and negative ranges', () => {
      expect(clamp(5.5, 0, 10)).toBe(5.5);
      expect(clamp(-50, -100, -10)).toBe(-50);
      expect(clamp(-150, -100, -10)).toBe(-100);
      expect(clamp(0, -100, -10)).toBe(-10);
    });

    it('handles equal bounds', () => {
      expect(clamp(50, 25, 25)).toBe(25);
    });
  });

  describe('roundTo', () => {
    it('rounds to 0 decimal places', () => {
      expect(roundTo(3.7, 0)).toBe(4);
      expect(roundTo(3.4, 0)).toBe(3);
    });

    it('rounds to specific decimal places', () => {
      expect(roundTo(3.14158, 1)).toBe(3.1);
      expect(roundTo(3.15, 1)).toBe(3.2);
      expect(roundTo(3.14158, 2)).toBe(3.14);
      expect(roundTo(7.98765, 3)).toBe(7.988);
    });

    it('handles negative values', () => {
      expect(roundTo(-3.14158, 2)).toBe(-3.14);
      expect(roundTo(-3.146, 2)).toBe(-3.15);
    });

    it('handles zero and large values', () => {
      expect(roundTo(0, 2)).toBe(0);
      expect(roundTo(1_234_567.89123, 2)).toBe(1_234_567.89);
    });
  });
});
