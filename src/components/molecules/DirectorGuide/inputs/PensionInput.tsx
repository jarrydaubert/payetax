// src/components/molecules/DirectorGuide/inputs/PensionInput.tsx
/**
 * Pension Input - Employer pension contribution
 */
'use client';

import { useId } from 'react';
import { LabelTooltip } from '@/components/atoms/LabelTooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDirectorFormValue, useDirectorGuideActions } from '@/store/directorGuideStore';

export function PensionInput() {
  const id = useId();
  const pensionContribution = useDirectorFormValue((formData) => formData.pensionContribution);
  const { setPensionContribution } = useDirectorGuideActions();

  const inputId = `${id}-pension`;

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-1'>
        <Label htmlFor={inputId}>Employer Pension Contribution</Label>
        <LabelTooltip fieldName='directorPension' />
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-muted-foreground'>£</span>
        <Input
          id={inputId}
          type='number'
          value={pensionContribution || ''}
          onChange={(e) => setPensionContribution(parseFloat(e.target.value) || 0)}
          placeholder='0'
        />
      </div>
    </div>
  );
}
