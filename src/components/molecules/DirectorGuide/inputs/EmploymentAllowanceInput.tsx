// src/components/molecules/DirectorGuide/inputs/EmploymentAllowanceInput.tsx
/**
 * Employment Allowance Input - EA checkbox
 */
'use client';

import { Info } from 'lucide-react';
import { useId } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CURRENT_TAX_YEAR_DISPLAY } from '@/constants/taxRates';
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
        <Tooltip>
          <TooltipTrigger>
            <Info className='size-4 text-muted-foreground' />
          </TooltipTrigger>
          <TooltipContent>
            <p className='max-w-xs'>
              £10,500 allowance against Employer NI for {CURRENT_TAX_YEAR_DISPLAY}.
              <strong className='mt-1 block text-warning'>
                Not available to sole director companies
              </strong>
              You must have at least one other employee paid above £5,000/year to qualify. Two
              directors both paid above £5,000 also qualifies.
            </p>
          </TooltipContent>
        </Tooltip>
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
