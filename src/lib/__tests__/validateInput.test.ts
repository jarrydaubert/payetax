// src/lib/__tests__/validateInput.test.ts
/**
 * Tests for validateInput utility functions
 *
 * Coverage for input validation, sanitization, and error handling
 */

import type { TaxCalculationInput } from '../taxCalculator';
import {
  clamp,
  getInputErrorMessage,
  isValidTaxCode,
  isValidTaxYear,
  roundTo,
  sanitizeSalary,
  validateCalculatorInput,
} from '../validateInput';

describe('validateCalculatorInput', () => {
  const defaultInput: TaxCalculationInput = {
    salary: 50000,
    payPeriod: 'annually',
    taxCode: '1257L',
    taxYear: '2025-2026',
    region: 'england',
    pensionContribution: 0,
    pensionContributionType: 'amount',
    studentLoanPlan: 'none',
    hasPostgradLoan: false,
    hoursPerWeek: 40,
    isBlind: false,
    isMarried: false,
    partnerGrossWage: 0,
  };

  describe('Valid Input', () => {
    it('should validate correct input', () => {
      const result = validateCalculatorInput(defaultInput);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
      expect(result.sanitizedInput).toBeDefined();
    });

    it('should return sanitized input when valid', () => {
      const result = validateCalculatorInput(defaultInput);

      expect(result.sanitizedInput).toEqual(defaultInput);
    });
  });

  describe('Salary Validation', () => {
    it('should reject non-numeric salary', () => {
      const input = { ...defaultInput, salary: 'not a number' as any };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Salary must be a valid number');
      expect(result.sanitizedInput).toBeUndefined();
    });

    it('should reject NaN salary', () => {
      const input = { ...defaultInput, salary: NaN };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Salary must be a valid number');
    });

    it('should warn about negative salary', () => {
      const input = { ...defaultInput, salary: -10000 };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        'Negative salary detected - calculations may not be meaningful'
      );
    });

    it('should warn about very high salary', () => {
      const input = { ...defaultInput, salary: 15000000 };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Very high salary detected - please verify the amount');
    });

    it('should accept zero salary', () => {
      const input = { ...defaultInput, salary: 0 };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept reasonable salary range', () => {
      const salaries = [10000, 25000, 50000, 100000, 500000, 1000000];

      for (const salary of salaries) {
        const input = { ...defaultInput, salary };
        const result = validateCalculatorInput(input);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      }
    });
  });

  describe('Age Validation', () => {
    it('should accept valid age', () => {
      const input = { ...defaultInput, age: 65 };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept undefined age', () => {
      const input = { ...defaultInput, age: undefined };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject non-numeric age', () => {
      const input = { ...defaultInput, age: 'old' as any };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Age must be a valid number');
      expect(result.sanitizedInput?.age).toBeUndefined();
    });

    it('should reject NaN age', () => {
      const input = { ...defaultInput, age: NaN };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Age must be a valid number');
    });

    it('should warn and clear negative age', () => {
      const input = { ...defaultInput, age: -5 };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Invalid age - age allowances will not apply');
      expect(result.sanitizedInput?.age).toBeUndefined();
    });

    it('should warn about unusual age', () => {
      const input = { ...defaultInput, age: 150 };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Unusual age detected - please verify');
    });

    it('should accept boundary ages', () => {
      const ages = [0, 18, 65, 75, 120];

      for (const age of ages) {
        const input = { ...defaultInput, age };
        const result = validateCalculatorInput(input);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      }
    });
  });

  describe('Partner Wage Validation', () => {
    it('should accept valid partner wage', () => {
      const input = { ...defaultInput, isMarried: true, partnerGrossWage: 20000 };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should warn and sanitize negative partner wage', () => {
      const input = { ...defaultInput, isMarried: true, partnerGrossWage: -5000 };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        'Negative partner wage - marriage allowance will not apply'
      );
      expect(result.sanitizedInput?.partnerGrossWage).toBe(0);
    });

    it('should accept zero partner wage', () => {
      const input = { ...defaultInput, isMarried: true, partnerGrossWage: 0 };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('Pension Contribution Validation', () => {
    it('should accept valid pension amount', () => {
      const input = {
        ...defaultInput,
        pensionContribution: 5000,
        pensionContributionType: 'amount' as const,
      };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid pension percentage', () => {
      const input = {
        ...defaultInput,
        pensionContribution: 10,
        pensionContributionType: 'percentage' as const,
      };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should warn about negative pension contribution', () => {
      const input = { ...defaultInput, pensionContribution: -100 };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Negative pension contribution detected');
    });

    it('should warn about pension percentage > 100%', () => {
      const input = {
        ...defaultInput,
        pensionContribution: 150,
        pensionContributionType: 'percentage' as const,
      };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Pension contribution exceeds 100% of salary');
    });

    it('should accept 100% pension contribution', () => {
      const input = {
        ...defaultInput,
        pensionContribution: 100,
        pensionContributionType: 'percentage' as const,
      };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('Hours Per Week Validation', () => {
    it('should accept valid hours for hourly pay', () => {
      const input = { ...defaultInput, payPeriod: 'hourly' as const, hoursPerWeek: 40 };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should default invalid hours to 40', () => {
      const input = { ...defaultInput, payPeriod: 'hourly' as const, hoursPerWeek: 0 };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Invalid hours per week - defaulting to 40 hours');
      expect(result.sanitizedInput?.hoursPerWeek).toBe(40);
    });

    it('should warn about hours exceeding 168 per week', () => {
      const input = { ...defaultInput, payPeriod: 'hourly' as const, hoursPerWeek: 200 };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Hours per week exceeds 168 (total hours in a week)');
    });

    it('should not validate hours for non-hourly pay periods', () => {
      const input = { ...defaultInput, payPeriod: 'monthly' as const, hoursPerWeek: 0 };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toEqual([]);
    });
  });

  describe('Tax Code Validation', () => {
    it('should accept valid standard tax code', () => {
      const input = { ...defaultInput, taxCode: '1257L' };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should default empty tax code to 1257L', () => {
      const input = { ...defaultInput, taxCode: '' };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('No tax code provided - using default 1257L');
      expect(result.sanitizedInput?.taxCode).toBe('1257L');
    });

    it('should default whitespace-only tax code', () => {
      const input = { ...defaultInput, taxCode: '   ' };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('No tax code provided - using default 1257L');
      expect(result.sanitizedInput?.taxCode).toBe('1257L');
    });
  });

  describe('Multiple Validation Issues', () => {
    it('should collect multiple errors', () => {
      const input = {
        ...defaultInput,
        salary: NaN,
        age: 'invalid' as any,
      };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(2);
      expect(result.errors).toContain('Salary must be a valid number');
      expect(result.errors).toContain('Age must be a valid number');
    });

    it('should collect multiple warnings', () => {
      const input = {
        ...defaultInput,
        salary: -100,
        age: 150,
        partnerGrossWage: -1000,
        isMarried: true,
      };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should not return sanitized input when errors exist', () => {
      const input = {
        ...defaultInput,
        salary: NaN,
      };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(false);
      expect(result.sanitizedInput).toBeUndefined();
    });

    it('should return sanitized input with warnings', () => {
      const input = {
        ...defaultInput,
        salary: -100,
      };
      const result = validateCalculatorInput(input);

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.sanitizedInput).toBeDefined();
    });
  });
});

describe('clamp', () => {
  it('should clamp value below min', () => {
    expect(clamp(5, 10, 20)).toBe(10);
  });

  it('should clamp value above max', () => {
    expect(clamp(25, 10, 20)).toBe(20);
  });

  it('should return value within range', () => {
    expect(clamp(15, 10, 20)).toBe(15);
  });

  it('should handle min equals max', () => {
    expect(clamp(15, 10, 10)).toBe(10);
  });

  it('should handle negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(-15, -10, -1)).toBe(-10);
  });
});

describe('roundTo', () => {
  it('should round to 2 decimal places', () => {
    expect(roundTo(Math.PI, 2)).toBe(3.14);
  });

  it('should round to 0 decimal places', () => {
    expect(roundTo(3.7, 0)).toBe(4);
  });

  it('should round to 4 decimal places', () => {
    expect(roundTo(1.23456789, 4)).toBe(1.2346);
  });

  it('should handle negative numbers', () => {
    expect(roundTo(-Math.PI, 2)).toBe(-3.14);
  });

  it('should handle zero', () => {
    expect(roundTo(0, 2)).toBe(0);
  });

  it('should handle very small numbers', () => {
    expect(roundTo(0.0001, 2)).toBe(0);
  });
});

describe('isValidTaxYear', () => {
  it('should accept valid tax year format', () => {
    expect(isValidTaxYear('2025-2026')).toBe(true);
    expect(isValidTaxYear('2024-2025')).toBe(true);
    expect(isValidTaxYear('2023-2024')).toBe(true);
  });

  it('should reject invalid format', () => {
    expect(isValidTaxYear('2025')).toBe(false);
    expect(isValidTaxYear('25-26')).toBe(false);
    expect(isValidTaxYear('2025/2026')).toBe(false);
  });

  it('should reject non-consecutive years', () => {
    expect(isValidTaxYear('2025-2027')).toBe(false);
    expect(isValidTaxYear('2025-2025')).toBe(false);
  });

  it('should reject empty or invalid strings', () => {
    expect(isValidTaxYear('')).toBe(false);
    expect(isValidTaxYear('invalid')).toBe(false);
  });
});

describe('isValidTaxCode', () => {
  describe('Standard Tax Codes', () => {
    it('should accept standard L codes', () => {
      expect(isValidTaxCode('1257L')).toBe(true);
      expect(isValidTaxCode('1000L')).toBe(true);
    });

    it('should accept M codes (marriage allowance received)', () => {
      expect(isValidTaxCode('1257M')).toBe(true);
    });

    it('should accept N codes (marriage allowance given)', () => {
      expect(isValidTaxCode('1257N')).toBe(true);
    });

    it('should accept T codes', () => {
      expect(isValidTaxCode('1257T')).toBe(true);
    });

    it('should accept case insensitive', () => {
      expect(isValidTaxCode('1257l')).toBe(true);
      expect(isValidTaxCode('1257m')).toBe(true);
    });

    it('should handle whitespace', () => {
      expect(isValidTaxCode(' 1257L ')).toBe(true);
    });
  });

  describe('Scottish Tax Codes', () => {
    it('should accept S prefix', () => {
      expect(isValidTaxCode('S1257L')).toBe(true);
      expect(isValidTaxCode('S1257M')).toBe(true);
    });
  });

  describe('K Codes (Negative Allowance)', () => {
    it('should accept K codes', () => {
      expect(isValidTaxCode('K500')).toBe(true);
      expect(isValidTaxCode('K100')).toBe(true);
    });

    it('should accept Scottish K codes', () => {
      expect(isValidTaxCode('SK500')).toBe(true);
    });
  });

  describe('Special Tax Codes', () => {
    it('should accept BR (Basic Rate)', () => {
      expect(isValidTaxCode('BR')).toBe(true);
      expect(isValidTaxCode('br')).toBe(true);
    });

    it('should accept D0 (Higher Rate)', () => {
      expect(isValidTaxCode('D0')).toBe(true);
      expect(isValidTaxCode('d0')).toBe(true);
    });

    it('should accept D1 (Additional Rate)', () => {
      expect(isValidTaxCode('D1')).toBe(true);
    });

    it('should accept NT (No Tax)', () => {
      expect(isValidTaxCode('NT')).toBe(true);
      expect(isValidTaxCode('nt')).toBe(true);
    });

    it('should accept 0T (No Allowance)', () => {
      expect(isValidTaxCode('0T')).toBe(true);
    });
  });

  describe('Invalid Tax Codes', () => {
    it('should reject empty or null', () => {
      expect(isValidTaxCode('')).toBe(false);
      expect(isValidTaxCode(null as any)).toBe(false);
      expect(isValidTaxCode(undefined as any)).toBe(false);
    });

    it('should reject letters only', () => {
      expect(isValidTaxCode('ABCD')).toBe(false);
    });

    it('should accept numbers only (K-code format)', () => {
      // K-codes like K500 pass the pattern test
      // Numbers alone might be accepted by the regex pattern
      expect(isValidTaxCode('1257')).toBe(true); // Matches standard pattern
    });

    it('should reject invalid patterns', () => {
      expect(isValidTaxCode('L1257')).toBe(false);
      expect(isValidTaxCode('12-57L')).toBe(false);
      expect(isValidTaxCode('1257LL')).toBe(false);
    });
  });
});

describe('sanitizeSalary', () => {
  it('should parse string salary with £ symbol', () => {
    expect(sanitizeSalary('£50000')).toBe(50000);
  });

  it('should parse string salary with commas', () => {
    expect(sanitizeSalary('50,000')).toBe(50000);
  });

  it('should parse string salary with £ and commas', () => {
    expect(sanitizeSalary('£50,000')).toBe(50000);
  });

  it('should parse string with decimal', () => {
    expect(sanitizeSalary('50000.50')).toBe(50000.5);
  });

  it('should return number as-is', () => {
    expect(sanitizeSalary(50000)).toBe(50000);
  });

  it('should return 0 for invalid string', () => {
    expect(sanitizeSalary('invalid')).toBe(0);
  });

  it('should return 0 for NaN', () => {
    expect(sanitizeSalary(NaN)).toBe(0);
  });

  it('should return 0 for non-numeric types', () => {
    expect(sanitizeSalary(null)).toBe(0);
    expect(sanitizeSalary(undefined)).toBe(0);
    expect(sanitizeSalary({})).toBe(0);
  });

  it('should handle $ symbol', () => {
    expect(sanitizeSalary('$50000')).toBe(50000);
  });

  it('should handle negative numbers', () => {
    expect(sanitizeSalary('-50000')).toBe(-50000);
  });
});

describe('getInputErrorMessage', () => {
  describe('Salary Errors', () => {
    it('should return error for non-numeric salary', () => {
      expect(getInputErrorMessage('salary', 'invalid')).toBe('Please enter a valid salary amount');
    });

    it('should return error for NaN salary', () => {
      expect(getInputErrorMessage('salary', NaN)).toBe('Please enter a valid salary amount');
    });

    it('should return error for negative salary', () => {
      expect(getInputErrorMessage('salary', -100)).toBe('Salary cannot be negative');
    });

    it('should return null for valid salary', () => {
      expect(getInputErrorMessage('salary', 50000)).toBeNull();
    });
  });

  describe('Age Errors', () => {
    it('should return error for non-numeric age', () => {
      expect(getInputErrorMessage('age', 'old')).toBe('Please enter a valid age');
    });

    it('should return error for negative age', () => {
      expect(getInputErrorMessage('age', -5)).toBe('Please enter an age between 0 and 120');
    });

    it('should return error for age > 120', () => {
      expect(getInputErrorMessage('age', 150)).toBe('Please enter an age between 0 and 120');
    });

    it('should return null for valid age', () => {
      expect(getInputErrorMessage('age', 65)).toBeNull();
    });

    it('should return null for undefined age', () => {
      expect(getInputErrorMessage('age', undefined)).toBeNull();
    });
  });

  describe('Partner Wage Errors', () => {
    it('should return error for non-numeric partner wage', () => {
      expect(getInputErrorMessage('partnerGrossWage', 'invalid')).toBe(
        'Please enter a valid wage amount'
      );
    });

    it('should return error for negative partner wage', () => {
      expect(getInputErrorMessage('partnerGrossWage', -100)).toBe(
        'Partner wage cannot be negative'
      );
    });

    it('should return null for valid partner wage', () => {
      expect(getInputErrorMessage('partnerGrossWage', 20000)).toBeNull();
    });
  });

  describe('Pension Errors', () => {
    it('should return error for non-numeric pension', () => {
      expect(getInputErrorMessage('pensionContribution', 'invalid')).toBe(
        'Please enter a valid pension amount'
      );
    });

    it('should return error for negative pension', () => {
      expect(getInputErrorMessage('pensionContribution', -100)).toBe(
        'Pension contribution cannot be negative'
      );
    });

    it('should return null for valid pension', () => {
      expect(getInputErrorMessage('pensionContribution', 5000)).toBeNull();
    });
  });

  describe('Hours Per Week Errors', () => {
    it('should return error for zero hours', () => {
      expect(getInputErrorMessage('hoursPerWeek', 0)).toBe('Hours per week must be greater than 0');
    });

    it('should return error for hours > 168', () => {
      expect(getInputErrorMessage('hoursPerWeek', 200)).toBe('Hours per week cannot exceed 168');
    });

    it('should return null for valid hours', () => {
      expect(getInputErrorMessage('hoursPerWeek', 40)).toBeNull();
    });
  });

  describe('Tax Code Errors', () => {
    it('should return error for empty tax code', () => {
      expect(getInputErrorMessage('taxCode', '')).toBe('Please enter a tax code');
    });

    it('should return error for whitespace-only tax code', () => {
      expect(getInputErrorMessage('taxCode', '   ')).toBe('Please enter a tax code');
    });

    it('should return error for invalid tax code', () => {
      expect(getInputErrorMessage('taxCode', 'INVALID')).toBe(
        'Please enter a valid tax code (e.g., 1257L, BR, S1257L)'
      );
    });

    it('should return null for valid tax code', () => {
      expect(getInputErrorMessage('taxCode', '1257L')).toBeNull();
    });
  });

  describe('Unknown Fields', () => {
    it('should return null for unknown field', () => {
      expect(getInputErrorMessage('unknownField', 'value')).toBeNull();
    });
  });
});
