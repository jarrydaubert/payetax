// src/constants/taxRates.ts
// Tax rates and thresholds for UK PAYE calculations
//
// ⚠️ CRITICAL: SINGLE SOURCE OF TRUTH FOR TAX CALCULATIONS ⚠️
//
// This file is the ONLY place where tax rates, thresholds, and allowances should be defined.
// When HMRC announces tax changes, update ONLY this file - all calculations across the entire
// application will automatically use the updated values.
//
// DO NOT hardcode tax values (£12,570, £50,270, etc.) anywhere else in the codebase!
// Always import from this file: import { TAX_RATES } from '@/constants/taxRates'
//
// If you find hardcoded tax values elsewhere, that's a bug - please refactor to use this file.
//
// Updated: 2026-07-01 for tax year 2026-2027
// Sources:
// - https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
// - https://www.gov.uk/government/publications/budget-2025-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances
// - https://www.gov.scot/publications/scottish-income-tax-rates-and-bands/pages/2026-to-2027/

// Default tax code
export const DEFAULT_TAX_CODE = '1257L';
export const SCOTTISH_PREFIX = 'S';
export const DEFAULT_HOURS_PER_WEEK = 40;

// Pay periods
export const PERIODS = {
  ANNUALLY: 'annually',
  MONTHLY: 'monthly',
  FOUR_WEEKLY: 'fourWeekly',
  FORTNIGHTLY: 'fortnightly',
  WEEKLY: 'weekly',
  DAILY: 'daily',
  HOURLY: 'hourly',
} as const;

// Period conversion factors (from monthly to other periods)
// These are mathematically derived: periods per year / 12 months
export const PERIOD_CONVERSION_FACTORS = {
  FOUR_WEEKLY: 12 / 13, // 13 four-week periods per year
  FORTNIGHTLY: 12 / 26, // 26 fortnights per year
  WEEKLY: 12 / 52, // 52 weeks per year
  DAILY: 12 / 260, // ~260 working days per year (52 weeks * 5 days)
} as const;

// Standard working assumptions
export const WEEKS_PER_YEAR = 52;
export const WORKING_DAYS_PER_YEAR = 260;

// Types
export type PayPeriod = (typeof PERIODS)[keyof typeof PERIODS];
export type TaxYear = '2023-2024' | '2024-2025' | '2025-2026' | '2026-2027';
export type TaxBand = { name: string; rate: number; threshold: number };
export type StudentLoanPlan = 'plan1' | 'plan2' | 'plan4' | 'plan5' | 'postgrad';
export type StudentLoanSelection = StudentLoanPlan[] | 'none';
export type NICategory = 'A' | 'B' | 'C' | 'H' | 'J' | 'M' | 'Z';
export type AllowanceType =
  | 'workingFromHome'
  | 'professionalSubscriptions'
  | 'uniformUpkeep'
  | 'businessTravel'
  | 'toolsEquipment'
  | 'vehicleExpenses'
  | 'other';

export interface TaxAllowance {
  type: AllowanceType;
  name: string;
  description: string;
  amount: number;
  period: PayPeriod;
}

export interface PayrollPeriodThresholds {
  weekly: {
    payeFreePay: number;
    niPrimary: number;
    niUpper: number;
  };
  monthly: {
    payeFreePay: number;
    niPrimary: number;
    niUpper: number;
  };
}

// Available tax years (newest to oldest)
export const TAX_YEARS: TaxYear[] = ['2026-2027', '2025-2026', '2024-2025', '2023-2024'];
export const CURRENT_TAX_YEAR: TaxYear = TAX_YEARS[0] as TaxYear;

/**
 * Legislative traceability for key PAYE domains.
 *
 * Keep these references aligned with values in `TAX_RATES` when updating a tax year.
 * Use official primary sources wherever possible.
 */
