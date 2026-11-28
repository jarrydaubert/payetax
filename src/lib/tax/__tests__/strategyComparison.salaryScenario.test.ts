/**
 * Strategy Comparison - Salary Scenario Tests
 *
 * Focused tests for Director Intelligence helper logic.
 * Each test names the bug it is meant to catch.
 */

import { describe, expect, it } from '@jest/globals';
import { TAX_RATES } from '@/constants/taxRates';
import { getDividendTax } from '../dividendTax';
import { calculateSalaryScenario, calculateStrategyComparison } from '../strategyComparison';
import { getStudentLoanRepayment } from '../studentLoan';
import { roundToPence } from '../utils';

const TAX_YEAR = '2025-2026' as const;
const TAX_YEAR_2026 = '2026-2027' as const;

const baseInput = {
  region: 'rUK' as const,
  revenue: 100000,
  includesVat: false,
  expenses: 0,
};

describe('Strategy Comparison helpers', () => {
  // HMRC CA44 (2026–27), annual category A, sections 13–15 and 40.
  // https://www.gov.uk/government/publications/ca44-national-insurance-for-company-directors
  // With no Employment Allowance, the company pays 15% above £5,000, rounded to pence.
  // The highest affordable salary plus employer NI uses the entire budget in each case.
  // Both salaries are below the £12,570 primary threshold and personal allowance.
  it.each([
    { revenue: 10_000, salary: 9_347.83, employerNI: 652.17 },
    { revenue: 13_000, salary: 11_956.52, employerNI: 1_043.48 },
  ])(
    'recommends affordable pay at £$revenue with no dividends',
    ({ revenue, salary, employerNI }) => {
      const { strategies, recommended } = calculateStrategyComparison(
        { ...baseInput, revenue },
        TAX_YEAR_2026,
      );

      expect(strategies[recommended]).toMatchObject({
        salary,
        employerNI,
        employeeNI: 0,
        incomeTax: 0,
        corporationTax: 0,
        dividends: 0,
        takeHome: salary,
      });
    },
  );

  it('caps salary to the affordable maximum when target exceeds profit', () => {
    // Bug caught: salary slider allowing take-home beyond profit budget.
    const grossProfit = 20000;
    const targetSalary = 50000;
    const ni = TAX_RATES[TAX_YEAR].nationalInsurance.employer.A.secondary;
    const niRate = ni.rate / 100;
    const maxAffordable =
      grossProfit <= ni.threshold
        ? grossProfit
        : (grossProfit + ni.threshold * niRate) / (1 + niRate);

    const result = calculateSalaryScenario({
      targetSalary,
      grossProfit,
      region: 'rUK',
      taxYear: TAX_YEAR,
      otherIncome: 0,
      hasEmploymentAllowance: false,
    });

    expect(result.salary).toBeLessThanOrEqual(maxAffordable + 0.01);
  });

  it('applies Employment Allowance by reducing employer NI to zero when covered', () => {
    // Bug caught: EA not reducing employer NI, inflating tax cost.
    const grossProfit = 30000;
    const targetSalary = 30000;

    const withoutEA = calculateSalaryScenario({
      targetSalary,
      grossProfit,
      region: 'rUK',
      taxYear: TAX_YEAR,
      otherIncome: 0,
      hasEmploymentAllowance: false,
    });
    const withEA = calculateSalaryScenario({
      targetSalary,
      grossProfit,
      region: 'rUK',
      taxYear: TAX_YEAR,
      otherIncome: 0,
      hasEmploymentAllowance: true,
    });

    expect(withEA.employerNI).toBe(0);
    expect(withEA.takeHome).toBeGreaterThan(withoutEA.takeHome);
  });

  it('reduces corporation tax and increases dividends when losses are brought forward', () => {
    // Bug caught: losses not applied to CT, understating dividends.
    const base = calculateStrategyComparison(baseInput, TAX_YEAR);
    const withLosses = calculateStrategyComparison(
      { ...baseInput, lossesBroughtForward: 20000 },
      TAX_YEAR,
    );

    expect(withLosses.strategies.allDividends.corporationTax).toBeLessThan(
      base.strategies.allDividends.corporationTax,
    );
    expect(withLosses.strategies.allDividends.dividends).toBeGreaterThan(
      base.strategies.allDividends.dividends,
    );
    expect(withLosses.strategies.allDividends.dividends).toBeLessThanOrEqual(
      withLosses.grossProfit,
    );
  });

  it('applies losses brought forward in salary scenario calculations', () => {
    // Bug caught: slider scenario ignoring losses and overstating CT.
    const withoutLosses = calculateSalaryScenario({
      targetSalary: 12570,
      grossProfit: 80000,
      region: 'rUK',
      taxYear: TAX_YEAR,
      otherIncome: 0,
      hasEmploymentAllowance: false,
      lossesBroughtForward: 0,
    });
    const withLosses = calculateSalaryScenario({
      targetSalary: 12570,
      grossProfit: 80000,
      region: 'rUK',
      taxYear: TAX_YEAR,
      otherIncome: 0,
      hasEmploymentAllowance: false,
      lossesBroughtForward: 15000,
    });

    expect(withLosses.corporationTax).toBeLessThan(withoutLosses.corporationTax);
    expect(withLosses.dividends).toBeGreaterThan(withoutLosses.dividends);
  });

  // HMRC CWG2 §3.4.1 and CA44 §§49–52: the unrelated job is a separate payroll.
  // 2026–27 category A, full-year director: £12,570 PT, £50,270 UEL, 8% then 2%.
  // At the UEL: (£50,270 − £12,570) × 8% = £3,016. The next pound adds £0.02.
  // https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027#class-1-national-insurance-thresholds
  it.each([
    [12569, 0],
    [12570, 0],
    [12571, 0.08],
    [50269, 3015.92],
    [50270, 3016],
    [50271, 3016.02],
  ])('uses the same director NI at £%p in every path with a separate PAYE job', (salary, ni) => {
    // Cover employer NI with Employment Allowance and set the salary floor at the
    // post-pension budget so every salary path uses exactly the same gross pay.
    const { strategies } = calculateStrategyComparison(
      {
        ...baseInput,
        revenue: salary + 1000,
        pensionContribution: 1000,
        otherIncome: 30000,
        employmentAllowance: true,
        minimumSalaryRequirement: salary,
        yourSetupSalary: salary,
        yourSetupDividends: 0,
        hasOtherPAYEEmployment: true,
      },
      TAX_YEAR_2026,
    );
    const slider = calculateSalaryScenario({
      targetSalary: salary,
      grossProfit: salary,
      region: 'rUK',
      taxYear: TAX_YEAR_2026,
      otherIncome: 30000,
      hasEmploymentAllowance: true,
      pension: 1000,
      hasOtherPAYE: true,
    });

    expect(strategies.yourSetup).toMatchObject({ salary, employeeNI: ni });
    expect({
      allSalary: strategies.allSalary.employeeNI,
      baselineMix: strategies.optimalMix.employeeNI,
      slider: slider.employeeNI,
      allDividends: strategies.allDividends.employeeNI,
    }).toEqual({
      allSalary: ni,
      baselineMix: ni,
      slider: ni,
      allDividends: 0,
    });
    expect(strategies.allSalary.salary).toBe(salary);
    expect(strategies.optimalMix.salary).toBe(salary);
    expect(slider.salary).toBe(salary);
    expect(strategies.yourSetup?.deltaVsOptimal).toBeCloseTo(0, 2);
  });

  it('keeps strategy rankings and Your Setup delta when the same other income is flagged as PAYE', () => {
    const input = {
      ...baseInput,
      otherIncome: 30000,
      yourSetupSalary: 12570,
      yourSetupDividends: 20000,
    };

    expect(
      calculateStrategyComparison({ ...input, hasOtherPAYEEmployment: true }, TAX_YEAR_2026),
    ).toEqual(
      calculateStrategyComparison({ ...input, hasOtherPAYEEmployment: false }, TAX_YEAR_2026),
    );
  });

  it('treats company car BIK as taxable income that reduces take-home', () => {
    // Bug caught: BIK omitted from income tax, overstating take-home.
    const withoutBIK = calculateStrategyComparison({ ...baseInput, revenue: 60000 }, TAX_YEAR);
    const withBIK = calculateStrategyComparison(
      { ...baseInput, revenue: 60000, companyCarBIK: 10000 },
      TAX_YEAR,
    );

    expect(withBIK.strategies.allSalary.incomeTax).toBeGreaterThan(
      withoutBIK.strategies.allSalary.incomeTax,
    );
    expect(withBIK.strategies.allSalary.takeHome).toBeLessThan(
      withoutBIK.strategies.allSalary.takeHome,
    );
  });

  it('clamps optimal salary when minimum requirement exceeds affordable maximum', () => {
    // Bug caught: minimum salary pushing results beyond profit limits.
    const grossProfit = 20000;
    const ni = TAX_RATES[TAX_YEAR].nationalInsurance.employer.A.secondary;
    const niRate = ni.rate / 100;
    const maxAffordable =
      grossProfit <= ni.threshold
        ? grossProfit
        : (grossProfit + ni.threshold * niRate) / (1 + niRate);

    const result = calculateStrategyComparison(
      {
        region: 'rUK',
        revenue: grossProfit,
        includesVat: false,
        expenses: 0,
        minimumSalaryRequirement: 30000,
      },
      TAX_YEAR,
    );

    expect(result.strategies.optimalMix.salary).toBeLessThanOrEqual(maxAffordable + 0.01);
  });

  it('respects minimum salary floor in salary scenario when affordable', () => {
    // Bug caught: slider scenario letting salary drop below user minimum requirement.
    const result = calculateSalaryScenario({
      targetSalary: 5000,
      grossProfit: 90000,
      region: 'rUK',
      taxYear: TAX_YEAR,
      otherIncome: 0,
      hasEmploymentAllowance: false,
      minimumSalary: 10000,
    });

    expect(result.salary).toBeGreaterThanOrEqual(10000);
  });

  it('keeps baseline optimal mix in parity with salary-scenario math for identical inputs', () => {
    // Regression lock: slider path and baseline strategy path must match exactly.
    const input = {
      region: 'rUK' as const,
      revenue: 120000,
      includesVat: false,
      expenses: 10000,
      lossesBroughtForward: 8000,
      otherIncome: 12000,
      employmentAllowance: true,
      studentLoanPlans: ['plan2'] as const,
      pensionContribution: 4000,
      companyCarBIK: 6000,
      associatedCompaniesCount: 2,
      minimumSalaryRequirement: 10000,
      hasOtherPAYEEmployment: true,
    };

    const comparison = calculateStrategyComparison(input, TAX_YEAR);
    const optimal = comparison.strategies.optimalMix;
    const scenario = calculateSalaryScenario({
      targetSalary: optimal.salary,
      grossProfit: comparison.grossProfitAfterPension,
      region: input.region,
      taxYear: TAX_YEAR,
      otherIncome: input.otherIncome,
      hasEmploymentAllowance: input.employmentAllowance,
      studentLoanPlans: [...input.studentLoanPlans],
      pension: input.pensionContribution,
      companyCarBIK: input.companyCarBIK,
      associatedCompaniesCount: input.associatedCompaniesCount,
      hasOtherPAYE: input.hasOtherPAYEEmployment,
      lossesBroughtForward: input.lossesBroughtForward,
      minimumSalary: input.minimumSalaryRequirement,
    });

    expect(scenario.salary).toBeCloseTo(optimal.salary, 2);
    expect(scenario.dividends).toBeCloseTo(optimal.dividends, 2);
    expect(scenario.employerNI).toBeCloseTo(optimal.employerNI, 2);
    expect(scenario.employeeNI).toBeCloseTo(optimal.employeeNI, 2);
    expect(scenario.incomeTax).toBeCloseTo(optimal.incomeTax, 2);
    expect(scenario.corporationTax).toBeCloseTo(optimal.corporationTax, 2);
    expect(scenario.dividendTax).toBeCloseTo(optimal.dividendTax, 2);
    expect(scenario.studentLoan).toBeCloseTo(optimal.studentLoan, 2);
    expect(scenario.takeHome).toBeCloseTo(optimal.takeHome, 2);
  });

  it('keeps what-if profit scenario in parity with salary-scenario math', () => {
    // Regression lock: what-if comparison path should remain aligned with slider scenario math.
    const input = {
      region: 'rUK' as const,
      revenue: 100000,
      includesVat: false,
      expenses: 20000,
      lossesBroughtForward: 5000,
      otherIncome: 5000,
      employmentAllowance: false,
      studentLoanPlans: ['plan1'] as const,
      pensionContribution: 2500,
      companyCarBIK: 4000,
      associatedCompaniesCount: 3,
      minimumSalaryRequirement: 0,
      hasOtherPAYEEmployment: false,
    };

    const baseline = calculateStrategyComparison(input, TAX_YEAR);
    const scenarioGrossProfitBeforePension = roundToPence(baseline.grossProfit * 1.25);
    const whatIf = calculateStrategyComparison(
      {
        ...input,
        revenue: scenarioGrossProfitBeforePension,
        expenses: 0,
      },
      TAX_YEAR,
    );
    const optimal = whatIf.strategies.optimalMix;

    // Plan 1 (2025/26): (£5,000 salary + £70,175 dividends + £5,000 other income
    // - £26,065 threshold) × 9% = £4,869.90. The other income alone is below
    // the threshold and the Class 1A company car benefit is excluded.
    expect(optimal).toEqual({
      name: 'Baseline Mix',
      salary: 5000,
      dividends: 70175,
      pension: 2500,
      companyCarBIK: 4000,
      employerNI: 600,
      class1ANI: 600,
      employeeNI: 0,
      incomeTax: 286,
      corporationTax: 21725,
      taxableProfit: 86900,
      lossReliefUsed: 5000,
      dividendPersonalAllowanceUsed: 0,
      dividendNilRateUsed: 500,
      dividendsSubjectToTax: 69675,
      dividendTax: 14572.82,
      studentLoan: 4869.9,
      totalPersonalTax: 19728.72,
      retainedProfit: 0,
      companyShortfall: 0,
      takeHome: 55446.28,
    });

    const scenario = calculateSalaryScenario({
      targetSalary: optimal.salary,
      grossProfit: whatIf.grossProfitAfterPension,
      region: input.region,
      taxYear: TAX_YEAR,
      otherIncome: input.otherIncome,
      hasEmploymentAllowance: input.employmentAllowance,
      studentLoanPlans: [...input.studentLoanPlans],
      pension: input.pensionContribution,
      companyCarBIK: input.companyCarBIK,
      associatedCompaniesCount: input.associatedCompaniesCount,
      hasOtherPAYE: input.hasOtherPAYEEmployment,
      lossesBroughtForward: input.lossesBroughtForward,
      minimumSalary: input.minimumSalaryRequirement,
    });

    expect(scenario.salary).toBeCloseTo(optimal.salary, 2);
    expect(scenario.corporationTax).toBeCloseTo(optimal.corporationTax, 2);
    expect(scenario.takeHome).toBeCloseTo(optimal.takeHome, 2);
  });

  it('uses up dividend shielding when other income consumes the personal allowance and tax bands', () => {
    // Bug caught: director dividend path undertaxing dividends because other income is ignored.
    const lowProfitInput = {
      region: 'rUK' as const,
      revenue: 13000,
      includesVat: false,
      expenses: 0,
    };

    const withoutOtherIncome = calculateStrategyComparison(lowProfitInput, TAX_YEAR);
    const withOtherIncome = calculateStrategyComparison(
      { ...lowProfitInput, otherIncome: 40000 },
      TAX_YEAR,
    );

    const lowIncomeDividends = withoutOtherIncome.strategies.allDividends.dividends;
    const highIncomeDividends = withOtherIncome.strategies.allDividends.dividends;

    expect(lowIncomeDividends).toBeCloseTo(highIncomeDividends, 2);
    expect(withoutOtherIncome.strategies.allDividends.dividendTax).toBe(0);
    expect(withOtherIncome.strategies.allDividends.dividendTax).toBeCloseTo(
      getDividendTax(highIncomeDividends, 40000, TAX_YEAR),
      2,
    );
    expect(withOtherIncome.strategies.allDividends.dividendTax).toBeGreaterThan(0);
  });

  it('charges student loan from total director income when dividends alone cross the repayment threshold', () => {
    // Bug caught: director student loan using salary-only income and missing dividend-only repayments.
    const result = calculateStrategyComparison(
      {
        region: 'rUK',
        revenue: 35150,
        includesVat: false,
        expenses: 0,
        studentLoanPlans: ['plan2'],
      },
      TAX_YEAR,
    );

    const dividendsOnlyIncome = result.strategies.allDividends.dividends;
    const expectedStudentLoan = getStudentLoanRepayment(dividendsOnlyIncome, ['plan2'], TAX_YEAR);

    expect(result.strategies.allDividends.salary).toBe(0);
    expect(dividendsOnlyIncome).toBeGreaterThan(TAX_RATES[TAX_YEAR].studentLoan.plan2.threshold);
    expect(result.strategies.allDividends.studentLoan).toBeCloseTo(expectedStudentLoan.total, 2);
    expect(result.strategies.allDividends.studentLoan).toBeGreaterThan(0);
  });

  it('applies PA taper to the fixed £12,570 salary plus dividends strategy above £100k', () => {
    const scenario = calculateSalaryScenario({
      targetSalary: 12570,
      grossProfit: 150000,
      region: 'rUK',
      taxYear: TAX_YEAR_2026,
      otherIncome: 0,
      hasEmploymentAllowance: false,
    });

    expect(scenario.salary).toBe(12570);
    expect(scenario.dividends).toBe(103926.46);
    expect(scenario.incomeTax).toBe(1649.6);
    expect(scenario.dividendTax).toBe(29736.96);
    expect(scenario.takeHome).toBe(85109.9);
  });

  it('corrects the £150k strategy comparison rows after PA taper', () => {
    const result = calculateStrategyComparison(
      {
        region: 'rUK',
        revenue: 150000,
        includesVat: false,
        expenses: 0,
        employmentAllowance: false,
        studentLoanPlans: [],
      },
      TAX_YEAR_2026,
    );

    // Annual rUK, 2026/27. £131,086.96 salary + £18,913.04 secondary NI uses £150,000.
    // With no PA, Income Tax is £45,192.13 and employee NI is £4,632.34.
    // gov.uk/income-tax-rates and gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
    expect(result.strategies.allSalary).toMatchObject({
      salary: 131086.96,
      employerNI: 18913.04,
      takeHome: 81262.49,
    });
    expect(result.strategies.allDividends.takeHome).toBe(84715.02);

    const fixedLowSalary = calculateSalaryScenario({
      targetSalary: 12570,
      grossProfit: 150000,
      region: 'rUK',
      taxYear: TAX_YEAR_2026,
      otherIncome: 0,
      hasEmploymentAllowance: false,
    });

    expect(fixedLowSalary.takeHome).toBe(85109.9);
    expect(fixedLowSalary.takeHome - result.strategies.allSalary.takeHome).toBeCloseTo(3847.41, 2);
  });
});
