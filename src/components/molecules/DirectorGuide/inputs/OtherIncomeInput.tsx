// src/components/molecules/DirectorGuide/inputs/OtherIncomeInput.tsx
/**
 * Other Income Input - Employment salary, rental income, etc.
 */
'use client';

import { Info } from 'lucide-react';
import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDirectorFormData, useDirectorGuideActions } from '@/store/directorGuideStore';

export function OtherIncomeInput() {
  const id = useId();
  const formData = useDirectorFormData();
  const { setOtherIncome } = useDirectorGuideActions();

  const inputId = `${id}-otherIncome`;

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-1'>
        <Label htmlFor={inputId}>Other Personal Income</Label>
        <Tooltip>
          <TooltipTrigger>
            <Info className='size-4 text-muted-foreground' />
          </TooltipTrigger>
          <TooltipContent>
            <p className='max-w-xs'>
              Employment salary, rental income, etc. Affects your dividend tax bands.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-muted-foreground'>£</span>
        <Input
          id={inputId}
          type='number'
          value={formData.otherIncome || ''}
          onChange={(e) => setOtherIncome(parseFloat(e.target.value) || 0)}
          placeholder='0'
        />
      </div>
    </div>
  );
}
