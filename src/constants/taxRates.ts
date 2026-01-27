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
// Updated: 2025-04-06 for tax year 2025-2026
// Source: https://www.gov.uk/income-tax-rates

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
export type TaxYear = '2023-2024' | '2024-2025' | '2025-2026';
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

// Available tax years (newest to oldest)
export const TAX_YEARS: TaxYear[] = ['2025-2026', '2024-2025', '2023-2024'];

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
    // Age-related allowances (LEGACY - frozen since 2016, applies only to those born before 6 April 1938)
    ageAllowance65to74: number;
    ageAllowance75plus: number;
    ageAllowanceTaperThreshold: number;
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
    // Age-related allowances (LEGACY - frozen since 2016, only for those born before 6 April 1938)
    ageAllowance65to74: 3660,
    ageAllowance75plus: 3960,
    ageAllowanceTaperThreshold: 34600,
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
          secondary: { threshold: 9100, rate: 13.8 },
        },
        J: {
          secondary: { threshold: 9100, rate: 13.8 },
        },
        M: {
          secondary: { threshold: 9100, rate: 13.8 },
        },
        Z: {
          secondary: { threshold: 9100, rate: 13.8 },
        },
      },
      employmentAllowance: 5000, // £5,000 for 2023-24
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
    // Age-related allowances (LEGACY - frozen since 2016, only for those born before 6 April 1938)
    ageAllowance65to74: 3660,
    ageAllowance75plus: 3960,
    ageAllowanceTaperThreshold: 34600,
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
          secondary: { threshold: 9100, rate: 13.8 },
        },
        J: {
          secondary: { threshold: 9100, rate: 13.8 },
        },
        M: {
          secondary: { threshold: 9100, rate: 13.8 },
        },
        Z: {
          secondary: { threshold: 9100, rate: 13.8 },
        },
      },
      employmentAllowance: 5000, // £5,000 for 2024-25
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
    // Age-related allowances (LEGACY - frozen since 2016, only for those born before 6 April 1938)
    ageAllowance65to74: 3660,
    ageAllowance75plus: 3960,
    ageAllowanceTaperThreshold: 34600,
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
          secondary: { threshold: 5000, rate: 15 }, // Updated from £9,100/13.8% to £5,000/15%
        },
        J: {
          secondary: { threshold: 5000, rate: 15 }, // Updated from £9,100/13.8% to £5,000/15%
        },
        M: {
          secondary: { threshold: 5000, rate: 15 }, // Updated from £9,100/13.8% to £5,000/15%
        },
        Z: {
          secondary: { threshold: 5000, rate: 15 }, // Updated from £9,100/13.8% to £5,000/15%
        },
      },
      employmentAllowance: 10500, // Increased from £5,000 to £10,500 in Autumn Budget 2024
      lowerEarningsLimit: 6500, // £125/week × 52 = £6,500/year (increased from £6,396)
    },
    studentLoan: {
      // Updated thresholds for 2025-2026 (9% increase from frozen rates)
      // Source: https://www.gov.uk/repaying-your-student-loan
      plan1: { threshold: 26065, rate: 9 }, // Updated from £22,015
      plan2: { threshold: 28470, rate: 9 }, // Updated from £27,295
      plan4: { threshold: 31395, rate: 9 }, // Updated from £27,660
      plan5: { threshold: 25000, rate: 9 }, // Unchanged
      postgrad: { threshold: 21000, rate: 6 }, // Unchanged
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
    // Age-related allowances (LEGACY - frozen since 2016, applies only to those born before 6 April 1938)
    ageAllowance65to74: number;
    ageAllowance75plus: number;
    ageAllowanceTaperThreshold: number;
  }
> = {
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
      { name: 'Higher rate', rate: 41, threshold: 112570 }, // £43,663-£125,140 total income (corrected from 42%)
      { name: 'Top rate', rate: 46, threshold: Number.POSITIVE_INFINITY }, // Above £125,140 total income (corrected from 47%)
    ],
    marriageAllowance: 1260,
    blindPersonsAllowance: 2870,
    ageAllowance65to74: 3660,
    ageAllowance75plus: 3960,
    ageAllowanceTaperThreshold: 34600,
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
      { name: 'Top rate', rate: 47, threshold: Number.POSITIVE_INFINITY }, // Above £125,140 total income (corrected from 48%)
    ],
    marriageAllowance: 1260,
    blindPersonsAllowance: 3070,
    ageAllowance65to74: 3660,
    ageAllowance75plus: 3960,
    ageAllowanceTaperThreshold: 34600,
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
    ageAllowance65to74: 3660,
    ageAllowance75plus: 3960,
    ageAllowanceTaperThreshold: 34600,
  },
};
