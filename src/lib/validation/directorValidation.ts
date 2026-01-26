/**
 * Zod Validation Schemas for Director Calculator
 *
 * Provides runtime type validation for the "How Much Can I Pay Myself?" guide.
 * Ensures user inputs are valid before calculation.
 *
 * @module lib/validation/directorValidation
 * @see docs/business/DIRECTOR_TOOLS_BUILD.md
 */

import { z } from 'zod';

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/**
 * Valid UK regions for tax calculation
 *
 * - 'scotland': Scottish income tax rates apply to salary
 * - 'rUK': Rest of UK (England, Wales, Northern Ireland) rates apply
 */
export const REGIONS = ['scotland', 'rUK'] as const;

/**
 * Valid tax years for calculation
 */
export const DIRECTOR_TAX_YEARS = ['2024-2025', '2025-2026'] as const;

/**
 * Calculation result modes
 *
 * - 'normal': Standard salary + dividend extraction
 * - 'survival': No profit available (profit ≤ 0)
 * - 'modified_survival': Low profit (0 < profit ≤ £12,570)
 */
export const CALCULATION_MODES = ['normal', 'survival', 'modified_survival'] as const;

/**
 * Warning types that can be triggered during calculation
 */
export const WARNING_TYPES = [
  'SURVIVAL_MODE',
  'MODIFIED_SURVIVAL',
  'HIGH_COMPLEXITY',
  'VAT_THRESHOLD',
  'DLA_RISK',
  'ALREADY_TAKEN_TOO_MUCH',
] as const;

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Region selection schema
 */
export const RegionSchema = z.enum(REGIONS);

/**
 * Tax year selection schema
 */
export const DirectorTaxYearSchema = z.enum(DIRECTOR_TAX_YEARS);

/**
 * Calculation mode schema
 */
export const CalculationModeSchema = z.enum(CALCULATION_MODES);

/**
 * Warning type schema
 */
export const WarningTypeSchema = z.enum(WARNING_TYPES);

/**
 * Currency amount validation (for revenue, expenses, etc.)
 *
 * - Must be a finite number
 * - Must be non-negative
 * - Maximum £100 million (sanity check)
 */
export const CurrencyAmountSchema = z
  .number()
  .finite('Amount must be a valid number')
  .nonnegative('Amount cannot be negative')
  .max(100_000_000, 'Amount exceeds maximum limit (£100M)');

// ============================================================================
// INPUT VALIDATION SCHEMAS
// ============================================================================

/**
 * Director Calculator Input Schema
 *
 * Validates all user inputs for the director guide.
 * Each field has clear error messages for user feedback.
 */
export const DirectorInputSchema = z.object({
  /** Where the director lives (determines income tax rates) */
  region: RegionSchema,

  /** Annual revenue (what the company has invoiced/expects to invoice) */
  revenue: CurrencyAmountSchema.refine((val) => val > 0, {
    message: 'Please enter your annual revenue',
  }),

  /** Whether revenue includes VAT (we'll deduct 20%) */
  includesVat: z.boolean(),

  /** Business expenses (software, equipment, travel, etc.) */
  expenses: CurrencyAmountSchema,

  /** Money already taken from the company this year */
  alreadyTaken: CurrencyAmountSchema,

  /** Whether money taken was via payroll (null = not sure) */
  alreadyTakenViaPayroll: z.boolean().nullable(),

  /** Whether user confirmed they have no other income */
  confirmedSoleIncome: z.boolean(),
});

/**
 * Partial input schema for progressive form validation
 *
 * Used during the step-by-step form flow where not all fields
 * are filled in yet.
 */
export const PartialDirectorInputSchema = DirectorInputSchema.partial();

// ============================================================================
// OUTPUT SCHEMAS
// ============================================================================

/**
 * Warning object schema
 */
export const WarningSchema = z.object({
  type: WarningTypeSchema,
  message: z.string(),
});

/**
 * Normal calculation result schema
 *
 * Contains full extraction strategy with salary, dividends, and tax pots.
 */
