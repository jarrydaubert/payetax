import {
  CURRENT_TAX_YEAR,
  CURRENT_TAX_YEAR_DISPLAY,
  SCOTTISH_TAX_RATES,
  TAX_RATES,
} from '@/constants/taxRates';
import {
  normalizeTaxCode,
  parseTaxCode,
  TAX_CODE_NON_CUMULATIVE_MARKERS,
  type TaxCodeNonCumulativeMarker,
  type TaxCodeParseResult,
  type TaxCodePrefix,
} from './taxCode';

export interface TaxCodeDecoded {
  code: string;
  isValid: boolean;
  /** Tax-free income assigned to this employment or pension by the code. */
  taxFreeAmount: number | null;
  /** Amount a K code adds to taxable pay before PAYE is calculated. */
  kAdjustment: number;
  amountLabel: string | null;
  amount: number | null;
  letter: string | null;
  prefix: TaxCodePrefix;
  suffix: TaxCodeNonCumulativeMarker;
  meaning: string;
  details: string[];
  warnings: string[];
  isScottish: boolean;
  isWelsh: boolean;
  isEmergency: boolean;
  requiresHmrcCheck: boolean;
}

export interface TaxCodeReferenceEntry {
  code: string;
  description: string;
}

interface CodeInfo {
  meaning: string;
  details: string;
  reference: string;
}

const STANDARD_PERSONAL_ALLOWANCE = TAX_RATES[CURRENT_TAX_YEAR].personalAllowance;
const RUK_BANDS = TAX_RATES[CURRENT_TAX_YEAR].bands;
const SCOTTISH_BANDS = SCOTTISH_TAX_RATES[CURRENT_TAX_YEAR].bands;

function rukBandRate(index: number, fallback: number): number {
  return RUK_BANDS[index]?.rate ?? fallback;
}

function scottishBandRate(bandName: string): number {
  return SCOTTISH_BANDS.find((band) => band.name === bandName)?.rate ?? 0;
}

const CODE_INFO: Record<string, CodeInfo> = {
  L: {
    meaning: 'Standard Personal Allowance applies',
    details:
      'The L letter means you are entitled to the standard tax-free Personal Allowance. The number is the tax-free amount HMRC has assigned to this employment or pension after any coding adjustments.',
    reference:
      'Standard Personal Allowance applies; the number gives this source’s tax-free amount.',
  },
  M: {
    meaning: 'Marriage Allowance received',
    details:
      "The M letter means you have received a transfer of part of your spouse or civil partner's Personal Allowance. The code number already reflects HMRC's coding calculation, including that transfer and any other adjustments.",
    reference: 'Marriage Allowance received; the code number already includes HMRC’s adjustments.',
  },
  N: {
    meaning: 'Marriage Allowance transferred',
    details:
      "The N letter means you have transferred part of your Personal Allowance to your spouse or civil partner. The code number already reflects HMRC's coding calculation, including that transfer and any other adjustments.",
    reference:
      'Marriage Allowance transferred; the code number already includes HMRC’s adjustments.',
  },
  T: {
    meaning: 'HMRC needs to review some items',
    details:
      'The T letter means HMRC needs to review some items used to calculate this code. The number remains the tax-free amount assigned to this employment or pension.',
    reference: 'HMRC needs to review some items used to calculate the code.',
  },
  '0T': {
    meaning: 'No tax-free amount through this code',
    details:
      'Your Personal Allowance has been used up, or your employer does not yet have enough information to assign a tax-free amount. Tax is taken through the applicable rate bands.',
    reference: 'No tax-free amount is assigned through this code.',
  },
  BR: {
    meaning: 'Basic rate on all income from this source',
    details: `For ${CURRENT_TAX_YEAR_DISPLAY}, all income from this employment or pension is taxed at the basic rate (${rukBandRate(0, 20)}%). This is often used for a second job or pension.`,
    reference: 'All income from this employment or pension is taxed at the basic rate.',
  },
  D0: {
    meaning: 'Higher rate on all income from this source',
    details: `For ${CURRENT_TAX_YEAR_DISPLAY}, all income from this employment or pension is taxed at the higher rate (${rukBandRate(1, 40)}%). This is often used for a second job or pension.`,
    reference: 'All income from this employment or pension is taxed at the higher rate.',
  },
  D1: {
    meaning: 'Additional rate on all income from this source',
    details: `For ${CURRENT_TAX_YEAR_DISPLAY}, all income from this employment or pension is taxed at the additional rate (${rukBandRate(2, 45)}%). This is often used for a second job or pension.`,
    reference: 'All income from this employment or pension is taxed at the additional rate.',
  },
  NT: {
    meaning: 'No tax deducted from this source',
    details:
      'No tax is deducted from this employment or pension. HMRC uses NT only in specific cases; it does not mean all of your income is tax-free.',
    reference: 'No tax is deducted from this source; HMRC uses NT only in specific cases.',
  },
  K: {
    meaning: 'Amount added to taxable pay',
    details:
      'A K code is used when untaxed income or coding deductions are greater than your tax-free allowances. The code number is multiplied by 10 and added to taxable pay before PAYE is calculated.',
    reference: 'The number × 10 is added to taxable pay before PAYE is calculated.',
  },
};

