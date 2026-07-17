// src/lib/gaConsent.ts
/**
 * GA4 consent lifecycle: one-time bootstrap, consent transitions, the
 * pending-event queue, and GA cookie cleanup.
 *
 * Basic Consent Mode contract:
 * - gtag.js is only ever loaded after analytics consent (Analytics.tsx).
 * - Unconsented visits stay Google-free: applyConsentUpdate(false) never
 *   initialises gtag or the dataLayer; it only flips the per-tag kill switch,
 *   purges queued events, and (via Analytics.tsx) removes GA cookies.
 * - Events queued between acceptance and gtag.js load are flushed on load,
 *   but a withdrawal in that window purges them so they can never replay
 *   after a later re-acceptance.
 *
 * @module lib/gaConsent
 */

import { getGoogleAnalyticsMeasurementId, isGoogleAnalyticsEnabled } from '@/lib/analyticsConfig';
import { isAnalyticsConsented } from '@/lib/cookieUtils';

import type { GtagFunction } from '@/types/gtag';

declare global {
  interface Window {
    dataLayer?: IArguments[];
  }
}

let bootstrapped = false;
let gaLoaded = false;
let pendingEvents: IArguments[] = [];

export function isGaBootstrapped(): boolean {
  return bootstrapped;
}

/**
 * Google's documented per-tag kill switch. While `ga-disable-<id>` is true,
 * a loaded gtag.js sends no hits at all — including Enhanced Measurement
 * pings — which is what stops cookieless traffic after withdrawal.
 */
export function setGaDisabled(disabled: boolean): void {
  const measurementId = getGoogleAnalyticsMeasurementId();
  if (typeof window === 'undefined' || !measurementId) return;
  (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = disabled;
}

/**
 * Expire PayeTax GA cookies (`_ga`, `_ga_*`) only — never unrelated cookies.
 * Covers the production domain variants and the current hostname so the
 * cleanup also works on localhost and preview deployments.
 */
export function removeGaCookies(): void {
  if (typeof document === 'undefined') return;

  const gaCookieNames = document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0]?.trim() ?? '')
    .filter((name) => /^_ga($|_)/.test(name));

  const hostname = window.location.hostname;
  const domains = new Set(['', hostname, `.${hostname}`, 'payetax.co.uk', '.payetax.co.uk']);

  for (const name of gaCookieNames) {
    for (const domain of domains) {
      const domainAttr = domain ? `; domain=${domain}` : '';
      // biome-ignore lint/suspicious/noDocumentCookie: expiring cookies requires document.cookie; the async Cookie Store API is not universally available
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainAttr}`;
    }
  }
}

/**
 * One-time GA bootstrap. Idempotent; runs only after the user has consented.
 * Pushes the consent-mode default (all denied — fail-safe if this module is
 * ever mounted pre-consent) and the single `config` with `send_page_view`
 * disabled. Navigation tracking sends explicit `page_view` events instead;
 * this config must never be reused as the navigation event.
 */
export function bootstrapGa(): void {
  const measurementId = getGoogleAnalyticsMeasurementId();
  if (typeof window === 'undefined' || !measurementId || bootstrapped) return;
  bootstrapped = true;

  window.dataLayer = window.dataLayer || [];
  const gtag = function gtag() {
    // biome-ignore lint/complexity/noArguments: gtag.js only processes Arguments objects pushed to the dataLayer
    window.dataLayer?.push(arguments);
  } as GtagFunction;
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
  });
  gtag('config', measurementId, {
    send_page_view: false,
    cookie_domain: 'auto',
  });
}

/**
 * Apply a consent transition (grant, withdrawal, re-grant).
 *
 * Always toggles the kill switch; withdrawal also purges queued events.
 * The consent-mode update is only pushed when GA has already been
 * bootstrapped — an initial no-consent visit must not initialise gtag or
 * the dataLayer merely to record a denial.
 */
export function applyConsentUpdate(granted: boolean): void {
  if (typeof window === 'undefined') return;

  if (!granted) {
    clearPendingEvents();
  }

  const measurementId = getGoogleAnalyticsMeasurementId();
  if (!measurementId) return;

  setGaDisabled(!granted);

  if (bootstrapped && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }
}

/**
 * Queue-or-send for analytics events. Callers are responsible for the
 * consent check (lib/analytics.ts / Analytics.tsx do this per call).
 * Before gtag.js has loaded, events wait in a module-owned queue instead of
 * the dataLayer so a withdrawal can purge them before they are ever visible
 * to Google.
 */
export const gtagQueued = function gtagQueued() {
  if (typeof window === 'undefined' || !isGoogleAnalyticsEnabled() || !isAnalyticsConsented()) {
    clearPendingEvents();
    return;
  }
  // biome-ignore lint/complexity/noArguments: gtag.js only processes Arguments objects pushed to the dataLayer
  const args = arguments;
  if (gaLoaded && window.dataLayer) {
    window.dataLayer.push(args);
    return;
  }
  pendingEvents.push(args);
} as GtagFunction;

/**
 * Called from the gtag.js Script onLoad. Flushes queued events into the
 * dataLayer only if consent is still granted at load time; otherwise the
 * queue is purged (accept → withdraw-before-load leaves nothing to replay).
 */
export function markGaLoaded(): void {
  if (!isGoogleAnalyticsEnabled()) {
    clearPendingEvents();
    return;
  }

  gaLoaded = true;

  if (!isAnalyticsConsented()) {
    applyConsentUpdate(false);
    removeGaCookies();
    return;
  }

  if (!window.dataLayer) return;
  for (const args of pendingEvents) {
    window.dataLayer.push(args);
  }
  pendingEvents = [];
}

export function clearPendingEvents(): void {
  pendingEvents = [];
}

/** Number of undelivered queued events — exposed for tests. */
export function pendingEventCount(): number {
  return pendingEvents.length;
}

/** Reset module state between tests. Never call from application code. */
export function resetGaConsentStateForTests(): void {
  bootstrapped = false;
  gaLoaded = false;
  pendingEvents = [];
}
