// src/lib/__tests__/taxCalculator.test.ts

import { calculateTax, type TaxCalculationInput } from '../taxCalculator';

// Helper function to create basic input
const createBasicInput = (
  salary: number,
  overrides: Partial<TaxCalculationInput> = {}
): TaxCalculationInput => ({
  salary,
  payPeriod: 'annually',
  taxYear: '2024-2025',
  taxCode: '1257L',
  isScottish: false,
  pensionContribution: 0,
  pensionContributionType: 'percentage',
  studentLoanPlans: [],
  niCategory: 'A',
  hoursPerWeek: 37.5,
  additionalAllowances: [],
  ...overrides,
});

describe('Tax Calculator', () => {
  describe('Basic Tax Calculations', () => {
    it('calculates tax for basic rate salary correctly', () => {
      const input = createBasicInput(30000);
      const result = calculateTax(input);

      expect(result.grossSalary.annually).toBe(30000);
      expect(result.incomeTax.annually).toBeGreaterThan(3000);
      expect(result.incomeTax.annually).toBeLessThan(4000);
      expect(result.nationalInsurance.annually).toBeGreaterThan(2000);
      expect(result.netPay.annually).toBeLessThan(30000);
    });

    it('calculates tax for higher rate salary correctly', () => {
      const input = createBasicInput(60000);
      const result = calculateTax(input);

      expect(result.grossSalary.annually).toBe(60000);
      expect(result.incomeTax.annually).toBeGreaterThan(10000);
      expect(result.nationalInsurance.annually).toBeGreaterThan(5000);
      expect(result.netPay.annually).toBeLessThan(60000);
    });

    it('handles zero income correctly', () => {
      const input = createBasicInput(0);
      const result = calculateTax(input);

      expect(result.grossSalary.annually).toBe(0);
      expect(result.incomeTax.annually).toBe(0);
      expect(result.nationalInsurance.annually).toBe(0);
      expect(result.netPay.annually).toBe(0);
    });

    it('handles income below personal allowance', () => {
      const input = createBasicInput(10000);
      const result = calculateTax(input);

      expect(result.grossSalary.annually).toBe(10000);
      expect(result.incomeTax.annually).toBe(0);
      expect(result.nationalInsurance.annually).toBe(0);
      expect(result.netPay.annually).toBe(10000);
    });
  });

  describe('Scottish Tax Calculations', () => {
    it('calculates Scottish tax rates correctly', () => {
      const scottishInput = createBasicInput(40000, { isScottish: true });
      const englishInput = createBasicInput(40000, { isScottish: false });

      const scottishResult = calculateTax(scottishInput);
      const englishResult = calculateTax(englishInput);

      // Scottish tax should generally be higher for middle incomes
      expect(scottishResult.incomeTax.annually).toBeGreaterThan(englishResult.incomeTax.annually);
    });

    it('detects Scottish taxpayer from tax code', () => {
      const input = createBasicInput(40000, { taxCode: 'S1257L' });
      const result = calculateTax(input);

      expect(result.grossSalary.annually).toBe(40000);
      expect(result.incomeTax.annually).toBeGreaterThan(0);
    });
  });

  describe('Student Loan Calculations', () => {
    it('calculates Plan 2 student loan repayments', () => {
      const input = createBasicInput(35000, { studentLoanPlans: ['plan2'] });
      const result = calculateTax(input);

      expect(result.studentLoan.annually).toBeGreaterThan(0);
      expect(result.netPay.annually).toBeLessThan(
        35000 - result.incomeTax.annually - result.nationalInsurance.annually
      );
    });

    it('does not calculate student loan for low income', () => {
      const input = createBasicInput(20000, { studentLoanPlans: ['plan2'] });
      const result = calculateTax(input);

      expect(result.studentLoan.annually).toBe(0);
    });

    it('handles multiple student loan plans', () => {
      const input = createBasicInput(40000, { studentLoanPlans: ['plan2', 'postgrad'] });
      const result = calculateTax(input);

      expect(result.studentLoan.annually).toBeGreaterThan(0);
    });
  });

  describe('Pension Contributions', () => {
    it('calculates percentage-based pension contributions', () => {
      const input = createBasicInput(40000, {
        pensionContribution: 5,
        pensionContributionType: 'percentage',
      });
      const result = calculateTax(input);

      expect(result.pensionContribution.annually).toBe(2000); // 5% of 40000
    });

    it('calculates fixed amount pension contributions', () => {
      const input = createBasicInput(40000, {
        pensionContribution: 3000,
        pensionContributionType: 'amount',
      });
      const result = calculateTax(input);

      expect(result.pensionContribution.annually).toBe(3000);
    });
  });

  describe('Pay Period Calculations', () => {
    const testSalary = 36000;

    it('calculates monthly amounts correctly', () => {
      const input = createBasicInput(testSalary, { payPeriod: 'monthly' });
      const result = calculateTax(input);

      expect(result.grossSalary.monthly).toBeCloseTo(3000, 0);
      expect(result.grossSalary.annually).toBe(testSalary);
      expect(result.netPay.monthly).toBeLessThan(result.grossSalary.monthly);
    });

    it('calculates weekly amounts correctly', () => {
      const input = createBasicInput(testSalary, { payPeriod: 'weekly' });
      const result = calculateTax(input);

      expect(result.grossSalary.weekly).toBeCloseTo(692.31, 0);
      expect(result.grossSalary.annually).toBe(testSalary);
      expect(result.netPay.weekly).toBeLessThan(result.grossSalary.weekly);
    });
  });

  describe('Tax Code Handling', () => {
    it('handles standard tax codes', () => {
      const codes = ['1257L', '1000L', '0T', 'BR'];

      for (const code of codes) {
        const input = createBasicInput(30000, { taxCode: code });
        const result = calculateTax(input);

        expect(result.grossSalary.annually).toBe(30000);
        expect(typeof result.incomeTax.annually).toBe('number');
      }
    });

    it('handles Scottish tax codes', () => {
      const codes = ['S1257L', 'S1000L', 'SBR'];

      for (const code of codes) {
        const input = createBasicInput(30000, { taxCode: code });
        const result = calculateTax(input);

        expect(result.grossSalary.annually).toBe(30000);
        expect(typeof result.incomeTax.annually).toBe('number');
      }
    });
  });

  describe('Result Structure', () => {
    it('returns all required properties', () => {
      const input = createBasicInput(35000);
      const result = calculateTax(input);

      // Check gross salary for all periods
      expect(result.grossSalary).toHaveProperty('annually');
      expect(result.grossSalary).toHaveProperty('monthly');
      expect(result.grossSalary).toHaveProperty('weekly');

      // Check tax calculations
      expect(result).toHaveProperty('taxFreeAmount');
      expect(result).toHaveProperty('taxableIncome');
      expect(result).toHaveProperty('incomeTax');
      expect(result).toHaveProperty('nationalInsurance');
      expect(result).toHaveProperty('studentLoan');
      expect(result).toHaveProperty('pensionContribution');
      expect(result).toHaveProperty('netPay');

      // Check arrays
      expect(Array.isArray(result.taxBands)).toBe(true);
    });

    it('maintains mathematical consistency across periods', () => {
      const input = createBasicInput(36000);
      const result = calculateTax(input);

      // Annual should equal monthly * 12 (approximately due to rounding)
      expect(result.grossSalary.monthly * 12).toBeCloseTo(result.grossSalary.annually, 0);
      expect(result.incomeTax.monthly * 12).toBeCloseTo(result.incomeTax.annually, 1);

      // Weekly should equal annual / 52 (approximately)
      expect(result.grossSalary.annually / 52).toBeCloseTo(result.grossSalary.weekly, 1);
    });
  });

  describe('Edge Cases', () => {
    it('handles negative salary gracefully', () => {
      const input = createBasicInput(-1000);
      const result = calculateTax(input);

      // Should handle gracefully - exact behavior depends on implementation
      expect(typeof result.incomeTax.annually).toBe('number');
      expect(typeof result.nationalInsurance.annually).toBe('number');
    });

    it('handles very high salary', () => {
      const input = createBasicInput(500000);
      const result = calculateTax(input);

      expect(result.grossSalary.annually).toBe(500000);
      expect(result.incomeTax.annually).toBeGreaterThan(100000);
      expect(result.netPay.annually).toBeLessThan(500000);
    });

    it('handles precision for small amounts', () => {
      const input = createBasicInput(12571); // £1 over personal allowance
      const result = calculateTax(input);

      expect(result.incomeTax.annually).toBeGreaterThan(0);
      expect(result.incomeTax.annually).toBeLessThan(1);
    });
  });
});
