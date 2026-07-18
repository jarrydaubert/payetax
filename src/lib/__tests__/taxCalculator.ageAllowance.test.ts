/**
 * Age and State Pension age behaviour.
 *
 * Correct law: age-related Personal Allowances were abolished from 2016-17
 * (Finance Act 2015) — every taxpayer gets the standard Personal Allowance
 * regardless of age. Age affects exactly one thing in PAYE: employees over
 * State Pension age stop paying employee Class 1 NI (employers still pay).
 *
 * @see https://commonslibrary.parliament.uk/research-briefings/sn06158/
 * @see https://www.gov.uk/national-insurance-when-you-reach-state-pension-age
 */

import { calculateTax, type TaxCalculationInput } from '../taxCalculator';

const STANDARD_PA = 12570;

describe('Age and State Pension age', () => {
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
    payNoNI: false,
    pensionContribution: 0,
    pensionContributionType: 'percentage',
    studentLoanPlans: 'none',
    niCategory: 'A',
    hoursPerWeek: 37.5,
  });

  describe('Age never changes the Personal Allowance (abolished 2016-17)', () => {
    it.each([
      [30],
      [64],
      [65],
      [67],
      [75],
      [80],
      [150],
    ])('age %i gets the standard Personal Allowance only', (age) => {
      const result = calculateTax(createTestInput(25000, age));
      expect(result.taxFreeAmount).toBe(STANDARD_PA);
    });

    it('no age specified gets the standard Personal Allowance', () => {
      const result = calculateTax(createTestInput(25000));
      expect(result.taxFreeAmount).toBe(STANDARD_PA);
    });

    it('income tax is identical for a 67-year-old and an unaged taxpayer', () => {
      const aged = calculateTax(createTestInput(25000, 67));
      const unaged = calculateTax(createTestInput(25000));
      expect(aged.taxFreeAmount).toBe(unaged.taxFreeAmount);
      expect(aged.incomeTax.annually).toBe(unaged.incomeTax.annually);
    });

    it('income tax is identical for 67 and 78 (no 75+ uplift exists)', () => {
      const age67 = calculateTax(createTestInput(20000, 67));
      const age78 = calculateTax(createTestInput(20000, 78));
      expect(age67.incomeTax.annually).toBe(age78.incomeTax.annually);
      expect(age67.taxFreeAmount).toBe(STANDARD_PA);
      expect(age78.taxFreeAmount).toBe(STANDARD_PA);
    });

    it('income in the old £34,600 taper zone shows no age artifact', () => {
      const aged = calculateTax(createTestInput(36000, 67));
      const unaged = calculateTax(createTestInput(36000));
      expect(aged.taxFreeAmount).toBe(STANDARD_PA);
      expect(aged.incomeTax.annually).toBe(unaged.incomeTax.annually);
    });

    it('PA taper above £100k works the same with an age set', () => {
      const result = calculateTax(createTestInput(110000, 67));
      // (£110,000 - £100,000) ÷ 2 = £5,000 reduction; no age effects
      expect(result.taxFreeAmount).toBe(STANDARD_PA - 5000);
    });
  });

  describe('State Pension age NI exemption (the only age effect)', () => {
    it('age 65 - pays employee NI (below SPA)', () => {
      const result = calculateTax(createTestInput(30000, 65));
      expect(result.nationalInsurance.annually).toBeGreaterThan(0);
    });

    it('age 66 - no employee NI, employer still pays', () => {
      const result = calculateTax(createTestInput(30000, 66));
      expect(result.nationalInsurance.annually).toBe(0);
      expect(result.employerNI).toBeGreaterThan(0);
    });

    it('age 70 - no employee NI, standard Personal Allowance', () => {
      const result = calculateTax(createTestInput(30000, 70));
      expect(result.nationalInsurance.annually).toBe(0);
      expect(result.employerNI).toBeGreaterThan(0);
      expect(result.taxFreeAmount).toBe(STANDARD_PA);
    });

    it('age 66+ with high income - still no employee NI', () => {
      const result = calculateTax(createTestInput(100000, 68));
      expect(result.nationalInsurance.annually).toBe(0);
      expect(result.employerNI).toBeGreaterThan(0);
    });

    it('manual payNoNI override still works for under 66', () => {
      const input = createTestInput(30000, 50);
      input.payNoNI = true;
      const result = calculateTax(input);
      expect(result.nationalInsurance.annually).toBe(0);
    });

    it('NI Category C override still works', () => {
      const input = createTestInput(30000, 50);
      input.niCategory = 'C';
      const result = calculateTax(input);
      expect(result.nationalInsurance.annually).toBe(0);
    });
  });

  describe('Other allowances are unaffected by age', () => {
    it('blind allowance applies without any age addition', () => {
      const input = createTestInput(25000, 67);
      input.isBlind = true;
      const result = calculateTax(input);
      // 2024-25 Blind Person's Allowance is £3,070 — no age component.
      expect(result.taxFreeAmount).toBe(STANDARD_PA + 3070);
    });

    it('marriage allowance applies without any age addition', () => {
      const input = createTestInput(30000, 67);
      input.isMarried = true;
      input.partnerGrossWage = 8000;
      const result = calculateTax(input);
      expect(result.taxFreeAmount).toBe(STANDARD_PA + 1260);
    });
  });
});
