import * as Sentry from '@sentry/nextjs';
import { shouldDropSentryEventForUnmonitoredPath } from '@/lib/sentryScope';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment-specific configuration
  environment: process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',

  enableLogs: false,
  tracesSampleRate: 0,

  // Server-specific integrations
  integrations: [
    Sentry.extraErrorDataIntegration({
      depth: 10, // Capture nested objects up to 10 levels
    }),
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
        memory_usage: process.memoryUsage(),
        uptime: process.uptime(),
      },
    };

    // Remove query strings with potential PII
    if (event.request?.url) {
      try {
        const url = new URL(event.request.url);
        event.request.url = url.origin + url.pathname;
      } catch {
        // Invalid URL, keep as is
      }
    }

    // Scrub request data that might contain PII
    if (event.request?.data) {
      const data = event.request.data;
      if (typeof data === 'object' && data !== null) {
        const sanitized = { ...data } as Record<string, unknown>;
        const sensitiveFields = [
          'email',
          'name',
          'phone',
          'address',
          'postcode',
          'password',
          'token',
          'secret',
          'apiKey',
          'authorization',
          'nationalInsuranceNumber',
          'taxCode',
          'salary',
          'pensionContribution',
        ];
        for (const field of sensitiveFields) {
          if (field in sanitized) {
            sanitized[field] = '[Filtered]';
          }
        }
        event.request.data = sanitized;
      }
    }

    // Scrub context data that might contain PII
    if (event.contexts) {
      const sensitiveFields = [
        'email',
        'name',
        'phone',
        'address',
        'postcode',
        'password',
        'token',
        'secret',
        'apiKey',
        'authorization',
        'nationalInsuranceNumber',
        'taxCode',
        'salary',
        'pensionContribution',
      ];

      for (const [key, value] of Object.entries(event.contexts)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const sanitized = { ...(value as Record<string, unknown>) };
          for (const field of sensitiveFields) {
            if (field in sanitized) {
              sanitized[field] = '[Filtered]';
            }
          }
          (event.contexts as Record<string, unknown>)[key] = sanitized;
        }
      }
    }

    // Scrub sensitive headers
    if (event.request?.headers) {
      const headers = event.request.headers;
      const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
      for (const header of sensitiveHeaders) {
        if (header in headers) {
          headers[header] = '[Filtered]';
        }
      }
    }

    // Enhanced error grouping by error type and location
    if (event.exception?.values) {
      for (const exception of event.exception.values) {
        // Add custom fingerprinting for better grouping
        if (exception.type && exception.value) {
          event.fingerprint = [
            exception.type,
            exception.value.substring(0, 100), // First 100 chars to group similar errors
          ];
        }
      }
    }

    return event;
  },

  // Breadcrumb filtering
  beforeBreadcrumb(breadcrumb) {
    // Skip http breadcrumbs for health checks and static assets
    if (breadcrumb.category === 'http') {
      const url = breadcrumb.data?.url;
      if (
        typeof url === 'string' &&
        (url.includes('/health') ||
          url.includes('/_next/static') ||
          url.includes('/favicon') ||
          url.includes('google-analytics'))
      ) {
        return null;
      }
    }

    // Sanitize URLs in breadcrumbs
    if (breadcrumb.data?.url) {
      try {
        const url = new URL(breadcrumb.data.url);
        breadcrumb.data.url = url.origin + url.pathname;
      } catch {
        // Invalid URL, keep as is
      }
    }

    // Scrub breadcrumb data fields
    if (breadcrumb.data && typeof breadcrumb.data === 'object') {
      const data = breadcrumb.data as Record<string, unknown>;
      const sensitiveFields = [
        'email',
        'name',
        'phone',
        'address',
        'postcode',
        'password',
        'token',
        'secret',
        'apiKey',
        'authorization',
        'nationalInsuranceNumber',
        'taxCode',
        'salary',
        'pensionContribution',
      ];
      for (const field of sensitiveFields) {
        if (field in data) {
          data[field] = '[Filtered]';
        }
      }
    }

    return breadcrumb;
  },
});
