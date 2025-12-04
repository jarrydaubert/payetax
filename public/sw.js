// Enhanced Service Worker for PayeTax - UK PAYE Tax Calculator
// Optimized for 2025 PWA best practices with advanced caching strategies

const CACHE_NAME = 'payetax-v4.9.4';
const STATIC_CACHE_NAME = 'payetax-static-v4.9.4';
const API_CACHE_NAME = 'payetax-api-v4.9.4';

// Helper function to log only in development
const isDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';
const devLog = (...args) => {
  if (isDev) {
    console.log('[SW]', ...args);
  }
};

// Assets to cache immediately on install
// Only truly critical static assets (not frequently changing pages)
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  // Note: /blog, /about, /privacy, /compliance are cached on first visit (stale-while-revalidate)
  // This keeps precache small and fast
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
  devLog(`[SW] Installing service worker ${CACHE_NAME}`);

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        devLog('[SW] Precaching core assets');
        await cache.addAll(PRECACHE_ASSETS);
        devLog('[SW] Precache complete');

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
  devLog(`Activating service worker ${CACHE_NAME}`);

  event.waitUntil(
    (async () => {
      // Clean up old caches (keep only current version caches)
      const cacheNames = await caches.keys();
      const currentCaches = [CACHE_NAME, STATIC_CACHE_NAME, API_CACHE_NAME];

      const oldCaches = cacheNames.filter(
        (name) => name.startsWith('payetax-') && !currentCaches.includes(name)
      );

      await Promise.all(
        oldCaches.map((cacheName) => {
          devLog('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );

      devLog(`Cleaned up ${oldCaches.length} old cache(s)`);

      // Enable navigation preload for faster perceived load
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
        devLog('Navigation preload enabled');
      }

      // Enforce cache size limits (prevent iOS quota issues)
      await enforceMaxCacheSize(CACHE_NAME, 50 * 1024 * 1024); // 50 MB
      await enforceMaxCacheSize(STATIC_CACHE_NAME, 25 * 1024 * 1024); // 25 MB

      // Take control of all open clients
      await self.clients.claim();
      devLog('Service worker activated and controlling all clients');
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
    'analytics.ahrefs.com', // Ahrefs analytics
  ];

  if (skipDomains.some((domain) => url.includes(domain))) {
    // Let browser handle these requests normally without SW intervention
    return;
  }

  // Determine caching strategy based on URL
  if (shouldUseNetworkFirst(url)) {
    event.respondWith(networkFirstStrategy(request, event));
  } else if (shouldUseCacheFirst(url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else if (isAPIEndpoint(url)) {
    event.respondWith(apiCacheStrategy(request));
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Network-first strategy (for dynamic content)
async function networkFirstStrategy(request, event) {
  try {
    // Try to use navigation preload if available (faster perceived load)
    // FIXED: Properly handle preloadResponse to prevent cancellation warning
    const preloadResponse = event?.preloadResponse ? await event.preloadResponse : null;

    if (preloadResponse) {
      devLog('Using navigation preload for:', request.url);

      // Cache the preloaded response asynchronously (don't block return)
      // Using event.waitUntil ensures the cache operation completes even after response is returned
      event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, preloadResponse.clone());
        })
      );

      return preloadResponse;
    }

    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    devLog('Network failed, trying cache:', request.url);
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
      devLog('[SW] Network request failed:', error);
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

// Cache size management - prevent quota issues on iOS
async function enforceMaxCacheSize(cacheName, maxSize) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    let totalSize = 0;
    const entries = [];

    // Calculate total size and collect entries with timestamps
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        const size = blob.size;
        totalSize += size;

        // Get last-modified or use current time
        const lastModified = response.headers.get('last-modified')
          ? new Date(response.headers.get('last-modified')).getTime()
          : Date.now();

        entries.push({ request, size, lastModified });
      }
    }

    // If over limit, delete oldest entries
    if (totalSize > maxSize) {
      // Sort by oldest first
      entries.sort((a, b) => a.lastModified - b.lastModified);

      let deletedSize = 0;
      for (const entry of entries) {
        if (totalSize - deletedSize <= maxSize) break;

        await cache.delete(entry.request);
        deletedSize += entry.size;
        devLog(`Deleted ${entry.request.url} (${(entry.size / 1024).toFixed(1)} KB)`);
      }

      devLog(
        `Cache cleanup: removed ${(deletedSize / 1024 / 1024).toFixed(1)} MB from ${cacheName}`
      );
    }
  } catch (error) {
    devLog('Cache size enforcement failed:', error);
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
    devLog('[SW] Syncing offline feedback submissions');
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
          devLog('[SW] Failed to update page:', page, error);
        }
      })
    );

    devLog('[SW] Critical assets updated');
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

// Log service worker load (dev only via devLog helper)
devLog(`[SW] Service Worker ${CACHE_NAME} loaded successfully`);