export interface TaxYearLegislativeSources {
  incomeTax: {
    ukMainBands: string[];
    scotlandBands: string[];
  };
  nationalInsurance: {
    employeeAndEmployerClass1: string[];
    employmentAllowanceAndClass1A: string[];
  };
  dividends: {
    allowanceAndRates: string[];
  };
  studentLoan: {
    plansAndThresholds: string[];
  };
  verifiedOn: string; // YYYY-MM-DD (last manual verification pass)
  notes?: string[];
}

export const TAX_YEAR_SOURCES: Record<TaxYear, TaxYearLegislativeSources> = {
  '2026-2027': {
    incomeTax: {
      ukMainBands: [
        'https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027',
        'https://www.gov.uk/government/publications/budget-2025-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances',
      ],
      scotlandBands: [
        'https://www.gov.scot/publications/scottish-income-tax-rates-and-bands/pages/2026-to-2027/',
      ],
    },
    nationalInsurance: {
      employeeAndEmployerClass1: [
        'https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027',
        'https://www.gov.uk/government/publications/budget-2025-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances',
      ],
      employmentAllowanceAndClass1A: [
        'https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027',
        'https://www.gov.uk/claim-employment-allowance',
      ],
    },
    dividends: {
      allowanceAndRates: [
        'https://www.gov.uk/government/publications/budget-2025-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances',
      ],
    },
    studentLoan: {
      plansAndThresholds: [
        'https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027',
      ],
    },
    verifiedOn: '2026-07-01',
    notes: [
      '2026-27 dividend ordinary and upper rates increased, while the dividend allowance remained at £500.',
      'Scottish starter and basic thresholds increased for 2026-27; higher and above remain aligned to published Scottish Budget tables.',
    ],
  },
  '2023-2024': {
    incomeTax: {
      ukMainBands: ['https://www.gov.uk/income-tax-rates'],
      scotlandBands: ['https://www.gov.scot/publications/scottish-income-tax-2023-2024/'],
    },
    nationalInsurance: {
      employeeAndEmployerClass1: ['https://www.gov.uk/national-insurance-rates-letters'],
      employmentAllowanceAndClass1A: [
        'https://www.gov.uk/claim-employment-allowance',
        'https://www.gov.uk/government/publications/rates-and-allowances-national-insurance-contributions/rates-and-allowances-national-insurance-contributions',
      ],
    },
    dividends: {
      allowanceAndRates: ['https://www.gov.uk/tax-on-dividends'],
    },
    studentLoan: {
      plansAndThresholds: ['https://www.gov.uk/repaying-your-student-loan/what-you-pay'],
    },
    verifiedOn: '2026-02-19',
    notes: [
      'Use HMRC/GOV.UK published 2023-24 rates and thresholds when amending historical values.',
    ],
  },
  '2024-2025': {
    incomeTax: {
      ukMainBands: ['https://www.gov.uk/income-tax-rates'],
      scotlandBands: [
        'https://www.gov.scot/publications/scottish-income-tax-rates-and-bands/pages/rates-and-bands-2024-to-2025/',
      ],
    },
    nationalInsurance: {
      employeeAndEmployerClass1: ['https://www.gov.uk/national-insurance-rates-letters'],
      employmentAllowanceAndClass1A: [
        'https://www.gov.uk/claim-employment-allowance',
        'https://www.gov.uk/government/publications/rates-and-allowances-national-insurance-contributions/rates-and-allowances-national-insurance-contributions',
      ],
    },
    dividends: {
      allowanceAndRates: ['https://www.gov.uk/tax-on-dividends'],
    },
    studentLoan: {
      plansAndThresholds: ['https://www.gov.uk/repaying-your-student-loan/what-you-pay'],
    },
    verifiedOn: '2026-02-19',
  },
  '2025-2026': {
    incomeTax: {
      ukMainBands: ['https://www.gov.uk/income-tax-rates'],
      scotlandBands: ['https://www.mygov.scot/scottish-income-tax/current-income-tax-rates'],
    },
    nationalInsurance: {
      employeeAndEmployerClass1: ['https://www.gov.uk/national-insurance-rates-letters'],
      employmentAllowanceAndClass1A: [
        'https://www.gov.uk/claim-employment-allowance',
        'https://www.gov.uk/government/publications/rates-and-allowances-national-insurance-contributions/rates-and-allowances-national-insurance-contributions',
      ],
    },
    dividends: {
      allowanceAndRates: ['https://www.gov.uk/tax-on-dividends'],
    },
    studentLoan: {
      plansAndThresholds: ['https://www.gov.uk/repaying-your-student-loan/what-you-pay'],
    },
    verifiedOn: '2026-02-19',
    notes: [
      'Employer NI secondary threshold/rate and Employment Allowance updates are from Autumn Budget 2024 implementation for 2025-26.',
    ],
  },
};

