import * as Sentry from '@sentry/nextjs';
import { isSentryMonitoredPath } from '@/lib/sentryScope';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }

  // Client-side Sentry configuration
  if (process.env.NEXT_RUNTIME === 'browser') {
    await import('./instrumentation-client');
  }
}

export async function onRequestError(
  err: unknown,
  request: {
    path: string;
  },
  context: {
    routerKind: 'Pages Router' | 'App Router';
  },
) {
  if (!isSentryMonitoredPath(request.path)) {
    return;
  }

  Sentry.captureException(err, {
    tags: {
      router_kind: context.routerKind,
      request_path: request.path,
    },
    contexts: {
      request: {
        url: request.path,
      },
    },
  });
}
