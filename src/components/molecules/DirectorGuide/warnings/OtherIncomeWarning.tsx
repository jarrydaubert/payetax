// src/components/molecules/DirectorGuide/warnings/OtherIncomeWarning.tsx
'use client';

import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/ui/alert';
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
  return (
    <Alert variant='destructive' className={cn('border-amber-500/50 bg-amber-500/5', className)}>
      <AlertTriangle className='size-4' />
      <AlertTitle>You indicated other income</AlertTitle>
      <AlertDescription className='space-y-2 text-sm'>
        <p>
          These numbers assume your company is your only income. Because you have other income,
          your actual tax will be <strong>higher</strong> than shown.
        </p>
        <p>Use these as a rough baseline only. For accurate figures, talk to an accountant.</p>
        <p className='text-muted-foreground text-xs'>
          [Coming soon: Enter your other income for accurate numbers]
        </p>
      </AlertDescription>
    </Alert>
  );
}
