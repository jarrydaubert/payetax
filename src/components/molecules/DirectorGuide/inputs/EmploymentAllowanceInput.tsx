// src/components/molecules/DirectorGuide/inputs/EmploymentAllowanceInput.tsx
/**
 * Employment Allowance Input - EA checkbox
 */
'use client';

import { Info } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDirectorFormData, useDirectorGuideActions } from '@/store/directorGuideStore';

const TAX_YEAR_DISPLAY = '2025/26';

export function EmploymentAllowanceInput() {
  const formData = useDirectorFormData();
  const { setHasEmploymentAllowance } = useDirectorGuideActions();

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-1'>
        <Label>Employment Allowance</Label>
        <Tooltip>
          <TooltipTrigger>
            <Info className='size-4 text-muted-foreground' />
          </TooltipTrigger>
          <TooltipContent>
            <p className='max-w-xs'>
              £10,500 allowance against Employer NI for {TAX_YEAR_DISPLAY}.
              <strong className='mt-1 block text-amber-200'>
                Not available to sole director companies
              </strong>
              You must have at least one other employee paid above £5,000/year to qualify.
              Two directors both paid above £5,000 also qualifies.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className='flex items-center gap-2 pt-1'>
        <Checkbox
          id='employmentAllowance'
          checked={formData.hasEmploymentAllowance}
          onCheckedChange={(checked) => setHasEmploymentAllowance(checked === true)}
        />
        <Label htmlFor='employmentAllowance' className='text-sm font-normal'>
          Company claims Employment Allowance
        </Label>
      </div>
    </div>
  );
}
