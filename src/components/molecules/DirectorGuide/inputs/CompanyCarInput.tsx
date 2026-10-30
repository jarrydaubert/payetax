// src/components/molecules/DirectorGuide/inputs/CompanyCarInput.tsx
/**
 * Company Car Input - Benefit in Kind value
 */
'use client';

import { useId } from 'react';
import { LabelTooltip } from '@/components/atoms/LabelTooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDirectorFormValue, useDirectorGuideActions } from '@/store/directorGuideStore';

export function CompanyCarInput() {
  const id = useId();
  const companyCarBIK = useDirectorFormValue((formData) => formData.companyCarBIK);
  const { setCompanyCarBIK } = useDirectorGuideActions();

  const inputId = `${id}-bik`;

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-1'>
        <Label htmlFor={inputId}>Company Car (BIK Value)</Label>
        <LabelTooltip fieldName='directorCompanyCar' />
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-muted-foreground'>£</span>
        <Input
          id={inputId}
          type='number'
          value={companyCarBIK || ''}
          onChange={(e) => setCompanyCarBIK(parseFloat(e.target.value) || 0)}
          placeholder='0'
        />
      </div>
    </div>
  );
}
