// src/components/molecules/DirectorGuide/warnings/DLAWarning.tsx
'use client';

import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/ui/alert';
import { cn } from '@/lib/utils';

interface DLAWarningProps {
  className?: string;
}

/**
 * Director's Loan Account warning
 *
 * Shows when user has taken money without payroll (alreadyTaken > 0 && !viaPayroll).
 */
export function DLAWarning({ className }: DLAWarningProps) {
  return (
    <Alert variant='destructive' className={cn('border-amber-500/50 bg-amber-500/5', className)}>
      <AlertTriangle className='size-4' />
      <AlertTitle>Possible Director&apos;s Loan</AlertTitle>
      <AlertDescription className='text-sm'>
        Money taken without payroll may be a Director&apos;s Loan. This has tax implications — you
        could owe the company, and there may be a 33.75% tax charge if not repaid within 9 months.
        Talk to an accountant.
      </AlertDescription>
    </Alert>
  );
}
