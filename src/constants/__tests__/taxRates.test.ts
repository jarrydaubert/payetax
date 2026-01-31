/**
 * Tax Rates Constants Validation Tests
 * Validates structure, completeness, and accuracy of HMRC tax data
 */

import { DEFAULT_TAX_CODE, PERIODS, SCOTTISH_TAX_RATES, TAX_RATES, TAX_YEARS } from '../taxRates';

describe('Tax Rates Constants', () => {
  describe('Data Completeness', () => {
    it('should have rates for all tax years', () => {
      for (const year of TAX_YEARS) {
        expect(TAX_RATES[year]).toBeDefined();
        expect(SCOTTISH_TAX_RATES[year]).toBeDefined();
      }
    });

    it('should have all required fields for each tax year', () => {
      for (const year of TAX_YEARS) {
        const rates = TAX_RATES[year];

        // Personal allowances
        expect(rates.personalAllowance).toBeGreaterThan(0);
        expect(rates.personalAllowanceReductionThreshold).toBeGreaterThan(0);
        expect(rates.personalAllowanceReductionRate).toBeGreaterThan(0);
        expect(rates.personalAllowanceReductionRate).toBeLessThanOrEqual(1);

        // Tax bands
        expect(rates.bands).toBeDefined();
        expect(rates.bands.length).toBeGreaterThanOrEqual(3);

        // Allowances
        expect(rates.marriageAllowance).toBeGreaterThan(0);
        expect(rates.blindPersonsAllowance).toBeGreaterThan(0);

        // National Insurance
        expect(rates.nationalInsurance).toBeDefined();
        expect(rates.nationalInsurance.employee).toBeDefined();
        expect(rates.nationalInsurance.employer).toBeDefined();

        // Student loans
        expect(rates.studentLoan).toBeDefined();
        expect(rates.studentLoan.plan1).toBeDefined();
        expect(rates.studentLoan.plan2).toBeDefined();
        expect(rates.studentLoan.plan4).toBeDefined();
        expect(rates.studentLoan.plan5).toBeDefined();
        expect(rates.studentLoan.postgrad).toBeDefined();
      }
    });

    it('should have Scottish rates for all tax years', () => {
      for (const year of TAX_YEARS) {
        const scotlandRates = SCOTTISH_TAX_RATES[year];

        expect(scotlandRates.personalAllowance).toBeDefined();
        expect(scotlandRates.bands).toBeDefined();
        expect(scotlandRates.bands.length).toBeGreaterThanOrEqual(5); // Scotland has more bands
      }
    });
  });

  describe('Tax Band Validation', () => {
    it('should have valid tax rates (0-100%)', () => {
      for (const year of TAX_YEARS) {
        for (const band of TAX_RATES[year].bands) {
          expect(band.rate).toBeGreaterThanOrEqual(0);
          expect(band.rate).toBeLessThanOrEqual(100);
        }
      }
    });

    it('should have increasing or equal thresholds', () => {
      for (const year of TAX_YEARS) {
        const bands = TAX_RATES[year].bands;
        for (let i = 1; i < bands.length; i++) {
          expect(bands[i].threshold).toBeGreaterThanOrEqual(bands[i - 1].threshold);
        }
      }
    });

    it('should have last band with Infinity threshold', () => {
      for (const year of TAX_YEARS) {
        const bands = TAX_RATES[year].bands;
        const lastBand = bands[bands.length - 1];
        expect(lastBand.threshold).toBe(Number.POSITIVE_INFINITY);
      }
    });

    it('should have valid band names', () => {
      for (const year of TAX_YEARS) {
        for (const band of TAX_RATES[year].bands) {
          expect(band.name).toBeTruthy();
          expect(band.name.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Scottish Tax Rates', () => {
    it('should have more bands than rest of UK', () => {
      for (const year of TAX_YEARS) {
        const ukBands = TAX_RATES[year].bands.length;
        const scotlandBands = SCOTTISH_TAX_RATES[year].bands.length;
        expect(scotlandBands).toBeGreaterThan(ukBands);
      }
    });

    it('should have same personal allowance as UK', () => {
      for (const year of TAX_YEARS) {
        expect(SCOTTISH_TAX_RATES[year].personalAllowance).toBe(TAX_RATES[year].personalAllowance);
      }
    });

    it('should have valid Scottish tax band rates', () => {
      for (const year of TAX_YEARS) {
        for (const band of SCOTTISH_TAX_RATES[year].bands) {
          expect(band.rate).toBeGreaterThanOrEqual(0);
          expect(band.rate).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  describe('National Insurance Validation', () => {
    it('should have all 7 NI categories', () => {
      const expectedCategories = ['A', 'B', 'C', 'H', 'J', 'M', 'Z'];

      for (const year of TAX_YEARS) {
        const employee = TAX_RATES[year].nationalInsurance.employee;
        const employer = TAX_RATES[year].nationalInsurance.employer;

        for (const cat of expectedCategories) {
          expect(employee[cat as keyof typeof employee]).toBeDefined();
          expect(employer[cat as keyof typeof employer]).toBeDefined();
        }
      }
    });

    it('should have valid NI rate ranges', () => {
      for (const year of TAX_YEARS) {
        const employee = TAX_RATES[year].nationalInsurance.employee;

        for (const category of Object.values(employee)) {
          expect(category.primary.rate).toBeGreaterThanOrEqual(0);
          expect(category.primary.rate).toBeLessThanOrEqual(20);
          expect(category.upper.rate).toBeGreaterThanOrEqual(0);
          expect(category.upper.rate).toBeLessThanOrEqual(20);
        }
      }
    });

    it('should have upper threshold greater than primary threshold', () => {
      for (const year of TAX_YEARS) {
        const employee = TAX_RATES[year].nationalInsurance.employee;

        for (const category of Object.values(employee)) {
          expect(category.upper.threshold).toBeGreaterThan(category.primary.threshold);
        }
      }
    });
  });

  describe('Student Loan Validation', () => {
    it('should have all 5 student loan plans', () => {
      for (const year of TAX_YEARS) {
        const studentLoan = TAX_RATES[year].studentLoan;

        expect(studentLoan.plan1).toBeDefined();
        expect(studentLoan.plan2).toBeDefined();
        expect(studentLoan.plan4).toBeDefined();
        expect(studentLoan.plan5).toBeDefined();
        expect(studentLoan.postgrad).toBeDefined();
      }
    });

    it('should have valid student loan repayment rates', () => {
      for (const year of TAX_YEARS) {
        const studentLoan = TAX_RATES[year].studentLoan;

        expect(studentLoan.plan1.rate).toBe(9);
        expect(studentLoan.plan2.rate).toBe(9);
        expect(studentLoan.plan4.rate).toBe(9);
        expect(studentLoan.plan5.rate).toBe(9);
        expect(studentLoan.postgrad.rate).toBe(6);
      }
    });

    it('should have positive thresholds', () => {
      for (const year of TAX_YEARS) {
        const studentLoan = TAX_RATES[year].studentLoan;

        expect(studentLoan.plan1.threshold).toBeGreaterThan(0);
        expect(studentLoan.plan2.threshold).toBeGreaterThan(0);
        expect(studentLoan.plan4.threshold).toBeGreaterThan(0);
        expect(studentLoan.plan5.threshold).toBeGreaterThan(0);
        expect(studentLoan.postgrad.threshold).toBeGreaterThan(0);
      }
    });
  });

  describe('Constants', () => {
    it('should have valid default tax code', () => {
      expect(DEFAULT_TAX_CODE).toBe('1257L');
      expect(DEFAULT_TAX_CODE).toMatch(/^\d{4}L$/);
    });

    it('should have all pay periods', () => {
      expect(PERIODS.ANNUALLY).toBe('annually');
      expect(PERIODS.MONTHLY).toBe('monthly');
      expect(PERIODS.FOUR_WEEKLY).toBe('fourWeekly');
      expect(PERIODS.FORTNIGHTLY).toBe('fortnightly');
      expect(PERIODS.WEEKLY).toBe('weekly');
      expect(PERIODS.DAILY).toBe('daily');
      expect(PERIODS.HOURLY).toBe('hourly');
    });

    it('should have TAX_YEARS array with correct order', () => {
      expect(TAX_YEARS).toContain('2023-2024');
      expect(TAX_YEARS).toContain('2024-2025');
      expect(TAX_YEARS).toContain('2025-2026');

      // Should be ordered newest to oldest
      expect(TAX_YEARS[0]).toBe('2025-2026');
      expect(TAX_YEARS[TAX_YEARS.length - 1]).toBe('2023-2024');
    });
  });

  describe('2025-2026 Specific Validation', () => {
    it('should have correct 2025-26 personal allowance', () => {
      expect(TAX_RATES['2025-2026'].personalAllowance).toBe(12570);
    });

    it('should have correct 2025-26 tax bands', () => {
      const bands = TAX_RATES['2025-2026'].bands;

      expect(bands[0].name).toBe('Basic rate');
      expect(bands[0].rate).toBe(20);
      expect(bands[0].threshold).toBe(37700);

      expect(bands[1].name).toBe('Higher rate');
      expect(bands[1].rate).toBe(40);
      expect(bands[1].threshold).toBe(125140);

      expect(bands[2].name).toBe('Additional rate');
      expect(bands[2].rate).toBe(45);
    });

    it('should have correct 2025-26 NI rates for Category A', () => {
      const categoryA = TAX_RATES['2025-2026'].nationalInsurance.employee.A;

      expect(categoryA.primary.threshold).toBe(12570);
      expect(categoryA.primary.rate).toBe(8);
      expect(categoryA.upper.threshold).toBe(50270);
      expect(categoryA.upper.rate).toBe(2);
    });

    it('should have updated 2025-26 blind persons allowance', () => {
      expect(TAX_RATES['2025-2026'].blindPersonsAllowance).toBe(3130);
    });
  });

  describe('Consistency Checks', () => {
    it('should have consistent personal allowance across UK and Scotland', () => {
      for (const year of TAX_YEARS) {
        expect(SCOTTISH_TAX_RATES[year].personalAllowance).toBe(TAX_RATES[year].personalAllowance);
      }
    });

    it('should have consistent allowances across UK and Scotland', () => {
      for (const year of TAX_YEARS) {
        expect(SCOTTISH_TAX_RATES[year].marriageAllowance).toBe(TAX_RATES[year].marriageAllowance);
        expect(SCOTTISH_TAX_RATES[year].blindPersonsAllowance).toBe(
          TAX_RATES[year].blindPersonsAllowance,
        );
      }
    });

    it('should have increasing personal allowances over years (generally)', () => {
      // Note: Allowances have been frozen, so they might be the same
      const allowance2023 = TAX_RATES['2023-2024'].personalAllowance;
      const allowance2024 = TAX_RATES['2024-2025'].personalAllowance;
      const allowance2025 = TAX_RATES['2025-2026'].personalAllowance;

      expect(allowance2024).toBeGreaterThanOrEqual(allowance2023);
      expect(allowance2025).toBeGreaterThanOrEqual(allowance2024);
    });
  });
});
