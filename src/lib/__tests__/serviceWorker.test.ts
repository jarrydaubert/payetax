/** @jest-environment node */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';

const ORIGIN = 'https://payetax.test';
const CURRENT = 'payetax-v5.1.4-pwa1';
const STATIC = 'payetax-static-v5.1.4-pwa1';

function workerHarness() {
  const listeners = new Map<string, (event: unknown) => void>();
  const stores = new Map<string, Map<string, Response>>();
  const key = (request: Request | string) => (typeof request === 'string' ? request : request.url);
  const addAll = jest.fn((requests: Request[]) => {
    for (const request of requests) {
      stores
        .get(STATIC)
        ?.set(
          request.url,
          new Response(
            '<script src="/_next/static/offline.js"></script><link href="/_next/static/offline.css" rel="stylesheet">',
          ),
        );
    }
    return Promise.resolve();
  });
  const put = jest.fn((name: string, request: Request, response: Response) => {
    stores.get(name)?.set(key(request), response);
    return Promise.resolve();
  });
  const caches = {
    open: jest.fn((name: string) => {
      if (!stores.has(name)) stores.set(name, new Map());
      return Promise.resolve({
        addAll,
        match: async (request: Request | string) => stores.get(name)?.get(key(request))?.clone(),
        put: (request: Request, response: Response) => put(name, request, response),
        keys: async () => [...(stores.get(name)?.keys() ?? [])],
        delete: async (request: string) => stores.get(name)?.delete(request),
      });
    }),
    keys: async () => [...stores.keys()],
    delete: jest.fn(async (name: string) => stores.delete(name)),
  };
  const fetch = jest
    .fn()
    .mockResolvedValue(new Response('fresh', { headers: { 'Content-Type': 'text/html' } }));
  const skipWaiting = jest.fn();
  const claim = jest.fn();
  const preload = jest.fn().mockResolvedValue(undefined);
  runInNewContext(readFileSync(join(process.cwd(), 'public/sw.js'), 'utf8'), {
    self: {
      location: new URL(ORIGIN),
      registration: { navigationPreload: { enable: preload } },
      clients: { claim },
      skipWaiting,
      addEventListener: (type: string, listener: (event: unknown) => void) =>
        listeners.set(type, listener),
    },
    caches,
    fetch,
    URL,
    Request,
    Response,
  });

  async function dispatch(type: string, init: Record<string, unknown> = {}) {
    const pending: Promise<unknown>[] = [];
    let response: Promise<Response> | undefined;
    listeners.get(type)?.({
      ...init,
      waitUntil: (promise: Promise<unknown>) => pending.push(promise),
      respondWith: (promise: Promise<Response>) => {
        response = promise;
      },
    });
    const result = await response;
    await Promise.all(pending);
    return result;
  }

  function seed(name: string, path: string, body = 'cached') {
    if (!stores.has(name)) stores.set(name, new Map());
    stores.get(name)?.set(new URL(path, ORIGIN).href, new Response(body));
  }

  function request(path: string, init: RequestInit = {}) {
    return new Request(new URL(path, ORIGIN), init);
  }

  function navigate(path: string, preloadResponse?: Promise<Response | undefined>) {
    const req = request(path);
    Object.defineProperty(req, 'mode', { value: 'navigate' });
    return dispatch('fetch', { request: req, preloadResponse });
  }

  return {
    dispatch,
    navigate,
    request,
    seed,
    stores,
    caches,
    fetch,
    put,
    addAll,
    skipWaiting,
    claim,
    preload,
  };
}

