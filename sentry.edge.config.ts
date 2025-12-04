import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment-specific configuration
  environment: process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',

  // Enable structured logs (5GB/month free tier)
  enableLogs: true,

  // Performance monitoring - Edge runtime is lightweight, sample more
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0, // 50% in prod, 100% in dev

  // Advanced traces sampling for edge runtime
  tracesSampler: (samplingContext) => {
    // Always sample errors
    if (samplingContext.parentSampled === true) {
      return 1.0;
    }

    const transactionName = samplingContext.transactionContext?.name;

    // Edge API routes - sample highly
    if (transactionName?.includes('/api/')) {
      return 0.7;
    }

    // Middleware - critical path, sample highly
    if (transactionName?.includes('middleware')) {
      return 0.8;
    }

    // Default sampling for edge runtime
    return 0.5;
  },

  // Edge-specific integrations
  integrations: [
    // Console logging integration - capture console.warn and console.error
    Sentry.consoleLoggingIntegration({
      levels: ['warn', 'error'], // Only capture warnings and errors
    }),
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
        ];
        for (const field of sensitiveFields) {
          if (field in sanitized) {
            sanitized[field] = '[Filtered]';
          }
        }
        event.request.data = sanitized;
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

    return breadcrumb;
  },

  // Filter logs before sending to Sentry
  beforeSendLog(log) {
    // Don't send logs from development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    // Filter out info/debug logs to conserve quota (only warn/error/fatal)
    if (log.level === 'info' || log.level === 'debug' || log.level === 'trace') {
      return null;
    }

    return log;
  },
});
