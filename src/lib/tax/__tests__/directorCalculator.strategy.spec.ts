import { describe, expect, it } from '@jest/globals';
import { calculateCorporationTax } from '../corporationTax';
import { calculateEmployeeNI } from '../employeeNI';
import { calculateIncomeTax } from '../incomeTax';
import { calculateStrategyComparison } from '../strategyComparison';
import { getStudentLoanRepayment } from '../studentLoan';

const TAX_YEAR = '2025-2026' as const;

describe('Strategy Optimization', () => {
  describe('Strategy Comparison', () => {
    // Helper to create a standard input with given profit
    const createInput = (profit: number, overrides = {}) => ({
      region: 'rUK' as const,
      revenue: profit,
      includesVat: false,
      expenses: 0,
      ...overrides,
    });

    it('should calculate All Salary strategy correctly', () => {
      const input = createInput(100000);
      const result = calculateStrategyComparison(input, TAX_YEAR);
      // All Salary: profit taken as salary (minus employer NI)
      // Should have high income tax + employee NI, but low/zero CT
      expect(result.strategies.allSalary.name).toBe('All Salary');
      expect(result.strategies.allSalary.salary).toBeGreaterThan(0);
      expect(result.strategies.allSalary.dividends).toBe(0);
      expect(result.strategies.allSalary.corporationTax).toBe(0); // No profit left for CT
    });

    it('should calculate All Dividends strategy correctly', () => {
      const input = createInput(100000);
      const result = calculateStrategyComparison(input, TAX_YEAR);
      // All Dividends: £0 salary, all as dividends after CT
      // Lower personal tax but higher CT
      expect(result.strategies.allDividends.name).toBe('All Dividends');
      expect(result.strategies.allDividends.salary).toBe(0);
      expect(result.strategies.allDividends.dividends).toBeGreaterThan(0);
      expect(result.strategies.allDividends.corporationTax).toBeGreaterThan(0);
    });

    it('should find optimal salary/dividend split', () => {
      const input = createInput(100000);
      const result = calculateStrategyComparison(input, TAX_YEAR);
      // Optimal mix should have better take-home than all salary
      expect(result.strategies.optimalMix.takeHome).toBeGreaterThanOrEqual(
        result.strategies.allSalary.takeHome,
      );
      // Optimal usually uses salary around PA (£12,570) or LEL (£6,500)
      expect(result.strategies.optimalMix.salary).toBeLessThanOrEqual(12570);
    });

    it('should label optimal as "Baseline Mix" (not advisory language)', () => {
      const input = createInput(100000);
      const result = calculateStrategyComparison(input, TAX_YEAR);
      // Check it's not using "Recommended" or "You should" language
      expect(result.strategies.optimalMix.name).toBe('Baseline Mix');
      expect(result.strategies.optimalMix.name).not.toContain('Recommend');
    });

    it('should calculate Your Setup strategy with user inputs', () => {
      const input = createInput(100000, {
        yourSetupSalary: 30000,
        yourSetupDividends: 50000,
      });
      const result = calculateStrategyComparison(input, TAX_YEAR);
      expect(result.strategies.yourSetup).toBeDefined();
      expect(result.strategies.yourSetup?.salary).toBe(30000);
      expect(result.strategies.yourSetup?.dividends).toBe(50000);
    });

    it('should show delta between Your Setup and optimal', () => {
      const input = createInput(100000, {
        yourSetupSalary: 50000, // Suboptimal high salary
        yourSetupDividends: 30000,
      });
      const result = calculateStrategyComparison(input, TAX_YEAR);
      // deltaVsOptimal: positive means paying MORE tax than optimal
      expect(result.strategies.yourSetup?.deltaVsOptimal).toBeGreaterThan(0);
    });

    it('should treat VAT status as warning-only (includesVat does not change results)', () => {
      const base = createInput(100000);
      const withVatFlag = { ...base, includesVat: true };
      const withoutVatFlag = { ...base, includesVat: false };

      const a = calculateStrategyComparison(withVatFlag, TAX_YEAR);
      const b = calculateStrategyComparison(withoutVatFlag, TAX_YEAR);

      // If this ever regresses, it will silently change profit and all downstream strategy outputs.
      expect(a.grossProfit).toBe(b.grossProfit);
      expect(a.strategies.optimalMix.takeHome).toBe(b.strategies.optimalMix.takeHome);
      expect(a.recommended).toBe(b.recommended);
    });
  });
});

