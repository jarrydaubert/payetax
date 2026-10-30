(() => {
  // Skip SW on localhost (add ?pwa=1 to test locally if needed)
  if (
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    !window.location.search.includes('pwa=1')
  ) {
    return;
  }
  // Skip if SW not supported
  if (!('serviceWorker' in navigator)) {
    return;
  }
  const isDev = false;
  const isStandalonePwa =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  const log = (message, ...args) => {
    if (isDev) {
      console.log(`[PWA] ${message}`, ...args);
    }
  };
  let registration,
    refreshing = false;

  window.addEventListener('load', async () => {
    try {
      registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      log('Service Worker registered successfully');

      // Handle already-waiting worker (from previous session)
      if (registration.waiting && navigator.serviceWorker.controller) {
        handleWaitingUpdate();
      }

      registration.addEventListener('updatefound', handleUpdateFound);

      // Check for updates when tab becomes visible (browser handles 24h update checks)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && registration) {
          try {
            registration.update();
          } catch {
            // InvalidStateError can occur if registration is in invalid state
          }
        }
      });

      navigator.serviceWorker.addEventListener('message', handleMessage);

      // Note: Notification permission should be requested via explicit user action
      // (e.g., "Enable notifications" button), not on first click anywhere
    } catch {
      // SW registration can fail in incognito mode, with ad blockers, or privacy settings
    }
  });

  function handleUpdateFound() {
    const installingWorker = registration.installing;
    if (!installingWorker) return;
    installingWorker.addEventListener('statechange', () => {
      if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
        handleWaitingUpdate();
      }
    });
  }

  function handleWaitingUpdate() {
    if (isStandalonePwa) {
      // Installed iOS/Android PWAs should update automatically
      // to avoid users being stuck on old UI due hidden/deferred banners.
      triggerUpdate();
      return;
    }
    showUpdateBanner();
  }

  function showUpdateBanner() {
    // Prevent duplicate banners
    if (document.getElementById('sw-update-notification')) return;

    const container = document.createElement('div');
    container.id = 'sw-update-notification';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    container.innerHTML = `<div style="position:fixed;top:20px;right:20px;background:#f8f5ed;color:#07111f;padding:16px 20px;border-radius:4px;box-shadow:0 8px 20px rgba(7,17,31,0.12);z-index:10000;max-width:320px;font-family:'Public Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;border:1px solid #c8c0b3;border-left:4px solid #123a66"><div style="margin-bottom:12px"><strong>Update available</strong></div><div style="margin-bottom:12px;color:#344054">A new version of PayeTax is ready.</div><div style="display:flex;gap:8px"><button id="sw-update-btn" style="background:#123a66;color:#ffffff;border:1px solid #123a66;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:12px;font-weight:700">Update</button><button id="sw-dismiss-btn" style="background:#fffaf1;color:#344054;border:1px solid #c8c0b3;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:12px">Later</button></div></div>`;
    document.body.appendChild(container);

    document.getElementById('sw-update-btn').addEventListener('click', () => {
      triggerUpdate();
      container.remove();
    });
    document.getElementById('sw-dismiss-btn').addEventListener('click', () => {
      container.remove();
    });

    // Auto-dismiss after 30 seconds
    setTimeout(() => {
      if (document.getElementById('sw-update-notification')) container.remove();
    }, 30000);
  }

  function triggerUpdate() {
    if (!registration?.waiting) return;
    try {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } catch {
      // Some browsers block postMessage - fall back to reload
      window.location.reload();
      return;
    }
    if (refreshing) return;
    refreshing = true;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) window.location.reload();
    });
  }

  function handleMessage(event) {
    const { data } = event;
    if (data?.type === 'VERSION_INFO') log('[PWA] Service Worker version:', data.version);
  }

  window.addEventListener('online', () => {
    log('[PWA] Back online');
    showConnectivityToast('online');
  });

  window.addEventListener('offline', () => {
    log('[PWA] Gone offline');
    showConnectivityToast('offline');
  });

  function showConnectivityToast(status) {
    const isOnline = status === 'online';
    const container = document.createElement('div');
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    container.innerHTML = `<div style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#f8f5ed;color:#07111f;padding:12px 20px;border-radius:4px;font-family:'Public Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;font-weight:700;z-index:10001;border:1px solid #c8c0b3;border-left:4px solid ${isOnline ? '#1f7a4d' : '#b7791f'};box-shadow:0 8px 20px rgba(7,17,31,0.12)">${isOnline ? 'Back online' : 'Offline mode'}</div>`;
    document.body.appendChild(container);
    setTimeout(() => {
      container.remove();
    }, 3000);
  }

  // Allow browser/OS to show native install prompt
  window.addEventListener('beforeinstallprompt', () => {
    log('[PWA] Install prompt triggered - browser will show native UI');
  });

  function hasActiveAnalyticsConsent() {
    try {
      const consent = window.localStorage.getItem('cookie-consent');
      const timestamp = window.localStorage.getItem('cookie-consent-timestamp');
      if (consent !== 'accepted' || !timestamp) return false;

      const consentDate = new Date(timestamp);
      if (Number.isNaN(consentDate.getTime())) return false;

      // Keep in sync with cookieUtils.ts 12-month consent window.
      const TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000;
      return Date.now() - consentDate.getTime() <= TWELVE_MONTHS_MS;
    } catch {
      return false;
    }
  }

  window.addEventListener('appinstalled', () => {
    log('[PWA] App was installed');
    if (hasActiveAnalyticsConsent() && typeof window.gtag === 'function') {
      window.gtag('event', 'pwa_install', { event_category: 'PWA', event_label: 'App Installed' });
    }
  });
})();
