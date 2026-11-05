/**
 * @jest-environment jsdom
 * @jest-environment-options {"url":"https://payetax.test/?salary=73123.47#financial-canary"}
 */
import type { Envelope } from '@sentry/core';
import * as Sentry from '@sentry/nextjs';
import { setNodeEnv } from '@/test/env';

const mockEnvelopes: Envelope[] = [];
const mockNativeFetch = jest.fn(() => Promise.reject(new TypeError('Failed to fetch')));
const originalFetch = globalThis.fetch;

// Keep the production browser integrations (especially EventFilters), replacing delivery only.
jest.mock('@sentry/nextjs', () => {
  const path = require('node:path');
  const sdk = jest.requireActual(
    path.join(
      path.dirname(require.resolve('@sentry/nextjs/package.json')),
      'build/cjs/index.client.js',
    ),
  );
  return {
    ...sdk,
    init: (options: object) =>
      sdk.init({
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
      }),
  };
});

const firstParty = 'https://payetax.test/_next/static/chunks/app/page.js';
const rewrittenFirstParty = 'app:///_next/static/chunks/app/page.js';
const injected = 'chrome-extension://synthetic/content.js';
const hydrationMessages = [
  'Hydration failed because the server rendered text did not match the client. Salary 73123.47',
  'There was an error while hydrating. FIELD_CANARY',
  'Text content does not match server-rendered HTML. Server: 73123.47',
  'Minified React error #418; visit https://react.dev/errors/418?args[]=73123.47',
  'Minified React error #423; visit https://react.dev/errors/423?args[]=FIELD_CANARY',
];

function events(): Sentry.ErrorEvent[] {
  return mockEnvelopes
    .flatMap<Envelope[1][number]>(([, items]) => items)
    .filter(([header]) => header.type === 'event')
    .map(([, payload]) => payload as Sentry.ErrorEvent);
}

async function capture(value: string, urls = [firstParty], type = 'Error') {
  Sentry.captureEvent({
    exception: {
      values: [
        {
          type,
          value,
          stacktrace: {
            frames: urls.map((filename) => ({ filename, in_app: true, lineno: 1, colno: 1 })),
          },
        },
      ],
    },
    request: { url: 'https://payetax.test/?salary=73123.47#financial-canary' },
    extra: { salary: 73123.47 },
    contexts: { calculator_input: { salary: 73123.47 }, calculator: { stage: 'primary' } },
    tags: { salary: '73123.47', error_boundary: 'component' },
  });
  await Sentry.flush(1000);
}

