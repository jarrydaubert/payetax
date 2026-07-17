// src/components/organisms/Analytics.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';
import { initCoreWebVitals, trackEvent } from '@/lib/analytics';
import { getGoogleAnalyticsMeasurementId } from '@/lib/analyticsConfig';
import {
  CONSENT_STORAGE_KEY,
  CONSENT_TIMESTAMP_STORAGE_KEY,
  getConsentExpiryTime,
  getConsentPreferences,
  isAnalyticsConsented,
  isConsentPreferences,
} from '@/lib/cookieUtils';
import {
  applyConsentUpdate,
  bootstrapGa,
  gtagQueued,
  markGaLoaded,
  markGaLoadFailed,
  removeGaCookies,
} from '@/lib/gaConsent';

const MAX_TIMEOUT_MS = 2_147_483_647;

// Track consent status in window object for persistence
declare global {
  interface Window {
    consentMode?: {
      isConsentGiven: boolean;
    };
  }
}

/**
 * Google Analytics component with privacy controls (basic Consent Mode).
 *
 * - gtag.js is only loaded after analytics consent; unconsented visits stay
 *   Google-free (no script, no dataLayer, no denied-update pings).
 * - The app owns page-view and scroll tracking: one explicit `page_view`
 *   event per navigation (route revisits included), custom scroll_depth
 *   thresholds. GA4 Enhanced Measurement history/scroll options must stay
 *   disabled on the data stream to keep single ownership.
 * - Rejection, withdrawal, and expiry flip the ga-disable kill switch, purge
 *   queued events, and remove `_ga`/`_ga_*` cookies.
 */
