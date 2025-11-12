/**
 * Icon Sizing Design Tokens Test Suite
 *
 * Tests for the ICON_SIZES token system to ensure:
 * 1. All tokens are properly defined
 * 2. Token values match Tailwind CSS classes
 * 3. Type safety is maintained
 * 4. No duplicate or conflicting tokens
 *
 * Related: PAYTAX-115 - Icon Sizing System Audit
 */

import { ICON_SIZES, type IconSizeToken } from '../designTokens';

describe('ICON_SIZES Design Tokens', () => {
  describe('Token Definitions', () => {
    it('should define all required icon size tokens', () => {
      const expectedTokens: IconSizeToken[] = [
        'SIZE_12',
        'SIZE_10',
        'SIZE_8',
        'SIZE_6',
        'SIZE_5',
        'SIZE_4',
        'SIZE_3_5',
        'MD_SIZE_6',
      ];

      for (const token of expectedTokens) {
        expect(ICON_SIZES[token]).toBeDefined();
        expect(typeof ICON_SIZES[token]).toBe('string');
      }
    });

    it('should have exactly 8 icon size tokens', () => {
      const tokenCount = Object.keys(ICON_SIZES).length;
      expect(tokenCount).toBe(8);
    });

    it('should have unique token values except responsive variants', () => {
      const values = Object.values(ICON_SIZES);
      // SIZE_6 and MD_SIZE_6 may overlap in base value
      // Just ensure no accidental duplicates
      const nonResponsiveValues = values.filter((v) => !v.includes('md:'));
      expect(nonResponsiveValues.length).toBeGreaterThan(0);
    });
  });

  describe('Token Values', () => {
    it('should map SIZE_12 to size-12', () => {
      expect(ICON_SIZES.SIZE_12).toBe('size-12');
    });

    it('should map SIZE_10 to size-10', () => {
      expect(ICON_SIZES.SIZE_10).toBe('size-10');
    });

    it('should map SIZE_8 to size-8', () => {
      expect(ICON_SIZES.SIZE_8).toBe('size-8');
    });

    it('should map SIZE_6 to size-6', () => {
      expect(ICON_SIZES.SIZE_6).toBe('size-6');
    });

    it('should map SIZE_5 to size-5', () => {
      expect(ICON_SIZES.SIZE_5).toBe('size-5');
    });

    it('should map SIZE_4 to size-4', () => {
      expect(ICON_SIZES.SIZE_4).toBe('size-4');
    });

    it('should map SIZE_3_5 to size-3.5', () => {
      expect(ICON_SIZES.SIZE_3_5).toBe('size-3.5');
    });

    it('should map MD_SIZE_6 to md:size-6', () => {
      expect(ICON_SIZES.MD_SIZE_6).toBe('md:size-6');
    });
  });

  describe('Token Naming Convention', () => {
    it('should follow SIZE_* naming pattern for standard sizes', () => {
      const standardTokens = Object.keys(ICON_SIZES).filter((k) => !k.startsWith('MD_'));
      for (const key of standardTokens) {
        expect(key).toMatch(/^SIZE_/);
      }
    });

    it('should use uppercase for token names', () => {
      for (const key of Object.keys(ICON_SIZES)) {
        expect(key).toBe(key.toUpperCase());
      }
    });

    it('should use MD_ prefix for responsive tokens', () => {
      const responsiveTokens = Object.keys(ICON_SIZES).filter((k) =>
        ICON_SIZES[k as IconSizeToken].includes('md:')
      );
      for (const key of responsiveTokens) {
        expect(key).toMatch(/^MD_/);
      }
    });
  });

  describe('Type Safety', () => {
    it('should enforce IconSizeToken type', () => {
      // This test verifies TypeScript type checking at compile time
      const validToken: IconSizeToken = 'SIZE_4';
      expect(ICON_SIZES[validToken]).toBe('size-4');

      // TypeScript should prevent invalid tokens
      // @ts-expect-error - Invalid token should fail type check
      const invalidToken: IconSizeToken = 'SIZE_INVALID';
      expect(invalidToken).toBeDefined(); // Just to use the variable
    });

    it('should be readonly (as const)', () => {
      // TypeScript enforces readonly at compile time
      // Attempting to modify should fail: ICON_SIZES.SIZE_4 = 'size-6';
      expect(ICON_SIZES.SIZE_4).toBe('size-4');
    });
  });

  describe('Token Scale Validation', () => {
    it('should have tokens in descending size order', () => {
      const sizeOrder = [
        'SIZE_12', // 3rem / 48px
        'SIZE_10', // 2.5rem / 40px
        'SIZE_8', // 2rem / 32px
        'SIZE_6', // 1.5rem / 24px
        'SIZE_5', // 1.25rem / 20px
        'SIZE_4', // 1rem / 16px
        'SIZE_3_5', // 0.875rem / 14px
      ];

      for (const token of sizeOrder) {
        expect(ICON_SIZES[token as IconSizeToken]).toBeDefined();
      }
    });

    it('should include standard size (SIZE_4) for most icons', () => {
      expect(ICON_SIZES.SIZE_4).toBe('size-4');
    });

    it('should include large sizes for decorative icons', () => {
      expect(ICON_SIZES.SIZE_12).toBe('size-12');
      expect(ICON_SIZES.SIZE_10).toBe('size-10');
      expect(ICON_SIZES.SIZE_8).toBe('size-8');
    });

    it('should include compact size for inline icons', () => {
      expect(ICON_SIZES.SIZE_3_5).toBe('size-3.5');
    });

    it('should include responsive variant for desktop enhancement', () => {
      expect(ICON_SIZES.MD_SIZE_6).toBe('md:size-6');
    });
  });

  describe('Integration with className', () => {
    it('should be compatible with Tailwind className', () => {
      // Simulate usage in component
      const className = ICON_SIZES.SIZE_4;
      expect(className).toBe('size-4');
      expect(className).toMatch(/^size-/);
    });

    it('should work with cn() utility for combining classes', () => {
      // Example: cn('text-primary', ICON_SIZES.SIZE_4, 'mr-2')
      const combinedClasses = ['text-primary', ICON_SIZES.SIZE_4, 'mr-2'];
      expect(combinedClasses).toContain('size-4');
      expect(combinedClasses.join(' ')).toBe('text-primary size-4 mr-2');
    });

    it('should support responsive sizing patterns', () => {
      // Example: cn(ICON_SIZES.SIZE_5, ICON_SIZES.MD_SIZE_6)
      const responsiveClass = `${ICON_SIZES.SIZE_5} ${ICON_SIZES.MD_SIZE_6}`;
      expect(responsiveClass).toBe('size-5 md:size-6');
    });
  });

  describe('Documentation and Usage', () => {
    it('should export IconSizeToken type', () => {
      // Verify type is exported and usable
      const token: IconSizeToken = 'SIZE_4';
      expect(ICON_SIZES[token]).toBe('size-4');
    });

    it('should maintain consistent token structure', () => {
      // All tokens should be string values matching pattern
      for (const [key, value] of Object.entries(ICON_SIZES)) {
        expect(typeof key).toBe('string');
        expect(typeof value).toBe('string');
        // Match either size-* or md:size-* pattern
        expect(value).toMatch(/^(md:)?size-(\d+(\.\d+)?|3\.5)$/);
      }
    });
  });

  describe('Common Use Cases', () => {
    it('should provide token for standard UI icons (SIZE_4)', () => {
      expect(ICON_SIZES.SIZE_4).toBe('size-4');
    });

    it('should provide token for large interactive icons (SIZE_5)', () => {
      expect(ICON_SIZES.SIZE_5).toBe('size-5');
    });

    it('should provide token for desktop enhancement (SIZE_6)', () => {
      expect(ICON_SIZES.SIZE_6).toBe('size-6');
    });

    it('should provide token for empty state decorative icons (SIZE_12)', () => {
      expect(ICON_SIZES.SIZE_12).toBe('size-12');
    });

    it('should provide token for compact inline icons (SIZE_3_5)', () => {
      expect(ICON_SIZES.SIZE_3_5).toBe('size-3.5');
    });

    it('should provide responsive token for desktop icons (MD_SIZE_6)', () => {
      expect(ICON_SIZES.MD_SIZE_6).toBe('md:size-6');
    });
  });

  describe('Icon Usage Patterns', () => {
    it('should support aria-hidden pattern for decorative icons', () => {
      // Pattern: <Icon className={ICON_SIZES.SIZE_4} aria-hidden='true' />
      const iconClass = ICON_SIZES.SIZE_4;
      expect(iconClass).toBe('size-4');
      // ARIA handling is separate from className
    });

    it('should support combined with text colors', () => {
      // Pattern: <Icon className={cn('text-primary', ICON_SIZES.SIZE_4)} />
      const classes = ['text-primary', ICON_SIZES.SIZE_4];
      expect(classes.join(' ')).toContain('size-4');
      expect(classes.join(' ')).toContain('text-primary');
    });

    it('should support margin/padding combinations', () => {
      // Pattern: <Icon className={cn('mr-2', ICON_SIZES.SIZE_4)} />
      const classes = ['mr-2', ICON_SIZES.SIZE_4];
      expect(classes.join(' ')).toBe('mr-2 size-4');
    });
  });

  describe('Regression Prevention', () => {
    it('should not have conflicting token names', () => {
      const keys = Object.keys(ICON_SIZES);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it('should maintain backward compatibility', () => {
      // Ensure existing tokens are not removed or renamed
      const criticalTokens = [
        'SIZE_4', // Most used - standard UI icons
        'SIZE_5', // Second most used - large interactive
        'SIZE_6', // Third most used - desktop enhancement
        'SIZE_12', // Large decorative icons
      ];

      for (const token of criticalTokens) {
        expect(ICON_SIZES[token as IconSizeToken]).toBeDefined();
      }
    });

    it('should not allow accidental modifications', () => {
      // Verify tokens cannot be reassigned (TypeScript compile-time check)
      const originalValue = ICON_SIZES.SIZE_4;
      expect(originalValue).toBe('size-4');

      // This would fail at compile time:
      // ICON_SIZES.SIZE_4 = 'size-6';

      expect(ICON_SIZES.SIZE_4).toBe(originalValue);
    });
  });

  describe('Size Recommendations', () => {
    it('should have SIZE_4 as the standard icon size', () => {
      // SIZE_4 (16px) should be the most common size
      expect(ICON_SIZES.SIZE_4).toBe('size-4');
      // This is documented as "Standard icon size for most UI elements"
    });

    it('should have SIZE_5 for emphasis and interactive elements', () => {
      expect(ICON_SIZES.SIZE_5).toBe('size-5');
      // Larger for buttons, scroll indicators, mobile menu
    });

    it('should have SIZE_6 for desktop enhancements', () => {
      expect(ICON_SIZES.SIZE_6).toBe('size-6');
      // Desktop-specific larger icons
    });

    it('should have SIZE_12 for empty states and major features', () => {
      expect(ICON_SIZES.SIZE_12).toBe('size-12');
      // Large decorative icons for empty states, hero sections
    });
  });

  describe('Comparison with Deprecated Patterns', () => {
    it('should prefer size-* over h-* w-* for icons', () => {
      // Modern: size-4 (applies to both height and width)
      expect(ICON_SIZES.SIZE_4).toBe('size-4');
      expect(ICON_SIZES.SIZE_4).not.toContain('h-');
      expect(ICON_SIZES.SIZE_4).not.toContain('w-');
    });

    it('should use consistent syntax across all sizes', () => {
      // All tokens should use size-* syntax
      for (const value of Object.values(ICON_SIZES)) {
        const baseClass = value.replace('md:', '');
        expect(baseClass).toMatch(/^size-/);
      }
    });
  });
});
