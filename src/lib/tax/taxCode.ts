import {
  CURRENT_TAX_YEAR,
  formatTaxYearDisplay,
  SCOTTISH_TAX_RATES,
  TAX_RATES,
} from '@/constants/taxRates';

export type TaxCodePrefix = 'S' | 'C' | null;
export type TaxCodeEmergencySuffix = 'W1' | 'M1' | 'X' | null;
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
  suffix: TaxCodeEmergencySuffix;
  letter: string | null;
  allowance: number;
  kAdjustment: number;
  bandOverride: TaxCodeBandOverride;
  isKCode: boolean;
  isScottish: boolean;
  isWelsh: boolean;
  isEmergency: boolean;
}

export interface TaxCodeDecoded {
  code: string;
  isValid: boolean;
  allowance: number | null;
  letter: string | null;
  prefix: string | null;
  suffix: string | null;
  meaning: string;
  details: string[];
  warnings: string[];
  isScottish: boolean;
  isWelsh: boolean;
  isEmergency: boolean;
}

interface LetterInfo {
  meaning: string;
  details: string;
}

const STANDARD_PERSONAL_ALLOWANCE = TAX_RATES[CURRENT_TAX_YEAR].personalAllowance;
const TAX_YEAR_DISPLAY = formatTaxYearDisplay(CURRENT_TAX_YEAR, {
  separator: '-',
  shortEndYear: true,
});

const LETTER_MEANINGS: Record<string, LetterInfo> = {
  L: {
    meaning: 'Standard personal allowance',
    details: 'You are entitled to the standard tax-free Personal Allowance.',
  },
  M: {
    meaning: 'Marriage Allowance - receiving',
    details:
      "You have received a transfer of 10% of your partner's Personal Allowance. Your allowance is increased by £1,260.",
  },
  N: {
    meaning: 'Marriage Allowance - transferring',
    details:
      'You have transferred 10% of your Personal Allowance to your partner. Your allowance is reduced by £1,260.',
  },
  T: {
    meaning: 'Other calculations required',
    details:
      'Your tax code includes other calculations to work out your Personal Allowance, for example it has been reduced because your estimated annual income is more than £100,000.',
  },
  '0T': {
    meaning: 'No Personal Allowance',
    details:
      'Your Personal Allowance has been used up, or you have started a new job and your employer does not have the details needed to give you a tax code. All your income is taxed.',
  },
  BR: {
    meaning: 'Basic rate on all income',
    details:
      'All your income from this job or pension is taxed at the basic rate (20%). This is usually used for a second job.',
  },
  D0: {
    meaning: 'Higher rate on all income',
    details:
      'All your income from this job or pension is taxed at the higher rate (40%). This is usually used for a second job.',
  },
  D1: {
    meaning: 'Additional rate on all income',
    details:
      'All your income from this job or pension is taxed at the additional rate (45%). This is usually used for a second job.',
  },
  NT: {
    meaning: 'No tax deducted',
    details:
      'You are not paying any tax on this income. This might be because you are a non-resident or have specific tax relief.',
  },
  K: {
    meaning: 'Tax code adds to income',
    details:
      'You have income that is not being taxed another way and it is worth more than your tax-free allowance. This is often used for company benefits.',
  },
};

const SCOTTISH_BANDS = SCOTTISH_TAX_RATES[CURRENT_TAX_YEAR].bands;

function scottishBandRate(bandName: string): number {
  return SCOTTISH_BANDS.find((band) => band.name === bandName)?.rate ?? 0;
}

const SCOTTISH_FLAT_RATE_CODES: Record<string, LetterInfo> = {
  BR: {
    meaning: 'Scottish basic rate on all income',
    details: `All your income from this job or pension is taxed at the Scottish basic rate (${scottishBandRate('Basic rate')}%). This is usually used for a second job.`,
  },
  D0: {
    meaning: 'Scottish intermediate rate on all income',
    details: `All your income from this job or pension is taxed at the Scottish intermediate rate (${scottishBandRate('Intermediate rate')}%). This is usually used for a second job.`,
  },
  D1: {
    meaning: 'Scottish higher rate on all income',
    details: `All your income from this job or pension is taxed at the Scottish higher rate (${scottishBandRate('Higher rate')}%). This is usually used for a second job.`,
  },
  D2: {
    meaning: 'Scottish advanced rate on all income',
    details: `All your income from this job or pension is taxed at the Scottish advanced rate (${scottishBandRate('Advanced rate')}%). This is usually used for a second job or pension.`,
  },
  D3: {
    meaning: 'Scottish top rate on all income',
    details: `All your income from this job or pension is taxed at the Scottish top rate (${scottishBandRate('Top rate')}%). This is usually used for a second job or pension.`,
  },
};

