'use client';

import { memo } from 'react';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { IncomeBreakdownChart } from './IncomeBreakdownChart';
import { NetIncomeComparisonChart } from './NetIncomeComparisonChart';
import { TaxLiabilityChart } from './TaxLiabilityChart';

interface ChartsContainerProps {
  results: TaxCalculationResults;
  whatIfResults?: TaxCalculationResults | null;
  /**
   * Layout mode:
   * - 'sidebar': Vertical stack for What If sidebar (3 charts stacked)
   * - 'full-width': Horizontal row below table (3 charts side by side)
   */
  layout?: 'sidebar' | 'full-width';
  className?: string;
}

/**
 * Charts Container
 *
 * Manages responsive layout for tax calculator visualizations:
 *
 * **Sidebar Layout** (when What If is expanded):
 * - 3 charts stacked vertically in right sidebar
 * - Compact height for each chart
 * - Perfect for filling the gap next to What If section
 *
 * **Full-Width Layout** (when What If is collapsed/absent):
 * - 3 charts in horizontal row below results table
 * - Wider charts for better data visualization
 * - Responsive: stack vertically on mobile/tablet
 *
 * Auto-hides charts that don't have data to display.
 * 
 * Performance: Memoized to prevent unnecessary re-renders with React 19
 */
export const ChartsContainer = memo(function ChartsContainer({
  results,
  whatIfResults,
  layout = 'full-width',
  className,
}: ChartsContainerProps) {
  // Determine if we should show income breakdown
  // (only if multiple income sources exist)
  const showIncomeBreakdown = !!results.incomeBreakdown;

  if (layout === 'sidebar') {
    // Vertical stack for What If sidebar
    return (
      <div className={`space-y-4 ${className || ''}`}>
        {showIncomeBreakdown && <IncomeBreakdownChart results={results} />}

        <TaxLiabilityChart results={results} whatIfResults={whatIfResults} />

        <NetIncomeComparisonChart results={results} />
      </div>
    );
  }

  // Full-width horizontal layout (below table)
  return (
    <div
      className={`grid grid-cols-1 gap-4 lg:grid-cols-${showIncomeBreakdown ? '3' : '2'} ${className || ''}`}
    >
      {showIncomeBreakdown && <IncomeBreakdownChart results={results} />}

      <TaxLiabilityChart results={results} whatIfResults={whatIfResults} />

      <NetIncomeComparisonChart results={results} />
    </div>
  );
});
