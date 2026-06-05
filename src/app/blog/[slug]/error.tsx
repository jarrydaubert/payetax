'use client';

import * as Sentry from '@sentry/nextjs';
import { ChevronDown, Home, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function BlogPostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const fallbackId = useId().replace(/:/g, '');
  const debugPanelId = useId();
  const [showDebug, setShowDebug] = useState(false);
  const capturedRef = useRef<string | null>(null);
  const sentryEventIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Guard against duplicate captures (dev/Strict Mode can remount)
    const key = error.digest ?? `${error.name}:${error.message}`;
    if (capturedRef.current === key) return;
    capturedRef.current = key;

    const eventId = Sentry.captureException(error, {
      tags: { error_boundary: 'blog-post' },
      contexts: { error_details: { digest: error.digest } },
    });

    // Store Sentry event ID for display
    sentryEventIdRef.current = typeof eventId === 'string' ? eventId : null;
  }, [error]);

  // Prefer error.digest (Next.js correlation), then Sentry eventId, then fallback
  const displayId = error.digest ?? sentryEventIdRef.current ?? fallbackId;

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-6'>
      <div className='w-full max-w-md text-center'>
        {/* Icon */}
        <div className='mx-auto mb-8 flex size-20 items-center justify-center rounded-full border border-border/60 bg-card/50'>
          <span className='font-display text-4xl'>!</span>
        </div>

        {/* Title */}
        <h1 className='font-bold font-display text-3xl tracking-tight'>Article not available</h1>

        {/* Description */}
        <p className='mt-3 text-muted-foreground'>
          We couldn't load this article. It may have been moved or there was a temporary issue.
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
            <RotateCcw className='size-4' />
            Try again
          </Button>
          <Link
            href='/'
            className='inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-card/50 px-6 py-3 font-semibold text-foreground transition-all hover:border-border hover:bg-card/70'
          >
            <Home className='size-4' />
            Go home
          </Link>
        </div>

        {/* Error reference - shows digest (Next.js), Sentry eventId, or fallback */}
        <p className='mt-8 font-mono text-muted-foreground/60 text-xs'>
          Error ID: {displayId.slice(-8)}
        </p>

        {/* Dev Debug */}
        {process.env.NODE_ENV === 'development' && (
          <div className='mt-6'>
            <button
              type='button'
              aria-expanded={showDebug}
              aria-controls={debugPanelId}
              onClick={() => setShowDebug(!showDebug)}
              className='inline-flex items-center gap-1 text-sm text-warning/80 transition-colors hover:text-warning'
            >
              <ChevronDown
                className={`size-4 transition-transform ${showDebug ? 'rotate-180' : ''}`}
              />
              Debug info
            </button>
            {showDebug && (
              <div
                id={debugPanelId}
                className='mt-3 rounded-xl border border-warning/20 bg-warning/5 p-4 text-left'
              >
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
  );
}
