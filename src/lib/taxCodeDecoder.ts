// src/lib/taxCodeDecoder.ts

import { TAX_RATES } from '@/constants/taxRates';

// Get the standard personal allowance from the single source of truth
// Using the latest tax year for reference
const STANDARD_PERSONAL_ALLOWANCE = TAX_RATES['2025-2026'].personalAllowance;

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
  W1: {
    meaning: 'Emergency - week 1 basis',
    details:
      'Your tax is calculated on what you earn in each pay period, not on the whole year to date. This is an emergency code.',
  },
  M1: {
    meaning: 'Emergency - month 1 basis',
    details:
      'Your tax is calculated on what you earn in each pay period, not on the whole year to date. This is an emergency code.',
  },
  X: {
    meaning: 'Non-cumulative emergency',
    details:
      'Your tax is being calculated on a non-cumulative basis. This is typically used when HMRC does not have your full tax history.',
  },
};

export function decodeTaxCode(rawCode: string): TaxCodeDecoded {
  const code = rawCode.toUpperCase().trim();

  const result: TaxCodeDecoded = {
    code: rawCode.toUpperCase(),
    isValid: false,
    allowance: null,
    letter: null,
    prefix: null,
    suffix: null,
    meaning: '',
    details: [],
    warnings: [],
    isScottish: false,
    isWelsh: false,
    isEmergency: false,
  };

  if (!code) {
    result.meaning = 'No tax code provided';
    return result;
  }

  // Check for Scottish (S) or Welsh (C) prefix
  if (code.startsWith('S')) {
    result.isScottish = true;
    result.prefix = 'S';
    result.details.push(
      'Scottish tax rates apply. You pay Scottish Income Tax instead of UK rates.'
    );
  } else if (code.startsWith('C')) {
    result.isWelsh = true;
    result.prefix = 'C';
    result.details.push('Welsh tax rates apply (currently same as England/NI rates).');
  }

  // Remove S or C prefix for further parsing
  const codeWithoutPrefix = result.prefix ? code.substring(1) : code;

  // Check for emergency suffixes (W1, M1, X)
  if (codeWithoutPrefix.endsWith('W1') || codeWithoutPrefix.endsWith('M1')) {
    result.isEmergency = true;
    result.suffix = codeWithoutPrefix.slice(-2);
    result.warnings.push(
      'This is an emergency tax code. Your tax may not be calculated correctly until HMRC provides your correct code.'
    );
  } else if (codeWithoutPrefix.endsWith('X')) {
    result.isEmergency = true;
    result.suffix = 'X';
    result.warnings.push(
      'This is a non-cumulative tax code. Contact HMRC if you think this is wrong.'
    );
  }

  // Remove emergency suffix for further parsing
  const codeWithoutSuffix = result.suffix
    ? codeWithoutPrefix.slice(0, -result.suffix.length)
    : codeWithoutPrefix;

  // Check for special codes (BR, D0, D1, NT, 0T, K codes)
  if (['BR', 'D0', 'D1', 'NT'].includes(codeWithoutSuffix)) {
    result.isValid = true;
    result.letter = codeWithoutSuffix;
    result.allowance = 0;
    const info = LETTER_MEANINGS[codeWithoutSuffix];
    if (info) {
      result.meaning = info.meaning;
      result.details.push(info.details);
    }
    return result;
  }

  // Check for 0T code
  if (codeWithoutSuffix === '0T') {
    result.isValid = true;
    result.letter = '0T';
    result.allowance = 0;
    const info = LETTER_MEANINGS['0T'];
    if (info) {
      result.meaning = info.meaning;
      result.details.push(info.details);
    }
    return result;
  }

  // Parse standard codes (e.g., 1257L, K100, 1000M)
  const standardMatch = codeWithoutSuffix.match(/^(K)?(\d+)([LMNTKX])?$/);

  if (standardMatch) {
    result.isValid = true;
    const [, kPrefix, numberPart, letterSuffix] = standardMatch;

    const number = Number.parseInt(numberPart ?? '0', 10);

    if (kPrefix === 'K') {
      // K codes mean you owe more than your allowance
      result.letter = 'K';
      result.allowance = -(number * 10);
      result.meaning = 'Tax code adds to your taxable income';
      result.details.push(
        `Your employer adds £${(number * 10).toLocaleString()} to your taxable income because you have benefits or owe tax from previous years.`
      );
      result.warnings.push(
        'K codes are used when your benefits or tax owed exceed your Personal Allowance.'
      );
    } else {
      // Standard codes - number × 10 = personal allowance
      result.allowance = number * 10;
      result.letter = letterSuffix || null;

      if (letterSuffix && LETTER_MEANINGS[letterSuffix]) {
        const info = LETTER_MEANINGS[letterSuffix];
        result.meaning = info.meaning;
        result.details.push(info.details);
      } else {
        result.meaning = 'Standard tax code';
      }

      result.details.unshift(
        `Your tax-free Personal Allowance is £${result.allowance.toLocaleString()} per year.`
      );

      // Add context about common allowances using the standard value from taxRates.ts
      if (result.allowance === STANDARD_PERSONAL_ALLOWANCE) {
        result.details.push(
          `This is the standard Personal Allowance (£${STANDARD_PERSONAL_ALLOWANCE.toLocaleString()}) for 2024-26.`
        );
      } else if (result.allowance > STANDARD_PERSONAL_ALLOWANCE) {
        result.details.push(
          "Your allowance is higher than standard, possibly due to Blind Person's Allowance or Marriage Allowance received."
        );
      } else if (result.allowance < STANDARD_PERSONAL_ALLOWANCE && result.allowance > 0) {
        result.details.push(
          'Your allowance is below the standard amount. This may be due to high income (over £100k) or Marriage Allowance transferred.'
        );
      }
    }

    return result;
  }

  // If we get here, the code is not valid
  result.meaning = 'Unrecognized tax code format';
  result.warnings.push(
    'This tax code format is not recognized. Please check it is correct or contact HMRC for clarification.'
  );

  return result;
}

export function formatAllowance(allowance: number | null): string {
  if (allowance === null) return 'N/A';
  if (allowance === 0) return '£0';
  if (allowance < 0) return `-£${Math.abs(allowance).toLocaleString()}`;
  return `£${allowance.toLocaleString()}`;
}
