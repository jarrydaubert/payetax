(() => {
  // Skip SW on localhost (add ?pwa=1 to test locally if needed)
  if (
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    new URLSearchParams(window.location.search).get('pwa') !== '1'
  ) {
    return;
  }
  // Skip if SW not supported
  if (!('serviceWorker' in navigator)) {
    return;
  }
  const isDev = false;
  const log = (message, ...args) => {
    if (isDev) {
      console.log(`[PWA] ${message}`, ...args);
    }
  };
  let registration;
  let started = false;

  async function registerServiceWorker() {
    if (started) return;
    started = true;
    try {
      registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });
      log('Service Worker registered successfully');

      // Handle already-waiting worker (from previous session)
      if (registration.waiting && navigator.serviceWorker.controller) {
        handleWaitingUpdate();
      }

      registration.addEventListener('updatefound', handleUpdateFound);
      handleUpdateFound();

      // Check for updates when tab becomes visible (browser handles 24h update checks)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && registration) {
          checkForUpdates();
        }
      });

      navigator.serviceWorker.addEventListener('message', handleMessage);

      // Note: Notification permission should be requested via explicit user action
      // (e.g., "Enable notifications" button), not on first click anywhere
    } catch {
      // SW registration can fail in incognito mode, with ad blockers, or privacy settings
      started = false;
    }
  }

  // Next's lazyOnload script normally runs after load has already fired.
  if (document.readyState === 'complete') {
    registerServiceWorker();
  } else {
    window.addEventListener('load', registerServiceWorker, { once: true });
  }

  async function checkForUpdates() {
    try {
      if (!registration) {
        await registerServiceWorker();
        return;
      }
      await registration.update();
    } catch {
      // Offline checks and invalid registrations can reject asynchronously.
    }
  }

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
    showUpdateBanner();
  }

  function showUpdateBanner() {
    // Prevent duplicate banners
    if (document.getElementById('sw-update-notification')) return;

    const container = document.createElement('div');
    container.id = 'sw-update-notification';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    container.style.cssText =
      "position:fixed;top:20px;right:20px;left:20px;margin-left:auto;background:#f8f5ed;color:#07111f;padding:16px 20px;border-radius:4px;box-shadow:0 8px 20px rgba(7,17,31,0.12);z-index:10000;max-width:320px;font-family:'Public Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;border:1px solid #c8c0b3;border-left:4px solid #123a66";
    container.innerHTML = `<div style="margin-bottom:12px"><strong>Update available</strong></div><div style="margin-bottom:12px;color:#344054">Finish your calculation before closing. To apply the update, close all PayeTax tabs and app windows, then reopen PayeTax.</div><button id="sw-dismiss-btn" style="background:#fffaf1;color:#344054;border:1px solid #c8c0b3;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:12px">Later</button>`;
    document.body.appendChild(container);

    document.getElementById('sw-dismiss-btn').addEventListener('click', () => {
      container.remove();
    });
  }

  function handleMessage(event) {
    const { data } = event;
    if (data?.type === 'VERSION_INFO') log('[PWA] Service Worker version:', data.version);
  }

  window.addEventListener('online', () => {
    checkForUpdates();
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

  window.addEventListener('appinstalled', () => {
    log('[PWA] App was installed');
    // PWAInstallBanner owns the analytics event and routes it through the
    // shared fail-closed consent gate. This public bootstrap must not call GA.
  });
})();
