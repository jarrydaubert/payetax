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
