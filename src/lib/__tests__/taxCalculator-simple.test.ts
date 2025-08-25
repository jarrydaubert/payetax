import { calculateTax, type TaxCalculationInput } from '../taxCalculator';

describe('Tax Calculator - Basic Structure', () => {
  const defaultInput: TaxCalculationInput = {
    salary: 30000,
    payPeriod: 'annually',
    taxYear: '2024-2025',
    pensionContribution: 0,
    pensionContributionType: 'percentage',
    studentLoanPlans: [],
    niCategory: 'A',
    isScottish: false,
    taxCode: '1257L',
    hoursPerWeek: 40,
    additionalAllowances: [],
  };

  it('should return a result object with expected structure', () => {
    const result = calculateTax(defaultInput);

    expect(result).toBeDefined();
    expect(result.grossSalary.annually).toBe(30000);
    expect(typeof result.taxFreeAmount).toBe('number');
    expect(typeof result.taxableIncome).toBe('number');
    expect(result.incomeTax).toBeDefined();
    expect(result.nationalInsurance).toBeDefined();
    expect(result.netPay).toBeDefined();
  });

  it('should handle zero salary', () => {
    const input = { ...defaultInput, salary: 0 };
    const result = calculateTax(input);

    expect(result).toBeDefined();
    expect(result.grossSalary.annually).toBe(0);
  });

  it('should contain all period calculations', () => {
    const result = calculateTax(defaultInput);

    expect(result.incomeTax.annually).toBeDefined();
    expect(result.incomeTax.monthly).toBeDefined();
    expect(result.incomeTax.weekly).toBeDefined();
    expect(result.incomeTax.daily).toBeDefined();
  });
});
