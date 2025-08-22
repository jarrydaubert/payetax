// This file configures the initialization of Sentry on the browser/client side
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  replaysOnErrorSampleRate: 1.0,
  
  // This sets the sample rate to be 10%. You may want this to be 100% while in development and sample at a lower rate in production.
  replaysSessionSampleRate: 0.1,
  
  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Performance monitoring
  beforeSend(event, hint) {
    // Filter out errors that are not useful for tax calculator
    if (event.exception) {
      const error = hint.originalException;
      
      // Skip network errors that users can't control
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return null;
      }
      
      // Skip ResizeObserver errors (common browser issue)
      if (error instanceof Error && error.message.includes('ResizeObserver')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Set tags for better error categorization
  initialScope: {
    tags: {
      component: "tax-calculator",
      version: process.env.npm_package_version || "unknown",
    },
  },
});

// Required Sentry hooks for Next.js navigation tracking
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;