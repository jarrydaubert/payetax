// src/components/molecules/DirectorGuide/inputs/AlreadyTakenInputs.tsx
/**
 * Already Taken Inputs - YTD salary, dividends, and drawings
 */
'use client';

import { useId } from 'react';
import { LabelTooltip } from '@/components/atoms/LabelTooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDirectorFormSlice, useDirectorGuideActions } from '@/store/directorGuideStore';

export function AlreadyTakenInputs() {
  const id = useId();
  const { ytdSalary, ytdDividends, ytdDrawings } = useDirectorFormSlice((formData) => ({
    ytdSalary: formData.ytdSalary,
    ytdDividends: formData.ytdDividends,
    ytdDrawings: formData.ytdDrawings,
  }));
  const { setYtdSalary, setYtdDividends, setYtdDrawings } = useDirectorGuideActions();

  const ytdSalaryId = `${id}-ytdSalary`;
  const ytdDividendsId = `${id}-ytdDividends`;
  const ytdDrawingsId = `${id}-ytdDrawings`;

  return (
    <div className='grid gap-4 sm:grid-cols-3'>
      {/* YTD Salary */}
      <div className='space-y-2'>
        <div className='flex items-center gap-1'>
          <Label htmlFor={ytdSalaryId}>YTD Salary</Label>
          <LabelTooltip fieldName='directorYtdSalary' />
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground'>£</span>
          <Input
            id={ytdSalaryId}
            type='number'
            value={ytdSalary || ''}
            onChange={(e) => setYtdSalary(Number.parseFloat(e.target.value) || 0)}
            placeholder='0'
          />
        </div>
      </div>

      {/* YTD Dividends */}
      <div className='space-y-2'>
        <div className='flex items-center gap-1'>
          <Label htmlFor={ytdDividendsId}>YTD Dividends</Label>
          <LabelTooltip fieldName='directorYtdDividends' />
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground'>£</span>
          <Input
            id={ytdDividendsId}
            type='number'
            value={ytdDividends || ''}
            onChange={(e) => setYtdDividends(Number.parseFloat(e.target.value) || 0)}
            placeholder='0'
          />
        </div>
      </div>

      {/* YTD Drawings */}
      <div className='space-y-2'>
        <div className='flex items-center gap-1'>
          <Label htmlFor={ytdDrawingsId}>Other Drawings</Label>
          <LabelTooltip fieldName='directorYtdDrawings' />
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground'>£</span>
          <Input
            id={ytdDrawingsId}
            type='number'
            value={ytdDrawings || ''}
            onChange={(e) => setYtdDrawings(Number.parseFloat(e.target.value) || 0)}
            placeholder='0'
          />
        </div>
      </div>
    </div>
  );
}
