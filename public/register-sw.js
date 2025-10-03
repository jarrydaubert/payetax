// Enhanced Service Worker Registration for PayeTax PWA
// Includes update notifications and offline capabilities

(() => {
  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service Worker not supported');
    return;
  }

  let registration;
  let isRefreshing = false;

  // Register service worker when page loads
  window.addEventListener('load', async () => {
    try {
      registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[PWA] Service Worker registered successfully');

      // Listen for updates
      registration.addEventListener('updatefound', handleUpdate);

      // Check for updates periodically (every hour when page is visible)
      if (document.visibilityState === 'visible') {
        setInterval(
          () => {
            if (document.visibilityState === 'visible') {
              registration.update();
            }
          },
          60 * 60 * 1000
        ); // 1 hour
      }

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', handleSWMessage);

      // Request notification permission for future features
      if ('Notification' in window && Notification.permission === 'default') {
        // Don't request immediately, wait for user interaction
        document.addEventListener('click', requestNotificationPermission, { once: true });
      }
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  });

  // Handle service worker updates
  function handleUpdate() {
    const newWorker = registration.installing;
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        showUpdateNotification();
      }
    });
  }

  // Show update notification to user
  function showUpdateNotification() {
    // Create a subtle notification
    const notification = document.createElement('div');
    notification.id = 'sw-update-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1f2937;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 300px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        border: 1px solid #374151;
      ">
        <div style="margin-bottom: 12px;">
          <strong>🚀 Update Available</strong>
        </div>
        <div style="margin-bottom: 12px; opacity: 0.9;">
          A new version of PayeTax is ready!
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="sw-update-btn" style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
          ">Update</button>
          <button id="sw-dismiss-btn" style="
            background: transparent;
            color: #9ca3af;
            border: 1px solid #4b5563;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          ">Later</button>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Handle update button click
    document.getElementById('sw-update-btn').addEventListener('click', () => {
      updateServiceWorker();
      notification.remove();
    });

    // Handle dismiss button click
    document.getElementById('sw-dismiss-btn').addEventListener('click', () => {
      notification.remove();
    });

    // Auto-dismiss after 30 seconds
    setTimeout(() => {
      if (document.getElementById('sw-update-notification')) {
        notification.remove();
      }
    }, 30000);
  }

  // Update service worker and refresh page
  function updateServiceWorker() {
    if (!registration || !registration.waiting) return;

    registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Prevent multiple refreshes
    if (isRefreshing) return;
    isRefreshing = true;

    // Listen for controlling service worker change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (isRefreshing) {
        window.location.reload();
      }
    });
  }

  // Handle messages from service worker
  function handleSWMessage(event) {
    const { data } = event;

    if (data?.type === 'VERSION_INFO') {
      console.log('[PWA] Service Worker version:', data.version);
    }
  }

  // Request notification permission (for future features)
  async function requestNotificationPermission() {
    if (!('Notification' in window)) return;

    try {
      const permission = await Notification.requestPermission();
      console.log('[PWA] Notification permission:', permission);
    } catch (error) {
      console.log('[PWA] Notification permission request failed:', error);
    }
  }

  // Handle offline/online status
  window.addEventListener('online', () => {
    console.log('[PWA] Back online');
    showConnectionStatus('online');
  });

  window.addEventListener('offline', () => {
    console.log('[PWA] Gone offline');
    showConnectionStatus('offline');
  });

  // Show connection status
  function showConnectionStatus(status) {
    const isOnline = status === 'online';
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${isOnline ? '#10b981' : '#f59e0b'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 10001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      ">
        ${isOnline ? '🌐 Back Online' : '📱 Offline Mode'}
      </div>
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Install prompt handling
  let _deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('[PWA] Install prompt triggered');
    e.preventDefault();
    _deferredPrompt = e;
    showInstallPrompt();
  });

  // Show install prompt (can be customized)
  function showInstallPrompt() {
    // For now, just log. Can be enhanced with custom UI
    console.log('[PWA] App can be installed');

    // Could show a custom install banner here
    // Example: createInstallBanner();
  }

  // Handle app installation
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App was installed');
    _deferredPrompt = null;

    // Track installation for analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install', {
        event_category: 'PWA',
        event_label: 'App Installed',
      });
    }
  });
})();
