import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const digitStripping = /\.replace(?:All)?\(\s*\/(?:\[\^(?:\\d|0-9)\.?\]|\\D)\/g\s*,\s*(?:''|"")/;

describe('tool salary parsing guard', () => {
  it('recognizes the old parser and allows ordinary numeric conversions', () => {
    expect(String.raw`Number(salary.replace(/[^\d]/g, ''))`).toMatch(digitStripping);
    expect(String.raw`Number(salary.replace(/[^\d.]/g, ''))`).toMatch(digitStripping);
    expect('Number(taxYear); parseFloat(rate);').not.toMatch(digitStripping);
  });

  it.each([
    'national-insurance-calculator/NICalculatorClient.tsx',
    'marriage-allowance-calculator/MarriageAllowanceClient.tsx',
  ])('does not strip non-digits from salary inputs in %s', (file) => {
    const source = readFileSync(resolve(__dirname, '..', file), 'utf8');
    expect(source.match(digitStripping)?.[0]).toBeUndefined();
  });
});
