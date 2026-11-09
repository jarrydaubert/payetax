'use client';

import { useId } from 'react';
import { LabelTooltip } from '@/components/atoms/LabelTooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parseAccountingPeriodEnd } from '@/lib/tax';
import { useDirectorFormSlice, useDirectorGuideActions } from '@/store/directorGuideStore';

export function AccountingPeriodEndInput({ className }: { className?: string }) {
  const id = useId();
  const value = useDirectorFormSlice((formData) => formData.accountingPeriodEnd);
  const { setAccountingPeriodEnd } = useDirectorGuideActions();
  const invalid = value !== '' && !parseAccountingPeriodEnd(value);

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-2'>
        <Label htmlFor={id} className='text-sm leading-none text-muted-foreground'>
          Company Accounting Period End
        </Label>
        <LabelTooltip fieldName='directorYearEnd' />
      </div>
      <Input
        id={id}
        type='text'
        value={value}
        onChange={(event) => setAccountingPeriodEnd(event.target.value)}
        placeholder='YYYY-MM-DD'
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-format ${id}-error` : `${id}-format`}
        className={className}
      />
      <p id={`${id}-format`} className='text-xs text-muted-foreground'>
        Use YYYY-MM-DD (for example, 2026-12-31). Leave blank if unsure.
      </p>
      {invalid && (
        <p id={`${id}-error`} className='text-xs text-destructive'>
          Enter a valid date in YYYY-MM-DD format, from 1 July 1999 onwards.
        </p>
      )}
    </div>
  );
}
