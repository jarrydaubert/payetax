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

  it.each([
    [25_000, 2_446, 2_486, -40],
    [35_000, 4_501, 4_486, 15],
    [50_000, 8_982, 7_486, 1_496],
    [75_000, 19_482, 17_432, 2_050],
    [100_000, 30_732, 27_432, 3_300],
    [150_000, 59_634, 53_703, 5_931],
  ])('reproduces the independently worked 2026/27 comparison at £%i', (salary, scottishTax, rukTax, difference) => {
    // Independent fixtures use the published Scottish and rUK taxable-band widths.
    // At £150k, for example:
    // Scotland = 3,967×19% + 12,989×20% + 14,136×21% + 31,338×42%
    //          + 62,710×45% + 24,860×48% = £59,634.35.
    // rUK = 37,700×20% + 87,440×40% + 24,860×45% = £53,703.00.
    expect(calculateAnnualIncomeTaxComparison(salary, '2026-2027')).toEqual({
      scottishTax,
      rukTax,
      difference,
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
