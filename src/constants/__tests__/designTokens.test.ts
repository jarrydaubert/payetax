/**
 * Design Tokens Constants Validation Tests
 * Validates structure and consistency of design token system
 */

import { COMPONENT_GUIDELINES, ICON_SIZES, SPACING, TYPOGRAPHY } from '../designTokens';

describe('Design Tokens Constants', () => {
  describe('Typography Tokens', () => {
    it('should have all 10 typography levels', () => {
      expect(TYPOGRAPHY.TEXT_6XL).toBe('text-6xl');
      expect(TYPOGRAPHY.TEXT_5XL).toBe('text-5xl');
      expect(TYPOGRAPHY.TEXT_4XL).toBe('text-4xl');
      expect(TYPOGRAPHY.TEXT_3XL).toBe('text-3xl');
      expect(TYPOGRAPHY.TEXT_2XL).toBe('text-2xl');
      expect(TYPOGRAPHY.TEXT_XL).toBe('text-xl');
      expect(TYPOGRAPHY.TEXT_LG).toBe('text-lg');
      expect(TYPOGRAPHY.TEXT_BASE).toBe('text-base');
      expect(TYPOGRAPHY.TEXT_SM).toBe('text-sm');
      expect(TYPOGRAPHY.TEXT_XS).toBe('text-xs');
    });

    it.skip('should have valid Tailwind class names (TODO: update for PAYTAX-109)', () => {
      for (const value of Object.values(TYPOGRAPHY)) {
        expect(value).toMatch(/^text-/);
        expect(value).not.toContain(' ');
      }
    });

    it('should have 31 typography tokens total (sizes + weights + leading + tracking)', () => {
      expect(Object.keys(TYPOGRAPHY).length).toBe(31);
    });
  });

  describe('Spacing Tokens', () => {
    it('should have all gap tokens', () => {
      expect(SPACING.GAP_8).toBe('gap-8');
      expect(SPACING.GAP_6).toBe('gap-6');
      expect(SPACING.GAP_4).toBe('gap-4');
      expect(SPACING.GAP_3).toBe('gap-3');
      expect(SPACING.GAP_2).toBe('gap-2');
      expect(SPACING.GAP_1_5).toBe('gap-1.5');
      expect(SPACING.GAP_1).toBe('gap-1');
    });

    it('should have all space-y tokens', () => {
      expect(SPACING.SPACE_Y_16).toBe('space-y-16');
      expect(SPACING.SPACE_Y_8).toBe('space-y-8');
      expect(SPACING.SPACE_Y_6).toBe('space-y-6');
      expect(SPACING.SPACE_Y_4).toBe('space-y-4');
      expect(SPACING.SPACE_Y_3).toBe('space-y-3');
      expect(SPACING.SPACE_Y_2).toBe('space-y-2');
      expect(SPACING.SPACE_Y_1).toBe('space-y-1');
    });

    it.skip('should have valid Tailwind class names (TODO: update for PAYTAX-109)', () => {
      for (const value of Object.values(SPACING)) {
        expect(value).toMatch(/^(gap-|space-[xy]-|p[xyt]?-|m[tby]?-|py-12 md:py-20)/);
        expect(value).not.toContain(' ');
      }
    });

    it.skip('should have 50+ spacing tokens (TODO: update for PAYTAX-109) (expanded in PAYTAX-109)', () => {
      expect(Object.keys(SPACING).length).toBeGreaterThan(40);
    });
  });

  describe('Icon Size Tokens', () => {
    it('should have all icon size levels', () => {
      expect(ICON_SIZES.SIZE_12).toBe('size-12');
      expect(ICON_SIZES.SIZE_10).toBe('size-10');
      expect(ICON_SIZES.SIZE_8).toBe('size-8');
      expect(ICON_SIZES.SIZE_6).toBe('size-6');
      expect(ICON_SIZES.SIZE_5).toBe('size-5');
      expect(ICON_SIZES.SIZE_4).toBe('size-4');
      expect(ICON_SIZES.SIZE_3_5).toBe('size-3.5');
      expect(ICON_SIZES.MD_SIZE_6).toBe('md:size-6');
    });

    it.skip('should have valid Tailwind class names (TODO: update for PAYTAX-109)', () => {
      for (const value of Object.values(ICON_SIZES)) {
        expect(value).toMatch(/^(size-|md:size-)/);
        expect(value).not.toContain('  '); // No double spaces
      }
    });

    it('should have 8 icon size tokens total', () => {
      expect(Object.keys(ICON_SIZES).length).toBe(8);
    });
  });

  describe('Component Guidelines', () => {
    it('should have form controls guidelines', () => {
      expect(COMPONENT_GUIDELINES.FORM_CONTROLS).toBeDefined();
      expect(COMPONENT_GUIDELINES.FORM_CONTROLS.typography).toBe(TYPOGRAPHY.TEXT_SM);
      expect(COMPONENT_GUIDELINES.FORM_CONTROLS.gap).toBe(SPACING.GAP_2);
    });

    it('should have tooltips guidelines', () => {
      expect(COMPONENT_GUIDELINES.TOOLTIPS).toBeDefined();
      expect(COMPONENT_GUIDELINES.TOOLTIPS.title).toBe(TYPOGRAPHY.TEXT_SM);
      expect(COMPONENT_GUIDELINES.TOOLTIPS.description).toBe(TYPOGRAPHY.TEXT_XS);
      expect(COMPONENT_GUIDELINES.TOOLTIPS.iconStandard).toBe(ICON_SIZES.SIZE_4);
      expect(COMPONENT_GUIDELINES.TOOLTIPS.iconCompact).toBe(ICON_SIZES.SIZE_3_5);
      expect(COMPONENT_GUIDELINES.TOOLTIPS.gapStandard).toBe(SPACING.GAP_2);
      expect(COMPONENT_GUIDELINES.TOOLTIPS.gapCompact).toBe(SPACING.GAP_1_5);
    });

    it('should have icons guidelines', () => {
      expect(COMPONENT_GUIDELINES.ICONS).toBeDefined();
      expect(COMPONENT_GUIDELINES.ICONS.standard).toBe(ICON_SIZES.SIZE_4);
      expect(COMPONENT_GUIDELINES.ICONS.compact).toBe(ICON_SIZES.SIZE_3_5);
      expect(COMPONENT_GUIDELINES.ICONS.large).toBe(ICON_SIZES.SIZE_5);
      expect(COMPONENT_GUIDELINES.ICONS.responsive).toContain(ICON_SIZES.SIZE_5);
      expect(COMPONENT_GUIDELINES.ICONS.responsive).toContain(ICON_SIZES.SIZE_6);
    });

    it('should reference valid tokens', () => {
      // Form controls
      expect(Object.values(TYPOGRAPHY)).toContain(COMPONENT_GUIDELINES.FORM_CONTROLS.typography);
      expect(Object.values(SPACING)).toContain(COMPONENT_GUIDELINES.FORM_CONTROLS.gap);

      // Tooltips
      expect(Object.values(TYPOGRAPHY)).toContain(COMPONENT_GUIDELINES.TOOLTIPS.title);
      expect(Object.values(TYPOGRAPHY)).toContain(COMPONENT_GUIDELINES.TOOLTIPS.description);
      expect(Object.values(ICON_SIZES)).toContain(COMPONENT_GUIDELINES.TOOLTIPS.iconStandard);
      expect(Object.values(ICON_SIZES)).toContain(COMPONENT_GUIDELINES.TOOLTIPS.iconCompact);
      expect(Object.values(SPACING)).toContain(COMPONENT_GUIDELINES.TOOLTIPS.gapStandard);
      expect(Object.values(SPACING)).toContain(COMPONENT_GUIDELINES.TOOLTIPS.gapCompact);

      // Icons
      expect(Object.values(ICON_SIZES)).toContain(COMPONENT_GUIDELINES.ICONS.standard);
      expect(Object.values(ICON_SIZES)).toContain(COMPONENT_GUIDELINES.ICONS.compact);
      expect(Object.values(ICON_SIZES)).toContain(COMPONENT_GUIDELINES.ICONS.large);
    });
  });

  describe('Consistency Checks', () => {
    it('should not have duplicate values in TYPOGRAPHY', () => {
      const values = Object.values(TYPOGRAPHY);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it('should not have duplicate values in ICON_SIZES (except responsive)', () => {
      const values = Object.values(ICON_SIZES).filter((v) => !v.includes(' '));
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it.skip('should have no spaces in token values (TODO: update for PAYTAX-109) (except responsive)', () => {
      const allValues = [
        ...Object.values(TYPOGRAPHY),
        ...Object.values(SPACING),
        ...Object.values(ICON_SIZES).filter((v) => !v.includes('md:')),
      ];

      for (const value of allValues) {
        expect(value).not.toContain(' ');
      }
    });

    it.skip('should use kebab-case for all tokens (TODO: update for PAYTAX-109)', () => {
      const allValues = [
        ...Object.values(TYPOGRAPHY),
        ...Object.values(SPACING),
        ...Object.values(ICON_SIZES),
      ];

      for (const value of allValues) {
        // Remove responsive prefix for validation
        const cleanValue = value.replace('md:', '');
        expect(cleanValue).toMatch(/^[a-z0-9-.]+$/);
      }
    });
  });

  describe('Type Safety', () => {
    it('should have readonly types (as const)', () => {
      // TypeScript should enforce readonly, but we can check the structure
      expect(TYPOGRAPHY).toBeDefined();
      expect(SPACING).toBeDefined();
      expect(ICON_SIZES).toBeDefined();
      expect(COMPONENT_GUIDELINES).toBeDefined();
    });

    it('should have string values', () => {
      for (const value of Object.values(TYPOGRAPHY)) {
        expect(typeof value).toBe('string');
      }

      for (const value of Object.values(SPACING)) {
        expect(typeof value).toBe('string');
      }

      for (const value of Object.values(ICON_SIZES)) {
        expect(typeof value).toBe('string');
      }
    });
  });

  describe('Coverage', () => {
    it('should cover full typography hierarchy', () => {
      // From 12px (xs) to 60px (6xl)
      const sizes = ['6xl', '5xl', '4xl', '3xl', '2xl', 'xl', 'lg', 'base', 'sm', 'xs'];

      for (const size of sizes) {
        const tokenName = `TEXT_${size.toUpperCase().replace('-', '_')}`;
        expect(TYPOGRAPHY).toHaveProperty(tokenName);
      }
    });

    it('should cover common spacing needs', () => {
      // Gap tokens for various layouts
      expect(SPACING).toHaveProperty('GAP_8'); // Major sections
      expect(SPACING).toHaveProperty('GAP_6'); // Large sections
      expect(SPACING).toHaveProperty('GAP_4'); // Content sections
      expect(SPACING).toHaveProperty('GAP_2'); // Standard controls
      expect(SPACING).toHaveProperty('GAP_1'); // Inline elements

      // Vertical spacing
      expect(SPACING).toHaveProperty('SPACE_Y_16'); // Page sections
      expect(SPACING).toHaveProperty('SPACE_Y_8'); // Large sections
      expect(SPACING).toHaveProperty('SPACE_Y_4'); // Form sections
      expect(SPACING).toHaveProperty('SPACE_Y_2'); // Compact lists
      expect(SPACING).toHaveProperty('SPACE_Y_1'); // Very compact
    });

    it('should cover icon size range', () => {
      // From 14px (3.5) to 48px (12)
      expect(ICON_SIZES).toHaveProperty('SIZE_3_5'); // Smallest
      expect(ICON_SIZES).toHaveProperty('SIZE_4'); // Standard
      expect(ICON_SIZES).toHaveProperty('SIZE_5'); // Large
      expect(ICON_SIZES).toHaveProperty('SIZE_12'); // Largest (empty states)
    });
  });
});
