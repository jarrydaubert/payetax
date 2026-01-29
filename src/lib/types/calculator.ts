// src/lib/types/calculator.ts
/**
 * Shared types for calculator functionality.
 * Moved here to avoid circular dependencies between store and lib.
 */

import { z } from 'zod';
import { type PayPeriod, PERIODS } from '@/constants/taxRates';

/**
 * Represents an additional income source for multi-income calculations.
 * Used for pensioners and those with multiple income streams.
 */
export interface IncomeSource {
  /** Unique identifier for React keys and list management */
  id: string;
  /** Type of income (determines NI treatment) */
  type: 'employment' | 'pension' | 'statePension' | 'rental' | 'investment' | 'other';
  /** Optional user-friendly label (e.g., "Pension from Previous Job") */
  label?: string;
  /** Amount of income */
  amount: number;
  /** How often this income is received */
  period: PayPeriod;
}

/**
 * Human-readable labels for income types
 */
export const INCOME_TYPE_LABELS = {
  employment: 'Employment Income',
  pension: 'Private Pension',
  statePension: 'State Pension',
  rental: 'Rental Income',
  investment: 'Investment Income',
  other: 'Other Income',
} as const satisfies Record<IncomeSource['type'], string>;

/**
 * Income source type enum values for validation
 */
const INCOME_TYPES = [
  'employment',
  'pension',
  'statePension',
  'rental',
  'investment',
  'other',
] as const;

/**
 * Pay period values for validation (derived from PERIODS constant)
 */
const PAY_PERIOD_VALUES = Object.values(PERIODS) as [PayPeriod, ...PayPeriod[]];

/**
 * Zod schema for validating partial income source updates.
 * All fields are optional since this is used for partial updates.
 */
export const IncomeSourceUpdateSchema = z.object({
  type: z.enum(INCOME_TYPES).optional(),
  label: z.string().max(100, 'Label too long').optional(),
  amount: z.number().finite().nonnegative('Amount cannot be negative').optional(),
  period: z.enum(PAY_PERIOD_VALUES).optional(),
});
