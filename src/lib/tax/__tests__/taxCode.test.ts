import {
  calculateTax,
  getMonthlyKCodeAdditionalPay,
  getTaxCodeRegionOverride,
  hasNonCumulativeTaxCodeMarker,
  isTaxCodeEditCandidate,
  isValidTaxCode,
  normalizeTaxCode,
  parseTaxCode,
  type TaxCalculationInput,
} from '@/lib/tax';
import { decodeTaxCode } from '@/lib/tax-code-decoder';
import {
  HMRC_TAX_CODE_FIXTURE_SOURCES,
  INVALID_TAX_CODE_FIXTURES,
  VALID_TAX_CODE_FIXTURES,
} from '@/test/taxCodeVerificationFixtures';
import { getMonthlyTaxCodeFreePay } from '../taxCode';

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
  it('records the official evidence used by the independent fixtures', () => {
    expect(HMRC_TAX_CODE_FIXTURE_SOURCES.verifiedOn).toBe('2026-08-23');
    expect(HMRC_TAX_CODE_FIXTURE_SOURCES.urls).toEqual(
      expect.arrayContaining([
        'https://www.gov.uk/tax-codes/what-your-tax-code-means',
        'https://www.gov.uk/tax-codes/k-in-your-tax-code',
        'https://www.gov.uk/tax-codes/emergency-tax-codes',
      ]),
    );
  });

  it.each([
    ['  s1257l  ', 'canonical', 'S1257L'],
    ['1257l w1', 'canonical', '1257LW1'],
    [' 1257l   w1 ', 'display', '1257L W1'],
    ['1257l noncum', 'canonical', '1257LNONCUM'],
    ['1257lnoncum', 'display', '1257L NONCUM'],
    [' sk100 m1 ', 'canonical', 'SK100M1'],
    ['1 257l', 'canonical', '1 257L'],
    ['1 257l', 'edit', '1257L'],
    ['', 'canonical', ''],
  ] as const)('normalizes %j in %s mode', (input, mode, expected) => {
    expect(normalizeTaxCode(input, mode)).toBe(expected);
  });

  it.each(
    VALID_TAX_CODE_FIXTURES,
  )('parses and explains the independently sourced $code fixture', (fixture) => {
    const parsed = parseTaxCode(fixture.code, DEFAULT_ALLOWANCE);
    const decoded = decodeTaxCode(fixture.code);

    expect(parsed).toEqual(
      expect.objectContaining({
        isValid: true,
        classification: fixture.classification,
        prefix: fixture.prefix,
        suffix: fixture.marker,
        letter: fixture.letter,
        allowance: fixture.allowance,
        kAdjustment: fixture.kAdjustment,
      }),
    );
    expect(decoded).toEqual(
      expect.objectContaining({
        isValid: true,
        prefix: fixture.prefix,
        suffix: fixture.marker,
        letter: fixture.letter,
        amountLabel: fixture.amountLabel,
        amount: fixture.amount,
      }),
    );
    expect(decoded.meaning).toContain(fixture.meaningIncludes);
    expect(decoded.details.join(' ')).toContain(fixture.detailIncludes);
  });

  it.each(INVALID_TAX_CODE_FIXTURES)('rejects malformed or unsupported code %j', (code) => {
    const parsed = parseTaxCode(code, DEFAULT_ALLOWANCE);
    const decoded = decodeTaxCode(code);

    expect(isValidTaxCode(code)).toBe(false);
    expect(parsed.isValid).toBe(false);
    expect(parsed.allowance).toBe(DEFAULT_ALLOWANCE);
    expect(parsed.kAdjustment).toBe(0);
    expect(decoded.isValid).toBe(false);
    expect(decoded.amount).toBeNull();
    expect(decoded.warnings).not.toHaveLength(0);
  });

  it('accepts the documented K-code boundaries and rejects values outside them', () => {
    expect(parseTaxCode('K1', DEFAULT_ALLOWANCE)).toEqual(
      expect.objectContaining({ isValid: true, kAdjustment: 10 }),
    );
    expect(parseTaxCode('K9999', DEFAULT_ALLOWANCE)).toEqual(
      expect.objectContaining({ isValid: true, kAdjustment: 99_990 }),
    );
    expect(isValidTaxCode('K0')).toBe(false);
    expect(isValidTaxCode('K10000')).toBe(false);
  });

  it.each([
    [10, 1.59],
    [4750, 396.59],
    [5000, 417.42],
    [6000, 500.76],
  ])('reproduces the HMRC Tables A Month 1 adjustment for £%i', (adjustment, monthly) => {
    expect(getMonthlyKCodeAdditionalPay(adjustment)).toBe(monthly);
  });

  it.each([
    [1, 1.59],
    [9, 1.59],
    [10, 1.59],
    [19, 1.59],
    [20, 2.42],
    [1000, 84.09],
    [5000, 417.42],
    [10000, 834.09],
    [12569, 1047.43],
    [12570, 1048.26],
  ])('reproduces the HMRC Tables A Month 1 free pay for £%i', (amount, monthly) => {
    expect(getMonthlyTaxCodeFreePay(amount)).toBe(monthly);
  });

  it('accepts HMRC v24.0’s seven-character example and rejects longer base codes', () => {
    expect(parseTaxCode('999999T', DEFAULT_ALLOWANCE)).toEqual(
      expect.objectContaining({ isValid: true, allowance: 9_999_990 }),
    );
    expect(isTaxCodeEditCandidate('999999T')).toBe(true);

    const tooLong = parseTaxCode('1000000L', DEFAULT_ALLOWANCE);
    expect(tooLong.isValid).toBe(false);
    expect(tooLong.validationMessage).toContain('up to 7 characters');
    expect(isTaxCodeEditCandidate('1000000L')).toBe(false);
    expect(isTaxCodeEditCandidate('S999999T')).toBe(false);
  });

  it.each([
    ['S99999T', 'S', null],
    ['C99999T', 'C', null],
    ['999999T NONCUM', null, 'NONCUM'],
  ] as const)('applies the seven-character base-code boundary to %s', (code, prefix, suffix) => {
    expect(parseTaxCode(code, DEFAULT_ALLOWANCE)).toEqual(
      expect.objectContaining({ isValid: true, prefix, suffix }),
    );
    expect(isTaxCodeEditCandidate(code)).toBe(true);
  });

  it.each([
    'B',
    'BR',
    'K',
    'K1',
    'K9999',
    'S',
    'S1',
    'S12',
    'S1257L',
    'SD2',
    '1257L',
    '1257LW',
    '1257LW1',
    '1257LN',
    '1257LNONCUM',
  ])('preserves a possible editable state %j', (code) => {
    expect(isTaxCodeEditCandidate(code)).toBe(true);
  });

  it.each([
    'INVALID123',
    'SS1257L',
    'CD2',
    'D3',
    '1257P',
    '1257L!',
    'K10000',
  ])('rejects impossible edit state %j', (code) => {
    expect(isTaxCodeEditCandidate(code)).toBe(false);
  });

  it.each([
    ['1257LW1', true],
    ['1257L M1', true],
    ['S1257LX', true],
    ['1257L NONCUM', true],
    ['NONCUM', false],
    ['1257L W', false],
    ['BR', false],
    ['INVALID', false],
  ] as const)('detects non-cumulative markers for %s', (code, expected) => {
    expect(hasNonCumulativeTaxCodeMarker(code)).toBe(expected);
  });
});

