/**
 * Zod Validation Schemas for UI Components
 *
 * Provides runtime type safety and consistent validation for shadcn/ui components.
 * Created as part of PAYTAX-65 Phase 4 to standardize form validation patterns.
 *
 * @module lib/validation/uiValidation
 */

import { z } from 'zod';

/**
 * Email input validation schema
 *
 * Used for email inputs across the application.
 * Allows empty string for optional email fields.
 *
 * @example
 * ```typescript
 * const result = EmailInputSchema.safeParse({ value: 'user@example.com' });
 * if (!result.success) {
 *   console.error(result.error.flatten().fieldErrors);
 * }
 * ```
 */
export const EmailInputSchema = z.object({
  /** Email address - optional or valid email format */
  value: z.string().email('Invalid email address').optional(), // Zod 4 idiomatic: .optional() instead of .or(z.literal(''))
});

/**
 * Type inferred from EmailInputSchema
 */
export type EmailInputData = z.infer<typeof EmailInputSchema>;

/**
 * Number input validation schema with optional bounds
 *
 * Generic schema for number inputs with configurable min/max values.
 * Note: For atoms layer validation, use NumberInputSchema from atomsValidation.ts
 *
 * @example
 * ```typescript
 * const salarySchema = BoundedNumberInputSchema.extend({
 *   value: z.number().min(0).max(10_000_000),
 * });
 * ```
 */
export const BoundedNumberInputSchema = z.object({
  /** Numeric value - must be finite */
  value: z.number().finite('Must be a valid number').optional(),
  /** Minimum allowed value (optional) */
  min: z.number().optional(),
  /** Maximum allowed value (optional) */
  max: z.number().optional(),
});

/**
 * Type inferred from BoundedNumberInputSchema
 */
export type BoundedNumberInputData = z.infer<typeof BoundedNumberInputSchema>;

/**
 * Text input validation schema with length constraints
 *
 * Standard validation for text inputs with min/max length requirements.
 *
 * @example
 * ```typescript
 * const result = TextInputSchema.safeParse({ value: 'Hello' });
 * ```
 */
export const TextInputSchema = z.object({
  /** Text value - trimmed, min 1 char, max 500 chars */
  value: z.string().trim().min(1, 'Required').max(500, 'Text too long (max 500 characters)'),
});

/**
 * Type inferred from TextInputSchema
 */
export type TextInputData = z.infer<typeof TextInputSchema>;

/**
 * Textarea validation schema with character limits
 *
 * For longer text inputs like descriptions, feedback, comments.
 * Enforces minimum quality (10 chars) and maximum length (5000 chars).
 *
 * @example
 * ```typescript
 * const result = TextAreaSchema.safeParse({ value: 'Long text content...' });
 * ```
 */
export const TextAreaSchema = z.object({
  /** Textarea value - trimmed, min 10 chars, max 5000 chars */
  value: z
    .string()
    .trim()
    .min(10, 'Minimum 10 characters required')
    .max(5000, 'Maximum 5000 characters allowed'),
});

/**
 * Type inferred from TextAreaSchema
 */
export type TextAreaData = z.infer<typeof TextAreaSchema>;

/**
 * Select input validation schema factory
 *
 * Creates a schema for select inputs with a specific set of allowed options.
 * Uses enum validation to ensure only valid options are selected.
 *
 * @param options - Array of valid option values (at least 1 required)
 * @returns Zod schema for validating select input
 *
 * @example
 * ```typescript
 * const TaxYearSchema = SelectInputSchema(['2024-25', '2025-26'] as const);
 * const result = TaxYearSchema.safeParse({ value: '2024-25' });
 * ```
 */
export const SelectInputSchema = <T extends readonly [string, ...string[]]>(options: T) =>
  z.object({
    /** Selected value - must be one of the provided options */
    value: z.enum(options),
  });

/**
 * Checkbox validation schema with required field support
 *
 * Validates checkbox state with optional requirement enforcement.
 * Useful for terms & conditions, consent checkboxes, etc.
 *
 * @example
 * ```typescript
 * const result = CheckboxSchema.safeParse({
 *   checked: true,
 *   required: true,
 * });
 * ```
 */
