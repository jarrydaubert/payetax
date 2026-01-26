// src/components/molecules/DirectorGuide/warnings/VATWarning.tsx
'use client';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/ui/alert';
import { cn } from '@/lib/utils';

interface VATWarningProps {
  revenue: number;
  className?: string;
}

/**
 * VAT threshold warning
 *
 * Shows when revenue is between £85k-£95k (near £90k threshold).
 */
export function VATWarning({ revenue, className }: VATWarningProps) {
  const isAboveThreshold = revenue >= 90000;

  return (
    <Alert className={cn('border-blue-500/50 bg-blue-500/5', className)}>
      <AlertCircle className='size-4 text-blue-500' />
      <AlertTitle className='text-blue-700 dark:text-blue-400'>VAT Registration</AlertTitle>
      <AlertDescription className='text-sm'>
        {isAboveThreshold ? (
          <>
            With revenue above £90,000, you&apos;re required to register for VAT. If you&apos;re not
            registered yet, you may need to do so soon.
          </>
        ) : (
          <>
            Heads up: VAT registration is required above £90,000 turnover. You&apos;re getting
            close. If you&apos;re not registered yet, start planning for it.
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}
