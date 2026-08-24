import {
  CURRENT_SCOTTISH_TAX_CROSSOVER,
  calculateAnnualIncomeTaxComparison,
  MAX_ANNUAL_SALARY,
  parseAnnualSalaryInput,
} from '../scottishTaxComparison';

describe('Scottish annual Income Tax comparison', () => {
  it.each([
    ['50000', 50_000],
    ['50,000', 50_000],
    [' 50,000 ', 50_000],
    ['1', 1],
    ['10,000,000', MAX_ANNUAL_SALARY],
  ])('accepts the documented whole-pound salary format %s', (input, expected) => {
    expect(parseAnnualSalaryInput(input)).toEqual({ success: true, salary: expected });
  });

  it.each([
    '-50000',
    '+50000',
    '50000.50',
    'salary',
    '£50,000',
    '50 000',
    '50,00',
    '5,0000',
    '0',
    '',
    '10,000,001',
  ])('rejects malformed, non-positive or out-of-range input %s', (input) => {
    expect(parseAnnualSalaryInput(input).success).toBe(false);
  });

  it('reproduces the independently worked £50,000 comparison', () => {
    // 2026/27 official bands, before rounding:
    // Scotland = 3,967×19% + 12,989×20% + 14,136×21% + 6,338×42% = £8,982.05.
    // rUK = 37,430×20% = £7,486.00.
    expect(calculateAnnualIncomeTaxComparison(50_000)).toEqual({
      scottishTax: 8_982,
      rukTax: 7_486,
      difference: 1_496,
    });
  });

  it('derives the independently worked 2026/27 crossover', () => {
    // At £29,526 gross, Scotland is £39.67 lower: 3,967×19% + 12,989×20%
    // versus 16,956×20% in rUK. Scotland then charges 21% versus 20%, so the
    // £39.67 closes over £3,967: £29,526 + £3,967 = £33,493.
    const independentlyDerivedCrossover = 29_526 + 3_967;

    expect(CURRENT_SCOTTISH_TAX_CROSSOVER).toBe(independentlyDerivedCrossover);
  });
});
