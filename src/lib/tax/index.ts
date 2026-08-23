/**
 * Supported public interface for PayeTax tax-domain consumers.
 *
 * Application code should import tax calculations, parser behaviour and policy
 * reads from this module. Decoder-only presentation lives in
 * `@/lib/tax-code-decoder` so it is not bundled with every calculator route.
 */

export type { NICategory, TaxYear } from '@/constants/taxRates';
export {
  CURRENT_TAX_YEAR,
  formatTaxYearDisplay,
  SCOTTISH_TAX_RATES,
  TAX_RATES,
  TAX_YEAR_SOURCES,
  TAX_YEARS,
} from '@/constants/taxRates';
export type { TaxCalculationInput, TaxCalculationResults } from '@/lib/taxCalculator';
export { calculateTax } from '@/lib/taxCalculator';
export type { EmployeeNIResult } from './employeeNI';
export { calculateEmployeeNI, getEmployeeNI } from './employeeNI';
export type { EmployerNIResult } from './employerNI';
export {
  calculateEmployerNI,
  getEmployerNI,
  getEmployerNIRate,
  getEmployerNIThreshold,
} from './employerNI';
export type { IncomeTaxResult } from './incomeTax';
export { calculateIncomeTax } from './incomeTax';
export type {
  Class1EmployeeBands,
  Class1EmployeeCalculation,
  Class1EmployerBands,
  Class1EmployerCalculation,
  Class1PeriodThresholds,
  Class1RateSegment,
  Class1Slice,
} from './nationalInsurance';
export {
  getClass1PeriodThresholds,
  getDirectorsAnnualPrimaryRate,
  getEmployeeClass1MonthSegments,
  getEmployeeClass1RateForPayDate,
  getPayDateForTaxPeriod,
  isEmployeeNIExempt,
  STATE_PENSION_AGE_NI_EXEMPTION,
  sliceClass1EmployeeEarnings,
  sliceClass1EmployerEarnings,
} from './nationalInsurance';
export type {
  RukTaxableIncomeBand,
  RukTaxBandCalculation,
  RukTaxBandSlice,
} from './rukIncomeTax';
export { sliceRukTaxableIncome } from './rukIncomeTax';
export type {
  ScottishTaxableIncomeBand,
  ScottishTaxBandCalculation,
  ScottishTaxBandSlice,
} from './scottishIncomeTax';
export { sliceScottishTaxableIncome } from './scottishIncomeTax';
export type {
  TaxCodeBandOverride,
  TaxCodeClassification,
  TaxCodeNonCumulativeMarker,
  TaxCodeParseResult,
  TaxCodePrefix,
  TaxCodeRegion,
} from './taxCode';
export {
  getMonthlyKCodeAdditionalPay,
  getTaxCodeRegionOverride,
  hasNonCumulativeTaxCodeMarker,
  isTaxCodeEditCandidate,
  isValidTaxCode,
  normalizeTaxCode,
  parseTaxCode,
  TAX_CODE_MAX_LENGTH,
  TAX_CODE_NON_CUMULATIVE_MARKERS,
} from './taxCode';
export type { RukTaxPolicy, ScottishTaxPolicy, SelectedTaxPolicy } from './taxPolicy';
export { parseSupportedTaxYear, resolveTaxYear, selectTaxPolicy } from './taxPolicy';
export { roundToPence, taxableThresholdToTotalIncome } from './utils';
