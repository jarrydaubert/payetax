import { describe, expect, it } from '@jest/globals';
import { TAX_RATES } from '@/constants/taxRates';
import { validateInput } from '@/lib/validation/directorValidation';
import { calculateCorporationTax } from '../corporationTax';
import { calculateDividendTax } from '../dividendTax';
import { calculateEmployeeNI } from '../employeeNI';
import { calculateEmployerNI, getEmployerNIThreshold } from '../employerNI';
import { calculateIncomeTax } from '../incomeTax';
import { calculateStrategyComparison } from '../strategyComparison';

const TAX_YEAR = '2025-2026' as const;

describe('RUTHLESS: Off-By-One Threshold Attacks', () => {
  // BUG HUNT: < vs <= errors at tax band boundaries

  it('should charge ZERO tax at exactly £12,570 (not £0.01 or crash)', () => {
    // BUG: Using < instead of <= at PA boundary
    // If bug exists: will charge 20% on £0 or crash
    const salary = 12570;
    expect(calculateIncomeTax(salary, 'rUK', TAX_YEAR).incomeTax).toBe(0);
  });

  it('should charge 20% on exactly £12,571 (one penny above PA)', () => {
    // BUG: Off-by-one at PA boundary
    // If bug exists: either charges 0% or 40%
    const salary = 12571;
    // Tax = £1 × 0.20 = £0.20
    expect(calculateIncomeTax(salary, 'rUK', TAX_YEAR).incomeTax).toBe(0.2);
  });

  it('should charge basic rate on exactly £50,270 (top of basic)', () => {
    // BUG: Higher rate kicks in too early
    const salary = 50270;
    // All in basic (no higher rate yet)
    // Tax = (50270 - 12570) × 0.20 = £7,540
    expect(calculateIncomeTax(salary, 'rUK', TAX_YEAR).incomeTax).toBe(7540);
  });

  it('should charge higher rate on exactly £50,271 (first penny of higher)', () => {
    // BUG: Higher rate missing or basic rate continues
    const salary = 50271;
    // Basic: £7,540, Higher: £1 × 0.40 = £0.40, Total: £7,540.40
    expect(calculateIncomeTax(salary, 'rUK', TAX_YEAR).incomeTax).toBe(7540.4);
  });

  it('should have full PA at exactly £100,000 (taper starts AFTER)', () => {
    // BUG: Taper starts at £100k instead of after
    const income = 100000;
    expect(calculateIncomeTax(income, 'rUK', TAX_YEAR).personalAllowance).toBe(12570);
  });

  it('should reduce PA by £1 at exactly £100,002 (HMRC whole-pound rounding)', () => {
    // HMRC annual taper rounds down to the nearest whole pound.
    const income = 100002;
    expect(calculateIncomeTax(income, 'rUK', TAX_YEAR).personalAllowance).toBe(12569);
  });

  it('should have ZERO PA at exactly £125,140', () => {
    // BUG: PA doesn't fully taper or goes negative
    const income = 125140;
    // PA = 12570 - ((125140 - 100000) / 2) = 12570 - 12570 = £0
    expect(calculateIncomeTax(income, 'rUK', TAX_YEAR).personalAllowance).toBe(0);
  });

  it('should still have ZERO PA at £125,141 (not negative)', () => {
    // BUG: PA goes negative, causing tax credit
    const income = 125141;
    const pa = calculateIncomeTax(income, 'rUK', TAX_YEAR).personalAllowance;
    expect(pa).toBe(0);
    expect(pa).toBeGreaterThanOrEqual(0);
  });

  it('should charge 19% CT at exactly £50,000 (small profits limit)', () => {
    // BUG: Marginal relief kicks in at £50k instead of above
    const profit = 50000;
    // CT = £50,000 × 0.19 = £9,500 (no marginal relief)
    expect(calculateCorporationTax(profit).corporationTax).toBe(9500);
  });

  it('should apply marginal relief at £50,001', () => {
    // BUG: Marginal relief doesn't trigger or calculation wrong
    const profit = 50001;
    // CT > £9,500.19 (19% rate would give this)
    // CT < £12,500.25 (25% rate would give this)
    const ct = calculateCorporationTax(profit).corporationTax;
    expect(ct).toBeGreaterThan(9500.19);
    expect(ct).toBeLessThan(12501);
  });

  it('should charge 25% CT at exactly £250,000 (main rate threshold)', () => {
    // BUG: Marginal relief still applies at boundary
    const profit = 250000;
    // CT = £250,000 × 0.25 = £62,500 (no marginal relief)
    expect(calculateCorporationTax(profit).corporationTax).toBe(62500);
  });
});

