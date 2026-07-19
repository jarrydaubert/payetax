import {
  calculateTax,
  decodeTaxCode,
  hasEmergencyTaxCodeSuffix,
  isTaxCodeEditCandidate,
  isValidTaxCode,
  normalizeTaxCode,
  parseTaxCode,
  type TaxCalculationInput,
  type TaxCodeParseResult,
} from '@/lib/tax';

const DEFAULT_ALLOWANCE = 12_570;

const baseInput: TaxCalculationInput = {
  salary: 30_000,
  payPeriod: 'annually',
  taxYear: '2026-2027',
  taxCode: '1257L',
  isScottish: false,
  isMarried: false,
  partnerGrossWage: 0,
  isBlind: false,
  payNoNI: false,
  pensionContribution: 0,
  pensionContributionType: 'percentage',
  studentLoanPlans: 'none',
  niCategory: 'A',
  hoursPerWeek: 37.5,
};

describe('shared tax-code grammar', () => {
  it.each([
    ['  s1257l  ', 'canonical', 'S1257L'],
    ['1257l w1', 'canonical', '1257LW1'],
    [' 1257l   w1 ', 'display', '1257L W1'],
    [' sk100 m1 ', 'canonical', 'SK100M1'],
    ['1 257l', 'canonical', '1 257L'],
    ['1 257l', 'edit', '1257L'],
    ['', 'canonical', ''],
  ] as const)('normalizes %j in %s mode', (input, mode, expected) => {
    expect(normalizeTaxCode(input, mode)).toBe(expected);
  });

  it.each([
    {
      code: '1257L',
      expected: {
        classification: 'standard',
        allowance: 12_570,
        letter: 'L',
      },
    },
    {
      code: 'S1257L W1',
      expected: {
        normalizedCode: 'S1257LW1',
        classification: 'standard',
        allowance: 12_570,
        prefix: 'S',
        suffix: 'W1',
        isScottish: true,
        isEmergency: true,
      },
    },
    {
      code: 'K100',
      expected: {
        classification: 'k-code',
        allowance: -1_000,
        kAdjustment: 1_000,
        letter: 'K',
        isKCode: true,
      },
    },
    {
      code: 'BR',
      expected: { classification: 'flat-rate', allowance: 0, bandOverride: 'BR' },
    },
    {
      code: 'D0',
      expected: { classification: 'flat-rate', allowance: 0, bandOverride: 'D0' },
    },
    {
      code: 'D1',
      expected: { classification: 'flat-rate', allowance: 0, bandOverride: 'D1' },
    },
    {
      code: 'SBR',
      expected: {
        classification: 'flat-rate',
        allowance: 0,
        bandOverride: 'BR',
        prefix: 'S',
      },
    },
    {
      code: 'SD0',
      expected: { classification: 'flat-rate', allowance: 0, bandOverride: 'D0' },
    },
    {
      code: 'SD1',
      expected: { classification: 'flat-rate', allowance: 0, bandOverride: 'D1' },
    },
    {
      code: 'SD2',
      expected: { classification: 'flat-rate', allowance: 0, bandOverride: 'D2' },
    },
    {
      code: 'SD3',
      expected: { classification: 'flat-rate', allowance: 0, bandOverride: 'D3' },
    },
    {
      code: '0T',
      expected: { classification: 'zero-allowance', allowance: 0, bandOverride: null },
    },
    {
      code: 'NT',
      expected: { classification: 'no-tax', allowance: 0, bandOverride: 'NT' },
    },
    {
      code: 'C1257LX',
      expected: {
        classification: 'standard',
        prefix: 'C',
        suffix: 'X',
        isWelsh: true,
        isEmergency: true,
      },
    },
  ] satisfies ReadonlyArray<{
    code: string;
    expected: Partial<TaxCodeParseResult>;
  }>)('parses $code once for every consumer', ({ code, expected }) => {
    expect(parseTaxCode(code, DEFAULT_ALLOWANCE)).toEqual(
      expect.objectContaining({ isValid: true, ...expected }),
    );
  });

  it.each([
    '1257L',
    '1257',
    'K100',
    'SK100',
    'BR',
    'D0',
    'D1',
    'SBR',
    'SD0',
    'SD1',
    'SD2',
    'SD3',
    '0T',
    'S0T',
    'NT',
    '1257L W1',
    '1257LM1',
    '1257LX',
  ])('validates supported code %s', (code) => {
    expect(isValidTaxCode(code)).toBe(true);
  });

  it.each([
    '',
    'INVALID',
    'D2',
    'D3',
    'CD2',
    'CD3',
    '1257P',
    '1257L!',
    '1 257L',
    'B R',
    'D 0',
    'N T',
    'S 1257L',
    '1257 L',
    'NONCUM',
  ])('rejects malformed or unsupported code %j', (code) => {
    const parsed = parseTaxCode(code, DEFAULT_ALLOWANCE);

    expect(isValidTaxCode(code)).toBe(false);
    expect(parsed.isValid).toBe(false);
    expect(parsed.allowance).toBe(DEFAULT_ALLOWANCE);
    expect(decodeTaxCode(code).isValid).toBe(false);
  });

  it.each([
    'K100ABC',
    'K 100',
  ])('preserves the malformed K-code calculation fallback for %j without validating it', (code) => {
    const parsed = parseTaxCode(code, DEFAULT_ALLOWANCE);

    expect(parsed).toEqual(
      expect.objectContaining({
        isValid: false,
        classification: 'unsupported',
        allowance: -1_000,
        kAdjustment: 1_000,
        isKCode: true,
      }),
    );
    expect(isValidTaxCode(code)).toBe(false);
    expect(decodeTaxCode(code).isValid).toBe(false);
  });

  it.each([
    'B',
    'BR',
    'K',
    'K1',
    'K10',
    'K100',
    'S',
    'S1',
    'S12',
    'S1257L',
    'SD2M',
    '1257P',
  ])('preserves editable partial state %j', (code) => {
    expect(isTaxCodeEditCandidate(code)).toBe(true);
  });

  it.each([
    'INVALID123',
    'SS1257L',
    'CD2',
    'D3',
    '1257L!',
  ])('rejects impossible edit state %j', (code) => {
    expect(isTaxCodeEditCandidate(code)).toBe(false);
  });

  it.each([
    ['1257LW1', true],
    ['1257L M1', true],
    ['S1257LX', true],
    ['BR', false],
    ['INVALID', false],
  ] as const)('detects emergency suffixes for %s', (code, expected) => {
    expect(hasEmergencyTaxCodeSuffix(code)).toBe(expected);
  });
});

