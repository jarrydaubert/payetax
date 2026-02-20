/**
 * Director Calculator Integration Tests
 *
 * Tests the full director calculation orchestrator.
 * Includes the "golden example" from the BUILD spec.
 *
 * @see docs/business/DIRECTOR_CALCULATOR_BUILD.md (Golden Test section)
 */

import type { DirectorInput } from '@/lib/validation/directorValidation';
import { isNormalMode, isSurvivalMode } from '@/lib/validation/directorValidation';
import {
  calculateDirectorScenario,
  DEFAULT_SALARY,
  HIGH_COMPLEXITY_THRESHOLD,
  POA_MULTIPLIER,
  POA_THRESHOLD,
  VAT_WARNING_LOWER,
  VAT_WARNING_UPPER,
} from '../directorCalculator';

describe('Director Calculator', () => {
  // Default input for tests
  const defaultInput: DirectorInput = {
    region: 'rUK',
    revenue: 100000,
    includesVat: false,
    expenses: 20000,
    alreadyTaken: 0,
    alreadyTakenViaPayroll: null,
    confirmedSoleIncome: true,
  };

  describe('calculateDirectorScenario', () => {
    describe('Normal calculation path', () => {
      it('should return normal mode for sufficient profit', () => {
        const result = calculateDirectorScenario(defaultInput);

        expect(result.mode).toBe('normal');
        expect(isNormalMode(result)).toBe(true);
        expect(isSurvivalMode(result)).toBe(false);
      });

      it('should use default salary of £12,570', () => {
        const result = calculateDirectorScenario(defaultInput);

        if (isNormalMode(result)) {
          expect(result.salary).toBe(DEFAULT_SALARY);
          expect(result.monthlySalary).toBeCloseTo(1047.5, 2);
        }
      });

      it('should calculate employer NI correctly', () => {
        const result = calculateDirectorScenario(defaultInput);

        if (isNormalMode(result)) {
          // (12570 - 5000) × 0.15 = 1135.50
          expect(result.employerNI).toBe(1135.5);
        }
      });

      it('should calculate gross profit correctly', () => {
        const result = calculateDirectorScenario(defaultInput);

        // 100000 revenue - 20000 expenses = 80000 profit
        expect(result.grossProfit).toBe(80000);
      });

      it('should calculate taxable profit after salary and employer NI', () => {
        const result = calculateDirectorScenario(defaultInput);

        if (isNormalMode(result)) {
          // 80000 - 12570 (salary) - 1135.50 (employer NI) = 66294.50
          expect(result.taxableProfit).toBe(66294.5);
        }
      });

      it('should include employer NI in company tax pot', () => {
        const result = calculateDirectorScenario(defaultInput);

        if (isNormalMode(result)) {
          // Company tax pot = Corporation Tax + Employer NI
          expect(result.companyTaxPot).toBe(result.corporationTax + result.employerNI);
        }
      });

      it('should apply POA multiplier when dividend tax exceeds threshold', () => {
        // Use higher profit to ensure dividend tax > £1000
        const highProfitInput: DirectorInput = {
          ...defaultInput,
          revenue: 150000,
          expenses: 20000,
        };
        const result = calculateDirectorScenario(highProfitInput);

        if (isNormalMode(result)) {
          expect(result.dividendTax).toBeGreaterThan(POA_THRESHOLD);
          expect(result.includesPOA).toBe(true);
          expect(result.personalTaxAnnual).toBeCloseTo(result.dividendTax * POA_MULTIPLIER, 2);
        }
      });

      it('should not apply POA when dividend tax is below threshold', () => {
        // Use lower profit to ensure dividend tax < £1000
        const lowProfitInput: DirectorInput = {
          ...defaultInput,
          revenue: 30000,
          expenses: 5000,
        };
        const result = calculateDirectorScenario(lowProfitInput);

        if (isNormalMode(result)) {
          // At this profit level, dividend tax should be low
          if (result.dividendTax <= POA_THRESHOLD) {
            expect(result.includesPOA).toBe(false);
            expect(result.personalTaxAnnual).toBe(result.dividendTax);
          }
        }
      });
    });

    describe('VAT handling', () => {
      it('should not adjust revenue when includesVat is true (warning-only)', () => {
        const inputWithVat: DirectorInput = {
          ...defaultInput,
          revenue: 120000,
          includesVat: true,
        };
        const result = calculateDirectorScenario(inputWithVat);

        // Spec: VAT status is warnings/education only (no /1.2 adjustment).
        expect(result.netRevenue).toBe(120000);
        expect(result.grossRevenue).toBe(120000);
      });

      it('should not adjust revenue when includesVat is false', () => {
        const inputWithoutVat: DirectorInput = {
          ...defaultInput,
          revenue: 100000,
          includesVat: false,
        };
        const result = calculateDirectorScenario(inputWithoutVat);

        expect(result.netRevenue).toBe(100000);
        expect(result.grossRevenue).toBe(100000);
      });
    });

    describe('Already taken deduction', () => {
      it('should deduct already taken amount from remaining take-home', () => {
        const inputWithTaken: DirectorInput = {
          ...defaultInput,
          alreadyTaken: 10000,
        };
        const result = calculateDirectorScenario(inputWithTaken);

        if (isNormalMode(result)) {
          expect(result.remainingTakeHome).toBeCloseTo(result.annualTakeHome - 10000, 2);
          // Monthly pay is rounded to pence, so use toBeCloseTo
          expect(result.averageMonthlyPay).toBeCloseTo(result.remainingTakeHome / 12, 2);
        }
      });

      it('should not allow negative remaining take-home', () => {
        const inputWithTooMuch: DirectorInput = {
          ...defaultInput,
          alreadyTaken: 500000, // More than possible take-home
        };
        const result = calculateDirectorScenario(inputWithTooMuch);

        if (isNormalMode(result)) {
          expect(result.remainingTakeHome).toBe(0);
          expect(result.averageMonthlyPay).toBe(0);
        }
      });
    });

    describe('Survival mode', () => {
      it('should trigger survival mode when profit <= 0', () => {
        const lossInput: DirectorInput = {
          ...defaultInput,
          revenue: 10000,
          expenses: 15000, // Loss of 5000
        };
        const result = calculateDirectorScenario(lossInput);

        expect(result.mode).toBe('survival');
        expect(isSurvivalMode(result)).toBe(true);
      });

      it('should return normal mode with MODIFIED_SURVIVAL warning when 0 < profit <= personal allowance', () => {
        const lowProfitInput: DirectorInput = {
          ...defaultInput,
          revenue: 15000,
          expenses: 5000, // Profit of 10000 (below £12,570)
        };
        const result = calculateDirectorScenario(lowProfitInput);

        // Returns 'normal' mode with actionable numbers, but includes MODIFIED_SURVIVAL warning
        expect(result.mode).toBe('normal');
        expect(isNormalMode(result)).toBe(true);
        expect(result.warnings.some((w) => w.type === 'MODIFIED_SURVIVAL')).toBe(true);
      });

      it('should return maxPossibleSalary in survival mode', () => {
        const lowProfitInput: DirectorInput = {
          ...defaultInput,
          revenue: 20000,
          expenses: 12000, // Profit of 8000
        };
        const result = calculateDirectorScenario(lowProfitInput);

        if (isSurvivalMode(result)) {
          expect(result.maxPossibleSalary).toBe(8000);
        }
      });

      it('should include appropriate warning message', () => {
        const lossInput: DirectorInput = {
          ...defaultInput,
          revenue: 5000,
          expenses: 10000,
        };
        const result = calculateDirectorScenario(lossInput);

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].type).toBe('SURVIVAL_MODE');
      });
    });

    describe('Warnings', () => {
      it('should add HIGH_COMPLEXITY warning for profit > £250k', () => {
        const highProfitInput: DirectorInput = {
          ...defaultInput,
          revenue: 500000,
          expenses: 100000, // Profit of 400k
        };
        const result = calculateDirectorScenario(highProfitInput);

        if (isNormalMode(result)) {
          const complexityWarning = result.warnings.find((w) => w.type === 'HIGH_COMPLEXITY');
          expect(complexityWarning).toBeDefined();
        }
      });

      it('should add VAT_THRESHOLD warning when revenue in warning band', () => {
        const nearVatInput: DirectorInput = {
          ...defaultInput,
          revenue: 88000, // Between 85k and 95k
          expenses: 10000,
        };
        const result = calculateDirectorScenario(nearVatInput);

        if (isNormalMode(result)) {
          const vatWarning = result.warnings.find((w) => w.type === 'VAT_THRESHOLD');
          expect(vatWarning).toBeDefined();
        }
      });

      it('should add ALREADY_TAKEN_TOO_MUCH warning when exceeded', () => {
        const tooMuchInput: DirectorInput = {
          ...defaultInput,
          alreadyTaken: 200000, // Way more than take-home
        };
        const result = calculateDirectorScenario(tooMuchInput);

        if (isNormalMode(result)) {
          const tooMuchWarning = result.warnings.find((w) => w.type === 'ALREADY_TAKEN_TOO_MUCH');
          expect(tooMuchWarning).toBeDefined();
        }
      });

      it('should add DLA_RISK warning when taken not via payroll', () => {
        const dlaInput: DirectorInput = {
          ...defaultInput,
          alreadyTaken: 5000,
          alreadyTakenViaPayroll: false, // Not via payroll
        };
        const result = calculateDirectorScenario(dlaInput);

        if (isNormalMode(result)) {
          const dlaWarning = result.warnings.find((w) => w.type === 'DLA_RISK');
          expect(dlaWarning).toBeDefined();
        }
      });

      it('should NOT add DLA_RISK warning when taken via payroll', () => {
        const payrollInput: DirectorInput = {
          ...defaultInput,
          alreadyTaken: 5000,
          alreadyTakenViaPayroll: true, // Via payroll
        };
        const result = calculateDirectorScenario(payrollInput);

        if (isNormalMode(result)) {
          const dlaWarning = result.warnings.find((w) => w.type === 'DLA_RISK');
          expect(dlaWarning).toBeUndefined();
        }
      });
    });

    describe('Region handling', () => {
      it('should pass region through to result', () => {
        const scotlandInput: DirectorInput = {
          ...defaultInput,
          region: 'scotland',
        };
        const result = calculateDirectorScenario(scotlandInput);

        expect(result.region).toBe('scotland');
      });

      it('should calculate same gross profit regardless of region', () => {
        const rUKResult = calculateDirectorScenario({ ...defaultInput, region: 'rUK' });
        const scotlandResult = calculateDirectorScenario({
          ...defaultInput,
          region: 'scotland',
        });

        // Gross profit should be identical (CT, dividends are UK-wide)
        expect(rUKResult.grossProfit).toBe(scotlandResult.grossProfit);
      });
    });

    describe('Golden Example (from BUILD spec)', () => {
      /**
       * This is the golden test from DIRECTOR_CALCULATOR_BUILD.md
       *
       * Input:
       * - Location: Scotland
       * - Revenue: £120,000 (includes VAT)
       * - Expenses: £20,000
       * - Already taken: £0
       *
       * Expected:
       * - Revenue is NOT adjusted for VAT (warning-only)
       * - Gross profit: £100,000 (120,000 - 20,000)
       */
      it('should match the golden example calculations', () => {
        const goldenInput: DirectorInput = {
          region: 'scotland',
          revenue: 120000,
          includesVat: true,
          expenses: 20000,
          alreadyTaken: 0,
          alreadyTakenViaPayroll: null,
          confirmedSoleIncome: true,
        };

        const result = calculateDirectorScenario(goldenInput);

        // Basic structure checks
        expect(result.mode).toBe('normal');

        if (isNormalMode(result)) {
          // Revenue and profit
          expect(result.grossRevenue).toBe(120000);
          expect(result.netRevenue).toBe(120000); // VAT warning-only
          expect(result.grossProfit).toBe(100000); // 120000 - 20000

          // Extraction amounts
          expect(result.salary).toBe(12570);
          expect(result.employerNI).toBeCloseTo(1135.5, 2);

          // Taxable profit = 100000 - 12570 - 1135.5 = 86294.5
          expect(result.taxableProfit).toBeCloseTo(86294.5, 2);

          // Corporation Tax (marginal relief applies)
          expect(result.corporationTax).toBeGreaterThan(15000);
          expect(result.corporationTax).toBeLessThan(25000);

          // Company tax pot (CT + Employer NI)
          expect(result.companyTaxPot).toBeGreaterThan(16000);
          expect(result.companyTaxPot).toBeLessThan(26000);

          // Dividends should be substantial
          expect(result.dividendsAvailable).toBeGreaterThan(55000);

          // Personal tax (dividend tax) should be significant
          // With ~£60k dividends, some will be in higher rate band
          expect(result.dividendTax).toBeGreaterThan(3000);
          expect(result.dividendTax).toBeLessThan(20000);

          // POA should apply (dividend tax > £1000)
          expect(result.includesPOA).toBe(true);

          // Monthly figures should be reasonable
          // Take-home ~£55k / 12 = ~£4,500/mo
          expect(result.averageMonthlyPay).toBeGreaterThan(3500);
          expect(result.averageMonthlyPay).toBeLessThan(6000);
          // Personal tax with POA: ~£7,500 × 1.5 / 12 = ~£940/mo
          expect(result.personalTaxMonthly).toBeGreaterThan(500);
          expect(result.personalTaxMonthly).toBeLessThan(2000);
        }
      });
    });
  });

  describe('Constants', () => {
    it('should export correct constants', () => {
      expect(DEFAULT_SALARY).toBe(12570);
      expect(POA_THRESHOLD).toBe(1000);
      expect(POA_MULTIPLIER).toBe(1.5);
      expect(HIGH_COMPLEXITY_THRESHOLD).toBe(250000);
      expect(VAT_WARNING_LOWER).toBe(85000);
      expect(VAT_WARNING_UPPER).toBe(95000);
    });
  });
});
