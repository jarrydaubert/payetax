// src/components/atoms/PeriodCheckbox.tsx
'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface PeriodCheckboxProps {
  period: string;
  checked: boolean;
  onCheckedChange: () => void;
}

/**
 * Checkbox component for selecting display periods in the results table.
 * Follows atomic design pattern - single responsibility for period selection UI.
 */
export function PeriodCheckbox({ period, checked, onCheckedChange }: PeriodCheckboxProps) {
  const checkboxId = `period-${period}`;

  return (
    <div className='flex items-center space-x-2'>
      <Checkbox id={checkboxId} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={checkboxId} className='cursor-pointer select-none font-normal text-sm'>
        {period}
      </Label>
    </div>
  );
}
