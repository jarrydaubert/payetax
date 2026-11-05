import * as Sentry from '@sentry/nextjs';
import {
  SENTRY_DATA_COLLECTION,
  sanitizeSentryBreadcrumb,
  sanitizeSentryEvent,
} from '@/lib/sentryPrivacy';
import { shouldDropSentryEventForUnmonitoredPath } from '@/lib/sentryScope';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment-specific configuration
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,

  dataCollection: SENTRY_DATA_COLLECTION,
  attachStacktrace: false,
  tracesSampleRate: 0,

  integrations: (defaults) => [
    ...defaults.filter(
      (integration) => !['ProcessSession', 'Http', 'Http.Server'].includes(integration.name),
    ),
    Sentry.httpIntegration({ sessions: false, spans: false, disableIncomingRequestSpans: true }),
  ],

  // Disable debug mode (too verbose in console)
  debug: false,

  // Server-specific ignored errors
  ignoreErrors: [
    // Next.js client disconnects
    'ECONNRESET',
    'EPIPE',
    'ECANCELED',
    // Client navigation cancellations
    /^(?:Error: )?(?:aborted|Request aborted)$/,
    // Common transient errors
    'getaddrinfo ENOTFOUND',
    'ETIMEDOUT',
    'ECONNREFUSED',
  ],

  beforeSend(event, _hint) {
    // Named platform/Next.js cancellations are expected, unlike application
    // failures whose messages merely contain "aborted".
    const primaryException = event.exception?.values?.at(-1);
    if (['AbortError', 'ResponseAborted'].includes(primaryException?.type ?? '')) {
      return null;
    }

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