interface TaxYearDisplayOptions {
  separator?: '-' | '/';
  shortEndYear?: boolean;
}

/**
 * Format tax year for display.
 * Examples: "2025-2026" -> "2025/2026", "2025-26"
 */
export function formatTaxYearDisplay(
  taxYear: string,
  { separator = '/', shortEndYear = false }: TaxYearDisplayOptions = {},
): string {
  const [start, end] = taxYear.split('-');
  if (!(start && end)) return taxYear;
  const endDisplay = shortEndYear ? end.slice(-2) : end;
  return `${start}${separator}${endDisplay}`;
}

export const CURRENT_TAX_YEAR_DISPLAY = formatTaxYearDisplay(CURRENT_TAX_YEAR);

export const PAYROLL_PERIOD_THRESHOLDS: Record<TaxYear, PayrollPeriodThresholds> = {
  '2026-2027': {
    weekly: { payeFreePay: 242, niPrimary: 242, niUpper: 967 },
    monthly: { payeFreePay: 1048, niPrimary: 1048, niUpper: 4189 },
  },
  '2025-2026': {
    weekly: { payeFreePay: 242, niPrimary: 242, niUpper: 967 },
    monthly: { payeFreePay: 1048, niPrimary: 1048, niUpper: 4189 },
  },
  '2024-2025': {
    weekly: { payeFreePay: 242, niPrimary: 242, niUpper: 967 },
    monthly: { payeFreePay: 1048, niPrimary: 1048, niUpper: 4189 },
  },
  '2023-2024': {
    weekly: { payeFreePay: 242, niPrimary: 242, niUpper: 967 },
    monthly: { payeFreePay: 1048, niPrimary: 1048, niUpper: 4189 },
  },
};

// Standard UK Tax Rates (England, Wales, NI)
export const TAX_RATES: Record<
  TaxYear,
  {
    personalAllowance: number;
    personalAllowanceReductionThreshold: number;
    personalAllowanceReductionRate: number;
    bands: TaxBand[];
    marriageAllowance: number;
    blindPersonsAllowance: number;
    dividendAllowance: number; // Tax-free dividend allowance
    vatRegistrationThreshold: number; // VAT registration threshold
    hicbc: {
      start: number; // High Income Child Benefit Charge start threshold
      end: number; // HICBC full clawback threshold
    };
    nationalInsurance: {
      employee: Record<
        NICategory,
        {
          primary: { threshold: number; rate: number };
          upper: { threshold: number; rate: number };
        }
      >;
      employer: Record<
        NICategory,
        {
          secondary: { threshold: number; rate: number };
        }
      >;
      employmentAllowance: number; // Annual EA that can offset employer NI
      class1A: { rate: number }; // Class 1A NI rate (%) on taxable benefits in kind
      lowerEarningsLimit: number; // LEL - minimum for NI credits / State Pension qualification
    };
    studentLoan: {
      plan1: { threshold: number; rate: number };
      plan2: { threshold: number; rate: number };
      plan4: { threshold: number; rate: number };
      plan5: { threshold: number; rate: number };
      postgrad: { threshold: number; rate: number };
    };
  }