describe('service worker cache and upgrade safety', () => {
  it('keeps a v5.1.4 worker and its caches intact while preparing an isolated offline shell', async () => {
    const h = workerHarness();
    h.seed('payetax-static-v5.1.4', '/', 'legacy');
    await h.dispatch('install');
    const requests = h.addAll.mock.calls[0][0] as Request[];
    expect(requests.map((r) => new URL(r.url).pathname)).toEqual(
      expect.arrayContaining(['/', '/offline']),
    );
    expect(requests.every((r) => r.cache === 'reload')).toBe(true);
    expect(h.addAll.mock.calls[1][0].map((r) => new URL(r.url).pathname)).toEqual([
      '/_next/static/offline.js',
      '/_next/static/offline.css',
    ]);
    expect(h.addAll.mock.calls[1][0].every((r) => r.cache === 'default')).toBe(true);
    expect(h.stores.get('payetax-static-v5.1.4')?.get(`${ORIGIN}/`)).toBeDefined();
    expect(h.caches.delete).not.toHaveBeenCalled();
    expect(h.skipWaiting).not.toHaveBeenCalled();
  });

  it('refreshes shell documents but reuses immutable assets already in the isolated shell', async () => {
    const h = workerHarness();
    h.seed(STATIC, '/_next/static/offline.js', 'immutable script');
    await h.dispatch('install');
    expect(h.addAll.mock.calls[0][0].every((r) => r.cache === 'reload')).toBe(true);
    expect(h.addAll.mock.calls[1][0].map((r) => new URL(r.url).pathname)).toEqual([
      '/_next/static/offline.css',
    ]);
    expect(await h.stores.get(STATIC)?.get(`${ORIGIN}/_next/static/offline.js`)?.text()).toBe(
      'immutable script',
    );
  });

  it('rejects a failed precache so the working legacy worker is retained', async () => {
    const h = workerHarness();
    h.addAll.mockRejectedValue(new Error('offline shell unavailable'));
    await expect(h.dispatch('install')).rejects.toThrow('offline shell unavailable');
    expect(h.caches.delete).not.toHaveBeenCalled();
  });

  it('also rejects installation when an offline page bundle is unavailable', async () => {
    const h = workerHarness();
    h.addAll
      .mockImplementationOnce((requests) => {
        for (const request of requests)
          h.seed(STATIC, request.url, '<script src="/_next/static/missing.js"></script>');
        return Promise.resolve();
      })
      .mockRejectedValueOnce(new Error('bundle unavailable'));
    await expect(h.dispatch('install')).rejects.toThrow('bundle unavailable');
    expect(h.caches.delete).not.toHaveBeenCalled();
    expect(h.skipWaiting).not.toHaveBeenCalled();
  });

  it('ignores legacy SKIP_WAITING messages even when a cached standalone script requests activation', async () => {
    const h = workerHarness();
    await h.dispatch('message', { data: { type: 'SKIP_WAITING' } });
    expect(h.skipWaiting).not.toHaveBeenCalled();
    expect(h.claim).not.toHaveBeenCalled();
  });

  it('cleans only obsolete PayeTax caches on natural activation without claiming open pages', async () => {
    const h = workerHarness();
    for (const name of [
      'payetax-v5.1.4',
      'payetax-static-v5.1.4',
      'payetax-api-v5.1.4',
      CURRENT,
      STATIC,
      'other-app',
    ])
      h.seed(name, '/');
    h.preload.mockRejectedValue(new Error('unsupported'));
    await h.dispatch('activate');
    expect([...h.stores.keys()]).toEqual([CURRENT, STATIC, 'other-app']);
    expect(h.claim).not.toHaveBeenCalled();
  });

  it.each([
    '/api',
    '/api/tax-rates',
    '/api/build-info?fresh=1',
    '/?x=1&_rsc=abc',
    '/monitoring',
    '/blog/example',
    '/images/a.js',
  ])('does not intercept dynamic or non-allowlisted requests: %s', async (path) => {
    const h = workerHarness();
    expect(await h.dispatch('fetch', { request: h.request(path) })).toBeUndefined();
    expect(h.fetch).not.toHaveBeenCalled();
    expect(h.caches.open).not.toHaveBeenCalled();
  });

  it.each([
    'RSC',
    'Next-Router-Prefetch',
    'Next-Router-State-Tree',
  ])('bypasses Next requests identified by the %s header', async (header) => {
    const h = workerHarness();
    expect(
      await h.dispatch('fetch', { request: h.request('/', { headers: { [header]: '1' } }) }),
    ).toBeUndefined();
  });

  it.each([
    '/sw.js',
    '/register-sw.js?revision=2',
    '/manifest.json',
  ])('fetches %s without using either cache layer', async (path) => {
    const h = workerHarness();
    h.seed('payetax-static-v5.1.4', path, 'stale bootstrap');
    const req = h.request(path);
    expect(await (await h.dispatch('fetch', { request: req }))?.text()).toBe('fresh');
    expect(h.fetch).toHaveBeenCalledWith(req, { cache: 'no-store' });
    expect(h.caches.open).not.toHaveBeenCalled();
  });

  it('uses the network for navigation even without preload, rather than returning a stale session', async () => {
    const h = workerHarness();
    h.seed(CURRENT, '/', 'stale');
    expect(await (await h.navigate('/'))?.text()).toBe('fresh');
    expect(await h.stores.get(CURRENT)?.get(`${ORIGIN}/`)?.text()).toBe('fresh');
  });

  it('uses successful navigation preload without issuing a duplicate fetch', async () => {
    const h = workerHarness();
    expect(
      await (
        await h.navigate(
          '/',
          Promise.resolve(new Response('preloaded', { headers: { 'Content-Type': 'text/html' } })),
        )
      )?.text(),
    ).toBe('preloaded');
    expect(h.fetch).not.toHaveBeenCalled();
  });

  it.each([
    'reject',
    'absent',
  ])('keeps offline root launch parameters and dedicated fallback working with %s preload', async (preload) => {
    const h = workerHarness();
    h.seed('payetax-static-v5.1.4', '/', 'legacy must not win');
    h.seed(STATIC, '/', 'offline calculator');
    h.seed(STATIC, '/offline', 'offline page');
    h.fetch.mockRejectedValue(new Error('offline'));
    const preloadResponse =
      preload === 'reject' ? Promise.reject(new Error('offline preload')) : undefined;
    expect(await (await h.navigate('/?source=pwa', preloadResponse))?.text()).toBe(
      'offline calculator',
    );
    expect(await (await h.navigate('/unvisited'))?.text()).toBe('offline page');
    h.seed(CURRENT, '/tools', 'visited tool');
    expect(await (await h.navigate('/tools'))?.text()).toBe('visited tool');
  });

  it('never falls back to mixed legacy caches', async () => {
    const h = workerHarness();
    h.seed('payetax-static-v5.1.4', '/', 'legacy');
    h.fetch.mockRejectedValue(new Error('offline'));
    expect((await h.navigate('/'))?.type).toBe('error');
  });

  it.each<ResponseInit>([
    { status: 404 },
    { status: 500 },
    { headers: { 'Content-Type': 'text/x-component' } },
    { headers: { 'Content-Type': 'text/html', 'Cache-Control': 'private, no-store' } },
  ])('does not cache failed, Flight or private responses: %j', async (init) => {
    const h = workerHarness();
    h.fetch.mockResolvedValue(new Response('network', init));
    expect(await (await h.navigate('/'))?.text()).toBe('network');
    expect(h.put).not.toHaveBeenCalled();
  });

  it('serves cached immutable chunks offline without searching legacy stores', async () => {
    const h = workerHarness();
    h.seed('payetax-static-v5.1.4', '/_next/static/chunks/hash.js', 'legacy');
    h.seed(STATIC, '/_next/static/chunks/hash.js', 'current chunk');
    expect(
      await (
        await h.dispatch('fetch', { request: h.request('/_next/static/chunks/hash.js') })
      )?.text(),
    ).toBe('current chunk');
    expect(h.fetch).not.toHaveBeenCalled();
  });

  it('keeps successful network navigation usable when cache writes fail', async () => {
    const h = workerHarness();
    h.put.mockRejectedValue(new Error('quota exceeded'));
    expect(await (await h.navigate('/'))?.text()).toBe('fresh');
  });

  it('caps runtime assets without evicting the precached offline shell or its bundles', async () => {
    const h = workerHarness();
    h.seed(STATIC, '/offline', 'offline page');
    h.seed(STATIC, '/_next/static/offline.js', 'offline script');
    for (let i = 0; i < 200; i++) h.seed(`${STATIC}-runtime`, `/_next/static/chunk-${i}.js`);
    await h.dispatch('fetch', { request: h.request('/_next/static/new.js') });
    expect(h.stores.get(`${STATIC}-runtime`)?.size).toBe(200);
    expect(h.stores.get(`${STATIC}-runtime`)?.has(`${ORIGIN}/_next/static/chunk-0.js`)).toBe(false);
    expect(h.stores.get(STATIC)?.size).toBe(2);
  });

  it('loads online static assets even when cache reads are unavailable', async () => {
    const h = workerHarness();
    h.caches.open.mockRejectedValue(new Error('storage disabled'));
    expect(
      await (await h.dispatch('fetch', { request: h.request('/_next/static/new.js') }))?.text(),
    ).toBe('fresh');
  });
});
