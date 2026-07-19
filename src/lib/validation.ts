// src/lib/validation.ts

import { z } from 'zod';

/**
 * ============================================================================
 * BRANDED TYPES (Zod 4 Feature - Nominal Typing)
 * ============================================================================
 *
 * Branded types prevent accidentally mixing similar types (e.g., salary with pension).
 * TypeScript will catch these errors at compile time.
 *
 * @example
 * ```typescript
 * const salary: Salary = 50000 as Salary;
 * const pension: PensionAmount = salary; // ❌ Type error!
 * ```
 */

/**
 * Branded Salary type - ensures values can't be mixed with other numbers
 */
export const SalaryBrand = z
  .number()
  .nonnegative('Salary cannot be negative')
  .max(10_000_000, 'Salary exceeds maximum (£10,000,000)')
  .finite('Salary must be a valid number')
  .brand<'Salary'>()
  .describe('Annual gross salary in GBP — branded to prevent mixing with pension/gross/net values');

export type Salary = z.infer<typeof SalaryBrand>;

/**
 * Branded Pension Amount type - separate from salary to prevent mixing
 */
export const PensionAmountBrand = z
  .number()
  .nonnegative('Pension amount cannot be negative')
  .max(1_000_000, 'Pension amount exceeds maximum (£1,000,000)')
  .finite('Pension amount must be a valid number')
  .brand<'PensionAmount'>()
  .describe(
    'Pension contribution amount in GBP — type-safe to prevent accidental salary/income mixing',
  );

export type PensionAmount = z.infer<typeof PensionAmountBrand>;

/**
 * Branded Gross Income type - total income before deductions
 */
export const GrossIncomeBrand = z
  .number()
  .nonnegative('Gross income cannot be negative')
  .max(10_000_000, 'Gross income exceeds maximum (£10,000,000)')
  .finite('Gross income must be a valid number')
  .brand<'GrossIncome'>()
  .describe('Total gross income before tax/NI deductions — branded for compile-time safety');

export type GrossIncome = z.infer<typeof GrossIncomeBrand>;

/**
 * Branded Net Income type - income after all deductions
 */
export const NetIncomeBrand = z
  .number()
  .nonnegative('Net income cannot be negative')
  .max(10_000_000, 'Net income exceeds maximum (£10,000,000)')
  .finite('Net income must be a valid number')
  .brand<'NetIncome'>()
  .describe(
    'Net income after tax, NI, pension, and student loan deductions — type-safe branded value',
  );

export type NetIncome = z.infer<typeof NetIncomeBrand>;

/**
 * ============================================================================
 * COMMON VALIDATION SCHEMAS (For reuse across codebase)
 * ============================================================================
 */

/**
 * Simple boolean validation schema
 * Reusable in store setters and form inputs
 */
export const BooleanSchema = z.boolean();

/**
 * NI Category validation schema
 * Reusable for employment income and calculator inputs
 */
export const NICategorySchema = z.enum(['A', 'B', 'C', 'H', 'J', 'M', 'Z']);

/**
 * Pension contribution type validation schema
 */
export const PensionContributionTypeSchema = z.enum(['percentage', 'amount']);

/**
 * What-If scenario type validation schema
 */
export const WhatIfTypeSchema = z.enum(['percentage', 'amount', 'total']);

/**
 * ============================================================================
 * BLOG & CONTENT VALIDATION
 * ============================================================================
 */

/**
 * Blog Frontmatter Validation Schema
 * Validates all required and optional fields in blog post frontmatter
 */
const fallbackString = (value: string) =>
  z
    .string()
    .optional()
    .catch(value)
    .transform((parsed) => parsed ?? value);

const fallbackBoolean = (value: boolean) =>
  z
    .boolean()
    .optional()
    .catch(value)
    .transform((parsed) => parsed ?? value);

const fallbackStringArray = (value: string[]) =>
  z
    .array(z.string())
    .optional()
    .catch(value)
    .transform((parsed) => parsed ?? value);

export const BlogFrontmatterSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(160, 'Description must not exceed 160 characters'),
  excerpt: z
    .string()
    .min(50, 'Excerpt must be at least 50 characters')
    .max(300, 'Excerpt must not exceed 300 characters'), // Increased for existing posts
  publishedAt: z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
    message: 'Invalid date format - must be ISO 8601',
  }),
  updatedAt: z
    .string()
    .refine((date) => !Number.isNaN(Date.parse(date)), {
      message: 'Invalid date format - must be ISO 8601',
    })
    .optional(),
  category: z.string().min(1, 'Category is required'),
  tags: fallbackStringArray([]), // Fallback to empty array on missing or invalid input
  author: fallbackString('PayeTax Team'), // Fallback to default on missing or invalid input
  featured: fallbackBoolean(false), // Fallback to false on missing or invalid input
  editorsPick: fallbackBoolean(false), // Show in Editor's Picks sidebar
  deepDive: fallbackBoolean(false), // Show in Deep Dives section
  image: z.string().optional(), // Allow both URLs and relative paths
  imageAlt: z.string().optional(),
  readTime: fallbackString('5 min read'), // Fallback on missing or invalid input
});

