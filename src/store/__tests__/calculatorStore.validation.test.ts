/**
 * Calculator Store Validation Tests
 *
 * Tests runtime validation in calculator store setters.
 * Ensures invalid data is rejected and valid data is accepted.
 *
 * Created as part of Zod Deep Dive improvements (PAYTAX-ZOD-DEEP-DIVE).
 */

import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock Sentry before importing store
jest.mock('@/lib/sentry', () => ({
  addBreadcrumb: jest.fn(),
  captureCalculatorError: jest.fn(),
  captureValidationError: jest.fn(),
  setContext: jest.fn(),
  startPerformanceTransaction: jest.fn(() => ({
    finish: jest.fn(),
  })),
}));

// Mock taxCalculator
jest.mock('@/lib/taxCalculator', () => ({
  calculateTax: jest.fn(() => ({
    netPay: { annually: 40000, monthly: 3333, weekly: 769, daily: 154 },
    incomeTax: { annually: 8000, monthly: 667, weekly: 154, daily: 31 },
    nationalInsurance: { annually: 4000, monthly: 333, weekly: 77, daily: 15 },
    studentLoan: { annually: 0, monthly: 0, weekly: 0, daily: 0 },
    pension: { annually: 0, monthly: 0, weekly: 0, daily: 0 },
  })),
}));

import { useCalculatorStore } from '../calculatorStore';

