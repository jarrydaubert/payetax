import { describe, expect, it } from '@jest/globals';
import { calculateSalaryScenario, calculateStrategyComparison } from '../strategyComparison';

const taxYear = '2026-2027' as const;
const region = 'rUK' as const;
const business = {
  region,
  revenue: 40000,
  expenses: 0,
  includesVat: false,
  employmentAllowance: true,
};
const slider = { region, taxYear, grossProfit: 40000, hasEmploymentAllowance: true };

describe('Director student loan attribution', () => {
  // Annual 2026/27 estimates, rounded to pence per loan before subtracting the baseline.
  // https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027#student-loan-and-postgraduate-loan-recovery
  // https://www.gov.uk/hmrc-internal-manuals/collection-of-student-loans-manual/cslm19010
  // https://www.gov.uk/corporation-tax-rates
  // Employment Allowance covers employer NI. At 19% CT the £40,000 pool yields £32,400
  // in dividends, or £12,570 in salary and £22,218.30 in dividends (£34,788.30 combined).
  // With no other income, charge 9% above £26,900 / £29,385 / £33,795, or 6% above
  // £21,000. At £40,000 other employment income, each threshold is already covered,
  // so 9% or 6% applies to all extraction from this company.
  it.each([
    { plan: 'plan1', otherIncome: 0, salary: 1179, dividends: 495, mixed: 709.95 },
    { plan: 'plan2', otherIncome: 0, salary: 955.35, dividends: 271.35, mixed: 486.3 },
    { plan: 'plan4', otherIncome: 0, salary: 558.45, dividends: 0, mixed: 89.4 },
    { plan: 'postgrad', otherIncome: 0, salary: 1140, dividends: 684, mixed: 827.3 },
    { plan: 'plan1', otherIncome: 40000, salary: 3600, dividends: 2916, mixed: 3130.95 },
    { plan: 'plan2', otherIncome: 40000, salary: 3600, dividends: 2916, mixed: 3130.95 },
    { plan: 'plan4', otherIncome: 40000, salary: 3600, dividends: 2916, mixed: 3130.95 },
    { plan: 'postgrad', otherIncome: 40000, salary: 2400, dividends: 1944, mixed: 2087.3 },
  ] as const)('attributes $plan with £$otherIncome of other employment income', (fixture) => {
    const { otherIncome, plan } = fixture;
    const studentLoanPlans = [plan];
    const { strategies } = calculateStrategyComparison(
      {
        ...business,
        otherIncome,
        studentLoanPlans,
        yourSetupSalary: 12570,
        yourSetupDividends: 22218.3,
      },
      taxYear,
    );

    expect(strategies.allSalary).toMatchObject({ salary: 40000, studentLoan: fixture.salary });
    expect(strategies.allDividends).toMatchObject({
      dividends: 32400,
      studentLoan: fixture.dividends,
    });
    expect(strategies.yourSetup).toMatchObject({ studentLoan: fixture.mixed });
    expect(
      calculateSalaryScenario({ ...slider, targetSalary: 12570, otherIncome, studentLoanPlans }),
    ).toMatchObject({ salary: 12570, dividends: 22218.3, studentLoan: fixture.mixed });
  });

  it('deducts only the extra Plan 2 liability from take-home in the reported slider case', () => {
    const scenario = calculateSalaryScenario({
      ...slider,
      targetSalary: 12570,
      grossProfit: 60000,
      otherIncome: 40000,
      hasEmploymentAllowance: false,
      studentLoanPlans: ['plan2'],
    });

    // Employer NI: (£12,570 - £5,000) × 15% = £1,135.50. The £46,294.50 balance
    // yields £37,498.54 after £8,795.96 CT. Plan 2 is £5,461.52 on £90,068.54
    // less £955.35 on £40,000. Income Tax is £2,974 and dividend tax £13,226.98.
    expect(scenario).toMatchObject({
      dividends: 37498.54,
      studentLoan: 4506.17,
      totalPersonalTax: 20707.15,
      takeHome: 29361.39,
    });
  });

  it('applies both loan rates in Baseline Mix and at the same slider salary', () => {
    const studentLoanPlans = ['plan2', 'postgrad'] as const;
    const otherIncome = 40000;
    const { strategies } = calculateStrategyComparison(
      {
        ...business,
        revenue: 60000,
        minimumSalaryRequirement: 50270,
        otherIncome,
        studentLoanPlans,
      },
      taxYear,
    );
    // The floor at the UEL leaves one mix candidate. £9,730 after payroll yields
    // £7,881.30 of dividends. Both thresholds are covered by the other income:
    // £58,151.30 × 9% = £5,233.62 and × 6% = £3,489.08.
    const expected = { salary: 50270, dividends: 7881.3, studentLoan: 8722.7 };
    expect(strategies.optimalMix).toMatchObject(expected);
    expect(
      calculateSalaryScenario({
        ...slider,
        grossProfit: 60000,
        targetSalary: 50270,
        otherIncome,
        studentLoanPlans,
      }),
    ).toMatchObject(expected);
  });

  it.each([
    { dividends: 0, studentLoan: 0 },
    { dividends: 1999.99, studentLoan: 0 },
    { dividends: 2000, studentLoan: 0 },
    { dividends: 2000.01, studentLoan: 300 },
  ])('applies the annual unearned-income rule to £$dividends of dividends', (fixture) => {
    const { strategies } = calculateStrategyComparison(
      {
        ...business,
        otherIncome: 40000,
        studentLoanPlans: ['plan2', 'postgrad'],
        yourSetupDividends: fixture.dividends,
      },
      taxYear,
    );
    // At £2,000 or less, dividends are ignored. Above £2,000 the full amount is
    // included, giving £180 and £120 respectively after rounding to pence.
    expect(strategies.yourSetup).toMatchObject(fixture);
  });

  it.each([
    { otherIncome: 28000, studentLoan: 175.35 },
    { otherIncome: 29385, studentLoan: 300 },
  ])('applies the unused annual threshold with £$otherIncome of other employment', (fixture) => {
    const { strategies } = calculateStrategyComparison(
      {
        ...business,
        otherIncome: fixture.otherIncome,
        studentLoanPlans: ['plan2', 'postgrad'],
        yourSetupSalary: 2000,
      },
      taxYear,
    );
    // £2,000 salary adds £120 postgraduate liability in both cases. Plan 2 charges
    // 9% on £615 with £28,000 of other income and on £2,000 at the threshold.
    expect(strategies.yourSetup?.studentLoan).toBe(fixture.studentLoan);
  });

  it('uses the remaining Plan 2 threshold when dividends cross the unearned-income cutoff', () => {
    const { strategies } = calculateStrategyComparison(
      {
        ...business,
        otherIncome: 29384,
        studentLoanPlans: ['plan2', 'postgrad'],
        yourSetupDividends: 2000.01,
      },
      taxYear,
    );
    // All £2,000.01 counts. The first £1 uses the remaining Plan 2 threshold,
    // giving £179.91, while the postgraduate loan adds £120.00.
    expect(strategies.yourSetup?.studentLoan).toBe(299.91);
  });

  it('excludes the Class 1A company car benefit from the loan calculation', () => {
    // https://www.gov.uk/hmrc-internal-manuals/collection-of-student-loans-manual/cslm19020
    const { strategies } = calculateStrategyComparison(
      {
        ...business,
        companyCarBIK: 1000,
        studentLoanPlans: ['plan2'],
        yourSetupSalary: 30000,
      },
      taxYear,
    );
    // Plan 2 charges 9% on £615. The benefit still counts for Income Tax:
    // (£31,000 - £12,570) × 20% = £3,686.
    expect(strategies.yourSetup).toMatchObject({ studentLoan: 55.35, incomeTax: 3686 });
  });
});
