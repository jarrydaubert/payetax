'use client';

import { useId } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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
    <div className='flex items-center gap-2'>
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
      <Label htmlFor={checkboxId} className='cursor-pointer font-normal text-sm'>
        {period}
      </Label>
    </div>
  );
}
