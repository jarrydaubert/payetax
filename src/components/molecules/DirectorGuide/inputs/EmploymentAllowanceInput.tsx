// src/components/molecules/DirectorGuide/inputs/EmploymentAllowanceInput.tsx
/**
 * Employment Allowance Input - EA checkbox
 */
'use client';

import { useId } from 'react';
import { LabelTooltip } from '@/components/atoms/LabelTooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useDirectorFormValue, useDirectorGuideActions } from '@/store/directorGuideStore';

export function EmploymentAllowanceInput() {
  const id = useId();
  const hasEmploymentAllowance = useDirectorFormValue(
    (formData) => formData.hasEmploymentAllowance,
  );
  const { setHasEmploymentAllowance } = useDirectorGuideActions();

  const checkboxId = `${id}-ea`;

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-1'>
        <Label htmlFor={checkboxId}>Employment Allowance</Label>
        <LabelTooltip fieldName='directorEmploymentAllowance' />
      </div>
      <div className='flex items-center gap-2 pt-1'>
        <Checkbox
          id={checkboxId}
          checked={hasEmploymentAllowance}
          onCheckedChange={(checked) => setHasEmploymentAllowance(checked === true)}
        />
        <Label htmlFor={checkboxId} className='font-normal text-sm'>
          Company claims Employment Allowance
        </Label>
      </div>
    </div>
  );
}
