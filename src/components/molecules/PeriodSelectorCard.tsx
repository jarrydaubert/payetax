// src/components/molecules/PeriodSelectorCard.tsx
'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { PeriodCheckbox } from '@/components/atoms/PeriodCheckbox';
import { Card } from '@/components/ui/card';
import { ANIMATION_TRANSITIONS } from '@/constants/animationTokens';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { cn } from '@/lib/utils';

interface PeriodSelectorCardProps {
  periods: string[];
  visiblePeriods: string[];
  onPeriodToggle: (period: string) => void;
  action?: ReactNode;
}

/**
 * Card component for selecting which time periods to display in the results table.
 * Composes multiple PeriodCheckbox atoms within a Card layout.
 * Follows atomic design pattern - molecule combining atoms with layout.
 *
 * Features smooth layout animations when checkboxes are toggled using Framer Motion.
 * Respects user motion preferences for accessibility.
 *
 * IMPORTANT: Uses TEXT_LG for heading to match other section headings like "Enter Income Tax Details"
 * Base gap is GAP_2, with responsive overrides (sm:gap-3 md:gap-4) for larger screens
 */
export function PeriodSelectorCard({
  periods,
  visiblePeriods,
  onPeriodToggle,
  action,
}: PeriodSelectorCardProps) {
  const shouldReduceMotion = useMotionPreference();

  return (
    <Card className={cn('w-full', SPACING.P_2, 'sm:p-3 md:p-4')}>
      <div
        className={cn(
          'flex flex-col',
          SPACING.GAP_2,
          SPACING.MB_2,
          'sm:mb-3 sm:flex-row sm:items-start sm:justify-between',
        )}
      >
        <p className={cn('font-semibold text-foreground', TYPOGRAPHY.TEXT_LG)}>Display Periods</p>
        {action && <div className='flex w-full sm:w-auto'>{action}</div>}
      </div>
      <div className={cn('flex flex-wrap sm:gap-3 md:gap-4', SPACING.GAP_2)}>
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
    </Card>
  );
}
