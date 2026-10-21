// src/components/molecules/PeriodSelectorCard.tsx
'use client';

import { PeriodCheckbox } from '@/components/atoms/PeriodCheckbox';
import { Card } from '@/components/ui/card';
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
 * The selector compacts into a single toolbar row on desktop so the results table stays dominant.
 */
export function PeriodSelectorCard({
  periods,
  visiblePeriods,
  onPeriodToggle,
}: PeriodSelectorCardProps) {
  return (
    <Card
      className={cn('w-full rounded-sm border-border bg-card shadow-none', 'p-2', 'sm:p-3 md:p-4')}
    >
      <div className='flex flex-col gap-2 lg:flex-row lg:items-center'>
        <p className='shrink-0 font-semibold text-base text-foreground sm:text-lg'>
          Display Periods
        </p>
        <div
          className={cn(
            'flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2 lg:flex-nowrap lg:justify-end xl:gap-x-4',
            'gap-2',
          )}
        >
          {periods.map((period) => (
            <div key={period}>
              <PeriodCheckbox
                period={period}
                checked={visiblePeriods.includes(period)}
                onCheckedChange={() => onPeriodToggle(period)}
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
