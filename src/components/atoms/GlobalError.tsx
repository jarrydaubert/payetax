// src/components/atoms/GlobalError.tsx
'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to console in development
    console.error('Global error caught:', error);

    // Send error to API for email notification
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
    }).catch((err) => {
      console.error('Failed to send error log:', err);
    });
  }, [error]);

  return (
    <html lang='en'>
      <body className='bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'>
        <div className='flex min-h-screen items-center justify-center px-4'>
          <div className='w-full max-w-md'>
            <div className='glass-card text-center'>
              <div className='mb-6 flex items-center justify-center'>
                <div className='rounded-full bg-red-500/20 p-4'>
                  <AlertTriangle className='size-12 text-red-400' />
                </div>
              </div>

              <h1 className='mb-4 font-bold text-2xl text-white'>Something Went Wrong</h1>

              <p className='mb-6 text-gray-300 text-sm leading-relaxed'>
                We've encountered an unexpected error. Our team has been notified and will
                investigate the issue.
              </p>

              {process.env.NODE_ENV === 'development' && (
                <div className='mb-6 rounded-lg bg-red-500/10 p-4 text-left'>
                  <p className='mb-2 font-semibold text-red-400 text-xs'>Development Error:</p>
                  <pre className='overflow-x-auto text-red-300 text-xs'>{error.message}</pre>
                </div>
              )}

              <div className='space-y-3'>
                <Button onClick={reset} className='w-full' variant='default'>
                  Try Again
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = '/';
                  }}
                  className='w-full'
                  variant='outline'
                >
                  Return to Calculator
                </Button>
              </div>

              <p className='mt-6 text-gray-400 text-xs'>Error ID: {error.digest || 'Unknown'}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
