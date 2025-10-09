'use client';

import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/ui/PageContainer';

export default function SentryTestPage() {
  return (
    <PageContainer className="py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Sentry Error Monitoring Test</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Test Sentry integration by triggering different types of errors.
          Check your Sentry dashboard after clicking these buttons.
        </p>

        <div className="space-y-4">
          {/* Test 1: Thrown Error */}
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">1. Thrown Error</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Throws an unhandled error that will be caught by Sentry's global error handler.
            </p>
            <Button
              onClick={() => {
                throw new Error('Test Error: Sentry is working! (Thrown Error)');
              }}
              variant="destructive"
            >
              Throw Test Error
            </Button>
          </div>

          {/* Test 2: Manual Capture */}
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">2. Manual Error Capture</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Manually captures an exception with additional context and tags.
            </p>
            <Button
              onClick={() => {
                Sentry.captureException(new Error('Test Exception: Manual capture with context'), {
                  tags: {
                    test_type: 'manual_capture',
                    feature: 'sentry_test'
                  },
                  contexts: {
                    test_context: {
                      user_action: 'clicked_manual_capture_button',
                      timestamp: new Date().toISOString(),
                      page: 'sentry-test'
                    }
                  },
                  level: 'error'
                });
                alert('Exception sent to Sentry! Check your dashboard.');
              }}
              variant="default"
            >
              Send Manual Exception
            </Button>
          </div>

          {/* Test 3: Message Capture */}
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">3. Message Capture</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Sends an informational message (not an error) to Sentry.
            </p>
            <Button
              onClick={() => {
                Sentry.captureMessage('Test Message: Sentry message capture working', 'info');
                alert('Message sent to Sentry! Check your dashboard.');
              }}
              variant="secondary"
            >
              Send Test Message
            </Button>
          </div>

          {/* Test 4: API Error Simulation */}
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">4. API Error Simulation</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Simulates an API error with network context.
            </p>
            <Button
              onClick={() => {
                const error = new Error('API Request Failed: 500 Internal Server Error');
                Sentry.captureException(error, {
                  tags: {
                    api_endpoint: '/api/test',
                    http_status: '500',
                    error_type: 'api_error'
                  },
                  contexts: {
                    api_context: {
                      url: '/api/test',
                      method: 'POST',
                      status_code: 500,
                      response_time_ms: 1234
                    }
                  }
                });
                alert('API error sent to Sentry! Check your dashboard.');
              }}
              variant="outline"
            >
              Simulate API Error
            </Button>
          </div>

          {/* Test 5: Calculator Error Simulation */}
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">5. Calculator Error Simulation</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Simulates a calculator error with user input context.
            </p>
            <Button
              onClick={() => {
                const error = new Error('Tax Calculation Failed: Invalid tax code');
                Sentry.captureException(error, {
                  tags: {
                    component: 'CalculatorContainer',
                    feature: 'tax_calculation',
                    error_type: 'validation_error'
                  },
                  contexts: {
                    calculator_inputs: {
                      gross_income: 35000,
                      tax_code: 'INVALID',
                      student_loan_plan: 'plan-2',
                      scotland: false
                    },
                    user_context: {
                      session_duration_seconds: 45,
                      calculations_this_session: 3
                    }
                  },
                  level: 'warning'
                });
                alert('Calculator error sent to Sentry! Check your dashboard.');
              }}
              variant="outline"
            >
              Simulate Calculator Error
            </Button>
          </div>

          {/* Test 6: Breadcrumbs */}
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">6. Breadcrumbs Test</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Adds breadcrumbs before triggering an error to show user journey.
            </p>
            <Button
              onClick={() => {
                // Add some breadcrumbs
                Sentry.addBreadcrumb({
                  category: 'user_action',
                  message: 'User clicked breadcrumb test button',
                  level: 'info'
                });

                Sentry.addBreadcrumb({
                  category: 'calculator',
                  message: 'User entered gross income: £35,000',
                  level: 'info',
                  data: { gross_income: 35000 }
                });

                Sentry.addBreadcrumb({
                  category: 'calculator',
                  message: 'User changed tax code to 1257L',
                  level: 'info',
                  data: { tax_code: '1257L' }
                });

                // Now trigger error
                Sentry.captureException(new Error('Test Error: Error with breadcrumbs'), {
                  tags: { test_type: 'breadcrumbs' }
                });

                alert('Error with breadcrumbs sent! Check Sentry to see the user journey.');
              }}
              variant="outline"
            >
              Test Breadcrumbs
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold mb-2">📋 Verification Steps</h3>
          <ol className="text-sm space-y-2 list-decimal list-inside">
            <li>Make sure you've added <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">NEXT_PUBLIC_SENTRY_DSN</code> to your <code>.env.local</code></li>
            <li>Click any test button above</li>
            <li>Visit your Sentry dashboard: <a href="https://sentry.io/organizations/payetax/issues/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://sentry.io/organizations/payetax/issues/</a></li>
            <li>You should see the error appear within 10-30 seconds</li>
            <li>Click the error to see details, stack trace, tags, and context</li>
          </ol>
        </div>

        {/* Source Maps Check */}
        <div className="mt-4 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <h3 className="font-semibold mb-2">🗺️ Source Maps (Production Only)</h3>
          <p className="text-sm">
            To verify source maps are working in production:
          </p>
          <ol className="text-sm space-y-2 list-decimal list-inside mt-2">
            <li>Add <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">SENTRY_AUTH_TOKEN</code> to Vercel environment variables</li>
            <li>Deploy to production</li>
            <li>Trigger an error on the production site</li>
            <li>Check Sentry - stack traces should show TypeScript filenames (not minified <code>_app-[hash].js</code>)</li>
          </ol>
        </div>

        {/* Environment Info */}
        <div className="mt-4 p-6 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <h3 className="font-semibold mb-2">🔧 Environment Info</h3>
          <dl className="text-sm space-y-1">
            <dt className="font-medium">Sentry DSN Configured:</dt>
            <dd className="text-muted-foreground ml-4">
              {process.env.NEXT_PUBLIC_SENTRY_DSN ? '✅ Yes' : '❌ No (add to .env.local)'}
            </dd>
            <dt className="font-medium mt-2">Environment:</dt>
            <dd className="text-muted-foreground ml-4">{process.env.NODE_ENV}</dd>
          </dl>
        </div>
      </div>
    </PageContainer>
  );
}
