import * as Sentry from '@sentry/nextjs';
import type { Instrumentation } from 'next';
import { isSentryMonitoredPath, normalizeSentryPath } from '@/lib/sentryScope';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  const path = normalizeSentryPath(request.path);
  if (!(path && isSentryMonitoredPath(path))) {
    return;
  }

  Sentry.withScope((scope) => {
    scope.setTag('router_kind', context.routerKind);
    scope.setTag('request_path', path);
    scope.setContext('request', { url: path });
    // The SDK handles Next.js control-flow errors and schedules a serverless flush.
    Sentry.captureRequestError(err, { ...request, path }, context);
  });
};
