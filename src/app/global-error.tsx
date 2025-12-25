// src/app/global-error.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ICON_SIZES, LAYOUT, SPACING, SURFACES, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorId = Date.now().toString(36) + Math.random().toString(36).substring(2);

  // Auto-report error to Sentry and email
  useEffect(() => {
    // Send to Sentry for monitoring
    Sentry.captureException(error, {
      tags: {
        error_boundary: 'global',
        error_id: errorId,
      },
      contexts: {
        error_details: {
          digest: error.digest,
          error_id: errorId,
        },
      },
    });

    // Also send email notification
    fetch('/api/error-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  }, [error, errorId]);

  return (
    <html lang='en'>
      <body className='m-0 p-0'>
        <div className={cn(LAYOUT.PAGE_WRAPPER, 'relative min-h-screen overflow-hidden')}>
          {/* Animated background particles */}
          <div className='pointer-events-none fixed inset-0 -z-10'>
            <div className='absolute inset-0 bg-gradient-to-br from-background via-destructive/5 to-background'>
              {Array.from({ length: 20 }, (_, i) => {
                const left = (i * 137.5) % 100;
                const top = (i * 37.5) % 100;
                const delay = (i * 0.15) % 3;
                const duration = 2 + (i % 4);
                return (
                  <div
                    key={`particle-${left}-${top}`}
                    className='absolute h-2 w-2 animate-pulse rounded-full bg-destructive opacity-20'
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      animationDelay: `${delay}s`,
                      animationDuration: `${duration}s`,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Error Content */}
          <section className={cn(LAYOUT.SECTION, LAYOUT.TEXT_CENTER)}>
            <div className={LAYOUT.CONTAINER_SM}>
              {/* Error Icon */}
              <div className={SPACING.MB_6}>
                <div className='relative mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full border-2 border-destructive/30 bg-destructive/20'>
                  <AlertTriangle
                    className={cn('text-destructive', ICON_SIZES.SIZE_10)}
                    aria-label='Critical error icon'
                  />
                  <div className='absolute inset-0 -z-10 animate-ping rounded-full border-2 border-destructive opacity-20' />
                </div>
              </div>

              {/* Error Title */}
              <div className={SPACING.MB_6}>
                <h1 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_4XL, SPACING.MB_4)}>
                  Critical System Error
                </h1>
                <p
                  className={cn(
                    'text-muted-foreground',
                    TYPOGRAPHY.TEXT_LG,
                    LAYOUT.CENTERED_CONTENT
                  )}
                >
                  A critical error occurred that prevented the application from loading. This has
                  been automatically logged for investigation.
                </p>
              </div>

              {/* Error Reference Card */}
              <Card
                className={cn(
                  SURFACES.CARD_LARGE,
                  'mx-auto max-w-md border-destructive/20',
                  SPACING.MB_8
                )}
              >
                <Badge variant='destructive' className={SPACING.MB_2}>
                  Error Reference
                </Badge>
                <code className='font-mono text-primary text-sm'>#{errorId}</code>
              </Card>

              {/* Action Buttons */}
              <div
                className={cn(
                  'flex flex-col items-center gap-4',
                  SPACING.MB_8,
                  'sm:flex-row sm:justify-center'
                )}
              >
                <button
                  type='button'
                  onClick={() => reset()}
                  className={cn(
                    'group inline-flex items-center gap-2 rounded-xl px-8 py-3',
                    'bg-primary font-semibold text-primary-foreground',
                    'transition-all duration-300',
                    'hover:scale-105 hover:bg-primary/90',
                    'active:scale-100',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                  )}
                >
                  <RefreshCcw
                    className={cn(
                      ICON_SIZES.SIZE_5,
                      'transition-transform duration-500 group-hover:rotate-180'
                    )}
                    aria-hidden='true'
                  />
                  Restart Application
                </button>

                <a
                  href='/'
                  className={cn(
                    'group inline-flex items-center gap-2 rounded-xl px-8 py-3',
                    'border border-border bg-background/50 font-semibold text-foreground',
                    'transition-all duration-300',
                    'hover:scale-105 hover:bg-accent',
                    'active:scale-100',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                  )}
                >
                  <Home
                    className={cn(ICON_SIZES.SIZE_5, 'transition-transform group-hover:scale-110')}
                    aria-hidden='true'
                  />
                  Go to Homepage
                </a>
              </div>

              {/* Help Text */}
              <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM, SPACING.MB_6)}>
                If this error persists, please contact support with reference{' '}
                <span className='font-mono text-primary'>#{errorId.slice(-8)}</span>
              </p>

              {/* Development Debug Info */}
              {process.env.NODE_ENV === 'development' && error && (
                <Card
                  className={cn(
                    SURFACES.CARD_LARGE,
                    'border-yellow-500/30 bg-yellow-500/5',
                    'text-left'
                  )}
                >
                  <details>
                    <summary className='mb-4 cursor-pointer font-semibold text-yellow-500 transition-colors hover:text-yellow-400'>
                      🔧 Developer Debug Info (Dev Mode Only)
                    </summary>

                    <div className='space-y-4'>
                      {/* Error Message */}
                      <div>
                        <h4 className='mb-2 font-semibold text-sm text-yellow-500'>
                          Error Message:
                        </h4>
                        <p className='break-words rounded-lg border border-destructive/20 bg-background/50 p-3 font-mono text-destructive text-sm'>
                          {error.message}
                        </p>
                      </div>

                      {/* Stack Trace */}
                      <div>
                        <h4 className='mb-2 font-semibold text-sm text-yellow-500'>Stack Trace:</h4>
                        <pre className='max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-destructive/20 bg-background/50 p-4 font-mono text-destructive text-xs'>
                          {error.stack}
                        </pre>
                      </div>
                    </div>
                  </details>
                </Card>
              )}
            </div>
          </section>
        </div>
      </body>
    </html>
  );
}
