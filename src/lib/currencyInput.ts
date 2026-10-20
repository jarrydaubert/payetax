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
  commas: 'Use commas only to separate thousands, like 1,234.56.',
  malformed: 'Enter an amount in pounds and pence, like 1,234.56.',
} as const;

const tooLargeError = (max: number) =>
  `Enter an amount no more than ${formatCurrencyInputValue(max)}.`;

export type CurrencyInputParseResult =
  | { status: 'empty' }
  | { status: 'valid'; value: number }
  | { status: 'invalid'; error: string };

interface ParseCurrencyInputOptions {
  /** Inclusive upper bound. Defaults to {@link CURRENCY_INPUT_MAX}. */
  max?: number;
}

// Hyphen-minus, Unicode minus and common dashes produced by paste or autocorrect.
const MINUS_SIGNS = '\\-\\u2212\\u2010\\u2011\\u2012\\u2013\\u2014';
const NEGATIVE_PATTERN = new RegExp(`^(?:[${MINUS_SIGNS}]\\s*£?|£\\s*[${MINUS_SIGNS}])\\s*[\\d.,]`);
const AMOUNT_PATTERN = /^(?<whole>\d+|\d{1,3}(?:,\d{3})+)?(?:\.(?<fraction>\d*))?$/;

/**
 * Parse currency text typed or pasted into an amount field.
 *
 * Accepted: `1234.56`, `1,234.56`, `£1,234.56`, `£ 1234`, `1234.`, `.5`, `1234.500`.
 * Rejected with a specific error: negative signs, more than two significant decimal places,
 * misplaced commas, any other characters, and amounts above `max`.
 */
export function parseCurrencyInput(
  text: string,
  { max = CURRENCY_INPUT_MAX }: ParseCurrencyInputOptions = {},
): CurrencyInputParseResult {
  const trimmed = text.trim();
  if (trimmed === '') return { status: 'empty' };

  if (NEGATIVE_PATTERN.test(trimmed)) {
    return { status: 'invalid', error: CURRENCY_INPUT_ERRORS.negative };
  }

  const body = trimmed.startsWith('£') ? trimmed.slice(1).trimStart() : trimmed;
  const match = AMOUNT_PATTERN.exec(body);
  const whole = match?.groups?.whole;
  const fraction = match?.groups?.fraction;

  if (!match || (whole === undefined && !fraction)) {
    const looksNumeric = /^[\d.,]+$/.test(body) && /\d/.test(body);
    return {
      status: 'invalid',
      error:
        looksNumeric && body.includes(',')
          ? CURRENCY_INPUT_ERRORS.commas
          : CURRENCY_INPUT_ERRORS.malformed,
    };
  }

  // Digits beyond pence are only unambiguous when they are trailing zeros (e.g. 1234.500).
  const significantFraction = (fraction ?? '').replace(/(?<=^\d{2})0+$/, '');
  if (significantFraction.length > 2) {
    return { status: 'invalid', error: CURRENCY_INPUT_ERRORS.decimals };
  }

  const value = Number(`${(whole ?? '0').replaceAll(',', '')}.${significantFraction || '0'}`);
  if (!Number.isFinite(value)) {
    return { status: 'invalid', error: CURRENCY_INPUT_ERRORS.malformed };
  }
  if (value > max) {
    return { status: 'invalid', error: tooLargeError(max) };
  }

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
