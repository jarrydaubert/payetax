'use client';

// Sentry removed as requested
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';

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
    // Log error for debugging (Sentry removed)
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Generate a simple error ID for tracking
    const eventId = Date.now().toString(36) + Math.random().toString(36).substr(2);
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
      {/* Animated background */}
      <div className='absolute inset-0 bg-gradient-to-br from-slate-900 via-red-900 to-slate-900'>
        <div className='absolute inset-0'>
          {/* Floating error particles */}
          {particles.map((particle) => (
            <div
              key={`error-particle-${particle.id}`}
              className='absolute size-2 animate-pulse rounded-full bg-red-400 opacity-20'
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

      {/* Main content */}
      <div className='relative z-10 mx-4 w-full max-w-4xl'>
        <div className='glass-card border border-red-400/20 p-8 text-center md:p-12'>
          {/* Error icon with animation */}
          <div className='relative mb-8 inline-block'>
            <div className='mb-4 inline-flex size-20 items-center justify-center rounded-full border border-red-400/30 bg-red-500/20'>
              <AlertTriangle className='size-10 animate-pulse text-red-400' />
            </div>
            <div className='absolute inset-0 animate-ping rounded-full border-2 border-red-400/20' />
          </div>

          <h1 className='mb-6 font-bold text-3xl text-foreground md:text-4xl'>
            Oops! Something Went Wrong
          </h1>

          <p className='mx-auto mb-8 max-w-2xl text-muted-foreground text-xl leading-relaxed'>
            Don't worry - even the best tax calculators have their off days! We've automatically
            logged this error and our team will investigate.
          </p>

          {/* What happened section */}
          <div className='glass-card mb-8 border border-yellow-400/20 bg-yellow-500/5 p-6'>
            <h3 className='mb-3 font-semibold text-lg text-yellow-500'>What can you do?</h3>
            <ul className='mx-auto max-w-md space-y-2 text-left text-muted-foreground'>
              <li>• Try refreshing the page or clicking "Try Again"</li>
              <li>• Clear your browser cache and cookies</li>
              <li>• Try using a different browser</li>
              <li>• Contact us if the problem persists</li>
            </ul>
          </div>

          {eventId && (
            <div className='mx-auto mb-8 max-w-md rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-white/70'>
              <strong className='text-white'>Error Reference:</strong>
              <br />
              <code className='break-all font-mono text-purple-300 text-xs'>{eventId}</code>
              <p className='mt-2 text-white/50 text-xs'>Share this ID when reporting the issue</p>
            </div>
          )}

          {/* Action buttons */}
          <div className='mb-8 flex flex-col justify-center gap-4 sm:flex-row'>
            <Button
              type='button'
              onClick={resetError}
              size='lg'
              className='bg-blue-600 hover:bg-blue-700'
            >
              <RefreshCw className='mr-2 size-5' />
              Try Again
            </Button>

            <Button asChild variant='outline' size='lg'>
              <Link href='/'>
                <Home className='mr-2 size-5' />
                Go Home
              </Link>
            </Button>

            <Button asChild size='lg' className='bg-purple-600 hover:bg-purple-700'>
              <a href='mailto:support@payetax.co.uk?subject=Error Report'>
                <AlertTriangle className='mr-2 size-5' />
                Report Issue
              </a>
            </Button>
          </div>

          {/* Help text */}
          <p className='mb-6 text-muted-foreground text-sm'>
            This error has been automatically logged with reference{' '}
            {eventId ? `#${eventId.slice(-8)}` : 'N/A'}
          </p>

          {/* Development mode error details */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className='mx-auto max-w-4xl text-left'>
              <summary className='mb-4 cursor-pointer font-semibold text-lg text-yellow-300 transition-colors hover:text-yellow-200'>
                🔧 Developer Debug Info (Dev Mode Only)
              </summary>
              <div className='glass-card border border-yellow-400/30 bg-yellow-500/5 p-4'>
                <h4 className='mb-2 font-semibold text-yellow-300'>Error Message:</h4>
                <p className='mb-4 font-mono text-red-300 text-sm'>{error.message}</p>

                <h4 className='mb-2 font-semibold text-yellow-300'>Stack Trace:</h4>
                <pre className='max-h-64 overflow-auto whitespace-pre-wrap rounded border border-red-400/20 bg-black/40 p-4 font-mono text-red-300 text-xs'>
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
