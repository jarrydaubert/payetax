// src/components/molecules/TaxYearComparison.tsx
// Component for calculating and displaying tax year comparison data

import { useMemo } from 'react';
import type { DisplayPeriod } from '@/components/molecules/PeriodSelector';
import { type PayPeriod, PERIODS, TAX_RATES, type TaxYear } from '@/constants/taxRates';
import {
  calculateTax,
  type TaxCalculationInput,
  type TaxCalculationResults,
} from '@/lib/taxCalculator';
import { useCalculatorStore } from '@/store/calculatorStore';

export interface YearComparisonData {
  label: string;
  percentage: string;
  values: Record<DisplayPeriod, number>;
  isPositive: boolean;
}

/**
 * Calculate and format the difference between current year and previous year tax results
 * Note: This is not a UI component but a utility function that returns formatted data for the table
 */
export const useTaxYearComparison = (
  currentResults: TaxCalculationResults,
  selectedPeriods: DisplayPeriod[]
): YearComparisonData | null => {
  // Get current calculator input from store
  const { input } = useCalculatorStore();

  // Calculate previous year's results
  const comparisonData = useMemo(() => {
    if (!currentResults || currentResults.grossSalary.annually <= 0) {
      return null;
    }

    try {
      // Get current tax year
      const currentYear = input.taxYear;

      // Determine previous tax year
      const currentYearStart = Number.parseInt(currentYear.split('-')[0], 10);
      const previousYear = `${currentYearStart - 1}-${currentYearStart}` as TaxYear;

      // Verify that tax rates exist for the previous year
      if (!TAX_RATES[previousYear]) {
        return null;
      }

      // Create input with previous year
      const previousYearInput: TaxCalculationInput = {
        ...input,
        taxYear: previousYear,
      };

      // Calculate tax for previous year using the same inputs
      const previousYearResults = calculateTax(previousYearInput);

      // Calculate annual difference
      const annualNetPayDifference =
        currentResults.netPay.annually - previousYearResults.netPay.annually;

      // Calculate percentage difference
      const percentageDifference =
        previousYearResults.netPay.annually !== 0
          ? (annualNetPayDifference / previousYearResults.netPay.annually) * 100
          : 0;

      // Calculate differences for each period
      const netPayDifference: Record<DisplayPeriod, number> = {} as Record<DisplayPeriod, number>;

      // Create a mapping from DisplayPeriod to PayPeriod
      const periodMapping: Record<DisplayPeriod, PayPeriod> = {
        yearly: PERIODS.ANNUALLY,
        monthly: PERIODS.MONTHLY,
        fourWeekly: PERIODS.FOUR_WEEKLY,
        fortnightly: PERIODS.FORTNIGHTLY,
        weekly: PERIODS.WEEKLY,
        daily: PERIODS.DAILY,
        hourly: PERIODS.HOURLY,
      };

      // Calculate difference for each selected period
      for (const period of selectedPeriods) {
        const payPeriodKey = periodMapping[period];

        // Ensure both period values exist
        if (
          currentResults.netPay[payPeriodKey] !== undefined &&
          previousYearResults.netPay[payPeriodKey] !== undefined
        ) {
          netPayDifference[period] =
            currentResults.netPay[payPeriodKey] - previousYearResults.netPay[payPeriodKey];
        } else {
          // Fallback to calculated value if direct value not available
          const annualDifference =
            currentResults.netPay.annually - previousYearResults.netPay.annually;

          // Convert annual difference to the appropriate period
          switch (period) {
            case 'yearly':
              netPayDifference[period] = annualDifference;
              break;
            case 'monthly':
              netPayDifference[period] = annualDifference / 12;
              break;
            case 'fourWeekly':
              netPayDifference[period] = annualDifference / 13;
              break;
            case 'fortnightly':
              netPayDifference[period] = annualDifference / 26;
              break;
            case 'weekly':
              netPayDifference[period] = annualDifference / 52;
              break;
            case 'daily':
              netPayDifference[period] = annualDifference / 260;
              break;
            case 'hourly': {
              const hoursPerYear = input.hoursPerWeek * 52;
              netPayDifference[period] = hoursPerYear > 0 ? annualDifference / hoursPerYear : 0;
              break;
            }
          }
        }
      }

      // Format percentage difference with appropriate sign
      const formatPercentageDifference = (): string => {
        if (percentageDifference === 0) return '0.0%';

        const formattedValue = `${Math.abs(percentageDifference).toFixed(1)}%`;
        return percentageDifference > 0 ? `+${formattedValue}` : `-${formattedValue}`;
      };

      return {
        label: 'Difference from Previous Year',
        percentage: formatPercentageDifference(),
        values: netPayDifference,
        isPositive: annualNetPayDifference > 0,
      };
    } catch (_error) {
      return null;
    }
  }, [currentResults, input, selectedPeriods]);

  return comparisonData;
};

export default useTaxYearComparison;
