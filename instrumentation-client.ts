import * as Sentry from '@sentry/nextjs';
import { shouldDropClientSentryEvent } from '@/lib/sentryClientFilters';

// Export router transition hook for navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment-specific configuration
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development',

  // Enable structured logs (5GB/month free tier)
  enableLogs: true,

  // Performance monitoring - optimized for free tier (10k transactions/month)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev

  // Advanced traces sampling based on operation
  tracesSampler: (samplingContext) => {
    // Always sample errors
    if (samplingContext.parentSampled === true) {
      return 1.0;
    }

    // Sample critical transactions - keep low for free tier
    const transactionName = samplingContext.transactionContext?.name;
    if (transactionName?.includes('/api/')) {
      return 0.1; // 10% for API routes
    }

    // Sample calculator pages (core functionality)
    if (
      transactionName?.includes('/calculator') ||
      transactionName?.includes('/salary') ||
      transactionName?.includes('/income')
    ) {
      return 0.15; // 15% for calculator pages
    }

    // Default sampling for other pages
    return 0.05;
  },

  // Session Replay - optimized for free tier (50 replays/month)
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0, // Capture 100% of errors
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0, // Sample 1% of sessions

  // Integrations with enhanced configuration
  integrations:
    process.env.NODE_ENV === 'production'
      ? [
          // Console logging integration - capture console.warn and console.error
          Sentry.consoleLoggingIntegration({
            levels: ['warn', 'error'], // Only capture warnings and errors (not log/debug)
          }),

          // Session Replay with privacy controls
          Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
            // Privacy-sensitive selectors to block
            block: [
              '.sentry-block',
              '[data-sentry-block]',
              '[data-private]',
              'input[type="email"]',
              'input[type="tel"]',
            ],
            // Network request/response body recording
            networkDetailAllowUrls: [window.location.origin],
            networkRequestHeaders: ['User-Agent'],
            networkResponseHeaders: ['Content-Type'],
          }),
          // Browser tracing for performance monitoring
          Sentry.browserTracingIntegration({
            // Enhanced instrumentation
            enableLongTask: true,
            enableInp: true, // Track Interaction to Next Paint (Core Web Vital)
          }),

          // Breadcrumbs for better error context
          Sentry.breadcrumbsIntegration({
            console: false, // Don't track console.log
            dom: true, // Track DOM events
            fetch: true, // Track fetch requests
            history: true, // Track navigation
            xhr: true, // Track XHR requests
          }),
        ]
      : [],

  // Disable debug mode (too verbose in console)
  debug: false,

  // Ignore common non-critical errors
  ignoreErrors: [
    // Sentry SDK internal errors (not actionable)
    'feature named `webCompat` was not found',
    'feature named `hover` was not found',
    'feature named `performanceMetrics` was not found',
    // Storage access denied (privacy mode, iframe restrictions, blocked cookies)
    "Failed to read the 'localStorage' property from 'Window'",
    "Failed to read the 'sessionStorage' property from 'Window'",
    'Access is denied for this document',
    // Hydration errors (often caused by browser extensions modifying DOM)
    'Hydration failed',
    'There was an error while hydrating',
    'Minified React error #418',
    'Minified React error #423',
    'Text content does not match server-rendered HTML',
    // Browser extensions (not actionable - user's installed extensions)
    'top.GLOBALS',
    'MetaMask extension not found',
    'Failed to connect to MetaMask',
    'inpage.js',
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Network errors (transient)
    'Network request failed',
    'Failed to fetch',
    'NetworkError',
    'Load failed',
    'TypeError: NetworkError when attempting to fetch resource',
    // Service worker / navigation preload errors (browser-level, not actionable)
    'invalid origin',
    'Failed to update a ServiceWorker',
    'An unknown error occurred when fetching the script',
    'newestWorker is null',
    'InvalidStateError',
    'register-sw.js',
    'sw.js load failed',
    'Script.*load failed',
    // Cancelled requests (user navigation)
    'AbortError',
    'The operation was aborted',
    // Browser quirks
    "Can't find variable: ZiteReader",
    'jigsaw is not defined',
    'CommentBackboneEnd',
    'atomicFindClose',
    // Social media widgets
    'fb_xd_fragment',
    // Browser plugins/extensions
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',
    // Non-actionable errors
    'Connection closed.',
    'Event `CustomEvent` (type=unhandledrejection) captured as promise rejection',
    'Non-Error promise rejection captured',
  ],

  // Ignore specific URLs (browser extensions, CDNs)
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
    // Third-party analytics/ads
    /googletagmanager\.com/i,
    /google-analytics\.com/i,
  ],

  beforeSend(event, hint) {
    if (shouldDropClientSentryEvent(event, hint)) {
      return null;
    }

    // Filter out localhost/local errors
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')) {
        return null;
      }
    }

    // Don't send errors from development environment
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    // Enhance error context with user interaction data
    const originalException = hint.originalException;
    if (originalException instanceof Error) {
      // Add component stack if available
      if ('componentStack' in originalException) {
        event.contexts = {
          ...event.contexts,
          react: {
            componentStack: (originalException as { componentStack?: string }).componentStack,
          },
        };
      }
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
      const sensitiveFields = [
        'email',
        'name',
        'phone',
        'address',
        'postcode',
        'ssn',
        'nationalInsuranceNumber',
        'taxCode',
        'salary',
        'pensionContribution',
      ];
      for (const field of sensitiveFields) {
        sanitized[field] = undefined;
      }
      event.request.data = sanitized;
    }

    // Scrub context data that might contain PII
    if (event.contexts) {
      const sensitiveFields = [
        'email',
        'name',
        'phone',
        'address',
        'postcode',
        'ssn',
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

    // Add browser and device context
    if (typeof window !== 'undefined') {
      event.contexts = {
        ...event.contexts,
        browser_info: {
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          screen: `${window.screen.width}x${window.screen.height}`,
          orientation: window.screen.orientation?.type,
          online: navigator.onLine,
          connection: (navigator as { connection?: { effectiveType?: string } }).connection
            ?.effectiveType,
        },
      };
    }

    return event;
  },

  // Breadcrumb filtering
  beforeBreadcrumb(breadcrumb, _hint) {
    // Skip console breadcrumbs (too noisy)
    if (breadcrumb.category === 'console') {
      return null;
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
        'ssn',
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

  // Filter logs before sending to Sentry
  beforeSendLog(log) {
    // Don't send logs from development or localhost
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')) {
        return null;
      }
    }

    // Filter out info/debug logs to conserve quota (only warn/error/fatal)
    if (log.level === 'info' || log.level === 'debug' || log.level === 'trace') {
      return null;
    }

    // Filter out PWA/ServiceWorker logs, deprecation warnings, and Sentry Replay errors
    const msg = typeof log.message === 'string' ? log.message : '';
    if (
      msg.includes('[PWA]') ||
      msg.includes('[SW]') ||
      msg.includes('DeprecationWarning') ||
      msg.includes('[DEP0') ||
      msg.includes('cross-origin stylesheet') ||
      msg.includes('Failed to load chunk')
    ) {
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
      log.attributes = sanitized;
    }

    return log;
  },
});
