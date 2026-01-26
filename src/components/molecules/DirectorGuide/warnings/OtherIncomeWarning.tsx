// src/components/molecules/DirectorGuide/warnings/OtherIncomeWarning.tsx
'use client';

import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/ui/alert';
import { Button } from '@/components/atoms/ui/button';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface OtherIncomeWarningProps {
  className?: string;
}

/**
 * Persistent warning banner when user indicated other income
 *
 * Shows at top of results when confirmedSoleIncome is false.
 */
export function OtherIncomeWarning({ className }: OtherIncomeWarningProps) {
  const handleAccountantClick = () => {
    trackEvent({
      action: 'accountant_cta_clicked',
      category: 'director_guide',
      label: 'other_income',
    });
    window.open('https://www.unbiased.co.uk/find-an-accountant', '_blank', 'noopener,noreferrer');
  };

  return (
    <Alert variant='destructive' className={cn('border-amber-500/50 bg-amber-500/5', className)}>
      <AlertTriangle className='size-4' />
      <AlertTitle>You indicated other income</AlertTitle>
      <AlertDescription className='space-y-3 text-sm'>
        <p>
          These numbers assume your company is your only income. Because you have other income, your
          actual tax will be <strong>higher</strong> than shown.
        </p>
        <p>Use these as a rough baseline only.</p>
        <Button
          variant='outline'
          size='sm'
          onClick={handleAccountantClick}
          className='border-amber-500/30 hover:bg-amber-500/10'
        >
          Talk to an accountant
          <ArrowRight className='ml-2 size-4' />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
