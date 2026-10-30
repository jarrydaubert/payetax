// src/components/molecules/DirectorGuide/inputs/OtherIncomeInput.tsx
/**
 * Other Income Input - Employment salary, rental income, etc.
 */
'use client';

import { useId } from 'react';
import { LabelTooltip } from '@/components/atoms/LabelTooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDirectorFormValue, useDirectorGuideActions } from '@/store/directorGuideStore';

export function OtherIncomeInput() {
  const id = useId();
  const otherIncome = useDirectorFormValue((formData) => formData.otherIncome);
  const { setOtherIncome } = useDirectorGuideActions();

  const inputId = `${id}-otherIncome`;

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-1'>
        <Label htmlFor={inputId}>Other Personal Income</Label>
        <LabelTooltip fieldName='directorOtherIncome' />
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-muted-foreground'>£</span>
        <Input
          id={inputId}
          type='number'
          value={otherIncome || ''}
          onChange={(e) => setOtherIncome(parseFloat(e.target.value) || 0)}
          placeholder='0'
        />
      </div>
    </div>
  );
}