/**
 * Canonicalise tax-code input. Canonical mode removes only the documented
 * separator before an emergency suffix. Display mode retains that separator,
 * while edit mode preserves the store's historical all-whitespace compaction.
 */
export function normalizeTaxCode(
  rawCode: string,
  mode: 'canonical' | 'display' | 'edit' = 'canonical',
): string {
  if (typeof rawCode !== 'string') return '';

  const normalized = rawCode.trim().toUpperCase();
  if (mode === 'edit') return normalized.replace(/\s+/g, '');
  if (mode === 'display') return normalized.replace(/\s+/g, ' ');
  return normalized.replace(/\s+(?=(?:W1|M1|X)$)/, '');
}

function taxCodeParts(normalizedCode: string): {
  baseCode: string;
  prefix: TaxCodePrefix;
  suffix: TaxCodeEmergencySuffix;
} {
  let remaining = normalizedCode;
  let prefix: TaxCodePrefix = null;
  let suffix: TaxCodeEmergencySuffix = null;

  if (remaining.startsWith('S') || remaining.startsWith('C')) {
    prefix = remaining[0] as Exclude<TaxCodePrefix, null>;
    remaining = remaining.slice(1);
  }

  if (remaining.endsWith('W1') || remaining.endsWith('M1')) {
    suffix = remaining.slice(-2) as Exclude<TaxCodeEmergencySuffix, 'X' | null>;
    remaining = remaining.slice(0, -2);
  } else if (remaining.endsWith('X')) {
    suffix = 'X';
    remaining = remaining.slice(0, -1);
  }

  return { baseCode: remaining, prefix, suffix };
}

/** Parse and interpret one supported PayeTax tax code. */
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
  };

  if (!normalizedCode) return baseResult;

  if (baseCode === 'NT') {
    return {
      ...baseResult,
      classification: 'no-tax',
      isValid: true,
      letter: 'NT',
      allowance: 0,
      bandOverride: 'NT',
    };
  }

  if (baseCode === '0T') {
    return {
      ...baseResult,
      classification: 'zero-allowance',
      isValid: true,
      letter: '0T',
      allowance: 0,
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
    };
  }

  const kCodeMatch = baseCode.match(/^K(\d+)$/);
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
    };
  }

  const standardMatch = baseCode.match(/^(\d+)([KLMNT])?$/);
  if (standardMatch?.[1]) {
    return {
      ...baseResult,
      classification: 'standard',
      isValid: true,
      letter: standardMatch[2] ?? null,
      allowance: Number.parseInt(standardMatch[1], 10) * 10,
    };
  }

  // Preserve the calculator's historical defensive fallback for malformed
  // K-prefixed runtime input. It remains invalid to the validator and decoder,
  // but calculation semantics keep the numeric K adjustment parsed previously.
  if (baseCode.startsWith('K')) {
    const numericPrefix = Number.parseInt(baseCode.slice(1), 10);
    if (!Number.isNaN(numericPrefix)) {
      const kAdjustment = numericPrefix * 10;
      return {
        ...baseResult,
        allowance: -kAdjustment,
        kAdjustment,
        isKCode: true,
      };
    }
  }

  return baseResult;
}

export function isValidTaxCode(taxCode: string): boolean {
  return parseTaxCode(taxCode, 0).isValid;
}

// This is deliberately an edit grammar: partial states such as "K" and "S12"
// must remain enterable even though they are not complete, valid tax codes yet.
const TAX_CODE_EDIT_PATTERN =
  /^(?:[SC]?|SD[0-3]?(?:W1?|M1?|X)?|[SC]?(?:K\d*|BR?|D[01]?|NT?|0T?|\d+[LMNPTX]?)(?:W1?|M1?|X)?)$/;

export function isTaxCodeEditCandidate(taxCode: string): boolean {
  return TAX_CODE_EDIT_PATTERN.test(normalizeTaxCode(taxCode, 'edit'));
}

