/**
 * Input Tooltips Configuration Tests (Consolidated)
 * PAYTAX-128 - Consolidation of functional + validation tests
 *
 * Combines:
 * - inputTooltips.test.ts (functional tests: helper functions, content quality)
 * - inputTooltips.validation.test.ts (Zod validation tests: TooltipContentSchema)
 *
 * Tests:
 * - Zod validation schema (TooltipContentSchema)
 * - Data structure (INPUT_TOOLTIPS)
 * - Helper functions (getTooltipContent, hasTooltip)
 * - Content quality (titles, descriptions, HMRC guidance)
 */

import { describe, expect, it } from '@jest/globals';
import {
  getTooltipContent,
  hasTooltip,
  INPUT_TOOLTIPS,
  TooltipContentSchema,
} from '../inputTooltips';

describe('Input Tooltips Configuration', () => {
  // ============================================================================
  // ZOD VALIDATION (TooltipContentSchema)
  // ============================================================================

  describe('Zod Validation (TooltipContentSchema)', () => {
    describe('valid tooltip content', () => {
      it('should validate tooltip with all fields', () => {
        const result = TooltipContentSchema.safeParse({
          title: 'Gross Salary',
          description: 'Your total earnings before tax and deductions',
          hmrc: 'Include salary, bonuses, and commission',
        });
        expect(result.success).toBe(true);
      });

      it('should validate tooltip without optional hmrc field', () => {
        const result = TooltipContentSchema.safeParse({
          title: 'Pay Period',
          description: 'How often you receive your salary',
        });
        expect(result.success).toBe(true);
      });

      it('should accept long descriptions', () => {
        const result = TooltipContentSchema.safeParse({
          title: 'Test',
          description: 'A'.repeat(200),
          hmrc: 'A'.repeat(100),
        });
        expect(result.success).toBe(true);
      });

      it('should accept minimum valid description (10 chars)', () => {
        const result = TooltipContentSchema.safeParse({
          title: 'Test',
          description: '0123456789', // Exactly 10 characters
        });
        expect(result.success).toBe(true);
      });

      it('should accept minimum valid hmrc (10 chars)', () => {
        const result = TooltipContentSchema.safeParse({
          title: 'Test',
          description: 'Valid description here',
          hmrc: '0123456789', // Exactly 10 characters
        });
        expect(result.success).toBe(true);
      });
    });

    describe('invalid tooltip content', () => {
      it('should reject empty title', () => {
        const result = TooltipContentSchema.safeParse({
          title: '',
          description: 'Valid description',
          hmrc: 'Valid HMRC guidance',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('required');
        }
      });

      it('should reject description < 10 characters', () => {
        const result = TooltipContentSchema.safeParse({
          title: 'Valid Title',
          description: 'Too short',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('10 characters');
        }
      });

      it('should reject empty description', () => {
        const result = TooltipContentSchema.safeParse({
          title: 'Valid Title',
          description: '',
        });
        expect(result.success).toBe(false);
      });

      it('should reject hmrc < 10 characters if provided', () => {
        const result = TooltipContentSchema.safeParse({
          title: 'Valid Title',
          description: 'Valid description here',
          hmrc: 'Too short',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('10 characters');
        }
      });

      it('should reject missing title', () => {
        const result = TooltipContentSchema.safeParse({
          description: 'Valid description',
        });
        expect(result.success).toBe(false);
      });

      it('should reject missing description', () => {
        const result = TooltipContentSchema.safeParse({
          title: 'Valid Title',
        });
        expect(result.success).toBe(false);
      });
    });
  });

  // ============================================================================
  // DATA STRUCTURE (INPUT_TOOLTIPS)
  // ============================================================================

  describe('INPUT_TOOLTIPS Data Structure', () => {
    describe('all actual tooltips', () => {
      it('should have valid content for all tooltips', () => {
        for (const [fieldName, tooltip] of Object.entries(INPUT_TOOLTIPS)) {
          const result = TooltipContentSchema.safeParse(tooltip);
          expect(result.success).toBe(true);
          if (!result.success) {
            console.error(`Invalid tooltip "${fieldName}":`, result.error.issues);
          }
        }
      });

      it('should have at least 10 tooltips defined', () => {
        const tooltipCount = Object.keys(INPUT_TOOLTIPS).length;
        expect(tooltipCount).toBeGreaterThanOrEqual(10);
      });

      it('should have tooltips for essential calculator fields', () => {
        const essentialFields = [
          'salary',
          'taxCode',
          'taxYear',
          'region',
          'pensionContribution',
          'studentLoanPlan',
        ];

        for (const field of essentialFields) {
          expect(INPUT_TOOLTIPS[field]).toBeDefined();
          expect(INPUT_TOOLTIPS[field]?.title).toBeTruthy();
          expect(INPUT_TOOLTIPS[field]?.description).toBeTruthy();
        }
      });

      it('should have proper structure for each tooltip', () => {
        for (const [_key, content] of Object.entries(INPUT_TOOLTIPS)) {
          expect(content).toHaveProperty('title');
          expect(content).toHaveProperty('description');
          expect(typeof content.title).toBe('string');
          expect(typeof content.description).toBe('string');

          if (content.hmrc) {
            expect(typeof content.hmrc).toBe('string');
          }
        }
      });

      it('should have non-empty content', () => {
        for (const [_key, content] of Object.entries(INPUT_TOOLTIPS)) {
          expect(content.title.length).toBeGreaterThan(0);
          expect(content.description.length).toBeGreaterThan(0);
        }
      });
    });

    describe('specific tooltips', () => {
      it('should have valid salary tooltip', () => {
        const result = TooltipContentSchema.safeParse(INPUT_TOOLTIPS.salary);
        expect(result.success).toBe(true);
        expect(INPUT_TOOLTIPS.salary.title).toBe('Gross Salary');
        expect(INPUT_TOOLTIPS.salary.description).toContain('before tax');
      });

      it('should have valid taxCode tooltip', () => {
        const result = TooltipContentSchema.safeParse(INPUT_TOOLTIPS.taxCode);
        expect(result.success).toBe(true);
        expect(INPUT_TOOLTIPS.taxCode.title).toBe('Tax Code');
        expect(INPUT_TOOLTIPS.taxCode.hmrc).toBeTruthy();
      });

      it('should have valid pensionContribution tooltip', () => {
        const result = TooltipContentSchema.safeParse(INPUT_TOOLTIPS.pensionContribution);
        expect(result.success).toBe(true);
        expect(INPUT_TOOLTIPS.pensionContribution.description).toContain('pension');
      });

      it('should have valid marriageAllowance tooltip', () => {
        const result = TooltipContentSchema.safeParse(INPUT_TOOLTIPS.marriageAllowance);
        expect(result.success).toBe(true);
        expect(INPUT_TOOLTIPS.marriageAllowance.hmrc).toContain('£12,570');
      });
    });
  });

  // ============================================================================
  // CONTENT QUALITY
  // ============================================================================

  describe('Content Quality', () => {
    it('all titles should be concise (< 50 chars)', () => {
      for (const [fieldName, tooltip] of Object.entries(INPUT_TOOLTIPS)) {
        expect(tooltip.title.length).toBeLessThan(50);
        if (tooltip.title.length >= 50) {
          console.warn(`Tooltip title too long for "${fieldName}": ${tooltip.title.length} chars`);
        }
      }
    });

    it('all descriptions should be informative (>= 20 chars)', () => {
      for (const [fieldName, tooltip] of Object.entries(INPUT_TOOLTIPS)) {
        expect(tooltip.description.length).toBeGreaterThanOrEqual(20);
        if (tooltip.description.length < 20) {
          console.warn(`Tooltip description too short for "${fieldName}"`);
        }
      }
    });

    it('no tooltip should have duplicate titles', () => {
      const titles = Object.values(INPUT_TOOLTIPS).map((t) => t.title);
      const uniqueTitles = new Set(titles);
      expect(uniqueTitles.size).toBe(titles.length);
    });

    it('should include HMRC guidance for tax-related fields', () => {
      const taxFields = ['salary', 'taxCode', 'pensionContribution', 'studentLoanPlan'];

      for (const field of taxFields) {
        const content = INPUT_TOOLTIPS[field];
        expect(content.hmrc).toBeDefined();
        expect(content.hmrc).toBeTruthy();
      }
    });
  });

  // ============================================================================
  // SPECIFIC CONTENT (Student Loans, NI, What If)
  // ============================================================================

  describe('Student Loan Plans', () => {
    it('should explain all student loan plans', () => {
      const content = getTooltipContent('studentLoanPlan');

      expect(content?.hmrc).toContain('Plan 1');
      expect(content?.hmrc).toContain('Plan 2');
      expect(content?.hmrc).toContain('Plan 4');
      expect(content?.hmrc).toContain('Postgraduate');
    });
  });

  describe('NI Categories', () => {
    it('should explain common NI categories', () => {
      const content = getTooltipContent('niCategory');

      expect(content?.hmrc).toContain('Category A');
      expect(content?.hmrc).toContain('Category B');
      expect(content?.hmrc).toContain('Category C');
    });
  });

  describe('What If Tooltips', () => {
    it('should explain all What If scenario types', () => {
      const content = getTooltipContent('whatIfType');

      expect(content?.hmrc).toContain('Percentage');
      expect(content?.hmrc).toContain('Amount');
      expect(content?.hmrc).toContain('Total');
    });
  });

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  describe('Helper Functions', () => {
    describe('getTooltipContent', () => {
      it('should return tooltip content for valid field', () => {
        const tooltip = getTooltipContent('salary');
        expect(tooltip).toBeDefined();
        expect(tooltip?.title).toBe('Gross Salary');
      });

      it('should return undefined for non-existent field', () => {
        const tooltip = getTooltipContent('nonExistentField');
        expect(tooltip).toBeUndefined();
      });

      it('should return correct tooltip for all known fields', () => {
        for (const fieldName of Object.keys(INPUT_TOOLTIPS)) {
          const tooltip = getTooltipContent(fieldName);
          expect(tooltip).toBeDefined();
          expect(tooltip).toBe(INPUT_TOOLTIPS[fieldName]);
        }
      });

      it('should return content with HMRC guidance when available', () => {
        const content = getTooltipContent('taxCode');

        expect(content).toBeDefined();
        expect(content?.hmrc).toBeDefined();
        expect(content?.hmrc).toContain('payslip');
      });
    });

    describe('hasTooltip', () => {
      it('should return true for fields with tooltips', () => {
        expect(hasTooltip('salary')).toBe(true);
        expect(hasTooltip('taxCode')).toBe(true);
        expect(hasTooltip('pensionContribution')).toBe(true);
      });

      it('should return false for fields without tooltips', () => {
        expect(hasTooltip('nonExistentField')).toBe(false);
        expect(hasTooltip('randomField')).toBe(false);
        expect(hasTooltip('')).toBe(false);
      });

      it('should return true for all actual tooltip fields', () => {
        for (const fieldName of Object.keys(INPUT_TOOLTIPS)) {
          expect(hasTooltip(fieldName)).toBe(true);
        }
      });
    });
  });
});
