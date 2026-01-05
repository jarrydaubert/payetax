/**
 * Zod Validation Schemas for Molecules Components
 *
 * Provides runtime type safety and consistent validation for molecule-level components.
 * Created as part of PAYTAX-63 molecules audit to replace inline validation logic.
 *
 * @module lib/validation/moleculesValidation
 */

import { z } from 'zod';

/**
 * Feedback form validation schema
 *
 * Used by FeedbackDialog.tsx to validate user feedback submissions
 *
 * Rules:
 * - Email is optional but must be valid format if provided
 * - Message is required, minimum 10 characters, maximum 5000 characters
 * - Message is trimmed before validation
 *
 * @example
 * ```typescript
 * const result = validateFeedbackForm({ email: 'user@example.com', message: 'Great tool!' });
 * if (!result.success) {
 *   console.error(result.error.flatten().fieldErrors);
 * }
 * ```
 */
export const FeedbackFormSchema = z.object({
  /** Optional email address, must be valid format if provided (empty string allowed) */
  email: z
    .string()
    .optional()
    .transform((val) => val?.trim())
    .transform((val) => (val === '' ? undefined : val))
    .refine((val) => val === undefined || z.string().email().safeParse(val).success, {
      message: 'Invalid email address',
    }),
  /** Required message, 10-5000 characters after trimming */
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must not exceed 5000 characters'),
});

/**
 * Type inferred from FeedbackFormSchema
 * Use this for TypeScript type safety in components
 */
export type FeedbackFormData = z.infer<typeof FeedbackFormSchema>;

/**
 * Helper function to validate feedback form data
 *
 * @param data - The form data to validate
 * @returns Zod SafeParseReturnType with success/error information
 *
 * @example
 * ```typescript
 * const result = validateFeedbackForm(formData);
 * if (!result.success) {
 *   const errors = result.error.flatten().fieldErrors;
 *   setErrors({
 *     email: errors.email?.[0] || '',
 *     message: errors.message?.[0] || '',
 *   });
 * }
 * ```
 */
export function validateFeedbackForm(data: unknown) {
  return FeedbackFormSchema.safeParse(data);
}

/**
 * Category filter validation schema
 *
 * Used by CategoryFilter.tsx to validate selected category
 * Currently simple but can be extended for more complex filtering
 *
 * @example
 * ```typescript
 * const result = validateCategoryFilter({ selectedCategory: 'tax-basics' });
 * ```
 */
export const CategoryFilterSchema = z.object({
  /** Optional category slug, undefined means "All Posts" */
  selectedCategory: z.string().optional(),
});

/**
 * Type inferred from CategoryFilterSchema
 */
export type CategoryFilterData = z.infer<typeof CategoryFilterSchema>;

/**
 * Helper function to validate category filter data
 *
 * @param data - The filter data to validate
 * @returns Zod SafeParseReturnType with success/error information
 */
export function validateCategoryFilter(data: unknown) {
  return CategoryFilterSchema.safeParse(data);
}
