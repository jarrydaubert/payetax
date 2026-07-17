// src/components/organisms/Analytics.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';
import { initCoreWebVitals, trackEvent } from '@/lib/analytics';
import { CONSENT_STORAGE_KEY, isAnalyticsConsented, isConsentPreferences } from '@/lib/cookieUtils';
import {
  applyConsentUpdate,
  bootstrapGa,
  gtagQueued,
  markGaLoaded,
  removeGaCookies,
} from '@/lib/gaConsent';

// GA4 Measurement ID - Configure NEXT_PUBLIC_GA_ID in Vercel environment variables
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;
const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false';

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hasConsent, setHasConsent] = useState(false);
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
  const setAnalyticsConsentState = useCallback((nextConsent: boolean) => {
    window.consentMode = {
      isConsentGiven: nextConsent,
    };

    if (GA_MEASUREMENT_ID) {
      if (nextConsent) {
        bootstrapGa(GA_MEASUREMENT_ID);
        applyConsentUpdate(GA_MEASUREMENT_ID, true);
        lastTrackedUrl.current = null;
      } else {
        applyConsentUpdate(GA_MEASUREMENT_ID, false);
        removeGaCookies();
      }
    }

    setHasConsent(nextConsent);
  }, []);

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

  // App-owned page-view tracking: one explicit page_view event per navigation.
  // Deduped only against the previous URL, so route revisits are counted and
  // effect re-runs with an unchanged URL are not. Events queue until gtag.js
  // loads, so nothing is lost right after acceptance.
  useEffect(() => {
    if (!(hasConsent && GA_MEASUREMENT_ID)) return;

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
  }, [hasConsent, getCurrentPagePath, trackSEOMetrics]);

  // Handle storage events for consent changes from other tabs
  useEffect(() => {
    const parseAnalyticsConsentValue = (value: string | null): boolean => {
      if (value === 'accepted') return true;
      if (value === 'declined') return false;
      if (!value) return isAnalyticsConsented();

      try {
        const parsed: unknown = JSON.parse(value);
        if (isConsentPreferences(parsed)) {
          return parsed.analytics;
        }
      } catch {
        return isAnalyticsConsented();
      }

      return isAnalyticsConsented();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CONSENT_STORAGE_KEY) {
        const newConsent = parseAnalyticsConsentValue(e.newValue);
        setAnalyticsConsentState(newConsent);
      }
    };

    const handleConsentUpdate = (event: Event) => {
      const detail: unknown = (event as CustomEvent<unknown>).detail;
      const newConsent = isConsentPreferences(detail) ? detail.analytics : isAnalyticsConsented();
      setAnalyticsConsentState(newConsent);
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('cookieConsentUpdated', handleConsentUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('cookieConsentUpdated', handleConsentUpdate);
    };
  }, [setAnalyticsConsentState]);

  // Don't render GA4 unless it is enabled, configured, and consented.
  if (!(ANALYTICS_ENABLED && GA_MEASUREMENT_ID && hasConsent)) {
    return null;
  }

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Script id must be static to prevent duplicates
    <Script
      id='ga-script'
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      strategy='lazyOnload'
      onLoad={markGaLoaded}
    />
  );
}

export default Analytics;
