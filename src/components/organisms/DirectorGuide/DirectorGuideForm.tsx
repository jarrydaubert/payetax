// src/components/organisms/DirectorGuide/DirectorGuideForm.tsx
'use client';

import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/atoms/ui/button';
import {
  AlreadyTakenStep,
  ExpensesStep,
  LocationStep,
  OtherIncomeGate,
  RevenueStep,
  WhatYouNeed,
} from '@/components/molecules/DirectorGuide';
import {
  useDirectorGuideActions,
  useDirectorGuideStore,
  useDirectorStepStatus,
} from '@/store/directorGuideStore';

interface DirectorGuideFormProps {
  className?: string;
}

/**
 * Director Guide Form - Main orchestrator
 *
 * Renders all form steps with progressive disclosure.
 * Steps are disabled until previous steps are complete.
 */
/**
 * Calculate current step number (1-5) based on completion status
 */
function getStepNumber(stepStatus: {
  location: boolean;
  revenue: boolean;
  expenses: boolean;
  alreadyTaken: boolean;
  otherIncomeGate: boolean;
}): number {
  if (!stepStatus.location) return 1;
  if (!stepStatus.revenue) return 2;
  if (!stepStatus.expenses) return 3;
  if (!stepStatus.alreadyTaken) return 4;
  return 5;
}

export function DirectorGuideForm({ className }: DirectorGuideFormProps) {
  const { showResults } = useDirectorGuideStore();
  const stepStatus = useDirectorStepStatus();
  const { reset } = useDirectorGuideActions();

  // Don't show form if we're showing results
  if (showResults) {
    return null;
  }

  const currentStepNumber = getStepNumber(stepStatus);
  const hasStarted = stepStatus.location;

  return (
    <div className={className}>
      {/* Header */}
      <div className='mb-8 text-center'>
        <h1 className='font-bold text-3xl tracking-tight sm:text-4xl'>
          How Much Can I Pay Myself?
        </h1>
        <p className='mt-2 text-muted-foreground'>
          Let&apos;s work it out together. No jargon. No stress.
        </p>
      </div>

      {/* What You'll Need */}
      <WhatYouNeed className='mb-6' />

      {/* Progress Indicator */}
      <div className='mb-4 flex items-center justify-between text-muted-foreground text-sm'>
        <span>Step {currentStepNumber} of 5</span>
        <div className='flex gap-1'>
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                step < currentStepNumber
                  ? 'bg-primary'
                  : step === currentStepNumber
                    ? 'bg-primary/50'
                    : 'bg-muted'
              }`}
              aria-hidden='true'
            />
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <div className='space-y-4'>
        <LocationStep />
        <RevenueStep />
        <ExpensesStep />
        <AlreadyTakenStep />
        <OtherIncomeGate />
      </div>

      {/* Reset Button - only show after first step */}
      {hasStarted && (
        <div className='mt-6 flex justify-center'>
          <Button variant='ghost' size='sm' onClick={reset} className='text-muted-foreground'>
            <RotateCcw className='mr-2 size-4' />
            Start over
          </Button>
        </div>
      )}
    </div>
  );
}
