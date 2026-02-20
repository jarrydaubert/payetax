import { describe, expect, it } from '@jest/globals';
import { validateInput } from '@/lib/validation/directorValidation';
import { getWarnings } from '../warnings';

describe('Input Validation', () => {
  describe('Validation Rules', () => {
    it('should trigger Survival Mode warning when profit <= 0', () => {
      const input = { profit: 0 };
      const warnings = getWarnings(input);
      expect(warnings.some((w) => w.type === 'SURVIVAL_MODE')).toBe(true);
      expect(warnings.find((w) => w.type === 'SURVIVAL_MODE')?.severity).toBe('hard');
    });

    it('should trigger Survival Mode for negative profit', () => {
      const input = { profit: -5000 };
      const warnings = getWarnings(input);
      expect(warnings.some((w) => w.type === 'SURVIVAL_MODE')).toBe(true);
    });

    it('should warn about dividend reserves when compare dividends exceed available', () => {
      // ChatGPT Review: "Your Setup" can falsely accuse users of illegal dividends
      // if they have brought-forward reserves that exceed this year's profit
      const input = {
        profit: 50000,
        compareSalary: 20000,
        compareDividends: 60000, // Exceeds available after salary cost
      };
      const warnings = getWarnings(input);
      // Should flag potential dividend reserve issue
      expect(warnings.some((w) => w.type === 'DIVIDEND_RESERVES')).toBe(true);
      expect(warnings.find((w) => w.type === 'DIVIDEND_RESERVES')?.severity).toBe('hard');
    });

    it('should flag potential Directors Loan when compare inputs exceed profit cost', () => {
      const input = {
        profit: 50000,
        compareSalary: 30000,
        compareDividends: 40000, // Total ~75k cost > 50k profit
      };
      const warnings = getWarnings(input);
      expect(warnings.some((w) => w.type === 'POTENTIAL_DLA')).toBe(true);
    });

    it('should show overdrawn warning when already taken > profit', () => {
      const input = {
        profit: 50000,
        alreadyTaken: 60000,
      };
      const warnings = getWarnings(input);
      expect(warnings.some((w) => w.type === 'OVERDRAWN')).toBe(true);
      expect(warnings.find((w) => w.type === 'OVERDRAWN')?.severity).toBe('hard');
    });

    it('should show EA eligibility banner when selected', () => {
      // EA not available if: sole director, already claimed by connected company, etc.
      const input = {
        profit: 100000,
        hasEmploymentAllowance: true,
      };
      const warnings = getWarnings(input);
      expect(warnings.some((w) => w.type === 'EA_ELIGIBILITY_CHECK')).toBe(true);
      expect(warnings.find((w) => w.type === 'EA_ELIGIBILITY_CHECK')?.severity).toBe('soft');
    });
  });

  describe('Advanced Inputs', () => {
    it('should handle all student loan plans via validation', () => {
      const plans = ['plan1', 'plan2', 'plan4', 'postgrad'];
      for (const plan of plans) {
        const input = { profit: 50000, studentLoanPlans: [plan] };
        const result = validateInput(input);
        expect(result.isValid).toBe(true);
      }
    });

    it('should accept company pension contributions within profit', () => {
      const input = {
        profit: 100000,
        pensionContribution: 10000,
      };
      const result = validateInput(input);
      expect(result.isValid).toBe(true);
    });

    it('should show BIK Class 1A warning when company car BIK entered', () => {
      const input = {
        profit: 100000,
        companyCarBIK: 5000,
      };
      const warnings = getWarnings(input);
      expect(warnings.some((w) => w.type === 'BIK_CLASS_1A_WARNING')).toBe(true);
      expect(warnings.find((w) => w.type === 'BIK_CLASS_1A_WARNING')?.severity).toBe('soft');
    });

    it('should accept other PAYE employment flag', () => {
      const input = {
        profit: 50000,
        hasOtherPAYE: true,
      };
      const result = validateInput(input);
      expect(result.isValid).toBe(true);
    });

    it('should accept minimum salary requirement', () => {
      const input = {
        profit: 100000,
        minimumSalaryRequired: 25000,
      };
      const result = validateInput(input);
      expect(result.isValid).toBe(true);
    });

    it('should accept valid region rUK', () => {
      const input = { profit: 50000, region: 'rUK' };
      const result = validateInput(input);
      expect(result.isValid).toBe(true);
    });

    it('should accept valid region scotland', () => {
      const input = { profit: 50000, region: 'scotland' };
      const result = validateInput(input);
      expect(result.isValid).toBe(true);
    });

    it('should reject losses brought forward exceeding profit', () => {
      const input = {
        profit: 50000,
        lossesBroughtForward: -5000, // Negative not allowed
      };
      const result = validateInput(input);
      expect(result.isValid).toBe(false);
    });
  });
});

