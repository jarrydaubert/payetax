export type TaxCodePrefix = 'S' | 'C' | null;
export type TaxCodeRegion = 'Scotland' | 'Wales' | null;
export const TAX_CODE_NON_CUMULATIVE_MARKERS = ['W1', 'M1', 'X', 'NONCUM'] as const;
export type TaxCodeNonCumulativeMarker = (typeof TAX_CODE_NON_CUMULATIVE_MARKERS)[number] | null;
export const TAX_CODE_MAX_LENGTH = 20;
export type TaxCodeBandOverride = 'BR' | 'D0' | 'D1' | 'D2' | 'D3' | 'NT' | null;
export type TaxCodeClassification =
  | 'empty'
  | 'standard'
  | 'k-code'
  | 'flat-rate'
  | 'zero-allowance'
  | 'no-tax'
  | 'unsupported';

export interface TaxCodeParseResult {
  normalizedCode: string;
  baseCode: string;
  classification: TaxCodeClassification;
  isValid: boolean;
  prefix: TaxCodePrefix;
  suffix: TaxCodeNonCumulativeMarker;
  letter: string | null;
  /**
   * Code-derived tax-free amount used by the calculator. K codes retain the
   * engine's negative calculation convention; decoder copy must use
   * `kAdjustment` instead of presenting this as a negative Personal Allowance.
   */
  allowance: number;
  kAdjustment: number;
  bandOverride: TaxCodeBandOverride;
  isKCode: boolean;
  isScottish: boolean;
  isWelsh: boolean;
  isEmergency: boolean;
  requiresHmrcCheck: boolean;
  validationMessage: string | null;
}

const NON_CUMULATIVE_MARKER_PATTERN = TAX_CODE_NON_CUMULATIVE_MARKERS.join('|');
const NON_CUMULATIVE_SUFFIX_PATTERN = new RegExp(`\\s+(?=(?:${NON_CUMULATIVE_MARKER_PATTERN})$)`);
const NON_CUMULATIVE_DISPLAY_PATTERN = new RegExp(`^(.+?)(${NON_CUMULATIVE_MARKER_PATTERN})$`);

/**
 * Canonicalise tax-code input. Canonical mode removes only the documented
 * separator before a non-cumulative marker. Display mode adds one separator,
 * while edit mode preserves the calculator store's compact edit value.
 */
export function normalizeTaxCode(
  rawCode: string,
  mode: 'canonical' | 'display' | 'edit' = 'canonical',
): string {
  if (typeof rawCode !== 'string') return '';

  const normalized = rawCode.trim().toUpperCase().replace(/\s+/g, ' ');
  if (mode === 'edit') return normalized.replace(/\s+/g, '');

  const canonical = normalized.replace(NON_CUMULATIVE_SUFFIX_PATTERN, '');
  if (mode === 'canonical') return canonical;

  const displayMatch = canonical.match(NON_CUMULATIVE_DISPLAY_PATTERN);
  return displayMatch ? `${displayMatch[1]} ${displayMatch[2]}` : canonical;
}

function taxCodeParts(normalizedCode: string): {
  baseCode: string;
  prefix: TaxCodePrefix;
  suffix: TaxCodeNonCumulativeMarker;
} {
  let remaining = normalizedCode;
  let prefix: TaxCodePrefix = null;
  let suffix: TaxCodeNonCumulativeMarker = null;

  if (remaining.startsWith('S') || remaining.startsWith('C')) {
    prefix = remaining[0] as Exclude<TaxCodePrefix, null>;
    remaining = remaining.slice(1);
  }

  const marker = [...TAX_CODE_NON_CUMULATIVE_MARKERS]
    .sort((left, right) => right.length - left.length)
    .find((candidate) => remaining.endsWith(candidate));
  if (marker) {
    suffix = marker;
    remaining = remaining.slice(0, -marker.length);
  }

  return { baseCode: remaining, prefix, suffix };
}

function invalidMessage(
  normalizedCode: string,
  baseCode: string,
  prefix: TaxCodePrefix,
  suffix: TaxCodeNonCumulativeMarker,
): string {
  if (!baseCode && suffix) {
    return 'A non-cumulative marker must follow a complete tax code, such as 1257L W1.';
  }
  if (/^\d+$/.test(baseCode)) {
    return 'A numeric tax code needs an HMRC letter, such as 1257L.';
  }
  if (/^K\d+$/.test(baseCode)) {
    return 'K codes use K followed by a number from 1 to 9999.';
  }
  if (prefix === 'S' && /^D[4-8]$/.test(baseCode)) {
    return 'HMRC reserves Scottish D4 to D8 formats, but they do not map to a current 2026/27 Scottish rate and cannot be estimated here. Check the code with HMRC.';
  }
  if (/^\d+[LMNT]$/.test(baseCode)) {
    return 'HMRC tax-code numbers use no more than 5 digits.';
  }
  if (/^(?:S|C)?NT/.test(normalizedCode) && normalizedCode !== 'NT') {
    return 'HMRC does not use a Scottish or Welsh prefix with code NT.';
  }
  return 'This is not a supported HMRC tax-code format. Check every letter and number against your payslip or HMRC notice.';
}