export type BlogFrontmatter = z.infer<typeof BlogFrontmatterSchema>;

/**
 * URL Parameter Validation Schemas
 */

// Salary URL parameter (e.g., /calculator/50000)
// Using Zod 4's .coerce for automatic string → number conversion
export const SalaryParamSchema = z.coerce
  .number()
  .int('Salary must be a whole number')
  .nonnegative('Salary cannot be negative')
  .max(10_000_000, 'Salary exceeds maximum (£10,000,000)')
  .describe('URL parameter for salary — auto-coerced from string to number using Zod 4 .coerce');

// Blog slug parameter (e.g., /blog/uk-tax-guide)
export const BlogSlugSchema = z
  .string()
  .min(1, 'Blog slug cannot be empty')
  .max(200, 'Blog slug too long')
  .regex(/^[a-z0-9-]+$/, 'Blog slug must contain only lowercase letters, numbers, and hyphens');

// Category slug parameter (e.g., /blog?category=tax)
export const CategorySlugSchema = z
  .string()
  .min(1, 'Category slug cannot be empty')
  .max(50, 'Category slug too long')
  .regex(/^[a-z0-9-]+$/, 'Category slug must contain only lowercase letters, numbers, and hyphens');

/**
 * Environment Variables Validation Schema
 * Validates required and optional environment variables
 */
export const EnvSchema = z.object({
  // Required
  NODE_ENV: z.enum(['development', 'production', 'test']),

  // Optional analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z
    .string()
    .startsWith('G-', 'GA Measurement ID must start with G-')
    .optional(),

  // Optional error tracking
  NEXT_PUBLIC_SENTRY_DSN: z.string().url('Sentry DSN must be a valid URL').optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Build info
  NEXT_PUBLIC_VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

/**
 * Search Query Validation Schema
 */
export const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query cannot be empty').max(100, 'Search query too long'),
  category: CategorySlugSchema.optional(),
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform((val) => Number.parseInt(val, 10))
    .pipe(
      z.number().refine((val) => val > 0 && val <= 1000, {
        message: 'Page out of valid range (1-1000)',
      }),
    )
    .optional(),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

/**
 * Pagination Validation Schema
 */
export const PaginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1'),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .default(10),
  offset: z.number().int().min(0, 'Offset must be non-negative').default(0),
});

export type Pagination = z.infer<typeof PaginationSchema>;

/**
 * Helper function to safely parse and validate data
 * Returns either parsed data or error details
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

/**
 * Format Zod errors for display to users
 */
export function formatZodErrors(error: z.ZodError): string[] {
  return error.issues.map((err) => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });
}

/**
 * Tax Year Validation Schema
 * Validates UK tax year format (YYYY-YY where last 2 digits = first year + 1)
 * Supports both YYYY-YY (2024-25) and YYYY-YYYY (2024-2025) formats
 */
export const TaxYearSchema = z
  .string()
  .refine(
    (year) => {
      // Accept both YYYY-YY and YYYY-YYYY formats
      const shortFormat = /^\d{4}-\d{2}$/;
      const longFormat = /^\d{4}-\d{4}$/;

      if (!(shortFormat.test(year) || longFormat.test(year))) {
        return false;
      }

      return true;
    },
    {
      message: 'Tax year must be in format YYYY-YY or YYYY-YYYY (e.g., 2024-25, 2024-2025)',
    },
  )
  .refine(
    (year) => {
      const parts = year.split('-');

      // Ensure we have exactly 2 parts after split
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        return false;
      }

      const start = Number.parseInt(parts[0], 10);
      const endStr = parts[1];

      // Check for invalid numbers
      if (Number.isNaN(start)) {
        return false;
      }

      // Handle both 2-digit and 4-digit year formats
      const end =
        endStr.length === 2 ? Number.parseInt(`20${endStr}`, 10) : Number.parseInt(endStr, 10);

      // Check for invalid end year
      if (Number.isNaN(end)) {
        return false;
      }

      return end === start + 1;
    },
    {
      message: 'Tax year must be consecutive (e.g., 2024-25, 2025-26)',
    },
  );

/**
 * Salary Sanitization Schema
 * Converts various salary inputs (string, number) to valid number
 * Removes currency symbols (£, $) and thousand separators (,)
 */
