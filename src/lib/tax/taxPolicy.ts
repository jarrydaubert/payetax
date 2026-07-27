/**
 * Supported tax-policy selection boundary.
 *
 * One place resolves "which supported tax year and policy applies" for runtime
 * consumers. It normalises the accepted year forms, validates against the
 * supported set, applies the PAYE engine's current-year fallback, and hands back
 * both the rUK and Scottish annual policy records together with the canonical
 * tax year actually selected.
 *
 * Intra-year effective-dated NI rate selection is deliberately NOT handled here;
 * it stays delegated to the mechanics in `./nationalInsurance.ts`. This module is
 * a small selector over the existing policy records — not a rules engine.
 */

import {
  CURRENT_TAX_YEAR,
  SCOTTISH_TAX_RATES,
  TAX_RATES,
  type TaxYear,
} from '@/constants/taxRates';

/** rUK (England/Wales/NI) annual policy record for a supported tax year. */
export type RukTaxPolicy = (typeof TAX_RATES)[TaxYear];

/** Scottish annual policy record for a supported tax year. */
export type ScottishTaxPolicy = (typeof SCOTTISH_TAX_RATES)[TaxYear];

export interface SelectedTaxPolicy {
  /** The canonical supported tax year actually selected. */
  taxYear: TaxYear;
  /** rUK (England/Wales/NI) annual policy record. */
  ruk: RukTaxPolicy;
  /** Scottish annual policy record. */
  scottish: ScottishTaxPolicy;
}

/**
 * Normalise an accepted tax-year string to a supported canonical `TaxYear`, or
 * `null` when it is missing, malformed, or not a supported year.
 *
 * Accepts the canonical long form (`"2026-2027"`) and the short form
 * (`"2026-27"`). No fallback is applied — callers that need the engine's
 * current-year fallback use {@link resolveTaxYear} or {@link selectTaxPolicy};
 * callers that must reject an unsupported year branch on the `null` miss.
 */
export function parseSupportedTaxYear(value: string | null | undefined): TaxYear | null {
  if (typeof value !== 'string') {
    return null;
  }

  const [start, endRaw] = value.split('-');
  if (!(start && endRaw)) {
    return null;
  }

  const normalizedEnd = endRaw.length === 2 ? `20${endRaw}` : endRaw;
  const normalizedTaxYear = `${start}-${normalizedEnd}`;

  return normalizedTaxYear in TAX_RATES ? (normalizedTaxYear as TaxYear) : null;
}

/**
 * Resolve an accepted tax-year string to a supported canonical `TaxYear`,
 * falling back to {@link CURRENT_TAX_YEAR} for missing, malformed, or unsupported
 * values. This is the main PAYE engine's fallback behaviour.
 */
export function resolveTaxYear(value?: string | null): TaxYear {
  return parseSupportedTaxYear(value) ?? CURRENT_TAX_YEAR;
}

/**
 * Select the applicable supported tax policy: the canonical tax year actually
 * selected plus both the rUK and Scottish annual policy records. Applies the
 * engine's current-year fallback for missing, malformed, or unsupported input.
 */
export function selectTaxPolicy(requestedTaxYear?: string | null): SelectedTaxPolicy {
  const taxYear = resolveTaxYear(requestedTaxYear);
  return {
    taxYear,
    ruk: TAX_RATES[taxYear],
    scottish: SCOTTISH_TAX_RATES[taxYear],
  };
}
