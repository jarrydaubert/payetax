/**
 * Marriage Allowance Comprehensive Test Suite
 *
 * This test suite verifies the CORRECTED marriage allowance logic:
 * - Lower earner (< £12,570) transfers £1,260 to their partner
 * - Receiving partner must be a basic rate taxpayer
 * - Saves £252/year (£1,260 × 20%)
 *
 * CRITICAL FIX: Logic was previously backwards (checking partner > PA instead of < PA)
 */

import { calculateTax, type TaxCalculationInput } from '../taxCalculator';

describe('Marriage Allowance - Comprehensive Tests', () => {
  const createTestInput = (salary: number, partnerWage: number): TaxCalculationInput => ({
    salary,
    payPeriod: 'annually',
    taxYear: '2024-2025',
    taxCode: '1257L',
    isScottish: false,
    isMarried: true,
    partnerGrossWage: partnerWage,
    isBlind: false,
    age: undefined,
    payNoNI: false,
    pensionContribution: 0,
    pensionContributionType: 'percentage',
    studentLoanPlans: 'none',
    niCategory: 'A',
    hoursPerWeek: 37.5,
  });

  describe('Eligible Scenarios - User SHOULD receive marriage allowance', () => {
    it('✅ User earns £30k, partner earns £8k - SHOULD get allowance', () => {
      // Partner earns LESS than PA (£12,570) - can transfer
      // User is basic rate taxpayer - can receive
      const result = calculateTax(createTestInput(30000, 8000));

      // User should have increased tax-free amount
      expect(result.taxFreeAmount).toBe(12570 + 1260); // £13,830

      // Tax saving should be £252 (£1,260 × 20%)
      const withoutMarriageInput = createTestInput(30000, 8000);
      withoutMarriageInput.isMarried = false;
      const withoutMarriage = calculateTax(withoutMarriageInput);

      const taxSaving = withoutMarriage.incomeTax.annually - result.incomeTax.annually;
      expect(taxSaving).toBeCloseTo(252, 2);
    });

    it('✅ User earns £40k, partner earns £10k - SHOULD get allowance', () => {
      const result = calculateTax(createTestInput(40000, 10000));
      expect(result.taxFreeAmount).toBe(12570 + 1260);
    });

    it('✅ User earns £45k, partner earns £0 - SHOULD get allowance', () => {
      // Partner has no income but still below PA threshold
      const result = calculateTax(createTestInput(45000, 0));
      expect(result.taxFreeAmount).toBe(12570 + 1260);
    });

    it('✅ User earns £50,270 (max basic rate), partner earns £5k - SHOULD get allowance', () => {
      // User at the very top of basic rate band
      const result = calculateTax(createTestInput(50270, 5000));
      expect(result.taxFreeAmount).toBe(12570 + 1260);
    });
  });

  describe('Ineligible Scenarios - User should NOT receive marriage allowance', () => {
    it('❌ User earns £30k, partner earns £40k - NO allowance (partner earns too much)', () => {
      // Partner earns MORE than PA - cannot transfer
      const result = calculateTax(createTestInput(30000, 40000));
      expect(result.taxFreeAmount).toBe(12570); // No marriage allowance
    });

    it('❌ User earns £60k, partner earns £8k - NO allowance (user is higher rate)', () => {
      // User is higher rate taxpayer - cannot receive
      const result = calculateTax(createTestInput(60000, 8000));
      expect(result.taxFreeAmount).toBe(12570); // No marriage allowance
    });

    it('❌ User earns £10k, partner earns £8k - NO allowance (user below PA)', () => {
      // User doesn't pay tax - no benefit from allowance
      const result = calculateTax(createTestInput(10000, 8000));
      expect(result.taxFreeAmount).toBe(12570); // No marriage allowance
    });

    it('❌ User earns £30k, partner earns £12,571 - NO allowance (partner just over threshold)', () => {
      // Partner earns £1 over PA - cannot transfer
      const result = calculateTax(createTestInput(30000, 12571));
      expect(result.taxFreeAmount).toBe(12570); // No marriage allowance
    });

    it('❌ User earns £50,271, partner earns £8k - NO allowance (user just into higher rate)', () => {
      // User £1 into higher rate band - cannot receive
      const result = calculateTax(createTestInput(50271, 8000));
      expect(result.taxFreeAmount).toBe(12570); // No marriage allowance
    });

    it('❌ Not married - NO allowance regardless of incomes', () => {
      const input = createTestInput(30000, 8000);
      input.isMarried = false;
      const result = calculateTax(input);
      expect(result.taxFreeAmount).toBe(12570); // No marriage allowance
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('Partner earns exactly £12,570 - NO allowance (at PA threshold)', () => {
      const result = calculateTax(createTestInput(30000, 12570));
      expect(result.taxFreeAmount).toBe(12570);
    });

    it('Partner earns £12,569 - SHOULD get allowance (£1 under PA)', () => {
      const result = calculateTax(createTestInput(30000, 12569));
      expect(result.taxFreeAmount).toBe(12570 + 1260);
    });

    it('User earns exactly £50,270 - SHOULD get allowance (at basic rate limit)', () => {
      const result = calculateTax(createTestInput(50270, 8000));
      expect(result.taxFreeAmount).toBe(12570 + 1260);
    });

    it('User earns £50,271 - NO allowance (£1 into higher rate)', () => {
      const result = calculateTax(createTestInput(50271, 8000));
      expect(result.taxFreeAmount).toBe(12570);
    });
  });

  describe('Scottish Tax Rates', () => {
    it('Scottish user with eligible partner - SHOULD get allowance', () => {
      const input = createTestInput(35000, 8000);
      input.isScottish = true;
      const result = calculateTax(input);

      // Scottish taxpayers still get marriage allowance
      expect(result.taxFreeAmount).toBe(12570 + 1260);
    });

    it('Scottish higher rate starts at £43,662 - correct threshold applied', () => {
      // Scottish higher rate threshold is lower
      const input = createTestInput(43663, 8000);
      input.isScottish = true;
      const result = calculateTax(input);

      // User just into Scottish higher rate - NO allowance
      expect(result.taxFreeAmount).toBe(12570);
    });
  });

  describe('Financial Impact Verification', () => {
    it('Marriage allowance saves exactly £252 in tax per year', () => {
      const married = calculateTax(createTestInput(30000, 8000));
      const notMarried = calculateTax({ ...createTestInput(30000, 8000), isMarried: false });

      const annualSaving = notMarried.incomeTax.annually - married.incomeTax.annually;
      expect(annualSaving).toBe(252);

      const monthlySaving = notMarried.incomeTax.monthly - married.incomeTax.monthly;
      expect(monthlySaving).toBeCloseTo(21, 2); // £252 / 12 = £21
    });

    it('No tax saving when ineligible', () => {
      // Partner earns too much
      const married = calculateTax(createTestInput(30000, 40000));
      const notMarried = calculateTax({ ...createTestInput(30000, 40000), isMarried: false });

      expect(married.incomeTax.annually).toBe(notMarried.incomeTax.annually);
    });
  });

  describe('Regression Tests - Ensure old bug is fixed', () => {
    it('REGRESSION: Partner earning £40k should NOT give user allowance', () => {
      // This was the bug - system thought partner > PA meant they could transfer
      const result = calculateTax(createTestInput(30000, 40000));
      expect(result.taxFreeAmount).toBe(12570); // Must be standard allowance only
    });

    it('REGRESSION: Partner earning £8k SHOULD give user allowance', () => {
      // This wasn't working before - partner < PA should transfer
      const result = calculateTax(createTestInput(30000, 8000));
      expect(result.taxFreeAmount).toBe(13830); // Must include marriage allowance
    });
  });
});
