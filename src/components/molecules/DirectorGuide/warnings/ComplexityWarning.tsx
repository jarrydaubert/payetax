// src/components/molecules/DirectorGuide/warnings/ComplexityWarning.tsx
'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/ui/alert';
import { Button } from '@/components/atoms/ui/button';
import { trackEvent } from '@/lib/analytics';
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
  const handleAccountantClick = () => {
    trackEvent({
      action: 'accountant_cta_clicked',
      category: 'director_guide',
      label: 'high_complexity',
    });
    window.open('https://www.unbiased.co.uk/find-an-accountant', '_blank', 'noopener,noreferrer');
  };

  return (
    <Alert className={cn('border-purple-500/50 bg-purple-500/5', className)}>
      <Sparkles className='size-4 text-purple-500' />
      <AlertTitle className='text-purple-700 dark:text-purple-400'>
        This is getting interesting
      </AlertTitle>
      <AlertDescription className='space-y-3 text-sm'>
        <p>
          With profits above £250,000, there are tax planning opportunities beyond simple salary +
          dividends. An accountant could save you serious money — pension contributions, family
          member salaries, investment company structures, and more.
        </p>
        <Button
          variant='outline'
          size='sm'
          onClick={handleAccountantClick}
          className='border-purple-500/30 hover:bg-purple-500/10'
        >
          Find an accountant
          <ArrowRight className='ml-2 size-4' />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
