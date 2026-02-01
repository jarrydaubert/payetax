'use client';

import { useId } from 'react';
import { Checkbox } from '@/components/atoms/ui/checkbox';
import { Label } from '@/components/atoms/ui/label';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

interface PeriodCheckboxProps {
  /**
   * The period label to display (e.g., 'Yearly', 'Monthly', 'Weekly')
   */
  period: string;
  /**
   * Whether the checkbox is checked
   */
  checked: boolean;
  /**
   * Callback when checked state changes
   * Receives the new boolean value (not indeterminate)
   */
  onCheckedChange: (checked: boolean) => void;
}

/**
 * Checkbox component for selecting display periods in the results table.
 *
 * Uses useId() for stable, unique IDs that work with SSR.
 * Not memoized - parent should use useCallback for onCheckedChange if needed.
 *
 * @example
 * ```tsx
 * <PeriodCheckbox
 *   period="Monthly"
 *   checked={showMonthly}
 *   onCheckedChange={setShowMonthly}
 * />
 * ```
 */
export function PeriodCheckbox({ period, checked, onCheckedChange }: PeriodCheckboxProps) {
  // useId generates stable, unique IDs that work with SSR
  const id = useId();
  const checkboxId = `${id}-period-${period.toLowerCase()}`;

  return (
    <div className={cn('flex items-center', SPACING.GAP_2)}>
      <Checkbox
        id={checkboxId}
        checked={checked}
        onCheckedChange={(state) => {
          // Forward boolean values only (filter out 'indeterminate')
          if (typeof state === 'boolean') {
            onCheckedChange(state);
          }
        }}
      />
      <Label htmlFor={checkboxId} className={cn('cursor-pointer font-normal', TYPOGRAPHY.TEXT_SM)}>
        {period}
      </Label>
    </div>
  );
}
