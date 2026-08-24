import {
  CURRENT_SCOTTISH_TAX_CROSSOVER,
  calculateAnnualIncomeTaxComparison,
  formatAnnualSalaryInput,
  MAX_ANNUAL_SALARY,
  parseAnnualSalaryInput,
} from '../scottishTaxComparison';

describe('Scottish annual Income Tax comparison', () => {
  it.each([
    ['50000', 50_000],
    ['50,000', 50_000],
    ['50000.50', 50_000.5],
    ['50,000.50', 50_000.5],
    ['50000.5', 50_000.5],
    [' 50,000 ', 50_000],
    ['0', 0],
    ['0.00', 0],
    ['1', 1],
    ['0.01', 0.01],
    ['10,000,000', MAX_ANNUAL_SALARY],
    ['10,000,000.00', MAX_ANNUAL_SALARY],
  ])('accepts the documented salary format %s', (input, expected) => {
    expect(parseAnnualSalaryInput(input)).toEqual({ success: true, salary: expected });
  });

  it.each([
    '-50000',
    '+50000',
    '50000.500',
    '50000.',
    'salary',
    '£50,000',
    '£50,000.50',
    '50 000',
    '50,00',
    '50,00.50',
    '5,0000',
    '',
    '10,000,001',
    '10,000,000.01',
  ])('rejects malformed, signed or out-of-range input %s', (input) => {
    expect(parseAnnualSalaryInput(input).success).toBe(false);
  });

  it('formats accepted salaries like the main calculator when committed', () => {
    expect(formatAnnualSalaryInput(50_000)).toBe('50,000.00');
    expect(formatAnnualSalaryInput(50_000.5)).toBe('50,000.50');
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
