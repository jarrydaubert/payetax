// src/components/molecules/DirectorGuide/warnings/ComplexityWarning.tsx
'use client';

import { Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/ui/alert';
import { cn } from '@/lib/utils';

interface ComplexityWarningProps {
  className?: string;
}

/**
 * High complexity warning for profits > £250k
 *
 * At this level, there are optimization opportunities beyond simple salary+dividends.
 */
export function ComplexityWarning({ className }: ComplexityWarningProps) {
  return (
    <Alert className={cn('border-purple-500/50 bg-purple-500/5', className)}>
      <Sparkles className='size-4 text-purple-500' />
      <AlertTitle className='text-purple-700 dark:text-purple-400'>
        This is getting interesting
      </AlertTitle>
      <AlertDescription className='text-sm'>
        With profits above £250,000, there are tax planning opportunities beyond simple
        salary + dividends. An accountant could save you serious money — pension contributions,
        family member salaries, investment company structures, and more.
      </AlertDescription>
    </Alert>
  );
}
