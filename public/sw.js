// Enhanced Service Worker for PayeTax - UK PAYE Tax Calculator
// Optimized for 2025 PWA best practices with advanced caching strategies

const CACHE_NAME = 'payetax-v2025.1.0';
const STATIC_CACHE_NAME = 'payetax-static-v2025.1.0';
const API_CACHE_NAME = 'payetax-api-v2025.1.0';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  // Core pages
  '/blog',
  '/about',
  '/privacy',
  '/compliance',
  // Critical CSS and JS will be added dynamically
];

// Assets to cache on first access
const _CACHE_ON_NAVIGATE = [
  /^https:\/\/payetax\.co\.uk\/.*$/,
  /^https:\/\/fonts\.googleapis\.com\/.*$/,
  /^https:\/\/fonts\.gstatic\.com\/.*$/,
];

// API endpoints to cache with different strategies
const API_ENDPOINTS = ['/api/feedback', '/api/error-log'];

// Network-first resources (always try network first)
const NETWORK_FIRST = ['/api/', '/blog/category/', '/_next/static/chunks/'];

// Cache-first resources (serve from cache if available)
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
  console.log('[SW] Installing service worker v2025.1.0');

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[SW] Precaching core assets');
        await cache.addAll(PRECACHE_ASSETS);
        console.log('[SW] Precache complete');

        // Skip waiting to activate immediately
        await self.skipWaiting();
      } catch (error) {
        console.error('[SW] Precache failed:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v2025.1.0');

  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(
        (name) =>
          name.startsWith('toolhubx-') &&
          !['toolhubx-v2025.1.0', 'toolhubx-static-v2025.1.0', 'toolhubx-api-v2025.1.0'].includes(
            name
          )
      );

      await Promise.all(
        oldCaches.map((cacheName) => {
          console.log('[SW] Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );

      // Take control of all open clients
      await self.clients.claim();
      console.log('[SW] Service worker activated and controlling all clients');
    })()
  );
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;

  // Only handle GET requests
  if (method !== 'GET') return;

  // Skip non-HTTP(S) requests
  if (!url.startsWith('http')) return;

  // Skip external domains that have CSP restrictions
  const skipDomains = [
    'googletagmanager.com',
    'google-analytics.com',
    'buymeacoffee.com',
    'cdnjs.buymeacoffee.com',
    'bmac-cdn.nyc3.digitaloceanspaces.com',
    'va.vercel-scripts.com',
    'vercel-insights.com',
  ];

  if (skipDomains.some((domain) => url.includes(domain))) {
    // Let browser handle these requests normally without SW intervention
    return;
  }

  // Determine caching strategy based on URL
  if (shouldUseNetworkFirst(url)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (shouldUseCacheFirst(url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else if (isAPIEndpoint(url)) {
    event.respondWith(apiCacheStrategy(request));
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Network-first strategy (for dynamic content)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/');
    }

    throw error;
  }
}

// Cache-first strategy (for static assets)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first failed:', error);
    throw error;
  }
}

// Stale-while-revalidate strategy (for general content)
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('[SW] Network request failed:', error);
      return cachedResponse;
    });

  // Return cached response immediately, network response when available
  return cachedResponse || fetchPromise;
}

// API-specific caching strategy
async function apiCacheStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // For API requests, try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Helper functions to determine caching strategy
function shouldUseNetworkFirst(url) {
  return NETWORK_FIRST.some((pattern) => {
    if (typeof pattern === 'string') {
      return url.includes(pattern);
    }
    return pattern.test(url);
  });
}

function shouldUseCacheFirst(url) {
  return CACHE_FIRST.some((pattern) => {
    if (typeof pattern === 'string') {
      return url.includes(pattern);
    }
    return pattern.test(url);
  });
}

function isAPIEndpoint(url) {
  return API_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

// Handle background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'feedback-sync') {
    event.waitUntil(syncFeedback());
  }
});

// Background sync for feedback forms
async function syncFeedback() {
  try {
    // Get pending feedback from IndexedDB (would need to be implemented)
    console.log('[SW] Syncing offline feedback submissions');
    // Implementation would go here
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Handle push notifications (for future features)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const options = {
    body: event.data.text(),
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
    },
    actions: [
      {
        action: 'open-calculator',
        title: 'Open Calculator',
        icon: '/favicon-32x32.png',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification('PayeTax Tax Calculator', options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      // Check if the app is already open
      const client = clients.find((c) => c.url === targetUrl && 'focus' in c);

      if (client) {
        return client.focus();
      }

      // Open new window/tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Periodic background sync (for cache updates)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-cache') {
    event.waitUntil(updateCriticalAssets());
  }
});

// Update critical assets in background
async function updateCriticalAssets() {
  try {
    const cache = await caches.open(CACHE_NAME);

    // Update critical pages
    const criticalPages = ['/', '/blog'];
    await Promise.all(
      criticalPages.map(async (page) => {
        try {
          const response = await fetch(page);
          if (response.ok) {
            await cache.put(page, response);
          }
        } catch (error) {
          console.log('[SW] Failed to update page:', page, error);
        }
      })
    );

    console.log('[SW] Critical assets updated');
  } catch (error) {
    console.error('[SW] Periodic sync failed:', error);
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  } else if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker v2025.1.0 loaded successfully');
