/**
 * State Pension age behaviour.
 *
 * Correct law: age-related Personal Allowances were abolished from 2016-17
 * (Finance Act 2015) — every taxpayer gets the standard Personal Allowance
 * regardless of age. Reaching State Pension age affects exactly one thing in
 * PAYE: employee Class 1 NI stops (employers still pay). The calculator takes
 * an explicit declaration because State Pension age varies by date of birth.
 *
 * @see https://commonslibrary.parliament.uk/research-briefings/sn06158/
 * @see https://www.gov.uk/employee-reaches-state-pension-age
 */

import { calculateTax, type TaxCalculationInput } from '../taxCalculator';

const STANDARD_PA = 12570;

describe('State Pension age', () => {
  const createTestInput = (
    salary: number,
    reachedStatePensionAge?: boolean,
  ): TaxCalculationInput => ({
    salary,
    payPeriod: 'annually',
    taxYear: '2024-2025',
    taxCode: '',
    isScottish: false,
    isMarried: false,
    partnerGrossWage: 0,
    isBlind: false,
    reachedStatePensionAge,
    payNoNI: false,
    pensionContribution: 0,
    pensionContributionType: 'percentage',
    studentLoanPlans: 'none',
    niCategory: 'A',
    hoursPerWeek: 37.5,
  });

  describe('The declaration never changes the Personal Allowance (abolished 2016-17)', () => {
    it.each([[true], [false], [undefined]])(
      'reachedStatePensionAge=%s gets the standard Personal Allowance only',
      (reached) => {
        const result = calculateTax(createTestInput(25000, reached));
        expect(result.taxFreeAmount).toBe(STANDARD_PA);
      },
    );

    it('income tax is identical with and without the declaration', () => {
      const reached = calculateTax(createTestInput(25000, true));
      const notReached = calculateTax(createTestInput(25000));
      expect(reached.taxFreeAmount).toBe(notReached.taxFreeAmount);
      expect(reached.incomeTax.annually).toBe(notReached.incomeTax.annually);
    });

    it('income in the old £34,600 taper zone shows no age artifact', () => {
      const reached = calculateTax(createTestInput(36000, true));
      const notReached = calculateTax(createTestInput(36000));
      expect(reached.taxFreeAmount).toBe(STANDARD_PA);
      expect(reached.incomeTax.annually).toBe(notReached.incomeTax.annually);
    });

    it('PA taper above £100k works the same after State Pension age', () => {
      const result = calculateTax(createTestInput(110000, true));
      // (£110,000 - £100,000) ÷ 2 = £5,000 reduction; no age effects
      expect(result.taxFreeAmount).toBe(STANDARD_PA - 5000);
    });
  });

  describe('State Pension age NI exemption (its only effect)', () => {
    it('not reached - pays employee NI', () => {
      const result = calculateTax(createTestInput(30000, false));
      expect(result.nationalInsurance.annually).toBeGreaterThan(0);
    });

    it('not declared - pays employee NI', () => {
      const result = calculateTax(createTestInput(30000));
      expect(result.nationalInsurance.annually).toBeGreaterThan(0);
    });

    it('reached - no employee NI, employer still pays, standard Personal Allowance', () => {
      const result = calculateTax(createTestInput(30000, true));
      expect(result.nationalInsurance.annually).toBe(0);
      expect(result.employerNI).toBeGreaterThan(0);
      expect(result.taxFreeAmount).toBe(STANDARD_PA);
    });

    it('reached with high income - still no employee NI', () => {
      const result = calculateTax(createTestInput(100000, true));
      expect(result.nationalInsurance.annually).toBe(0);
      expect(result.employerNI).toBeGreaterThan(0);
    });

    it('manual payNoNI override still works before State Pension age', () => {
      const input = createTestInput(30000, false);
      input.payNoNI = true;
      const result = calculateTax(input);
      expect(result.nationalInsurance.annually).toBe(0);
    });

    it('NI Category C override still works', () => {
      const input = createTestInput(30000, false);
      input.niCategory = 'C';
      const result = calculateTax(input);
      expect(result.nationalInsurance.annually).toBe(0);
    });
  });

  describe('Other allowances are unaffected by State Pension age', () => {
    it('blind allowance applies without any age addition', () => {
      const input = createTestInput(25000, true);
      input.isBlind = true;
      const result = calculateTax(input);
      // 2024-25 Blind Person's Allowance is £3,070 — no age component.
      expect(result.taxFreeAmount).toBe(STANDARD_PA + 3070);
    });

    it('marriage allowance applies without any age addition', () => {
      const input = createTestInput(30000, true);
      input.isMarried = true;
      input.partnerGrossWage = 8000;
      const result = calculateTax(input);
      expect(result.taxFreeAmount).toBe(STANDARD_PA + 1260);
    });
  });
});