describe('calculator and decoder consistency', () => {
  it.each([
    ['1383M', 13_830],
    ['1131N', 11_310],
  ] as const)('does not apply a second Marriage Allowance adjustment to %s', (code, amount) => {
    const calculated = calculateTax({
      ...baseInput,
      taxCode: code,
      isMarried: true,
      partnerGrossWage: 0,
    });

    expect(calculated.taxFreeAmount).toBe(amount);
  });

  it('keeps an explicit code authoritative while exposing the policy-only taper comparison', () => {
    const calculated = calculateTax({ ...baseInput, salary: 110_000, taxCode: '1257L' });

    expect(calculated.taxFreeAmount).toBe(12_570);
    expect(calculated.taxCodeBasis).toEqual({
      kind: 'supplied-code',
      appliedCode: '1257L',
      policyDerivedTaxFreeAmount: 7_570,
      suppliedTaxFreeAmount: 12_570,
      periodAdjustment: 'free-pay',
      ignoredAdjustments: [],
    });
  });

  it('uses the blank-code policy taper and the same Tables A period basis as 757T', () => {
    const policyDerived = calculateTax({ ...baseInput, salary: 110_000, taxCode: '' });
    const explicit = calculateTax({ ...baseInput, salary: 110_000, taxCode: '757T' });

    expect(policyDerived.taxCodeBasis).toEqual(
      expect.objectContaining({
        kind: 'policy-derived',
        appliedCode: null,
        policyDerivedTaxFreeAmount: 7_570,
      }),
    );
    expect(policyDerived.taxFreeAmount).toBe(7_570);
    expect(policyDerived.taxFreeAmountByPeriod?.monthly).toBe(631.59);
    expect(policyDerived.incomeTax.annually).toBe(explicit.incomeTax.annually);
  });

  it('maps every positive policy amount from £1 to £19 to HMRC code 1', () => {
    const ninePounds = calculateTax({ ...baseInput, salary: 125_122, taxCode: '' });
    const onePound = calculateTax({ ...baseInput, salary: 125_139, taxCode: '' });

    expect(ninePounds.taxFreeAmount).toBe(9);
    expect(ninePounds.taxFreeAmountByPeriod?.monthly).toBe(1.59);
    expect(onePound.taxFreeAmount).toBe(1);
    expect(onePound.taxFreeAmountByPeriod?.monthly).toBe(1.59);
  });

  it('does not double count separate allowance answers under an explicit code', () => {
    const calculated = calculateTax({
      ...baseInput,
      taxCode: '1257L',
      isBlind: true,
      isMarried: true,
      partnerGrossWage: 0,
    });

    expect(calculated.taxFreeAmount).toBe(12_570);
    expect(calculated.taxCodeBasis).toEqual(
      expect.objectContaining({
        policyDerivedTaxFreeAmount: 17_080,
        ignoredAdjustments: ['blind-persons-allowance', 'marriage-allowance'],
      }),
    );
  });

  it('does not describe an ineligible Marriage Allowance answer as an ignored adjustment', () => {
    const calculated = calculateTax({
      ...baseInput,
      salary: 60_000,
      taxCode: '1257L',
      isMarried: true,
      partnerGrossWage: 8_000,
    });

    expect(calculated.taxCodeBasis).toEqual(
      expect.objectContaining({
        policyDerivedTaxFreeAmount: 12_570,
        ignoredAdjustments: [],
      }),
    );
  });

  it.each([
    ['757T', { salary: 110_000 }, 7_570],
    ['1570T', { salary: 30_000, isBlind: true }, 15_700],
  ] as const)('does not reapply coding adjustments already reflected by %s', (code, input, amount) => {
    const calculated = calculateTax({ ...baseInput, ...input, taxCode: code });

    expect(calculated.taxFreeAmount).toBe(amount);
  });

  it.each([
    ['1257L', 12_570, null],
    ['K475', -4_750, null],
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
  ] as const)('keeps calculator interpretation aligned for %s', (code, amount, flatRate) => {
    const parsed = parseTaxCode(code, DEFAULT_ALLOWANCE);
    const decoded = decodeTaxCode(code);
    const calculated = calculateTax({ ...baseInput, taxCode: code });

    expect(decoded.isValid).toBe(parsed.isValid);
    expect(calculated.taxFreeAmount).toBe(amount);
    if (parsed.classification === 'standard' || parsed.classification === 'zero-allowance') {
      expect(decoded.taxFreeAmount).toBe(parsed.allowance);
    } else {
      expect(decoded.taxFreeAmount).toBeNull();
    }
    if (parsed.classification === 'k-code') {
      expect(decoded.kAdjustment).toBe(-parsed.allowance);
      expect(decoded.amount).toBe(parsed.kAdjustment);
    }

    if (flatRate !== null) {
      expect(calculated.taxBands).toHaveLength(1);
      expect(calculated.taxBands[0]?.rate).toBe(flatRate);
    }
    if (code === 'NT') expect(calculated.incomeTax.annually).toBe(0);
  });

  it.each([
    'W1',
    'M1',
    'X',
    'NONCUM',
  ] as const)('makes a steady-pay annual projection for the %s non-cumulative marker', (marker) => {
    const ordinary = calculateTax(baseInput);
    const nonCumulative = calculateTax({ ...baseInput, taxCode: `1257L${marker}` });
    const decoded = decodeTaxCode(`1257L${marker}`);

    expect(nonCumulative.incomeTax).toEqual(ordinary.incomeTax);
    expect(nonCumulative.taxFreeAmount).toBe(ordinary.taxFreeAmount);
    expect(parseTaxCode(`1257L${marker}`, DEFAULT_ALLOWANCE).isEmergency).toBe(true);
    expect(decoded.warnings.join(' ')).toContain('current pay period');
  });

  it.each([
    'INVALID',
    'D2',
    'D3',
    '1257',
    '1257P',
    'NONCUM',
    'K100ABC',
  ])('keeps unsupported code %j on the calculator fallback amount', (code) => {
    const result = calculateTax({ ...baseInput, taxCode: code });

    expect(parseTaxCode(code, DEFAULT_ALLOWANCE).isValid).toBe(false);
    expect(decodeTaxCode(code).isValid).toBe(false);
    expect(result.taxFreeAmount).toBe(DEFAULT_ALLOWANCE);
  });

  it('does not let malformed prefixes silently change the selected region', () => {
    const englandDefault = calculateTax({ ...baseInput, taxCode: '' });
    const englandWithMalformedScottishCode = calculateTax({
      ...baseInput,
      taxCode: 'SINVALID',
    });
    const scotlandDefault = calculateTax({
      ...baseInput,
      taxCode: '',
      isScottish: true,
    });
    const scotlandWithMalformedWelshCode = calculateTax({
      ...baseInput,
      taxCode: 'CINVALID',
      isScottish: true,
    });

    expect(englandWithMalformedScottishCode.incomeTax).toEqual(englandDefault.incomeTax);
    expect(scotlandWithMalformedWelshCode.incomeTax).toEqual(scotlandDefault.incomeTax);
  });

  it.each([
    ['S1257L', 'Scotland'],
    ['C1257L', 'Wales'],
    ['1257L', null],
    ['SINVALID', null],
  ] as const)('resolves the valid regional override for %s', (code, region) => {
    expect(getTaxCodeRegionOverride(parseTaxCode(code, DEFAULT_ALLOWANCE))).toBe(region);
  });

  it('applies a valid regional code prefix ahead of a conflicting selected region', () => {
    const scottishOverride = calculateTax({ ...baseInput, taxCode: 'SD0', isScottish: false });
    const welshOverride = calculateTax({ ...baseInput, taxCode: 'CD0', isScottish: true });

    expect(scottishOverride.taxBands[0]?.rate).toBe(21);
    expect(welshOverride.taxBands[0]?.rate).toBe(40);
  });

  it('identifies Scottish D-code formats that have no current rate mapping', () => {
    const parsed = parseTaxCode('SD4', DEFAULT_ALLOWANCE);

    expect(isTaxCodeEditCandidate('SD4')).toBe(true);
    expect(parsed.isValid).toBe(false);
    expect(parsed.validationMessage).toContain(
      'do not map to a current 2026/27 Scottish Income Tax rate',
    );
  });
});
