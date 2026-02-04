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

    const result = calculateSalaryScenario(targetSalary, grossProfit, 'rUK', TAX_YEAR, 0, false);

    expect(result.salary).toBeLessThanOrEqual(maxAffordable + 0.01);
  });

  it('applies Employment Allowance by reducing employer NI to zero when covered', () => {
    // Bug caught: EA not reducing employer NI, inflating tax cost.
    const grossProfit = 30000;
    const targetSalary = 30000;

    const withoutEA = calculateSalaryScenario(targetSalary, grossProfit, 'rUK', TAX_YEAR, 0, false);
    const withEA = calculateSalaryScenario(targetSalary, grossProfit, 'rUK', TAX_YEAR, 0, true);

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
});
