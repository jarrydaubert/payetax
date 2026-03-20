/**
 * Explicit entrypoint for calculator-specific validation schemas.
 *
 * This avoids the ambiguous `@/lib/validation` import path, which collides with
 * the validation barrel directory used by shared UI and API schemas.
 */
export {
  BooleanSchema,
  ComparisonValueSchema,
  NICategorySchema,
  PensionContributionTypeSchema,
  WhatIfTypeSchema,
  WhatIfValueSchema,
} from './validation';
