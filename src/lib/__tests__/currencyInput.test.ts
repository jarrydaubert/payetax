import {
  CURRENCY_INPUT_ERRORS,
  CURRENCY_INPUT_MAX,
  formatCurrencyInputValue,
  parseCurrencyInput,
} from '@/lib/currencyInput';

// Non-breaking space, as pasted from spreadsheets and web pages.
const NBSP = String.fromCodePoint(0xa0);

describe('parseCurrencyInput', () => {
  it.each([
    ['1234.56', 1234.56],
    ['1,234.56', 1234.56],
    ['£1,234.56', 1234.56],
    ['  £ 1,234.56 ', 1234.56],
    [`£${NBSP}1234.56${NBSP}`, 1234.56],
    ['1234', 1234],
    ['1,234,567', 1234567],
    ['£0', 0],
    ['0.01', 0.01],
    ['.5', 0.5],
    ['1234.', 1234],
    ['1234.5', 1234.5],
    ['1234.500', 1234.5],
    ['007', 7],
    ['100000000', CURRENCY_INPUT_MAX],
  ])('accepts %j as %d', (text, expected) => {
    expect(parseCurrencyInput(text)).toEqual({ status: 'valid', value: expected });
  });

  it('keeps pence exactly rather than scaling the amount', () => {
    const result = parseCurrencyInput('1234.56');
    expect(result).toEqual({ status: 'valid', value: 1234.56 });
    expect(result).not.toEqual({ status: 'valid', value: 123456 });
  });

  it.each(['', '   ', NBSP])('reports %j as empty, not zero', (text) => {
    expect(parseCurrencyInput(text)).toEqual({ status: 'empty' });
  });

  it.each([
    '-500',
    '−500',
    '–500',
    '-£500',
    '£-500',
    '£ - 1,234.56',
    '- 0.5',
  ])('rejects negative %j with a specific message', (text) => {
    expect(parseCurrencyInput(text)).toEqual({
      status: 'invalid',
      error: CURRENCY_INPUT_ERRORS.negative,
    });
  });

  it.each([
    '1234.567',
    '0.001',
    '1,234.5601',
  ])('rejects %j with more than 2 pence digits', (text) => {
    expect(parseCurrencyInput(text)).toEqual({
      status: 'invalid',
      error: CURRENCY_INPUT_ERRORS.decimals,
    });
  });

  it.each([
    '1,23',
    '12,34.56',
    '1,2345',
    '1,,234',
    '1.234,56',
    ',123',
    '1,234,',
  ])('rejects misplaced commas in %j', (text) => {
    expect(parseCurrencyInput(text)).toEqual({
      status: 'invalid',
      error: CURRENCY_INPUT_ERRORS.commas,
    });
  });

  it.each([
    'abc',
    '12a',
    '$100',
    '1e5',
    '1 234',
    '+500',
    '12-3',
    '£',
    '.',
    '£.',
    '(500)',
    '1..2',
  ])('rejects malformed %j', (text) => {
    expect(parseCurrencyInput(text)).toEqual({
      status: 'invalid',
      error: CURRENCY_INPUT_ERRORS.malformed,
    });
  });

  it('rejects amounts above the maximum with the limit in the message', () => {
    expect(parseCurrencyInput('100000000.01')).toEqual({
      status: 'invalid',
      error: 'Enter an amount no more than £100,000,000.',
    });
    expect(parseCurrencyInput('5,000.01', { max: 5000 })).toEqual({
      status: 'invalid',
      error: 'Enter an amount no more than £5,000.',
    });
  });
});

describe('formatCurrencyInputValue', () => {
  it.each([
    [undefined, ''],
    [0, '£0'],
    [1234, '£1,234'],
    [1234.5, '£1,234.50'],
    [1234.56, '£1,234.56'],
    [0.01, '£0.01'],
  ])('formats %p as %j', (value, expected) => {
    expect(formatCurrencyInputValue(value)).toBe(expected);
  });

  it('round-trips through the parser', () => {
    for (const value of [0, 0.01, 999.99, 1234.56, 12345678.9]) {
      expect(parseCurrencyInput(formatCurrencyInputValue(value))).toEqual({
        status: 'valid',
        value,
      });
    }
  });
});
