'use client';

import './globals.css';
import * as Sentry from '@sentry/nextjs';
import { ChevronDown, Home, RotateCcw } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorId = useId().replace(/:/g, '');
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    Sentry.captureException(error, {
      tags: { error_boundary: 'global', error_id: errorId },
      contexts: { error_details: { digest: error.digest, error_id: errorId } },
    });
  }, [error, errorId]);

  return (
    <html lang='en'>
      <body className='min-h-screen bg-[#020617] text-white'>
        {/* Gradient background */}
        <div className='fixed inset-0 -z-10'>
          <div className='absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5' />
          <div className='absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl' />
          <div className='absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl' />
        </div>

        <div className='flex min-h-screen flex-col items-center justify-center p-6'>
          <div className='w-full max-w-md text-center'>
            {/* Icon */}
            <div className='mx-auto mb-8 flex size-20 items-center justify-center rounded-full border border-white/10 bg-white/5'>
              <span className='font-display text-4xl'>!</span>
            </div>

            {/* Title */}
            <h1 className='font-bold font-display text-3xl tracking-tight'>Something went wrong</h1>

            {/* Description */}
            <p className='mt-3 text-white/60'>
              We hit an unexpected snag. Our team has been notified and we're looking into it.
            </p>

            {/* Actions */}
            <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center'>
              <button
                type='button'
                onClick={() => reset()}
                className='relative inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 font-medium text-sm text-white transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] before:absolute before:inset-0 before:rounded-full before:p-[1px] before:bg-gradient-to-r before:from-cyan-500 before:to-emerald-500 before:content-[""] before:-z-10 after:absolute after:inset-[1px] after:rounded-full after:bg-slate-900 after:content-[""] after:-z-10'
              >
                <RotateCcw className='size-3.5' />
                Try again
              </button>
              <a
                href='/'
                className='inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-medium text-sm transition-all hover:border-white/20 hover:bg-white/10'
              >
                <Home className='size-3.5' />
                Go home
              </a>
            </div>

            {/* Error reference - subtle */}
            <p className='mt-8 font-mono text-white/30 text-xs'>Error ID: {errorId.slice(-8)}</p>

            {/* Dev Debug - only in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className='mt-6'>
                <button
                  type='button'
                  onClick={() => setShowDebug(!showDebug)}
                  className='inline-flex items-center gap-1 text-amber-400/70 text-sm transition-colors hover:text-amber-400'
                >
                  <ChevronDown
                    className={`size-4 transition-transform ${showDebug ? 'rotate-180' : ''}`}
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
      </body>
    </html>
  );
}
