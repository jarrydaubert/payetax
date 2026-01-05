'use client';

import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { useEffect, useId } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorId = useId().replace(/:/g, '');

  useEffect(() => {
    Sentry.captureException(error, {
      tags: { error_boundary: 'global', error_id: errorId },
      contexts: { error_details: { digest: error.digest, error_id: errorId } },
    });
  }, [error, errorId]);

  return (
    <html lang='en'>
      <body className='bg-background text-foreground'>
        <div className='flex min-h-screen items-center justify-center p-4'>
          <div className='w-full max-w-md text-center'>
            {/* Icon */}
            <div className='mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10'>
              <AlertTriangle className='size-8 text-destructive' />
            </div>

            {/* Message */}
            <h1 className='font-bold text-2xl'>Something went wrong</h1>
            <p className='mt-2 text-muted-foreground'>
              An unexpected error occurred. This has been automatically reported.
            </p>

            {/* Error Reference */}
            <p className='mt-4 font-mono text-muted-foreground text-xs'>
              Reference: <span className='text-primary'>{errorId.slice(-8)}</span>
            </p>

            {/* Actions */}
            <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center'>
              <button
                type='button'
                onClick={() => reset()}
                className='inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90'
              >
                <RefreshCw className='size-4' />
                Try again
              </button>
              <a
                href='/'
                className='inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-2.5 font-medium transition-colors hover:bg-accent'
              >
                <Home className='size-4' />
                Go home
              </a>
            </div>

            {/* Dev Debug */}
            {process.env.NODE_ENV === 'development' && (
              <details className='mt-8 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 text-left'>
                <summary className='cursor-pointer font-medium text-yellow-600'>
                  Debug Info (dev only)
                </summary>
                <pre className='mt-4 overflow-auto whitespace-pre-wrap text-destructive text-xs'>
                  {error.message}
                  {'\n\n'}
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
