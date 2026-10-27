import * as Sentry from '@sentry/nextjs';
import { shouldDropClientSentryEvent } from '@/lib/sentryClientFilters';
import { sanitizeSentryBreadcrumb, sanitizeSentryEvent } from '@/lib/sentryPrivacy';
import { isSentryMonitoredPath, shouldDropSentryEventForUnmonitoredPath } from '@/lib/sentryScope';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment-specific configuration
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development',

  enableLogs: false,
  sendDefaultPii: false,
  tracesSampleRate: 0,

  // Error-focused client monitoring. Session Replay and Browser Tracing are
  // intentionally disabled to keep Sentry scoped to calculator failures.
  integrations:
    process.env.NODE_ENV === 'production'
      ? [
          Sentry.breadcrumbsIntegration({
            console: false, // Don't track console.log
            dom: false, // Manual breadcrumbs avoid selectors containing financial labels
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

      if (!isSentryMonitoredPath(window.location.pathname)) {
        return null;
      }
    }

    // Don't send errors from development environment
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    if (shouldDropSentryEventForUnmonitoredPath(event)) {
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

    return sanitizeSentryEvent(event);
  },

  beforeBreadcrumb: sanitizeSentryBreadcrumb,
});