export const DirectorResultSchema = z.object({
  mode: z.literal('normal'),

  // Income breakdown
  grossRevenue: CurrencyAmountSchema,
  netRevenue: CurrencyAmountSchema,
  expenses: CurrencyAmountSchema,
  grossProfit: z.number(),

  // Extraction strategy
  salary: CurrencyAmountSchema,
  monthlySalary: CurrencyAmountSchema,
  employerNI: CurrencyAmountSchema,
  taxableProfit: z.number(),
  corporationTax: CurrencyAmountSchema,
  dividendsAvailable: z.number(),
  dividendTax: CurrencyAmountSchema,

  // Take-home amounts
  annualTakeHome: z.number(),
  remainingTakeHome: z.number(),
  averageMonthlyPay: z.number(),

  // Tax pots to set aside
  companyTaxPot: CurrencyAmountSchema,
  personalTaxAnnual: CurrencyAmountSchema,
  personalTaxMonthly: CurrencyAmountSchema,
  includesPOA: z.boolean(),

  // Warnings
  warnings: z.array(WarningSchema),

  // Metadata
  taxYear: DirectorTaxYearSchema,
  region: RegionSchema,
});

/**
 * Survival mode result schema
 *
 * Used when profit is too low for normal extraction strategy.
 */
export const SurvivalResultSchema = z.object({
  mode: z.enum(['survival', 'modified_survival']),

  // Income breakdown
  grossRevenue: CurrencyAmountSchema,
  netRevenue: CurrencyAmountSchema,
  expenses: CurrencyAmountSchema,
  grossProfit: z.number(),

  // Warnings
  warnings: z.array(WarningSchema),

  // Metadata
  taxYear: DirectorTaxYearSchema,
  region: RegionSchema,

  // Survival-specific
  maxPossibleSalary: z.number(),
  message: z.string(),
});

/**
 * Combined result schema (either normal or survival)
 */
export const DirectorCalculationResultSchema = z.discriminatedUnion('mode', [
  DirectorResultSchema,
  SurvivalResultSchema,
]);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Region = z.infer<typeof RegionSchema>;
export type DirectorTaxYear = z.infer<typeof DirectorTaxYearSchema>;
export type CalculationMode = z.infer<typeof CalculationModeSchema>;
export type WarningType = z.infer<typeof WarningTypeSchema>;
export type Warning = z.infer<typeof WarningSchema>;
export type DirectorInput = z.infer<typeof DirectorInputSchema>;
export type PartialDirectorInput = z.infer<typeof PartialDirectorInputSchema>;
export type DirectorResult = z.infer<typeof DirectorResultSchema>;
export type SurvivalResult = z.infer<typeof SurvivalResultSchema>;
export type DirectorCalculationResult = z.infer<typeof DirectorCalculationResultSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Safely validates director input data
 *
 * @param data - The input data to validate
 * @returns Validation result with success flag and data/error
 *
 * @example
 * ```typescript
 * const result = validateDirectorInput({
 *   region: 'rUK',
 *   revenue: 100000,
 *   includesVat: true,
 *   expenses: 20000,
 *   alreadyTaken: 0,
 *   alreadyTakenViaPayroll: null,
 *   confirmedSoleIncome: true,
 * });
 *
 * if (result.success) {
 *   // result.data is typed as DirectorInput
 *   console.log(result.data.revenue);
 * } else {
 *   // result.error contains validation errors
 *   console.error(result.error.format());
 * }
 * ```
 */
export function validateDirectorInput(data: unknown) {
  return DirectorInputSchema.safeParse(data);
}

/**
 * Safely validates partial director input (for progressive form)
 *
 * @param data - The partial input data to validate
 * @returns Validation result
 */
export function validatePartialDirectorInput(data: unknown) {
  return PartialDirectorInputSchema.safeParse(data);
}

/**
 * Safely validates a region selection
 *
 * @param region - The region string to validate
 * @returns Validation result
 */
export function validateRegion(region: unknown) {
  return RegionSchema.safeParse(region);
}

/**
 * Safely validates a currency amount
 *
 * @param amount - The amount to validate
 * @returns Validation result
 */
export function validateCurrencyAmount(amount: unknown) {
  return CurrencyAmountSchema.safeParse(amount);
}

/**
 * Type guard to check if result is survival mode
 *
 * @param result - The calculation result to check
 * @returns True if result is survival or modified_survival mode
 */
export function isSurvivalMode(result: DirectorCalculationResult): result is SurvivalResult {
  return result.mode === 'survival' || result.mode === 'modified_survival';
}

/**
 * Type guard to check if result is normal mode
 *
 * @param result - The calculation result to check
 * @returns True if result is normal mode
 */
export function isNormalMode(result: DirectorCalculationResult): result is DirectorResult {
  return result.mode === 'normal';
}