export function Analytics() {
  const measurementId = getGoogleAnalyticsMeasurementId();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hasConsent, setHasConsent] = useState(false);
  const [consentExpiresAt, setConsentExpiresAt] = useState<number | null>(null);
  const [gaScriptAttempt, setGaScriptAttempt] = useState(0);
  const activeGaScriptAttemptRef = useRef(0);
  const effectiveConsentRef = useRef(false);
  const lastTrackedNavigation = useRef<string | null>(null);

  // Track whether we've initialized lightweight GA4 page timings (only once).
  // Vercel Speed Insights owns Core Web Vitals.
  const vitalsInitialized = useRef(false);

  const getCurrentNavigationKey = useCallback(() => {
    const searchParamsString = searchParams?.toString();
    return pathname + (searchParamsString ? `?${searchParamsString}` : '');
  }, [pathname, searchParams]);

  /**
   * Apply a consent decision to GA.
   *
   * Grant (first grant and re-grant after a same-tab withdrawal): one-time
   * bootstrap, explicit analytics_storage=granted update, and re-armed
   * page-view tracking so the current page is counted again.
   *
   * Denial (rejection, withdrawal, expiry, unconsented mount): kill switch on,
   * queued events purged, GA cookies removed. Never initialises gtag just to
   * record a denial. Ad/personalization storage stays denied in every state —
   * the banner only asks for analytics consent.
   */
  const setAnalyticsConsentState = useCallback(
    (nextConsent: boolean) => {
      const effectiveConsent = Boolean(nextConsent && measurementId);

      window.consentMode = {
        isConsentGiven: effectiveConsent,
      };

      if (effectiveConsent && !effectiveConsentRef.current) {
        bootstrapGa();
        applyConsentUpdate(true);
        setGaScriptAttempt((attempt) => {
          const nextAttempt = attempt + 1;
          activeGaScriptAttemptRef.current = nextAttempt;
          return nextAttempt;
        });
        lastTrackedNavigation.current = null;
      } else if (!effectiveConsent) {
        // Invalidate callbacks from an in-flight script immediately. A later
        // re-grant creates a new attempt with its own callbacks.
        activeGaScriptAttemptRef.current = 0;
        applyConsentUpdate(false);
        removeGaCookies();
      }

      effectiveConsentRef.current = effectiveConsent;
      setHasConsent(effectiveConsent);
    },
    [measurementId],
  );

  /**
   * Track SEO-relevant metrics
   * - Time on page
   * - Scroll depth (fires once per 25/50/75/100 threshold)
   * - Engagement events
   *
   * Always returns a cleanup function for consistent effect usage
   */
  const trackSEOMetrics = useCallback((): (() => void) => {
    if (typeof window === 'undefined') {
      return () => {}; // No-op cleanup
    }

    // Track time on page
    const startTime = Date.now();
    const trackTimeSpent = () => {
      const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);
      if (timeSpentSeconds >= 30) {
        trackEvent({
          action: 'time_on_page',
          category: 'engagement',
          label: pathname,
          value: timeSpentSeconds,
        });
      }
    };

    // Track scroll depth - only fire once per threshold
    const SCROLL_THRESHOLDS = [25, 50, 75, 100] as const;
    const sentThresholds = new Set<number>();

    const trackScrollDepth = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollTop = window.scrollY;

      if (scrollHeight <= clientHeight) return;

      const scrollPercentage = Math.floor((scrollTop / (scrollHeight - clientHeight)) * 100);

      // Fire once per threshold crossed
      for (const threshold of SCROLL_THRESHOLDS) {
        if (scrollPercentage >= threshold && !sentThresholds.has(threshold)) {
          sentThresholds.add(threshold);
          trackEvent({
            action: 'scroll_depth',
            category: 'engagement',
            label: `${threshold}%`,
            value: threshold,
          });
        }
      }
    };

    // Add event listeners (passive scroll for performance)
    window.addEventListener('scroll', trackScrollDepth, { passive: true });
    window.addEventListener('beforeunload', trackTimeSpent);

    // Clean up on page navigation
    return () => {
      window.removeEventListener('scroll', trackScrollDepth);
      window.removeEventListener('beforeunload', trackTimeSpent);
      trackTimeSpent(); // Track time spent when navigating away
    };
  }, [pathname]);

  // Initialize consent state on mount. GA4 scripts are only loaded after
  // consent; Vercel Web Analytics and Speed Insights run outside this
  // component. An unconsented mount also clears stale GA cookies.
  useEffect(() => {
    setAnalyticsConsentState(isAnalyticsConsented());
    setConsentExpiresAt(getConsentExpiryTime());
  }, [setAnalyticsConsentState]);

  // Every stored consent choice can expire while a tab remains open, including
  // a rejection and choices made while GA is disabled or misconfigured.
  // Schedule independently of effective GA consent so the banner always
  // re-prompts after 12 months. consentExpiresAt re-arms the timer even when a
  // same-tab update leaves hasConsent false (for example, reject-all).
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    function checkConsentExpiry() {
      const preferences = getConsentPreferences();
      if (!preferences) {
        setConsentExpiresAt(null);
        setAnalyticsConsentState(false);
        document.dispatchEvent(new Event('cookieConsentExpired'));
        return;
      }

      scheduleConsentExpiry(getConsentExpiryTime());
    }

    function scheduleConsentExpiry(expiresAt: number | null) {
      if (!expiresAt) return;

      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        checkConsentExpiry();
        return;
      }

      timer = setTimeout(checkConsentExpiry, Math.min(remaining, MAX_TIMEOUT_MS));
    }

    scheduleConsentExpiry(consentExpiresAt);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [consentExpiresAt, setAnalyticsConsentState]);

  // App-owned page-view tracking: one explicit page_view event per navigation.
  // Deduped only against the previous URL, so route revisits are counted and
  // effect re-runs with an unchanged URL are not. Events queue until gtag.js
  // loads, so nothing is lost right after acceptance.
  useEffect(() => {
    if (!(hasConsent && measurementId)) return;

    const navigationKey = getCurrentNavigationKey();
    if (lastTrackedNavigation.current === navigationKey) return;
    lastTrackedNavigation.current = navigationKey;

    gtagQueued('event', 'page_view', {
      // Query values can contain tax details or arbitrary personal data. Use
      // them only to distinguish client navigations, never in the GA payload.
      page_path: pathname,
      page_location: `${window.location.origin}${pathname}`,
      page_title: document.title,
    });

    if (!vitalsInitialized.current) {
      vitalsInitialized.current = true;
      initCoreWebVitals();
    }

    // Track additional SEO metrics and return cleanup
    return trackSEOMetrics();
  }, [hasConsent, measurementId, pathname, getCurrentNavigationKey, trackSEOMetrics]);

  // Handle storage events for consent changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === null ||
        e.key === CONSENT_STORAGE_KEY ||
        e.key === CONSENT_TIMESTAMP_STORAGE_KEY
      ) {
        setAnalyticsConsentState(isAnalyticsConsented());
        setConsentExpiresAt(getConsentExpiryTime());
      }
    };

    const handleConsentUpdate = (event: Event) => {
      const detail: unknown = (event as CustomEvent<unknown>).detail;
      const requestedConsent = isConsentPreferences(detail)
        ? detail.analytics
        : isAnalyticsConsented();

      // A denial takes effect immediately even if localStorage persistence was
      // interrupted. A grant still requires a valid stored decision.
      setAnalyticsConsentState(requestedConsent && isAnalyticsConsented());
      setConsentExpiresAt(getConsentExpiryTime());
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('cookieConsentUpdated', handleConsentUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('cookieConsentUpdated', handleConsentUpdate);
    };
  }, [setAnalyticsConsentState]);

  // Don't render GA4 unless it is enabled, configured, and consented.
  if (!(measurementId && hasConsent)) {
    return null;
  }

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Script id must be static to prevent duplicates
    <Script
      id='ga-script'
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}&payetax_retry=${gaScriptAttempt}`}
      strategy='afterInteractive'
      onLoad={() => {
        if (activeGaScriptAttemptRef.current === gaScriptAttempt) markGaLoaded();
      }}
      onError={() => {
        if (activeGaScriptAttemptRef.current === gaScriptAttempt) markGaLoadFailed();
      }}
    />
  );
}

export default Analytics;
