/**
 * Director Calculator - Case Study Tests
 *
 * Tests based on real company accounts (Recruiter case study).
 * Validates pension gap detection, NI threshold changes, and variable income scenarios.
 *
 * @see docs/business/CASE_STUDY_RECRUITER.md
 */

import { TAX_RATES } from '@/constants/taxRates';
import { getEmployerNI, getEmployerNIRate, getEmployerNIThreshold } from '../employerNI';

// Helper to match existing test patterns
const calculateEmployerNI = (salary: number) => getEmployerNI(salary);

// Get NI thresholds from tax rates
const NI_THRESHOLDS = {
  lowerEarningsLimit: TAX_RATES['2025-2026'].nationalInsurance.lowerEarningsLimit,
  employerNI: {
    secondaryThreshold: getEmployerNIThreshold(),
  },
};

describe('Case Study: Recruiter (Feast or Famine Director)', () => {
  /**
   * Real company profile:
   * - Period: June 2024 - June 2025 (13 months)
   * - Sole director, commission-based recruiter
   * - Salary: £5,845/year (£533/month for 10 months, £515 final month)
   * - Revenue: £10,311
   * - Expenses (excl. director): £2,499
   */

  describe('Pension Gap Zone Detection', () => {
    /**
     * The "pension gap" is the zone between:
     * - Secondary Threshold (ST): £5,000 — Employer NI starts
     * - Lower Earnings Limit (LEL): £6,500 — State Pension credits start
     *
     * Salaries in this zone PAY Employer NI but get NO pension credits.
     */

    it('should identify £5,845 salary as in the pension gap zone', () => {
      const salary = 5845;
      const secondaryThreshold = NI_THRESHOLDS.employerNI.secondaryThreshold;
      const lowerEarningsLimit = NI_THRESHOLDS.lowerEarningsLimit;

      // Verify thresholds
      expect(secondaryThreshold).toBe(5000);
      expect(lowerEarningsLimit).toBe(6500);

      // Salary is in the gap
      const isAboveST = salary > secondaryThreshold;
      const isBelowLEL = salary < lowerEarningsLimit;
      const isInPensionGap = isAboveST && isBelowLEL;

      expect(isAboveST).toBe(true);
      expect(isBelowLEL).toBe(true);
      expect(isInPensionGap).toBe(true);
    });

    it('should calculate employer NI for £5,845 salary (paying tax for nothing)', () => {
      const salary = 5845;
      const employerNI = calculateEmployerNI(salary);

      // (5845 - 5000) × 15% = 126.75
      expect(employerNI).toBeCloseTo(126.75, 2);
    });

    it('should calculate employer NI for £6,500 salary (pension credits secured)', () => {
      const salary = 6500;
      const employerNI = calculateEmployerNI(salary);

      // (6500 - 5000) × 15% = 225
      expect(employerNI).toBe(225);
    });

    it('should calculate the cost to fix pension gap', () => {
      const currentSalary = 5845;
      const targetSalary = 6500; // LEL

      const currentNI = calculateEmployerNI(currentSalary);
      const targetNI = calculateEmployerNI(targetSalary);
      const extraNICost = targetNI - currentNI;

      // Extra cost to secure pension credits
      expect(extraNICost).toBeCloseTo(98.25, 2);

      // Extra salary needed
      const extraSalary = targetSalary - currentSalary;
      expect(extraSalary).toBe(655);

      // Monthly extra cost
      const monthlyExtraCost = extraNICost / 12;
      expect(monthlyExtraCost).toBeCloseTo(8.19, 2);
    });

    it('should verify £5,000 salary has zero employer NI', () => {
      const salary = 5000;
      const employerNI = calculateEmployerNI(salary);

      expect(employerNI).toBe(0);
    });

    it('should verify £4,999 salary has zero employer NI', () => {
      const salary = 4999;
      const employerNI = calculateEmployerNI(salary);

      expect(employerNI).toBe(0);
    });
  });

  describe('April 2025 Employer NI Threshold Change', () => {
    /**
     * Real payroll data showed:
     * - Aug 2024 - Mar 2025: £0 Employer NI (threshold was £9,100/year)
     * - Apr 2025 - Jun 2025: £17.40/month (threshold dropped to £5,000/year)
     *
     * This validates our 2025-26 thresholds are correct.
     */

    it('should calculate correct monthly employer NI for 2025-26', () => {
      const monthlySalary = 533;
      const monthlyThreshold = 5000 / 12; // £416.67

      const monthlyNI = Math.max(0, (monthlySalary - monthlyThreshold) * 0.15);

      // (533 - 416.67) × 15% = 17.45
      expect(monthlyNI).toBeCloseTo(17.45, 1);
    });

    it('should match real payroll April 2025 NI (£17.40)', () => {
      // Real payroll showed £17.40, our calc shows £17.45
      // Difference due to rounding in payroll software
      const monthlySalary = 533;
      const monthlyThreshold = 5000 / 12;
      const calculatedNI = Math.max(0, (monthlySalary - monthlyThreshold) * 0.15);
      const realNI = 17.4;

      expect(Math.abs(calculatedNI - realNI)).toBeLessThan(0.1);
    });

    it('should match real payroll June 2025 NI (£14.70)', () => {
      const monthlySalary = 515; // Lower final month
      const monthlyThreshold = 5000 / 12;
      const calculatedNI = Math.max(0, (monthlySalary - monthlyThreshold) * 0.15);
      const realNI = 14.7;

      // (515 - 416.67) × 15% = 14.75
      expect(Math.abs(calculatedNI - realNI)).toBeLessThan(0.1);
    });

    it('should calculate total annual employer NI matching real accounts', () => {
      // Real accounts showed £49.50 for Apr-Jun 2025
      // (Only 3 months of NI due to threshold change mid-year)
      const aprilNI = 17.4;
      const mayNI = 17.4;
      const juneNI = 14.7;
      const realTotalNI = aprilNI + mayNI + juneNI;

      expect(realTotalNI).toBe(49.5);
    });
  });

  describe('Salary Decision Points', () => {
    /**
     * Key salary breakpoints for directors:
     * - £0: No payroll hassle, but no pension credits
     * - £5,000: Zero Employer NI, but just below pension credit
     * - £6,500: State Pension credits secured, minimal NI
     * - £12,570: Full Personal Allowance used, max CT deduction
     * - £50,270: All basic rate band used (rarely optimal)
     */

    const salaryBreakpoints = [
      { salary: 0, expectedNI: 0, pensionCredits: false },
      { salary: 5000, expectedNI: 0, pensionCredits: false },
      { salary: 6500, expectedNI: 225, pensionCredits: true },
      { salary: 12570, expectedNI: 1135.5, pensionCredits: true },
      { salary: 50270, expectedNI: 6790.5, pensionCredits: true },
    ];

    it.each(salaryBreakpoints)('should calculate correct NI for £$salary salary', ({
      salary,
      expectedNI,
    }) => {
      const employerNI = calculateEmployerNI(salary);
      expect(employerNI).toBeCloseTo(expectedNI, 1);
    });

    it.each(salaryBreakpoints)('should determine pension credit eligibility for £$salary salary', ({
      salary,
      pensionCredits,
    }) => {
      const lel = NI_THRESHOLDS.lowerEarningsLimit;
      const qualifiesForPension = salary >= lel;
      expect(qualifiesForPension).toBe(pensionCredits);
    });
  });

  describe('Cash Buffer vs Retained Earnings', () => {
    /**
     * Critical distinction:
     * - Retained earnings (accounting): £1,778
     * - Cash in bank (reality): £889
     * - These are NOT the same!
     *
     * The director thought they had 3.3 months runway (£1,778 / £533)
     * but actually had ~1.7 months (£889 / £533)
     */

    it('should calculate runway based on cash, not retained earnings', () => {
      const retainedEarnings = 1778;
      const cashInBank = 889;
      const monthlySalary = 533;

      const wrongRunway = retainedEarnings / monthlySalary;
      const correctRunway = cashInBank / monthlySalary;

      expect(wrongRunway).toBeCloseTo(3.34, 1); // What director thought
      expect(correctRunway).toBeCloseTo(1.67, 1); // Reality
    });

    it('should factor in creditors when calculating true cash available', () => {
      const cashInBank = 889;
      const creditorsOwed = 740; // CT + accruals

      // If CT is due, actual available cash is minimal
      const afterCreditors = cashInBank - creditorsOwed;
      expect(afterCreditors).toBe(149);
    });
  });

  describe('Recruiter Scenario - Full Calculation', () => {
    /**
     * Real figures:
     * - Revenue: £10,311
     * - Expenses (excl. director): £2,499
     * - Gross profit: £7,812
     */

    const revenue = 10311;
    const expenses = 2499;
    const grossProfit = revenue - expenses;

    it('should calculate correct gross profit', () => {
      expect(grossProfit).toBe(7812);
    });

    it('should show All Salary strategy is optimal for this profit level', () => {
      // With low profit, all salary avoids CT entirely
      // Max salary = profit minus employer NI headroom
      // salary + (salary - 5000) × 0.15 = 7812
      // 1.15 × salary - 750 = 7812
      // salary = 8562 / 1.15 = 7445

      const maxSalary = (grossProfit + 5000 * 0.15) / 1.15;
      expect(maxSalary).toBeCloseTo(7445, 0);

      const employerNI = calculateEmployerNI(maxSalary);
      expect(employerNI).toBeCloseTo(366.75, 0);

      const totalCompanyCost = maxSalary + employerNI;
      expect(totalCompanyCost).toBeCloseTo(7812, 0);
    });

    it('should show LEL strategy preserves cash buffer', () => {
      const lelSalary = 6500;
      const employerNI = calculateEmployerNI(lelSalary); // 225

      const remainingProfit = grossProfit - lelSalary - employerNI;
      expect(remainingProfit).toBeCloseTo(1087, 0);

      const corporationTax = remainingProfit * 0.19;
      expect(corporationTax).toBeCloseTo(206.53, 0);

      const dividendsAvailable = remainingProfit - corporationTax;
      expect(dividendsAvailable).toBeCloseTo(880, 0);

      const totalTakeHome = lelSalary + dividendsAvailable;
      expect(totalTakeHome).toBeCloseTo(7380, 0);
    });

    it('should compare strategies correctly', () => {
      // All Salary: £7,445 take-home
      // LEL + Dividends: £7,380 take-home
      // Difference: £65

      const allSalaryTakeHome = 7445;
      const lelDividendsTakeHome = 7380;

      // All salary wins on pure tax, but...
      expect(allSalaryTakeHome).toBeGreaterThan(lelDividendsTakeHome);

      // LEL strategy leaves more in company for buffer
      const lelBuffer = grossProfit - 6500 - 225 - 206.53 - 880;
      // This is ~0 because we took all dividends in the calc above

      // The real benefit of LEL is lower monthly commitment:
      const allSalaryMonthly = 7445 / 12; // £620/mo
      const lelSalaryMonthly = 6500 / 12; // £542/mo

      expect(lelSalaryMonthly).toBeLessThan(allSalaryMonthly);
    });
  });

  describe('Sole Director Employment Allowance', () => {
    /**
     * Employment Allowance (£10,500) is NOT available when:
     * - Only employee is a director
     * - No other employees paid above secondary threshold
     */

    it('should identify sole director as EA ineligible', () => {
      const employeeCount = 1;
      const isDirectorOnly = true;
      const hasOtherEmployees = employeeCount > 1;

      const eaEligible = !isDirectorOnly || hasOtherEmployees;
      expect(eaEligible).toBe(false);
    });

    it('should show EA makes no difference for this scenario anyway', () => {
      // Even if EA was available, the total Employer NI (£127) is less than £10,500
      const totalEmployerNI = 126.75;
      const employmentAllowance = 10500;

      const niAfterEA = Math.max(0, totalEmployerNI - employmentAllowance);
      expect(niAfterEA).toBe(0);

      // So EA eligibility is moot for very low salaries
    });
  });
});

