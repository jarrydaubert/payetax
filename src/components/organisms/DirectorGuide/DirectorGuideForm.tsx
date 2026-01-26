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
import { useDirectorGuideActions, useDirectorGuideStore } from '@/store/directorGuideStore';

interface DirectorGuideFormProps {
  className?: string;
}

/**
 * Director Guide Form - Main orchestrator
 *
 * Renders all form steps with progressive disclosure.
 * Steps are disabled until previous steps are complete.
 */
export function DirectorGuideForm({ className }: DirectorGuideFormProps) {
  const { showResults } = useDirectorGuideStore();
  const { reset } = useDirectorGuideActions();

  // Don't show form if we're showing results
  if (showResults) {
    return null;
  }

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

      {/* Form Steps */}
      <div className='space-y-4'>
        <LocationStep />
        <RevenueStep />
        <ExpensesStep />
        <AlreadyTakenStep />
        <OtherIncomeGate />
      </div>

      {/* Reset Button */}
      <div className='mt-6 flex justify-center'>
        <Button variant='ghost' size='sm' onClick={reset} className='text-muted-foreground'>
          <RotateCcw className='mr-2 size-4' />
          Start over
        </Button>
      </div>
    </div>
  );
}
