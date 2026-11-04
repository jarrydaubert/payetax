/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://payetax.test/tools/director-guide?salary=73123.47#financial-canary"}
 */
import type { Envelope } from '@sentry/core';
import type * as SentryNextjs from '@sentry/nextjs';
import { calculateDirectorScenario } from '@/lib/tax/directorCalculator';
import { setNodeEnv } from '@/test/env';

const mockEnvelopes: Envelope[] = [];

// Run the browser SDK build through the production client config; only delivery is replaced.
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

jest.mock('@/lib/tax/directorCalculator', () => ({
  calculateDirectorScenario: jest.fn(),
}));

jest.mock('@/lib/tax/strategyComparison', () => ({
  calculateStrategyComparison: jest.fn().mockReturnValue({
    grossProfit: 80000,
    grossProfitAfterPension: 80000,
    strategies: {
      allSalary: { name: 'All Salary', salary: 80000, dividends: 0, takeHome: 55000 },
      optimalMix: { name: 'Baseline Mix', salary: 12570, dividends: 50000, takeHome: 60000 },
      allDividends: { name: 'All Dividends', salary: 0, dividends: 60000, takeHome: 58000 },
    },
    recommended: 'optimalMix',
    savingsVsAllSalary: 5000,
  }),
}));

const mockCalculateDirectorScenario = calculateDirectorScenario as jest.Mock;

const EMAIL_CANARY = 'director.canary@example.com';
const TAX_CODE_CANARY = 'K4321';
const CANARY_PATTERN =
  /73123\.47|64321\.09|director\.canary|K4321|financial-canary|leakedFrame|CAUSE_CANARY|NESTED_CANARY/;
const CANARY_MESSAGE = [
  `Engine failed for revenue 73123.47, ${EMAIL_CANARY}, tax code ${TAX_CODE_CANARY}`,
  'see https://payetax.test/private/64321.09?email=director.canary@example.com#financial-canary',
  '    at leakedFrame (https://payetax.test/73123.47.js:1:1)',
].join('\n');

function seedCanaries<T extends object>(thrown: T): T {
  return Object.assign(thrown, {
    revenue: 73123.47,
    email: EMAIL_CANARY,
    taxCode: TAX_CODE_CANARY,
    extra: { nested: { profit: 64321.09, note: 'NESTED_CANARY' } },
    cause: new Error(`CAUSE_CANARY ${EMAIL_CANARY} 64321.09`),
  });
}

function throwSyntheticEngineFailure(): never {
  throw seedCanaries(new TypeError(CANARY_MESSAGE));
}

function throwSyntheticNonError(): never {
  throw seedCanaries({ message: CANARY_MESSAGE, url: 'https://payetax.test/?salary=73123.47' });
}

function throwSyntheticCustomError(): never {
  class PrivateEngineError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'PrivateEngineError';
    }
  }
  throw seedCanaries(new PrivateEngineError(CANARY_MESSAGE));
}

function eventItems(): SentryNextjs.ErrorEvent[] {
  return mockEnvelopes
    .flatMap<Envelope[1][number]>(([, items]) => items)
    .filter(([header]) => header.type === 'event')
    .map(([, payload]) => payload as SentryNextjs.ErrorEvent);
}

