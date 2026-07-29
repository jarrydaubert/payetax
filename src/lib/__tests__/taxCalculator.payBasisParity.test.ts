/**
 * Behaviour-regression fixture captured from the pre-refactor PAYE engine at
 * commit 126588be. These expectations were recorded before pay-basis extraction;
 * they are a parity oracle, not an independent statutory correctness oracle.
 */

import type { TaxCalculationInput } from '@/lib/types/calculator';
import { calculateTax } from '../taxCalculator';

const baseInput: TaxCalculationInput = {
  salary: 30_000,
  payPeriod: 'annually',
  taxYear: '2026-2027',
  taxCode: '1257L',
  isScottish: false,
  isMarried: false,
  partnerGrossWage: 0,
  isBlind: false,
  payNoNI: false,
  pensionContribution: 0,
  pensionContributionType: 'percentage',
  studentLoanPlans: 'none',
  niCategory: 'A',
  hoursPerWeek: 37.5,
};

interface ParityExpectation {
  grossSalaryAnnually: number;
  grossSalaryMonthly: number;
  taxFreeAmount: number;
  taxableIncome: number;
  incomeTaxAnnually: number;
  nationalInsuranceAnnually: number;
  studentLoanAnnually: number;
  pensionContributionAnnually: number;
  employerNI: number;
  netPayAnnually: number;
  netPayMonthly: number;
  incomeBreakdown?: {
    employment: number;
    nonEmployment: number;
    total: number;
  };
}

