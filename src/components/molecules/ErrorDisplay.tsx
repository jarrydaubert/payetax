'use client';

import { ChevronDown, Home, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  title?: string;
  description?: string;
  errorId: string;
  error?: Error;
  reset: () => void;
  secondaryAction?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
}

export function ErrorDisplay({
  title = 'Something went wrong',
  description = 'We hit an unexpected snag. Try refreshing the page.',
  errorId,
  error,
  reset,
  secondaryAction,
}: ErrorDisplayProps) {
  const [showDebug, setShowDebug] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-6'>
      <div className='w-full max-w-md text-center'>
        {/* Icon */}
        <div className='mx-auto mb-8 flex size-20 items-center justify-center rounded-full border border-border/60 bg-card/50'>
          <span className='font-display text-4xl'>!</span>
        </div>

        {/* Title */}
        <h1 className='font-bold font-display text-3xl tracking-tight'>{title}</h1>

        {/* Description */}
        <p className='mt-3 text-muted-foreground'>{description}</p>

        {/* Actions */}
        <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center'>
          <Button
            type='button'
            onClick={() => reset()}
            size='touch'
            variant='brandOutline'
            className='rounded-full px-6'
          >
            <RotateCcw className='size-4' />
            Try again
          </Button>

          {secondaryAction ? (
            <a
              href={secondaryAction.href}
              className='inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-card/50 px-6 py-3 font-semibold text-foreground transition-all hover:border-border hover:bg-card/70'
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </a>
          ) : (
            <a
              href='/'
              className='inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-card/50 px-6 py-3 font-semibold text-foreground transition-all hover:border-border hover:bg-card/70'
            >
              <Home className='size-4' />
              Go home
            </a>
          )}
        </div>

        {/* Error reference - subtle */}
        <p className='mt-8 font-mono text-muted-foreground/60 text-xs'>
          Error ID: {errorId.slice(-8)}
        </p>

        {/* Dev Debug - only in development */}
        {isDev && error && (
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
  );
}
