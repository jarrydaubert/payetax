/**
 * Public decoder-only interface. Keeping explanatory prose out of the main tax
 * barrel prevents calculator routes from downloading content used only by the
 * tax-code decoder.
 */

export { CURRENT_TAX_YEAR_DISPLAY } from '@/constants/taxRates';
export { normalizeTaxCode, TAX_CODE_MAX_LENGTH } from './tax/taxCode';
export type { TaxCodeDecoded, TaxCodeReferenceEntry } from './tax/taxCodeDecoder';
export {
  decodeTaxCode,
  formatTaxCodeAmount,
  TAX_CODE_REFERENCE_ENTRIES,
} from './tax/taxCodeDecoder';
