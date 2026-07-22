// src/lib/periodCalculator.ts
/**
 * Period calculator utility module
 *
 * Provides functions for converting amounts between different pay periods
 * (e.g., annual, monthly, weekly) and calculating period-specific values.
 * These utilities ensure consistent calculations across the application.
 */

import { DEFAULT_HOURS_PER_WEEK, type PayPeriod, PERIODS } from '@/constants/taxRates';

type FixedPayPeriod = Exclude<PayPeriod, typeof PERIODS.HOURLY>;

/**
 * Canonical mathematical count of each fixed pay period in a year.
 *
 * Hourly conversion is deliberately excluded because its annual count depends
 * on the caller's working-hours assumption.
 */
export const PERIODS_PER_YEAR: Readonly<Record<FixedPayPeriod, number>> = {
  [PERIODS.ANNUALLY]: 1,
  [PERIODS.MONTHLY]: 12,
  [PERIODS.FOUR_WEEKLY]: 13,
  [PERIODS.FORTNIGHTLY]: 26,
  [PERIODS.WEEKLY]: 52,
  [PERIODS.DAILY]: 260,
};

function getPeriodsPerYear(period: PayPeriod, hoursPerWeek: number): number {
  if (period === PERIODS.HOURLY) {
    return hoursPerWeek * PERIODS_PER_YEAR[PERIODS.WEEKLY];
  }

  const periodsPerYear: unknown = PERIODS_PER_YEAR[period];
  return typeof periodsPerYear === 'number' ? periodsPerYear : PERIODS_PER_YEAR[PERIODS.ANNUALLY];
}

/**
 * Converts a salary amount from any period to annual amount
 *
 * @param amount - The salary amount to convert
 * @param period - The period type of the provided amount
 * @param hoursPerWeek - Weekly working hours (for hourly rates)
 * @returns The equivalent annual amount
 */
export function convertPeriodToAnnual(
  amount: number,
  period: PayPeriod,
  hoursPerWeek: number = DEFAULT_HOURS_PER_WEEK,
): number {
  if (period === PERIODS.HOURLY) {
    // Preserve the established caller-hours then weeks multiplication order.
    return amount * hoursPerWeek * PERIODS_PER_YEAR[PERIODS.WEEKLY];
  }

  return amount * getPeriodsPerYear(period, hoursPerWeek);
}

/**
 * Converts a salary amount from annual to any specified period
 *
 * @param annualAmount - The annual salary amount to convert
 * @param targetPeriod - The target period type for conversion
 * @param hoursPerWeek - Weekly working hours (for hourly rates)
 * @returns The equivalent amount for the target period
 */
export function convertAnnualToPeriod(
  annualAmount: number,
  targetPeriod: PayPeriod,
  hoursPerWeek: number = DEFAULT_HOURS_PER_WEEK,
): number {
  return annualAmount / getPeriodsPerYear(targetPeriod, hoursPerWeek);
}

/**
 * Converts the tax engine's monthly calculation base to another pay period.
 *
 * Keep the operation order here: fixed periods multiply by the derived
 * monthly factor, while hourly values divide by average monthly hours. The
 * engine applies monetary rounding after this conversion.
 */
export function convertMonthlyToPeriod(
  monthlyAmount: number,
  targetPeriod: PayPeriod,
  hoursPerWeek: number = DEFAULT_HOURS_PER_WEEK,
): number {
  if (targetPeriod === PERIODS.HOURLY) {
    const averageWeeksPerMonth =
      PERIODS_PER_YEAR[PERIODS.WEEKLY] / PERIODS_PER_YEAR[PERIODS.MONTHLY];
    return monthlyAmount / (hoursPerWeek * averageWeeksPerMonth);
  }

  const monthlyToPeriodFactor =
    PERIODS_PER_YEAR[PERIODS.MONTHLY] / getPeriodsPerYear(targetPeriod, hoursPerWeek);
  return monthlyAmount * monthlyToPeriodFactor;
}

/**
 * Converts a value from one period to another directly
 *
 * @param amount - The amount to convert
 * @param fromPeriod - Source period type
 * @param toPeriod - Target period type
 * @param hoursPerWeek - Weekly working hours (for hourly rates)
 * @returns The converted amount
 */
export function convertBetweenPeriods(
  amount: number,
  fromPeriod: PayPeriod,
  toPeriod: PayPeriod,
  hoursPerWeek: number = DEFAULT_HOURS_PER_WEEK,
): number {
  // First convert to annual, then convert to target period
  const annualAmount = convertPeriodToAnnual(amount, fromPeriod, hoursPerWeek);
  return convertAnnualToPeriod(annualAmount, toPeriod, hoursPerWeek);
}

/**
 * Calculates period values for various display periods from an annual value
 *
 * @param annualValue - Annual value to convert
 * @param periods - Array of periods to calculate for (parameter retained for API compatibility)
 * @param hoursPerWeek - Weekly working hours (for hourly rates)
 * @returns Object with values for each period
 */
export function getPeriodValues(
  annualValue: number,
  _periods: string[] | string,
  hoursPerWeek: number = DEFAULT_HOURS_PER_WEEK,
): Record<string, number> {
  return {
    yearly: convertAnnualToPeriod(annualValue, PERIODS.ANNUALLY, hoursPerWeek),
    monthly: convertAnnualToPeriod(annualValue, PERIODS.MONTHLY, hoursPerWeek),
    fourWeekly: convertAnnualToPeriod(annualValue, PERIODS.FOUR_WEEKLY, hoursPerWeek),
    fortnightly: convertAnnualToPeriod(annualValue, PERIODS.FORTNIGHTLY, hoursPerWeek),
    weekly: convertAnnualToPeriod(annualValue, PERIODS.WEEKLY, hoursPerWeek),
    daily: convertAnnualToPeriod(annualValue, PERIODS.DAILY, hoursPerWeek),
    hourly: convertAnnualToPeriod(annualValue, PERIODS.HOURLY, hoursPerWeek),
  };
}

/**
 * Calculates percentage of a gross salary
 *
 * @param amount - Amount to calculate percentage for
 * @param grossSalary - Gross salary amount
 * @returns Percentage value (0-100 scale)
 */
export function getPercentOfGross(amount: number, grossSalary: number): number {
  return grossSalary > 0 ? (amount / grossSalary) * 100 : 0;
}