export const SalarySanitizationSchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    if (typeof val === 'string') {
      // Remove currency symbols and commas
      const cleaned = val.replace(/[£$,]/g, '');
      const parsed = Number.parseFloat(cleaned);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    if (typeof val === 'number') {
      return Number.isNaN(val) ? 0 : val;
    }
    return 0;
  })
  .pipe(z.number().min(0).max(10_000_000));

/**
 * ============================================================================
 * CALCULATOR INPUT VALIDATION (What If & Comparison)
 * ============================================================================
 *
 * Schemas for calculator UI input validation.
 * Moved from inline component definitions (PAYTAX-127).
 */

/**
 * What If Scenario Value Schema
 *
 * Validates What If scenario inputs with type-specific rules:
 * - percentage: -100% to 1000% (allows decreases and large increases)
 * - amount: -£10M to £10M (allows salary reductions)
 * - total: £0 to £10M (new total salary must be non-negative)
 *
 * Uses Zod 4.x .superRefine() for powerful type-specific validation.
 *
 * @example
 * ```typescript
 * // Valid percentage change
 * WhatIfValueSchema.safeParse({ type: 'percentage', value: 10 }); // +10%
 *
 * // Valid amount change
 * WhatIfValueSchema.safeParse({ type: 'amount', value: -5000 }); // -£5k
 *
 * // Valid new total
 * WhatIfValueSchema.safeParse({ type: 'total', value: 55000 }); // £55k
 * ```
 */
export const WhatIfValueSchema = z
  .object({
    type: z.enum(['percentage', 'amount', 'total']),
    value: z.number().finite('Value must be a valid number'),
  })
  .superRefine((data, ctx) => {
    // Type-specific validation using Zod 4.x superRefine
    if (data.type === 'percentage') {
      if (data.value < -100 || data.value > 1000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Percentage must be between -100% and 1000%',
          path: ['value'],
        });
      }
    } else if (data.type === 'amount') {
      if (data.value < -10000000 || data.value > 10000000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Amount must be between -£10M and £10M',
          path: ['value'],
        });
      }
    } else if (data.type === 'total') {
      if (data.value < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 0,
          type: 'number',
          inclusive: true,
          origin: 'number',
          message: 'Total salary cannot be negative',
          path: ['value'],
        });
      } else if (data.value > 10000000) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: 10000000,
          type: 'number',
          inclusive: true,
          origin: 'number',
          message: 'Total salary cannot exceed £10M',
          path: ['value'],
        });
      }
    }
  });

export type WhatIfValue = z.infer<typeof WhatIfValueSchema>;

/**
 * Salary Comparison Value Schema
 *
 * Validates salary comparison inputs with mode-specific rules:
 * - percentage: 0.01% to 1000% (positive increases only)
 * - amount: £1 to £10M (positive amounts only)
 * - total: £1 to £10M (new total salary)
 *
 * @example
 * ```typescript
 * // Valid percentage increase
 * ComparisonValueSchema.safeParse({
 *   mode: 'percentage',
 *   value: 5
 * }); // +5%
 *
 * // Valid amount increase
 * ComparisonValueSchema.safeParse({
 *   mode: 'amount',
 *   value: 5000
 * }); // +£5k
 * ```
 */
export const ComparisonValueSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('percentage'),
    value: z
      .number()
      .min(0.01, 'Percentage must be at least 0.01%')
      .max(1000, 'Percentage cannot exceed 1000%'),
  }),
  z.object({
    mode: z.literal('amount'),
    value: z
      .number()
      .min(1, 'Amount must be at least £1')
      .max(10000000, 'Amount cannot exceed £10M'),
  }),
  z.object({
    mode: z.literal('total'),
    value: z
      .number()
      .min(1, 'Total salary must be at least £1')
      .max(10000000, 'Total salary cannot exceed £10M'),
  }),
]);

export type ComparisonValue = z.infer<typeof ComparisonValueSchema>;

/**
 * Helper function to validate What If scenario inputs
 * @param type - The type of What If scenario
 * @param value - The value to validate
 * @returns Validation result with success flag and data/error
 */
export function validateWhatIfValue(type: 'percentage' | 'amount' | 'total', value: number) {
  return WhatIfValueSchema.safeParse({ type, value });
}

/**
 * Helper function to validate salary comparison inputs
 * @param mode - The comparison mode
 * @param value - The value to validate
 * @returns Validation result with success flag and data/error
 */
export function validateComparisonValue(
  mode: 'percentage' | 'amount' | 'total',
  value: number,
  modeValue?: number,
) {
  return ComparisonValueSchema.safeParse({
    mode,
    value: modeValue ?? value,
  });
}

/**
 * Utility Functions for Validation
 * Migrated from validateInput.ts (PAYTAX-66 Phase 2)
 */

/**
 * Clamps a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Rounds to specified decimal places
 */
export function roundTo(value: number, decimals: number): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}
