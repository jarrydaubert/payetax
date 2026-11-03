/** @jest-environment node */
import * as Sentry from '@sentry/nextjs';
import type { Instrumentation } from 'next';
import { onRequestError, register } from '@/instrumentation';

const mockSetTag = jest.fn();
const mockNodeInit = jest.fn();
const mockEdgeInit = jest.fn();

jest.mock('@sentry/nextjs', () => ({
  captureRequestError: jest.fn(),
  withScope: jest.fn((callback) => callback({ setTag: mockSetTag, setContext: jest.fn() })),
}));
jest.mock('../../../sentry.server.config', () => {
  mockNodeInit();
  return {};
});
jest.mock('../../../sentry.edge.config', () => {
  mockEdgeInit();
  return {};
});

const context: Parameters<Instrumentation.onRequestError>[2] = {
  routerKind: 'App Router',
  routePath: '/tools/[slug]',
  routeType: 'render',
  revalidateReason: undefined,
};

afterEach(() => jest.restoreAllMocks());

describe('Next.js instrumentation', () => {
  it.each(['nodejs', 'edge'])('loads only the %s configuration', async (runtime) => {
    jest.resetModules();
    jest.replaceProperty(process, 'env', { ...process.env, NEXT_RUNTIME: runtime });
    const instrumentation = await import('@/instrumentation');
    await instrumentation.register();
    expect(mockNodeInit).toHaveBeenCalledTimes(runtime === 'nodejs' ? 1 : 0);
    expect(mockEdgeInit).toHaveBeenCalledTimes(runtime === 'edge' ? 1 : 0);
  });

  it('does not load the browser entrypoint from the server hook', async () => {
    jest.replaceProperty(process, 'env', { ...process.env, NEXT_RUNTIME: 'browser' });
    await expect(register()).resolves.toBeUndefined();
    expect(mockNodeInit).not.toHaveBeenCalled();
    expect(mockEdgeInit).not.toHaveBeenCalled();
  });

  it.each([
    '/',
    '/tools/pension-calculator',
    '/blog/example',
    '/api/send-results',
    '/api/send-director-results',
  ])('forwards monitored %s errors to the SDK handler', async (path) => {
    const error = new Error('Synthetic instrumentation check');
    const request = { path: `${path}?salary=73123`, method: 'GET', headers: {} };
    await onRequestError(error, request, context);
    expect(mockSetTag).toHaveBeenCalledWith('request_path', path);
    expect(mockSetTag).toHaveBeenCalledWith('router_kind', 'App Router');
    expect(Sentry.captureRequestError).toHaveBeenCalledWith(error, { ...request, path }, context);
  });

  it.each(['/privacy', '/api/ops/rate-limit-health', '/monitoring'])(
    'drops unmonitored %s errors before the SDK',
    async (path) => {
      await onRequestError(
        new Error('Synthetic unmonitored check'),
        { path, method: 'GET', headers: {} },
        context,
      );
      expect(Sentry.captureRequestError).not.toHaveBeenCalled();
      expect(Sentry.withScope).not.toHaveBeenCalled();
    },
  );
});