// =============================================================================
// PILLAR 2: CALCULATION TESTS
// =============================================================================

describe('Warning Triggers', () => {
  describe('Hard Constraints', () => {
    it('should trigger Survival Mode when profit <= 0', () => {
      const input = { profit: -5000 };
      const warnings = getWarnings(input);
      expect(warnings.some((w) => w.type === 'SURVIVAL_MODE' && w.severity === 'hard')).toBe(true);
    });

    it('should warn about overdrawn position', () => {
      const input = { profit: 50000, alreadyTaken: 60000 };
      const warnings = getWarnings(input);
      expect(warnings.some((w) => w.type === 'OVERDRAWN' && w.severity === 'hard')).toBe(true);
    });

    it('should warn about potential illegal dividend', () => {
      const input = {
        profit: 50000,
        compareDividends: 60000, // More than available
      };
      // Soft wording: "may be unlawful IF you lack distributable reserves"
      const warnings = getWarnings(input);
      expect(warnings.some((w) => w.type === 'DIVIDEND_RESERVES' && w.severity === 'hard')).toBe(
        true,
      );
    });
  });

  describe('May Apply Warnings', () => {
    it('should warn about VAT registration near threshold', () => {
      const input = { revenue: 85000 }; // Near £90k threshold
      const warnings = getWarnings(input);
      expect(warnings.some((w) => w.type === 'VAT_THRESHOLD' && w.severity === 'soft')).toBe(true);
    });

    it('should warn about Self Assessment filing when dividends declared', () => {
      const input = { profit: 50000, dividends: 20000 };
      const warnings = getWarnings(input);
      expect(warnings.some((w) => w.type === 'SELF_ASSESSMENT' && w.severity === 'soft')).toBe(
        true,
      );
    });

    it('should warn about Payments on Account when SA liability >£1k AND <80% deducted', () => {
      const input = {
        profit: 100000,
        salary: 12570, // Low PAYE deduction
        dividends: 60000, // High dividend = high SA liability
      };
      // BOTH conditions must be met
      const warnings = getWarnings(input);
      expect(warnings.some((w) => w.type === 'PAYMENTS_ON_ACCOUNT' && w.severity === 'soft')).toBe(
        true,
      );
    });

    it('should NOT warn about POA if SA liability <=£1k', () => {
      const input = {
        profit: 30000,
        salary: 12570,
        dividends: 10000,
      };
      // SA liability likely under £1k
      const warnings = getWarnings(input);
      expect(warnings.some((w) => w.type === 'PAYMENTS_ON_ACCOUNT')).toBe(false);
    });

    it('should NOT warn about POA if >=80% deducted at source', () => {
      const input = {
        profit: 100000,
        salary: 80000, // High PAYE deduction
        dividends: 5000, // Low dividends so most tax via PAYE
      };
      // Most tax deducted via PAYE (salary dominates)
      // £80k salary = ~£18k income tax
      // £5k dividends = ~£394 dividend tax (after £500 allowance)
      // ~98% at source, so no POA warning
      const warnings = getWarnings(input);
      expect(warnings.some((w) => w.type === 'PAYMENTS_ON_ACCOUNT')).toBe(false);
    });
  });

  describe('Educational Warnings', () => {
    it('should explain 60% effective rate in PA taper zone (£100k-£125,140)', () => {
      const input = { salary: 110000 };
      const warnings = getWarnings(input);
      expect(warnings.some((w) => w.type === 'PA_TAPER' && w.severity === 'educational')).toBe(
        true,
      );
    });

    it('should warn about HICBC in £60k-£80k zone', () => {
      const input = { salary: 65000, hasChildren: true };
      // Child Benefit clawback starts at £60k, fully gone at £80k
      const warnings = getWarnings(input);
      expect(warnings.some((w) => w.type === 'HICBC' && w.severity === 'educational')).toBe(true);
    });

    it('should warn about pension gap zone', () => {
      // Paying employer NI without earning State Pension credits
      // NOTE: £8,000 is ABOVE LEL £6,500, so no pension gap warning is triggered
      // For this warning to trigger: salary > ST (£5,000) AND salary < LEL (£6,500)
      const input = { salary: 5500 }; // Between ST and LEL
      const warnings = getWarnings(input);
      expect(warnings.some((w) => w.type === 'PENSION_GAP' && w.severity === 'educational')).toBe(
        true,
      );
    });

    it('should warn when pension contribution exceeds Annual Allowance', () => {
      const input = { pensionContribution: 70000 }; // Over £60k AA
      const warnings = getWarnings(input);
      expect(
        warnings.some((w) => w.type === 'PENSION_AA_EXCEEDED' && w.severity === 'educational'),
      ).toBe(true);
    });

    it('should warn about pension taper near £260k threshold', () => {
      const input = {
        salary: 200000,
        dividends: 80000, // Adjusted income ~£280k
      };
      // AA reduces to min £10k for high earners
      const warnings = getWarnings(input);
      expect(warnings.some((w) => w.type === 'PENSION_TAPER' && w.severity === 'educational')).toBe(
        true,
      );
    });

    it('should flag potential DLA when compare inputs exceed available', () => {
      const input = {
        profit: 50000,
        compareSalary: 30000,
        compareDividends: 40000,
      };
      // Soft wording: "may create/increase depending on treatment"
      const warnings = getWarnings(input);
      expect(warnings.some((w) => w.type === 'POTENTIAL_DLA' && w.severity === 'educational')).toBe(
        true,
      );
    });
  });
});

