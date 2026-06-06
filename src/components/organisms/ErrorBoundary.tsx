'use client';

import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, Copy, Home, RefreshCw, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Known benign errors that shouldn't be reported to Sentry */
const BENIGN_ERROR_PATTERNS = [
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications',
  'Loading chunk', // Dynamic import failures (usually network issues)
  'ChunkLoadError',
] as const;

/** Check if error should be filtered out */
function isBenignError(error: Error | null): boolean {
  if (!error?.message) return false;
  return BENIGN_ERROR_PATTERNS.some((pattern) => error.message.includes(pattern));
}

/**
 * Show debug info only when explicitly enabled via env var
 * NODE_ENV alone is unreliable in client bundles (always 'production' in deployed builds)
 */
const SHOW_DEBUG =
  process.env.NEXT_PUBLIC_SHOW_DEBUG_ERRORS === 'true' && process.env.NODE_ENV === 'development';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorInfo>;
}

interface State {
  hasError: boolean;
  eventId: string | null;
  error: Error | null;
}

interface ErrorInfo {
  error: Error | null;
  eventId: string | null;
  resetError: () => void;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      eventId: null,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      eventId: null,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Filter out known benign errors (ResizeObserver, chunk loading, etc.)
    if (isBenignError(error)) {
      // Reset immediately for transient errors
      this.resetError();
      return;
    }

    // Only log in development to avoid third-party log collector noise
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Capture exception in Sentry with scoped context
    Sentry.withScope((scope) => {
      scope.setTag('error_boundary', 'component');
      scope.setContext('react', {
        componentStack: errorInfo.componentStack,
      });
      scope.setLevel('error');

      const eventId = Sentry.captureException(error);
      this.setState({ eventId });
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      eventId: null,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          eventId={this.state.eventId}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, eventId, resetError }: ErrorInfo) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const copyTimeoutRef = React.useRef<number | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Focus heading on mount for keyboard accessibility
  React.useEffect(() => {
    headingRef.current?.focus();
  }, []);

  React.useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleCopyEventId = () => {
    if (eventId) {
      navigator.clipboard.writeText(eventId).then(() => {
        setCopied(true);
        if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleHardRefresh = () => {
    window.location.reload();
  };

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-background'>
      {/* Main content - responsive padding */}
      <div className={cn('relative z-10 w-full max-w-4xl', 'px-4')}>
        <div
          className={cn(
            'rounded-sm border border-destructive/30 bg-card text-center',
            'p-6',
            'md:p-12',
          )}
        >
          {/* Error icon */}
          <div className={cn('relative inline-block', 'mb-8')}>
            <div
              className={cn(
                'inline-flex items-center justify-center rounded-full',
                'border border-destructive/30 bg-destructive/20',
                'mb-4',
                'size-12',
                'md:size-20',
              )}
            >
              <AlertTriangle
                className={cn('text-destructive', 'size-8', 'md:size-10')}
                aria-hidden='true'
              />
            </div>
          </div>

          {/* Heading - responsive typography, focusable for a11y */}
          <h1
            ref={headingRef}
            tabIndex={-1}
            className={cn(
              'font-bold text-foreground outline-none',
              'text-3xl',
              // Use literal string - dynamic template breaks Tailwind extraction
              'md:text-4xl',
              'mb-6',
            )}
          >
            Oops! Something Went Wrong
          </h1>

          {/* Description - responsive typography */}
          <p
            className={cn(
              'mx-auto max-w-2xl leading-relaxed',
              'text-muted-foreground',
              'text-lg',
              // Use literal string - dynamic template breaks Tailwind extraction
              'md:text-xl',
              'mb-8',
            )}
          >
            Don't worry - even the best tax calculators have their off days! We've automatically
            logged this error and our team will investigate.
          </p>

          {/* What happened section */}
          <div className={cn('rounded-sm border border-warning/30 bg-warning/5', 'p-6', 'mb-8')}>
            <h3 className={cn('font-semibold text-warning', 'text-lg', 'mb-3')}>
              What can you do?
            </h3>
            <ul
              className={cn(
                'mx-auto max-w-md text-left',
                'text-muted-foreground',
                'text-sm',
                'space-y-2',
              )}
            >
              <li>• Try refreshing the page or clicking "Try Again"</li>
              <li>• Clear your browser cache and cookies</li>
              <li>• Try using a different browser</li>
              <li>• Contact us if the problem persists</li>
            </ul>
          </div>

          {/* Event ID display with copy button */}
          {eventId && (
            <div
              className={cn(
                'mx-auto max-w-md rounded-lg',
                'border border-border/60 bg-card/80',
                'text-muted-foreground',
                'text-sm',
                'p-4',
                'mb-8',
              )}
            >
              <div className={cn('flex items-center justify-between', 'mb-2')}>
                <strong className='text-foreground'>Error Reference:</strong>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleCopyEventId}
                  className='h-7 gap-1 text-muted-foreground hover:text-foreground'
                  aria-label='Copy error reference to clipboard'
                >
                  <Copy className={'size-4'} />
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>
              <code className={cn('block break-all font-mono', 'text-primary', 'text-xs')}>
                {eventId}
              </code>
              <p className={cn('text-muted-foreground', 'text-xs', 'mt-2')}>
                Share this ID when reporting the issue
              </p>
            </div>
          )}

          {/* Action buttons - responsive layout */}
          <div
            className={cn('flex flex-col justify-center sm:flex-row sm:flex-wrap', 'gap-4', 'mb-8')}
          >
            <Button
              type='button'
              onClick={resetError}
              size='lg'
              className='bg-primary text-primary-foreground hover:bg-primary/90'
            >
              <RefreshCw className={cn('mr-2', 'size-5')} aria-hidden='true' />
              Try Again
            </Button>

            <Button type='button' onClick={handleHardRefresh} variant='outline' size='lg'>
              <RotateCcw className={cn('mr-2', 'size-5')} aria-hidden='true' />
              Refresh Page
            </Button>

            <Button asChild variant='outline' size='lg'>
              <Link href='/'>
                <Home className={cn('mr-2', 'size-5')} aria-hidden='true' />
                Go Home
              </Link>
            </Button>
          </div>

          {/* Help text */}
          <p className={cn('text-muted-foreground', 'text-sm', 'mb-6')}>
            This error has been automatically logged with reference{' '}
            {eventId ? `#${eventId.slice(-8)}` : 'N/A'}
          </p>

          {/* Development mode error details - only when explicitly enabled */}
          {SHOW_DEBUG && error && (
            <details className='mx-auto max-w-4xl text-left'>
              <summary
                className={cn(
                  'cursor-pointer font-semibold',
                  'text-warning transition-colors hover:text-warning/90',
                  'text-lg',
                  'mb-4',
                )}
              >
                🔧 Developer Debug Info (Dev Mode Only)
              </summary>
              <div className={cn('rounded-sm border border-warning/30 bg-warning/5', 'p-4')}>
                <h4 className={cn('font-semibold text-warning', 'mb-2')}>Error Message:</h4>
                <p className={cn('font-mono text-destructive', 'text-sm', 'mb-4')}>
                  {error.message}
                </p>

                <h4 className={cn('font-semibold text-warning', 'mb-2')}>Stack Trace:</h4>
                <pre
                  className={cn(
                    'max-h-64 overflow-auto whitespace-pre-wrap rounded',
                    'border border-destructive/20 bg-card/90',
                    'font-mono text-destructive',
                    'text-xs',
                    'p-4',
                  )}
                >
                  {error.stack}
                </pre>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
