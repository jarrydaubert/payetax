(() => {
  if (!('serviceWorker' in navigator)) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      return;
  }
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return;
  }
  const isDev =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const log = (message, ...args) => {
    if (isDev) {
      console.log(`[PWA] ${message}`, ...args);
    }
  };
  let e,
    o = !1;
  window.addEventListener('load', async () => {
    try {
      e = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      log('Service Worker registered successfully');
      e.addEventListener('updatefound', n);
      // Check for updates every 5 minutes when page is visible
      if (document.visibilityState === 'visible')
        setInterval(() => {
          if (document.visibilityState === 'visible') e.update();
        }, 3e5); // 5 minutes (300000ms)
      // Also check for updates when tab becomes visible
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && e) {
          e.update();
        }
      });
      navigator.serviceWorker.addEventListener('message', s);
      if ('Notification' in window && Notification.permission === 'default')
        document.addEventListener('click', d, { once: !0 });
    } catch (i) {
      console.error('[PWA] Service Worker registration failed:', i);
    }
  });
  function n() {
    const t = e.installing;
    if (!t) return;
    t.addEventListener('statechange', () => {
      if (t.state === 'installed' && navigator.serviceWorker.controller) i();
    });
  }
  function i() {
    const t = document.createElement('div');
    t.id = 'sw-update-notification';
    t.innerHTML =
      '<div style="position:fixed;top:20px;right:20px;background:#1f2937;color:white;padding:16px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:10000;max-width:300px;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;font-size:14px;border:1px solid #374151"><div style="margin-bottom:12px"><strong>🚀 Update Available</strong></div><div style="margin-bottom:12px;opacity:0.9">A new version of PayeTax is ready!</div><div style="display:flex;gap:8px"><button id="sw-update-btn" style="background:#3b82f6;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:12px;font-weight:600">Update</button><button id="sw-dismiss-btn" style="background:transparent;color:#9ca3af;border:1px solid #4b5563;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:12px">Later</button></div></div>';
    document.body.appendChild(t);
    document.getElementById('sw-update-btn').addEventListener('click', () => {
      a();
      t.remove();
    });
    document.getElementById('sw-dismiss-btn').addEventListener('click', () => {
      t.remove();
    });
    setTimeout(() => {
      if (document.getElementById('sw-update-notification')) t.remove();
    }, 3e4);
  }
  function a() {
    if (!e?.waiting) return;
    e.waiting.postMessage({ type: 'SKIP_WAITING' });
    if (o) return;
    o = !0;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (o) window.location.reload();
    });
  }
  function s(e) {
    const { data: o } = e;
    if (o?.type === 'VERSION_INFO') log('[PWA] Service Worker version:', o.version);
  }
  async function d() {
    if (!('Notification' in window)) return;
    try {
      const e = await Notification.requestPermission();
      log('[PWA] Notification permission:', e);
    } catch (e) {
      log('[PWA] Notification permission request failed:', e);
    }
  }
  window.addEventListener('online', () => {
    log('[PWA] Back online');
    r('online');
  });
  window.addEventListener('offline', () => {
    log('[PWA] Gone offline');
    r('offline');
  });
  function r(e) {
    const t = e === 'online',
      o = document.createElement('div');
    o.innerHTML = `<div style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:${t ? '#10b981' : '#f59e0b'};color:white;padding:12px 20px;border-radius:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;font-weight:500;z-index:10001;box-shadow:0 4px 12px rgba(0,0,0,0.2)">${t ? '🌐 Back Online' : '📱 Offline Mode'}</div>`;
    document.body.appendChild(o);
    setTimeout(() => {
      o.remove();
    }, 3e3);
  }
  // Allow browser/OS to show native install prompt
  window.addEventListener('beforeinstallprompt', () => {
    log('[PWA] Install prompt triggered - browser will show native UI');
    // Don't prevent default - let browser handle the install prompt
  });
  window.addEventListener('appinstalled', () => {
    log('[PWA] App was installed');
    if (typeof gtag !== 'undefined')
      gtag('event', 'pwa_install', { event_category: 'PWA', event_label: 'App Installed' });
  });
})();
