// src/components/molecules/PeriodSelectorCard.tsx
'use client';

import { PeriodCheckbox } from '@/components/atoms/PeriodCheckbox';
import { Card } from '@/components/ui/card';

interface PeriodSelectorCardProps {
  periods: string[];
  visiblePeriods: string[];
  onPeriodToggle: (period: string) => void;
}

/**
 * Card component for selecting which time periods to display in the results table.
 * Composes multiple PeriodCheckbox atoms within a Card layout.
 * Follows atomic design pattern - molecule combining atoms with layout.
 */
export function PeriodSelectorCard({
  periods,
  visiblePeriods,
  onPeriodToggle,
}: PeriodSelectorCardProps) {
  return (
    <Card className='w-full border-primary/20 p-2 sm:p-3 md:p-4'>
      <p className='mb-2 font-semibold text-foreground text-lg sm:mb-3'>Display Periods</p>
      <div className='flex flex-wrap gap-2 sm:gap-3 md:gap-4'>
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
