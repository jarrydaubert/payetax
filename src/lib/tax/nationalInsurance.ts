/**
 * Shared Class 1 National Insurance mechanics.
 *
 * The slicers here work only with earnings and earnings boundaries in a single
 * unit. Pay-period conversion, payroll rounding and policy selection are
 * deliberately owned by callers, so the annual (earnings-period) and payroll
 * (pay-period) paths can share band allocation without conflating their
 * different statutory bases.
 *
 * ## Two bases, which do not reconcile
 *
 * - **Payroll basis** (non-directors): earnings are assessed per pay period
 *   against published period thresholds, and the rate is the one in force on
 *   the pay date. Contributions are not cumulative across periods.
 * - **Annual earnings-period basis** (directors): earnings are assessed once
 *   against annual thresholds. Where a rate changed mid-year, HMRC publishes a
 *   blended rate for this basis.
 *
 * These use different thresholds — the published annual Primary Threshold is
 * £12,570, while the monthly Primary Threshold of £1,048 annualises to £12,576 —
 * so the two bases give slightly different answers for the same salary. That is
 * expected, and neither is derived from the other.
 *
 * @module lib/tax/nationalInsurance
 * @see https://www.gov.uk/national-insurance-rates-letters
 * @see https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026
 */

import {
  CURRENT_TAX_YEAR,
  type NICategory,
  PAYROLL_PERIOD_THRESHOLDS,
  type PayPeriod,
  TAX_RATES,
  type TaxYear,
} from '@/constants/taxRates';

// ============================================================================
// TYPES
// ============================================================================

/** Earnings boundaries and rates for an employee Class 1 calculation, in one unit. */
export interface Class1EmployeeBands {
  primaryThreshold: number;
  upperEarningsLimit: number;
  /** Percentage, e.g. 8 for 8%. */
  primaryRate: number;
  /** Percentage, e.g. 2 for 2%. */
  upperRate: number;
}

/** Earnings boundary and rate for an employer Class 1 calculation, in one unit. */
export interface Class1EmployerBands {
  secondaryThreshold: number;
  /** Percentage, e.g. 15 for 15%. */
  secondaryRate: number;
}

export interface Class1Slice {
  name: string;
  rate: number;
  earningsLowerBound: number;
  earningsUpperBound: number;
  earnings: number;
  contributions: number;
}

export interface Class1EmployeeCalculation {
  earnings: number;
  /** Unrounded. Callers apply their own rounding rule. */
  employeeNI: number;
  slices: Class1Slice[];
}

export interface Class1EmployerCalculation {
  earnings: number;
  /** Unrounded. Callers apply their own rounding rule. */
  employerNI: number;
  earningsAboveSecondaryThreshold: number;
}

/** A primary rate and the number of tax months it applies to within a tax year. */
export interface Class1RateSegment {
  /** Percentage, e.g. 12 for 12%. */
  rate: number;
  /** Tax months in the year at this rate. Segments always sum to 12. */
  months: number;
}

export interface Class1PeriodThresholds {
  primary: number;
  upper: number;
  secondary: number;
}

