import { CURRENT_TAX_YEAR, PERIODS } from '@/constants/taxRates';
import { calculateTax, type TaxCalculationInput } from '@/lib/taxCalculator';

const input: TaxCalculationInput = {
  salary: 4500,
  payPeriod: 'monthly',
  taxYear: '2026-2027',
  taxCode: '1257L',
  isScottish: false,
  isMarried: false,
  partnerGrossWage: 0,
  isBlind: false,
  payNoNI: false,
  pensionContribution: 10,
  pensionContributionType: 'percentage',
  studentLoanPlans: ['plan5'],
  niCategory: 'A',
  hoursPerWeek: 40,
};

describe('PAYE result basis', () => {
  it.each([
    ['', true, 'Scotland', 287.27],
    ['1257L', true, 'Scotland', 287.27],
    ['D0', true, 'rUK', 1000],
    ['BR', true, 'rUK', 500],
    ['NT', true, 'rUK', 0],
    ['C1257L', true, 'Wales', 290.2],
    ['SD0', false, 'Scotland', 525],
  ] as const)(
    'records the applied regime for %s with the Scotland toggle %s',
    (code, isScottish, regime, monthlyTax) => {
      // £30k Scottish and flat-rate controls from the existing independent PAYE fixtures.
      const result = calculateTax({
        ...input,
        salary: 2500,
        pensionContribution: 0,
        taxCode: code,
        isScottish,
      });
      expect(result.calculationBasis.incomeTaxRegime).toBe(regime);
      expect(result.incomeTax.monthly).toBe(monthlyTax);
    },
  );

  it.each([
    ['2024-25', '2024-2025'],
    ['invalid', CURRENT_TAX_YEAR],
  ])('records the selected year for %s', (requested, selected) => {
    const result = calculateTax({ ...input, taxYear: requested as TaxCalculationInput['taxYear'] });
    expect(result.calculationBasis.taxYear).toBe(selected);
  });

  it('exposes the bases and deductions used for net pay, including loans from a second job', () => {
    const result = calculateTax({
      ...input,
      pensionMethod: 'net-pay',
      studentLoanPlans: ['plan2', 'plan5', 'postgrad'],
      allowancesDeductions: 100,
      incomeSources: [
        { id: 'job', type: 'employment', amount: 3000, period: 'monthly' },
        { id: 'rent', type: 'rental', amount: 1000, period: 'monthly' },
      ],
    });

    expect(result.calculationBasis).toMatchObject({
      taxYear: '2026-2027',
      incomeTaxPeriod: 'month-1',
      nationalInsurancePeriod: 'monthly',
      studentLoanBasis: 'per-employment',
      pay: {
        pensionMethod: 'net-pay',
        pensionDeduction: { monthly: 450 },
        primaryEmploymentGross: { monthly: 4500 },
        totalEmploymentGross: { monthly: 7500 },
        totalGrossIncome: { monthly: 8500 },
        adjustedNetIncome: { annual: 96_600 },
        payeAdjustedPayment: { monthly: 8050 },
        niableEmploymentEarnings: { monthly: 7500 },
        studentLoanEmploymentEarnings: { monthly: 4500 },
      },
    });
    // Monthly Plan 5: £217 + £82. Postgraduate: £165 + £75. No deduction on rent.
    expect(result.studentLoanDeductions).toEqual({ plan5: 3588, postgrad: 2880 });
    expect(result.studentLoan.annually).toBe(6468);
    expect(result.nonTaxableAllowances).toMatchObject({ annually: 99.96, monthly: 8.33 });
    expect(result.taxCodeBasis).toMatchObject({ kind: 'supplied-code', appliedCode: '1257L' });
    expect(Object.keys(result.nonTaxableAllowances)).toEqual(Object.values(PERIODS));
    for (const [period, gross] of [
      ['annually', 102_000],
      ['monthly', 8500],
    ] as const) {
      const cash =
        gross -
        result.incomeTax[period] -
        result.nationalInsurance[period] -
        result.studentLoan[period] -
        result.pensionContribution[period] +
        result.nonTaxableAllowances[period];
      expect(result.netPay[period]).toBeCloseTo(cash, 2);
    }
  });

  it('distinguishes an applicable loan below threshold from an unselected loan', () => {
    expect(calculateTax({ ...input, salary: 2000 }).studentLoanDeductions).toEqual({ plan5: 0 });
    expect(calculateTax({ ...input, studentLoanPlans: 'none' }).studentLoanDeductions).toEqual({});
  });
});
