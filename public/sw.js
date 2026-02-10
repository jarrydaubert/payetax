// Service Worker for PayeTax - UK PAYE Tax Calculator
// Optimized for 2025 PWA best practices

const CACHE_NAME = 'payetax-v5.0.2';
const STATIC_CACHE_NAME = 'payetax-static-v5.0.2';
const API_CACHE_NAME = 'payetax-api-v5.0.2';

// Max entries per cache (cheaper than size-based eviction)
const MAX_CACHE_ENTRIES = 100;
const MAX_STATIC_ENTRIES = 200;

const isDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';
const devLog = (...args) => {
  if (isDev) console.log('[SW]', ...args);
};

// Assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
];

// API endpoints with special caching
const API_ENDPOINTS = ['/api/feedback'];

// Network-first resources
const NETWORK_FIRST = ['/blog/category/', '/_next/static/chunks/'];

// Cache-first resources (static assets)
const CACHE_FIRST = [
  '/images/',
  '/icons/',
  '/_next/static/',
  '/favicon',
  '.woff2',
  '.woff',
  '.ttf',
  '.css',
  '.js',
];

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  devLog(`Installing service worker ${CACHE_NAME}`);

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(STATIC_CACHE_NAME);
        devLog('Precaching core assets');
        await cache.addAll(PRECACHE_ASSETS);
        devLog('Precache complete');
        // Note: NOT calling skipWaiting() - let user control when to activate via prompt
      } catch (error) {
        devLog('Precache failed:', error);
      }
    })(),
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  devLog(`Activating service worker ${CACHE_NAME}`);

  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      const currentCaches = [CACHE_NAME, STATIC_CACHE_NAME, API_CACHE_NAME];

      const oldCaches = cacheNames.filter(
        (name) => name.startsWith('payetax-') && !currentCaches.includes(name),
      );

      await Promise.all(
        oldCaches.map((cacheName) => {
          devLog('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        }),
      );

      devLog(`Cleaned up ${oldCaches.length} old cache(s)`);

      // Enable navigation preload
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
        devLog('Navigation preload enabled');
      }

      // Note: NOT calling clients.claim() - new SW waits until user accepts update
      devLog('Service worker activated');
    })(),
  );
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;

  if (method !== 'GET') return;
  if (!url.startsWith('http')) return;

  // Skip analytics/tracking domains
  const skipDomains = [
    'googletagmanager.com',
    'google-analytics.com',
    'va.vercel-scripts.com',
    'vercel-insights.com',
    'analytics.ahrefs.com',
  ];

  if (skipDomains.some((domain) => url.includes(domain))) return;

  // Navigation with preload
  if (request.mode === 'navigate' && event.preloadResponse) {
    event.respondWith(handleNavigationWithPreload(request, event));
    return;
  }

  // Determine strategy - check API first (before network-first which includes /api/)
  if (isAPIEndpoint(url)) {
    event.respondWith(apiCacheStrategy(request));
  } else if (shouldUseNetworkFirst(url)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (shouldUseCacheFirst(url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Navigation with preload
async function handleNavigationWithPreload(request, event) {
  try {
    const preloadResponse = await event.preloadResponse;

    if (preloadResponse) {
      devLog('Using navigation preload for:', request.url);
      const responseToCache = preloadResponse.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
      return preloadResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    devLog('Navigation failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || caches.match('/');
  }
}

// Network-first strategy
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      enforceMaxEntries(CACHE_NAME, MAX_CACHE_ENTRIES);
    }
    return networkResponse;
  } catch (error) {
    devLog('Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    if (request.mode === 'navigate') return caches.match('/');
    throw error;
  }
}

// Cache-first strategy
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      enforceMaxEntries(STATIC_CACHE_NAME, MAX_STATIC_ENTRIES);
    }
    return networkResponse;
  } catch (error) {
    devLog('Cache-first failed:', error);
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
        enforceMaxEntries(CACHE_NAME, MAX_CACHE_ENTRIES);
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// API caching strategy
async function apiCacheStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    throw error;
  }
}

// Enforce max entries (cheap eviction - no blob reading)
async function enforceMaxEntries(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length > maxEntries) {
      // Delete oldest entries (first in cache)
      const toDelete = keys.slice(0, keys.length - maxEntries);
      await Promise.all(toDelete.map((key) => cache.delete(key)));
      devLog(`Evicted ${toDelete.length} entries from ${cacheName}`);
    }
  } catch (error) {
    devLog('Cache eviction failed:', error);
  }
}

// Helper functions
function shouldUseNetworkFirst(url) {
  return NETWORK_FIRST.some((pattern) =>
    typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url),
  );
}

function shouldUseCacheFirst(url) {
  return CACHE_FIRST.some((pattern) =>
    typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url),
  );
}

function isAPIEndpoint(url) {
  return API_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

// Background sync for offline submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'feedback-sync') {
    event.waitUntil(syncFeedback());
  }
});

async function syncFeedback() {
  devLog('Syncing offline feedback submissions');
  // Implementation would go here
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const options = {
    body: event.data.text(),
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    vibrate: [200, 100, 200],
    data: { url: '/' },
  };

  event.waitUntil(self.registration.showNotification('PayeTax Tax Calculator', options));
});

// Notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      const client = clients.find((c) => c.url === targetUrl && 'focus' in c);
      if (client) return client.focus();
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    }),
  );
});

// Periodic background sync (experimental - progressive enhancement)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-cache') {
    event.waitUntil(updateCriticalAssets());
  }
});

async function updateCriticalAssets() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const criticalPages = ['/', '/blog'];

    await Promise.all(
      criticalPages.map(async (page) => {
        try {
          const response = await fetch(page);
          if (response.ok) await cache.put(page, response);
        } catch (error) {
          devLog('Failed to update:', page);
        }
      }),
    );

    devLog('Critical assets updated');
  } catch (error) {
    devLog('Periodic sync failed:', error);
  }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  try {
    if (event.data?.type === 'GET_VERSION') {
      if (event.ports?.[0]) {
        event.ports[0].postMessage({ version: CACHE_NAME });
      }
    } else if (event.data?.type === 'SKIP_WAITING') {
      // User accepted update - now skip waiting
      self.skipWaiting();
    }
  } catch (err) {
    devLog('Message handling failed:', err);
  }
});

devLog(`Service Worker ${CACHE_NAME} loaded`);