describe('shared decoder interpretation', () => {
  it.each([
    ['1257L', 12_570, 'L', 'Standard personal allowance'],
    ['K100', -1_000, 'K', 'Tax code adds to your taxable income'],
    ['BR', 0, 'BR', 'Basic rate on all income'],
    ['D0', 0, 'D0', 'Higher rate on all income'],
    ['D1', 0, 'D1', 'Additional rate on all income'],
    ['SBR', 0, 'BR', 'Scottish basic rate on all income'],
    ['SD0', 0, 'D0', 'Scottish intermediate rate on all income'],
    ['SD1', 0, 'D1', 'Scottish higher rate on all income'],
    ['SD2', 0, 'D2', 'Scottish advanced rate on all income'],
    ['SD3', 0, 'D3', 'Scottish top rate on all income'],
    ['0T', 0, '0T', 'No Personal Allowance'],
    ['NT', 0, 'NT', 'No tax deducted'],
  ] as const)('decodes %s from the shared parse result', (code, allowance, letter, meaning) => {
    expect(decodeTaxCode(code)).toEqual(
      expect.objectContaining({ isValid: true, allowance, letter, meaning }),
    );
  });

  it.each([
    ['1257LW1', 'W1'],
    ['1257L M1', 'M1'],
    ['S1257LX', 'X'],
  ] as const)('reports emergency decoder metadata for %s', (code, suffix) => {
    const decoded = decodeTaxCode(code);

    expect(decoded.isValid).toBe(true);
    expect(decoded.isEmergency).toBe(true);
    expect(decoded.suffix).toBe(suffix);
    expect(decoded.warnings).not.toHaveLength(0);
  });
});

describe('calculator and decoder consistency', () => {
  it.each([
    ['1257L', 12_570, null],
    ['K100', -1_000, null],
    ['BR', 0, 20],
    ['D0', 0, 40],
    ['D1', 0, 45],
    ['SBR', 0, 20],
    ['SD0', 0, 21],
    ['SD1', 0, 42],
    ['SD2', 0, 45],
    ['SD3', 0, 48],
    ['0T', 0, null],
    ['NT', 0, null],
  ] as const)('keeps calculator interpretation aligned for %s', (code, allowance, flatRate) => {
    const parsed = parseTaxCode(code, DEFAULT_ALLOWANCE);
    const decoded = decodeTaxCode(code);
    const calculated = calculateTax({ ...baseInput, taxCode: code });

    expect(decoded.isValid).toBe(parsed.isValid);
    expect(decoded.allowance).toBe(parsed.allowance);
    expect(calculated.taxFreeAmount).toBe(allowance);

    if (flatRate !== null) {
      expect(calculated.taxBands).toHaveLength(1);
      expect(calculated.taxBands[0]?.rate).toBe(flatRate);
    }
    if (code === 'NT') {
      expect(calculated.incomeTax.annually).toBe(0);
    }
  });

  it.each([
    'W1',
    'M1',
    'X',
  ] as const)('preserves cumulative calculator semantics for the %s emergency suffix', (suffix) => {
    const ordinary = calculateTax(baseInput);
    const emergency = calculateTax({ ...baseInput, taxCode: `1257L${suffix}` });

    expect(emergency.incomeTax).toEqual(ordinary.incomeTax);
    expect(emergency.taxFreeAmount).toBe(ordinary.taxFreeAmount);
    expect(parseTaxCode(`1257L${suffix}`, DEFAULT_ALLOWANCE).isEmergency).toBe(true);
  });

  it.each([
    'INVALID',
    'D2',
    'D3',
    '1257P',
    'NONCUM',
  ])('keeps unsupported code %j on the calculator fallback allowance', (code) => {
    const result = calculateTax({ ...baseInput, taxCode: code });

    expect(parseTaxCode(code, DEFAULT_ALLOWANCE).isValid).toBe(false);
    expect(decodeTaxCode(code).isValid).toBe(false);
    expect(result.taxFreeAmount).toBe(DEFAULT_ALLOWANCE);
  });

  it('preserves the legacy malformed K-code calculator interpretation', () => {
    const result = calculateTax({ ...baseInput, taxCode: 'K100ABC' });

    expect(decodeTaxCode('K100ABC').isValid).toBe(false);
    expect(result.taxFreeAmount).toBe(-1_000);
    expect(result.incomeTax.annually).toBeCloseTo(6_199.2, 2);
  });
});
