'use client';

import * as Sentry from '@sentry/nextjs';
import { ChevronDown, Home, RotateCcw } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

export default function BlogPostError({
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
      tags: { error_boundary: 'blog-post', error_id: errorId },
      contexts: { error_details: { digest: error.digest, error_id: errorId } },
    });
  }, [error, errorId]);

  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center p-6'>
      <div className='w-full max-w-md text-center'>
        {/* Icon */}
        <div className='mx-auto mb-8 flex size-20 items-center justify-center rounded-full border border-white/10 bg-white/5'>
          <span className='font-display text-4xl'>!</span>
        </div>

        {/* Title */}
        <h1 className='font-display font-bold text-3xl tracking-tight'>Article not available</h1>

        {/* Description */}
        <p className='mt-3 text-white/60'>
          We couldn't load this article. It may have been moved or there was a temporary issue.
        </p>

        {/* Actions */}
        <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center'>
          <button
            type='button'
            onClick={() => reset()}
            className='inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 font-semibold text-white transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]'
          >
            <RotateCcw className='size-4' />
            Try again
          </button>
          <a
            href='/'
            className='inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-semibold transition-all hover:border-white/20 hover:bg-white/10'
          >
            <Home className='size-4' />
            Go home
          </a>
        </div>

        {/* Error reference */}
        <p className='mt-8 font-mono text-white/30 text-xs'>Error ID: {errorId.slice(-8)}</p>

        {/* Dev Debug */}
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
  );
}
