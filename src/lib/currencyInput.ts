/**
 * Currency text-input parsing and formatting.
 *
 * Separates what a person types from the amount it represents. Accepts unambiguous pounds and
 * pence, thousands commas and a pasted `£`; rejects negative, malformed and over-limit text with a
 * specific message instead of silently producing another amount. Empty text is reported as
 * `empty`, never as zero, so callers decide what an empty field means.
 *
 * @module lib/currencyInput
 */

/** Largest amount a currency field accepts (matches `CurrencyAmountSchema`). */
export const CURRENCY_INPUT_MAX = 100_000_000;

export const CURRENCY_INPUT_ERRORS = {
  negative: 'Enter an amount of £0 or more. Negative amounts are not supported.',
  decimals: 'Enter pence using no more than 2 decimal places, like 1,234.56.',
  wholePounds: 'Enter whole pounds without pence, like 1,234.',
  commas: 'Use commas only to separate thousands, like 1,234.56.',
  malformed: 'Enter an amount in pounds and pence, like 1,234.56.',
} as const;

/** Messages for a field whose unit is a percentage (e.g. a pension contribution rate). */
export const PERCENTAGE_INPUT_ERRORS = {
  negative: 'Enter a percentage of 0% or more. Negative percentages are not supported.',
  decimals: 'Enter a percentage with no more than 2 decimal places, like 5.25.',
  wholePercent: 'Enter a whole percentage, like 5.',
  malformed: 'Enter a percentage, like 5.25.',
} as const;

export type CurrencyInputParseResult =
  | { status: 'empty' }
  | { status: 'valid'; value: number }
  | { status: 'invalid'; error: string };

/** What the amount measures: pounds (the default) or a percentage. */
export type CurrencyInputUnit = 'pounds' | 'percent';

interface ParseCurrencyInputOptions {
  /** Inclusive upper bound. Defaults to {@link CURRENCY_INPUT_MAX}. */
  max?: number;
  /**
   * `percent` accepts one trailing `%`, rejects `£` and words its messages as a percentage.
   * Defaults to `pounds`.
   */
  unit?: CurrencyInputUnit;
  /**
   * Significant decimal places accepted: 2 (pence, the default) or 0 (whole units only). Text with
   * more is rejected rather than rounded, so an amount is never silently changed.
   */
  decimals?: 0 | 2;
}

type InvalidReason = 'negative' | 'decimals' | 'commas' | 'malformed' | 'tooLarge';

function invalidMessage(
  reason: InvalidReason,
  unit: CurrencyInputUnit,
  decimals: 0 | 2,
  max: number,
): string {
  if (unit === 'percent') {
    switch (reason) {
      case 'negative':
        return PERCENTAGE_INPUT_ERRORS.negative;
      case 'decimals':
        return decimals === 0
          ? PERCENTAGE_INPUT_ERRORS.wholePercent
          : PERCENTAGE_INPUT_ERRORS.decimals;
      case 'tooLarge':
        return `Enter a percentage no more than ${max.toLocaleString('en-GB')}%.`;
      default:
        return PERCENTAGE_INPUT_ERRORS.malformed;
    }
  }
  switch (reason) {
    case 'negative':
      return CURRENCY_INPUT_ERRORS.negative;
    case 'decimals':
      return decimals === 0 ? CURRENCY_INPUT_ERRORS.wholePounds : CURRENCY_INPUT_ERRORS.decimals;
    case 'commas':
      return CURRENCY_INPUT_ERRORS.commas;
    case 'tooLarge':
      return `Enter an amount no more than ${formatCurrencyInputValue(max)}.`;
    default:
      return CURRENCY_INPUT_ERRORS.malformed;
  }
}

// Hyphen-minus, Unicode minus and common dashes produced by paste or autocorrect.
const MINUS_SIGNS = '\\-\\u2212\\u2010\\u2011\\u2012\\u2013\\u2014';
const NEGATIVE_PATTERN = new RegExp(`^(?:[${MINUS_SIGNS}]\\s*£?|£\\s*[${MINUS_SIGNS}])\\s*[\\d.,]`);
const AMOUNT_PATTERN = /^(?<whole>\d+|\d{1,3}(?:,\d{3})+)?(?:\.(?<fraction>\d*))?$/;

/**
 * Parse currency text typed or pasted into an amount field.
 *
 * Accepted: `1234.56`, `1,234.56`, `£1,234.56`, `£ 1234`, `1234.`, `.5`, `1234.500`.
 * Rejected with a specific error: negative signs, more significant decimal places than
 * `decimals`, misplaced commas, any other characters, and amounts above `max`.
 * With `unit: 'percent'`, `5.25%` is accepted and `£` is rejected.
 */
export function parseCurrencyInput(
  text: string,
  { max = CURRENCY_INPUT_MAX, unit = 'pounds', decimals = 2 }: ParseCurrencyInputOptions = {},
): CurrencyInputParseResult {
  const invalid = (reason: InvalidReason): CurrencyInputParseResult => ({
    status: 'invalid',
    error: invalidMessage(reason, unit, decimals, max),
  });

  const trimmed = text.trim();
  if (trimmed === '') return { status: 'empty' };

  if (NEGATIVE_PATTERN.test(trimmed)) return invalid('negative');

  let body: string;
  if (unit === 'percent') {
    if (trimmed.includes('£')) return invalid('malformed');
    body = trimmed.endsWith('%') ? trimmed.slice(0, -1).trimEnd() : trimmed;
  } else {
    body = trimmed.startsWith('£') ? trimmed.slice(1).trimStart() : trimmed;
  }
  const match = AMOUNT_PATTERN.exec(body);
  const whole = match?.groups?.whole;
  const fraction = match?.groups?.fraction;

  if (!match || (whole === undefined && !fraction)) {
    const looksNumeric = /^[\d.,]+$/.test(body) && /\d/.test(body);
    return invalid(looksNumeric && body.includes(',') ? 'commas' : 'malformed');
  }

  // Digits beyond those allowed are only unambiguous when they are trailing zeros
  // (e.g. 1234.500, or 1234.00 in a whole-pounds field).
  const significantFraction = (fraction ?? '').replace(/0+$/, '');
  if (significantFraction.length > decimals) return invalid('decimals');

  const value = Number(`${(whole ?? '0').replaceAll(',', '')}.${significantFraction || '0'}`);
  if (!Number.isFinite(value)) return invalid('malformed');
  if (value > max) return invalid('tooLarge');

  return { status: 'valid', value };
}

/**
 * Format an amount for display in a currency field when it is not being edited.
 * Whole pounds show no pence (`£1,234`); amounts with pence always show two places (`£1,234.50`).
 * `undefined` formats as empty text so an empty field stays distinct from £0.
 */
export function formatCurrencyInputValue(value: number | undefined): string {
  if (value === undefined) return '';
  const hasPence = !Number.isInteger(value);
  return `£${value.toLocaleString('en-GB', {
    minimumFractionDigits: hasPence ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format an amount as plain editable text for a focused field: no `£`, no thousands commas
 * (`£30,000` → `30000`, `£1,234.50` → `1234.50`). Adding or deleting digits in this text can never
 * produce misplaced commas.
 */
export function formatCurrencyInputEditText(value: number | undefined): string {
  if (value === undefined) return '';
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

/**
 * Map a caret position in display text (`£1,234.50`) to the same place in its edit text
 * (`1234.50`): the caret stays after the same number of digits and decimal points.
 */
export function mapCaretToEditText(displayText: string, caret: number): number {
  return displayText.slice(0, caret).replace(/[^\d.]/g, '').length;
}
