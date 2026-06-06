import * as Sentry from '@sentry/nextjs';
import { shouldDropSentryEventForUnmonitoredPath } from '@/lib/sentryScope';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment-specific configuration
  environment: process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',

  enableLogs: false,
  tracesSampleRate: 0,

  // Edge-specific integrations
  integrations: [
    // Extra error data for better debugging
    Sentry.extraErrorDataIntegration({
      depth: 5, // Lighter depth for edge runtime
    }),
  ],

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

    // Remove query strings with potential PII
    if (event.request?.url) {
      try {
        const url = new URL(event.request.url);
        event.request.url = url.origin + url.pathname;
      } catch {
        // Invalid URL, keep as is
      }
    }

    // Scrub request data for PII
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
          'apiKey',
          'authorization',
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
        'apiKey',
        'authorization',
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
      const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
      for (const header of sensitiveHeaders) {
        if (header in headers) {
          headers[header] = '[Filtered]';
        }
      }
    }

    return event;
  },

  beforeBreadcrumb(breadcrumb) {
    // Skip breadcrumbs for static assets
    if (breadcrumb.category === 'fetch') {
      const url = breadcrumb.data?.url;
      if (
        typeof url === 'string' &&
        (url.includes('/_next/static') ||
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
        'apiKey',
        'authorization',
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