> = {
  '2026-2027': {
    personalAllowance: 12570,
    personalAllowanceReductionThreshold: 100000,
    personalAllowanceReductionRate: 0.5,
    bands: [
      { name: 'Basic rate', rate: 20, threshold: 37700 },
      { name: 'Higher rate', rate: 40, threshold: 125140 },
      { name: 'Additional rate', rate: 45, threshold: Number.POSITIVE_INFINITY },
    ],
    marriageAllowance: 1260,
    blindPersonsAllowance: 3250,
    dividendAllowance: 500,
    vatRegistrationThreshold: 90000,
    hicbc: {
      start: 60000,
      end: 80000,
    },
    nationalInsurance: {
      employee: {
        A: {
          primary: { threshold: 12570, rate: 8 },
          upper: { threshold: 50270, rate: 2 },
        },
        B: {
          primary: { threshold: 12570, rate: 1.85 },
          upper: { threshold: 50270, rate: 2 },
        },
        C: {
          primary: { threshold: 12570, rate: 0 },
          upper: { threshold: 50270, rate: 0 },
        },
        H: {
          primary: { threshold: 12570, rate: 8 },
          upper: { threshold: 50270, rate: 2 },
        },
        J: {
          primary: { threshold: 12570, rate: 2 },
          upper: { threshold: 50270, rate: 2 },
        },
        M: {
          primary: { threshold: 12570, rate: 8 },
          upper: { threshold: 50270, rate: 2 },
        },
        Z: {
          primary: { threshold: 12570, rate: 2 },
          upper: { threshold: 50270, rate: 2 },
        },
      },
      employer: {
        A: {
          secondary: { threshold: 5000, rate: 15 },
        },
        B: {
          secondary: { threshold: 5000, rate: 15 },
        },
        C: {
          secondary: { threshold: 5000, rate: 15 },
        },
        H: {
          secondary: { threshold: 50270, rate: 15 },
        },
        J: {
          secondary: { threshold: 5000, rate: 15 },
        },
        M: {
          secondary: { threshold: 50270, rate: 15 },
        },
        Z: {
          secondary: { threshold: 50270, rate: 15 },
        },
      },
      employmentAllowance: 10500,
      class1A: { rate: 15 },
      lowerEarningsLimit: 6708,
    },
    studentLoan: {
      plan1: { threshold: 26900, rate: 9 },
      plan2: { threshold: 29385, rate: 9 },
      plan4: { threshold: 33795, rate: 9 },
      plan5: { threshold: 25000, rate: 9 },
      postgrad: { threshold: 21000, rate: 6 },
    },
  },
  '2023-2024': {
    personalAllowance: 12570,
    personalAllowanceReductionThreshold: 100000,
    personalAllowanceReductionRate: 0.5,
    bands: [
      { name: 'Basic rate', rate: 20, threshold: 37700 },
      { name: 'Higher rate', rate: 40, threshold: 125140 },
      { name: 'Additional rate', rate: 45, threshold: Number.POSITIVE_INFINITY },
    ],
    marriageAllowance: 1260,
    blindPersonsAllowance: 2870,
    dividendAllowance: 1000, // £1,000 for 2023-24 (reduced from £2,000)
    vatRegistrationThreshold: 85000,
    hicbc: {
      start: 50000,
      end: 60000,
    },
    nationalInsurance: {
      employee: {
        A: {
          primary: { threshold: 12570, rate: 12 },
          upper: { threshold: 50270, rate: 2 },
        },
        B: {
          primary: { threshold: 12570, rate: 5.85 },
          upper: { threshold: 50270, rate: 2 },
        },
        C: {
          primary: { threshold: 12570, rate: 0 },
          upper: { threshold: 50270, rate: 0 },
        },
        H: {
          primary: { threshold: 12570, rate: 12 },
          upper: { threshold: 50270, rate: 2 },
        },
        J: {
          primary: { threshold: 12570, rate: 2 },
          upper: { threshold: 50270, rate: 2 },
        },
        M: {
          primary: { threshold: 12570, rate: 12 },
          upper: { threshold: 50270, rate: 2 },
        },
        Z: {
          primary: { threshold: 12570, rate: 2 },
          upper: { threshold: 50270, rate: 2 },
        },
      },
      employer: {
        A: {
          secondary: { threshold: 9100, rate: 13.8 },
        },
        B: {
          secondary: { threshold: 9100, rate: 13.8 },
        },
        C: {
          secondary: { threshold: 9100, rate: 13.8 },
        },
        H: {
          // Apprentice under 25: 0% up to Upper Secondary Threshold (UST), then normal rate
          secondary: { threshold: 50270, rate: 13.8 }, // UST = £50,270
        },
        J: {
          secondary: { threshold: 9100, rate: 13.8 },
        },
        M: {
          // Under 21: 0% up to Upper Secondary Threshold (UST), then normal rate
          secondary: { threshold: 50270, rate: 13.8 }, // UST = £50,270
        },
        Z: {
          secondary: { threshold: 9100, rate: 13.8 },
        },
      },
      employmentAllowance: 5000, // £5,000 for 2023-24
      class1A: { rate: 13.8 }, // Class 1A NI on benefits in kind
      lowerEarningsLimit: 6396, // £123/week × 52 = £6,396/year
    },
    studentLoan: {
      plan1: { threshold: 22015, rate: 9 },
      plan2: { threshold: 27295, rate: 9 },
      plan4: { threshold: 27660, rate: 9 },
      plan5: { threshold: 25000, rate: 9 },
      postgrad: { threshold: 21000, rate: 6 },
    },
  },
  '2024-2025': {
    personalAllowance: 12570,
    personalAllowanceReductionThreshold: 100000,
    personalAllowanceReductionRate: 0.5,
    bands: [
      // Official 2024-25 UK tax bands (England, Wales, Northern Ireland)
      // Source: https://www.gov.uk/income-tax-rates
      // Updated: 2024-04-06
      // Thresholds represent cumulative taxable income (after personal allowance)
      { name: 'Basic rate', rate: 20, threshold: 37700 }, // £12,571-£50,270 total income
      { name: 'Higher rate', rate: 40, threshold: 125140 }, // £50,271-£125,140 total income
      { name: 'Additional rate', rate: 45, threshold: Number.POSITIVE_INFINITY }, // Above £125,140 total income
    ],
    marriageAllowance: 1260,
    blindPersonsAllowance: 3070,
    dividendAllowance: 500, // £500 for 2024-25 (reduced from £1,000)
    vatRegistrationThreshold: 90000,
    hicbc: {
      start: 60000,
      end: 80000,
    },
    nationalInsurance: {
      employee: {
        A: {
          primary: { threshold: 12570, rate: 8 }, // Updated to 8% as of April 2024
          upper: { threshold: 50270, rate: 2 },
        },
        B: {
          primary: { threshold: 12570, rate: 5 }, // Reduced from 5.85% to 5%
          upper: { threshold: 50270, rate: 2 },
        },
        C: {
          primary: { threshold: 12570, rate: 0 },
          upper: { threshold: 50270, rate: 0 },
        },
        H: {
          primary: { threshold: 12570, rate: 8 }, // Updated to 8% as of April 2024
          upper: { threshold: 50270, rate: 2 },
        },
        J: {
          primary: { threshold: 12570, rate: 2 },
          upper: { threshold: 50270, rate: 2 },
        },
        M: {
          primary: { threshold: 12570, rate: 8 }, // Updated to 8% as of April 2024
          upper: { threshold: 50270, rate: 2 },
        },
        Z: {
          primary: { threshold: 12570, rate: 2 },
          upper: { threshold: 50270, rate: 2 },
        },
      },
      employer: {
        A: {
          secondary: { threshold: 9100, rate: 13.8 },
        },
        B: {
          secondary: { threshold: 9100, rate: 13.8 },
        },
        C: {
          secondary: { threshold: 9100, rate: 13.8 },
        },
        H: {
          // Apprentice under 25: 0% up to Upper Secondary Threshold (UST), then normal rate
          secondary: { threshold: 50270, rate: 13.8 }, // UST = £50,270
        },
        J: {
          secondary: { threshold: 9100, rate: 13.8 },
        },
        M: {
          // Under 21: 0% up to Upper Secondary Threshold (UST), then normal rate
          secondary: { threshold: 50270, rate: 13.8 }, // UST = £50,270
        },
        Z: {
          secondary: { threshold: 9100, rate: 13.8 },
        },
      },
      employmentAllowance: 5000, // £5,000 for 2024-25
      class1A: { rate: 13.8 }, // Class 1A NI on benefits in kind
      lowerEarningsLimit: 6396, // £123/week × 52 = £6,396/year
    },
    studentLoan: {
      plan1: { threshold: 22015, rate: 9 },
      plan2: { threshold: 27295, rate: 9 },
      plan4: { threshold: 31395, rate: 9 },
      plan5: { threshold: 25000, rate: 9 },
      postgrad: { threshold: 21000, rate: 6 },
    },
  },
  '2025-2026': {
    personalAllowance: 12570,
    personalAllowanceReductionThreshold: 100000,
    personalAllowanceReductionRate: 0.5,
    bands: [
      { name: 'Basic rate', rate: 20, threshold: 37700 },
      { name: 'Higher rate', rate: 40, threshold: 125140 },
      { name: 'Additional rate', rate: 45, threshold: Number.POSITIVE_INFINITY },
    ],
    marriageAllowance: 1260,
    blindPersonsAllowance: 3130, // Updated from £3,070 for 2025-2026
    dividendAllowance: 500, // £500 for 2025-26 (maintained from 2024-25)
    vatRegistrationThreshold: 90000,
    hicbc: {
      start: 60000,
      end: 80000,
    },
    nationalInsurance: {
      employee: {
        A: {
          primary: { threshold: 12570, rate: 8 }, // Maintained at 8% for 2025-2026
          upper: { threshold: 50270, rate: 2 },
        },
        B: {
          primary: { threshold: 12570, rate: 5 }, // Maintained at 5% for 2025-2026
          upper: { threshold: 50270, rate: 2 },
        },
        C: {
          primary: { threshold: 12570, rate: 0 },
          upper: { threshold: 50270, rate: 0 },
        },
        H: {
          primary: { threshold: 12570, rate: 8 },
          upper: { threshold: 50270, rate: 2 },
        },
        J: {
          primary: { threshold: 12570, rate: 2 },
          upper: { threshold: 50270, rate: 2 },
        },
        M: {
          primary: { threshold: 12570, rate: 8 },
          upper: { threshold: 50270, rate: 2 },
        },
        Z: {
          primary: { threshold: 12570, rate: 2 },
          upper: { threshold: 50270, rate: 2 },
        },
      },
      employer: {
        // Updated employer NI rates for 2025-2026 as per Autumn Budget 2024
        A: {
          secondary: { threshold: 5000, rate: 15 }, // Updated from £9,100/13.8% to £5,000/15%
        },
        B: {
          secondary: { threshold: 5000, rate: 15 }, // Updated from £9,100/13.8% to £5,000/15%
        },
        C: {
          secondary: { threshold: 5000, rate: 15 }, // Updated from £9,100/13.8% to £5,000/15%
        },
        H: {
          // Apprentice under 25: 0% up to Upper Secondary Threshold (UST), then normal rate
          secondary: { threshold: 50270, rate: 15 }, // UST = £50,270
        },
        J: {
          secondary: { threshold: 5000, rate: 15 }, // Updated from £9,100/13.8% to £5,000/15%
        },
        M: {
          // Under 21: 0% up to Upper Secondary Threshold (UST), then normal rate
          secondary: { threshold: 50270, rate: 15 }, // UST = £50,270
        },
        Z: {
          secondary: { threshold: 5000, rate: 15 }, // Updated from £9,100/13.8% to £5,000/15%
        },
      },
      employmentAllowance: 10500, // Increased from £5,000 to £10,500 in Autumn Budget 2024
      class1A: { rate: 15 }, // Class 1A NI on benefits in kind
      lowerEarningsLimit: 6500, // £125/week × 52 = £6,500/year (increased from £6,396)
    },
    studentLoan: {
      // Updated thresholds for 2025-2026
      // Source: https://www.gov.uk/repaying-your-student-loan/what-you-pay
      plan1: { threshold: 26065, rate: 9 },
      plan2: { threshold: 28470, rate: 9 },
      plan4: { threshold: 32745, rate: 9 }, // Fixed: was £31,395 (2024/25)
      plan5: { threshold: 25000, rate: 9 },
      postgrad: { threshold: 21000, rate: 6 },
    },
  },
};

