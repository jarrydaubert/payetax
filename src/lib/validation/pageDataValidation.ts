/**
 * Zod Validation Schemas for Page Data
 *
 * Provides runtime type safety for content arrays used across marketing/content pages.
 * Created as part of PAYTAX-109 to validate page data extracted from pages to constants.
 *
 * @module lib/validation/pageDataValidation
 */

import { z } from 'zod';

/**
 * Stat/Metric validation schema
 *
 * Used for stats grids across about, privacy, compliance pages.
 * Validates stat cards with icon, value, label, and optional metadata.
 *
 * @example
 * ```typescript
 * const stats = [
 *   { icon: Calculator, value: '100%', label: 'Free Forever', color: 'from-primary to-accent' },
 *   { icon: Lock, value: '0', label: 'Data Stored' },
 * ] satisfies z.infer<typeof StatSchema>[];
 * ```
 */
export const StatSchema = z.object({
  /** Lucide icon component */
  icon: z.any(), // LucideIcon type (function component)
  /** Stat value - number or string (e.g., "100%", "0", "<300kB") */
  value: z.string().or(z.number()),
  /** Label/description for the stat */
  label: z.string().min(1, 'Label is required').max(100, 'Label too long'),
  /** Optional longer description */
  description: z.string().max(500).optional(),
  /** Optional gradient color classes (e.g., "from-primary to-accent") */
  color: z.string().max(100).optional(),
});

/**
 * Type inferred from StatSchema
 */
export type StatData = z.infer<typeof StatSchema>;

/**
 * Helper to validate an array of stats
 *
 * @param data - Array of stats to validate
 * @returns Zod SafeParseReturnType with success/error information
 *
 * @example
 * ```typescript
 * const result = validateStats(ABOUT_STATS);
 * if (!result.success) {
 *   console.error(result.error.flatten());
 * }
 * ```
 */
export function validateStats(data: unknown) {
  return z.array(StatSchema).safeParse(data);
}

/**
 * Feature validation schema
 *
 * Used for feature showcases across about, privacy pages.
 * Validates feature cards with icon, title, description, and optional metadata.
 *
 * @example
 * ```typescript
 * const features = [
 *   {
 *     icon: Rocket,
 *     title: 'Blazing Fast',
 *     description: 'Sub-second page loads',
 *     metric: '<1.5s',
 *   },
 * ] satisfies z.infer<typeof FeatureSchema>[];
 * ```
 */
export const FeatureSchema = z.object({
  /** Lucide icon component */
  icon: z.any(),
  /** Feature title */
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  /** Feature description */
  description: z.string().min(10, 'Description too short').max(500, 'Description too long'),
  /** Optional metric/stat (e.g., "<1.5s", "95+", "60%") */
  metric: z.string().max(20).optional(),
  /** Optional link */
  link: z
    .object({
      text: z.string().min(1).max(100),
      href: z.string().url('Invalid URL').or(z.string().startsWith('/', 'Must be URL or path')),
    })
    .optional(),
  /** Optional gradient colors */
  gradient: z
    .object({
      bg: z.string().max(100),
      icon: z.string().max(100),
      border: z.string().max(100),
    })
    .optional(),
});

/**
 * Type inferred from FeatureSchema
 */
export type FeatureData = z.infer<typeof FeatureSchema>;

/**
 * Helper to validate an array of features
 */
export function validateFeatures(data: unknown) {
  return z.array(FeatureSchema).safeParse(data);
}

/**
 * Section Heading Badge validation schema
 *
 * Used for optional badges in section headings.
 *
 * @example
 * ```typescript
 * const badge = {
 *   text: 'New Feature',
 *   variant: 'default',
 * } satisfies z.infer<typeof SectionBadgeSchema>;
 * ```
 */
export const SectionBadgeSchema = z.object({
  /** Badge text content */
  text: z.string().min(1, 'Badge text is required').max(50, 'Badge text too long'),
  /** Badge variant */
  variant: z.enum(['default', 'secondary', 'destructive', 'outline']).optional(),
});

/**
 * Type inferred from SectionBadgeSchema
 */
export type SectionBadgeData = z.infer<typeof SectionBadgeSchema>;
