'use client';

import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, Calculator, Home, RefreshCw } from 'lucide-react';
import { useEffect, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function CalculatorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorId = useId().replace(/:/g, '');

  useEffect(() => {
    Sentry.captureException(error, {
      tags: { error_boundary: 'calculator', error_id: errorId },
      contexts: { error_details: { digest: error.digest, error_id: errorId } },
    });
  }, [error, errorId]);

  return (
    <div className='flex min-h-[60vh] items-center justify-center p-4'>
      <Card className='w-full max-w-md p-8 text-center'>
        <div className='mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10'>
          <AlertTriangle className='size-8 text-destructive' />
        </div>

        <h1 className='font-bold text-2xl'>Calculation Error</h1>
        <p className='mt-2 text-muted-foreground'>
          We couldn&apos;t process this salary calculation. Please try again or use a different
          value.
        </p>

        <p className='mt-4 font-mono text-muted-foreground text-xs'>
          Reference: <span className='text-primary'>{errorId.slice(-8)}</span>
        </p>

        <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center'>
          <Button onClick={() => reset()} className='gap-2'>
            <RefreshCw className='size-4' />
            Try again
          </Button>
          <Button variant='outline' asChild className='gap-2'>
            <a href='/'>
              <Calculator className='size-4' />
              New calculation
            </a>
          </Button>
          <Button variant='ghost' asChild className='gap-2'>
            <a href='/'>
              <Home className='size-4' />
              Home
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
