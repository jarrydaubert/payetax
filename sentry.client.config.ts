import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Ignore common non-critical errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Network errors
    'Network request failed',
    'Failed to fetch',
    'NetworkError',
    // Random plugins/extensions
    'Can\'t find variable: ZiteReader',
    'jigsaw is not defined',
    'CommentBackboneEnd',
    'atomicFindClose',
    // Facebook
    'fb_xd_fragment',
    // Other plugins
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',
  ],

  beforeSend(event, _hint) {
    // Filter out localhost errors in development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return null;
    }

    // Don't send errors from development environment
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    // Remove query strings with potential PII
    if (event.request?.url) {
      try {
        const url = new URL(event.request.url);
        event.request.url = url.origin + url.pathname;
      } catch {
        // Invalid URL, keep as is
      }
    }

    // Scrub form data that might contain PII
    if (event.request?.data && typeof event.request.data === 'object') {
      const sanitized = { ...event.request.data } as Record<string, unknown>;
      // Remove potentially sensitive fields
      delete sanitized.email;
      delete sanitized.name;
      delete sanitized.phone;
      delete sanitized.address;
      event.request.data = sanitized;
    }

    return event;
  },
});