export const CheckboxSchema = z
  .object({
    /** Whether checkbox is checked */
    checked: z.boolean(),
    /** Whether checkbox must be checked (e.g., terms acceptance) */
    required: z.boolean().optional(),
  })
  .refine((data) => !data.required || data.checked, {
    message: 'This field must be checked',
    path: ['checked'],
  });

/**
 * Type inferred from CheckboxSchema
 */
export type CheckboxData = z.infer<typeof CheckboxSchema>;

/**
 * Cookie consent validation schema
 *
 * Validates cookie consent choices and timestamps.
 * Ensures consent decisions are properly recorded.
 *
 * @example
 * ```typescript
 * const result = CookieConsentSchema.safeParse({
 *   consent: 'accepted',
 *   timestamp: new Date().toISOString(),
 * });
 * ```
 */
export const CookieConsentSchema = z.object({
  /** Consent choice - must be 'accepted' or 'declined' */
  consent: z.enum(['accepted', 'declined']),
  /** ISO 8601 timestamp of consent decision */
  timestamp: z.string().datetime('Invalid timestamp format'),
});

/**
 * Type inferred from CookieConsentSchema
 */
export type CookieConsentData = z.infer<typeof CookieConsentSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates an email address
 *
 * @param email - Email address to validate
 * @returns Zod SafeParseReturnType with success/error information
 *
 * @example
 * ```typescript
 * const result = validateEmail('user@example.com');
 * if (!result.success) {
 *   console.error('Invalid email');
 * }
 * ```
 */
export function validateEmail(email: string) {
  // Allow empty string for optional emails, undefined for missing
  if (email === '') {
    return { success: true, data: undefined } as const;
  }
  return EmailInputSchema.shape.value.safeParse(email);
}

/**
 * Validates a text input with custom length constraints
 *
 * @param value - Text value to validate
 * @param min - Minimum length (default: 1)
 * @param max - Maximum length (default: 500)
 * @returns Zod SafeParseReturnType with success/error information
 *
 * @example
 * ```typescript
 * const result = validateTextInput('Hello', 1, 100);
 * ```
 */
export function validateTextInput(value: string, min = 1, max = 500) {
  return z
    .string()
    .trim()
    .min(min, `Minimum ${min} characters required`)
    .max(max, `Maximum ${max} characters allowed`)
    .safeParse(value);
}

/**
 * Validates a select input against allowed options
 *
 * @param value - Selected value to validate
 * @param options - Array of valid options
 * @returns Zod SafeParseReturnType with success/error information
 *
 * @example
 * ```typescript
 * const result = validateSelect('2024-25', ['2024-25', '2025-26'] as const);
 * ```
 */
export function validateSelect<T extends readonly [string, ...string[]]>(
  value: string,
  options: T,
) {
  return z.enum(options).safeParse(value);
}

/**
 * Validates a number input with optional bounds
 *
 * @param value - Number to validate
 * @param min - Minimum allowed value (optional)
 * @param max - Maximum allowed value (optional)
 * @returns Zod SafeParseReturnType with success/error information
 *
 * @example
 * ```typescript
 * const result = validateNumber(50000, 0, 10_000_000);
 * ```
 */
export function validateNumber(value: number, min?: number, max?: number) {
  let schema = z.number().finite('Must be a valid number');

  if (min !== undefined) {
    schema = schema.min(min, `Must be at least ${min}`);
  }

  if (max !== undefined) {
    schema = schema.max(max, `Must not exceed ${max}`);
  }

  return schema.safeParse(value);
}

/**
 * Validates a required checkbox (e.g., terms & conditions)
 *
 * @param checked - Whether checkbox is checked
 * @returns Zod SafeParseReturnType with success/error information
 *
 * @example
 * ```typescript
 * const result = validateRequiredCheckbox(true);
 * ```
 */
export function validateRequiredCheckbox(checked: boolean) {
  return CheckboxSchema.safeParse({
    checked,
    required: true,
  });
}

/**
 * Validates cookie consent data
 *
 * @param consent - Consent choice ('accepted' or 'declined')
 * @param timestamp - ISO 8601 timestamp
 * @returns Zod SafeParseReturnType with success/error information
 *
 * @example
 * ```typescript
 * const result = validateCookieConsent('accepted', new Date().toISOString());
 * ```
 */
export function validateCookieConsent(consent: 'accepted' | 'declined', timestamp: string) {
  return CookieConsentSchema.safeParse({
    consent,
    timestamp,
  });
}
