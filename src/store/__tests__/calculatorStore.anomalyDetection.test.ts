import { describe, expect, it } from '@jest/globals';

import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { collectCalculationAnomalies } from '../calculatorStore';

const createPeriodValue = (value: number) => ({
  annually: value,
  monthly: value / 12,
  fourWeekly: value / 13,
  fortnightly: value / 26,
  weekly: value / 52,
  daily: value / 260,
  hourly: value / (52 * 40),
});

const createResult = (overrides: Partial<TaxCalculationResults> = {}): TaxCalculationResults => ({
  grossSalary: createPeriodValue(50000),
  taxFreeAmount: 12570,
  taxableIncome: 37430,
  incomeTax: createPeriodValue(7486),
  nationalInsurance: createPeriodValue(2994.4),
  studentLoan: createPeriodValue(0),
  pensionContribution: createPeriodValue(0),
  employerNI: 5700,
  netPay: createPeriodValue(39519.6),
  taxBands: [{ name: 'Basic Rate', rate: 20, amount: 37430 }],
  incomeBreakdown: {
    employment: 50000,
    nonEmployment: 0,
    total: 50000,
  },
  ...overrides,
});

describe('collectCalculationAnomalies', () => {
  it('returns no anomalies for valid output', () => {
    const anomalies = collectCalculationAnomalies(createResult());
    expect(anomalies).toEqual([]);
  });

  it('detects non-finite and negative component values', () => {
    const anomalousIncomeTax = createPeriodValue(7486);
    anomalousIncomeTax.annually = Number.NaN;

    const anomalies = collectCalculationAnomalies(
      createResult({
        incomeTax: anomalousIncomeTax,
        studentLoan: createPeriodValue(-10),
      }),
    );

    expect(anomalies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'non_finite_value',
          detail: 'incomeTax.annually',
        }),
        expect.objectContaining({
          code: 'negative_component',
          detail: 'studentLoan.annually',
          value: -10,
        }),
      ]),
    );
  });

  it('detects invalid annual effective rate bounds', () => {
    const anomalies = collectCalculationAnomalies(
      createResult({
        netPay: createPeriodValue(-500),
      }),
    );

    expect(anomalies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'invalid_effective_rate',
          detail: 'annual_effective_rate',
        }),
        expect.objectContaining({
          code: 'negative_net_pay',
          detail: 'netPay.annually',
          value: -500,
        }),
      ]),
    );
  });

  it('does not flag fully salary-capped pension output as anomalous', () => {
    const anomalies = collectCalculationAnomalies(
      createResult({
        grossSalary: createPeriodValue(10000),
        taxableIncome: 0,
        incomeTax: createPeriodValue(0),
        nationalInsurance: createPeriodValue(0),
        studentLoan: createPeriodValue(0),
        pensionContribution: createPeriodValue(10000),
        employerNI: 0,
        netPay: createPeriodValue(0),
        taxBands: [],
        incomeBreakdown: {
          employment: 10000,
          nonEmployment: 0,
          total: 10000,
        },
      }),
    );

    expect(anomalies).toEqual([]);
  });

  it('allows net pay above gross when non-taxable allowances exceed deductions', () => {
    const anomalies = collectCalculationAnomalies(
      createResult({
        grossSalary: createPeriodValue(10000),
        taxableIncome: 0,
        incomeTax: createPeriodValue(0),
        nationalInsurance: createPeriodValue(0),
        studentLoan: createPeriodValue(0),
        pensionContribution: createPeriodValue(0),
        employerNI: 0,
        netPay: createPeriodValue(15000),
        taxBands: [],
        incomeBreakdown: {
          employment: 10000,
          nonEmployment: 0,
          total: 10000,
        },
      }),
    );

    expect(anomalies).toEqual([]);
  });
});