const parityCases: Array<{
  name: string;
  input: Partial<TaxCalculationInput>;
  expected: ParityExpectation;
}> = [
  {
    name: '2023-24 rUK annual basic-rate',
    input: { salary: 30_000, taxYear: '2023-2024' },
    expected: {
      grossSalaryAnnually: 30_000,
      grossSalaryMonthly: 2_500,
      taxFreeAmount: 12_570,
      taxableIncome: 17_424,
      incomeTaxAnnually: 3_484.7999999999997,
      nationalInsuranceAnnually: 2_003.76,
      studentLoanAnnually: 0,
      pensionContributionAnnually: 0,
      employerNI: 2_884.8,
      netPayAnnually: 24_511.44,
      netPayMonthly: 2_042.62,
    },
  },
  {
    name: '2024-25 rUK monthly',
    input: { salary: 3_750, payPeriod: 'monthly', taxYear: '2024-2025' },
    expected: {
      grossSalaryAnnually: 45_000,
      grossSalaryMonthly: 3_750,
      taxFreeAmount: 12_570,
      taxableIncome: 32_424,
      incomeTaxAnnually: 6_484.799999999999,
      nationalInsuranceAnnually: 2_593.92,
      studentLoanAnnually: 0,
      pensionContributionAnnually: 0,
      employerNI: 4_954.8,
      netPayAnnually: 35_921.28,
      netPayMonthly: 2_993.44,
    },
  },
  {
    name: '2025-26 rUK weekly',
    input: { salary: 1_000, payPeriod: 'weekly', taxYear: '2025-2026' },
    expected: {
      grossSalaryAnnually: 52_000,
      grossSalaryMonthly: 4_333.333333333333,
      taxFreeAmount: 12_570,
      taxableIncome: 39_420,
      incomeTaxAnnually: 8_227.2,
      nationalInsuranceAnnually: 3_050.04,
      studentLoanAnnually: 0,
      pensionContributionAnnually: 0,
      employerNI: 7_049.4,
      netPayAnnually: 40_722.759999999995,
      netPayMonthly: 3_393.563333333333,
    },
  },
  {
    name: '2026-27 rUK hourly',
    input: { salary: 25, payPeriod: 'hourly' },
    expected: {
      grossSalaryAnnually: 48_750,
      grossSalaryMonthly: 4_062.5,
      taxFreeAmount: 12_570,
      taxableIncome: 36_168,
      incomeTaxAnnually: 7_233.599999999999,
      nationalInsuranceAnnually: 2_893.92,
      studentLoanAnnually: 0,
      pensionContributionAnnually: 0,
      employerNI: 6_561.84,
      netPayAnnually: 38_622.479999999996,
      netPayMonthly: 3_218.54,
    },
  },
  {
    name: '2023-24 Scottish annual',
    input: {
      salary: 45_000,
      taxYear: '2023-2024',
      taxCode: 'S1257L',
      isScottish: true,
    },
    expected: {
      grossSalaryAnnually: 45_000,
      grossSalaryMonthly: 3_750,
      taxFreeAmount: 12_570,
      taxableIncome: 32_424,
      incomeTaxAnnually: 6_935.76,
      nationalInsuranceAnnually: 3_728.7599999999998,
      studentLoanAnnually: 0,
      pensionContributionAnnually: 0,
      employerNI: 4_954.8,
      netPayAnnually: 34_335.479999999996,
      netPayMonthly: 2_861.29,
    },
  },
  {
    name: '2024-25 Scottish high income',
    input: {
      salary: 120_000,
      taxYear: '2024-2025',
      taxCode: 'S1257L',
      isScottish: true,
    },
    expected: {
      grossSalaryAnnually: 120_000,
      grossSalaryMonthly: 10_000,
      taxFreeAmount: 2_570,
      taxableIncome: 117_420,
      incomeTaxAnnually: 44_273.520000000004,
      nationalInsuranceAnnually: 4_410,
      studentLoanAnnually: 0,
      pensionContributionAnnually: 0,
      employerNI: 15_304.8,
      netPayAnnually: 71_316.48,
      netPayMonthly: 5_943.04,
    },
  },
  {
    name: '2025-26 Welsh C-code precedence',
    input: {
      salary: 55_000,
      taxYear: '2025-2026',
      taxCode: 'C1257L',
      isScottish: true,
    },
    expected: {
      grossSalaryAnnually: 55_000,
      grossSalaryMonthly: 4_583.333333333333,
      taxFreeAmount: 12_570,
      taxableIncome: 42_420,
      incomeTaxAnnually: 9_427.2,
      nationalInsuranceAnnually: 3_110.04,
      studentLoanAnnually: 0,
      pensionContributionAnnually: 0,
      employerNI: 7_499.4,
      netPayAnnually: 42_462.759999999995,
      netPayMonthly: 3_538.563333333333,
    },
  },
  {
    name: '2026-27 K-code',
    input: { salary: 40_000, taxCode: 'K100' },
    expected: {
      grossSalaryAnnually: 40_000,
      grossSalaryMonthly: 3_333.3333333333335,
      taxFreeAmount: -1_000,
      taxableIncome: 40_992,
      incomeTaxAnnually: 8_856,
      nationalInsuranceAnnually: 2_193.96,
      studentLoanAnnually: 0,
      pensionContributionAnnually: 0,
      employerNI: 5_249.4,
      netPayAnnually: 28_950.04,
      netPayMonthly: 2_412.5033333333336,
    },
  },
  {
    name: '2026-27 high-income taper with fixed pension',
    input: {
      salary: 110_003,
      pensionContribution: 10_000,
      pensionContributionType: 'amount',
    },
    expected: {
      grossSalaryAnnually: 110_003,
      grossSalaryMonthly: 9_166.916666666666,
      taxFreeAmount: 12_569,
      taxableIncome: 87_420,
      incomeTaxAnnually: 27_427.199999999997,
      nationalInsuranceAnnually: 4_010.04,
      studentLoanAnnually: 0,
      pensionContributionAnnually: 10_000,
      employerNI: 15_749.88,
      netPayAnnually: 68_565.75999999998,
      netPayMonthly: 5_713.813333333332,
    },
  },
  {
    name: '2026-27 mixed employment and non-employment income',
    input: {
      salary: 4_000,
      payPeriod: 'monthly',
      pensionContribution: 5,
      pensionContributionType: 'percentage',
      studentLoanPlans: ['plan2'],
      incomeSources: [
        { id: 'job-2', type: 'employment', amount: 200, period: 'weekly' },
        { id: 'rent', type: 'rental', amount: 500, period: 'monthly' },
      ],
    },
    expected: {
      grossSalaryAnnually: 48_000,
      grossSalaryMonthly: 5_366.666666666667,
      taxFreeAmount: 12_570,
      taxableIncome: 49_416,
      incomeTaxAnnually: 12_225.599999999999,
      nationalInsuranceAnnually: 3_129.96,
      studentLoanAnnually: 1_452,
      pensionContributionAnnually: 2_400,
      employerNI: 8_009.4,
      netPayAnnually: 45_192.44,
      netPayMonthly: 3_766.036666666667,
      incomeBreakdown: {
        employment: 58_400,
        nonEmployment: 6_000,
        total: 64_400,
      },
    },
  },
  {
    name: '2026-27 four-weekly fixed pension',
    input: {
      salary: 3_000,
      payPeriod: 'fourWeekly',
      pensionContribution: 100,
      pensionContributionType: 'amount',
    },
    expected: {
      grossSalaryAnnually: 39_000,
      grossSalaryMonthly: 3_250,
      taxFreeAmount: 12_570,
      taxableIncome: 25_116,
      incomeTaxAnnually: 5_023.200000000001,
      nationalInsuranceAnnually: 2_009.88,
      studentLoanAnnually: 0,
      pensionContributionAnnually: 1_300,
      employerNI: 5_099.4,
      netPayAnnually: 30_666.920000000002,
      netPayMonthly: 2_555.576666666667,
    },
  },
  {
    name: '2026-27 fortnightly',
    input: { salary: 1_500, payPeriod: 'fortnightly' },
    expected: {
      grossSalaryAnnually: 39_000,
      grossSalaryMonthly: 3_250,
      taxFreeAmount: 12_570,
      taxableIncome: 26_424,
      incomeTaxAnnually: 5_284.799999999999,
      nationalInsuranceAnnually: 2_113.92,
      studentLoanAnnually: 0,
      pensionContributionAnnually: 0,
      employerNI: 5_099.4,
      netPayAnnually: 31_601.28,
      netPayMonthly: 2_633.44,
    },
  },
];

describe('PAYE shared pay-basis output parity', () => {
  it.each(parityCases)('$name', ({ input, expected }) => {
    const result = calculateTax({ ...baseInput, ...input });

    expect(result.grossSalary.annually).toBe(expected.grossSalaryAnnually);
    expect(result.grossSalary.monthly).toBe(expected.grossSalaryMonthly);
    expect(result.taxFreeAmount).toBe(expected.taxFreeAmount);
    expect(result.taxableIncome).toBe(expected.taxableIncome);
    expect(result.incomeTax.annually).toBe(expected.incomeTaxAnnually);
    expect(result.nationalInsurance.annually).toBe(expected.nationalInsuranceAnnually);
    expect(result.studentLoan.annually).toBe(expected.studentLoanAnnually);
    expect(result.pensionContribution.annually).toBe(expected.pensionContributionAnnually);
    expect(result.employerNI).toBe(expected.employerNI);
    expect(result.netPay.annually).toBe(expected.netPayAnnually);
    expect(result.netPay.monthly).toBe(expected.netPayMonthly);
    expect(result.incomeBreakdown).toEqual(expected.incomeBreakdown);
  });
});
