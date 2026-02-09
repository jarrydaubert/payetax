'use client';

import * as Sentry from '@sentry/nextjs';
import { ChevronDown, Home, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ToolsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorId = useId().replace(/:/g, '');
  const [showDebug, setShowDebug] = useState(false);
  const capturedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate captures on Fast Refresh / rerenders
    if (capturedRef.current) return;
    capturedRef.current = true;

    Sentry.captureException(error, {
      tags: { error_boundary: 'tools', error_id: errorId },
      contexts: { error_details: { digest: error.digest, error_id: errorId } },
    });
  }, [error, errorId]);

  return (
    <div className='flex min-h-[70vh] flex-col items-center justify-center p-6'>
      <div className='w-full max-w-md text-center' role='alert'>
        {/* Icon */}
        <div
          className='mx-auto mb-8 flex size-20 items-center justify-center rounded-full border border-white/10 bg-white/5'
          aria-hidden='true'
        >
          <span className='font-display text-4xl'>!</span>
        </div>

        {/* Title */}
        <h1 className='font-bold font-display text-3xl tracking-tight'>Something went wrong</h1>

        {/* Description */}
        <p className='mt-3 text-white/60'>
          This tool hit an unexpected error. Try refreshing, or head back to explore other tools.
        </p>

        {/* Actions */}
        <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center'>
          <Button
            type='button'
            onClick={() => reset()}
            size='touch'
            variant='brandOutline'
            className='rounded-full px-6'
          >
            <RotateCcw className='size-4' aria-hidden='true' />
            Try again
          </Button>
          <Link
            href='/'
            className='inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-semibold transition-all hover:border-white/20 hover:bg-white/10'
          >
            <Home className='size-4' aria-hidden='true' />
            Go home
          </Link>
        </div>

        {/* Error reference - subtle */}
        <p className='mt-8 font-mono text-white/30 text-xs'>Error ID: {errorId.slice(-8)}</p>

        {/* Dev Debug - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className='mt-6'>
            <button
              type='button'
              onClick={() => setShowDebug(!showDebug)}
              aria-expanded={showDebug}
              className='inline-flex items-center gap-1 text-amber-400/70 text-sm transition-colors hover:text-amber-400'
            >
              <ChevronDown
                className={`size-4 transition-transform ${showDebug ? 'rotate-180' : ''}`}
                aria-hidden='true'
              />
              Debug info
            </button>
            {showDebug && (
              <div className='mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-left'>
                <pre className='overflow-auto whitespace-pre-wrap font-mono text-amber-200/80 text-xs'>
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
