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

// Types
export type PayPeriod = (typeof PERIODS)[keyof typeof PERIODS];
export type TaxYear = '2023-2024' | '2024-2025' | '2025-2026' | '2026-2027';

// ============================================================================
// UNIT & BASIS VOCABULARY
// ============================================================================
//
// Transparent aliases (each is `number`/`string`) that make the unit and basis
// of every policy value explicit at the type level, so consumers no longer rely
// on naming conventions or hidden arithmetic. They document intent and are
// enforced at runtime by the invariant tests in
// `src/constants/__tests__/taxPolicyModel.test.ts`.

/** A tax rate expressed as a percentage number, e.g. `20` means 20%. Consumers divide by 100. */
export type PercentageRate = number;
/** A tax rate expressed as a fraction, e.g. `0.0875` means 8.75%. Consumers multiply directly. */
export type FractionRate = number;
/** A monetary amount in GBP on an ANNUAL basis. */
export type AnnualAmountGBP = number;
/**
 * A monetary amount in GBP on a payroll-PERIOD basis. These are HMRC-published
 * period figures and are deliberately NOT the annual amount divided by 12 or 52.
 */
export type PeriodAmountGBP = number;
/**
 * A cumulative TAXABLE-income upper bound in GBP (income after the Personal
 * Allowance), per ITA 2007 / the Scottish Rate Resolution. `+Infinity` marks an
 * open-ended top band.
 */
export type TaxableIncomeUpperBoundGBP = number;
/** A TOTAL-income threshold in GBP, measured on gross/adjusted income (not taxable income). */
export type TotalIncomeThresholdGBP = number;
/** A dimensionless ratio, e.g. `0.5` for £1 lost per £2. */
export type Ratio = number;
/** An effective date for a within-year policy change, ISO `YYYY-MM-DD`. */
export type EffectiveDateISO = string;

export type TaxBand = {
  name: string;
  rate: PercentageRate;
  /** Cumulative taxable-income upper bound (after PA); `+Infinity` for the top band. */
  threshold: TaxableIncomeUpperBoundGBP;
};
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

/**
 * HMRC-published payroll-period thresholds. Every value is a `PeriodAmountGBP`:
 * a published period figure, deliberately not the annual amount divided by 12/52.
 */
