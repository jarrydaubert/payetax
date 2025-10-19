/**
 * Input Tooltips Configuration Tests
 */

import { getTooltipContent, hasTooltip, INPUT_TOOLTIPS } from '../inputTooltips';

describe('Input Tooltips Configuration', () => {
  describe('Tooltip Content Structure', () => {
    it('should have content for all essential fields', () => {
      const essentialFields = [
        'salary',
        'taxCode',
        'region',
        'pensionContribution',
        'studentLoanPlan',
        'niCategory',
        'whatIfType',
      ];

      for (const field of essentialFields) {
        expect(INPUT_TOOLTIPS[field]).toBeDefined();
        expect(INPUT_TOOLTIPS[field].title).toBeTruthy();
        expect(INPUT_TOOLTIPS[field].description).toBeTruthy();
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

  describe('getTooltipContent()', () => {
    it('should return content for valid field', () => {
      const content = getTooltipContent('salary');

      expect(content).toBeDefined();
      expect(content?.title).toBe('Gross Salary');
      expect(content?.description).toContain('total earnings');
    });

    it('should return undefined for invalid field', () => {
      const content = getTooltipContent('nonexistent');
      expect(content).toBeUndefined();
    });

    it('should return content with HMRC guidance when available', () => {
      const content = getTooltipContent('taxCode');

      expect(content).toBeDefined();
      expect(content?.hmrc).toBeDefined();
      expect(content?.hmrc).toContain('payslip');
    });
  });

  describe('hasTooltip()', () => {
    it('should return true for fields with tooltips', () => {
      expect(hasTooltip('salary')).toBe(true);
      expect(hasTooltip('taxCode')).toBe(true);
      expect(hasTooltip('pensionContribution')).toBe(true);
    });

    it('should return false for fields without tooltips', () => {
      expect(hasTooltip('nonexistent')).toBe(false);
      expect(hasTooltip('randomField')).toBe(false);
    });
  });

  describe('Content Quality', () => {
    it('should have clear, concise titles (max 30 chars)', () => {
      for (const [_key, content] of Object.entries(INPUT_TOOLTIPS)) {
        expect(content.title.length).toBeLessThanOrEqual(40);
      }
    });

    it('should have helpful descriptions (min 20 chars)', () => {
      for (const [_key, content] of Object.entries(INPUT_TOOLTIPS)) {
        expect(content.description.length).toBeGreaterThanOrEqual(20);
      }
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
});