export interface EmployeeNIExemptionInput {
  age?: number;
  niCategory?: NICategory;
  payNoNI?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Age at which employee Class 1 contributions stop.
 *
 * Employer contributions continue to be due for employees over State Pension
 * age — only the employee side is exempt.
 *
 * @see https://www.gov.uk/state-pension-age
 */
export const STATE_PENSION_AGE_NI_EXEMPTION = 66;

/** Tax months and tax years both begin on the 6th. */
const TAX_YEAR_START_DAY = 6;
const TAX_YEAR_START_MONTH_INDEX = 3; // April
const MONTHS_PER_YEAR = 12;

// ============================================================================
// PURE MECHANICS
// ============================================================================

function normalizeEarnings(earnings: number): number {
  return Number.isFinite(earnings) && earnings > 0 ? earnings : 0;
}

/**
 * Allocate earnings across the employee Class 1 bands.
 *
 * All monetary inputs must use the same unit. Annual callers pass annual
 * earnings and annual boundaries; payroll callers pass period earnings and
 * period boundaries. No rounding is applied.
 */
export function sliceClass1EmployeeEarnings(
  earnings: number,
  bands: Class1EmployeeBands,
): Class1EmployeeCalculation {
  const normalizedEarnings = normalizeEarnings(earnings);
  const primaryThreshold = Math.max(0, bands.primaryThreshold);
  const upperEarningsLimit = Math.max(primaryThreshold, bands.upperEarningsLimit);
  const slices: Class1Slice[] = [];
  let employeeNI = 0;

  const earningsInPrimaryBand = Math.max(
    0,
    Math.min(normalizedEarnings, upperEarningsLimit) - primaryThreshold,
  );
  if (earningsInPrimaryBand > 0) {
    const contributions = earningsInPrimaryBand * (bands.primaryRate / 100);
    slices.push({
      name: 'Primary threshold to upper earnings limit',
      rate: bands.primaryRate,
      earningsLowerBound: primaryThreshold,
      earningsUpperBound: upperEarningsLimit,
      earnings: earningsInPrimaryBand,
      contributions,
    });
    employeeNI += contributions;
  }

  const earningsAboveUpperLimit = Math.max(0, normalizedEarnings - upperEarningsLimit);
  if (earningsAboveUpperLimit > 0) {
    const contributions = earningsAboveUpperLimit * (bands.upperRate / 100);
    slices.push({
      name: 'Above upper earnings limit',
      rate: bands.upperRate,
      earningsLowerBound: upperEarningsLimit,
      earningsUpperBound: Number.POSITIVE_INFINITY,
      earnings: earningsAboveUpperLimit,
      contributions,
    });
    employeeNI += contributions;
  }

  return { earnings: normalizedEarnings, employeeNI, slices };
}

/**
 * Calculate employer Class 1 contributions on earnings above the secondary
 * threshold. Same unit rules as {@link sliceClass1EmployeeEarnings}; no rounding.
 */
export function sliceClass1EmployerEarnings(
  earnings: number,
  bands: Class1EmployerBands,
): Class1EmployerCalculation {
  const normalizedEarnings = normalizeEarnings(earnings);
  const earningsAboveSecondaryThreshold = Math.max(
    0,
    normalizedEarnings - Math.max(0, bands.secondaryThreshold),
  );

  return {
    earnings: normalizedEarnings,
    employerNI: earningsAboveSecondaryThreshold * (bands.secondaryRate / 100),
    earningsAboveSecondaryThreshold,
  };
}

// ============================================================================
// POLICY SELECTION
// ============================================================================

/**
 * Whether employee Class 1 contributions are exempt.
 *
 * Employer contributions are unaffected — callers must still charge them.
 */
export function isEmployeeNIExempt({
  age,
  niCategory,
  payNoNI,
}: EmployeeNIExemptionInput): boolean {
  if (payNoNI) return true;
  if (niCategory === 'C') return true;
  return age !== undefined && age >= STATE_PENSION_AGE_NI_EXEMPTION;
}

/**
 * Published period thresholds for a pay period.
 *
 * The secondary threshold varies by category (under-21 and apprentice
 * categories use the upper secondary threshold), so the category is required.
 */
export function getClass1PeriodThresholds(
  taxYear: TaxYear,
  niCategory: NICategory,
  period: Extract<PayPeriod, 'weekly' | 'monthly'>,
): Class1PeriodThresholds {
  const periodThresholds = PAYROLL_PERIOD_THRESHOLDS[taxYear][period];
  const secondary = TAX_RATES[taxYear].nationalInsurance.employer[niCategory].secondary;

  return {
    primary: periodThresholds.niPrimary,
    upper: periodThresholds.niUpper,
    secondary: period === 'weekly' ? secondary.weeklyThreshold : secondary.monthlyThreshold,
  };
}

function getTaxYearStartYear(taxYear: TaxYear): number {
  return Number.parseInt(taxYear.slice(0, 4), 10);
}

/**
 * The tax month (1-12) that a date falls in. Tax months run from the 6th, so
 * 6 April is month 1 and 6 January is month 10.
 */
function getTaxMonthIndex(taxYear: TaxYear, date: Date): number {
  const startYear = getTaxYearStartYear(taxYear);
  const start = new Date(Date.UTC(startYear, TAX_YEAR_START_MONTH_INDEX, TAX_YEAR_START_DAY));
  const monthsElapsed =
    (date.getUTCFullYear() - start.getUTCFullYear()) * MONTHS_PER_YEAR +
    (date.getUTCMonth() - start.getUTCMonth());
  const beforeDayOfMonth = date.getUTCDate() < TAX_YEAR_START_DAY;

  return monthsElapsed + (beforeDayOfMonth ? 0 : 1);
}

/**
 * The primary rate segments for a tax year, derived from the effective dates in
 * the policy table rather than hardcoded.
 *
 * Years with no mid-year change return a single segment covering all 12 months,
 * so callers that sum segments reproduce their single-rate arithmetic exactly.
 */
export function getEmployeeClass1MonthSegments(
  taxYear: TaxYear,
  niCategory: NICategory,
): Class1RateSegment[] {
  const employeeRates = TAX_RATES[taxYear].nationalInsurance.employee[niCategory];
  const changes = employeeRates.primaryRateChanges ?? [];

  if (changes.length === 0) {
    return [{ rate: employeeRates.primary.rate, months: MONTHS_PER_YEAR }];
  }

  const segments: Class1RateSegment[] = [];
  let rate = employeeRates.primary.rate;
  let monthsAllocated = 0;

  for (const change of changes) {
    const changeMonth = getTaxMonthIndex(taxYear, new Date(`${change.effectiveFrom}T00:00:00Z`));
    const months = Math.max(0, Math.min(MONTHS_PER_YEAR, changeMonth - 1) - monthsAllocated);

    if (months > 0) {
      segments.push({ rate, months });
      monthsAllocated += months;
    }
    rate = change.rate;
  }

  if (monthsAllocated < MONTHS_PER_YEAR) {
    segments.push({ rate, months: MONTHS_PER_YEAR - monthsAllocated });
  }

  return segments;
}

/**
 * The primary rate in force on a given pay date.
 *
 * The pay date is required: where a rate changed mid-year there is no correct
 * answer without it, so this never falls back to the opening rate.
 */
export function getEmployeeClass1RateForPayDate(
  taxYear: TaxYear,
  niCategory: NICategory,
  payDate: Date,
): number {
  if (!(payDate instanceof Date) || Number.isNaN(payDate.getTime())) {
    throw new TypeError(
      'getEmployeeClass1RateForPayDate requires a valid pay date: the primary rate can change mid-year, so it cannot be resolved without one.',
    );
  }

  const employeeRates = TAX_RATES[taxYear].nationalInsurance.employee[niCategory];
  let rate = employeeRates.primary.rate;

  for (const change of employeeRates.primaryRateChanges ?? []) {
    if (payDate.getTime() >= new Date(`${change.effectiveFrom}T00:00:00Z`).getTime()) {
      rate = change.rate;
    }
  }

  return rate;
}

/**
 * The primary rate for the annual earnings period (directors).
 *
 * Where a rate changed mid-year this is HMRC's published blended rate — a
 * statutory figure quoted from the rate tables, not one derived from the
 * effective-dated changes.
 */
export function getDirectorsAnnualPrimaryRate(
  taxYear: TaxYear = CURRENT_TAX_YEAR,
  niCategory: NICategory = 'A',
): number {
  const employeeRates = TAX_RATES[taxYear].nationalInsurance.employee[niCategory];
  return employeeRates.directorsPrimaryRate ?? employeeRates.primary.rate;
}

/**
 * The representative pay date for a tax period, used to select the rate in
 * force for that period.
 *
 * Tax periods start on the 6th, so period 1 of a monthly scheme starts 6 April
 * and period 10 starts 6 January.
 *
 * The period *start* is the representative date. Monthly periods begin on the
 * 6th and so never straddle a change that itself takes effect on the 6th, but a
 * weekly or four-weekly period can: tax week 40 of 2023-24 runs 4-10 January
 * 2024 and is treated here as falling before the 6 January cut. Callers holding
 * a real pay date should pass it to `getEmployeeClass1RateForPayDate` directly
 * rather than deriving one from the period.
 */
export function getPayDateForTaxPeriod(
  taxYear: TaxYear,
  period: Extract<PayPeriod, 'weekly' | 'fortnightly' | 'fourWeekly' | 'monthly'>,
  periodNumber: number,
): Date {
  const startYear = getTaxYearStartYear(taxYear);
  const safePeriodNumber = Math.max(1, Math.floor(periodNumber));

  if (period === 'monthly') {
    return new Date(
      Date.UTC(startYear, TAX_YEAR_START_MONTH_INDEX + (safePeriodNumber - 1), TAX_YEAR_START_DAY),
    );
  }

  const weeksPerPeriod = period === 'weekly' ? 1 : period === 'fortnightly' ? 2 : 4;
  const start = Date.UTC(startYear, TAX_YEAR_START_MONTH_INDEX, TAX_YEAR_START_DAY);
  const daysElapsed = (safePeriodNumber - 1) * weeksPerPeriod * 7;

  return new Date(start + daysElapsed * 24 * 60 * 60 * 1000);
}
