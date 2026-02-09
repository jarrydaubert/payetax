// src/components/molecules/DirectorGuide/inputs/PensionInput.tsx
/**
 * Pension Input - Employer pension contribution
 */
'use client';

import { Info } from 'lucide-react';
import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
        <Tooltip>
          <TooltipTrigger>
            <Info className='size-4 text-muted-foreground' />
          </TooltipTrigger>
          <TooltipContent>
            <p className='max-w-xs'>
              <strong>Most tax-efficient extraction method.</strong> Company pays directly to your
              pension:
              <span className='mt-1 block'>• Deductible from Corporation Tax</span>
              <span className='block'>• No Employer or Employee NI</span>
              <span className='block'>• No Income Tax</span>
              <span className='mt-1 block text-amber-200'>
                Annual Allowance: £60,000 (or 100% of earnings if lower)
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
          value={pensionContribution || ''}
          onChange={(e) => setPensionContribution(parseFloat(e.target.value) || 0)}
          placeholder='0'
        />
      </div>
    </div>
  );
}
