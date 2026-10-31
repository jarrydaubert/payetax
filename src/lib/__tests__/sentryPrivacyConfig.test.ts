/** @jest-environment-options {"url":"https://payetax.test/"} */
import type { ErrorEvent } from '@sentry/nextjs';
import { setNodeEnv } from '@/test/env';

jest.mock('@sentry/nextjs', () => ({
  init: jest.fn(),
  breadcrumbsIntegration: jest.fn(() => ({ name: 'Breadcrumbs' })),
}));

describe('instrumentation-client console breadcrumbs', () => {
  afterEach(() => setNodeEnv('test'));

  it('removes the Console integration in production', () => {
    jest.resetModules();
    setNodeEnv('production');
    const sentry = require('@sentry/nextjs');
    require('../../../instrumentation-client');
    const { integrations } = sentry.init.mock.calls[0][0];
    const defaults = [{ name: 'Console' }, { name: 'Breadcrumbs' }, { name: 'GlobalHandlers' }];
    const names = integrations(defaults).map((integration: { name: string }) => integration.name);
    expect(names).not.toContain('Console');
    expect(names).toEqual(expect.arrayContaining(['Breadcrumbs', 'GlobalHandlers']));
    expect(sentry.breadcrumbsIntegration).toHaveBeenCalledWith(
      expect.objectContaining({ dom: false }),
    );
  });
});

describe.each(['instrumentation-client', 'sentry.server.config', 'sentry.edge.config'])(
  '%s privacy hooks',
  (name) => {
    afterEach(() => setNodeEnv('test'));

    it('wires sanitisation into the SDK without dropping an actionable error', async () => {
      jest.resetModules();
      setNodeEnv('production');
      const sentry = require('@sentry/nextjs');
      require(`../../../${name}`);
      const options = sentry.init.mock.calls[0][0];
      const event: ErrorEvent = {
        type: undefined,
        request: { url: 'https://payetax.test/?salary=73123', data: { input: { salary: 73123 } } },
        contexts: {
          calculator_input: { salaryRange: '73123' },
          calculator: { stage: 'primary' },
          error_details: { digest: 'next-42' },
        },
        tags: {
          has_pension: true,
          region: '73123',
          error_boundary: 'tools',
          router_kind: 'App Router',
          request_path: '/tools?salary=73123',
        },
        breadcrumbs: [{ category: 'navigation', data: { from: '/?salary=73123', to: '/#73123' } }],
        exception: { values: [{ type: 'TypeError', value: 'Calculation failed' }] },
      };
      const result = await options.beforeSend(event, {
        originalException: new Error('Calculation failed'),
      });
      expect(result).not.toBeNull();
      expect(JSON.stringify(result)).not.toContain('73123');
      expect(result.exception.values[0].value).toBe('Calculation failed');
      expect(result.contexts.calculator).toEqual({ stage: 'primary' });
      expect(result.contexts.error_details).toEqual({ digest: 'next-42' });
      expect(result.tags).toEqual({
        error_boundary: 'tools',
        router_kind: 'App Router',
        request_path: '/tools',
      });
      expect(options.dataCollection).toEqual(
        expect.objectContaining({
          userInfo: false,
          cookies: false,
          httpBodies: [],
          databaseQueryData: false,
          genAI: { inputs: false, outputs: false },
          graphQL: { document: false, variables: false },
        }),
      );
      expect(options.attachStacktrace).toBe(false);
      expect(options.tracesSampleRate).toBe(0);
      expect(
        options.beforeBreadcrumb({
          category: 'fetch',
          data: { url: '/api/send-results?email=73123' },
        }),
      ).toEqual({
        category: 'fetch',
        data: { url: '/api/send-results' },
      });
    });
  },
);
