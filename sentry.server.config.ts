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

  // Disable debug mode (too verbose in console)
  debug: false,

  // Server-specific ignored errors
  ignoreErrors: [
    // Next.js client disconnects
    'ECONNRESET',
    'EPIPE',
    'ECANCELED',
    // Client navigation cancellations
    'aborted',
    'Request aborted',
    // Common transient errors
    'getaddrinfo ENOTFOUND',
    'ETIMEDOUT',
    'ECONNREFUSED',
  ],

  beforeSend(event, _hint) {
    // Don't send errors from development. Do not depend on Vercel system
    // environment variables here; they may be unavailable when system env
    // exposure is disabled, but production server events should still land.
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    if (shouldDropSentryEventForUnmonitoredPath(event)) {
      return null;
    }

    // Add server environment context
    event.contexts = {
      ...event.contexts,
      runtime: {
        name: 'Node.js',
        version: process.version,
        type: process.env.NEXT_RUNTIME || 'nodejs',
      },
      server_info: {
        platform: process.platform,
        arch: process.arch,
        ...process.memoryUsage(),
        uptime: process.uptime(),
      },
    };

    return sanitizeSentryEvent(event);
  },

  beforeBreadcrumb: sanitizeSentryBreadcrumb,
});
