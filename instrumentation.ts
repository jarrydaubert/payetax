export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side Sentry initialization
    const { default: Sentry } = await import('@sentry/nextjs');
    
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      debug: false,
      
      beforeSend(event, hint) {
        if (event.exception) {
          const error = hint.originalException;
          
          if (error instanceof Error) {
            if (error.message.includes('ECONNRESET') || error.message.includes('timeout')) {
              return null;
            }
            if (error.message.includes('Cannot resolve module')) {
              return null;
            }
          }
        }
        return event;
      },
      
      initialScope: {
        tags: {
          component: "tax-calculator-server",
          version: process.env.npm_package_version || "unknown",
        },
      },
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime Sentry initialization
    const { default: Sentry } = await import('@sentry/nextjs');
    
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      debug: false,
      
      beforeSend(event, hint) {
        if (event.exception) {
          const error = hint.originalException;
          if (error instanceof Error && error.message.includes('fetch')) {
            return null;
          }
        }
        return event;
      },
      
      initialScope: {
        tags: {
          component: "tax-calculator-edge",
          runtime: "edge",
        },
      },
    });
  }
}

// Hook to capture request errors from React Server Components
export const onRequestError = async (error: unknown, request: any, context: any) => {
  const { default: Sentry } = await import('@sentry/nextjs');
  return Sentry.captureRequestError(error, request, context);
};