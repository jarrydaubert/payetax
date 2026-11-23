/**
 * Zod Validation Schemas for Director Calculator
 *
 * Provides runtime type validation for the "How Much Can I Pay Myself?" guide.
 * Ensures user inputs are valid before calculation.
 *
 * @module lib/validation/directorValidation
 * @see docs/business/DIRECTOR_INTELLIGENCE.md
 */

import { z } from 'zod';
import { TAX_YEARS, type TaxYear } from '@/lib/tax';

/**
 * Valid UK regions for tax calculation
 *
 * - 'scotland': Scottish income tax rates apply to salary
 * - 'rUK': Rest of UK (England, Wales, Northern Ireland) rates apply
 */
export const RegionSchema = z.enum(['scotland', 'rUK']);

/**
 * Valid tax years for calculation
 */
export const DIRECTOR_TAX_YEARS = TAX_YEARS.slice(0, 2) as [TaxYear, TaxYear];

export const DirectorTaxYearSchema = z.enum(DIRECTOR_TAX_YEARS);

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

export type Region = z.infer<typeof RegionSchema>;
