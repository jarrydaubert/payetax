// src/components/molecules/TableHeader.tsx
// Modern, reusable header component for tax calculation results tables

import { cn } from '@/lib/utils';
import type { DisplayPeriod } from './PeriodSelector';

interface TableHeaderProps {
  /** Selected pay periods to display in columns */
  selectedPeriods: DisplayPeriod[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Table header component for tax calculation results
 * Displays column headers for categories and selected pay periods
 */
const TableHeader = ({ selectedPeriods, className }: TableHeaderProps) => {
  // Get display name for each period type
  const getPeriodDisplayName = (period: DisplayPeriod): string => {
    switch (period) {
      case 'yearly':
        return 'Yearly';
      case 'monthly':
        return 'Monthly';
      case 'fourWeekly':
        return '4-Weekly';
      case 'fortnightly':
        return 'Fortnightly';
      case 'weekly':
        return 'Weekly';
      case 'daily':
        return 'Daily';
      case 'hourly':
        return 'Hourly';
      default:
        return period;
    }
  };

  return (
    <thead
      className={cn(
        'text-sm sticky top-0',
        'bg-glass backdrop-blur-glass border-b border-glass',
        'z-[5]', // Moderate z-index for stacking
        className
      )}
    >
      <tr>
        <th className="px-2 md:px-4 py-3 text-left font-semibold text-foreground/90 w-28 md:w-40">
          Category
        </th>
        <th className="px-2 md:px-4 py-3 text-right font-semibold text-foreground/90 w-16">%</th>
        {selectedPeriods.map((period) => (
          <th
            key={period}
            className="px-2 md:px-4 py-3 text-right font-semibold text-foreground/90 whitespace-nowrap"
          >
            {getPeriodDisplayName(period)} <span className="text-foreground/60">(£)</span>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