/** Parse one supported HMRC tax-code form for every calculator and decoder consumer. */
export function parseTaxCode(taxCode: string, defaultAllowance: number): TaxCodeParseResult {
  const normalizedCode = normalizeTaxCode(taxCode);
  const { baseCode, prefix, suffix } = taxCodeParts(normalizedCode);
  const baseResult: TaxCodeParseResult = {
    normalizedCode,
    baseCode,
    classification: normalizedCode ? 'unsupported' : 'empty',
    isValid: false,
    prefix,
    suffix,
    letter: null,
    allowance: defaultAllowance,
    kAdjustment: 0,
    bandOverride: null,
    isKCode: false,
    isScottish: prefix === 'S',
    isWelsh: prefix === 'C',
    isEmergency: suffix !== null,
    requiresHmrcCheck: false,
    validationMessage: normalizedCode
      ? invalidMessage(normalizedCode, baseCode, prefix, suffix)
      : null,
  };

  if (!(normalizedCode && baseCode)) return baseResult;

  if (baseCode === 'NT' && prefix === null) {
    return {
      ...baseResult,
      classification: 'no-tax',
      isValid: true,
      letter: 'NT',
      allowance: 0,
      bandOverride: 'NT',
      validationMessage: null,
    };
  }

  if (baseCode === '0T') {
    return {
      ...baseResult,
      classification: 'zero-allowance',
      isValid: true,
      letter: '0T',
      allowance: 0,
      validationMessage: null,
    };
  }

  if (baseCode === 'BR' || baseCode === 'D0' || baseCode === 'D1') {
    return {
      ...baseResult,
      classification: 'flat-rate',
      isValid: true,
      letter: baseCode,
      allowance: 0,
      bandOverride: baseCode,
      validationMessage: null,
    };
  }

  if ((baseCode === 'D2' || baseCode === 'D3') && prefix === 'S') {
    return {
      ...baseResult,
      classification: 'flat-rate',
      isValid: true,
      letter: baseCode,
      allowance: 0,
      bandOverride: baseCode,
      validationMessage: null,
    };
  }

  const kCodeMatch = baseCode.match(/^K([1-9]\d{0,3})$/);
  if (kCodeMatch?.[1]) {
    const kAdjustment = Number.parseInt(kCodeMatch[1], 10) * 10;
    return {
      ...baseResult,
      classification: 'k-code',
      isValid: true,
      letter: 'K',
      allowance: -kAdjustment,
      kAdjustment,
      isKCode: true,
      validationMessage: null,
    };
  }

  const standardMatch = baseCode.match(/^([1-9]\d{0,4})([LMNT])$/);
  if (standardMatch?.[1] && standardMatch[2]) {
    const codeNumber = Number.parseInt(standardMatch[1], 10);
    const taxFreeAmount = codeNumber * 10;
    if (Number.isSafeInteger(taxFreeAmount)) {
      return {
        ...baseResult,
        classification: 'standard',
        isValid: true,
        letter: standardMatch[2],
        allowance: taxFreeAmount,
        requiresHmrcCheck: standardMatch[1].length > 4,
        validationMessage: null,
      };
    }
  }

  return baseResult;
}

export function isValidTaxCode(taxCode: string): boolean {
  return parseTaxCode(taxCode, 0).isValid;
}

/** Return the tax regime explicitly assigned by a valid S or C prefix. */
export function getTaxCodeRegionOverride(parsed: TaxCodeParseResult): TaxCodeRegion {
  if (!parsed.isValid) return null;
  if (parsed.isScottish) return 'Scotland';
  if (parsed.isWelsh) return 'Wales';
  return null;
}

function getMonthlyTablesAPayAdjustment(codeNumber: number): number {
  const completeBlocks = Math.floor(codeNumber / 500);
  const remainder = codeNumber % 500;
  const blockAdjustment = Math.ceil((5000 / 12) * 100) / 100;
  const tableAdjustment = (number: number) => Math.ceil(((number * 10 + 9) / 12) * 100) / 100;

  return remainder === 0
    ? tableAdjustment(500) + Math.max(0, completeBlocks - 1) * blockAdjustment
    : tableAdjustment(remainder) + completeBlocks * blockAdjustment;
}

/** HMRC Tables A Month 1 free-pay lookup for a parsed numeric L/M/N/T code. */
export function getMonthlyTaxCodeFreePay(taxFreeAmount: number): number {
  if (taxFreeAmount <= 0) return 0;
  return getMonthlyTablesAPayAdjustment(taxFreeAmount / 10);
}

/** HMRC Tables A Month 1 additional-pay lookup for a parsed K-code adjustment. */
export function getMonthlyKCodeAdditionalPay(kAdjustment: number): number {
  if (kAdjustment <= 0) return 0;
  return getMonthlyTablesAPayAdjustment(kAdjustment / 10);
}

// Partial states remain enterable in the main calculator, but impossible final
// forms (bare numbers, P codes, Welsh D2/D3 and over-range K codes) do not decode.
function partialLiteralPattern(value: string): string {
  return [...value].reduceRight(
    (pattern, character) => (pattern ? `${character}(?:${pattern})?` : character),
    '',
  );
}

const NON_CUMULATIVE_EDIT_PATTERN =
  TAX_CODE_NON_CUMULATIVE_MARKERS.map(partialLiteralPattern).join('|');
const TAX_CODE_EDIT_PATTERN = new RegExp(
  `^(?:[SC]?|[SC]?K\\d{0,4}|[SC]?BR?|D[01]?|SD[0-8]?|CD[01]?|NT?|[SC]?0T?|[SC]?[1-9]\\d{0,4}[LMNT]?)(?:${NON_CUMULATIVE_EDIT_PATTERN})?$`,
);

export function isTaxCodeEditCandidate(taxCode: string): boolean {
  const normalized = normalizeTaxCode(taxCode, 'edit');
  return normalized.length <= TAX_CODE_MAX_LENGTH && TAX_CODE_EDIT_PATTERN.test(normalized);
}

export function hasNonCumulativeTaxCodeMarker(taxCode: string): boolean {
  const parsed = parseTaxCode(taxCode, 0);
  return parsed.isValid && parsed.suffix !== null;
}