describe('client noise filters through production SDK envelopes', () => {
  beforeAll(async () => {
    performance.getEntriesByType ??= () => [];
    // JSDOM has no native fetch. Supply its rejection boundary, keeping the
    // SDK wrapper and hostname enhancement real.
    mockNativeFetch.toString = () => 'function fetch() { [native code] }';
    globalThis.fetch = mockNativeFetch;
    setNodeEnv('production');
    await import('../../instrumentation-client');
    expect(Sentry.getClient()?.getIntegrationByName('EventFilters')).toBeDefined();
  });

  afterAll(async () => {
    await Sentry.close(1000);
    globalThis.fetch = originalFetch;
    setNodeEnv('test');
  });

  beforeEach(() => {
    mockEnvelopes.length = 0;
  });

  afterEach(() => {
    expect(JSON.stringify(mockEnvelopes)).not.toMatch(
      /73123\.47|financial-canary|FIELD_CANARY|CAUSE_CANARY|PROPERTY_CANARY/,
    );
    expect(mockEnvelopes.flatMap(([, items]) => items.map(([header]) => header.type))).toEqual(
      events().map(() => 'event'),
    );
  });

  it('retains a same-origin dynamic import failure and sanitises its URL and context', async () => {
    await capture(
      'Failed to fetch dynamically imported module: https://payetax.test/_next/static/chunks/tool.js?salary=73123.47#financial-canary',
      [`${firstParty}?salary=73123.47#financial-canary`],
      'TypeError',
    );
    expect(events()).toHaveLength(1);
    const event = events()[0];
    expect(event.exception?.values?.[0].value).toBe(
      'Failed to fetch dynamically imported module: https://payetax.test/_next/static/chunks/tool.js',
    );
    expect(event.exception?.values?.[0].stacktrace?.frames?.[0].filename).toBe(rewrittenFirstParty);
    expect(event.request?.url).toBe('https://payetax.test/');
    expect(event.contexts?.calculator).toEqual({ stage: 'primary' });
    expect(event.extra).toBeUndefined();
    expect(event.tags?.error_boundary).toBe('component');
  });

  it.each(hydrationMessages)('retains first-party hydration safely: %s', async (message) => {
    await capture(message);
    expect(events()).toHaveLength(1);
    expect(events()[0].exception?.values?.[0].value).toMatch(
      /^(Hydration failed|There was an error while hydrating|Text content does not match server-rendered HTML|React hydration failed \((418|423)\))$/,
    );
    expect(events()[0].exception?.values?.[0].stacktrace?.frames?.[0].filename).toBe(
      rewrittenFirstParty,
    );
  });

  it.each(hydrationMessages)(
    'drops positively identified injected hydration: %s',
    async (message) => {
      await capture(message, [injected]);
      expect(events()).toHaveLength(0);
    },
  );

  it.each([
    { urls: [injected, firstParty] },
    { urls: ['app:///injection_files/OpenSpanDocumentScriptRollup.js', firstParty] },
    { urls: [] },
  ])('retains mixed or unknown hydration stacks: $urls', async ({ urls }) => {
    await capture('Hydration failed', urls);
    expect(events()).toHaveLength(1);
  });

  it.each([
    ['Failed to fetch', 'TypeError', firstParty],
    ['TypeError: Failed to fetch', 'Error', firstParty],
    ['Failed to fetch (payetax.test)', 'TypeError', firstParty],
    ['TypeError: Failed to fetch (payetax.test:443)', 'Error', firstParty],
    ['Network request failed', 'TypeError', firstParty],
    ['The operation was aborted.', 'AbortError', firstParty],
    ['ResizeObserver loop limit exceeded', 'Error', firstParty],
    ['MetaMask extension not found', 'Error', firstParty],
    ['Invalid or unexpected token', 'SyntaxError', 'app:///f3e623ce0222733b/script.js'],
    [
      '"undefined" is not valid JSON',
      'SyntaxError',
      'app:///injection_files/OpenSpanDocumentScriptRollup.js',
    ],
    ['Synthetic third-party failure', 'Error', 'https://www.googletagmanager.com/gtm.js'],
  ])('preserves established noise suppression: %s', async (message, type, url) => {
    await capture(message, [url], type);
    expect(events()).toHaveLength(0);
  });

  it('suppresses a native fetch rejection enhanced by the real SDK wrapper', async () => {
    expect(window.fetch).not.toBe(mockNativeFetch);
    const error = await window
      .fetch('https://payetax.test/api/send-results?salary=73123.47')
      .catch((failure: unknown) => failure);
    expect(error).toBeInstanceOf(TypeError);
    expect((error as Error).message).toBe('Failed to fetch (payetax.test)');
    expect(mockNativeFetch).toHaveBeenCalledTimes(1);
    Sentry.captureException(error);
    await Sentry.flush(1000);
    expect(events()).toHaveLength(0);
  });

  it.each(['chrome-extension', 'moz-extension', 'safari-web-extension'])(
    'suppresses a stackless import failure with an identified %s URL',
    async (scheme) => {
      await capture(
        `Failed to fetch dynamically imported module: ${scheme}://synthetic/chunk.js`,
        [],
        'TypeError',
      );
      expect(events()).toHaveLength(0);
    },
  );

  it('sanitises actual Error properties and linked hydration cause messages', async () => {
    const cause = Object.assign(new TypeError('CAUSE_CANARY 73123.47'), {
      salary: 'PROPERTY_CANARY',
    });
    cause.stack = `TypeError: CAUSE_CANARY 73123.47\n    at render (${firstParty}:1:1)`;
    const error = Object.assign(new Error(hydrationMessages[4], { cause }), {
      salary: 'PROPERTY_CANARY',
    });
    error.stack = `Error: ${error.message}\n    at hydrate (${firstParty}:2:1)`;
    Sentry.captureException(error);
    await Sentry.flush(1000);
    expect(events()).toHaveLength(1);
    expect(events()[0].exception?.values).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'TypeError', value: 'Hydration-related error' }),
        expect.objectContaining({ type: 'Error', value: 'React hydration failed (423)' }),
      ]),
    );
  });

  it('retains ordinary first-party asset errors after removing the dead pseudo-regex', async () => {
    await capture('Script tool.js load failed');
    expect(events()).toHaveLength(1);
  });

  it('keeps unmonitored routes excluded', async () => {
    window.history.replaceState({}, '', '/privacy');
    try {
      await capture('Synthetic unmonitored error');
      expect(events()).toHaveLength(0);
    } finally {
      window.history.replaceState({}, '', '/');
    }
  });
});
