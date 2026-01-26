/**
 * Tests for Director Calculator Validation Schemas
 *
 * Testing strategy:
 * - Happy path (valid inputs)
 * - Edge cases (boundaries, special values)
 * - Invalid inputs (type errors, out of range, NaN, Infinity)
 * - Helper functions (validateDirectorInput, validateRegion, etc.)
 * - Type guards (isSurvivalMode, isNormalMode)
 */

import { describe, expect, it } from '@jest/globals';
import {
  CALCULATION_MODES,
  CurrencyAmountSchema,
  DIRECTOR_TAX_YEARS,
  type DirectorCalculationResult,
  type DirectorInput,
  DirectorInputSchema,
  type DirectorResult,
  DirectorTaxYearSchema,
  isNormalMode,
  isSurvivalMode,
  PartialDirectorInputSchema,
  REGIONS,
  RegionSchema,
  type SurvivalResult,
  validateCurrencyAmount,
  validateDirectorInput,
  validatePartialDirectorInput,
  validateRegion,
  WARNING_TYPES,
  WarningSchema,
  WarningTypeSchema,
} from '../directorValidation';

// ============================================================================
// TEST DATA HELPERS
// ============================================================================

/**
 * Creates valid director input for testing
 */
const createValidInput = (overrides: Partial<DirectorInput> = {}): DirectorInput => ({
  region: 'rUK',
  revenue: 100000,
  includesVat: false,
  expenses: 20000,
  alreadyTaken: 0,
  alreadyTakenViaPayroll: null,
  confirmedSoleIncome: true,
  ...overrides,
});

/**
 * Creates a normal mode result for type guard testing
 */
const createNormalResult = (): DirectorResult => ({
  mode: 'normal',
  grossRevenue: 100000,
  netRevenue: 100000,
  expenses: 20000,
  grossProfit: 80000,
  salary: 12570,
  monthlySalary: 1047.5,
  employerNI: 1135.5,
  taxableProfit: 66294.5,
  corporationTax: 15000,
  dividendsAvailable: 51294.5,
  dividendTax: 5000,
  annualTakeHome: 58864.5,
  remainingTakeHome: 58864.5,
  averageMonthlyPay: 4905.38,
  companyTaxPot: 16135.5,
  personalTaxAnnual: 7500,
  personalTaxMonthly: 625,
  includesPOA: true,
  warnings: [],
  taxYear: '2025-2026',
  region: 'rUK',
});

/**
 * Creates a survival mode result for type guard testing
 */
const createSurvivalResult = (): SurvivalResult => ({
  mode: 'survival',
  grossRevenue: 10000,
  netRevenue: 10000,
  expenses: 15000,
  grossProfit: -5000,
  warnings: [{ type: 'SURVIVAL_MODE', message: 'No profit available' }],
  taxYear: '2025-2026',
  region: 'rUK',
  maxPossibleSalary: 0,
  message: 'No profit available',
});

// ============================================================================
// REGION SCHEMA TESTS
// ============================================================================

