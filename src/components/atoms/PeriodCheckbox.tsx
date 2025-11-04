// src/components/atoms/PeriodCheckbox.tsx
'use client';

import { memo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

interface PeriodCheckboxProps {
  period: string;
  checked: boolean;
  onCheckedChange: () => void;
}

/**
 * Checkbox component for selecting display periods in the results table.
 * Follows atomic design pattern - single responsibility for period selection UI.
 *
 * Performance: Memoized with React 19 - simple component, cheap to memoize
 */
export const PeriodCheckbox = memo(function PeriodCheckbox({
  period,
  checked,
  onCheckedChange,
}: PeriodCheckboxProps) {
  const checkboxId = `period-${period}`;

  return (
    <div className={cn('flex items-center', SPACING.GAP_2)}>
      <Checkbox
        id={checkboxId}
        checked={checked}
        onCheckedChange={(checked) => {
          // Only toggle if checked is boolean (not "indeterminate")
          if (typeof checked === 'boolean') {
            onCheckedChange();
          }
        }}
      />
      <Label
        htmlFor={checkboxId}
        className={cn('cursor-pointer select-none font-normal', TYPOGRAPHY.TEXT_SM)}
      >
        {period}
      </Label>
    </div>
  );
});
