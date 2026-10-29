// Offline support. This namespace isolates the upgrade from v5.1.4's mixed caches.
// It is a cache schema revision, not proof of the running production build.
// Future build SHAs must not automatically rename caches; revise the schema only
// when cache compatibility or invalidation requirements need it.
const CACHE_NAME = 'payetax-v5.1.4-pwa1';
const STATIC_CACHE_NAME = 'payetax-static-v5.1.4-pwa1';
const STATIC_RUNTIME_CACHE_NAME = `${STATIC_CACHE_NAME}-runtime`;
const MAX_CACHE_ENTRIES = 100;
const MAX_STATIC_ENTRIES = 200;
const OFFLINE_FALLBACK_URL = '/offline';

const PRECACHE_ASSETS = [
  '/',
  OFFLINE_FALLBACK_URL,
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-maskable-192x192.png',
  '/android-chrome-512x512.png',
  '/android-chrome-maskable-512x512.png',
  '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  // Reject installation if the offline shell cannot be prepared; keep the old worker.
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(async (cache) => {
      await cache.addAll(
        PRECACHE_ASSETS.map(
          (path) => new Request(new URL(path, self.location.origin), { cache: 'reload' }),
        ),
      );
      // Next documents need their scripts/styles offline too. Keep the shell and
      // its bundles outside the evictable runtime cache so the fallback can hydrate.
      const assets = new Set();
      for (const path of ['/', OFFLINE_FALLBACK_URL]) {
        const page = await cache.match(new URL(path, self.location.origin).href);
        if (!page) throw new Error('Offline shell missing');
        for (const match of (await page.text()).matchAll(
          /(?:src|href)=["'](\/_next\/static\/[^"'<>]+)["']/g,
        )) {
          assets.add(match[1].replaceAll('&amp;', '&'));
        }
      }
      const missing = [];
      for (const path of assets) {
        // Hashed Next assets are immutable: reuse this shell or the HTTP cache.
        const request = new Request(new URL(path, self.location.origin));
        if (!(await cache.match(request))) missing.push(request);
      }
      await cache.addAll(missing);
    }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(
            (name) =>
              name.startsWith('payetax-') &&
              ![CACHE_NAME, STATIC_CACHE_NAME, STATIC_RUNTIME_CACHE_NAME].includes(name),
          )
          .map((name) => caches.delete(name)),
      );
      try {
        await self.registration.navigationPreload?.enable();
      } catch {
        // Navigation also works without preload.
      }
      // No clients.claim(): an open page keeps its current controller and inputs.
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Bootstrap files must escape both Cache Storage and the browser HTTP cache.
  if (['/sw.js', '/register-sw.js', '/manifest.json'].includes(url.pathname)) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  // APIs and Next's Flight/prefetch responses are never offline documents.
  if (
    url.pathname === '/api' ||
    url.pathname.startsWith('/api/') ||
    url.searchParams.has('_rsc') ||
    ['RSC', 'Next-Router-Prefetch', 'Next-Router-State-Tree'].some((name) =>
      request.headers.has(name),
    )
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event));
  } else if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(handleStatic(event));
  } else if (
    PRECACHE_ASSETS.includes(url.pathname) &&
    url.pathname !== '/' &&
    url.pathname !== OFFLINE_FALLBACK_URL
  ) {
    event.respondWith(handleStatic(event));
  }
  // Everything else uses the browser's normal network behaviour.
});

async function matchCurrentCaches(request) {
  for (const name of [CACHE_NAME, STATIC_CACHE_NAME]) {
    const cache = await caches.open(name);
    const response = await cache.match(request);
    if (response) return response;
  }
}

function cacheResponse(event, cacheName, response, maxEntries) {
  if (
    !response.ok ||
    response.redirected ||
    /no-store|private/i.test(response.headers.get('Cache-Control') || '') ||
    response.headers.get('Content-Type')?.includes('text/x-component')
  ) {
    return;
  }
  const copy = response.clone();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      await cache.put(event.request, copy);
      const keys = await cache.keys();
      await Promise.all(
        keys.slice(0, Math.max(0, keys.length - maxEntries)).map((key) => cache.delete(key)),
      );
    })().catch(() => {
      // Quota/storage failure must not discard a successful network response.
    }),
  );
}

async function handleNavigation(event) {
  try {
    const response = (await event.preloadResponse) || (await fetch(event.request));
    if (response.headers.get('Content-Type')?.includes('text/html')) {
      cacheResponse(event, CACHE_NAME, response, MAX_CACHE_ENTRIES);
    }
    return response;
  } catch {
    const cached = await matchCurrentCaches(event.request);
    if (cached) return cached;
    if (new URL(event.request.url).pathname === '/') {
      const root = await matchCurrentCaches(new URL('/', self.location.origin).href);
      if (root) return root;
    }
    return (
      (await matchCurrentCaches(new URL(OFFLINE_FALLBACK_URL, self.location.origin).href)) ||
      Response.error()
    );
  }
}

async function handleStatic(event) {
  try {
    for (const name of [STATIC_CACHE_NAME, STATIC_RUNTIME_CACHE_NAME]) {
      const cache = await caches.open(name);
      const cached = await cache.match(event.request);
      if (cached) return cached;
    }
  } catch {
    // Disabled storage must not prevent loading an online asset.
  }
  const response = await fetch(event.request);
  cacheResponse(event, STATIC_RUNTIME_CACHE_NAME, response, MAX_STATIC_ENTRIES);
  return response;
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'GET_VERSION') {
    event.ports?.[0]?.postMessage({ version: CACHE_NAME });
  }
  // Deliberately ignore SKIP_WAITING, including messages from cached v5.1.4 pages.
  // Activate only after all old controlled windows close; never interrupt a calculation.
});
