import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment-specific configuration
  environment: process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',

  // Enable structured logs (5GB/month free tier)
  enableLogs: true,

  // Performance monitoring - optimized for free tier (10k transactions/month)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev

  // Advanced traces sampling for server-side operations
  tracesSampler: (samplingContext) => {
    // Always sample errors
    if (samplingContext.parentSampled === true) {
      return 1.0;
    }

    const transactionName = samplingContext.transactionContext?.name;

    // Sample API routes - keep low for free tier
    if (transactionName?.includes('/api/')) {
      // Critical API routes - 20% sampling
      if (
        transactionName?.includes('/api/calculate') ||
        transactionName?.includes('/api/tax') ||
        transactionName?.includes('/api/salary')
      ) {
        return 0.2;
      }
      // Other API routes - 10% sampling
      return 0.1;
    }

    // Sample server actions and route handlers
    if (transactionName?.includes('action') || transactionName?.includes('route')) {
      return 0.1;
    }

    // Default sampling for server-side rendering
    return 0.05;
  },

  // Server-specific integrations
  integrations: [
    // Console logging integration - capture console.warn and console.error
    Sentry.consoleLoggingIntegration({
      levels: ['warn', 'error'], // Only capture warnings and errors (not log/debug)
    }),
    // HTTP instrumentation for request tracking
    Sentry.httpIntegration(),
    // Performance context for server-side metrics
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
    // Don't send errors from development
    if (process.env.NODE_ENV === 'development') {
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

    // Scrub potential PII from log attributes
    if (log.attributes) {
      const sanitized = { ...log.attributes };
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
      ];
      for (const field of sensitiveFields) {
        if (field in sanitized) {
          sanitized[field] = '[Filtered]';
        }
      }
      log.attributes = sanitized;
    }

    return log;
  },
});