// Scottish Tax Rates (different banding from rest of UK)
export const SCOTTISH_TAX_RATES: Record<
  TaxYear,
  {
    personalAllowance: number;
    personalAllowanceReductionThreshold: number;
    personalAllowanceReductionRate: number;
    bands: TaxBand[];
    marriageAllowance: number;
    blindPersonsAllowance: number;
  }
> = {
  '2026-2027': {
    personalAllowance: 12570,
    personalAllowanceReductionThreshold: 100000,
    personalAllowanceReductionRate: 0.5,
    bands: [
      { name: 'Starter rate', rate: 19, threshold: 3967 },
      { name: 'Basic rate', rate: 20, threshold: 16956 },
      { name: 'Intermediate rate', rate: 21, threshold: 31092 },
      { name: 'Higher rate', rate: 42, threshold: 62430 },
      { name: 'Advanced rate', rate: 45, threshold: 112570 },
      { name: 'Top rate', rate: 48, threshold: Number.POSITIVE_INFINITY },
    ],
    marriageAllowance: 1260,
    blindPersonsAllowance: 3250,
  },
  '2023-2024': {
    personalAllowance: 12570,
    personalAllowanceReductionThreshold: 100000,
    personalAllowanceReductionRate: 0.5,
    bands: [
      // Official 2023-24 Scottish tax bands (5 bands)
      // Source: https://www.gov.scot/publications/scottish-income-tax-2023-2024/
      // Updated: 2023-04-06
      // Thresholds represent cumulative taxable income (after personal allowance)
      { name: 'Starter rate', rate: 19, threshold: 2162 }, // £12,571-£14,732 total income
      { name: 'Basic rate', rate: 20, threshold: 13118 }, // £14,733-£25,688 total income
      { name: 'Intermediate rate', rate: 21, threshold: 31092 }, // £25,689-£43,662 total income
      { name: 'Higher rate', rate: 42, threshold: 112570 }, // £43,663-£125,140 total income
      { name: 'Top rate', rate: 47, threshold: Number.POSITIVE_INFINITY }, // Above £125,140 total income
    ],
    marriageAllowance: 1260,
    blindPersonsAllowance: 2870,
  },
  '2024-2025': {
    personalAllowance: 12570,
    personalAllowanceReductionThreshold: 100000,
    personalAllowanceReductionRate: 0.5,
    bands: [
      // Official 2024-25 Scottish tax bands (6 bands)
      // Source: https://www.gov.scot/publications/scottish-income-tax-rates-and-bands/pages/rates-and-bands-2024-to-2025/
      // Updated: 2024-04-06 (Budget 2024)
      // Thresholds represent cumulative taxable income (after personal allowance)
      { name: 'Starter rate', rate: 19, threshold: 2306 }, // £12,571-£14,876 total income
      { name: 'Basic rate', rate: 20, threshold: 13991 }, // £14,877-£26,561 total income
      { name: 'Intermediate rate', rate: 21, threshold: 31092 }, // £26,562-£43,662 total income
      { name: 'Higher rate', rate: 42, threshold: 62430 }, // £43,663-£75,000 total income
      { name: 'Advanced rate', rate: 45, threshold: 112570 }, // £75,001-£125,140 total income
      // Top rate rose from 47% to 48% at the 2024-25 Scottish Budget.
      // Source: https://www.gov.scot/publications/scottish-income-tax-rates-and-bands/pages/rates-and-bands-2024-to-2025/
      { name: 'Top rate', rate: 48, threshold: Number.POSITIVE_INFINITY }, // Above £125,140 total income
    ],
    marriageAllowance: 1260,
    blindPersonsAllowance: 3070,
  },
  '2025-2026': {
    personalAllowance: 12570,
    personalAllowanceReductionThreshold: 100000,
    personalAllowanceReductionRate: 0.5,
    bands: [
      // Official 2025-26 Scottish tax bands (6 bands)
      // Source: https://www.mygov.scot/scottish-income-tax/current-income-tax-rates
      // Updated: 2025-04-06 (Budget 2025)
      // Thresholds represent cumulative taxable income (after personal allowance)
      { name: 'Starter rate', rate: 19, threshold: 2827 }, // £12,571-£15,397 total income
      { name: 'Basic rate', rate: 20, threshold: 14921 }, // £15,398-£27,491 total income
      { name: 'Intermediate rate', rate: 21, threshold: 31092 }, // £27,492-£43,662 total income
      { name: 'Higher rate', rate: 42, threshold: 62430 }, // £43,663-£75,000 total income
      { name: 'Advanced rate', rate: 45, threshold: 112570 }, // £75,001-£125,140 total income
      { name: 'Top rate', rate: 48, threshold: Number.POSITIVE_INFINITY }, // Above £125,140 total income
    ],
    marriageAllowance: 1260,
    blindPersonsAllowance: 3130, // Updated from £3,070 for 2025-2026
  },
};

