// src/components/molecules/DirectorGuide/OtherIncomeGate.tsx
'use client';

import { AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/atoms/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card';
import { cn } from '@/lib/utils';
import {
  useDirectorGuideActions,
  useDirectorGuideStore,
  useIsStepAccessible,
} from '@/store/directorGuideStore';

interface OtherIncomeGateProps {
  className?: string;
}

const OTHER_INCOME_SCENARIOS = [
  "A job earlier this tax year (even if you've left)",
  'Rental income',
  'Another business or directorship',
  'Part-time or freelance work',
  'Pension payments',
  'Redundancy over £30,000',
];

/**
 * Step 5: Other Income Gate - Pre-calculation acknowledgment
 *
 * Forces users to acknowledge the "only income" assumption before seeing results.
 * Catches mid-year starters, people with rental income, etc.
 */
export function OtherIncomeGate({ className }: OtherIncomeGateProps) {
  const { currentStep, stepStatus, hasOtherIncome } = useDirectorGuideStore();
  const { setHasOtherIncome, completeStep, calculate } = useDirectorGuideActions();
  const isAccessible = useIsStepAccessible('otherIncomeGate');

  const isActive = currentStep === 'otherIncomeGate';
  const isComplete = stepStatus.otherIncomeGate;

  const handleNoneApply = () => {
    setHasOtherIncome(false);
    completeStep('otherIncomeGate');
    calculate();
  };

  const handleHasOther = () => {
    setHasOtherIncome(true);
    completeStep('otherIncomeGate');
    calculate();
  };

  // Completed state
  if (isComplete && !isActive) {
    return (
      <Card className={cn('border-primary/20', className)}>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='flex size-6 items-center justify-center rounded-full bg-primary'>
                <Check className='size-4 text-primary-foreground' />
              </div>
              <CardTitle className='text-base'>Other income check</CardTitle>
            </div>
            <button
              type='button'
              onClick={() => useDirectorGuideStore.getState().editStep('otherIncomeGate')}
              className='text-primary text-sm hover:underline'
            >
              Edit
            </button>
          </div>
          <p className='ml-8 text-muted-foreground text-sm'>
            {hasOtherIncome
              ? 'Has other income (results shown as baseline only)'
              : 'No other income - company is sole income'}
          </p>
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
              <span className='text-muted-foreground text-xs'>5</span>
            </div>
            <CardTitle className='text-muted-foreground text-base'>One more thing...</CardTitle>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Active state
  return (
    <Card className={cn('border-amber-500/50 bg-amber-500/5', className)} aria-live='polite'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <div className='flex size-6 items-center justify-center rounded-full bg-amber-500'>
            <AlertTriangle className='size-4 text-white' />
          </div>
          <CardTitle className='text-base'>One more thing</CardTitle>
        </div>
        <p className='ml-8 text-muted-foreground text-sm'>
          This calculation assumes your company is your <strong>only income</strong> this tax year
          (April 2025 - April 2026).
        </p>
      </CardHeader>
      <CardContent>
        <div className='ml-8 space-y-4'>
          <div className='space-y-2'>
            <p className='font-medium text-sm'>
              If you have ANY of these, these numbers won&apos;t be accurate:
            </p>
            <ul className='space-y-1 text-muted-foreground text-sm'>
              {OTHER_INCOME_SCENARIOS.map((scenario) => (
                <li key={scenario} className='flex items-start gap-2'>
                  <span className='text-amber-500' aria-hidden='true'>
                    •
                  </span>
                  {scenario}
                </li>
              ))}
            </ul>
          </div>

          <div className='flex flex-col gap-3 sm:flex-row'>
            <Button onClick={handleNoneApply} className='flex-1'>
              None of these apply — show my results
            </Button>
            <Button variant='outline' onClick={handleHasOther} className='flex-1'>
              One of these applies
            </Button>
          </div>

          <p className='text-center text-muted-foreground text-xs'>
            If one applies, we&apos;ll still show results but with a warning that your actual tax
            will be higher.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
