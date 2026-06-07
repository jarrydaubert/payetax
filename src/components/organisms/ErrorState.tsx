'use client';

/**
 * ErrorState Organism
 *
 * Shared client-side error-boundary UI. Centralises the Sentry capture (with
 * double-capture guard + path scoping), correlation-ID display, dev debug
 * panel, and recovery actions that were previously duplicated across
 * global-error, tools/error, and blog/[slug]/error.
 *
 * Renders the same Ledger layout as {@link StatusPage} so error pages match
 * the 404/offline pages visually.
 *
 * @module components/organisms/ErrorState
 */

import * as Sentry from '@sentry/nextjs';
import { ChevronDown, Home, RotateCcw, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { StatusPage } from '@/components/molecules/StatusPage';
import { Button } from '@/components/ui/button';
import { isSentryMonitoredPath } from '@/lib/sentryScope';

export interface ErrorStateProps {
  /** The error caught by the boundary */
  error: Error & { digest?: string };
  /** Boundary-provided reset callback */
  reset: () => void;
  /** Tag identifying which boundary caught the error (e.g. 'global', 'tools', 'blog') */
  boundary: string;
  /** Heading (defaults to a generic message) */
  title?: string;
  /** Supporting copy (defaults to a generic message) */
  description?: string;
}

export function ErrorState({
  error,
  reset,
  boundary,
  title = 'Something went wrong',
  description = "We hit an unexpected snag. Our team has been notified and we're looking into it.",
}: ErrorStateProps) {
  const [sentryEventId, setSentryEventId] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const debugPanelId = useId();
  const capturedRef = useRef<string | null>(null);

  // Best correlation ID: digest (from Next.js) > Sentry event ID > unknown.
  const displayId = error.digest || sentryEventId || 'unknown';

  useEffect(() => {
    // Prevent double-capture (React strict mode, re-renders, retry attempts).
    const errorKey = `${error.digest ?? ''}:${error.message}`;
    if (capturedRef.current === errorKey) return;
    capturedRef.current = errorKey;
    if (!isSentryMonitoredPath(window.location.pathname)) return;

    const eventId = Sentry.captureException(error, {
      tags: { error_boundary: boundary },
      contexts: { error_details: { digest: error.digest } },
    });
    setSentryEventId(eventId);
  }, [error, boundary]);

  return (
    <StatusPage
      icon={TriangleAlert}
      tone='destructive'
      title={title}
      description={description}
      actions={
        <>
          <Button
            type='button'
            onClick={() => reset()}
            size='touch'
            variant='outline'
            className='rounded-sm px-6'
          >
            <RotateCcw className='size-4' aria-hidden='true' />
            Try again
          </Button>
          <Button asChild size='touch' className='rounded-sm px-6'>
            <Link href='/'>
              <Home className='size-4' aria-hidden='true' />
              Go home
            </Link>
          </Button>
        </>
      }
      footer={
        <span className='font-mono text-muted-foreground/70 text-xs'>
          Error ID: {displayId.length > 12 ? displayId.slice(-12) : displayId}
        </span>
      }
    >
      {/* Dev-only debug panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className='text-center'>
          <button
            type='button'
            onClick={() => setShowDebug(!showDebug)}
            aria-expanded={showDebug}
            aria-controls={debugPanelId}
            className='inline-flex items-center gap-1 text-sm text-warning/80 transition-colors hover:text-warning'
          >
            <ChevronDown
              className={`size-4 transition-transform ${showDebug ? 'rotate-180' : ''}`}
              aria-hidden='true'
            />
            Debug info
          </button>
          {showDebug && (
            <div
              id={debugPanelId}
              className='mt-3 rounded-sm border border-warning/20 bg-warning/5 p-4 text-left'
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
    </StatusPage>
  );
}

ErrorState.displayName = 'ErrorState';
