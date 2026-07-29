import type { TaxCalculationInput } from '@/lib/types/calculator';
import { derivePayePayBasis } from '../payePayBasis';

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

describe('derivePayePayBasis', () => {
  it.each([
    ['annual', 52_000, 'annually', 52_000],
    ['monthly', 4_000, 'monthly', 48_000],
    ['four-weekly', 3_000, 'fourWeekly', 39_000],
    ['fortnightly', 1_500, 'fortnightly', 39_000],
    ['weekly', 1_000, 'weekly', 52_000],
    ['hourly', 25, 'hourly', 48_750],
  ] as const)('normalizes %s primary employment pay to one annual and monthly basis', (_label, salary, payPeriod, expectedAnnual) => {
    const basis = derivePayePayBasis({ ...baseInput, salary, payPeriod });

    expect(basis.primaryEmploymentGross).toEqual({
      annual: expectedAnnual,
      monthly: expectedAnnual / 12,
    });
  });

  it('derives percentage and fixed salary-sacrifice pension deductions from primary employment', () => {
    const percentage = derivePayePayBasis({
      ...baseInput,
      salary: 4_000,
      payPeriod: 'monthly',
      pensionContribution: 5,
      pensionContributionType: 'percentage',
    });
    const fixed = derivePayePayBasis({
      ...baseInput,
      salary: 4_000,
      payPeriod: 'monthly',
      pensionContribution: 100,
      pensionContributionType: 'amount',
    });

    expect(percentage.salarySacrificePensionDeduction).toEqual({
      annual: 2_400,
      monthly: 200,
    });
    expect(fixed.salarySacrificePensionDeduction).toEqual({
      annual: 1_200,
      monthly: 100,
    });
  });

  it('adds secondary employment to employment-only bases', () => {
    const basis = derivePayePayBasis({
      ...baseInput,
      incomeSources: [{ id: 'job-2', type: 'employment', amount: 500, period: 'monthly' }],
    });

    expect(basis.totalEmploymentGross.annual).toBe(36_000);
    expect(basis.nonEmploymentTaxableIncome.annual).toBe(0);
    expect(basis.totalGrossIncome.annual).toBe(36_000);
    expect(basis.niableEmploymentEarnings.annual).toBe(36_000);
    expect(basis.studentLoanEmploymentEarnings.annual).toBe(30_000);
  });

  it('adds non-employment income to PAYE totals without adding it to NI or Student Loan bases', () => {
    const basis = derivePayePayBasis({
      ...baseInput,
      incomeSources: [{ id: 'rent', type: 'rental', amount: 100, period: 'weekly' }],
    });

    expect(basis.totalEmploymentGross.annual).toBe(30_000);
    expect(basis.nonEmploymentTaxableIncome.annual).toBe(5_200);
    expect(basis.totalGrossIncome.annual).toBe(35_200);
    expect(basis.payeAdjustedPayment.annual).toBe(35_200);
    expect(basis.niableEmploymentEarnings.annual).toBe(30_000);
    expect(basis.studentLoanEmploymentEarnings.annual).toBe(30_000);
  });

  it('keeps PAYE on total taxable income and Student Loan on post-sacrifice primary employment only', () => {
    const basis = derivePayePayBasis({
      ...baseInput,
      salary: 4_000,
      payPeriod: 'monthly',
      pensionContribution: 5,
      pensionContributionType: 'percentage',
      incomeSources: [
        { id: 'job-2', type: 'employment', amount: 200, period: 'weekly' },
        { id: 'rent', type: 'rental', amount: 500, period: 'monthly' },
      ],
    });

    expect(basis.primaryEmploymentGross.annual).toBe(48_000);
    expect(basis.totalEmploymentGross.annual).toBe(58_400);
    expect(basis.nonEmploymentTaxableIncome.annual).toBe(6_000);
    expect(basis.totalGrossIncome.annual).toBe(64_400);
    expect(basis.salarySacrificePensionDeduction.annual).toBe(2_400);
    expect(basis.adjustedNetIncome.annual).toBe(62_000);
    expect(basis.payeAdjustedPayment.annual).toBe(62_000);
    expect(basis.niableEmploymentEarnings.annual).toBe(56_000);
    expect(basis.studentLoanEmploymentEarnings.annual).toBe(45_600);
  });

  it('applies salary-sacrifice reductions to PAYE, employee NI and Student Loan bases', () => {
    const withoutPension = derivePayePayBasis({
      ...baseInput,
      salary: 50_000,
      incomeSources: [
        { id: 'job-2', type: 'employment', amount: 5_000, period: 'annually' },
        { id: 'rent', type: 'rental', amount: 4_000, period: 'annually' },
      ],
    });
    const withPension = derivePayePayBasis({
      ...baseInput,
      salary: 50_000,
      pensionContribution: 10,
      pensionContributionType: 'percentage',
      incomeSources: [
        { id: 'job-2', type: 'employment', amount: 5_000, period: 'annually' },
        { id: 'rent', type: 'rental', amount: 4_000, period: 'annually' },
      ],
    });

    expect(withoutPension.payeAdjustedPayment.annual - withPension.payeAdjustedPayment.annual).toBe(
      5_000,
    );
    expect(
      withoutPension.niableEmploymentEarnings.annual - withPension.niableEmploymentEarnings.annual,
    ).toBe(5_000);
    expect(
      withoutPension.studentLoanEmploymentEarnings.annual -
        withPension.studentLoanEmploymentEarnings.annual,
    ).toBe(5_000);
  });

  it.each([
    ['zero percentage', 0, 'percentage', 0],
    ['negative fixed amount', -100, 'amount', 0],
    ['non-finite percentage', Number.NaN, 'percentage', 0],
    ['existing over-boundary percentage behaviour', 150, 'percentage', 45_000],
  ] as const)('preserves %s pension handling', (_label, pensionContribution, pensionContributionType, expectedAnnual) => {
    const basis = derivePayePayBasis({
      ...baseInput,
      pensionContribution,
      pensionContributionType,
    });

    expect(basis.salarySacrificePensionDeduction.annual).toBe(expectedAnnual);
    expect(basis.adjustedNetIncome.annual).toBe(Math.max(0, 30_000 - expectedAnnual));
  });

  it('caps a fixed pension deduction at primary employment gross', () => {
    const basis = derivePayePayBasis({
      ...baseInput,
      salary: 10_000,
      pensionContribution: 20_000,
      pensionContributionType: 'amount',
    });

    expect(basis.salarySacrificePensionDeduction).toEqual({
      annual: 10_000,
      monthly: 10_000 / 12,
    });
  });

  it('reconciles annual and payroll-month equivalents and returns an immutable contract', () => {
    const basis = derivePayePayBasis({
      ...baseInput,
      salary: 1_234.56,
      payPeriod: 'weekly',
      pensionContribution: 7.5,
      pensionContributionType: 'percentage',
      incomeSources: [
        { id: 'job-2', type: 'employment', amount: 321.09, period: 'monthly' },
        { id: 'rent', type: 'rental', amount: 87.65, period: 'weekly' },
      ],
    });

    expect(Object.isFrozen(basis)).toBe(true);

    for (const value of [
      basis.primaryEmploymentGross,
      basis.totalEmploymentGross,
      basis.nonEmploymentTaxableIncome,
      basis.totalGrossIncome,
      basis.salarySacrificePensionDeduction,
      basis.adjustedNetIncome,
      basis.payeAdjustedPayment,
      basis.niableEmploymentEarnings,
      basis.studentLoanEmploymentEarnings,
    ]) {
      expect(Object.isFrozen(value)).toBe(true);
      expect(value.monthly * 12).toBeCloseTo(value.annual, 10);
    }
  });
});
