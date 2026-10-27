import * as Sentry from '@sentry/nextjs';
import { sanitizeSentryBreadcrumb, sanitizeSentryEvent } from '@/lib/sentryPrivacy';
import { shouldDropSentryEventForUnmonitoredPath } from '@/lib/sentryScope';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment-specific configuration
  environment: process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',

  enableLogs: false,
  sendDefaultPii: false,
  tracesSampleRate: 0,

  // Do not attach arbitrary properties from caught Error objects.
  integrations: [],

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Edge-specific ignored errors
  ignoreErrors: [
    // Network errors in edge runtime
    'ECONNRESET',
    'ETIMEDOUT',
    'Network request failed',
    'Failed to fetch',
    // Edge runtime specific
    'The edge runtime does not support',
    'Dynamic Code Evaluation',
  ],

  beforeSend(event, _hint) {
    // Don't send errors from development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    if (shouldDropSentryEventForUnmonitoredPath(event)) {
      return null;
    }

    // Add edge runtime context
    event.contexts = {
      ...event.contexts,
      runtime: {
        name: 'Edge Runtime',
        type: 'edge',
        environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
      },
    };

    return sanitizeSentryEvent(event);
  },

  beforeBreadcrumb: sanitizeSentryBreadcrumb,
});
