// src/components/molecules/DirectorGuide/warnings/AlreadyTakenTooMuchWarning.tsx
'use client';

import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/ui/alert';
import { cn } from '@/lib/utils';

interface AlreadyTakenTooMuchWarningProps {
  className?: string;
}

/**
 * Warning when user has already taken more than the calculated safe amount
 */
export function AlreadyTakenTooMuchWarning({ className }: AlreadyTakenTooMuchWarningProps) {
  return (
    <Alert variant='destructive' className={cn('border-red-500/50 bg-red-500/5', className)}>
      <AlertTriangle className='size-4' />
      <AlertTitle>You may have taken too much</AlertTitle>
      <AlertDescription className='text-sm'>
        Based on this estimate, you&apos;ve already taken more than your company can safely support
        this year. Pause and speak to an accountant before taking more.
      </AlertDescription>
    </Alert>
  );
}
