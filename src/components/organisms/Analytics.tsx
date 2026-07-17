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
  isAnalyticsConsented,
} from '@/lib/cookieUtils';
import {
  applyConsentUpdate,
  bootstrapGa,
  gtagQueued,
  markGaLoaded,
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
  const effectiveConsentRef = useRef(false);
  const lastTrackedUrl = useRef<string | null>(null);

  // Track whether we've initialized lightweight GA4 page timings (only once).
  // Vercel Speed Insights owns Core Web Vitals.
  const vitalsInitialized = useRef(false);

  const getCurrentPagePath = useCallback(() => {
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
        lastTrackedUrl.current = null;
      } else if (!effectiveConsent) {
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
  }, [setAnalyticsConsentState]);

  // A consent choice can expire while a tab remains open. Schedule the exact
  // transition (in safe setTimeout-sized chunks) so GA is disabled and its
  // cookies are removed without waiting for a reload or a later app event.
  useEffect(() => {
    if (!hasConsent) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const checkConsentExpiry = () => {
      if (!isAnalyticsConsented()) {
        setAnalyticsConsentState(false);
        document.dispatchEvent(new Event('cookieConsentExpired'));
        return;
      }

      const expiresAt = getConsentExpiryTime();
      if (!expiresAt) {
        setAnalyticsConsentState(false);
        return;
      }

      const remaining = Math.max(1, expiresAt - Date.now());
      timer = setTimeout(checkConsentExpiry, Math.min(remaining, MAX_TIMEOUT_MS));
    };

    checkConsentExpiry();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [hasConsent, setAnalyticsConsentState]);

  // App-owned page-view tracking: one explicit page_view event per navigation.
  // Deduped only against the previous URL, so route revisits are counted and
  // effect re-runs with an unchanged URL are not. Events queue until gtag.js
  // loads, so nothing is lost right after acceptance.
  useEffect(() => {
    if (!(hasConsent && measurementId)) return;

    const url = getCurrentPagePath();
    if (lastTrackedUrl.current === url) return;
    lastTrackedUrl.current = url;

    gtagQueued('event', 'page_view', {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });

    if (!vitalsInitialized.current) {
      vitalsInitialized.current = true;
      initCoreWebVitals();
    }

    // Track additional SEO metrics and return cleanup
    return trackSEOMetrics();
  }, [hasConsent, measurementId, getCurrentPagePath, trackSEOMetrics]);

  // Handle storage events for consent changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CONSENT_STORAGE_KEY || e.key === CONSENT_TIMESTAMP_STORAGE_KEY) {
        setAnalyticsConsentState(isAnalyticsConsented());
      }
    };

    const handleConsentUpdate = () => {
      setAnalyticsConsentState(isAnalyticsConsented());
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
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      strategy='lazyOnload'
      onLoad={markGaLoaded}
    />
  );
}

export default Analytics;
