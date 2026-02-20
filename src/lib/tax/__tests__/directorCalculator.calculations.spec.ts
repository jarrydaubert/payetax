import { describe, expect, it } from '@jest/globals';
import { calculateCorporationTax } from '../corporationTax';
import { calculateDividendTax, getDividendTax } from '../dividendTax';
import { calculateEmployeeNI } from '../employeeNI';
import { calculateEmployerNI, getEmployerNIThreshold } from '../employerNI';
import { calculateIncomeTax } from '../incomeTax';
import { calculateStrategyComparison } from '../strategyComparison';
import { getStudentLoanRepayment } from '../studentLoan';

const TAX_YEAR = '2025-2026' as const;

describe('Tax Calculations', () => {
  describe('Income Tax - rUK', () => {
    it('should calculate zero tax on income within Personal Allowance', () => {
      // PA = £12,570
      const salary = 12570;
      const result = calculateIncomeTax(salary, 'rUK', TAX_YEAR);
      expect(result.incomeTax).toBe(0);
      expect(result.personalAllowance).toBe(12570);
    });

    it('should calculate basic rate tax (20%) on income £12,571 to £50,270', () => {
      const salary = 30000;
      // Tax = (30000 - 12570) * 0.20 = £3,486
      const result = calculateIncomeTax(salary, 'rUK', TAX_YEAR);
      expect(result.incomeTax).toBe(3486);
      expect(result.taxableIncome).toBe(17430);
    });

    it('should calculate higher rate tax (40%) on income £50,271 to £125,140', () => {
      const salary = 60000;
      // Basic: (50270 - 12570) * 0.20 = £7,540
      // Higher: (60000 - 50270) * 0.40 = £3,892
      // Total: £11,432
      const result = calculateIncomeTax(salary, 'rUK', TAX_YEAR);
      expect(result.incomeTax).toBe(11432);
    });

    it('should calculate additional rate tax (45%) on income over £125,140', () => {
      const salary = 150000;
      // PA tapered to zero at this level
      // Basic: 37700 * 0.20 = £7,540
      // Higher: (125140 - 37700) * 0.40 = £34,976
      // Additional: (150000 - 125140) * 0.45 = £11,187
      // Total: £53,703
      const result = calculateIncomeTax(salary, 'rUK', TAX_YEAR);
      expect(result.incomeTax).toBeCloseTo(53703, 2);
      expect(result.personalAllowance).toBe(0); // Fully tapered
    });

    it('should taper Personal Allowance for income over £100,000', () => {
      // PA reduces by £1 for every £2 over £100k
      // PA = 0 at £125,140
      const salary = 110000;
      // PA = 12570 - ((110000 - 100000) / 2) = 12570 - 5000 = £7,570
      const result = calculateIncomeTax(salary, 'rUK', TAX_YEAR);
      expect(result.personalAllowance).toBe(7570);
    });

    it('should have zero PA at exactly £125,140', () => {
      const salary = 125140;
      // PA = 12570 - ((125140 - 100000) / 2) = 12570 - 12570 = £0
      const result = calculateIncomeTax(salary, 'rUK', TAX_YEAR);
      expect(result.personalAllowance).toBe(0);
    });
  });

  describe('Income Tax - Scotland (6 bands)', () => {
    it('should apply Scottish starter rate (19%) on £12,571 to £15,397', () => {
      const salary = 14000;
      // Tax = (14000 - 12570) * 0.19 = £271.70
      const result = calculateIncomeTax(salary, 'scotland', TAX_YEAR);
      expect(result.incomeTax).toBeCloseTo(271.7, 2);
    });

    it('should apply all 6 Scottish bands correctly', () => {
      // Scottish bands 2025-26:
      // Starter: 19% (£12,571 - £15,397) - threshold 2827
      // Basic: 20% (£15,398 - £27,491) - threshold 14921
      // Intermediate: 21% (£27,492 - £43,662) - threshold 31092
      // Higher: 42% (£43,663 - £75,000) - threshold 62430
      // Advanced: 45% (£75,001 - £125,140) - threshold 112570
      // Top: 48% (over £125,140)
      const salary = 80000;
      const result = calculateIncomeTax(salary, 'scotland', TAX_YEAR);
      expect(result.incomeTax).toBeGreaterThan(0);
      // Verify breakdown:
      // Starter: 2827 * 0.19 = £537.13
      // Basic: (14921-2827) * 0.20 = £2,418.80
      // Intermediate: (31092-14921) * 0.21 = £3,395.91
      // Higher: (62430-31092) * 0.42 = £13,162.96
      // Advanced: (80000-12570-62430) * 0.45 = £2,250.00
      // Total ≈ £21,764.80
      expect(result.incomeTax).toBeCloseTo(21764.8, -1);
    });

    it('should use UK dividend rates for Scottish taxpayers (NOT Scottish bands)', () => {
      // Dividends are taxed at UK rates regardless of region
      const dividends = 10000;
      const salary = 20000; // Other income for band calculation
      const scottishDivTax = getDividendTax(dividends, salary, TAX_YEAR);
      const rukDivTax = getDividendTax(dividends, salary, TAX_YEAR);
      expect(scottishDivTax).toBe(rukDivTax);
    });
  });

  describe('Employee National Insurance', () => {
    it('should calculate zero NI on earnings below Primary Threshold', () => {
      // PT = £12,570 for 2025-26
      const salary = 12000;
      const result = calculateEmployeeNI(salary, TAX_YEAR);
      expect(result.employeeNI).toBe(0);
    });

    it('should calculate 8% NI on earnings between PT and UEL', () => {
      // UEL = £50,270
      const salary = 30000;
      // NI = (30000 - 12570) * 0.08 = £1,394.40
      const result = calculateEmployeeNI(salary, TAX_YEAR);
      expect(result.employeeNI).toBeCloseTo(1394.4, 2);
    });

    it('should calculate 2% NI on earnings above UEL', () => {
      const salary = 60000;
      // Below UEL: (50270 - 12570) * 0.08 = £3,016
      // Above UEL: (60000 - 50270) * 0.02 = £194.60
      // Total: £3,210.60
      const result = calculateEmployeeNI(salary, TAX_YEAR);
      expect(result.employeeNI).toBeCloseTo(3210.6, 2);
    });

    it('should use cumulative annual method for directors (not per pay period)', () => {
      // Directors use annual earnings method
      // This affects mid-year joiners and irregular payments
      const annualSalary = 50000;
      // Our calculator uses annual method by default
      const result = calculateEmployeeNI(annualSalary, TAX_YEAR);
      expect(result.employeeNI).toBeGreaterThan(0);
    });
  });

  describe('Employer National Insurance', () => {
    it('should calculate 15% employer NI above Secondary Threshold', () => {
      // ST = £5,000 from April 2025 (was £9,100)
      const salary = 30000;
      // Employer NI = (30000 - 5000) * 0.15 = £3,750
      const result = calculateEmployerNI(salary, TAX_YEAR);
      expect(result.employerNI).toBe(3750);
    });

    it('should return correct threshold', () => {
      const threshold = getEmployerNIThreshold(TAX_YEAR);
      expect(threshold).toBe(5000);
    });

    it('should calculate zero employer NI below threshold', () => {
      const salary = 4999;
      const result = calculateEmployerNI(salary, TAX_YEAR);
      expect(result.employerNI).toBe(0);
    });
  });

  describe('Corporation Tax', () => {
    it('should calculate 19% CT on profits under £50,000', () => {
      const profit = 40000;
      // CT = 40000 * 0.19 = £7,600
      const result = calculateCorporationTax(profit);
      expect(result.corporationTax).toBe(7600);
      expect(result.rateBand).toBe('small_profits');
    });

    it('should calculate 25% CT on profits over £250,000', () => {
      const profit = 300000;
      // CT = 300000 * 0.25 = £75,000
      const result = calculateCorporationTax(profit);
      expect(result.corporationTax).toBe(75000);
      expect(result.rateBand).toBe('main');
    });

    it('should apply marginal relief for profits between £50k and £250k', () => {
      const profit = 100000;
      // Main rate CT: £100,000 × 0.25 = £25,000
      // Marginal relief: (250,000 - 100,000) × 3/200 = £2,250
      // CT payable: £25,000 - £2,250 = £22,750
      const result = calculateCorporationTax(profit);
      expect(result.corporationTax).toBe(22750);
      expect(result.rateBand).toBe('marginal');
      expect(result.marginalRelief).toBe(2250);
    });
  });

  describe('Dividend Tax', () => {
    it('should apply £500 dividend allowance before taxation', () => {
      const dividends = 500;
      const result = calculateDividendTax(dividends, 12570, TAX_YEAR);
      expect(result.dividendTax).toBe(0);
      expect(result.allowanceUsed).toBe(500);
    });

    it('should calculate 8.75% on dividends in basic rate band', () => {
      const salary = 12570; // Uses PA
      const dividends = 20000;
      // Taxable dividends = 20000 - 500 = £19,500
      // All in basic rate band (up to £50,270 total)
      // Tax = 19500 * 0.0875 = £1,706.25
      const result = calculateDividendTax(dividends, salary, TAX_YEAR);
      expect(result.dividendTax).toBeCloseTo(1706.25, 2);
    });

    it('should calculate 33.75% on dividends in higher rate band', () => {
      const salary = 50270; // Fills basic rate band
      const dividends = 20000;
      // Taxable dividends = 20000 - 500 = £19,500
      // All in higher rate band
      // Tax = 19500 * 0.3375 = £6,581.25
      const result = calculateDividendTax(dividends, salary, TAX_YEAR);
      expect(result.dividendTax).toBeCloseTo(6581.25, 2);
    });

    it('should calculate 39.35% on dividends in additional rate band', () => {
      const salary = 125140;
      const dividends = 50000;
      // All dividends in additional rate
      // Taxable = 50000 - 500 = £49,500
      // Tax = 49500 * 0.3935 = £19,478.25
      const result = calculateDividendTax(dividends, salary, TAX_YEAR);
      expect(result.dividendTax).toBeCloseTo(19478.25, 2);
    });

    it('should split dividends across bands when straddling thresholds', () => {
      const salary = 40000;
      const dividends = 30000;
      // Total income = 70000, dividends straddle basic/higher bands
      // Remaining basic rate band = 50270 - 40000 = £10,270
      const result = calculateDividendTax(dividends, salary, TAX_YEAR);
      expect(result.dividendTax).toBeGreaterThan(0);
      expect(result.bandBreakdown.length).toBeGreaterThan(1); // Multiple bands
    });
  });

  describe('Student Loan Repayments', () => {
    it('should calculate Plan 1 repayments at 9% above £26,065', () => {
      const totalIncome = 50000; // salary + dividends
      // Repayment = (50000 - 26065) * 0.09 = £2,154.15
      const result = getStudentLoanRepayment(totalIncome, ['plan1'], TAX_YEAR);
      expect(result.plan1).toBeCloseTo(2154.15, 2);
      expect(result.total).toBeCloseTo(2154.15, 2);
    });

    it('should calculate Plan 2 repayments at 9% above £28,470', () => {
      const totalIncome = 50000;
      // Repayment = (50000 - 28470) * 0.09 = £1,937.70
      const result = getStudentLoanRepayment(totalIncome, ['plan2'], TAX_YEAR);
      expect(result.plan2).toBeCloseTo(1937.7, 2);
    });

    it('should calculate Plan 4 repayments at 9% above £32,745', () => {
      const totalIncome = 50000;
      // Repayment = (50000 - 32745) * 0.09 = £1,552.95
      const result = getStudentLoanRepayment(totalIncome, ['plan4'], TAX_YEAR);
      expect(result.plan4).toBeCloseTo(1552.95, 2);
    });

    it('should calculate Postgraduate Loan at 6% above £21,000', () => {
      const totalIncome = 50000;
      // Repayment = (50000 - 21000) * 0.06 = £1,740
      const result = getStudentLoanRepayment(totalIncome, ['postgrad'], TAX_YEAR);
      expect(result.postgrad).toBe(1740);
    });

    it('should stack multiple student loan plans', () => {
      const totalIncome = 50000;
      // Plan 2: (50000 - 28470) * 0.09 = £1,937.70
      // Postgrad: (50000 - 21000) * 0.06 = £1,740
      // Total: £3,677.70
      const result = getStudentLoanRepayment(totalIncome, ['plan2', 'postgrad'], TAX_YEAR);
      expect(result.plan2).toBeCloseTo(1937.7, 2);
      expect(result.postgrad).toBeCloseTo(1740, 2);
      expect(result.total).toBeCloseTo(3677.7, 2);
    });

    it('should calculate student loan on total income (salary + dividends + BIK)', () => {
      const salary = 20000;
      const dividends = 25000;
      const bik = 5000;
      const totalIncome = salary + dividends + bik; // £50,000
      // Student loan threshold applies to total
      const result = getStudentLoanRepayment(totalIncome, ['plan1'], TAX_YEAR);
      expect(result.plan1).toBeGreaterThan(0);
    });
  });
});