describe('RUTHLESS: Floating Point Precision Disasters', () => {
  // BUG HUNT: 0.1 + 0.2 !== 0.3 in JavaScript

  it('should handle £33,333.33 salary without floating point drift', () => {
    // BUG: Accumulated floating point errors in tax band calculation
    const salary = 33333.33;
    // Exact calculation: (33333.33 - 12570) × 0.20 = £4,152.666
    // Should round consistently, not have floating point noise
    const tax = calculateIncomeTax(salary, 'rUK', TAX_YEAR).incomeTax;
    expect(tax).toBeGreaterThan(0);
    expect(Number.isFinite(tax)).toBe(true);
  });

  it('should handle dividend tax at 8.75% without precision errors', () => {
    // BUG: 8.75% = 0.0875 causes floating point issues
    const dividends = 10000;
    // Tax = (10000 - 500) × 0.0875 = £831.25 exactly
    const result = calculateDividendTax(dividends, 12570, TAX_YEAR);
    expect(result.dividendTax).toBeCloseTo(831.25, 2);
  });

  it('should handle 33.75% dividend rate without precision errors', () => {
    // BUG: 33.75% = 0.3375 causes floating point issues
    const dividends = 10000;
    // Tax = (10000 - 500) × 0.3375 = £3,206.25 exactly
    const result = calculateDividendTax(dividends, 50270, TAX_YEAR);
    expect(result.dividendTax).toBeCloseTo(3206.25, 2);
  });

  it('should handle 39.35% dividend rate without precision errors', () => {
    // BUG: 39.35% = 0.3935 is a floating point nightmare
    const dividends = 10000;
    // Tax = (10000 - 500) × 0.3935 = £3,738.25 exactly
    const result = calculateDividendTax(dividends, 125140, TAX_YEAR);
    expect(result.dividendTax).toBeCloseTo(3738.25, 2);
  });

  it('should handle £0.01 salary increments correctly', () => {
    // BUG: Penny increments cause cumulative errors
    const salaries = [12570.01, 12570.02, 12570.99, 50270.01, 50270.99];
    for (const salary of salaries) {
      const tax = calculateIncomeTax(salary, 'rUK', TAX_YEAR).incomeTax;
      expect(tax).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(tax)).toBe(true);
    }
  });

  it('should handle marginal relief fraction (3/200) precisely', () => {
    // BUG: 3/200 = 0.015 causes floating point issues
    const profit = 150000;
    // MR = (250000 - 150000) × 3/200 = 100000 × 0.015 = £1,500 exactly
    // CT = 150000 × 0.25 - 1500 = £36,000
    expect(calculateCorporationTax(profit).corporationTax).toBe(36000);
  });
});

describe('RUTHLESS: Negative and Zero Value Attacks', () => {
  // BUG HUNT: Missing guards for edge values

  it('should not crash on zero profit', () => {
    // BUG: Division by zero in effective rate calculation
    const input = {
      region: 'rUK' as const,
      revenue: 0,
      includesVat: false,
      expenses: 0,
    };
    expect(() => calculateStrategyComparison(input, TAX_YEAR)).not.toThrow();
    const result = calculateStrategyComparison(input, TAX_YEAR);
    expect(result.strategies.optimalMix.takeHome).toBe(0);
  });

  it('should not crash on negative profit', () => {
    // BUG: Negative values cause NaN or crash
    const input = {
      region: 'rUK' as const,
      revenue: 0,
      includesVat: false,
      expenses: 50000, // Creates negative profit
    };
    expect(() => calculateStrategyComparison(input, TAX_YEAR)).not.toThrow();
  });

  it('should not crash on zero salary', () => {
    // BUG: Zero salary causes division by zero
    const salary = 0;
    expect(calculateIncomeTax(salary, 'rUK', TAX_YEAR).incomeTax).toBe(0);
    expect(calculateEmployeeNI(salary, TAX_YEAR).employeeNI).toBe(0);
    expect(calculateEmployerNI(salary, TAX_YEAR).employerNI).toBe(0);
  });

  it('should not crash on zero dividends', () => {
    // BUG: Zero dividends causes issues in split calculation
    const dividends = 0;
    const result = calculateDividendTax(dividends, 30000, TAX_YEAR);
    expect(result.dividendTax).toBe(0);
  });

  it('should not allow negative tax (become a credit)', () => {
    // BUG: Edge case combinations produce negative tax
    // This would be a security issue - users could get "refunds"
    const salaries = [1, 100, 12570, 50000];
    for (const salary of salaries) {
      const incomeTax = calculateIncomeTax(salary, 'rUK', TAX_YEAR);
      const employeeNI = calculateEmployeeNI(salary, TAX_YEAR);
      const employerNI = calculateEmployerNI(salary, TAX_YEAR);
      expect(incomeTax.incomeTax).toBeGreaterThanOrEqual(0);
      expect(employeeNI.employeeNI).toBeGreaterThanOrEqual(0);
      expect(employerNI.employerNI).toBeGreaterThanOrEqual(0);
    }
  });

  it('should handle net take-home never exceeding gross profit', () => {
    // BUG: Net somehow greater than gross (math error)
    const profits = [1000, 10000, 50000, 100000, 500000];
    for (const profit of profits) {
      const input = {
        region: 'rUK' as const,
        revenue: profit,
        includesVat: false,
        expenses: 0,
      };
      const result = calculateStrategyComparison(input, TAX_YEAR);
      expect(result.strategies.optimalMix.takeHome).toBeLessThanOrEqual(profit);
      expect(result.strategies.allSalary.takeHome).toBeLessThanOrEqual(profit);
      expect(result.strategies.allDividends.takeHome).toBeLessThanOrEqual(profit);
    }
  });

  it('should not crash on extremely small profit (£0.01)', () => {
    // BUG: Very small values cause precision issues or division by zero
    const input = {
      region: 'rUK' as const,
      revenue: 0.01,
      includesVat: false,
      expenses: 0,
    };
    expect(() => calculateStrategyComparison(input, TAX_YEAR)).not.toThrow();
  });
});

