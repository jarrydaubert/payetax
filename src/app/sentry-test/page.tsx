'use client';

import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/ui/PageContainer';

export default function SentryTestPage() {
  return (
    <PageContainer className='py-16'>
      <div className='mx-auto max-w-2xl'>
        <h1 className='mb-4 font-bold text-4xl'>Sentry Error Monitoring Test</h1>
        <p className='mb-8 text-lg text-muted-foreground'>
          Test Sentry integration by triggering different types of errors. Check your Sentry
          dashboard after clicking these buttons.
        </p>

        <div className='space-y-4'>
          {/* Test 1: Thrown Error */}
          <div className='rounded-lg border p-4'>
            <h2 className='mb-2 font-semibold'>1. Thrown Error</h2>
            <p className='mb-3 text-muted-foreground text-sm'>
              Throws an unhandled error that will be caught by Sentry's global error handler.
            </p>
            <Button
              onClick={() => {
                throw new Error('Test Error: Sentry is working! (Thrown Error)');
              }}
              variant='destructive'
            >
              Throw Test Error
            </Button>
          </div>

          {/* Test 2: Manual Capture */}
          <div className='rounded-lg border p-4'>
            <h2 className='mb-2 font-semibold'>2. Manual Error Capture</h2>
            <p className='mb-3 text-muted-foreground text-sm'>
              Manually captures an exception with additional context and tags.
            </p>
            <Button
              onClick={() => {
                Sentry.captureException(new Error('Test Exception: Manual capture with context'), {
                  tags: {
                    test_type: 'manual_capture',
                    feature: 'sentry_test',
                  },
                  contexts: {
                    test_context: {
                      user_action: 'clicked_manual_capture_button',
                      timestamp: new Date().toISOString(),
                      page: 'sentry-test',
                    },
                  },
                  level: 'error',
                });
                alert('Exception sent to Sentry! Check your dashboard.');
              }}
              variant='default'
            >
              Send Manual Exception
            </Button>
          </div>

          {/* Test 3: Message Capture */}
          <div className='rounded-lg border p-4'>
            <h2 className='mb-2 font-semibold'>3. Message Capture</h2>
            <p className='mb-3 text-muted-foreground text-sm'>
              Sends an informational message (not an error) to Sentry.
            </p>
            <Button
              onClick={() => {
                Sentry.captureMessage('Test Message: Sentry message capture working', 'info');
                alert('Message sent to Sentry! Check your dashboard.');
              }}
              variant='secondary'
            >
              Send Test Message
            </Button>
          </div>

          {/* Test 4: API Error Simulation */}
          <div className='rounded-lg border p-4'>
            <h2 className='mb-2 font-semibold'>4. API Error Simulation</h2>
            <p className='mb-3 text-muted-foreground text-sm'>
              Simulates an API error with network context.
            </p>
            <Button
              onClick={() => {
                const error = new Error('API Request Failed: 500 Internal Server Error');
                Sentry.captureException(error, {
                  tags: {
                    api_endpoint: '/api/test',
                    http_status: '500',
                    error_type: 'api_error',
                  },
                  contexts: {
                    api_context: {
                      url: '/api/test',
                      method: 'POST',
                      status_code: 500,
                      response_time_ms: 1234,
                    },
                  },
                });
                alert('API error sent to Sentry! Check your dashboard.');
              }}
              variant='outline'
            >
              Simulate API Error
            </Button>
          </div>

          {/* Test 5: Calculator Error Simulation */}
          <div className='rounded-lg border p-4'>
            <h2 className='mb-2 font-semibold'>5. Calculator Error Simulation</h2>
            <p className='mb-3 text-muted-foreground text-sm'>
              Simulates a calculator error with user input context.
            </p>
            <Button
              onClick={() => {
                const error = new Error('Tax Calculation Failed: Invalid tax code');
                Sentry.captureException(error, {
                  tags: {
                    component: 'CalculatorContainer',
                    feature: 'tax_calculation',
                    error_type: 'validation_error',
                  },
                  contexts: {
                    calculator_inputs: {
                      gross_income: 35000,
                      tax_code: 'INVALID',
                      student_loan_plan: 'plan-2',
                      scotland: false,
                    },
                    user_context: {
                      session_duration_seconds: 45,
                      calculations_this_session: 3,
                    },
                  },
                  level: 'warning',
                });
                alert('Calculator error sent to Sentry! Check your dashboard.');
              }}
              variant='outline'
            >
              Simulate Calculator Error
            </Button>
          </div>

          {/* Test 6: Breadcrumbs */}
          <div className='rounded-lg border p-4'>
            <h2 className='mb-2 font-semibold'>6. Breadcrumbs Test</h2>
            <p className='mb-3 text-muted-foreground text-sm'>
              Adds breadcrumbs before triggering an error to show user journey.
            </p>
            <Button
              onClick={() => {
                // Add some breadcrumbs
                Sentry.addBreadcrumb({
                  category: 'user_action',
                  message: 'User clicked breadcrumb test button',
                  level: 'info',
                });

                Sentry.addBreadcrumb({
                  category: 'calculator',
                  message: 'User entered gross income: £35,000',
                  level: 'info',
                  data: { gross_income: 35000 },
                });

                Sentry.addBreadcrumb({
                  category: 'calculator',
                  message: 'User changed tax code to 1257L',
                  level: 'info',
                  data: { tax_code: '1257L' },
                });

                // Now trigger error
                Sentry.captureException(new Error('Test Error: Error with breadcrumbs'), {
                  tags: { test_type: 'breadcrumbs' },
                });

                alert('Error with breadcrumbs sent! Check Sentry to see the user journey.');
              }}
              variant='outline'
            >
              Test Breadcrumbs
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className='mt-8 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20'>
          <h3 className='mb-2 font-semibold'>📋 Verification Steps</h3>
          <ol className='list-inside list-decimal space-y-2 text-sm'>
            <li>
              Make sure you've added{' '}
              <code className='rounded bg-slate-200 px-1 py-0.5 dark:bg-slate-800'>
                NEXT_PUBLIC_SENTRY_DSN
              </code>{' '}
              to your <code>.env.local</code>
            </li>
            <li>Click any test button above</li>
            <li>
              Visit your Sentry dashboard:{' '}
              <a
                href='https://sentry.io/organizations/payetax/issues/'
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:underline'
              >
                https://sentry.io/organizations/payetax/issues/
              </a>
            </li>
            <li>You should see the error appear within 10-30 seconds</li>
            <li>Click the error to see details, stack trace, tags, and context</li>
          </ol>
        </div>

        {/* Source Maps Check */}
        <div className='mt-4 rounded-lg bg-amber-50 p-6 dark:bg-amber-900/20'>
          <h3 className='mb-2 font-semibold'>🗺️ Source Maps (Production Only)</h3>
          <p className='text-sm'>To verify source maps are working in production:</p>
          <ol className='mt-2 list-inside list-decimal space-y-2 text-sm'>
            <li>
              Add{' '}
              <code className='rounded bg-slate-200 px-1 py-0.5 dark:bg-slate-800'>
                SENTRY_AUTH_TOKEN
              </code>{' '}
              to Vercel environment variables
            </li>
            <li>Deploy to production</li>
            <li>Trigger an error on the production site</li>
            <li>
              Check Sentry - stack traces should show TypeScript filenames (not minified{' '}
              <code>_app-[hash].js</code>)
            </li>
          </ol>
        </div>

        {/* Environment Info */}
        <div className='mt-4 rounded-lg bg-slate-100 p-6 dark:bg-slate-800'>
          <h3 className='mb-2 font-semibold'>🔧 Environment Info</h3>
          <dl className='space-y-1 text-sm'>
            <dt className='font-medium'>Sentry DSN Configured:</dt>
            <dd className='ml-4 text-muted-foreground'>
              {process.env.NEXT_PUBLIC_SENTRY_DSN ? '✅ Yes' : '❌ No (add to .env.local)'}
            </dd>
            <dt className='mt-2 font-medium'>Environment:</dt>
            <dd className='ml-4 text-muted-foreground'>{process.env.NODE_ENV}</dd>
          </dl>
        </div>
      </div>
    </PageContainer>
  );
}