describe('Director calculation failure Sentry envelopes', () => {
  let Sentry: typeof SentryNextjs;
  let useDirectorGuideStore: typeof import('../directorGuideStore').useDirectorGuideStore;

  async function calculateWithValidInput() {
    const store = useDirectorGuideStore.getState();
    store.setRegion('rUK');
    store.setRevenue(100000);
    store.setExpenses(20000);
    expect(() => useDirectorGuideStore.getState().calculate()).not.toThrow();
    await Sentry.flush(1000);
  }

  beforeAll(async () => {
    // Spy before init so the SDK's console breadcrumb instrumentation still wraps it.
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    // jsdom lacks this API, which the default browser integrations read for web vitals.
    performance.getEntriesByType ??= () => [];
    setNodeEnv('production');
    await import('../../instrumentation-client');
    Sentry = await import('@sentry/nextjs');
    ({ useDirectorGuideStore } = await import('../directorGuideStore'));
  });

  afterAll(async () => {
    await Sentry.close(1000);
    setNodeEnv('test');
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    mockEnvelopes.length = 0;
    useDirectorGuideStore.getState().reset();
    mockCalculateDirectorScenario.mockReset();
  });

  it('sends one fixed, canary-free event for a thrown Error and keeps the store behaviour', async () => {
    mockCalculateDirectorScenario.mockImplementation(throwSyntheticEngineFailure);

    await calculateWithValidInput();

    const state = useDirectorGuideStore.getState();
    expect(state.error).toBe(CANARY_MESSAGE);
    expect(state.isCalculating).toBe(false);
    expect(state.results).toBeNull();

    expect(mockEnvelopes.flatMap(([, items]) => items.map(([header]) => header.type))).toEqual([
      'event',
    ]);
    const [event] = eventItems();
    expect(event.exception?.values).toHaveLength(1);
    const [exception] = event.exception?.values ?? [];
    expect(exception.type).toBe('TypeError');
    expect(exception.value).toBe('Director calculation failed');
    expect(exception.mechanism).toMatchObject({ handled: true });
    expect(
      exception.stacktrace?.frames?.some((frame) =>
        frame.function?.includes('throwSyntheticEngineFailure'),
      ),
    ).toBe(true);
    expect(event.level).toBe('error');
    expect(event.release).toBe('sentry-offline-verification');
    expect(event.tags).toEqual({ error_type: 'calculator', feature: 'director' });
    expect(event.contexts?.calculator).toEqual({ stage: 'director' });
    expect(event.fingerprint).toEqual(['calculator-error', 'director']);
    expect(event.request?.url).toBe('https://payetax.test/tools/director-guide');
    expect(event.extra).toBeUndefined();
    expect(event.user).toBeUndefined();
    expect(event.breadcrumbs?.some((breadcrumb) => breadcrumb.category === 'console')).not.toBe(
      true,
    );
    expect(JSON.stringify(mockEnvelopes)).not.toMatch(CANARY_PATTERN);
  });

  it('sends one fixed, canary-free event for a non-Error throw', async () => {
    mockCalculateDirectorScenario.mockImplementation(throwSyntheticNonError);

    await calculateWithValidInput();

    expect(useDirectorGuideStore.getState().error).toBe('Calculation failed');
    expect(useDirectorGuideStore.getState().isCalculating).toBe(false);
    const events = eventItems();
    expect(events).toHaveLength(1);
    expect(events[0].exception?.values).toHaveLength(1);
    expect(events[0].exception?.values?.[0]).toMatchObject({
      type: 'NonErrorThrow',
      value: 'Director calculation failed',
    });
    expect(events[0].tags).toEqual({ error_type: 'calculator', feature: 'director' });
    expect(JSON.stringify(mockEnvelopes)).not.toMatch(CANARY_PATTERN);
  });

  it('reports custom Error subclasses with a bounded built-in type', async () => {
    mockCalculateDirectorScenario.mockImplementation(throwSyntheticCustomError);

    await calculateWithValidInput();

    const events = eventItems();
    expect(events).toHaveLength(1);
    expect(events[0].exception?.values?.[0]).toMatchObject({
      type: 'Error',
      value: 'Director calculation failed',
    });
    expect(JSON.stringify(mockEnvelopes)).not.toMatch(CANARY_PATTERN);
  });

  it('keeps message-free Gecko frames and drops stacks that cannot be proven message-free', async () => {
    const geckoError = new RangeError(CANARY_MESSAGE);
    geckoError.stack = [
      'throwGeckoEngineFailure@https://payetax.test/_next/static/chunks/app.js?salary=73123.47:1:2',
      '@https://payetax.test/_next/static/chunks/app.js:3:4',
    ].join('\n');
    const rewrittenError = new Error('short');
    rewrittenError.stack = `Error: ${CANARY_MESSAGE}\n    at leakedFrame (https://payetax.test/73123.47.js:1:1)`;
    mockCalculateDirectorScenario
      .mockImplementationOnce(() => {
        throw geckoError;
      })
      .mockImplementationOnce(() => {
        throw rewrittenError;
      });

    await calculateWithValidInput();
    await calculateWithValidInput();

    const [geckoEvent, rewrittenEvent] = eventItems();
    const geckoFrames = geckoEvent.exception?.values?.[0].stacktrace?.frames ?? [];
    expect(geckoEvent.exception?.values?.[0].type).toBe('RangeError');
    expect(geckoFrames.map((frame) => frame.function)).toContain('throwGeckoEngineFailure');
    // The Next.js SDK rewrites same-origin chunk URLs; the sanitizer has removed the query.
    expect(geckoFrames.map((frame) => frame.filename)).toContain(
      'app:///_next/static/chunks/app.js',
    );
    expect(
      rewrittenEvent.exception?.values?.[0].stacktrace?.frames?.some((frame) =>
        frame.function?.includes('captureDirectorCalculationFailure'),
      ),
    ).toBe(true);
    expect(JSON.stringify(mockEnvelopes)).not.toMatch(CANARY_PATTERN);
  });

  it('keeps repeated identical failures as separate events without disabling global dedupe', async () => {
    mockCalculateDirectorScenario.mockImplementation(throwSyntheticEngineFailure);

    const store = useDirectorGuideStore.getState();
    store.setRegion('rUK');
    store.setRevenue(100000);
    store.setExpenses(20000);
    // Same call path, so the two events have identical frames, text and fingerprint.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      useDirectorGuideStore.getState().calculate();
    }
    await Sentry.flush(1000);

    expect(mockCalculateDirectorScenario).toHaveBeenCalledTimes(2);
    expect(eventItems()).toHaveLength(2);

    mockEnvelopes.length = 0;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      Sentry.captureException(new Error('Synthetic unrelated duplicate'));
    }
    await Sentry.flush(1000);
    expect(eventItems()).toHaveLength(1);
  });

  it('emits no event for successful calculations or incomplete input', async () => {
    mockCalculateDirectorScenario.mockReturnValue({ mode: 'normal', warnings: [] });

    await calculateWithValidInput();
    expect(useDirectorGuideStore.getState().results).not.toBeNull();

    useDirectorGuideStore.getState().reset();
    useDirectorGuideStore.getState().calculate();
    await Sentry.flush(1000);

    expect(useDirectorGuideStore.getState().error).toBe('Please select your region');
    expect(mockCalculateDirectorScenario).toHaveBeenCalledTimes(1);
    expect(eventItems()).toHaveLength(0);
  });
});