// ============================================================================
// DIVIDEND TAX RATES
// ============================================================================
//
// Dividend tax rates for UK shareholders. These rates apply after the
// dividend allowance and are based on the individual's income tax band.
//
// For the dividend allowance, always use TAX_RATES[year].dividendAllowance (year-specific).
//
// @see https://www.gov.uk/tax-on-dividends

export const DIVIDEND_TAX_RATES: Record<
  TaxYear,
  {
    BASIC_RATE: number;
    HIGHER_RATE: number;
    ADDITIONAL_RATE: number;
  }
> = {
  '2023-2024': {
    BASIC_RATE: 0.0875,
    HIGHER_RATE: 0.3375,
    ADDITIONAL_RATE: 0.3935,
  },
  '2024-2025': {
    BASIC_RATE: 0.0875,
    HIGHER_RATE: 0.3375,
    ADDITIONAL_RATE: 0.3935,
  },
  '2025-2026': {
    BASIC_RATE: 0.0875,
    HIGHER_RATE: 0.3375,
    ADDITIONAL_RATE: 0.3935,
  },
  '2026-2027': {
    BASIC_RATE: 0.1075,
    HIGHER_RATE: 0.3575,
    ADDITIONAL_RATE: 0.3935,
  },
};

export const DIVIDEND_RATES = DIVIDEND_TAX_RATES[CURRENT_TAX_YEAR];

