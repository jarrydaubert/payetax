// src/components/molecules/DirectorGuide/inputs/AlreadyTakenInputs.tsx
/**
 * Already Taken Inputs - Money withdrawn + via payroll status
 */
'use client';

import { Info } from 'lucide-react';
import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  type TakenViaPayroll,
  useDirectorFormData,
  useDirectorGuideActions,
} from '@/store/directorGuideStore';

export function AlreadyTakenInputs() {
  const id = useId();
  const formData = useDirectorFormData();
  const { setAlreadyTaken, setTakenViaPayroll } = useDirectorGuideActions();

  const alreadyTakenId = `${id}-alreadyTaken`;
  const viaPayrollId = `${id}-viaPayroll`;

  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      {/* Already Taken */}
      <div className='space-y-2'>
        <div className='flex items-center gap-1'>
          <Label htmlFor={alreadyTakenId}>Already Taken This Year</Label>
          <Tooltip>
            <TooltipTrigger>
              <Info className='size-4 text-muted-foreground' />
            </TooltipTrigger>
            <TooltipContent>
              <p className='max-w-xs'>
                Money you&apos;ve already transferred from company to personal account
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground'>£</span>
          <Input
            id={alreadyTakenId}
            type='number'
            value={formData.alreadyTaken || ''}
            onChange={(e) => setAlreadyTaken(parseFloat(e.target.value) || 0)}
            placeholder='0'
          />
        </div>
      </div>

      {/* Via Payroll */}
      <div className='space-y-2'>
        <div className='flex items-center gap-1'>
          <Label htmlFor={viaPayrollId}>Was this via payroll?</Label>
          <Tooltip>
            <TooltipTrigger>
              <Info className='size-4 text-muted-foreground' />
            </TooltipTrigger>
            <TooltipContent>
              <p className='max-w-xs'>
                If not via payroll, it may be a Director&apos;s Loan with tax implications
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Select
          value={formData.takenViaPayroll}
          onValueChange={(v) => setTakenViaPayroll(v as TakenViaPayroll)}
        >
          <SelectTrigger id={viaPayrollId}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='yes'>Yes, via payroll/RTI</SelectItem>
            <SelectItem value='no'>No, direct transfer</SelectItem>
            <SelectItem value='unsure'>Not sure</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
