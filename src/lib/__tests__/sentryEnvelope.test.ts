/** @jest-environment node */
import { createServer, get } from 'node:http';
import type { Envelope } from '@sentry/core';
import * as Sentry from '@sentry/nextjs';
import { onRequestError } from '@/instrumentation';
import { setNodeEnv } from '@/test/env';

const mockEnvelopes: Envelope[] = [];
let mockRuntime = 'node';

jest.mock('@sentry/nextjs', () => {
  const sdk = jest.requireActual('@sentry/nextjs');
  return {
    ...sdk,
    init: (options: object) => {
      const runtimeSdk =
        mockRuntime === 'edge'
          ? jest.requireActual(
              require('node:path').join(
                require('node:path').dirname(require.resolve('@sentry/nextjs/package.json')),
                'build/cjs/edge/index.js',
              ),
            )
          : sdk;
      return runtimeSdk.init({
        ...options,
        dsn: 'https://public@example.invalid/1',
        release: 'sentry-offline-verification',
        transport: () => ({
          send: (envelope: Envelope) => {
            mockEnvelopes.push(JSON.parse(JSON.stringify(envelope)));
            return Promise.resolve({ statusCode: 200 });
          },
          flush: async () => true,
        }),
      });
    },
  };
});

describe.each(['node', 'edge'])('%s outgoing envelopes', (runtime) => {
  beforeAll(async () => {
    mockRuntime = runtime;
    mockEnvelopes.length = 0;
    setNodeEnv('production');
    if (runtime === 'node') await import('../../../sentry.server.config');
    else await import('../../../sentry.edge.config');
  });

  afterAll(async () => {
    await Sentry.close(1000);
    setNodeEnv('test');
  });

  beforeEach(() => {
    mockEnvelopes.length = 0;
  });

  if (runtime === 'node') {
    it.each([
      ['Application transaction aborted during commit', 'Error', true],
      ['Dependency request aborted unexpectedly', 'TypeError', true],
      ['Request aborted while committing calculation', 'Error', true],
      ['aborted', 'Error', false],
      ['Request aborted', 'Error', false],
      ['This operation was aborted', 'AbortError', false],
      ['The operation was aborted.', 'AbortError', false],
      ['', 'ResponseAborted', false],
      ['ECONNRESET', 'Error', false],
      ['connect ETIMEDOUT', 'Error', false],
    ])(
      'classifies server cancellation without hiding failures: %s (%s)',
      async (message, type, retained) => {
        expect(Sentry.getClient()?.getIntegrationByName('EventFilters')).toBeDefined();
        const error = Object.assign(new Error(message), { name: type, salary: 'PROPERTY_CANARY' });
        error.stack = `${type}: ${message}\n    at handler (app:///server.js:1:1)`;
        Sentry.captureException(error, {
          extra: { salary: 73123.47 },
          contexts: {
            calculator_input: { salary: 73123.47 },
            request: { url: 'https://payetax.test/?salary=73123.47#financial-canary' },
          },
        });
        await Sentry.flush(1000);
        const events = mockEnvelopes
          .flatMap<Envelope[1][number]>(([, items]) => items)
          .filter(([header]) => header.type === 'event');
        expect(events).toHaveLength(retained ? 1 : 0);
        if (retained) {
          const event = events[0][1] as Sentry.ErrorEvent;
          expect(event.exception?.values?.[0].value).toBe(message);
          expect(event.contexts?.request?.url).toBe('https://payetax.test/');
          expect(event.extra).toBeUndefined();
        }
        expect(JSON.stringify(mockEnvelopes)).not.toMatch(
          /73123\.47|financial-canary|PROPERTY_CANARY/,
        );
      },
    );

    it('keeps an application failure whose linked cause is a named cancellation', async () => {
      const cause = Object.assign(new Error('This operation was aborted'), { name: 'AbortError' });
      cause.stack =
        'AbortError: This operation was aborted\n    at dependency (app:///server.js:1:1)';
      const error = new Error('Application transaction aborted during rollback', { cause });
      error.stack = `Error: ${error.message}\n    at application (app:///server.js:2:1)`;
      Sentry.captureException(error);
      await Sentry.flush(1000);
      const events = mockEnvelopes
        .flatMap<Envelope[1][number]>(([, items]) => items)
        .filter(([header]) => header.type === 'event');
      expect(events).toHaveLength(1);
      const event = events[0][1] as Sentry.ErrorEvent;
      expect(event.exception?.values?.at(-1)?.value).toBe(error.message);
    });
  }

  it('sends a real captureRequestError envelope with sanitised headers, query and referer', async () => {
    const error = new Error('Synthetic request failure');
    // Keep the SDK's ContextLines integration from quoting hardcoded canaries in this test's source.
    error.stack = 'Error: Synthetic request failure\n    at requestHandler (app:///server.js:1:1)';
    await onRequestError(
      error,
      {
        path: '/tools/director-guide?salary=73123.47#financial-canary',
        method: 'POST',
        headers: {
          authorization: 'Bearer AUTHENTICATION_CANARY',
          cookie: 'saved=COOKIE_CANARY',
          'x-salary': '73123.47',
          'x-forwarded-for': '192.0.2.123',
          'user-agent': 'PayeTax-offline-test',
          referer: 'https://user:REFERER_PASSWORD@payetax.test/?salary=73123.47#financial-canary',
        },
      },
      {
        routerKind: 'App Router',
        routePath: '/tools/director-guide',
        routeType: 'render',
        revalidateReason: undefined,
      },
    );
    await Sentry.flush(1000);
    const eventItems = mockEnvelopes
      .flatMap<Envelope[1][number]>(([, items]) => items)
      .filter(([header]) => header.type === 'event');
    expect(eventItems).toHaveLength(1);
    const event = eventItems[0][1] as Sentry.ErrorEvent;
    expect(event.exception?.values?.[0].value).toBe('Synthetic request failure');
    expect(event.exception?.values?.[0].mechanism?.type).toBe(
      'auto.function.nextjs.on_request_error',
    );
    expect(event.request?.headers).toEqual({
      'user-agent': 'PayeTax-offline-test',
      referer: 'https://payetax.test/',
    });
    expect(event.request?.query_string).toBeUndefined();
    expect(event.contexts?.request).toEqual({ url: '/tools/director-guide' });
    expect(event.contexts?.runtime?.name).toBe(runtime === 'node' ? 'Node.js' : 'Edge Runtime');
    expect(JSON.stringify(mockEnvelopes)).not.toMatch(
      /73123\.47|financial-canary|AUTHENTICATION_CANARY|COOKIE_CANARY|REFERER_PASSWORD|192\.0\.2\.123/,
    );
  });

  it('does not send process or request session envelopes while still capturing errors', async () => {
    const client = Sentry.getClient();
    expect(client?.getIntegrationByName('ProcessSession')).toBeUndefined();
    expect(Sentry.getIsolationScope().getSession()).toBeUndefined();
    expect(client?.getOptions().tracesSampleRate).toBe(0);
    if (runtime === 'edge') expect(client?.getIntegrationByName('Http')).toBeUndefined();
    const sessionStarted = jest.fn();
    const unsubscribe = client?.on('startRequestSession', sessionStarted);
    if (runtime === 'node') {
      const server = createServer((_request, response) => response.end('ok'));
      try {
        await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
        const address = server.address();
        if (!address || typeof address === 'string') throw new Error('Expected local TCP listener');
        await new Promise<void>((resolve, reject) => {
          get(`http://127.0.0.1:${address.port}/`, (response) => {
            response.resume();
            response.on('end', resolve);
          }).on('error', reject);
        });
      } finally {
        await new Promise<void>((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        );
      }
    }
    unsubscribe?.();
    Sentry.captureException(new Error('Synthetic error-only session regression'));
    await Sentry.flush(1000);
    expect(sessionStarted).not.toHaveBeenCalled();
    expect(
      mockEnvelopes
        .flatMap<Envelope[1][number]>(([, items]) => items)
        .map(([header]) => header.type),
    ).toEqual(['event']);
  });
});