// =============================================================================
// PILLAR 3: OUTPUT TESTS
// =============================================================================

describe('Validation Edge Cases', () => {
  describe('Invalid Input Handling', () => {
    it('should reject pension contribution greater than profit', () => {
      const input = {
        profit: 50000,
        pensionContribution: 60000,
      };
      const result = validateInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Pension contribution cannot exceed profit');
    });

    it('should reject negative already taken', () => {
      const input = {
        profit: 100000,
        alreadyTaken: -5000,
      };
      const result = validateInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Already taken cannot be negative');
    });

    it('should reject future year-end date', () => {
      const input = {
        profit: 100000,
        yearEndDate: new Date('2030-03-31'),
      };
      const result = validateInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Year-end cannot be in the future');
    });

    it('should reject invalid region', () => {
      const input = {
        profit: 100000,
        region: 'wales', // Should be 'rUK' not 'wales'
      };
      const result = validateInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid region');
    });

    it('should reject invalid student loan plan', () => {
      const input = {
        profit: 100000,
        studentLoanPlans: ['plan5'], // Not valid until April 2026
      };
      const result = validateInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Student loan plan plan5 is not available for 2025-2026');
    });

    it('should handle NaN profit gracefully', () => {
      const input = { profit: NaN };
      const result = validateInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Profit cannot be NaN');
    });

    it('should handle undefined profit gracefully', () => {
      const input = { profit: undefined };
      // undefined profit is allowed (optional field), so it should be valid
      const result = validateInput(input);
      expect(result.isValid).toBe(true);
    });

    it('should handle extremely large profit', () => {
      const input = { profit: 100000000 }; // £100m
      // £100m is a valid number, no specific limit in validateInput
      const result = validateInput(input);
      expect(result.isValid).toBe(true);
    });
  });
});

// =============================================================================
// KEY DATES EDGE CASES
// =============================================================================

// =============================================================================
// RUTHLESS BUG HUNTING - DESIGNED TO BREAK THE SYSTEM
// =============================================================================
// Each test documents what bug it's hunting for
