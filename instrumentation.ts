import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export async function onRequestError(
  err: unknown,
  request: {
    path: string;
  },
  context: {
    routerKind: 'Pages Router' | 'App Router';
  }
) {
  Sentry.captureException(err, {
    tags: {
      router_kind: context.routerKind,
      request_path: request.path
    },
    contexts: {
      request: {
        url: request.path
      }
    }
  });
}