const SCOTTISH_FLAT_RATE_CODES: Record<string, CodeInfo> = {
  BR: {
    meaning: 'Scottish basic rate on all income from this source',
    details: `For ${CURRENT_TAX_YEAR_DISPLAY}, all income from this employment or pension is taxed at the Scottish basic rate (${scottishBandRate('Basic rate')}%). This is often used for a second job or pension.`,
    reference: 'Scottish basic rate on all income from this employment or pension.',
  },
  D0: {
    meaning: 'Scottish intermediate rate on all income from this source',
    details: `For ${CURRENT_TAX_YEAR_DISPLAY}, all income from this employment or pension is taxed at the Scottish intermediate rate (${scottishBandRate('Intermediate rate')}%). This is often used for a second job or pension.`,
    reference: 'Scottish intermediate rate on all income from this employment or pension.',
  },
  D1: {
    meaning: 'Scottish higher rate on all income from this source',
    details: `For ${CURRENT_TAX_YEAR_DISPLAY}, all income from this employment or pension is taxed at the Scottish higher rate (${scottishBandRate('Higher rate')}%). This is often used for a second job or pension.`,
    reference: 'Scottish higher rate on all income from this employment or pension.',
  },
  D2: {
    meaning: 'Scottish advanced rate on all income from this source',
    details: `For ${CURRENT_TAX_YEAR_DISPLAY}, all income from this employment or pension is taxed at the Scottish advanced rate (${scottishBandRate('Advanced rate')}%). This is often used for a second job or pension.`,
    reference: 'Scottish advanced rate on all income from this employment or pension.',
  },
  D3: {
    meaning: 'Scottish top rate on all income from this source',
    details: `For ${CURRENT_TAX_YEAR_DISPLAY}, all income from this employment or pension is taxed at the Scottish top rate (${scottishBandRate('Top rate')}%). This is often used for a second job or pension.`,
    reference: 'Scottish top rate on all income from this employment or pension.',
  },
};

const WELSH_FLAT_RATE_CODES: Record<string, CodeInfo> = {
  BR: {
    meaning: 'Welsh basic rate on all income from this source',
    details: `For ${CURRENT_TAX_YEAR_DISPLAY}, all income from this employment or pension is taxed at the Welsh basic rate (${rukBandRate(0, 20)}%). This is often used for a second job or pension.`,
    reference: 'Welsh basic rate on all income from this employment or pension.',
  },
  D0: {
    meaning: 'Welsh higher rate on all income from this source',
    details: `For ${CURRENT_TAX_YEAR_DISPLAY}, all income from this employment or pension is taxed at the Welsh higher rate (${rukBandRate(1, 40)}%). This is often used for a second job or pension.`,
    reference: 'Welsh higher rate on all income from this employment or pension.',
  },
  D1: {
    meaning: 'Welsh additional rate on all income from this source',
    details: `For ${CURRENT_TAX_YEAR_DISPLAY}, all income from this employment or pension is taxed at the Welsh additional rate (${rukBandRate(2, 45)}%). This is often used for a second job or pension.`,
    reference: 'Welsh additional rate on all income from this employment or pension.',
  },
};

export const TAX_CODE_REFERENCE_ENTRIES: readonly TaxCodeReferenceEntry[] = [
  { code: 'L', description: CODE_INFO.L?.reference ?? '' },
  { code: 'M', description: CODE_INFO.M?.reference ?? '' },
  { code: 'N', description: CODE_INFO.N?.reference ?? '' },
  { code: 'T', description: CODE_INFO.T?.reference ?? '' },
  {
    code: 'BR / D0 / D1',
    description: 'rUK basic, higher or additional rate on all income from this source.',
  },
  { code: 'K', description: CODE_INFO.K?.reference ?? '' },
  {
    code: 'S / SBR',
    description:
      'Scottish Income Tax rates apply; SBR taxes all income from this source at the Scottish basic rate.',
  },
  {
    code: 'SD0–SD3',
    description:
      'Scottish intermediate, higher, advanced or top rate on all income from this source.',
  },
  {
    code: 'C / CBR',
    description:
      'Welsh Income Tax rates apply; CBR taxes all income from this source at the Welsh basic rate.',
  },
  {
    code: 'CD0 / CD1',
    description: 'Welsh higher or additional rate on all income from this source.',
  },
  {
    code: TAX_CODE_NON_CUMULATIVE_MARKERS.join(' / '),
    description:
      'Emergency, non-cumulative basis: PAYE uses the current pay period rather than year-to-date totals.',
  },
  {
    code: '0T / NT',
    description: '0T gives no tax-free amount; NT deducts no tax from this source.',
  },
];

