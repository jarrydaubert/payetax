'use client';

import './globals.css';
import * as Sentry from '@sentry/nextjs';
import { ChevronDown, Home, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [sentryEventId, setSentryEventId] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const capturedRef = useRef<string | null>(null);

  // Best correlation ID: digest (from Next.js) > Sentry event ID
  const displayId = error.digest || sentryEventId || 'unknown';

  useEffect(() => {
    // Prevent double-capture (React strict mode, re-renders, retry attempts)
    const errorKey = `${error.digest ?? ''}:${error.message}`;
    if (capturedRef.current === errorKey) return;
    capturedRef.current = errorKey;

    const eventId = Sentry.captureException(error, {
      tags: { error_boundary: 'global' },
      contexts: { error_details: { digest: error.digest } },
    });
    setSentryEventId(eventId);
  }, [error]);

  return (
    <html lang='en'>
      <body className='min-h-screen bg-background text-foreground'>
        <div className='flex min-h-screen flex-col items-center justify-center p-6'>
          <div className='w-full max-w-md text-center'>
            {/* Icon */}
            <div className='mx-auto mb-8 flex size-20 items-center justify-center rounded-full border border-border/60 bg-card/50'>
              <span className='font-display text-4xl'>!</span>
            </div>

            {/* Title */}
            <h1 className='font-bold font-display text-3xl tracking-tight'>Something went wrong</h1>

            {/* Description */}
            <p className='mt-3 text-muted-foreground'>
              We hit an unexpected snag. Our team has been notified and we're looking into it.
            </p>

            {/* Actions */}
            <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center'>
              <Button
                type='button'
                onClick={() => reset()}
                size='touch'
                variant='outline'
                className='rounded-full px-6'
              >
                <RotateCcw className='size-3.5' />
                Try again
              </Button>
              <Button asChild size='touch' variant='outline' className='rounded-full px-6'>
                <Link href='/'>
                  <Home className='size-3.5' />
                  Go home
                </Link>
              </Button>
            </div>

            {/* Error reference - actionable for support */}
            <p className='mt-8 font-mono text-muted-foreground/60 text-xs'>
              Error ID: {displayId.length > 12 ? displayId.slice(-12) : displayId}
            </p>

            {/* Dev Debug - only in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className='mt-6'>
                <button
                  type='button'
                  onClick={() => setShowDebug(!showDebug)}
                  className='inline-flex items-center gap-1 text-sm text-warning/80 transition-colors hover:text-warning'
                >
                  <ChevronDown
                    className={`size-4 transition-transform ${showDebug ? 'rotate-180' : ''}`}
                  />
                  Debug info
                </button>
                {showDebug && (
                  <div className='mt-3 rounded-xl border border-warning/20 bg-warning/5 p-4 text-left'>
                    <pre className='overflow-auto whitespace-pre-wrap font-mono text-warning/80 text-xs'>
                      {error.message}
                      {'\n\n'}
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
