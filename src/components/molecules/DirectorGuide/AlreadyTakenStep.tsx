// src/components/molecules/DirectorGuide/AlreadyTakenStep.tsx
'use client';

import { Check, Wallet } from 'lucide-react';
import { useId, useState } from 'react';
import { Button } from '@/components/atoms/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatNumber, parseFormattedValue } from '@/lib/utils';
import {
  useDirectorFormData,
  useDirectorGuideActions,
  useDirectorGuideStore,
  useIsStepAccessible,
} from '@/store/directorGuideStore';

interface AlreadyTakenStepProps {
  className?: string;
}

/**
 * Step 4: Already paid yourself this year?
 */
export function AlreadyTakenStep({ className }: AlreadyTakenStepProps) {
  const { currentStep, stepStatus } = useDirectorGuideStore();
  const formData = useDirectorFormData();
  const { setAlreadyTaken, setAlreadyTakenViaPayroll, completeStep } = useDirectorGuideActions();
  const isAccessible = useIsStepAccessible('alreadyTaken');

  const isActive = currentStep === 'alreadyTaken';
  const isComplete = stepStatus.alreadyTaken;

  const inputId = useId();
  const [hasTaken, setHasTaken] = useState<boolean | null>(
    formData.alreadyTaken && formData.alreadyTaken > 0 ? true : null
  );

  const [displayValue, setDisplayValue] = useState(
    formData.alreadyTaken ? formatNumber(formData.alreadyTaken, 0) : ''
  );

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplayValue(raw);
    const parsed = parseFormattedValue(raw);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      setAlreadyTaken(parsed);
    }
  };

  const handleBlur = () => {
    if (formData.alreadyTaken !== undefined && formData.alreadyTaken > 0) {
      setDisplayValue(formatNumber(formData.alreadyTaken, 0));
    }
  };

  const handleNoTaken = () => {
    setHasTaken(false);
    setAlreadyTaken(0);
    setAlreadyTakenViaPayroll(null);
    completeStep('alreadyTaken');
  };

  const handleContinue = () => {
    completeStep('alreadyTaken');
  };

  // Completed state
  if (isComplete && !isActive) {
    let summary = 'No';
    if (formData.alreadyTaken && formData.alreadyTaken > 0) {
      summary = `£${formatNumber(formData.alreadyTaken, 0)}`;
      if (formData.alreadyTakenViaPayroll === true) {
        summary += ' (via payroll)';
      } else if (formData.alreadyTakenViaPayroll === false) {
        summary += ' (not via payroll)';
      }
    }

    return (
      <Card className={cn('border-primary/20', className)}>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='flex size-6 items-center justify-center rounded-full bg-primary'>
                <Check className='size-4 text-primary-foreground' />
              </div>
              <CardTitle className='text-base'>Already paid yourself?</CardTitle>
            </div>
            <button
              type='button'
              onClick={() => useDirectorGuideStore.getState().editStep('alreadyTaken')}
              className='text-primary text-sm hover:underline'
            >
              Edit
            </button>
          </div>
          <p className='ml-8 text-muted-foreground text-sm'>{summary}</p>
        </CardHeader>
      </Card>
    );
  }

  // Disabled state
  if (!(isActive && isAccessible)) {
    return (
      <Card
        className={cn('border-muted/50 opacity-50', className)}
        aria-hidden='true'
        tabIndex={-1}
      >
        <CardHeader className='pb-3'>
          <div className='flex items-center gap-2'>
            <div className='flex size-6 items-center justify-center rounded-full border border-muted-foreground/30'>
              <span className='text-muted-foreground text-xs'>4</span>
            </div>
            <CardTitle className='text-muted-foreground text-base'>
              Already paid yourself?
            </CardTitle>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Active state
  return (
    <Card className={cn('border-primary', className)} aria-live='polite'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <div className='flex size-6 items-center justify-center rounded-full bg-primary'>
            <Wallet className='size-4 text-primary-foreground' />
          </div>
          <CardTitle className='text-base'>Already paid yourself?</CardTitle>
        </div>
        <p className='ml-8 text-muted-foreground text-sm'>
          Have you already taken money from your company this tax year?
        </p>
      </CardHeader>
      <CardContent>
        <div className='ml-8 space-y-4'>
          {hasTaken === null && (
            <div className='flex gap-3'>
              <Button variant='outline' onClick={handleNoTaken} className='flex-1'>
                No, not yet
              </Button>
              <Button variant='outline' onClick={() => setHasTaken(true)} className='flex-1'>
                Yes
              </Button>
            </div>
          )}

          {hasTaken === true && (
            <>
              <div className='space-y-2'>
                <Label htmlFor={inputId}>How much?</Label>
                <div className='relative'>
                  <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                    £
                  </span>
                  <Input
                    id={inputId}
                    type='text'
                    inputMode='numeric'
                    value={displayValue}
                    onChange={handleValueChange}
                    onBlur={handleBlur}
                    placeholder='5,000'
                    className='pl-7'
                    autoFocus
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Was this through payroll?</Label>
                <div className='flex flex-wrap gap-2'>
                  <Button
                    variant={formData.alreadyTakenViaPayroll === true ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setAlreadyTakenViaPayroll(true)}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={formData.alreadyTakenViaPayroll === false ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setAlreadyTakenViaPayroll(false)}
                  >
                    No
                  </Button>
                  <Button
                    variant={formData.alreadyTakenViaPayroll === null ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setAlreadyTakenViaPayroll(null)}
                  >
                    Not sure
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleContinue}
                disabled={!formData.alreadyTaken || formData.alreadyTaken <= 0}
                className='w-full sm:w-auto'
              >
                Continue
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
