// src/components/molecules/PeriodSelectorCard.tsx
'use client';

import { motion } from 'framer-motion';
import { PeriodCheckbox } from '@/components/atoms/PeriodCheckbox';
import { Card } from '@/components/ui/card';
import { ANIMATION_TRANSITIONS } from '@/constants/animationTokens';
import { SPACING } from '@/constants/designTokens';
import { useMotionPreference } from '@/hooks/useMotionPreference';
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
 * Features smooth layout animations when checkboxes are toggled using Framer Motion.
 * Respects user motion preferences for accessibility.
 *
 * The selector compacts into a single toolbar row on desktop so the results table stays dominant.
 */
export function PeriodSelectorCard({
  periods,
  visiblePeriods,
  onPeriodToggle,
}: PeriodSelectorCardProps) {
  const shouldReduceMotion = useMotionPreference();

  return (
    <Card
      className={cn(
        'w-full rounded-sm border-border bg-card shadow-none',
        SPACING.P_2,
        'sm:p-3 md:p-4',
      )}
    >
      <div className='flex flex-col gap-2 lg:flex-row lg:items-center'>
        <p className='shrink-0 font-semibold text-foreground text-sm uppercase tracking-[0.12em]'>
          Display Periods
        </p>
        <div
          className={cn(
            'flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2 lg:flex-nowrap lg:justify-end xl:gap-x-4',
            SPACING.GAP_2,
          )}
        >
          {periods.map((period) => (
            <motion.div
              key={period}
              layout={!shouldReduceMotion}
              transition={shouldReduceMotion ? { duration: 0 } : ANIMATION_TRANSITIONS.spring}
            >
              <PeriodCheckbox
                period={period}
                checked={visiblePeriods.includes(period)}
                onCheckedChange={() => onPeriodToggle(period)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}