describe('RegionSchema', () => {
  describe('valid regions', () => {
    it('should accept "scotland"', () => {
      const result = RegionSchema.safeParse('scotland');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('scotland');
      }
    });

    it('should accept "rUK"', () => {
      const result = RegionSchema.safeParse('rUK');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('rUK');
      }
    });
  });

  describe('invalid regions', () => {
    it('should reject "england"', () => {
      const result = RegionSchema.safeParse('england');
      expect(result.success).toBe(false);
    });

    it('should reject "wales"', () => {
      const result = RegionSchema.safeParse('wales');
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = RegionSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      const result = RegionSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should reject number', () => {
      const result = RegionSchema.safeParse(1);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// TAX YEAR SCHEMA TESTS
// ============================================================================

describe('DirectorTaxYearSchema', () => {
  describe('valid tax years', () => {
    it('should accept "2025-2026"', () => {
      const result = DirectorTaxYearSchema.safeParse('2025-2026');
      expect(result.success).toBe(true);
    });

    it('should accept "2024-2025"', () => {
      const result = DirectorTaxYearSchema.safeParse('2024-2025');
      expect(result.success).toBe(true);
    });
  });

  describe('invalid tax years', () => {
    it('should reject "2023-2024"', () => {
      const result = DirectorTaxYearSchema.safeParse('2023-2024');
      expect(result.success).toBe(false);
    });

    it('should reject invalid format "2025-26"', () => {
      const result = DirectorTaxYearSchema.safeParse('2025-26');
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = DirectorTaxYearSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// CURRENCY AMOUNT SCHEMA TESTS
// ============================================================================

describe('CurrencyAmountSchema', () => {
  describe('valid amounts', () => {
    it('should accept zero', () => {
      const result = CurrencyAmountSchema.safeParse(0);
      expect(result.success).toBe(true);
    });

    it('should accept typical revenue (£100k)', () => {
      const result = CurrencyAmountSchema.safeParse(100000);
      expect(result.success).toBe(true);
    });

    it('should accept maximum (£100M)', () => {
      const result = CurrencyAmountSchema.safeParse(100_000_000);
      expect(result.success).toBe(true);
    });

    it('should accept decimal amounts', () => {
      const result = CurrencyAmountSchema.safeParse(12345.67);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid amounts', () => {
    it('should reject negative amounts', () => {
      const result = CurrencyAmountSchema.safeParse(-100);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('negative');
      }
    });

    it('should reject amounts exceeding £100M', () => {
      const result = CurrencyAmountSchema.safeParse(100_000_001);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('£100M');
      }
    });

    it('should reject Infinity', () => {
      const result = CurrencyAmountSchema.safeParse(Number.POSITIVE_INFINITY);
      expect(result.success).toBe(false);
    });

    it('should reject negative Infinity', () => {
      const result = CurrencyAmountSchema.safeParse(Number.NEGATIVE_INFINITY);
      expect(result.success).toBe(false);
    });

    it('should reject NaN', () => {
      const result = CurrencyAmountSchema.safeParse(Number.NaN);
      expect(result.success).toBe(false);
    });

    it('should reject string numbers', () => {
      const result = CurrencyAmountSchema.safeParse('100000');
      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      const result = CurrencyAmountSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// DIRECTOR INPUT SCHEMA TESTS
// ============================================================================

describe('DirectorInputSchema', () => {
  describe('valid inputs', () => {
    it('should accept complete valid input', () => {
      const input = createValidInput();
      const result = DirectorInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept Scotland region', () => {
      const input = createValidInput({ region: 'scotland' });
      const result = DirectorInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept input with VAT included', () => {
      const input = createValidInput({ includesVat: true });
      const result = DirectorInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept zero expenses', () => {
      const input = createValidInput({ expenses: 0 });
      const result = DirectorInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept alreadyTakenViaPayroll as true', () => {
      const input = createValidInput({
        alreadyTaken: 5000,
        alreadyTakenViaPayroll: true,
      });
      const result = DirectorInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept alreadyTakenViaPayroll as false', () => {
      const input = createValidInput({
        alreadyTaken: 5000,
        alreadyTakenViaPayroll: false,
      });
      const result = DirectorInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept alreadyTakenViaPayroll as null (not sure)', () => {
      const input = createValidInput({
        alreadyTaken: 5000,
        alreadyTakenViaPayroll: null,
      });
      const result = DirectorInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject zero revenue', () => {
      const input = createValidInput({ revenue: 0 });
      const result = DirectorInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('revenue');
      }
    });

    it('should reject negative revenue', () => {
      const input = createValidInput({ revenue: -50000 });
      const result = DirectorInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject negative expenses', () => {
      const input = createValidInput({ expenses: -1000 });
      const result = DirectorInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject invalid region', () => {
      const input = { ...createValidInput(), region: 'england' };
      const result = DirectorInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const result = DirectorInputSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject NaN revenue', () => {
      const input = createValidInput({ revenue: Number.NaN });
      const result = DirectorInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject Infinity expenses', () => {
      const input = createValidInput({ expenses: Number.POSITIVE_INFINITY });
      const result = DirectorInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// PARTIAL INPUT SCHEMA TESTS
// ============================================================================

describe('PartialDirectorInputSchema', () => {
  it('should accept empty object', () => {
    const result = PartialDirectorInputSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept partial input (only region)', () => {
    const result = PartialDirectorInputSchema.safeParse({ region: 'scotland' });
    expect(result.success).toBe(true);
  });

  it('should accept partial input (region + revenue)', () => {
    const result = PartialDirectorInputSchema.safeParse({
      region: 'rUK',
      revenue: 80000,
    });
    expect(result.success).toBe(true);
  });

  it('should still reject invalid values when present', () => {
    const result = PartialDirectorInputSchema.safeParse({
      region: 'invalid',
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// WARNING SCHEMA TESTS
// ============================================================================

describe('WarningSchema', () => {
  it('should accept valid warning', () => {
    const result = WarningSchema.safeParse({
      type: 'SURVIVAL_MODE',
      message: 'No profit available',
    });
    expect(result.success).toBe(true);
  });

  it('should accept all warning types', () => {
    for (const type of WARNING_TYPES) {
      const result = WarningSchema.safeParse({
        type,
        message: `Warning: ${type}`,
      });
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid warning type', () => {
    const result = WarningSchema.safeParse({
      type: 'INVALID_TYPE',
      message: 'Some message',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing message', () => {
    const result = WarningSchema.safeParse({
      type: 'SURVIVAL_MODE',
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// HELPER FUNCTION TESTS
// ============================================================================

describe('validateDirectorInput', () => {
  it('should validate valid input', () => {
    const input = createValidInput();
    const result = validateDirectorInput(input);
    expect(result.success).toBe(true);
  });

  it('should reject invalid input', () => {
    const result = validateDirectorInput({});
    expect(result.success).toBe(false);
  });

  it('should handle unknown type gracefully', () => {
    const result = validateDirectorInput('not an object');
    expect(result.success).toBe(false);
  });
});

describe('validatePartialDirectorInput', () => {
  it('should validate empty object', () => {
    const result = validatePartialDirectorInput({});
    expect(result.success).toBe(true);
  });

  it('should validate partial input', () => {
    const result = validatePartialDirectorInput({ region: 'scotland' });
    expect(result.success).toBe(true);
  });
});

describe('validateRegion', () => {
  it('should validate "scotland"', () => {
    const result = validateRegion('scotland');
    expect(result.success).toBe(true);
  });

  it('should validate "rUK"', () => {
    const result = validateRegion('rUK');
    expect(result.success).toBe(true);
  });

  it('should reject invalid region', () => {
    const result = validateRegion('england');
    expect(result.success).toBe(false);
  });
});

describe('validateCurrencyAmount', () => {
  it('should validate positive amount', () => {
    const result = validateCurrencyAmount(50000);
    expect(result.success).toBe(true);
  });

  it('should validate zero', () => {
    const result = validateCurrencyAmount(0);
    expect(result.success).toBe(true);
  });

  it('should reject negative', () => {
    const result = validateCurrencyAmount(-100);
    expect(result.success).toBe(false);
  });

  it('should reject NaN', () => {
    const result = validateCurrencyAmount(Number.NaN);
    expect(result.success).toBe(false);
  });

  it('should reject Infinity', () => {
    const result = validateCurrencyAmount(Number.POSITIVE_INFINITY);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// TYPE GUARD TESTS
// ============================================================================

describe('isSurvivalMode', () => {
  it('should return true for survival mode', () => {
    const result = createSurvivalResult();
    expect(isSurvivalMode(result)).toBe(true);
  });

  it('should return true for modified_survival mode', () => {
    const result: SurvivalResult = {
      ...createSurvivalResult(),
      mode: 'modified_survival',
    };
    expect(isSurvivalMode(result)).toBe(true);
  });

  it('should return false for normal mode', () => {
    const result = createNormalResult();
    expect(isSurvivalMode(result)).toBe(false);
  });
});

describe('isNormalMode', () => {
  it('should return true for normal mode', () => {
    const result = createNormalResult();
    expect(isNormalMode(result)).toBe(true);
  });

  it('should return false for survival mode', () => {
    const result = createSurvivalResult();
    expect(isNormalMode(result)).toBe(false);
  });

  it('should return false for modified_survival mode', () => {
    const result: SurvivalResult = {
      ...createSurvivalResult(),
      mode: 'modified_survival',
    };
    expect(isNormalMode(result)).toBe(false);
  });
});

// ============================================================================
// CONSTANTS TESTS
// ============================================================================

describe('Constants', () => {
  it('should export correct REGIONS', () => {
    expect(REGIONS).toEqual(['scotland', 'rUK']);
  });

  it('should export correct DIRECTOR_TAX_YEARS', () => {
    expect(DIRECTOR_TAX_YEARS).toEqual(['2024-2025', '2025-2026']);
  });

  it('should export correct CALCULATION_MODES', () => {
    expect(CALCULATION_MODES).toEqual(['normal', 'survival', 'modified_survival']);
  });

  it('should export correct WARNING_TYPES', () => {
    expect(WARNING_TYPES).toContain('SURVIVAL_MODE');
    expect(WARNING_TYPES).toContain('HIGH_COMPLEXITY');
    expect(WARNING_TYPES).toContain('VAT_THRESHOLD');
    expect(WARNING_TYPES).toContain('DLA_RISK');
  });
});