function regionDetail(parsed: TaxCodeParseResult): string | null {
  if (parsed.isScottish) {
    return 'The S prefix means income from this employment or pension uses Scottish Income Tax rates. Savings interest and dividends continue to use UK-wide rates.';
  }
  if (parsed.isWelsh) {
    return 'The C prefix means income from this employment or pension uses Welsh Income Tax rates.';
  }
  return null;
}

function nonCumulativeDetail(marker: Exclude<TaxCodeNonCumulativeMarker, null>): string {
  if (marker === 'W1') return 'W1 is the non-cumulative marker used for weekly pay.';
  if (marker === 'M1') return 'M1 is the non-cumulative marker used for monthly pay.';
  if (marker === 'X') return 'X is the non-cumulative marker used when pay dates vary.';
  return 'NONCUM is an alternative non-cumulative label shown by some payroll software.';
}

export function decodeTaxCode(rawCode: string): TaxCodeDecoded {
  const parsed = parseTaxCode(rawCode, STANDARD_PERSONAL_ALLOWANCE);
  const isTaxFreeAmountCode =
    parsed.classification === 'standard' || parsed.classification === 'zero-allowance';
  const result: TaxCodeDecoded = {
    code: normalizeTaxCode(rawCode, 'display'),
    isValid: parsed.isValid,
    taxFreeAmount: parsed.isValid && isTaxFreeAmountCode ? Math.max(0, parsed.allowance) : null,
    kAdjustment: parsed.kAdjustment,
    amountLabel: null,
    amount: null,
    letter: parsed.letter,
    prefix: parsed.prefix,
    suffix: parsed.suffix,
    meaning: '',
    details: [],
    warnings: [],
    isScottish: parsed.isValid && parsed.isScottish,
    isWelsh: parsed.isValid && parsed.isWelsh,
    isEmergency: parsed.isValid && parsed.isEmergency,
    requiresHmrcCheck: parsed.requiresHmrcCheck,
  };

  if (!parsed.normalizedCode) {
    result.meaning = 'No tax code provided';
    return result;
  }

  if (!parsed.isValid) {
    result.meaning = 'Unrecognized or unsupported tax code';
    result.warnings.push(parsed.validationMessage ?? 'Check the code against an HMRC document.');
    return result;
  }

  const regionalDetail = regionDetail(parsed);
  if (regionalDetail) result.details.push(regionalDetail);

  if (parsed.suffix) {
    result.details.push(nonCumulativeDetail(parsed.suffix));
    result.warnings.push(
      'This is an emergency, non-cumulative basis. PAYE uses only the current pay period rather than your year-to-date pay and tax, so the result can differ from your final annual position.',
    );
  }

  if (parsed.requiresHmrcCheck) {
    result.warnings.push(
      'HMRC can issue long tax codes manually. This format is recognized, but use HMRC’s checker or coding notice to verify the unusually long number.',
    );
  }

  if (parsed.classification === 'flat-rate') {
    const info = parsed.isScottish
      ? SCOTTISH_FLAT_RATE_CODES[parsed.baseCode]
      : parsed.isWelsh
        ? WELSH_FLAT_RATE_CODES[parsed.baseCode]
        : CODE_INFO[parsed.baseCode];
    if (info) {
      result.meaning = info.meaning;
      result.details.push(info.details);
    }
    return result;
  }

  if (parsed.classification === 'no-tax' || parsed.classification === 'zero-allowance') {
    const info = CODE_INFO[parsed.baseCode];
    if (info) {
      result.meaning = info.meaning;
      result.details.push(info.details);
    }
    if (parsed.classification === 'zero-allowance') {
      result.amountLabel = 'Tax-free amount from this source';
      result.amount = 0;
    }
    return result;
  }

  if (parsed.classification === 'k-code') {
    const info = CODE_INFO.K;
    result.meaning = info?.meaning ?? 'Amount added to taxable pay';
    result.details.push(info?.details ?? 'The code adds an amount to taxable pay.');
    result.details.push(
      `For ${parsed.normalizedCode}, £${parsed.kAdjustment.toLocaleString()} is added to taxable pay before PAYE is calculated.`,
    );
    result.warnings.push(
      'When a K code is used, PAYE deductions for a pay period cannot exceed 50% of pre-tax pay or pension.',
    );
    result.amountLabel = 'Added to taxable pay';
    result.amount = parsed.kAdjustment;
    return result;
  }

  const info = parsed.letter ? CODE_INFO[parsed.letter] : undefined;
  result.meaning = info?.meaning ?? 'Tax-free amount code';
  if (info) result.details.push(info.details);
  result.details.unshift(
    `The code gives £${parsed.allowance.toLocaleString()} of tax-free income from this employment or pension for the tax year.`,
  );
  result.amountLabel = 'Tax-free amount from this source';
  result.amount = parsed.allowance;

  return result;
}

export function formatTaxCodeAmount(amount: number | null): string {
  if (amount === null) return 'N/A';
  return `£${amount.toLocaleString()}`;
}
