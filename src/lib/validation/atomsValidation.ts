/**
 * Zod Validation Schemas for Atoms Components
 *
 * Provides runtime type validation for component props and user inputs
 * across the atoms layer, ensuring data integrity and preventing invalid states.
 *
 * @module lib/validation/atomsValidation
 */

import { z } from 'zod';
import { TAX_YEARS } from '@/constants/taxRates';

/**
 * Number Input Validation
 *
 * Validates numeric inputs with configurable min/max bounds
 */
export const NumberInputSchema = z.object({
  value: z
    .number()
    .finite('Value must be a valid number')
    .nonnegative('Value must be non-negative')
    .max(100_000_000, 'Value exceeds maximum limit'),
  decimals: z.number().int().min(0).max(4).optional(),
});

/**
 * Salary-specific validation (stricter bounds)
 */
export const SalaryInputSchema = z.object({
  value: z
    .number()
    .finite('Salary must be a valid number')
    .nonnegative('Salary must be non-negative')
    .max(10_000_000, 'Salary exceeds maximum limit (£10M)'),
});

/**
 * Pension contribution validation (percentage)
 */
export const PensionPercentageSchema = z.object({
  value: z
    .number()
    .finite('Pension percentage must be a valid number')
    .nonnegative('Pension percentage must be non-negative')
    .max(100, 'Pension percentage cannot exceed 100%'),
});

/**
 * Tax Year Selection Validation
 *
 * Validates that the selected tax year is one of the valid options
 */
export const TaxYearSchema = z.enum(TAX_YEARS as [string, ...string[]]);

/**
 * Period Checkbox Validation
 *
 * Validates period selection strings
 */
export const PeriodSchema = z.enum(['Annually', 'Monthly', 'Weekly', 'Daily']);

/**
 * Type exports for use in components
 */
export type NumberInputValues = z.infer<typeof NumberInputSchema>;
export type SalaryInputValues = z.infer<typeof SalaryInputSchema>;
export type PensionPercentageValues = z.infer<typeof PensionPercentageSchema>;
export type TaxYearValue = z.infer<typeof TaxYearSchema>;
export type PeriodValue = z.infer<typeof PeriodSchema>;

/**
 * Validation helper functions
 */

/**
 * Safely validates a salary input value
 * @param value - The salary value to validate
 * @returns Validation result with success flag and data/error
 */
export function validateSalary(value: number) {
  return SalaryInputSchema.shape.value.safeParse(value);
}

/**
 * Safely validates a tax year selection
 * @param taxYear - The tax year string to validate
 * @returns Validation result with success flag and data/error
 */
export function validateTaxYear(taxYear: string) {
  return TaxYearSchema.safeParse(taxYear);
}

/**
 * Safely validates a pension percentage
 * @param value - The pension percentage to validate
 * @returns Validation result with success flag and data/error
 */
export function validatePensionPercentage(value: number) {
  return PensionPercentageSchema.shape.value.safeParse(value);
}

/**
 * Safely validates a period selection
 * @param period - The period string to validate
 * @returns Validation result with success flag and data/error
 */
export function validatePeriod(period: string) {
  return PeriodSchema.safeParse(period);
}