export function hasEmergencyTaxCodeSuffix(taxCode: string): boolean {
  return taxCodeParts(normalizeTaxCode(taxCode)).suffix !== null;
}

export function decodeTaxCode(rawCode: string): TaxCodeDecoded {
  const parsed = parseTaxCode(rawCode, STANDARD_PERSONAL_ALLOWANCE);
  const result: TaxCodeDecoded = {
    code: typeof rawCode === 'string' ? rawCode.toUpperCase() : '',
    isValid: parsed.isValid,
    allowance: parsed.isValid ? parsed.allowance : null,
    letter: parsed.letter,
    prefix: parsed.prefix,
    suffix: parsed.suffix,
    meaning: '',
    details: [],
    warnings: [],
    isScottish: parsed.isScottish,
    isWelsh: parsed.isWelsh,
    isEmergency: parsed.isEmergency,
  };

  if (!parsed.normalizedCode) {
    result.meaning = 'No tax code provided';
    return result;
  }

  if (parsed.isScottish) {
    result.details.push(
      'Scottish tax rates apply. You pay Scottish Income Tax instead of UK rates.',
    );
  } else if (parsed.isWelsh) {
    result.details.push('Welsh tax rates apply (currently same as England/NI rates).');
  }

  if (parsed.suffix === 'W1' || parsed.suffix === 'M1') {
    result.warnings.push(
      'This is an emergency tax code. Your tax may not be calculated correctly until HMRC provides your correct code.',
    );
  } else if (parsed.suffix === 'X') {
    result.warnings.push(
      'This is a non-cumulative tax code. Contact HMRC if you think this is wrong.',
    );
  }

  if (!parsed.isValid) {
    result.meaning = 'Unrecognized tax code format';
    result.warnings.push(
      'This tax code format is not recognized. Please check it is correct or contact HMRC for clarification.',
    );
    return result;
  }

  if (parsed.classification === 'flat-rate') {
    const info = parsed.isScottish
      ? SCOTTISH_FLAT_RATE_CODES[parsed.baseCode]
      : LETTER_MEANINGS[parsed.baseCode];
    if (info) {
      result.meaning = info.meaning;
      result.details.push(info.details);
    }
    return result;
  }

  if (parsed.classification === 'no-tax' || parsed.classification === 'zero-allowance') {
    const info = LETTER_MEANINGS[parsed.baseCode];
    if (info) {
      result.meaning = info.meaning;
      result.details.push(info.details);
    }
    return result;
  }

  if (parsed.classification === 'k-code') {
    result.meaning = 'Tax code adds to your taxable income';
    result.details.push(
      `Your employer adds £${parsed.kAdjustment.toLocaleString()} to your taxable income because you have benefits or owe tax from previous years.`,
    );
    result.warnings.push(
      'K codes are used when your benefits or tax owed exceed your Personal Allowance.',
    );
    return result;
  }

  result.meaning = 'Standard tax code';
  if (parsed.letter) {
    const info = LETTER_MEANINGS[parsed.letter];
    if (info) {
      result.meaning = info.meaning;
      result.details.push(info.details);
    }
  }

  result.details.unshift(
    `Your tax-free Personal Allowance is £${parsed.allowance.toLocaleString()} per year.`,
  );

  if (parsed.allowance === STANDARD_PERSONAL_ALLOWANCE) {
    result.details.push(
      `This is the standard Personal Allowance (£${STANDARD_PERSONAL_ALLOWANCE.toLocaleString()}) for ${TAX_YEAR_DISPLAY}.`,
    );
  } else if (parsed.allowance > STANDARD_PERSONAL_ALLOWANCE) {
    result.details.push(
      "Your allowance is higher than standard, possibly due to Blind Person's Allowance or Marriage Allowance received.",
    );
  } else if (parsed.allowance > 0) {
    result.details.push(
      'Your allowance is below the standard amount. This may be due to high income (over £100k) or Marriage Allowance transferred.',
    );
  }

  return result;
}

export function formatAllowance(allowance: number | null): string {
  if (allowance === null) return 'N/A';
  if (allowance === 0) return '£0';
  if (allowance < 0) return `-£${Math.abs(allowance).toLocaleString()}`;
  return `£${allowance.toLocaleString()}`;
}