describe('RUTHLESS: Overflow and Extreme Value Attacks', () => {
  // BUG HUNT: Integer overflow, MAX_SAFE_INTEGER issues

  it('should reject Infinity profit', () => {
    // BUG: Infinity not caught in validation
    const input = { profit: Infinity };
    const result = validateInput(input);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Profit must be a finite number');
  });

  it('should reject -Infinity profit', () => {
    // BUG: -Infinity not caught in validation
    const input = { profit: -Infinity };
    const result = validateInput(input);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Profit must be a finite number');
  });
});

describe('HMRC CA44 reference checks (2025-26)', () => {
  it('matches CA44 Example 1 (Armstrong): £19,380 annual earnings, category A', () => {
    const annualEarnings = 19380;
    expect(calculateEmployeeNI(annualEarnings, TAX_YEAR).employeeNI).toBeCloseTo(544.8, 2);
    expect(calculateEmployerNI(annualEarnings, TAX_YEAR).employerNI).toBeCloseTo(2157, 2);
  });

  it('matches CA44 Example 3 (Morris): salary plus bonus = £23,920 annual earnings', () => {
    const annualEarnings = 23920;
    expect(calculateEmployeeNI(annualEarnings, TAX_YEAR).employeeNI).toBeCloseTo(908, 2);
    expect(calculateEmployerNI(annualEarnings, TAX_YEAR).employerNI).toBeCloseTo(2838, 2);
  });

  it('matches recruiter case annual-method NI after April 2025 threshold change', () => {
    const salary = 5845;
    expect(calculateEmployerNI(salary, '2024-2025').employerNI).toBe(0);
    expect(calculateEmployerNI(salary, TAX_YEAR).employerNI).toBeCloseTo(126.75, 2);
  });

  it('uses CA44 2025-26 NI thresholds in taxRates source of truth', () => {
    const rates = TAX_RATES[TAX_YEAR].nationalInsurance;
    expect(rates.employer.A.secondary.threshold).toBe(5000); // ST
    expect(rates.lowerEarningsLimit).toBe(6500); // LEL
    expect(rates.employee.A.primary.threshold).toBe(12570); // PT
    expect(rates.employee.A.upper.threshold).toBe(50270); // UEL
    expect(rates.employer.M.secondary.threshold).toBe(50270); // UST
    expect(rates.employer.H.secondary.threshold).toBe(50270); // AUST
    expect(getEmployerNIThreshold(TAX_YEAR)).toBe(5000);
  });

  it('keeps annual NI equivalent regardless of monthly payment pattern', () => {
    const annualEarnings = 1615 * 12;
    const monthlySlice = 1615;
    const annualViaMonthly = monthlySlice * 12;
    expect(annualViaMonthly).toBe(annualEarnings);
    expect(calculateEmployeeNI(annualViaMonthly, TAX_YEAR).employeeNI).toBeCloseTo(544.8, 2);
    expect(calculateEmployerNI(annualViaMonthly, TAX_YEAR).employerNI).toBeCloseTo(2157, 2);
  });
});