export interface PayrollPeriodThresholds {
  weekly: {
    /** Reference-only HMRC value: no production path computes weekly free pay. */
    payeFreePay: PeriodAmountGBP;
    /** Primary Threshold on a weekly basis. */
    niPrimary: PeriodAmountGBP;
    /** Upper Earnings Limit on a weekly basis. */
    niUpper: PeriodAmountGBP;
  };
  monthly: {
    payeFreePay: PeriodAmountGBP;
    /** Primary Threshold on a monthly basis. */
    niPrimary: PeriodAmountGBP;
    /** Upper Earnings Limit on a monthly basis. */
    niUpper: PeriodAmountGBP;
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
      employeeAndEmployerClass1: [
        'https://www.gov.uk/national-insurance-rates-letters',
        'https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2023-to-2024',
        'https://www.gov.uk/hmrc-internal-manuals/national-insurance-manual/nim01625',
      ],
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
    verifiedOn: '2026-07-20',
    notes: [
      'Use HMRC/GOV.UK published 2023-24 rates and thresholds when amending historical values.',
      'The main primary percentage was cut from 12% to 10% for earnings paid on or after 6 January 2024, and the reduced rate from 5.85% to 3.85%. Payroll periods take the rate in force on the pay date; the annual earnings period (directors) takes HMRC published blended rates of 11.5% and 5.35%. These are two separate statutory bases and do not reconcile to the same figure.',
      'The additional (upper) rate, employer secondary rate, Class 1A and Class 1B rates were unchanged mid-year.',
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
      employeeAndEmployerClass1: [
        'https://www.gov.uk/national-insurance-rates-letters',
        'https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2024-to-2025',
      ],
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
    verifiedOn: '2026-07-20',
    notes: [
      "Class 1 NI re-verified against the published employer tables. The married women's/widows' reduced rate (category B) was corrected to 1.85%; it had been recorded as 5%.",
    ],
  },
  '2025-2026': {
    incomeTax: {
      ukMainBands: ['https://www.gov.uk/income-tax-rates'],
      scotlandBands: ['https://www.mygov.scot/scottish-income-tax/current-income-tax-rates'],
    },
    nationalInsurance: {
      employeeAndEmployerClass1: [
        'https://www.gov.uk/national-insurance-rates-letters',
        'https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026',
      ],
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
    verifiedOn: '2026-07-20',
    notes: [
      'Employer NI secondary threshold/rate and Employment Allowance updates are from Autumn Budget 2024 implementation for 2025-26.',
      "Class 1 NI re-verified against the published employer tables. The married women's/widows' reduced rate (category B) was corrected to 1.85%; it had been recorded as 5%.",
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

/** An effective-dated primary NI rate change within a tax year. */
export interface PrimaryRateChange {
  /** ISO date the later rate takes effect. Payroll selects by pay date; never averages. */
  effectiveFrom: EffectiveDateISO;
  /** The primary percentage in force from `effectiveFrom` onwards. */
  rate: PercentageRate;
}

/** Employee Class 1 NI policy for one NI category. */
export interface Class1EmployeeRates {
  /** `rate` is the primary percentage in force on 6 April; mid-year changes live in `primaryRateChanges`. */
  primary: { threshold: AnnualAmountGBP; rate: PercentageRate };
  upper: { threshold: AnnualAmountGBP; rate: PercentageRate };
  /**
   * Effective-dated primary rate changes within the tax year, ascending by date.
   * Present only where HMRC changed the rate mid-year. Payroll (pay period)
   * calculations select a rate by pay date; they never average.
   */
  primaryRateChanges?: readonly PrimaryRateChange[];
  /**
   * HMRC's published blended primary rate for the annual earnings period
   * (directors). Present only alongside `primaryRateChanges`. A published
   * statutory figure, not a value derived from the changes above.
   */
  directorsPrimaryRate?: PercentageRate;
}

/** Employer Class 1 NI policy for one NI category. */
export interface Class1EmployerRates {
  /**
   * `threshold` is the ANNUAL secondary threshold; `weeklyThreshold` and
   * `monthlyThreshold` are HMRC's published period figures, which are not the
   * annual value divided by 52 or 12.
   */
  secondary: {
    threshold: AnnualAmountGBP;
    rate: PercentageRate;
    weeklyThreshold: PeriodAmountGBP;
    monthlyThreshold: PeriodAmountGBP;
  };
}

/** Income-contingent student loan repayment policy for one plan. */
export interface StudentLoanPlanRates {
  threshold: AnnualAmountGBP;
  rate: PercentageRate;
}

/** National Insurance policy for a tax year. */
export interface NationalInsurancePolicy {
  employee: Record<NICategory, Class1EmployeeRates>;
  employer: Record<NICategory, Class1EmployerRates>;
  /** Annual Employment Allowance that can offset employer NI. */
  employmentAllowance: AnnualAmountGBP;
  /** Class 1A NI rate on taxable benefits in kind. */
  class1A: { rate: PercentageRate };
  /** Lower Earnings Limit — annual minimum for NI credits / State Pension qualification. */
  lowerEarningsLimit: AnnualAmountGBP;
}

/** The rest-of-UK (England, Wales, Northern Ireland) statutory policy for a tax year. */
export interface RukTaxYearPolicy {
  personalAllowance: AnnualAmountGBP;
  personalAllowanceReductionThreshold: TotalIncomeThresholdGBP;
  personalAllowanceReductionRate: Ratio;
  bands: TaxBand[];
  marriageAllowance: AnnualAmountGBP;
  blindPersonsAllowance: AnnualAmountGBP;
  /** Tax-free dividend allowance. */
  dividendAllowance: AnnualAmountGBP;
  /** VAT registration turnover threshold. */
  vatRegistrationThreshold: AnnualAmountGBP;
  hicbc: {
    /** High Income Child Benefit Charge start threshold (total income). */
    start: TotalIncomeThresholdGBP;
    /** HICBC full clawback threshold (total income). */
    end: TotalIncomeThresholdGBP;
  };
  nationalInsurance: NationalInsurancePolicy;
  studentLoan: {
    plan1: StudentLoanPlanRates;
    plan2: StudentLoanPlanRates;
    plan4: StudentLoanPlanRates;
    plan5: StudentLoanPlanRates;
    postgrad: StudentLoanPlanRates;
  };
}

// Standard UK Tax Rates (England, Wales, NI)
export const TAX_RATES: Record<TaxYear, RukTaxYearPolicy> = {
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
        // Secondary Threshold: £96/week, £417/month, £5,000/year
        A: {
          secondary: { threshold: 5000, rate: 15, weeklyThreshold: 96, monthlyThreshold: 417 },
        },
        B: {
          secondary: { threshold: 5000, rate: 15, weeklyThreshold: 96, monthlyThreshold: 417 },
        },
        C: {
          secondary: { threshold: 5000, rate: 15, weeklyThreshold: 96, monthlyThreshold: 417 },
        },
        H: {
          // Apprentice under 25: 0% up to Apprentice Upper Secondary Threshold
          secondary: { threshold: 50270, rate: 15, weeklyThreshold: 967, monthlyThreshold: 4189 },
        },
        J: {
          secondary: { threshold: 5000, rate: 15, weeklyThreshold: 96, monthlyThreshold: 417 },
        },
        M: {
          // Under 21: 0% up to Upper Secondary Threshold
          secondary: { threshold: 50270, rate: 15, weeklyThreshold: 967, monthlyThreshold: 4189 },
        },
        Z: {
          // Under 21 with deferment: same employer UST as category M
          secondary: { threshold: 50270, rate: 15, weeklyThreshold: 967, monthlyThreshold: 4189 },
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
      // The main primary percentage was cut from 6 January 2024 (Autumn Statement 2023).
      // `primary.rate` is the opening rate; `primaryRateChanges` carries the cut, and
      // `directorsPrimaryRate` is HMRC's published annual earnings-period (blended) rate.
      // The additional (upper) rate and every employer rate were unchanged.
      employee: {
        A: {
          primary: { threshold: 12570, rate: 12 },
          upper: { threshold: 50270, rate: 2 },
          primaryRateChanges: [{ effectiveFrom: '2024-01-06', rate: 10 }],
          directorsPrimaryRate: 11.5,
        },
        B: {
          // Married women's/widows' reduced rate: 5.85% then 3.85%, blended 5.35%
          primary: { threshold: 12570, rate: 5.85 },
          upper: { threshold: 50270, rate: 2 },
          primaryRateChanges: [{ effectiveFrom: '2024-01-06', rate: 3.85 }],
          directorsPrimaryRate: 5.35,
        },
        C: {
          // Over State Pension age: no employee contributions, so nothing changed
          primary: { threshold: 12570, rate: 0 },
          upper: { threshold: 50270, rate: 0 },
        },
        H: {
          primary: { threshold: 12570, rate: 12 },
          upper: { threshold: 50270, rate: 2 },
          primaryRateChanges: [{ effectiveFrom: '2024-01-06', rate: 10 }],
          directorsPrimaryRate: 11.5,
        },
        J: {
          // Deferment: charged at the additional rate throughout, so unchanged
          primary: { threshold: 12570, rate: 2 },
          upper: { threshold: 50270, rate: 2 },
        },
        M: {
          primary: { threshold: 12570, rate: 12 },
          upper: { threshold: 50270, rate: 2 },
          primaryRateChanges: [{ effectiveFrom: '2024-01-06', rate: 10 }],
          directorsPrimaryRate: 11.5,
        },
        Z: {
          // Deferment: charged at the additional rate throughout, so unchanged
          primary: { threshold: 12570, rate: 2 },
          upper: { threshold: 50270, rate: 2 },
        },
      },
      employer: {
        // Secondary Threshold: £175/week, £758/month, £9,100/year.
        // The employer secondary rate did not change mid-year in 2023-24.
        A: {
          secondary: { threshold: 9100, rate: 13.8, weeklyThreshold: 175, monthlyThreshold: 758 },
        },
        B: {
          secondary: { threshold: 9100, rate: 13.8, weeklyThreshold: 175, monthlyThreshold: 758 },
        },
        C: {
          secondary: { threshold: 9100, rate: 13.8, weeklyThreshold: 175, monthlyThreshold: 758 },
        },
        H: {
          // Apprentice under 25: 0% up to Apprentice Upper Secondary Threshold
          secondary: { threshold: 50270, rate: 13.8, weeklyThreshold: 967, monthlyThreshold: 4189 },
        },
        J: {
          secondary: { threshold: 9100, rate: 13.8, weeklyThreshold: 175, monthlyThreshold: 758 },
        },
        M: {
          // Under 21: 0% up to Upper Secondary Threshold
          secondary: { threshold: 50270, rate: 13.8, weeklyThreshold: 967, monthlyThreshold: 4189 },
        },
        Z: {
          // Under 21 with deferment: same employer UST as category M
          secondary: { threshold: 50270, rate: 13.8, weeklyThreshold: 967, monthlyThreshold: 4189 },
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
          // Married women's/widows' reduced rate tracks the main rate's cuts:
          // 5.85% -> 3.85% (6 Jan 2024) -> 1.85% (6 Apr 2024)
          primary: { threshold: 12570, rate: 1.85 },
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
        // Secondary Threshold: £175/week, £758/month, £9,100/year
        A: {
          secondary: { threshold: 9100, rate: 13.8, weeklyThreshold: 175, monthlyThreshold: 758 },
        },
        B: {
          secondary: { threshold: 9100, rate: 13.8, weeklyThreshold: 175, monthlyThreshold: 758 },
        },
        C: {
          secondary: { threshold: 9100, rate: 13.8, weeklyThreshold: 175, monthlyThreshold: 758 },
        },
        H: {
          // Apprentice under 25: 0% up to Apprentice Upper Secondary Threshold
          secondary: { threshold: 50270, rate: 13.8, weeklyThreshold: 967, monthlyThreshold: 4189 },
        },
        J: {
          secondary: { threshold: 9100, rate: 13.8, weeklyThreshold: 175, monthlyThreshold: 758 },
        },
        M: {
          // Under 21: 0% up to Upper Secondary Threshold
          secondary: { threshold: 50270, rate: 13.8, weeklyThreshold: 967, monthlyThreshold: 4189 },
        },
        Z: {
          // Under 21 with deferment: same employer UST as category M
          secondary: { threshold: 50270, rate: 13.8, weeklyThreshold: 967, monthlyThreshold: 4189 },
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
          // Married women's/widows' reduced rate, unchanged from 2024-25
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
        // Updated employer NI rates for 2025-2026 as per Autumn Budget 2024
        // Secondary Threshold: £96/week, £417/month, £5,000/year
        A: {
          secondary: { threshold: 5000, rate: 15, weeklyThreshold: 96, monthlyThreshold: 417 },
        },
        B: {
          secondary: { threshold: 5000, rate: 15, weeklyThreshold: 96, monthlyThreshold: 417 },
        },
        C: {
          secondary: { threshold: 5000, rate: 15, weeklyThreshold: 96, monthlyThreshold: 417 },
        },
        H: {
          // Apprentice under 25: 0% up to Apprentice Upper Secondary Threshold
          secondary: { threshold: 50270, rate: 15, weeklyThreshold: 967, monthlyThreshold: 4189 },
        },
        J: {
          secondary: { threshold: 5000, rate: 15, weeklyThreshold: 96, monthlyThreshold: 417 },
        },
        M: {
          // Under 21: 0% up to Upper Secondary Threshold
          secondary: { threshold: 50270, rate: 15, weeklyThreshold: 967, monthlyThreshold: 4189 },
        },
        Z: {
          // Under 21 with deferment: same employer UST as category M
          secondary: { threshold: 50270, rate: 15, weeklyThreshold: 967, monthlyThreshold: 4189 },
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

/** Scottish statutory income-tax policy for a tax year (different banding from rUK). */
export interface ScottishTaxYearPolicy {
  personalAllowance: AnnualAmountGBP;
  personalAllowanceReductionThreshold: TotalIncomeThresholdGBP;
  personalAllowanceReductionRate: Ratio;
  bands: TaxBand[];
  marriageAllowance: AnnualAmountGBP;
  blindPersonsAllowance: AnnualAmountGBP;
}

// Scottish Tax Rates (different banding from rest of UK)
export const SCOTTISH_TAX_RATES: Record<TaxYear, ScottishTaxYearPolicy> = {
  '2026-2027': {
    personalAllowance: 12570,
    personalAllowanceReductionThreshold: 100000,
    personalAllowanceReductionRate: 0.5,
    bands: [
      { name: 'Starter rate', rate: 19, threshold: 3967 },
      { name: 'Basic rate', rate: 20, threshold: 16956 },
      { name: 'Intermediate rate', rate: 21, threshold: 31092 },
      { name: 'Higher rate', rate: 42, threshold: 62430 },
      // Advanced band runs to £125,140 of TAXABLE income per the Scottish Rate
      // Resolution — the Personal Allowance is fully tapered before that point,
      // so the top rate starts at £125,140 whether measured as taxable or total.
      { name: 'Advanced rate', rate: 45, threshold: 125140 },
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
      // Higher band runs to £125,140 of TAXABLE income (SRR); PA is fully
      // tapered before the top-rate boundary, so taxable = total there.
      { name: 'Higher rate', rate: 42, threshold: 125140 }, // £43,663 total income to £125,140
      { name: 'Top rate', rate: 47, threshold: Number.POSITIVE_INFINITY }, // Above £125,140
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
      // Advanced band runs to £125,140 of TAXABLE income per the 2024-25
      // Scottish Rate Resolution ("above £62,430 and up to £125,140"); PA is
      // fully tapered before the top-rate boundary, so taxable = total there.
      { name: 'Advanced rate', rate: 45, threshold: 125140 }, // £75,001 total income to £125,140
      // Top rate rose from 47% to 48% at the 2024-25 Scottish Budget.
      // Source: https://www.gov.scot/publications/scottish-income-tax-rates-and-bands/pages/rates-and-bands-2024-to-2025/
      { name: 'Top rate', rate: 48, threshold: Number.POSITIVE_INFINITY }, // Above £125,140
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
      // Advanced band runs to £125,140 of TAXABLE income (SRR); PA is fully
      // tapered before the top-rate boundary, so taxable = total there.
      { name: 'Advanced rate', rate: 45, threshold: 125140 }, // £75,001 total income to £125,140
      { name: 'Top rate', rate: 48, threshold: Number.POSITIVE_INFINITY }, // Above £125,140
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

/**
 * Dividend tax rates for a tax year. Unlike income-tax/NI rates (percentage
 * numbers), these are stored as `FractionRate` decimals and consumers multiply
 * them directly.
 */
export interface DividendTaxYearRates {
  BASIC_RATE: FractionRate;
  HIGHER_RATE: FractionRate;
  ADDITIONAL_RATE: FractionRate;
}

export const DIVIDEND_TAX_RATES: Record<TaxYear, DividendTaxYearRates> = {
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
// Now part of the effective-dated model: keyed by tax year so a future rate
// change is represented as data. Rates have been stable since the April 2023
// reform, so every supported year currently holds identical values.
//
// @see https://www.gov.uk/government/publications/rates-and-allowances-corporation-tax

/**
 * Corporation Tax policy for a tax year. Rates are `FractionRate` decimals.
 *
 * Field names intentionally stay UPPER_SNAKE (unlike the camelCase used by the
 * other policy interfaces) to preserve the destructure in `corporationTax.ts`
 * and the shape consumed by `directorResultsEmail.ts` and existing tests.
 */
export interface CorporationTaxYearPolicy {
  /** Small profits rate (applies to profits ≤ the small-profits limit). */
  SMALL_PROFITS_RATE: FractionRate;
  /** Small profits upper profit limit. */
  SMALL_PROFITS_LIMIT: AnnualAmountGBP;
  /** Main rate (applies to profits ≥ the main-rate limit). */
  MAIN_RATE: FractionRate;
  /** Main rate lower profit limit. */
  MAIN_RATE_LIMIT: AnnualAmountGBP;
  /** Marginal relief fraction (3/200 = 0.015), a dimensionless ratio. */
  MARGINAL_RELIEF_FRACTION: Ratio;
}

const CORPORATION_TAX_POLICY_2023_ONWARDS: CorporationTaxYearPolicy = {
  SMALL_PROFITS_RATE: 0.19,
  SMALL_PROFITS_LIMIT: 50_000,
  MAIN_RATE: 0.25,
  MAIN_RATE_LIMIT: 250_000,
  MARGINAL_RELIEF_FRACTION: 3 / 200,
};

// Each year gets its own object (spread from the single stable base) so a future
// year can diverge by replacing one entry, and an in-place edit can never leak
// across years.
export const CORPORATION_TAX_RATES: Record<TaxYear, CorporationTaxYearPolicy> = {
  '2023-2024': { ...CORPORATION_TAX_POLICY_2023_ONWARDS },
  '2024-2025': { ...CORPORATION_TAX_POLICY_2023_ONWARDS },
  '2025-2026': { ...CORPORATION_TAX_POLICY_2023_ONWARDS },
  '2026-2027': { ...CORPORATION_TAX_POLICY_2023_ONWARDS },
};

/**
 * Current-year Corporation Tax rates — a convenience projection of the canonical
 * per-year {@link CORPORATION_TAX_RATES} (mirrors {@link DIVIDEND_RATES}). Prefer
 * the per-year record for year-aware calculations.
 */
export const CT_RATES = CORPORATION_TAX_RATES[CURRENT_TAX_YEAR];

export type CorporationTaxRates = CorporationTaxYearPolicy;

// ============================================================================
// PENSION ALLOWANCES (statutory)
// ============================================================================
//
// Pension Annual Allowance and high-income taper. Part of the effective-dated
// model (keyed by tax year); values have been stable since the April 2023
// changes (AA £40k→£60k, taper adjusted-income threshold £240k→£260k, minimum
// tapered AA and MPAA £4k→£10k), so every supported year holds identical values.
//
// NOTE: `DIRECTOR_GUIDE_BUSINESS_THRESHOLDS.pensionTaperWarning` (£240k) is a
// separate, deliberately-lower UX early-warning and is NOT this statutory value.
//
// @see https://www.gov.uk/guidance/pension-schemes-rates
// @see https://www.gov.uk/tax-on-your-private-pension/annual-allowance

/** Statutory pension allowance policy for a tax year. */
export interface PensionAllowancePolicy {
  /** Standard pension Annual Allowance. */
  annualAllowance: AnnualAmountGBP;
  /** Adjusted-income threshold above which the Annual Allowance tapers. */
  adjustedIncomeTaperThreshold: TotalIncomeThresholdGBP;
  /** Minimum tapered Annual Allowance (the taper floor). */
  minimumTaperedAllowance: AnnualAmountGBP;
  /** Money Purchase Annual Allowance. Held for model completeness; surfaced in UI copy. */
  moneyPurchaseAnnualAllowance: AnnualAmountGBP;
  /** Allowance lost per £1 of adjusted income over the threshold (£1 per £2 = 0.5). */
  taperRate: Ratio;
}

const PENSION_ALLOWANCE_POLICY_2023_ONWARDS: PensionAllowancePolicy = {
  annualAllowance: 60_000,
  adjustedIncomeTaperThreshold: 260_000,
  minimumTaperedAllowance: 10_000,
  moneyPurchaseAnnualAllowance: 10_000,
  taperRate: 0.5,
};

export const PENSION_ALLOWANCES: Record<TaxYear, PensionAllowancePolicy> = {
  '2023-2024': { ...PENSION_ALLOWANCE_POLICY_2023_ONWARDS },
  '2024-2025': { ...PENSION_ALLOWANCE_POLICY_2023_ONWARDS },
  '2025-2026': { ...PENSION_ALLOWANCE_POLICY_2023_ONWARDS },
  '2026-2027': { ...PENSION_ALLOWANCE_POLICY_2023_ONWARDS },
};

// ============================================================================
// PAYMENTS ON ACCOUNT (Self Assessment)
// ============================================================================
//
// Statutory Self Assessment Payments on Account rule: where the balancing
// payment exceeds the threshold, HMRC requires two advance payments of 50% each
// (bill + 50% advance = 1.5× in the first affected year). Keyed by tax year for
// consistency with the model; the threshold has been stable at £1,000.
//
// @see https://www.gov.uk/understand-self-assessment-bill/payments-on-account

/** Statutory Self Assessment Payments on Account policy for a tax year. */
export interface PaymentsOnAccountPolicy {
  /** Balancing-payment threshold above which Payments on Account apply. */
  threshold: AnnualAmountGBP;
  /** Advance multiplier (bill + 50% advance = 1.5). */
  advanceMultiplier: Ratio;
}

const PAYMENTS_ON_ACCOUNT_POLICY: PaymentsOnAccountPolicy = {
  threshold: 1_000,
  advanceMultiplier: 1.5,
};

export const PAYMENTS_ON_ACCOUNT: Record<TaxYear, PaymentsOnAccountPolicy> = {
  '2023-2024': { ...PAYMENTS_ON_ACCOUNT_POLICY },
  '2024-2025': { ...PAYMENTS_ON_ACCOUNT_POLICY },
  '2025-2026': { ...PAYMENTS_ON_ACCOUNT_POLICY },
  '2026-2027': { ...PAYMENTS_ON_ACCOUNT_POLICY },
};