export type DividendRates = (typeof DIVIDEND_TAX_RATES)[TaxYear];

// ============================================================================
// CORPORATION TAX RATES (April 2023 onwards)
// ============================================================================
//
// Corporation Tax rates for UK limited companies. The rate depends on
// taxable profits, with marginal relief for profits between £50k-£250k.
//
// @see https://www.gov.uk/government/publications/rates-and-allowances-corporation-tax

export const CT_RATES = {
  /** Small profits rate (19%) - applies to profits ≤ £50,000 */
  SMALL_PROFITS_RATE: 0.19,

  /** Small profits threshold */
  SMALL_PROFITS_LIMIT: 50_000,

  /** Main rate (25%) - applies to profits ≥ £250,000 */
  MAIN_RATE: 0.25,

  /** Main rate threshold */
  MAIN_RATE_LIMIT: 250_000,

  /**
   * Marginal relief fraction (3/200 = 0.015)
   *
   * Used to calculate the smooth transition between small profits rate
   * and main rate for profits between £50,000 and £250,000.
   *
   * Formula: Marginal Relief = (Upper Limit - Profits) × (Profits / Profits) × 3/200
   */
  MARGINAL_RELIEF_FRACTION: 3 / 200,
} as const;

export type CorporationTaxRates = typeof CT_RATES;
