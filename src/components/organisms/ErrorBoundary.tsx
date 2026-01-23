'use client';

import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';
import { ICON_SIZES, SHADOWS, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

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
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Capture exception in Sentry with additional context
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        error_boundary: 'component',
      },
      level: 'error',
    });

    // Store Sentry event ID for user reference
    this.setState({ eventId });
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
  // Generate stable particle data to avoid infinite re-renders
  const particles = React.useMemo(
    () =>
      [...Array(15)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 4,
      })),
    []
  );

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden'>
      {/* Animated background - dark gradient for both themes */}
      <div className='absolute inset-0 bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 dark:from-slate-950 dark:via-red-950 dark:to-slate-950'>
        <div className='absolute inset-0'>
          {/* Floating error particles */}
          {particles.map((particle) => (
            <div
              key={`error-particle-${particle.id}`}
              className='absolute size-2 animate-pulse rounded-full bg-red-400 opacity-20 dark:bg-red-500 dark:opacity-10'
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content - responsive padding */}
      <div className={cn('relative z-10 w-full max-w-4xl', SPACING.PX_4)}>
        <div
          className={cn(
            'glass-card text-center',
            'border border-red-400/20',
            SPACING.P_6,
            'md:p-12',
            SHADOWS.XXL
          )}
        >
          {/* Error icon with animation */}
          <div className={cn('relative inline-block', SPACING.MB_8)}>
            <div
              className={cn(
                'inline-flex items-center justify-center rounded-full',
                'border border-red-400/30 bg-red-500/20',
                SPACING.MB_4,
                ICON_SIZES.SIZE_12,
                'md:size-20'
              )}
            >
              <AlertTriangle
                className={cn('animate-pulse text-red-400', ICON_SIZES.SIZE_8, 'md:size-10')}
              />
            </div>
            <div className='absolute inset-0 animate-ping rounded-full border-2 border-red-400/20' />
          </div>

          {/* Heading - responsive typography */}
          <h1
            className={cn(
              'font-bold text-foreground',
              TYPOGRAPHY.TEXT_3XL,
              `md:${TYPOGRAPHY.TEXT_4XL}`,
              SPACING.MB_6
            )}
          >
            Oops! Something Went Wrong
          </h1>

          {/* Description - responsive typography */}
          <p
            className={cn(
              'mx-auto max-w-2xl leading-relaxed',
              'text-muted-foreground',
              TYPOGRAPHY.TEXT_LG,
              `md:${TYPOGRAPHY.TEXT_XL}`,
              SPACING.MB_8
            )}
          >
            Don't worry - even the best tax calculators have their off days! We've automatically
            logged this error and our team will investigate.
          </p>

          {/* What happened section */}
          <div
            className={cn(
              'glass-card',
              'border border-yellow-400/20 bg-yellow-500/5',
              SPACING.P_6,
              SPACING.MB_8
            )}
          >
            <h3
              className={cn(
                'font-semibold text-yellow-500 dark:text-yellow-400',
                TYPOGRAPHY.TEXT_LG,
                SPACING.MB_3
              )}
            >
              What can you do?
            </h3>
            <ul
              className={cn(
                'mx-auto max-w-md text-left',
                'text-muted-foreground',
                TYPOGRAPHY.TEXT_SM,
                SPACING.SPACE_Y_2
              )}
            >
              <li>• Try refreshing the page or clicking "Try Again"</li>
              <li>• Clear your browser cache and cookies</li>
              <li>• Try using a different browser</li>
              <li>• Contact us if the problem persists</li>
            </ul>
          </div>

          {/* Event ID display */}
          {eventId && (
            <div
              className={cn(
                'mx-auto max-w-md rounded-lg',
                'border border-white/10 bg-black/20',
                'text-white/70 dark:border-white/5 dark:bg-black/40',
                TYPOGRAPHY.TEXT_SM,
                SPACING.P_4,
                SPACING.MB_8
              )}
            >
              <strong className='text-white dark:text-white/90'>Error Reference:</strong>
              <br />
              <code
                className={cn(
                  'break-all font-mono',
                  'text-purple-300 dark:text-purple-400',
                  TYPOGRAPHY.TEXT_XS
                )}
              >
                {eventId}
              </code>
              <p
                className={cn('text-white/50 dark:text-white/40', TYPOGRAPHY.TEXT_XS, SPACING.MT_2)}
              >
                Share this ID when reporting the issue
              </p>
            </div>
          )}

          {/* Action buttons - responsive layout */}
          <div
            className={cn('flex flex-col justify-center sm:flex-row', SPACING.GAP_4, SPACING.MB_8)}
          >
            <Button
              type='button'
              onClick={resetError}
              size='lg'
              className='bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600'
            >
              <RefreshCw className={cn('mr-2', ICON_SIZES.SIZE_5)} />
              Try Again
            </Button>

            <Button asChild variant='outline' size='lg'>
              <Link href='/'>
                <Home className={cn('mr-2', ICON_SIZES.SIZE_5)} />
                Go Home
              </Link>
            </Button>
          </div>

          {/* Help text */}
          <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM, SPACING.MB_6)}>
            This error has been automatically logged with reference{' '}
            {eventId ? `#${eventId.slice(-8)}` : 'N/A'}
          </p>

          {/* Development mode error details */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className='mx-auto max-w-4xl text-left'>
              <summary
                className={cn(
                  'cursor-pointer font-semibold',
                  'text-yellow-300 dark:text-yellow-400',
                  'transition-colors hover:text-yellow-200 dark:hover:text-yellow-300',
                  TYPOGRAPHY.TEXT_LG,
                  SPACING.MB_4
                )}
              >
                🔧 Developer Debug Info (Dev Mode Only)
              </summary>
              <div
                className={cn(
                  'glass-card',
                  'border border-yellow-400/30 bg-yellow-500/5',
                  SPACING.P_4
                )}
              >
                <h4
                  className={cn('font-semibold text-yellow-300 dark:text-yellow-400', SPACING.MB_2)}
                >
                  Error Message:
                </h4>
                <p
                  className={cn(
                    'font-mono text-red-300 dark:text-red-400',
                    TYPOGRAPHY.TEXT_SM,
                    SPACING.MB_4
                  )}
                >
                  {error.message}
                </p>

                <h4
                  className={cn('font-semibold text-yellow-300 dark:text-yellow-400', SPACING.MB_2)}
                >
                  Stack Trace:
                </h4>
                <pre
                  className={cn(
                    'max-h-64 overflow-auto whitespace-pre-wrap rounded',
                    'border border-red-400/20 bg-black/40 dark:bg-black/60',
                    'font-mono text-red-300 dark:text-red-400',
                    TYPOGRAPHY.TEXT_XS,
                    SPACING.P_4
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