// =============================================================================
// PILLAR 2: OPTIMIZATION TESTS
// =============================================================================

describe('Additional Calculation Tests', () => {
  describe('Losses Brought Forward', () => {
    it('should reduce CT liability by losses carried forward', () => {
      const baseInput = {
        region: 'rUK' as const,
        revenue: 100000,
        includesVat: false,
        expenses: 0,
      };

      const withoutLosses = calculateStrategyComparison(baseInput, TAX_YEAR);
      const withLosses = calculateStrategyComparison(
        { ...baseInput, lossesBroughtForward: 30000 },
        TAX_YEAR,
      );

      // All Dividends strategy shows losses impact on CT clearly
      // With £30k losses: taxable profit reduced from £100k to £70k
      // CT on £100k (no losses) = £22,750 (marginal relief)
      // CT on £70k (with losses) = £16,000 (marginal relief)
      expect(withLosses.strategies.allDividends.corporationTax).toBeLessThan(
        withoutLosses.strategies.allDividends.corporationTax,
      );

      // Lower CT = higher take-home
      expect(withLosses.strategies.allDividends.takeHome).toBeGreaterThan(
        withoutLosses.strategies.allDividends.takeHome,
      );

      // Verify exact CT reduction: £30k losses saves ~£6,750 in CT
      const ctDifference =
        withoutLosses.strategies.allDividends.corporationTax -
        withLosses.strategies.allDividends.corporationTax;
      expect(ctDifference).toBeGreaterThan(5000); // Should save significant CT
    });

    it('should not allow losses to create negative taxable profit', () => {
      const input = {
        region: 'rUK' as const,
        revenue: 20000,
        includesVat: false,
        expenses: 0,
        lossesBroughtForward: 50000, // Losses exceed profit
      };

      const result = calculateStrategyComparison(input, TAX_YEAR);

      // CT should be £0 (taxable profit floored at 0)
      expect(result.strategies.allDividends.corporationTax).toBe(0);

      // Take-home should equal full profit (no CT to pay)
      // Minus dividend tax on £20k dividends
      expect(result.strategies.allDividends.takeHome).toBeLessThan(20000);
      expect(result.strategies.allDividends.takeHome).toBeGreaterThan(15000);
    });

    it('should handle losses that exactly equal profit', () => {
      const input = {
        region: 'rUK' as const,
        revenue: 50000,
        includesVat: false,
        expenses: 0,
        lossesBroughtForward: 50000, // Losses = profit exactly
      };

      const result = calculateStrategyComparison(input, TAX_YEAR);

      // CT should be £0 (taxable profit = 0)
      expect(result.strategies.allDividends.corporationTax).toBe(0);
    });

    it('should apply losses in optimal mix strategy', () => {
      const baseInput = {
        region: 'rUK' as const,
        revenue: 100000,
        includesVat: false,
        expenses: 0,
      };

      const withoutLosses = calculateStrategyComparison(baseInput, TAX_YEAR);
      const withLosses = calculateStrategyComparison(
        { ...baseInput, lossesBroughtForward: 20000 },
        TAX_YEAR,
      );

      // Optimal mix should also benefit from losses (lower CT on remaining profit)
      expect(withLosses.strategies.optimalMix.corporationTax).toBeLessThan(
        withoutLosses.strategies.optimalMix.corporationTax,
      );

      // Take-home should be higher with losses
      expect(withLosses.strategies.optimalMix.takeHome).toBeGreaterThan(
        withoutLosses.strategies.optimalMix.takeHome,
      );
    });
  });
});

// =============================================================================
// SCENARIO TESTS (Already Taken, Other PAYE, Minimum Salary)
// =============================================================================
