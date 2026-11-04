/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://payetax.test/?salary=73123.47#financial-canary"}
 */
import type { Envelope } from '@sentry/core';
import type * as SentryNextjs from '@sentry/nextjs';
import { captureCalculatorAnomaly, captureCalculatorError } from '@/lib/sentry';
import { calculateTax } from '@/lib/tax';
import { setNodeEnv } from '@/test/env';

const mockEnvelopes: Envelope[] = [];

// Exercise the production browser SDK/config, replacing only network delivery.
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

jest.mock('@/lib/tax', () => ({
  ...jest.requireActual('@/lib/tax'),
  calculateTax: jest.fn(),
}));

const mockCalculateTax = calculateTax as jest.MockedFunction<typeof calculateTax>;
const stages = ['primary', 'previous_year', 'what_if'] as const;
const canaries = /73123\.47|financial-canary|FIELD_CANARY|MESSAGE_CANARY|HASH_CANARY/;

function events(): SentryNextjs.ErrorEvent[] {
  return mockEnvelopes
    .flatMap<Envelope[1][number]>(([, items]) => items)
    .filter(([header]) => header.type === 'event')
    .map(([, payload]) => payload as SentryNextjs.ErrorEvent);
}

function typeFailure() {
  return new TypeError('Synthetic calculation failure');
}

function rangeFailure() {
  return new RangeError('Synthetic calculation failure');
}

describe('calculator grouping through real browser SDK envelopes', () => {
  let Sentry: typeof SentryNextjs;
  let store: typeof import('../calculatorStore').useCalculatorStore;

  beforeAll(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    performance.getEntriesByType ??= () => [];
    setNodeEnv('production');
    await import('../../instrumentation-client');
    Sentry = await import('@sentry/nextjs');
    ({ useCalculatorStore: store } = await import('../calculatorStore'));
  });

  afterAll(async () => {
    await Sentry.close(1000);
    setNodeEnv('test');
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    mockEnvelopes.length = 0;
    store.getState().reset();
    mockCalculateTax.mockReset();
  });

  afterEach(() => {
    expect(JSON.stringify(mockEnvelopes)).not.toMatch(canaries);
    expect(mockEnvelopes.flatMap(([, items]) => items.map(([header]) => header.type))).toEqual(
      events().map(() => 'event'),
    );
  });

  it.each(stages)(
    'keeps %s warning groups separate from default type/stack exception grouping',
    async (stage) => {
      captureCalculatorAnomaly({ stage }, ['non_finite_value']);
      captureCalculatorError(typeFailure(), { stage });
      captureCalculatorError(rangeFailure(), { stage });
      await Sentry.flush(1000);

      const [warning, typeError, rangeError] = events();
      expect(events()).toHaveLength(3);
      expect(warning.level).toBe('warning');
      expect(warning.fingerprint).toEqual(['calculator-anomaly', stage, 'non_finite_value']);
      for (const event of [warning, typeError, rangeError]) {
        expect(event.contexts?.calculator).toEqual({ stage });
        expect(event.request?.url).toBe('https://payetax.test/');
        expect(event.extra).toBeUndefined();
        expect(event.user).toBeUndefined();
      }
      for (const event of [typeError, rangeError]) {
        expect(event.level).toBe('error');
        expect(event.fingerprint).toBeUndefined();
        expect(event.exception?.values?.[0].stacktrace?.frames?.length).toBeGreaterThan(0);
      }
      const typeException = typeError.exception?.values?.[0];
      const rangeException = rangeError.exception?.values?.[0];
      expect(typeException?.type).toBe('TypeError');
      expect(rangeException?.type).toBe('RangeError');
      expect(
        typeException?.stacktrace?.frames?.some((frame) => frame.function?.includes('typeFailure')),
      ).toBe(true);
      expect(
        rangeException?.stacktrace?.frames?.some((frame) =>
          frame.function?.includes('rangeFailure'),
        ),
      ).toBe(true);
      expect(typeException?.stacktrace).not.toEqual(rangeException?.stacktrace);
    },
  );

  it('sorts/deduplicates all existing codes and rejects unsupported grouping data', async () => {
    const codes = [
      'non_finite_value',
      'negative_net_pay',
      'negative_component',
      'invalid_effective_rate',
    ];
    const unsupported = [
      'FIELD_CANARY',
      'MESSAGE_CANARY',
      'HASH_CANARY',
      73123.47,
      { code: 'non_finite_value' },
      null,
    ];
    captureCalculatorAnomaly({ stage: 'primary' }, [...codes, ...codes, ...unsupported]);
    captureCalculatorAnomaly({ stage: 'primary' }, codes.toReversed());
    expect(captureCalculatorAnomaly({ stage: 'what_if' }, unsupported)).toBeUndefined();
    expect(captureCalculatorAnomaly({ stage: 'previous_year' }, [])).toBeUndefined();
    expect(captureCalculatorAnomaly({ stage: '73123.47' } as never, codes)).toBeUndefined();
    await Sentry.flush(1000);

    expect(events()).toHaveLength(2);
    for (const event of events()) {
      expect(event.fingerprint).toEqual([
        'calculator-anomaly',
        'primary',
        'invalid_effective_rate,negative_component,negative_net_pay,non_finite_value',
      ]);
    }
  });

  it('routes actual primary, previous-year and what-if anomalies to warning groups without changing results', async () => {
    const result = {
      grossSalary: { annually: 73123.47 },
      netPay: { annually: -1 },
      incomeTax: { annually: Number.NaN },
      employerNI: -1,
    } as ReturnType<typeof calculateTax>;
    mockCalculateTax.mockReturnValue(result);
    store.getState().setSalary(73123.47);
    store.getState().setTaxYear('2026-2027');
    store.getState().calculate();
    store.getState().calculatePreviousYear();
    store.getState().calculateWhatIf();
    await Sentry.flush(1000);

    expect(mockCalculateTax).toHaveBeenCalledTimes(3);
    expect(store.getState().results).toBe(result);
    expect(store.getState().previousYearResults).toBe(result);
    expect(store.getState().whatIfResults).toBe(result);
    expect(events()).toHaveLength(3);
    expect(events().map((event) => event.fingerprint)).toEqual(
      stages.map((stage) => [
        'calculator-anomaly',
        stage,
        'invalid_effective_rate,negative_component,negative_net_pay,non_finite_value',
      ]),
    );
    expect(events().map((event) => event.level)).toEqual(['warning', 'warning', 'warning']);
  });
});
