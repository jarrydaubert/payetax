// src/lib/periodCalculator.ts
/**
 * Period calculator utility module
 *
 * Provides functions for converting amounts between different pay periods
 * (e.g., annual, monthly, weekly) and calculating period-specific values.
 * These utilities ensure consistent calculations across the application.
 */

import { DEFAULT_HOURS_PER_WEEK, type PayPeriod, PERIODS } from '@/constants/taxRates';

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
  switch (period) {
    case PERIODS.ANNUALLY:
      return amount; // Already annual, no conversion needed
    case PERIODS.MONTHLY:
      return amount * 12; // 12 months in a year
    case PERIODS.FOUR_WEEKLY:
      return amount * 13; // 13 four-week periods in a year
    case PERIODS.FORTNIGHTLY:
      return amount * 26; // 26 fortnights in a year
    case PERIODS.WEEKLY:
      return amount * 52; // 52 weeks in a year
    case PERIODS.DAILY:
      return amount * 260; // Approximately 260 working days in a year (5 days × 52 weeks)
    case PERIODS.HOURLY:
      return amount * hoursPerWeek * 52; // Hours per week × 52 weeks
    default:
      return amount; // Default to no conversion
  }
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
  switch (targetPeriod) {
    case PERIODS.ANNUALLY:
      return annualAmount; // Already annual, no conversion needed
    case PERIODS.MONTHLY:
      return annualAmount / 12; // 12 months in a year
    case PERIODS.FOUR_WEEKLY:
      return annualAmount / 13; // 13 four-week periods in a year
    case PERIODS.FORTNIGHTLY:
      return annualAmount / 26; // 26 fortnights in a year
    case PERIODS.WEEKLY:
      return annualAmount / 52; // 52 weeks in a year
    case PERIODS.DAILY:
      return annualAmount / 260; // Approximately 260 working days in a year (5 days × 52 weeks)
    case PERIODS.HOURLY:
      return annualAmount / (hoursPerWeek * 52); // Hours per week × 52 weeks
    default:
      return annualAmount; // Default to no conversion
  }
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
  // Initialize with all required keys for type safety
  return {
    yearly: annualValue,
    monthly: annualValue / 12,
    fourWeekly: annualValue / 13,
    fortnightly: annualValue / 26,
    weekly: annualValue / 52,
    daily: annualValue / 260,
    hourly: annualValue / (52 * hoursPerWeek),
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
