// src/components/molecules/DirectorGuide/inputs/CompanyCarInput.tsx
/**
 * Company Car Input - Benefit in Kind value
 */
'use client';

import { Info } from 'lucide-react';
import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
        <Tooltip>
          <TooltipTrigger>
            <Info className='size-4 text-muted-foreground' />
          </TooltipTrigger>
          <TooltipContent>
            <p className='max-w-xs'>
              <strong>Taxable benefit = List Price × BIK Rate</strong>
              <span className='mt-1 block'>• Tesla Model 3 (£40k × 2%) = £800/year</span>
              <span className='block'>• BMW 330e (£45k × 8%) = £3,600/year</span>
              <span className='block'>• Range Rover (£80k × 37%) = £29,600/year</span>
              <span className='mt-1 block text-amber-200'>
                Enter the annual BIK value (List Price × BIK %)
              </span>
            </p>
          </TooltipContent>
        </Tooltip>
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
