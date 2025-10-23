/**
 * Age-Related Personal Allowance Test Suite
 *
 * This test suite verifies the age-related personal allowance implementation:
 * - Age 65-74: Additional £3,660 allowance
 * - Age 75+: Additional £3,960 allowance
 * - Income taper: Reduces by £1 for every £2 over £34,600
 *
 * CRITICAL FIX: Age input was completely missing from the calculator
 */

import { calculateTax, type TaxCalculationInput } from '../taxCalculator';

describe('Age-Related Personal Allowances - Comprehensive Tests', () => {
  const createTestInput = (salary: number, age?: number): TaxCalculationInput => ({
    salary,
    payPeriod: 'annually',
    taxYear: '2024-2025',
    taxCode: '1257L',
    isScottish: false,
    isMarried: false,
    partnerGrossWage: 0,
    isBlind: false,
    age,
    payNoNI: age ? age >= 66 : false, // State pension age
    pensionContribution: 0,
    pensionContributionType: 'percentage',
    studentLoanPlan: 'none',
    niCategory: 'A',
    hoursPerWeek: 37.5,
  });

  describe('Age Allowance Amounts', () => {
    it('✅ Age 65-74: Gets £3,660 additional allowance', () => {
      const age67 = calculateTax(createTestInput(25000, 67));
      const noAge = calculateTax(createTestInput(25000));

      // Should have standard PA + age allowance
      expect(age67.taxFreeAmount).toBe(12570 + 3660); // £16,230
      expect(noAge.taxFreeAmount).toBe(12570);

      // Tax saving should be £732 (£3,660 × 20%)
      const taxSaving = noAge.incomeTax.annually - age67.incomeTax.annually;
      expect(taxSaving).toBeCloseTo(732, 0);
    });

    it('✅ Age 75+: Gets £3,960 additional allowance', () => {
      const age75 = calculateTax(createTestInput(25000, 75));
      const age67 = calculateTax(createTestInput(25000, 67));

      // Age 75+ gets more than 65-74
      expect(age75.taxFreeAmount).toBe(12570 + 3960); // £16,530
      expect(age67.taxFreeAmount).toBe(12570 + 3660); // £16,230

      // Extra £300 allowance saves £60 in tax
      const extraSaving = age67.incomeTax.annually - age75.incomeTax.annually;
      expect(extraSaving).toBeCloseTo(60, 0);
    });

    it('✅ Age 80: Still gets £3,960 (75+ rate)', () => {
      const age80 = calculateTax(createTestInput(25000, 80));
      expect(age80.taxFreeAmount).toBe(12570 + 3960);
    });

    it('❌ Age 64: No age allowance (under 65)', () => {
      const age64 = calculateTax(createTestInput(25000, 64));
      expect(age64.taxFreeAmount).toBe(12570);
    });

    it('❌ Age 30: No age allowance', () => {
      const age30 = calculateTax(createTestInput(25000, 30));
      expect(age30.taxFreeAmount).toBe(12570);
    });

    it('❌ No age specified: No age allowance', () => {
      const noAge = calculateTax(createTestInput(25000));
      expect(noAge.taxFreeAmount).toBe(12570);
    });
  });

  describe('Income Tapering (£34,600 threshold)', () => {
    it('Income £34,600 or below - FULL age allowance', () => {
      const age67 = calculateTax(createTestInput(34600, 67));
      expect(age67.taxFreeAmount).toBe(12570 + 3660); // Full allowance
    });

    it('Income £35,600 - Reduced by £500 (£1,000 excess ÷ 2)', () => {
      const age67 = calculateTax(createTestInput(35600, 67));
      // £1,000 over threshold, reduce by £500
      expect(age67.taxFreeAmount).toBe(12570 + 3160); // £3,660 - £500
    });

    it('Income £40,000 - Reduced by £2,700', () => {
      const age67 = calculateTax(createTestInput(40000, 67));
      // £5,400 over threshold, reduce by £2,700
      expect(age67.taxFreeAmount).toBe(12570 + 960); // £3,660 - £2,700
    });

    it('Income £41,920 - Age allowance completely removed', () => {
      const age67 = calculateTax(createTestInput(41920, 67));
      // £7,320 over threshold, would reduce by £3,660 (entire allowance)
      expect(age67.taxFreeAmount).toBe(12570); // No age allowance left
    });

    it('Income £50,000 - No age allowance (fully tapered)', () => {
      const age67 = calculateTax(createTestInput(50000, 67));
      expect(age67.taxFreeAmount).toBe(12570);
    });

    it('Age 75+ with £40,000 income - Higher allowance but still tapered', () => {
      const age75 = calculateTax(createTestInput(40000, 75));
      // £5,400 over threshold, reduce by £2,700
      // £3,960 - £2,700 = £1,260 remaining
      expect(age75.taxFreeAmount).toBe(12570 + 1260);
    });
  });

  describe('Edge Cases and Boundaries', () => {
    it('Exactly age 65 - Gets age allowance', () => {
      const age65 = calculateTax(createTestInput(25000, 65));
      expect(age65.taxFreeAmount).toBe(12570 + 3660);
    });

    it('Exactly age 75 - Gets higher allowance', () => {
      const age75 = calculateTax(createTestInput(25000, 75));
      expect(age75.taxFreeAmount).toBe(12570 + 3960);
    });

    it('Income exactly £34,601 - £0.50 reduction (rounds down)', () => {
      const age67 = calculateTax(createTestInput(34601, 67));
      // £1 over threshold, reduce by £0.50, rounds to £0
      expect(age67.taxFreeAmount).toBe(12570 + 3660);
    });

    it('Income exactly £34,602 - £1 reduction', () => {
      const age67 = calculateTax(createTestInput(34602, 67));
      // £2 over threshold, reduce by £1
      expect(age67.taxFreeAmount).toBe(12570 + 3659);
    });
  });

  describe('Combination with Other Allowances', () => {
    it('Age + Blind allowance - Both apply', () => {
      const input = createTestInput(25000, 67);
      input.isBlind = true;
      const result = calculateTax(input);

      // Should get standard + age + blind
      expect(result.taxFreeAmount).toBe(12570 + 3660 + 3070); // £19,300
    });

    it('Age + Marriage allowance - Both apply if eligible', () => {
      const input = createTestInput(30000, 67);
      input.isMarried = true;
      input.partnerGrossWage = 8000; // Partner can transfer
      const result = calculateTax(input);

      // Should get standard + age + marriage
      expect(result.taxFreeAmount).toBe(12570 + 3660 + 1260); // £17,490
    });

    it('Age 67 with high income (£100k+) - Age allowance tapered, PA also reduced', () => {
      const age67 = calculateTax(createTestInput(110000, 67));
      // Age allowance fully tapered away (income > £41,920)
      // PA reduced by £5,000 ((£110,000 - £100,000) ÷ 2)
      expect(age67.taxFreeAmount).toBe(12570 - 5000); // £7,570
    });

    it('Age 67 with £125,140+ income - All allowances gone', () => {
      const age67 = calculateTax(createTestInput(130000, 67));
      expect(age67.taxFreeAmount).toBe(0); // No allowances at this income
    });
  });

  describe('National Insurance and Age', () => {
    it('Age 66+ should have payNoNI set (state pension age)', () => {
      const age66 = createTestInput(30000, 66);
      expect(age66.payNoNI).toBe(true);

      const age65 = createTestInput(30000, 65);
      expect(age65.payNoNI).toBe(false);
    });

    it('Age 67 pays no NI but still gets age allowance', () => {
      const result = calculateTax(createTestInput(30000, 67));
      expect(result.nationalInsurance.annually).toBe(0);
      expect(result.taxFreeAmount).toBe(12570 + 3660);
    });
  });

  describe('Auto Age-Based NI Exemption (PAYTAX-55)', () => {
    it('Age 65 - pays NI (below SPA)', () => {
      const input = createTestInput(30000, 65);
      input.payNoNI = false; // Explicitly test automatic detection
      const result = calculateTax(input);

      expect(result.nationalInsurance.annually).toBeGreaterThan(0);
      expect(result.taxFreeAmount).toBe(12570 + 3660); // Gets age allowance
    });

    it('Age 66 - no employee NI (at SPA), employer still pays', () => {
      const input = createTestInput(30000, 66);
      input.payNoNI = false; // Don't use manual override
      const result = calculateTax(input);

      expect(result.nationalInsurance.annually).toBe(0); // Employee: £0
      expect(result.employerNI).toBeGreaterThan(0); // Employer still pays
      expect(result.taxFreeAmount).toBe(12570 + 3660);
    });

    it('Age 70 - no NI, gets age allowance', () => {
      const input = createTestInput(30000, 70);
      input.payNoNI = false;
      const result = calculateTax(input);

      expect(result.nationalInsurance.annually).toBe(0);
      expect(result.employerNI).toBeGreaterThan(0);
      expect(result.taxFreeAmount).toBe(12570 + 3660);
    });

    it('Age 76 - no NI, gets higher age allowance', () => {
      const input = createTestInput(30000, 76);
      input.payNoNI = false;
      const result = calculateTax(input);

      expect(result.nationalInsurance.annually).toBe(0);
      expect(result.employerNI).toBeGreaterThan(0);
      expect(result.taxFreeAmount).toBe(12570 + 3960); // Higher allowance
    });

    it('Manual payNoNI override still works for under 66', () => {
      const input = createTestInput(30000, 50);
      input.payNoNI = true; // Manual override
      const result = calculateTax(input);

      expect(result.nationalInsurance.annually).toBe(0);
    });

    it('NI Category C override still works', () => {
      const input = createTestInput(30000, 50);
      input.niCategory = 'C';
      const result = calculateTax(input);

      expect(result.nationalInsurance.annually).toBe(0);
    });

    it('Age 66+ with high income - still no NI', () => {
      const input = createTestInput(100000, 68);
      input.payNoNI = false;
      const result = calculateTax(input);

      expect(result.nationalInsurance.annually).toBe(0);
      expect(result.employerNI).toBeGreaterThan(0);
    });
  });

  describe('Financial Impact Examples', () => {
    it('Pensioner with £20k pension - significant tax saving', () => {
      const with67 = calculateTax(createTestInput(20000, 67));
      const without = calculateTax(createTestInput(20000));

      // Age 67: £20,000 - £16,230 = £3,770 taxable
      // No age: £20,000 - £12,570 = £7,430 taxable
      // Saving: £3,660 × 20% = £732
      const taxSaving = without.incomeTax.annually - with67.incomeTax.annually;
      expect(taxSaving).toBeCloseTo(732, 0);
    });

    it('High earning 67 year old (£40k) - partial benefit', () => {
      const with67 = calculateTax(createTestInput(40000, 67));
      const without = calculateTax(createTestInput(40000));

      // Age allowance partially tapered
      // Still saves some tax but not the full amount
      const taxSaving = without.incomeTax.annually - with67.incomeTax.annually;
      expect(taxSaving).toBeLessThan(732); // Less than full saving
      expect(taxSaving).toBeGreaterThan(0); // But still some saving
    });
  });

  describe('Regression Tests - Ensure age input works', () => {
    it('REGRESSION: Age field must affect tax calculation', () => {
      const with65 = calculateTax(createTestInput(25000, 65));
      const without = calculateTax(createTestInput(25000));

      // Must have different tax-free amounts
      expect(with65.taxFreeAmount).not.toBe(without.taxFreeAmount);

      // Must have different tax amounts
      expect(with65.incomeTax.annually).not.toBe(without.incomeTax.annually);
    });

    it('REGRESSION: Reddit complaint - "no where to put your age in"', () => {
      // This test ensures age input is processed
      const input = createTestInput(30000, 67);
      expect(input.age).toBe(67); // Age must be in input

      const result = calculateTax(input);
      expect(result.taxFreeAmount).toBeGreaterThan(12570); // Age must affect allowance
    });
  });
});
