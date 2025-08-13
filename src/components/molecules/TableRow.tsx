// src/components/molecules/TableRow.tsx
// Modern row component for tax calculation results table

import type { ReactNode } from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import type { DisplayPeriod } from './PeriodSelector';

interface TableRowProps {
  /** Row label (can be complex React node) */
  label: string | ReactNode;
  /** Percentage value to display in % column */
  percentage: number | string;
  /** Value data for each period */
  values: Record<DisplayPeriod, number | string>;
  /** Selected periods to display */
  selectedPeriods: DisplayPeriod[];
  /** Whether to highlight this row (for important values) */
  isHighlighted?: boolean;
  /** Whether to indent this row (for sub-items) */
  indented?: boolean;
  /** Whether to use muted styling */
  muted?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Table row component for tax calculation results
 * Displays a row of values for different pay periods with consistent styling
 */
const TableRow = ({
  label,
  percentage,
  values,
  selectedPeriods,
  isHighlighted = false,
  indented = false,
  muted = false,
  className = '',
}: TableRowProps) => {
  // Format percentage based on type
  const formattedPercentage =
    typeof percentage === 'number' ? `${percentage.toFixed(1)}%` : percentage;

  // Determine cell styles based on props
  const getLabelClass = () => {
    return cn(
      'px-2 md:px-4 py-2.5 font-medium whitespace-nowrap',
      indented ? 'pl-6 md:pl-8' : '',
      muted ? 'text-foreground/60' : 'text-foreground',
      isHighlighted ? 'font-semibold' : ''
    );
  };

  const getValueClass = () => {
    return cn(
      'px-2 md:px-4 py-2.5 text-right',
      muted ? 'text-foreground/60' : 'text-foreground',
      isHighlighted ? 'font-semibold' : ''
    );
  };

  // Determine row background
  const getRowClass = () => {
    if (isHighlighted) {
      return 'bg-glass-deep border-t border-b border-glass';
    }
    if (muted) {
      return 'bg-transparent';
    }
    if (
      typeof label === 'string' &&
      (label === 'Gross Pay' || label === 'Total Taxable' || label.includes('HMRC'))
    ) {
      return 'bg-glass';
    }
    return 'bg-glass-deep';
  };

  return (
    <tr className={cn(getRowClass(), 'transition-colors duration-200 hover:bg-glass', className)}>
      <td className={getLabelClass()}>{label}</td>
      <td className={getValueClass()}>{formattedPercentage}</td>

      {selectedPeriods.map((period) => {
        const value = values[period];
        // Special case for hourly values that don't apply
        if (period === 'hourly' && (value === '-' || value === undefined)) {
          return (
            <td key={period} className={getValueClass()}>
              -
            </td>
          );
        }

        return (
          <td key={period} className={getValueClass()}>
            {isHighlighted ? (
              <span className="font-bold text-primary">
                {typeof value === 'number' ? formatCurrency(value, 2) : value}
              </span>
            ) : typeof value === 'number' ? (
              formatCurrency(value, 2)
            ) : (
              value
            )}
          </td>
        );
      })}
    </tr>
  );
};

export default TableRow;
