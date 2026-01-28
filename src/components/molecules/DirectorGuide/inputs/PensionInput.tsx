// src/components/molecules/DirectorGuide/inputs/PensionInput.tsx
/**
 * Pension Input - Employer pension contribution
 */
'use client';

import { Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDirectorFormData, useDirectorGuideActions } from '@/store/directorGuideStore';

export function PensionInput() {
  const formData = useDirectorFormData();
  const { setPensionContribution } = useDirectorGuideActions();

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-1'>
        <Label htmlFor='pensionContribution'>Employer Pension Contribution</Label>
        <Tooltip>
          <TooltipTrigger>
            <Info className='size-4 text-muted-foreground' />
          </TooltipTrigger>
          <TooltipContent>
            <p className='max-w-xs'>
              <strong>Most tax-efficient extraction method.</strong> Company pays directly to your pension:
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
          id='pensionContribution'
          type='number'
          value={formData.pensionContribution || ''}
          onChange={(e) => setPensionContribution(parseFloat(e.target.value) || 0)}
          placeholder='0'
        />
      </div>
    </div>
  );
}
