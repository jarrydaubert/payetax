// src/components/molecules/PeriodSelectorCard.tsx
'use client';

import { PeriodCheckbox } from '@/components/atoms/PeriodCheckbox';
import { Card } from '@/components/ui/card';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

interface PeriodSelectorCardProps {
  periods: string[];
  visiblePeriods: string[];
  onPeriodToggle: (period: string) => void;
}

/**
 * Card component for selecting which time periods to display in the results table.
 * Composes multiple PeriodCheckbox atoms within a Card layout.
 * Follows atomic design pattern - molecule combining atoms with layout.
 *
 * IMPORTANT: Uses TEXT_LG for heading to match other section headings like "Enter Income Tax Details"
 * Base gap is GAP_2, with responsive overrides (sm:gap-3 md:gap-4) for larger screens
 */
export function PeriodSelectorCard({
  periods,
  visiblePeriods,
  onPeriodToggle,
}: PeriodSelectorCardProps) {
  return (
    <Card className='w-full border-primary/20 p-2 sm:p-3 md:p-4'>
      <p className={cn('mb-2 font-semibold text-foreground sm:mb-3', TYPOGRAPHY.TEXT_LG)}>
        Display Periods
      </p>
      <div className={cn('flex flex-wrap sm:gap-3 md:gap-4', SPACING.GAP_2)}>
        {periods.map((period) => (
          <PeriodCheckbox
            key={period}
            period={period}
            checked={visiblePeriods.includes(period)}
            onCheckedChange={() => onPeriodToggle(period)}
          />
        ))}
      </div>
    </Card>
  );
}
