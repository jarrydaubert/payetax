/**
 * Supported public interface for PayeTax tax-domain consumers.
 *
 * Application code should import tax calculations, decoder behaviour and policy
 * reads from this module. The implementation remains in its existing files while
 * the domain is migrated one vertical at a time.
 */

export type { TaxYear } from '@/constants/taxRates';
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
export type { TaxCodeDecoded } from '@/lib/taxCodeDecoder';
export { decodeTaxCode, formatAllowance } from '@/lib/taxCodeDecoder';
export type { IncomeTaxResult } from './incomeTax';
export { calculateIncomeTax } from './incomeTax';
export type {
  ScottishTaxableIncomeBand,
  ScottishTaxBandCalculation,
  ScottishTaxBandSlice,
} from './scottishIncomeTax';
export { sliceScottishTaxableIncome } from './scottishIncomeTax';
export { taxableThresholdToTotalIncome } from './utils';
