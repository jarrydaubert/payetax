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
      // Updates wait for normal window closure; never interrupt an open calculation.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && registration) {
          checkForUpdates();
        }
      });
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

  window.addEventListener('online', () => {
    checkForUpdates();
    showConnectivityToast('online');
  });

  window.addEventListener('offline', () => {
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
})();
