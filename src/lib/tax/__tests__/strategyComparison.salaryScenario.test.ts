/**
 * Strategy Comparison - Salary Scenario Tests
 *
 * Focused tests for Director Guide helper logic.
 * Each test names the bug it is meant to catch.
 */

import { describe, expect, it } from '@jest/globals';
import { TAX_RATES } from '@/constants/taxRates';
import { calculateSalaryScenario, calculateStrategyComparison } from '../strategyComparison';

const TAX_YEAR = '2025-2026' as const;

const baseInput = {
  region: 'rUK' as const,
  revenue: 100000,
  includesVat: false,
  expenses: 0,
};

describe('Strategy Comparison helpers', () => {
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

  it('applies no-threshold employee NI when hasOtherPAYE is true', () => {
    // Bug caught: slider scenario undercharging employee NI for dual-PAYE directors.
    const withoutOtherPAYE = calculateSalaryScenario({
      targetSalary: 20000,
      grossProfit: 80000,
      region: 'rUK',
      taxYear: TAX_YEAR,
      otherIncome: 0,
      hasEmploymentAllowance: false,
      hasOtherPAYE: false,
    });
    const withOtherPAYE = calculateSalaryScenario({
      targetSalary: 20000,
      grossProfit: 80000,
      region: 'rUK',
      taxYear: TAX_YEAR,
      otherIncome: 0,
      hasEmploymentAllowance: false,
      hasOtherPAYE: true,
    });

    expect(withOtherPAYE.employeeNI).toBeGreaterThan(withoutOtherPAYE.employeeNI);
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
    const scenarioGrossProfitBeforePension = baseline.grossProfit * 1.25;
    const whatIf = calculateStrategyComparison(
      {
        ...input,
        revenue: scenarioGrossProfitBeforePension,
        expenses: 0,
      },
      TAX_YEAR,
    );
    const optimal = whatIf.strategies.optimalMix;
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
});
