import {
  decodeTaxCode,
  formatTaxCodeAmount,
  TAX_CODE_REFERENCE_ENTRIES,
} from '@/lib/tax-code-decoder';

describe('tax-code decoder semantics', () => {
  it.each(['', '   '])('handles empty input %j without presenting a result', (code) => {
    expect(decodeTaxCode(code)).toEqual(
      expect.objectContaining({
        isValid: false,
        meaning: 'No tax code provided',
        amount: null,
        isScottish: false,
        isWelsh: false,
        isEmergency: false,
      }),
    );
  });

  it('describes a numeric code as HMRC-assigned tax-free income for this source', () => {
    const result = decodeTaxCode('1000L');

    expect(result).toEqual(
      expect.objectContaining({
        isValid: true,
        taxFreeAmount: 10_000,
        amountLabel: 'Tax-free amount from this source',
        amount: 10_000,
      }),
    );
    expect(result.details.join(' ')).toContain('tax-free income from this employment or pension');
    expect(result.details.join(' ')).not.toContain('Your Personal Allowance is');
  });

  it.each([
    ['1383M', 'Marriage Allowance received'],
    ['1131N', 'Marriage Allowance transferred'],
  ] as const)('does not apply contradictory arithmetic to %s', (code, meaning) => {
    const result = decodeTaxCode(code);

    expect(result.meaning).toBe(meaning);
    expect(result.details.join(' ')).toContain('already reflects HMRC');
    expect(result.details.join(' ')).not.toContain('£1,260');
  });

  it('presents K475 as an amount added to taxable pay with the deduction restriction', () => {
    const result = decodeTaxCode('K475');

    expect(result).toEqual(
      expect.objectContaining({
        isValid: true,
        taxFreeAmount: null,
        kAdjustment: 4_750,
        amountLabel: 'Added to taxable pay',
        amount: 4_750,
        meaning: 'Amount added to taxable pay',
      }),
    );
    expect(result.details.join(' ')).toContain('£4,750 is added to taxable pay');
    expect(result.warnings.join(' ')).toContain('cannot exceed 50% of pre-tax pay or pension');
    expect(result.details.join(' ')).not.toContain('negative Personal Allowance');
  });

  it.each([
    ['1257L W1', 'W1', 'weekly pay'],
    ['S875L M1', 'M1', 'monthly pay'],
    ['C663L X', 'X', 'pay dates vary'],
    ['1257L NONCUM', 'NONCUM', 'payroll software'],
  ] as const)('explains the %s non-cumulative form', (code, marker, detail) => {
    const result = decodeTaxCode(code);

    expect(result).toEqual(
      expect.objectContaining({ isValid: true, isEmergency: true, suffix: marker }),
    );
    expect(result.details.join(' ')).toContain(detail);
    expect(result.warnings.join(' ')).toContain('current pay period');
  });

  it.each([
    ['SBR', 'Scottish basic rate', '20%'],
    ['SD0', 'Scottish intermediate rate', '21%'],
    ['SD1', 'Scottish higher rate', '42%'],
    ['SD2', 'Scottish advanced rate', '45%'],
    ['SD3', 'Scottish top rate', '48%'],
    ['CBR', 'Welsh basic rate', '20%'],
    ['CD0', 'Welsh higher rate', '40%'],
    ['CD1', 'Welsh additional rate', '45%'],
  ] as const)('uses region-aware meaning for %s', (code, meaning, rate) => {
    const result = decodeTaxCode(code);

    expect(result.meaning).toContain(meaning);
    expect(result.details.join(' ')).toContain(rate);
  });

  it('keeps the visible static reference derived from the same semantic owner', () => {
    expect(TAX_CODE_REFERENCE_ENTRIES).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'SD0–SD3',
          description: expect.stringContaining('Scottish'),
        }),
        expect.objectContaining({
          code: 'CD0 / CD1',
          description: expect.stringContaining('Welsh'),
        }),
        expect.objectContaining({
          code: 'W1 / M1 / X / NONCUM',
          description: expect.stringContaining('non-cumulative'),
        }),
      ]),
    );
  });

  it.each([
    '1257',
    'K0',
    'K10000',
    'CD2',
    'SNT',
    '1257L W1 M1',
  ])('does not confidently decode malformed input %j', (code) => {
    const result = decodeTaxCode(code);

    expect(result.isValid).toBe(false);
    expect(result.meaning).toBe('Unrecognized or unsupported tax code');
    expect(result.warnings).not.toHaveLength(0);
  });

  it('formats only non-negative user-visible code amounts', () => {
    expect(formatTaxCodeAmount(12_570)).toBe('£12,570');
    expect(formatTaxCodeAmount(0)).toBe('£0');
    expect(formatTaxCodeAmount(null)).toBe('N/A');
  });
});