describe('Calculator Store Validation', () => {
  beforeEach(() => {
    // Reset store to initial state
    const { init } = useCalculatorStore.getState();
    init?.();
  });

  describe('setSalary', () => {
    it('should accept valid salary', () => {
      const { setSalary } = useCalculatorStore.getState();

      setSalary(50000);

      expect(useCalculatorStore.getState().input.salary).toBe(50000);
    });

    it('should accept zero salary', () => {
      const { setSalary } = useCalculatorStore.getState();

      setSalary(0);

      expect(useCalculatorStore.getState().input.salary).toBe(0);
    });

    it('should reject negative salary', () => {
      const { setSalary } = useCalculatorStore.getState();
      const initialSalary = useCalculatorStore.getState().input.salary;

      setSalary(-1000);

      // Should not update state for invalid input
      expect(useCalculatorStore.getState().input.salary).not.toBe(-1000);
      expect(useCalculatorStore.getState().input.salary).toBe(initialSalary);
    });

    it('should reject salary exceeding maximum', () => {
      const { setSalary } = useCalculatorStore.getState();
      const initialSalary = useCalculatorStore.getState().input.salary;

      setSalary(11_000_000);

      // State should not change for invalid input
      expect(useCalculatorStore.getState().input.salary).toBe(initialSalary);
    });

    it('should reject Infinity', () => {
      const { setSalary } = useCalculatorStore.getState();
      const initialSalary = useCalculatorStore.getState().input.salary;

      setSalary(Number.POSITIVE_INFINITY);

      // State should not change for invalid input
      expect(useCalculatorStore.getState().input.salary).toBe(initialSalary);
    });
  });

  describe('setPayPeriod', () => {
    it('should accept valid pay periods', () => {
      const { setPayPeriod } = useCalculatorStore.getState();
      const validPeriods = ['annually', 'monthly', 'weekly', 'daily', 'hourly'] as const;

      for (const period of validPeriods) {
        setPayPeriod(period);
        expect(useCalculatorStore.getState().input.payPeriod).toBe(period);
      }
    });

    it('should reject invalid pay period', () => {
      const { setPayPeriod } = useCalculatorStore.getState();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      // @ts-expect-error Testing invalid input
      setPayPeriod('quarterly');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('setTaxYear', () => {
    it('should accept valid tax years', () => {
      const { setTaxYear } = useCalculatorStore.getState();
      const validYears = ['2024-25', '2025-26'] as const;

      for (const year of validYears) {
        setTaxYear(year);
        expect(useCalculatorStore.getState().input.taxYear).toBe(year);
      }
    });

    it('should accept both YYYY-YY and YYYY-YYYY formats', () => {
      const { setTaxYear } = useCalculatorStore.getState();

      // Both formats should be valid
      setTaxYear('2024-25' as TaxYear);
      expect(useCalculatorStore.getState().input.taxYear).toBe('2024-25');

      setTaxYear('2024-2025' as TaxYear);
      expect(useCalculatorStore.getState().input.taxYear).toBe('2024-2025');
    });

    it('should reject invalid tax year format', () => {
      const { setTaxYear } = useCalculatorStore.getState();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      // @ts-expect-error Testing invalid input
      setTaxYear('2024'); // Missing second part

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should reject non-consecutive tax year', () => {
      const { setTaxYear } = useCalculatorStore.getState();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      // @ts-expect-error Testing invalid input
      setTaxYear('2024-26'); // Skips a year

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('setTaxCode', () => {
    it('should accept valid tax codes', () => {
      const { setTaxCode } = useCalculatorStore.getState();
      const validCodes = ['1257L', 'S1257L', 'K100', 'BR', 'D0', 'NT', '0T'];

      for (const code of validCodes) {
        setTaxCode(code);
        expect(useCalculatorStore.getState().input.taxCode).toBe(code);
      }
    });

    it('should normalize tax code to uppercase', () => {
      const { setTaxCode } = useCalculatorStore.getState();

      setTaxCode('s1257l');

      expect(useCalculatorStore.getState().input.taxCode).toBe('S1257L');
    });

    it('should trim whitespace', () => {
      const { setTaxCode } = useCalculatorStore.getState();

      setTaxCode('  1257L  ');

      expect(useCalculatorStore.getState().input.taxCode).toBe('1257L');
    });

    it('should allow empty tax code', () => {
      const { setTaxCode } = useCalculatorStore.getState();

      setTaxCode('');

      expect(useCalculatorStore.getState().input.taxCode).toBe('');
    });

    it('should reject invalid tax code', () => {
      const { setTaxCode } = useCalculatorStore.getState();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      setTaxCode('INVALID123');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('setRegion', () => {
    it('should accept valid regions', () => {
      const { setRegion } = useCalculatorStore.getState();
      const validRegions = ['England', 'Scotland', 'Wales', 'Northern Ireland'] as const;

      for (const region of validRegions) {
        setRegion(region);
        expect(useCalculatorStore.getState().input.region).toBe(region);
      }
    });

    it('should set isScottish flag for Scotland', () => {
      const { setRegion } = useCalculatorStore.getState();

      setRegion('Scotland');

      expect(useCalculatorStore.getState().input.isScottish).toBe(true);
    });

    it('should clear isScottish flag for other regions', () => {
      const { setRegion } = useCalculatorStore.getState();

      setRegion('England');

      expect(useCalculatorStore.getState().input.isScottish).toBe(false);
    });

    it('should reject invalid region', () => {
      const { setRegion } = useCalculatorStore.getState();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      // @ts-expect-error Testing invalid input
      setRegion('France');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('setPartnerGrossWage', () => {
    it('should accept valid partner wage', () => {
      const { setPartnerGrossWage } = useCalculatorStore.getState();

      setPartnerGrossWage(30000);

      expect(useCalculatorStore.getState().input.partnerGrossWage).toBe(30000);
    });

    it('should reject negative partner wage', () => {
      const { setPartnerGrossWage } = useCalculatorStore.getState();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      setPartnerGrossWage(-1000);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should reject partner wage exceeding maximum', () => {
      const { setPartnerGrossWage } = useCalculatorStore.getState();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      setPartnerGrossWage(11_000_000);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('setAge', () => {
    it('should accept valid age', () => {
      const { setAge } = useCalculatorStore.getState();

      setAge(67);

      expect(useCalculatorStore.getState().input.age).toBe(67);
    });

    it('should accept undefined age', () => {
      const { setAge } = useCalculatorStore.getState();

      setAge(undefined);

      expect(useCalculatorStore.getState().input.age).toBeUndefined();
    });

    it('should reject negative age', () => {
      const { setAge } = useCalculatorStore.getState();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      setAge(-1);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should reject age over 120', () => {
      const { setAge } = useCalculatorStore.getState();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      setAge(121);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should reject non-integer age', () => {
      const { setAge } = useCalculatorStore.getState();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      setAge(67.5);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('setPensionContribution', () => {
    it('should accept valid pension contribution', () => {
      const { setPensionContribution } = useCalculatorStore.getState();

      setPensionContribution(10);

      expect(useCalculatorStore.getState().input.pensionContribution).toBe(10);
    });

    it('should reject negative pension contribution', () => {
      const { setPensionContribution } = useCalculatorStore.getState();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      setPensionContribution(-5);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should reject pension contribution over 100%', () => {
      const { setPensionContribution } = useCalculatorStore.getState();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      setPensionContribution(101);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('setStudentLoanPlans', () => {
    it('should accept valid student loan plans', () => {
      const { setStudentLoanPlans } = useCalculatorStore.getState();

      // Test 'none'
      setStudentLoanPlans('none');
      expect(useCalculatorStore.getState().input.studentLoanPlans).toBe('none');

      // Test single loan arrays
      const validPlans = ['plan1', 'plan2', 'plan4', 'plan5', 'postgrad'] as const;
      for (const plan of validPlans) {
        setStudentLoanPlans([plan]);
        expect(useCalculatorStore.getState().input.studentLoanPlans).toEqual([plan]);
      }

      // Test dual loans
      setStudentLoanPlans(['plan2', 'postgrad']);
      expect(useCalculatorStore.getState().input.studentLoanPlans).toEqual(['plan2', 'postgrad']);
    });

    it('should reject invalid student loan plan', () => {
      const { setStudentLoanPlans } = useCalculatorStore.getState();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      // @ts-expect-error Testing invalid input
      setStudentLoanPlans('plan3');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('setHoursPerWeek', () => {
    it('should accept valid hours per week', () => {
      const { setHoursPerWeek } = useCalculatorStore.getState();

      setHoursPerWeek(40);

      expect(useCalculatorStore.getState().input.hoursPerWeek).toBe(40);
    });

    it('should reject zero hours', () => {
      const { setHoursPerWeek } = useCalculatorStore.getState();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      setHoursPerWeek(0);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should reject hours exceeding 168 (hours in a week)', () => {
      const { setHoursPerWeek } = useCalculatorStore.getState();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      setHoursPerWeek(169);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('setAllowancesDeductions', () => {
    it('should accept valid allowances/deductions', () => {
      const { setAllowancesDeductions } = useCalculatorStore.getState();

      setAllowancesDeductions(5000);

      expect(useCalculatorStore.getState().input.allowancesDeductions).toBe(5000);
    });

    it('should accept negative values (deductions)', () => {
      const { setAllowancesDeductions } = useCalculatorStore.getState();

      setAllowancesDeductions(-5000);

      expect(useCalculatorStore.getState().input.allowancesDeductions).toBe(-5000);
    });

    it('should reject values exceeding maximum', () => {
      const { setAllowancesDeductions } = useCalculatorStore.getState();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      setAllowancesDeductions(2_000_000);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should reject values below minimum', () => {
      const { setAllowancesDeductions } = useCalculatorStore.getState();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      setAllowancesDeductions(-2_000_000);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('What-If Validation', () => {
    describe('setWhatIfType', () => {
      it('should accept valid what-if types', () => {
        const { setWhatIfType } = useCalculatorStore.getState();
        const validTypes = ['percentage', 'amount', 'total'] as const;

        for (const type of validTypes) {
          setWhatIfType(type);
          expect(useCalculatorStore.getState().whatIf.type).toBe(type);
        }
      });

      it('should reject invalid what-if type', () => {
        const { setWhatIfType } = useCalculatorStore.getState();
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        // @ts-expect-error Testing invalid input
        setWhatIfType('invalid');

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });

    describe('setWhatIfValue', () => {
      it('should accept valid what-if value', () => {
        const { setWhatIfValue } = useCalculatorStore.getState();

        setWhatIfValue(5000);

        expect(useCalculatorStore.getState().whatIf.value).toBe(5000);
      });

      it('should reject Infinity', () => {
        const { setWhatIfValue } = useCalculatorStore.getState();
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        setWhatIfValue(Number.POSITIVE_INFINITY);

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });
  });

  describe('Boolean Validation', () => {
    it('should accept valid boolean for isMarried', () => {
      const { setIsMarried } = useCalculatorStore.getState();

      setIsMarried(true);
      expect(useCalculatorStore.getState().input.isMarried).toBe(true);

      setIsMarried(false);
      expect(useCalculatorStore.getState().input.isMarried).toBe(false);
    });

    it('should accept valid boolean for isBlind', () => {
      const { setIsBlind } = useCalculatorStore.getState();

      setIsBlind(true);
      expect(useCalculatorStore.getState().input.isBlind).toBe(true);
    });

    it('should accept valid boolean for payNoNI', () => {
      const { setPayNoNI } = useCalculatorStore.getState();

      setPayNoNI(true);
      expect(useCalculatorStore.getState().input.payNoNI).toBe(true);
    });
  });
});