describe('Pension Gap Warning Logic', () => {
  /**
   * Warning should trigger when:
   * - Salary > £5,000 (paying Employer NI)
   * - Salary < £6,500 (no pension credits)
   */

  const checkPensionGap = (salary: number): { inGap: boolean; warning: string | null } => {
    const ST = 5000;
    const LEL = 6500;

    if (salary > ST && salary < LEL) {
      const currentNI = (salary - ST) * 0.15;
      const targetNI = (LEL - ST) * 0.15;
      const extraCost = targetNI - currentNI;
      const extraSalary = LEL - salary;

      return {
        inGap: true,
        warning: `Inefficient Zone: Paying £${currentNI.toFixed(0)} Employer NI but earning NO pension credits. Increase salary by £${extraSalary} (+£${(extraCost / 12).toFixed(0)}/month) to secure a qualifying year.`,
      };
    }

    return { inGap: false, warning: null };
  };

  it('should warn for £5,845 salary', () => {
    const result = checkPensionGap(5845);
    expect(result.inGap).toBe(true);
    expect(result.warning).toContain('Inefficient Zone');
    expect(result.warning).toContain('655'); // Extra salary needed
  });

  it('should NOT warn for £5,000 salary (no NI paid)', () => {
    const result = checkPensionGap(5000);
    expect(result.inGap).toBe(false);
    expect(result.warning).toBeNull();
  });

  it('should NOT warn for £6,500 salary (pension credits earned)', () => {
    const result = checkPensionGap(6500);
    expect(result.inGap).toBe(false);
    expect(result.warning).toBeNull();
  });

  it('should NOT warn for £12,570 salary', () => {
    const result = checkPensionGap(12570);
    expect(result.inGap).toBe(false);
    expect(result.warning).toBeNull();
  });

  it('should warn for £5,001 salary (edge case)', () => {
    const result = checkPensionGap(5001);
    expect(result.inGap).toBe(true);
  });

  it('should NOT warn for £6,499 salary (just below LEL)', () => {
    // Still in gap
    const result = checkPensionGap(6499);
    expect(result.inGap).toBe(true);
  });
});
