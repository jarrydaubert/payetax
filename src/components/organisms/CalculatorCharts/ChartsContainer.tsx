'use client';

import { SPACING } from '@/constants/designTokens';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { cn } from '@/lib/utils';
import { IncomeBreakdownChart } from './IncomeBreakdownChart';
import { NetIncomeComparisonChart } from './NetIncomeComparisonChart';
import { TaxLiabilityChart } from './TaxLiabilityChart';

interface ChartsContainerProps {
  results: TaxCalculationResults;
  whatIfResults?: TaxCalculationResults | null;
  /**
   * Layout mode:
   * - 'sidebar': Vertical stack for What If sidebar (charts stacked)
   * - 'full-width': Horizontal row below table (charts side by side)
   */
  layout?: 'sidebar' | 'full-width';
  className?: string;
}

/**
 * Determine if income breakdown chart should be shown
 *
 * Only shows when there are genuinely multiple income sources with meaningful values.
 * Avoids showing an empty or single-bar chart.
 */
function shouldShowIncomeBreakdown(results: TaxCalculationResults): boolean {
  const breakdown = results.incomeBreakdown;
  if (!breakdown) return false;

  // Count non-zero income sources
  const nonZeroSources = [breakdown.employment > 0, breakdown.nonEmployment > 0].filter(
    Boolean,
  ).length;

  // Only show if there are 2+ income sources with values
  return nonZeroSources >= 2;
}

/**
 * Charts Container
 *
 * Manages responsive layout for tax calculator visualizations:
 *
 * **Sidebar Layout** (when What If is expanded):
 * - Charts stacked vertically in right sidebar
 * - Compact height for each chart
 * - Perfect for filling the gap next to What If section
 *
 * **Full-Width Layout** (when What If is collapsed/absent):
 * - Charts in horizontal row below results table
 * - Wider charts for better data visualization
 * - Responsive: stack vertically on mobile/tablet
 *
 * Income breakdown chart only appears when there are 2+ income sources.
 * Tax liability and net income charts always display.
 *
 * Note: Not memoized - parent should manage results stability if needed.
 * Chart components themselves handle their own optimization.
 */
export function ChartsContainer({
  results,
  whatIfResults = null,
  layout = 'full-width',
  className,
}: ChartsContainerProps) {
  const showIncomeBreakdown = shouldShowIncomeBreakdown(results);
  const chartCount = showIncomeBreakdown ? 3 : 2;

  if (layout === 'sidebar') {
    return (
      <section
        aria-label='Tax calculation charts'
        className={cn(
          SPACING.SPACE_Y_4,
          // Landscape optimization: increase chart spacing
          'landscape:space-y-6',
          className,
        )}
      >
        {showIncomeBreakdown && <IncomeBreakdownChart results={results} />}
        <TaxLiabilityChart results={results} whatIfResults={whatIfResults} />
        <NetIncomeComparisonChart results={results} />
      </section>
    );
  }

  // Full-width horizontal layout (below table)
  return (
    <section
      aria-label='Tax calculation charts'
      className={cn(
        'grid grid-cols-1',
        // Dynamic columns based on actual chart count
        chartCount === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2',
        SPACING.GAP_4,
        // Landscape optimization: full-width charts on mobile landscape
        'landscape:max-md:grid-cols-1 landscape:max-md:gap-6',
        className,
      )}
    >
      {showIncomeBreakdown && <IncomeBreakdownChart results={results} />}
      <TaxLiabilityChart results={results} whatIfResults={whatIfResults} />
      <NetIncomeComparisonChart results={results} />
    </section>
  );
}
