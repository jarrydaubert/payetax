// src/constants/taxRates.ts
// Tax rates and thresholds for UK PAYE calculations

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

// Types
export type PayPeriod = (typeof PERIODS)[keyof typeof PERIODS];
export type TaxYear = '2023-2024' | '2024-2025' | '2025-2026';
export type TaxBand = { name: string; rate: number; threshold: number };
export type StudentLoanPlan = 'plan1' | 'plan2' | 'plan4' | 'plan5' | 'postgrad' | 'none';
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

// Available tax years
export const TAX_YEARS: TaxYear[] = ['2023-2024', '2024-2025', '2025-2026'];

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
      { name: 'Basic rate', rate: 20, threshold: 37700 },
      { name: 'Higher rate', rate: 40, threshold: 125140 },
      { name: 'Additional rate', rate: 45, threshold: Number.POSITIVE_INFINITY },
    ],
    marriageAllowance: 1260,
    blindPersonsAllowance: 3070,
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
    blindPersonsAllowance: 3070,
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
    },
    studentLoan: {
      plan1: { threshold: 22015, rate: 9 },
      plan2: { threshold: 27295, rate: 9 },
      plan4: { threshold: 27660, rate: 9 },
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
  }
> = {
  '2023-2024': {
    personalAllowance: 12570,
    personalAllowanceReductionThreshold: 100000,
    personalAllowanceReductionRate: 0.5,
    bands: [
      { name: 'Starter rate', rate: 19, threshold: 2162 },
      { name: 'Basic rate', rate: 20, threshold: 13118 },
      { name: 'Intermediate rate', rate: 21, threshold: 31092 },
      { name: 'Higher rate', rate: 42, threshold: 125140 },
      { name: 'Top rate', rate: 47, threshold: Number.POSITIVE_INFINITY },
    ],
  },
  '2024-2025': {
    personalAllowance: 12570,
    personalAllowanceReductionThreshold: 100000,
    personalAllowanceReductionRate: 0.5,
    bands: [
      // These are the correct 2024-2025 Scottish tax bands
      // Note: These thresholds are relative to £0, not to personal allowance
      { name: 'Starter rate', rate: 19, threshold: 2306 },
      { name: 'Basic rate', rate: 20, threshold: 11685 + 2306 }, // £13,991 (up to £26,561)
      { name: 'Intermediate rate', rate: 21, threshold: 17101 + 11685 + 2306 }, // £31,092 (up to £43,662)
      { name: 'Higher rate', rate: 42, threshold: 81478 + 17101 + 11685 + 2306 }, // £112,570 (up to £125,140)
      { name: 'Top rate', rate: 47, threshold: Number.POSITIVE_INFINITY },
    ],
  },
  '2025-2026': {
    personalAllowance: 12570,
    personalAllowanceReductionThreshold: 100000,
    personalAllowanceReductionRate: 0.5,
    bands: [
      // Using 2024-2025 Scottish tax bands as a prediction for 2025-2026
      // These values reflect the analysis provided and correct cumulative thresholds
      { name: 'Starter rate', rate: 19, threshold: 2306 },
      { name: 'Basic rate', rate: 20, threshold: 2306 + 11685 }, // £13,991 (up to £26,561)
      { name: 'Intermediate rate', rate: 21, threshold: 2306 + 11685 + 17101 }, // £31,092 (up to £43,662)
      { name: 'Higher rate', rate: 42, threshold: 2306 + 11685 + 17101 + 81478 }, // £112,570 (up to £125,140)
      { name: 'Top rate', rate: 47, threshold: Number.POSITIVE_INFINITY },
    ],
  },
};
