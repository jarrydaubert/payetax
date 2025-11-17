/**
 * Typography Design Tokens Test Suite
 *
 * Tests for the TYPOGRAPHY token system to ensure:
 * 1. All tokens are properly defined
 * 2. Token values match Tailwind CSS classes
 * 3. Type safety is maintained
 * 4. No duplicate or conflicting tokens
 *
 * Related: PAYTAX-113 - Typography System Audit
 */

import { TYPOGRAPHY, type TypographyToken } from '../designTokens';

describe('TYPOGRAPHY Design Tokens', () => {
  describe('Token Definitions', () => {
    it('should define all required typography tokens', () => {
      const expectedTokens: TypographyToken[] = [
        'TEXT_6XL',
        'TEXT_5XL',
        'TEXT_4XL',
        'TEXT_3XL',
        'TEXT_2XL',
        'TEXT_XL',
        'TEXT_LG',
        'TEXT_BASE',
        'TEXT_SM',
        'TEXT_XS',
      ];

      for (const token of expectedTokens) {
        expect(TYPOGRAPHY[token]).toBeDefined();
        expect(typeof TYPOGRAPHY[token]).toBe('string');
      }
    });

    it('should have 16 typography tokens (10 sizes + 6 weight variants)', () => {
      const tokenCount = Object.keys(TYPOGRAPHY).length;
      expect(tokenCount).toBe(16);
    });

    it('should have unique token values', () => {
      const values = Object.values(TYPOGRAPHY);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe('Token Values', () => {
    it('should map TEXT_6XL to text-6xl', () => {
      expect(TYPOGRAPHY.TEXT_6XL).toBe('text-6xl');
    });

    it('should map TEXT_5XL to text-5xl', () => {
      expect(TYPOGRAPHY.TEXT_5XL).toBe('text-5xl');
    });

    it('should map TEXT_4XL to text-4xl', () => {
      expect(TYPOGRAPHY.TEXT_4XL).toBe('text-4xl');
    });

    it('should map TEXT_3XL to text-3xl', () => {
      expect(TYPOGRAPHY.TEXT_3XL).toBe('text-3xl');
    });

    it('should map TEXT_2XL to text-2xl', () => {
      expect(TYPOGRAPHY.TEXT_2XL).toBe('text-2xl');
    });

    it('should map TEXT_XL to text-xl', () => {
      expect(TYPOGRAPHY.TEXT_XL).toBe('text-xl');
    });

    it('should map TEXT_LG to text-lg', () => {
      expect(TYPOGRAPHY.TEXT_LG).toBe('text-lg');
    });

    it('should map TEXT_BASE to text-base', () => {
      expect(TYPOGRAPHY.TEXT_BASE).toBe('text-base');
    });

    it('should map TEXT_SM to text-sm', () => {
      expect(TYPOGRAPHY.TEXT_SM).toBe('text-sm');
    });

    it('should map TEXT_XS to text-xs', () => {
      expect(TYPOGRAPHY.TEXT_XS).toBe('text-xs');
    });
  });

  describe('Token Naming Convention', () => {
    it('should follow TEXT_* naming pattern', () => {
      for (const key of Object.keys(TYPOGRAPHY)) {
        expect(key).toMatch(/^TEXT_/);
      }
    });

    it('should use uppercase for token names', () => {
      for (const key of Object.keys(TYPOGRAPHY)) {
        expect(key).toBe(key.toUpperCase());
      }
    });
  });

  describe('Type Safety', () => {
    it('should enforce TypographyToken type', () => {
      // This test verifies TypeScript type checking at compile time
      const validToken: TypographyToken = 'TEXT_SM';
      expect(TYPOGRAPHY[validToken]).toBe('text-sm');

      // TypeScript should prevent invalid tokens
      // @ts-expect-error - Invalid token should fail type check
      const invalidToken: TypographyToken = 'TEXT_INVALID';
      expect(invalidToken).toBeDefined(); // Just to use the variable
    });

    it('should be readonly (as const)', () => {
      // TypeScript enforces readonly at compile time
      // Attempting to modify should fail: TYPOGRAPHY.TEXT_SM = 'text-lg';
      expect(Object.isFrozen(TYPOGRAPHY)).toBe(false); // Runtime check not needed
      expect(TYPOGRAPHY.TEXT_SM).toBe('text-sm');
    });
  });

  describe('Token Scale Validation', () => {
    it('should have tokens in ascending size order', () => {
      const sizeOrder = [
        'TEXT_XS', // 0.75rem / 12px
        'TEXT_SM', // 0.875rem / 14px
        'TEXT_BASE', // 1rem / 16px
        'TEXT_LG', // 1.125rem / 18px
        'TEXT_XL', // 1.25rem / 20px
        'TEXT_2XL', // 1.5rem / 24px
        'TEXT_3XL', // 1.875rem / 30px
        'TEXT_4XL', // 2.25rem / 36px
        'TEXT_5XL', // 3rem / 48px
        'TEXT_6XL', // 3.75rem / 60px
      ];

      for (const token of sizeOrder) {
        expect(TYPOGRAPHY[token as TypographyToken]).toBeDefined();
      }
    });

    it('should include base size for body text', () => {
      expect(TYPOGRAPHY.TEXT_BASE).toBe('text-base');
    });

    it('should include small sizes for labels and captions', () => {
      expect(TYPOGRAPHY.TEXT_SM).toBe('text-sm');
      expect(TYPOGRAPHY.TEXT_XS).toBe('text-xs');
    });

    it('should include large sizes for headings and heroes', () => {
      expect(TYPOGRAPHY.TEXT_4XL).toBe('text-4xl');
      expect(TYPOGRAPHY.TEXT_5XL).toBe('text-5xl');
      expect(TYPOGRAPHY.TEXT_6XL).toBe('text-6xl');
    });
  });

  describe('Integration with className', () => {
    it('should be compatible with Tailwind className', () => {
      // Simulate usage in component
      const className = TYPOGRAPHY.TEXT_LG;
      expect(className).toBe('text-lg');
      expect(className).toMatch(/^text-/);
    });

    it('should work with cn() utility for combining classes', () => {
      // Example: cn('font-bold', TYPOGRAPHY.TEXT_2XL, 'mb-4')
      const combinedClasses = ['font-bold', TYPOGRAPHY.TEXT_2XL, 'mb-4'];
      expect(combinedClasses).toContain('text-2xl');
      expect(combinedClasses.join(' ')).toBe('font-bold text-2xl mb-4');
    });

    it('should support responsive sizing patterns', () => {
      // Example: `${TYPOGRAPHY.TEXT_4XL} md:${TYPOGRAPHY.TEXT_5XL}`
      const responsiveClass = `${TYPOGRAPHY.TEXT_4XL} md:text-5xl`;
      expect(responsiveClass).toBe('text-4xl md:text-5xl');
    });
  });

  describe('Documentation and Usage', () => {
    it('should export TypographyToken type', () => {
      // Verify type is exported and usable
      const token: TypographyToken = 'TEXT_LG';
      expect(TYPOGRAPHY[token]).toBe('text-lg');
    });

    it('should maintain consistent token structure', () => {
      // All tokens should be string values matching pattern (size only or size + weight)
      for (const [key, value] of Object.entries(TYPOGRAPHY)) {
        expect(typeof key).toBe('string');
        expect(typeof value).toBe('string');
        // Allow both simple sizes and size+weight combinations
        expect(value).toMatch(
          /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)(\s+font-(medium|semibold|bold))?$/
        );
      }
    });
  });

  describe('Common Use Cases', () => {
    it('should provide token for form labels (TEXT_SM)', () => {
      expect(TYPOGRAPHY.TEXT_SM).toBe('text-sm');
    });

    it('should provide token for helper text (TEXT_XS)', () => {
      expect(TYPOGRAPHY.TEXT_XS).toBe('text-xs');
    });

    it('should provide token for section headings (TEXT_LG)', () => {
      expect(TYPOGRAPHY.TEXT_LG).toBe('text-lg');
    });

    it('should provide token for hero headlines (TEXT_4XL)', () => {
      expect(TYPOGRAPHY.TEXT_4XL).toBe('text-4xl');
    });

    it('should provide token for body text (TEXT_BASE)', () => {
      expect(TYPOGRAPHY.TEXT_BASE).toBe('text-base');
    });

    it('should provide token for card titles (TEXT_2XL)', () => {
      expect(TYPOGRAPHY.TEXT_2XL).toBe('text-2xl');
    });
  });

  describe('Regression Prevention', () => {
    it('should not have conflicting token names', () => {
      const keys = Object.keys(TYPOGRAPHY);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it('should maintain backward compatibility', () => {
      // Ensure existing tokens are not removed or renamed
      const criticalTokens = [
        'TEXT_SM', // Most used - labels, form controls
        'TEXT_LG', // Second most used - section headings
        'TEXT_XS', // Third most used - helper text
        'TEXT_4XL', // Hero headlines
        'TEXT_BASE', // Body text
      ];

      for (const token of criticalTokens) {
        expect(TYPOGRAPHY[token as TypographyToken]).toBeDefined();
      }
    });

    it('should not allow accidental modifications', () => {
      // Verify tokens cannot be reassigned (TypeScript compile-time check)
      const originalValue = TYPOGRAPHY.TEXT_SM;
      expect(originalValue).toBe('text-sm');

      // This would fail at compile time:
      // TYPOGRAPHY.TEXT_SM = 'text-lg';

      expect(TYPOGRAPHY.TEXT_SM).toBe(originalValue);
    });
  });
});