// =============================================================================
// PILLAR 2: WARNING TRIGGERS
// =============================================================================

describe('Outputs', () => {
  describe('Strategy Cards', () => {
    const createInput = (profit: number, overrides = {}) => ({
      region: 'rUK' as const,
      revenue: profit,
      includesVat: false,
      expenses: 0,
      ...overrides,
    });

    it('should output 3 strategies + Your Setup when compare inputs provided', () => {
      const input = createInput(100000, {
        yourSetupSalary: 30000,
        yourSetupDividends: 40000,
      });
      const result = calculateStrategyComparison(input, TAX_YEAR);
      expect(result.strategies.allSalary).toBeDefined();
      expect(result.strategies.optimalMix).toBeDefined();
      expect(result.strategies.allDividends).toBeDefined();
      expect(result.strategies.yourSetup).toBeDefined();
      expect(result.strategies.allSalary.name).toBe('All Salary');
      expect(result.strategies.optimalMix.name).toBe('Baseline Mix');
      expect(result.strategies.allDividends.name).toBe('All Dividends');
      expect(result.strategies.yourSetup?.name).toBe('Your Setup');
    });

    it('should show salary, dividends, total tax, effective rate, net take-home on each card', () => {
      const input = createInput(100000);
      const result = calculateStrategyComparison(input, TAX_YEAR);
      const card = result.strategies.optimalMix;
      expect(card).toHaveProperty('salary');
      expect(card).toHaveProperty('dividends');
      expect(card).toHaveProperty('totalPersonalTax');
      expect(card).toHaveProperty('effectiveRate');
      expect(card).toHaveProperty('takeHome');
    });

    it('should identify recommended strategy based on highest take-home', () => {
      const input = createInput(100000);
      const result = calculateStrategyComparison(input, TAX_YEAR);
      // The recommended strategy should have the highest take-home
      const strategies = [
        { key: 'allSalary', takeHome: result.strategies.allSalary.takeHome },
        { key: 'optimalMix', takeHome: result.strategies.optimalMix.takeHome },
        { key: 'allDividends', takeHome: result.strategies.allDividends.takeHome },
      ];
      const best = strategies.reduce((a, b) => (a.takeHome > b.takeHome ? a : b));
      expect(result.recommended).toBe(best.key);
    });

    it('should calculate Your Setup delta vs optimal', () => {
      const input = createInput(100000, {
        yourSetupSalary: 50000, // Suboptimal high salary
        yourSetupDividends: 30000,
      });
      const result = calculateStrategyComparison(input, TAX_YEAR);
      expect(result.strategies.yourSetup?.deltaVsOptimal).toBeDefined();
      // deltaVsOptimal = optimalTakeHome - yourSetupTakeHome
      // Positive means Your Setup gets less take-home than optimal
      expect(result.strategies.yourSetup?.deltaVsOptimal).toBeGreaterThan(0);
    });

    it('should flag exceedsProfit when Your Setup inputs exceed available profit', () => {
      const input = createInput(50000, {
        yourSetupSalary: 30000,
        yourSetupDividends: 40000, // Total ~75k cost > 50k profit
      });
      const result = calculateStrategyComparison(input, TAX_YEAR);
      expect(result.strategies.yourSetup?.exceedsProfit).toBe(true);
    });
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('Edge Cases', () => {
  it('should handle zero profit gracefully', () => {
    const input = {
      region: 'rUK' as const,
      revenue: 0,
      includesVat: false,
      expenses: 0,
    };
    // Should not crash, returns valid result
    const result = calculateStrategyComparison(input, TAX_YEAR);
    expect(result.strategies.allSalary).toBeDefined();
    expect(result.strategies.optimalMix).toBeDefined();
    expect(result.strategies.allDividends).toBeDefined();
    expect(result.strategies.optimalMix.takeHome).toBe(0);
  });

  it('should handle very high profits (£500k+)', () => {
    const input = {
      region: 'rUK' as const,
      revenue: 500000,
      includesVat: false,
      expenses: 0,
    };
    const result = calculateStrategyComparison(input, TAX_YEAR);
    expect(result.strategies.optimalMix).toBeDefined();
    expect(result.strategies.optimalMix.takeHome).toBeGreaterThan(0);
    expect(result.strategies.optimalMix.takeHome).toBeLessThan(500000);
  });

  it('should handle profit exactly at CT threshold boundaries', () => {
    // £50,000 - small profits rate boundary
    const ct50k = calculateCorporationTax(50000);
    expect(ct50k.corporationTax).toBe(9500); // 19% rate
    expect(ct50k.rateBand).toBe('small_profits');

    // £250,000 - main rate boundary
    const ct250k = calculateCorporationTax(250000);
    expect(ct250k.corporationTax).toBe(62500); // 25% rate
    expect(ct250k.rateBand).toBe('main');
  });

  it('should handle salary exactly at NI thresholds', () => {
    // PT £12,570 - zero NI
    const niAtPT = calculateEmployeeNI(12570, TAX_YEAR);
    expect(niAtPT.employeeNI).toBe(0);

    // UEL £50,270 - max primary rate NI
    const niAtUEL = calculateEmployeeNI(50270, TAX_YEAR);
    expect(niAtUEL.employeeNI).toBeCloseTo(3016, 2); // (50270-12570)*0.08
  });

  it('should handle income exactly at PA taper boundaries', () => {
    // £100,000 - taper starts (PA still full)
    const taxAt100k = calculateIncomeTax(100000, 'rUK', TAX_YEAR);
    expect(taxAt100k.personalAllowance).toBe(12570);

    // £125,140 - PA fully tapered
    const taxAt125k = calculateIncomeTax(125140, 'rUK', TAX_YEAR);
    expect(taxAt125k.personalAllowance).toBe(0);
  });

  it('should handle other income pushing total into higher bands', () => {
    const input = {
      region: 'rUK' as const,
      revenue: 30000,
      includesVat: false,
      expenses: 0,
      otherIncome: 80000, // Total £110k - in PA taper zone
    };
    const result = calculateStrategyComparison(input, TAX_YEAR);
    // Other income is considered in the calculation
    expect(result.strategies.optimalMix).toBeDefined();
  });

  it('should handle BIK adding to total income for tax purposes', () => {
    const input = {
      region: 'rUK' as const,
      revenue: 100000,
      includesVat: false,
      expenses: 0,
      companyCarBIK: 10000,
    };
    const result = calculateStrategyComparison(input, TAX_YEAR);
    // BIK affects tax calculations
    expect(result.strategies.optimalMix).toBeDefined();
    expect(result.strategies.optimalMix.takeHome).toBeLessThan(100000);
  });

  it('should handle Scotland region with high income correctly', () => {
    const input = {
      region: 'scotland' as const,
      revenue: 150000,
      includesVat: false,
      expenses: 0,
    };
    const result = calculateStrategyComparison(input, TAX_YEAR);
    expect(result.strategies.optimalMix).toBeDefined();
    expect(result.strategies.optimalMix.takeHome).toBeGreaterThan(0);
  });

  it('should handle multiple student loan plans stacking', () => {
    // Test via getStudentLoanRepayment
    const totalIncome = 80000;
    const result = getStudentLoanRepayment(totalIncome, ['plan1', 'plan2', 'postgrad'], TAX_YEAR);
    // Plan 1: (80000-26065)*0.09 = 4854.15
    // Plan 2: (80000-28470)*0.09 = 4637.70
    // Postgrad: (80000-21000)*0.06 = 3540.00
    expect(result.plan1).toBeCloseTo(4854.15, 2);
    expect(result.plan2).toBeCloseTo(4637.7, 2);
    expect(result.postgrad).toBeCloseTo(3540, 2);
    expect(result.total).toBeCloseTo(13031.85, 2);
  });
});

// =============================================================================
// COMPETITIVE EDGE VERIFICATION
// =============================================================================

// =============================================================================
// ADDITIONAL CALCULATION TESTS (Gap Coverage)
// =============================================================================

describe('Scenario Tests', () => {
  describe('Other PAYE Employment', () => {
    it('should reduce take-home when other PAYE exists (NI threshold used)', () => {
      // Without other PAYE: director gets NI threshold exemption (PT £12,570)
      // With other PAYE: NI calculated from first pound (threshold already used)
      const baseInput = {
        region: 'rUK' as const,
        revenue: 50000,
        includesVat: false,
        expenses: 0,
      };

      const withoutOtherPAYE = calculateStrategyComparison(baseInput, TAX_YEAR);
      const withOtherPAYE = calculateStrategyComparison(
        { ...baseInput, hasOtherPAYEEmployment: true },
        TAX_YEAR,
      );

      // All Salary strategy should show lower take-home when hasOtherPAYE
      // due to paying NI from first pound
      expect(withOtherPAYE.strategies.allSalary.takeHome).toBeLessThan(
        withoutOtherPAYE.strategies.allSalary.takeHome,
      );
    });

    it('should pay NI on full salary amount when other PAYE exists', () => {
      // The NI difference should be roughly: £12,570 * 8% = ~£1,006
      // (the amount that would normally be exempt up to Primary Threshold)
      const baseInput = {
        region: 'rUK' as const,
        revenue: 50000,
        includesVat: false,
        expenses: 0,
      };

      const withoutOtherPAYE = calculateStrategyComparison(baseInput, TAX_YEAR);
      const withOtherPAYE = calculateStrategyComparison(
        { ...baseInput, hasOtherPAYEEmployment: true },
        TAX_YEAR,
      );

      // Employee NI should be higher when hasOtherPAYE
      expect(withOtherPAYE.strategies.allSalary.employeeNI).toBeGreaterThan(
        withoutOtherPAYE.strategies.allSalary.employeeNI,
      );

      // The difference should be roughly PT * primary rate = £12,570 * 0.08 = £1,005.60
      const niDifference =
        withOtherPAYE.strategies.allSalary.employeeNI -
        withoutOtherPAYE.strategies.allSalary.employeeNI;
      expect(niDifference).toBeCloseTo(1005.6, -1); // Allow some margin
    });

    it('should not affect optimal mix calculation structure', () => {
      // Even with other PAYE, the optimization should still work
      const input = {
        region: 'rUK' as const,
        revenue: 50000,
        includesVat: false,
        expenses: 0,
        hasOtherPAYEEmployment: true,
      };

      const result = calculateStrategyComparison(input, TAX_YEAR);

      // All strategies should still be calculated
      expect(result.strategies.allSalary).toBeDefined();
      expect(result.strategies.allDividends).toBeDefined();
      expect(result.strategies.optimalMix).toBeDefined();
    });
  });

  describe('Minimum Salary Floor', () => {
    it('should respect minimum salary requirement in optimization', () => {
      const input = {
        region: 'rUK' as const,
        revenue: 100000,
        includesVat: false,
        expenses: 0,
        minimumSalaryRequirement: 25000, // Mortgage requirement
      };
      // Optimal might suggest £12,570, but floor is £25k
      const result = calculateStrategyComparison(input, TAX_YEAR);
      expect(result.strategies.optimalMix.salary).toBeGreaterThanOrEqual(25000);
    });

    it('should calculate optimal above floor even if tax-inefficient', () => {
      const input = {
        region: 'rUK' as const,
        revenue: 100000,
        includesVat: false,
        expenses: 0,
        minimumSalaryRequirement: 40000, // High floor
      };
      // £40k salary is suboptimal for tax but required
      const result = calculateStrategyComparison(input, TAX_YEAR);
      expect(result.strategies.optimalMix.salary).toBe(40000);
    });

    it('should not apply floor when not set', () => {
      const input = {
        region: 'rUK' as const,
        revenue: 100000,
        includesVat: false,
        expenses: 0,
        // No minimumSalaryRequirement
      };
      // Optimal should be £12,570 (PA) or £6,500 (LEL)
      const result = calculateStrategyComparison(input, TAX_YEAR);
      expect(result.strategies.optimalMix.salary).toBeLessThanOrEqual(12570);
    });
  });
});

// =============================================================================
// SCOTTISH TAX BAND TESTS (Detailed)
// =============================================================================

describe('Real-World Scenarios', () => {
  describe('Scenario A: Typical Small Company Director', () => {
    it('should calculate optimal for £80k profit, rUK, Plan 2 loan, £5k pension', () => {
      const input = {
        region: 'rUK' as const,
        revenue: 80000,
        includesVat: false,
        expenses: 0,
        studentLoanPlans: ['plan2'] as const,
        pensionContribution: 5000,
      };
      const result = calculateStrategyComparison(input, TAX_YEAR);
      // Expected: Salary around PA (£12,570) or lower for tax efficiency
      expect(result.strategies.optimalMix.salary).toBeLessThanOrEqual(12570);
      // Net take-home should be reasonable for £80k profit minus pension
      expect(result.strategies.optimalMix.takeHome).toBeGreaterThan(45000);
      expect(result.strategies.optimalMix.takeHome).toBeLessThan(75000);
    });
  });

  describe('Scenario B: High Earner in PA Taper Zone', () => {
    it('should calculate optimal for £200k profit, rUK, no loans, £40k pension', () => {
      const input = {
        region: 'rUK' as const,
        revenue: 200000,
        includesVat: false,
        expenses: 0,
        pensionContribution: 40000,
      };
      const result = calculateStrategyComparison(input, TAX_YEAR);
      // High profit (£200k) with pension deduction (£40k) = £160k gross
      // After taxes, expect significant take-home
      expect(result.strategies.optimalMix.takeHome).toBeGreaterThan(90000);
      expect(result.strategies.optimalMix.takeHome).toBeLessThan(160000);
    });
  });

  describe('Scenario C: Low Profit with EA', () => {
    it('should calculate optimal for £25k profit, rUK, EA claimed', () => {
      const input = {
        region: 'rUK' as const,
        revenue: 25000,
        includesVat: false,
        expenses: 0,
        employmentAllowance: true,
      };
      const result = calculateStrategyComparison(input, TAX_YEAR);
      // Low profit = salary capped at profit
      expect(result.strategies.allSalary.salary).toBeLessThanOrEqual(25000);
      expect(result.strategies.optimalMix.takeHome).toBeGreaterThan(15000);
    });
  });

  describe('Scenario D: Scottish Director with Multiple Loans', () => {
    it('should calculate optimal for £100k profit, Scotland, Plan 1 + Postgrad', () => {
      const input = {
        region: 'scotland' as const,
        revenue: 100000,
        includesVat: false,
        expenses: 0,
        studentLoanPlans: ['plan1', 'postgrad'] as const,
      };
      const result = calculateStrategyComparison(input, TAX_YEAR);
      // Scottish income tax (higher rates) + multiple student loans reduce take-home
      expect(result.strategies.optimalMix.takeHome).toBeGreaterThan(58000);
      // Student loans reduce take-home
      expect(result.strategies.optimalMix.studentLoan).toBeGreaterThan(0);
    });
  });

  describe('Scenario E: Compare Mode - User Overpaying', () => {
    it('should show delta when user pays more than optimal', () => {
      const input = {
        region: 'rUK' as const,
        revenue: 100000,
        includesVat: false,
        expenses: 0,
        yourSetupSalary: 50000, // High salary (tax inefficient)
        yourSetupDividends: 30000,
      };
      const result = calculateStrategyComparison(input, TAX_YEAR);
      // Your Setup should exist and show delta
      expect(result.strategies.yourSetup).toBeDefined();
      expect(result.strategies.yourSetup?.deltaVsOptimal).toBeGreaterThan(0);
      // Delta should be significant (overpaying)
      expect(result.strategies.yourSetup?.takeHome).toBeLessThan(
        result.strategies.optimalMix.takeHome,
      );
    });
  });
});

// =============================================================================
// VALIDATION EDGE CASES
// =============================================================================
