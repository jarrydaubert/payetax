import {
  CURRENT_TAX_YEAR,
  SCOTTISH_TAX_RATES,
  TAX_RATES,
  TAX_YEARS,
  type TaxYear,
} from '@/constants/taxRates';
import { parseSupportedTaxYear, resolveTaxYear, selectTaxPolicy } from '../taxPolicy';

/**
 * Pre-refactor normaliser lifted verbatim from `taxCalculator.ts` (the historical
 * `resolveSupportedTaxYear`). The selector must match it exactly so extracting the
 * boundary changed no runtime behaviour — including its lenient, split-based
 * parsing (extra hyphen segments are ignored rather than rejected).
 */
function legacyResolveSupportedTaxYear(taxYear: string | undefined): TaxYear {
  if (typeof taxYear !== 'string') {
    return CURRENT_TAX_YEAR;
  }
  const [start, endRaw] = taxYear.split('-');
  if (!(start && endRaw)) {
    return CURRENT_TAX_YEAR;
  }
  const normalizedEnd = endRaw.length === 2 ? `20${endRaw}` : endRaw;
  const normalizedTaxYear = `${start}-${normalizedEnd}`;
  return normalizedTaxYear in TAX_RATES ? (normalizedTaxYear as TaxYear) : CURRENT_TAX_YEAR;
}

describe('tax-policy selector', () => {
  describe('policy-map invariant', () => {
    it('has both an rUK and a Scottish record for every supported canonical year', () => {
      expect(TAX_YEARS.length).toBeGreaterThan(0);
      for (const year of TAX_YEARS) {
        expect(TAX_RATES[year]).toBeDefined();
        expect(SCOTTISH_TAX_RATES[year]).toBeDefined();

        const policy = selectTaxPolicy(year);
        expect(policy.taxYear).toBe(year);
        // rUK and Scottish records are selected together, from the same year.
        expect(policy.ruk).toBe(TAX_RATES[year]);
        expect(policy.scottish).toBe(SCOTTISH_TAX_RATES[year]);
      }
    });
  });

  describe('parseSupportedTaxYear', () => {
    it('accepts every supported canonical (long) year', () => {
      for (const year of TAX_YEARS) {
        expect(parseSupportedTaxYear(year)).toBe(year);
      }
    });

    it.each([
      ['2026-27', '2026-2027'],
      ['2025-26', '2025-2026'],
      ['2024-25', '2024-2025'],
      ['2023-24', '2023-2024'],
    ])('normalises the accepted short form %s -> %s', (short, expected) => {
      expect(parseSupportedTaxYear(short)).toBe(expected);
    });

    it.each([
      undefined,
      null,
      '',
      '2026',
      'garbage',
      '20xx-yy',
      'not-a-year',
    ])('returns null for missing/malformed input: %p', (value) => {
      expect(parseSupportedTaxYear(value as string | null | undefined)).toBeNull();
    });

    it.each([
      '2027-2028',
      '2019-2020',
      '2022-2023',
    ])('returns null for an unsupported year: %s', (value) => {
      expect(parseSupportedTaxYear(value)).toBeNull();
    });

    it('pins the historical lenient parsing (extra hyphen segments are ignored)', () => {
      // Documented behaviour carried over from the PAYE engine's split-based
      // normaliser. Tightening this is a deliberate future follow-up, not part of
      // this consolidation slice.
      expect(parseSupportedTaxYear('2026-2027-extra')).toBe('2026-2027');
    });
  });

  describe('resolveTaxYear', () => {
    it('falls back to the current supported year for missing/malformed/unsupported input', () => {
      for (const value of [undefined, null, '', 'garbage', '2027-2028', '2019-2020']) {
        expect(resolveTaxYear(value as string | null | undefined)).toBe(CURRENT_TAX_YEAR);
      }
    });

    it('returns the canonical year for supported long and short forms', () => {
      expect(resolveTaxYear('2025-2026')).toBe('2025-2026');
      expect(resolveTaxYear('2025-26')).toBe('2025-2026');
    });

    it('matches the pre-refactor engine normaliser across a full input matrix (old-vs-new parity)', () => {
      const inputs: (string | undefined)[] = [
        undefined,
        '',
        'garbage',
        '2026',
        '20xx-yy',
        '2026-2027-extra',
        // Supported long + short forms.
        ...TAX_YEARS,
        ...TAX_YEARS.map((year) => `${year.slice(0, 4)}-${year.slice(-2)}`),
        // Unsupported years.
        '2027-2028',
        '2019-2020',
        '2022-2023',
        '2022-23',
      ];

      for (const input of inputs) {
        expect(resolveTaxYear(input)).toBe(legacyResolveSupportedTaxYear(input));
      }
    });
  });

  describe('selectTaxPolicy', () => {
    it('exposes the canonical year that produced the returned records', () => {
      const policy = selectTaxPolicy('2024-25');
      expect(policy.taxYear).toBe('2024-2025');
      expect(policy.ruk).toBe(TAX_RATES['2024-2025']);
      expect(policy.scottish).toBe(SCOTTISH_TAX_RATES['2024-2025']);
    });

    it('applies the current-year fallback for unsupported input', () => {
      const policy = selectTaxPolicy('2099-2100');
      expect(policy.taxYear).toBe(CURRENT_TAX_YEAR);
      expect(policy.ruk).toBe(TAX_RATES[CURRENT_TAX_YEAR]);
      expect(policy.scottish).toBe(SCOTTISH_TAX_RATES[CURRENT_TAX_YEAR]);
    });

    it('defaults to the current supported year when no argument is given', () => {
      expect(selectTaxPolicy().taxYear).toBe(CURRENT_TAX_YEAR);
    });
  });
});
