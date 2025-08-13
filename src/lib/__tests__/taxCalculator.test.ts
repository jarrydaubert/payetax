import { PERIODS, type TaxAllowance } from '@/constants/taxRates';
// src/lib/__tests__/taxCalculator.test.ts
import { calculateTax, type TaxCalculationInput } from '../taxCalculator';

// Helper function to round to 2 decimal places for consistent comparison
const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100;
};

// Helper to create an allowance
const createAllowance = (amount: number): TaxAllowance[] => {
  return [
    {
      type: 'workingFromHome',
      name: 'Working From Home',
      description: 'Home office allowance',
      amount,
      period: PERIODS.ANNUALLY,
    },
  ];
};

describe('Tax Calculator', () => {
  /**
   * UK Standard Calculation
   * Input: Gross £49,131 (annual), 1257L, pension £1,965.24, allowance £312
   * Expected: Tax £6,856.75, Employee NI £2,742.70, Employer NI £6,619.65, Net £37,254.31
   */
  test('UK Standard Calculation', () => {
    const input: TaxCalculationInput = {
      salary: 49131,
      payPeriod: PERIODS.ANNUALLY,
      taxYear: '2024-2025',
      taxCode: '1257L',
      isScottish: false,
      pensionContribution: 1965.24,
      pensionContributionType: 'amount',
      studentLoanPlans: ['none'],
      niCategory: 'A',
      hoursPerWeek: 40,
      additionalAllowances: createAllowance(312),
    };

    const result = calculateTax(input);

    expect(roundToTwoDecimals(result.incomeTax.annually)).toBe(6856.75);
    expect(roundToTwoDecimals(result.nationalInsurance.annually)).toBe(2742.7);
    expect(roundToTwoDecimals(result.employerNI)).toBe(6619.65);
    expect(roundToTwoDecimals(result.netPay.annually)).toBe(37254.31);
  });

  /**
   * Scottish Standard Calculation
   * Input: Same, S1257L
   * Expected: Tax £7,706.89, Employee NI £2,742.70, Employer NI £6,619.65, Net £36,404.17
   */
  test('Scottish Standard Calculation', () => {
    const input: TaxCalculationInput = {
      salary: 49131,
      payPeriod: PERIODS.ANNUALLY,
      taxYear: '2024-2025',
      taxCode: 'S1257L',
      isScottish: true,
      pensionContribution: 1965.24,
      pensionContributionType: 'amount',
      studentLoanPlans: ['none'],
      niCategory: 'A',
      hoursPerWeek: 40,
      additionalAllowances: createAllowance(312),
    };

    const result = calculateTax(input);

    expect(roundToTwoDecimals(result.incomeTax.annually)).toBe(7706.89);
    expect(roundToTwoDecimals(result.nationalInsurance.annually)).toBe(2742.7);
    expect(roundToTwoDecimals(result.employerNI)).toBe(6619.65);
    expect(roundToTwoDecimals(result.netPay.annually)).toBe(36404.17);
  });

  /**
   * Low Income (No Tax/NI)
   * Input: Gross £10,000 (annual), 1257L
   * Expected: Tax £0, Employee NI £0, Employer NI £750, Net £10,000
   */
  test('Low Income (No Tax/NI)', () => {
    const input: TaxCalculationInput = {
      salary: 10000,
      payPeriod: PERIODS.ANNUALLY,
      taxYear: '2024-2025',
      taxCode: '1257L',
      isScottish: false,
      pensionContribution: 0,
      pensionContributionType: 'percentage',
      studentLoanPlans: ['none'],
      niCategory: 'A',
      hoursPerWeek: 40,
      additionalAllowances: [],
    };

    const result = calculateTax(input);

    expect(roundToTwoDecimals(result.incomeTax.annually)).toBe(0);
    expect(roundToTwoDecimals(result.nationalInsurance.annually)).toBe(0);
    expect(roundToTwoDecimals(result.employerNI)).toBe(750);
    expect(roundToTwoDecimals(result.netPay.annually)).toBe(10000);
  });

  /**
   * High Income with Allowance Reduction
   * Input: Gross £130,000 (annual), 1257L
   * Expected: Tax £43,892, Employee NI £5,406.70, Employer NI £18,750, Net £80,701.30
   */
  test('High Income with Allowance Reduction', () => {
    const input: TaxCalculationInput = {
      salary: 130000,
      payPeriod: PERIODS.ANNUALLY,
      taxYear: '2024-2025',
      taxCode: '1257L',
      isScottish: false,
      pensionContribution: 0,
      pensionContributionType: 'percentage',
      studentLoanPlans: ['none'],
      niCategory: 'A',
      hoursPerWeek: 40,
      additionalAllowances: [],
    };

    const result = calculateTax(input);

    expect(roundToTwoDecimals(result.incomeTax.annually)).toBe(43892);
    expect(roundToTwoDecimals(result.nationalInsurance.annually)).toBe(5406.7);
    expect(roundToTwoDecimals(result.employerNI)).toBe(18750);
    expect(roundToTwoDecimals(result.netPay.annually)).toBe(80701.3);
  });

  /**
   * Employer NI Threshold
   * Input: Gross £5,500 (annual), 1257L
   * Expected: Tax £0, Employee NI £0, Employer NI £75, Net £5,500
   */
  test('Employer NI Threshold', () => {
    const input: TaxCalculationInput = {
      salary: 5500,
      payPeriod: PERIODS.ANNUALLY,
      taxYear: '2024-2025',
      taxCode: '1257L',
      isScottish: false,
      pensionContribution: 0,
      pensionContributionType: 'percentage',
      studentLoanPlans: ['none'],
      niCategory: 'A',
      hoursPerWeek: 40,
      additionalAllowances: [],
    };

    const result = calculateTax(input);

    expect(roundToTwoDecimals(result.incomeTax.annually)).toBe(0);
    expect(roundToTwoDecimals(result.nationalInsurance.annually)).toBe(0);
    expect(roundToTwoDecimals(result.employerNI)).toBe(75);
    expect(roundToTwoDecimals(result.netPay.annually)).toBe(5500);
  });

  /**
   * Upper NI Threshold
   * Input: Gross £60,000 (annual), 1257L
   * Expected: Tax £9,486, Employee NI £3,832, Employer NI £8,250, Net £46,682
   */
  test('Upper NI Threshold', () => {
    const input: TaxCalculationInput = {
      salary: 60000,
      payPeriod: PERIODS.ANNUALLY,
      taxYear: '2024-2025',
      taxCode: '1257L',
      isScottish: false,
      pensionContribution: 0,
      pensionContributionType: 'percentage',
      studentLoanPlans: ['none'],
      niCategory: 'A',
      hoursPerWeek: 40,
      additionalAllowances: [],
    };

    const result = calculateTax(input);

    expect(roundToTwoDecimals(result.incomeTax.annually)).toBe(9486);
    expect(roundToTwoDecimals(result.nationalInsurance.annually)).toBe(3832);
    expect(roundToTwoDecimals(result.employerNI)).toBe(8250);
    expect(roundToTwoDecimals(result.netPay.annually)).toBe(46682);
  });

  /**
   * Student Loan (Plan 5)
   * Input: Gross £49,131 (annual), 1257L, Plan 5
   * Expected: Tax £6,856.75, Employee NI £2,742.70, Employer NI £6,619.65, Student Loan £2,161.80, Net £35,092.51
   */
  test('Student Loan (Plan 5)', () => {
    const input: TaxCalculationInput = {
      salary: 49131,
      payPeriod: PERIODS.ANNUALLY,
      taxYear: '2024-2025',
      taxCode: '1257L',
      isScottish: false,
      pensionContribution: 0,
      pensionContributionType: 'percentage',
      studentLoanPlans: ['plan5'],
      niCategory: 'A',
      hoursPerWeek: 40,
      additionalAllowances: [],
    };

    const result = calculateTax(input);

    expect(roundToTwoDecimals(result.incomeTax.annually)).toBe(6856.75);
    expect(roundToTwoDecimals(result.nationalInsurance.annually)).toBe(2742.7);
    expect(roundToTwoDecimals(result.employerNI)).toBe(6619.65);
    expect(roundToTwoDecimals(result.studentLoan.annually)).toBe(2161.8);
    expect(roundToTwoDecimals(result.netPay.annually)).toBe(35092.51);
  });

  /**
   * NI Category Variation (Category C)
   * Input: Gross £49,131 (annual), 1257L, Category C
   * Expected: Tax £6,856.75, Employee NI £0, Employer NI £6,619.65, Net £42,274.25
   */
  test('NI Category Variation (Category C)', () => {
    const input: TaxCalculationInput = {
      salary: 49131,
      payPeriod: PERIODS.ANNUALLY,
      taxYear: '2024-2025',
      taxCode: '1257L',
      isScottish: false,
      pensionContribution: 0,
      pensionContributionType: 'percentage',
      studentLoanPlans: ['none'],
      niCategory: 'C',
      hoursPerWeek: 40,
      additionalAllowances: [],
    };

    const result = calculateTax(input);

    expect(roundToTwoDecimals(result.incomeTax.annually)).toBe(6856.75);
    expect(roundToTwoDecimals(result.nationalInsurance.annually)).toBe(0);
    expect(roundToTwoDecimals(result.employerNI)).toBe(6619.65);
    expect(roundToTwoDecimals(result.netPay.annually)).toBe(42274.25);
  });

  /**
   * Invalid Tax Code Fallback
   * Input: Gross £49,131 (annual), invalid code
   * Expected: Tax £6,856.75, Employee NI £2,742.70, Employer NI £6,619.65, Net £37,254.31
   */
  test('Invalid Tax Code Fallback', () => {
    const input: TaxCalculationInput = {
      salary: 49131,
      payPeriod: PERIODS.ANNUALLY,
      taxYear: '2024-2025',
      taxCode: 'INVALID', // Invalid tax code
      isScottish: false,
      pensionContribution: 0,
      pensionContributionType: 'percentage',
      studentLoanPlans: ['none'],
      niCategory: 'A',
      hoursPerWeek: 40,
      additionalAllowances: [],
    };

    const result = calculateTax(input);

    // Should use default tax code behavior
    expect(roundToTwoDecimals(result.incomeTax.annually)).toBe(6856.75);
    expect(roundToTwoDecimals(result.nationalInsurance.annually)).toBe(2742.7);
    expect(roundToTwoDecimals(result.employerNI)).toBe(6619.65);
    expect(roundToTwoDecimals(result.netPay.annually)).toBe(39531.55);
  });

  /**
   * Percentage-Based Pension Contributions
   * Input: Gross £49,131 (annual), 1257L, 5% pension
   * Expected: Tax £6,486.75, Employee NI £2,702.75, Employer NI £6,533.33, Net £37,485.06
   */
  test('Percentage-Based Pension Contributions', () => {
    const input: TaxCalculationInput = {
      salary: 49131,
      payPeriod: PERIODS.ANNUALLY,
      taxYear: '2024-2025',
      taxCode: '1257L',
      isScottish: false,
      pensionContribution: 5,
      pensionContributionType: 'percentage',
      studentLoanPlans: ['none'],
      niCategory: 'A',
      hoursPerWeek: 40,
      additionalAllowances: [],
    };

    const result = calculateTax(input);
    const expectedPensionAmount = 49131 * 0.05;

    expect(roundToTwoDecimals(result.pensionContribution.annually)).toBe(
      roundToTwoDecimals(expectedPensionAmount)
    );
    expect(roundToTwoDecimals(result.incomeTax.annually)).toBe(6486.75);
    expect(roundToTwoDecimals(result.nationalInsurance.annually)).toBe(2702.75);
    expect(roundToTwoDecimals(result.employerNI)).toBe(6533.33);
    expect(roundToTwoDecimals(result.netPay.annually)).toBe(37485.06);
  });

  /**
   * Multiple Tax Allowances
   * Input: Gross £49,131 (annual), 1257L, multiple allowances
   */
  test('Multiple Tax Allowances', () => {
    const allowances: TaxAllowance[] = [
      {
        type: 'workingFromHome',
        name: 'Working From Home',
        description: 'Home office allowance',
        amount: 312,
        period: PERIODS.ANNUALLY,
      },
      {
        type: 'professionalSubscriptions',
        name: 'Professional Membership',
        description: 'Professional body fees',
        amount: 250,
        period: PERIODS.ANNUALLY,
      },
    ];

    const input: TaxCalculationInput = {
      salary: 49131,
      payPeriod: PERIODS.ANNUALLY,
      taxYear: '2024-2025',
      taxCode: '1257L',
      isScottish: false,
      pensionContribution: 0,
      pensionContributionType: 'percentage',
      studentLoanPlans: ['none'],
      niCategory: 'A',
      hoursPerWeek: 40,
      additionalAllowances: allowances,
    };

    const result = calculateTax(input);

    // With both allowances (562 total), tax should be lower than standard calculation
    expect(roundToTwoDecimals(result.incomeTax.annually)).toBe(6744.75);
    expect(roundToTwoDecimals(result.additionalAllowances?.annually || 0)).toBe(562);
    expect(roundToTwoDecimals(result.netPay.annually)).toBe(39643.55);
  });

  /**
   * Multiple Student Loan Plans
   * Input: Gross £49,131 (annual), 1257L, Plan 2 and Postgrad loans
   */
  test('Multiple Student Loan Plans', () => {
    const input: TaxCalculationInput = {
      salary: 49131,
      payPeriod: PERIODS.ANNUALLY,
      taxYear: '2024-2025',
      taxCode: '1257L',
      isScottish: false,
      pensionContribution: 0,
      pensionContributionType: 'percentage',
      studentLoanPlans: ['plan2', 'postgrad'],
      niCategory: 'A',
      hoursPerWeek: 40,
      additionalAllowances: [],
    };

    const result = calculateTax(input);

    // Should calculate both Plan 2 (9%) and Postgrad (6%) loan repayments
    const plan2Amount = (49131 - 27295) * 0.09;
    const postgradAmount = (49131 - 21000) * 0.06;
    const totalStudentLoan = plan2Amount + postgradAmount;

    expect(roundToTwoDecimals(result.studentLoan.annually)).toBe(
      roundToTwoDecimals(totalStudentLoan)
    );
    expect(roundToTwoDecimals(result.netPay.annually)).toBe(
      roundToTwoDecimals(
        49131 - result.incomeTax.annually - result.nationalInsurance.annually - totalStudentLoan
      )
    );
  });

  /**
   * Different Pay Periods
   * Input: Gross £4,094.25 (monthly), 1257L
   * Expected: Annual amount should be £49,131
   */
  test('Different Pay Periods', () => {
    const input: TaxCalculationInput = {
      salary: 4094.25,
      payPeriod: PERIODS.MONTHLY,
      taxYear: '2024-2025',
      taxCode: '1257L',
      isScottish: false,
      pensionContribution: 0,
      pensionContributionType: 'percentage',
      studentLoanPlans: ['none'],
      niCategory: 'A',
      hoursPerWeek: 40,
      additionalAllowances: [],
    };

    const result = calculateTax(input);

    // Monthly salary of £4,094.25 should convert to annual salary of £49,131
    expect(roundToTwoDecimals(result.grossSalary.annually)).toBe(49131);
    expect(roundToTwoDecimals(result.incomeTax.annually)).toBe(6856.75);
    expect(roundToTwoDecimals(result.nationalInsurance.annually)).toBe(2742.7);
    expect(roundToTwoDecimals(result.employerNI)).toBe(6619.65);
    expect(roundToTwoDecimals(result.netPay.annually)).toBe(39531.55);
  });
});
