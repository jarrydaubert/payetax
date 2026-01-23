/**
 * Validation Schemas Barrel Export
 *
 * Central export point for all validation schemas.
 * Import from here to avoid duplicate imports and ensure consistency.
 *
 * @example
 * ```typescript
 * import { NumberInputSchema, FeedbackFormSchema, TaxCodeSchema } from '@/lib/validation';
 * ```
 */

// Atoms layer validation (numeric inputs, tax year, periods)
export {
  NumberInputSchema,
  type NumberInputValues,
  PensionPercentageSchema,
  type PensionPercentageValues,
  PeriodSchema,
  type PeriodValue,
  SalaryInputSchema,
  type SalaryInputValues,
  TaxYearSchema,
  type TaxYearValue,
  validatePensionPercentage,
  validatePeriod,
  validateSalary,
  validateTaxYear,
} from './atomsValidation';
// Molecules layer validation (feedback forms, filters)
export {
  type CategoryFilterData,
  CategoryFilterSchema,
  type FeedbackFormData,
  FeedbackFormSchema,
  validateCategoryFilter,
  validateFeedbackForm,
} from './moleculesValidation';
// Page data validation
export * from './pageDataValidation';
// UI component validation (forms, inputs, checkboxes)
export {
  type BoundedNumberInputData,
  BoundedNumberInputSchema,
  type CheckboxData,
  CheckboxSchema,
  type CookieConsentData,
  CookieConsentSchema,
  type EmailInputData,
  EmailInputSchema,
  SelectInputSchema,
  type TextAreaData,
  TextAreaSchema,
  type TextInputData,
  TextInputSchema,
  validateCookieConsent,
  validateEmail,
  validateNumber,
  validateRequiredCheckbox,
  validateSelect,
  validateTextInput,
} from './uiValidation';
