// src/app/global-error.tsx
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);

  // Auto-report error to Sentry and email
  useEffect(() => {
    // Send to Sentry for monitoring
    Sentry.captureException(error, {
      tags: {
        error_boundary: 'global',
        error_id: errorId
      },
      contexts: {
        error_details: {
          digest: error.digest,
          error_id: errorId
        }
      }
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
      <body style={{ margin: 0, padding: 0 }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0f172a 0%, #991b1b 50%, #0f172a 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Background particles */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {[...Array(10)].map((_, i) => (
              <div
                key={`particle-${i}-${Math.random()}`}
                style={{
                  position: 'absolute',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  opacity: 0.2,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `pulse 2s infinite ${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          <div
            style={{
              position: 'relative',
              zIndex: 10,
              maxWidth: '48rem',
              width: '100%',
              margin: '0 1rem',
              textAlign: 'center',
              padding: '3rem 2rem',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '1rem',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Error icon */}
            <div
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 2rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '2px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width='40'
                height='40'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#ef4444'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                role='img'
                aria-label='Error warning icon'
              >
                <path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' />
                <line x1='12' y1='9' x2='12' y2='13' />
                <line x1='12' y1='17' x2='12.01' y2='17' />
              </svg>
            </div>

            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '1.5rem',
                lineHeight: '1.2',
              }}
            >
              Critical System Error
            </h1>

            <p
              style={{
                fontSize: '1.25rem',
                color: '#d1d5db',
                marginBottom: '2rem',
                lineHeight: '1.6',
                maxWidth: '32rem',
                margin: '0 auto 2rem',
              }}
            >
              A critical error occurred that prevented the application from loading. This has been
              automatically logged for investigation.
            </p>

            {/* Error details */}
            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '2rem',
                maxWidth: '24rem',
                margin: '0 auto 2rem',
              }}
            >
              <strong style={{ color: 'white', fontSize: '0.875rem' }}>Error Reference:</strong>
              <br />
              <code
                style={{
                  color: '#a855f7',
                  fontFamily: 'Monaco, Consolas, monospace',
                  fontSize: '0.75rem',
                  wordBreak: 'break-all',
                }}
              >
                #{errorId}
              </code>
            </div>

            {/* Action buttons */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                alignItems: 'center',
                marginBottom: '2rem',
              }}
            >
              <button
                type='button'
                onClick={() => reset()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 2rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  role='img'
                  aria-label='Refresh page'
                >
                  <polyline points='23 4 23 10 17 10' />
                  <path d='M20.49 15a9 9 0 1 1-2.12-9.36L23 10' />
                </svg>
                Restart Application
              </button>

              <a
                href='/'
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 2rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  role='img'
                  aria-label='Go to home page'
                >
                  <path d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
                  <polyline points='9,22 9,12 15,12 15,22' />
                </svg>
                Go to Homepage
              </a>
            </div>

            {/* Help text */}
            <p
              style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                marginBottom: process.env.NODE_ENV === 'development' ? '1.5rem' : '0',
              }}
            >
              If this error persists, please contact support with reference #{errorId.slice(-8)}
            </p>

            {/* Development details */}
            {process.env.NODE_ENV === 'development' && error && (
              <details
                style={{
                  textAlign: 'left',
                  marginTop: '2rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <summary
                  style={{
                    color: '#facc15',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                    fontWeight: '600',
                  }}
                >
                  🔧 Developer Debug Info (Dev Mode Only)
                </summary>
                <div>
                  <h4 style={{ color: '#facc15', marginBottom: '0.5rem' }}>Error Message:</h4>
                  <p
                    style={{
                      color: '#fca5a5',
                      fontFamily: 'Monaco, Consolas, monospace',
                      fontSize: '0.875rem',
                      marginBottom: '1rem',
                      wordBreak: 'break-word',
                    }}
                  >
                    {error.message}
                  </p>

                  <h4 style={{ color: '#facc15', marginBottom: '0.5rem' }}>Stack Trace:</h4>
                  <pre
                    style={{
                      color: '#fca5a5',
                      fontFamily: 'Monaco, Consolas, monospace',
                      fontSize: '0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      padding: '1rem',
                      borderRadius: '0.25rem',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      overflow: 'auto',
                      maxHeight: '16rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {error.stack}
                  </pre>
                </div>
              </details>
            )}
          </div>

          {/* Add keyframes for pulse animation */}
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 0.2; transform: scale(1); }
              50% { opacity: 0.4; transform: scale(1.1); }
            }
          `}</style>
        </div>
      </body>
    </html>
  );
}
