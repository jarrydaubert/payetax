/**
 * Validation Schemas Barrel Export
 *
 * Central export point for all validation schemas.
 * Import from here to avoid duplicate imports and ensure consistency.
 *
 * @example
 * ```typescript
 * import { NumberInputSchema, FeedbackFormSchema } from '@/lib/validation/index';
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
// Director calculator validation
export {
  CALCULATION_MODES,
  type CalculationMode,
  CalculationModeSchema,
  CurrencyAmountSchema,
  DIRECTOR_TAX_YEARS,
  type DirectorCalculationResult,
  DirectorCalculationResultSchema,
  type DirectorInput,
  DirectorInputSchema,
  type DirectorResult,
  DirectorResultSchema,
  type DirectorTaxYear,
  DirectorTaxYearSchema,
  isNormalMode,
  isSurvivalMode,
  type PartialDirectorInput,
  PartialDirectorInputSchema,
  // Constants
  REGIONS,
  // Types
  type Region,
  // Schemas
  RegionSchema,
  type SurvivalResult,
  SurvivalResultSchema,
  validateCurrencyAmount,
  // Validation helpers
  validateDirectorInput,
  validatePartialDirectorInput,
  validateRegion,
  WARNING_TYPES,
  type Warning,
  WarningSchema,
  type WarningType,
  WarningTypeSchema,
} from './directorValidation';
// Email-related API validation
export {
  type DirectorEmailInput,
  DirectorEmailInputSchema,
  type DirectorStrategy,
  DirectorStrategySchema,
  EmailSchema,
  type PayeEmailInput,
  PayeEmailInputSchema,
  type PayeResults,
  PayeResultsSchema,
  type PayPeriodValues,
  PayPeriodValuesSchema,
  type SendDirectorResultsRequest,
  SendDirectorResultsRequestSchema,
  type SendResultsRequest,
  SendResultsRequestSchema,
  type TaxBand,
  TaxBandSchema,
  TaxYearStringSchema,
} from './emailValidation';
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
