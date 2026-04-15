// src/components/organisms/Analytics.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';
import { initCoreWebVitals, trackEvent } from '@/lib/analytics';
import { isAnalyticsConsented, isConsentPreferences } from '@/lib/cookieUtils';

import type { GtagFunction } from '@/types/gtag';

// GA4 Measurement ID - Configure NEXT_PUBLIC_GA_ID in Vercel environment variables
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;
const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false';

// Track consent status in window object for persistence
declare global {
  interface Window {
    gtag?: GtagFunction;
    dataLayer: IArguments[];
    consentMode?: {
      isConsentGiven: boolean;
    };
  }
}

/**
 * Enhanced Google Analytics component with privacy controls
 * - GA4 implementation
 * - Consent management
 * - Event tracking
 * - SEO performance monitoring
 */
export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * Update consent settings in Google Analytics
   * Only toggles analytics_storage - ad/personalization remain denied
   * since we only ask for analytics consent in our cookie banner
   */
  const updateConsent = useCallback((hasConsent: boolean) => {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('consent', 'update', {
      analytics_storage: hasConsent ? 'granted' : 'denied',
      // Keep ad-related storage denied - we only have analytics consent
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });

    // Store in window for other components to access
    if (window.consentMode) {
      window.consentMode.isConsentGiven = hasConsent;
    }
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
    if (typeof window === 'undefined' || !window.gtag) {
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

  // Track whether we've initialized Core Web Vitals (only do once)
  const vitalsInitialized = useRef(false);

  // Initialize analytics when component mounts
  // Note: consent 'default' is already set in the inline Script (runs earlier)
  // This effect only needs to check stored consent and update if granted
  useEffect(() => {
    if (!(isLoaded && window?.gtag)) return;

    // Check if user previously gave consent (respects 12-month expiry)
    const hasConsent = isAnalyticsConsented();

    // Store in window for other components to access
    window.consentMode = {
      isConsentGiven: hasConsent,
    };

    // Update consent if previously given
    if (hasConsent) {
      updateConsent(true);

      // Initialize Core Web Vitals tracking (only once per session)
      if (!vitalsInitialized.current) {
        vitalsInitialized.current = true;
        initCoreWebVitals();
      }
    }
  }, [isLoaded, updateConsent]);

  // Track page views when pathname or search params change
  useEffect(() => {
    if (!(isLoaded && GA_MEASUREMENT_ID)) return;

    // Only track page views if consent is given (respects 12-month expiry)
    const hasConsent = isAnalyticsConsented();
    if (!(hasConsent && window.gtag)) return;

    // Construct full URL for tracking
    const searchParamsString = searchParams?.toString();
    const url = pathname + (searchParamsString ? `?${searchParamsString}` : '');

    // Track page view (removed cookie_flags - let GA use default first-party behavior)
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      send_page_view: true,
      anonymize_ip: true,
      transport_type: 'beacon',
    });

    // Track additional SEO metrics and return cleanup
    const cleanup = trackSEOMetrics();
    return cleanup;
  }, [pathname, searchParams, isLoaded, trackSEOMetrics]);

  // Handle storage events for consent changes from other tabs
  useEffect(() => {
    if (!isLoaded) return;

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
      if (e.key === 'cookie-consent') {
        const newConsent = parseAnalyticsConsentValue(e.newValue);
        if (window.consentMode) {
          window.consentMode.isConsentGiven = newConsent;
        }
        updateConsent(newConsent);
      }
    };

    const handleConsentUpdate = () => {
      const newConsent = isAnalyticsConsented();
      updateConsent(newConsent);
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('cookieConsentUpdated', handleConsentUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('cookieConsentUpdated', handleConsentUpdate);
    };
  }, [isLoaded, updateConsent]);

  // Don't render when analytics are disabled or GA ID is missing.
  if (!(ANALYTICS_ENABLED && GA_MEASUREMENT_ID)) {
    return null;
  }

  return (
    <>
      {/* Google Analytics Script - static id prevents duplicate script injection */}
      {/* biome-ignore lint/correctness/useUniqueElementIds: Script id must be static to prevent duplicates */}
      <Script
        id='ga-script'
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy='lazyOnload'
        onLoad={() => setIsLoaded(true)}
      />

      {/* Google Analytics Initialization - static id prevents duplicate execution */}
      {/* biome-ignore lint/correctness/useUniqueElementIds: Script id must be static to prevent duplicates */}
      <Script id='ga-init' strategy='lazyOnload'>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          // Initialize with consent mode v2 (all denied by default)
          gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'functionality_storage': 'denied',
            'personalization_storage': 'denied',
            'security_storage': 'granted'
          });
          
          // Configure GA (page_view disabled - we track manually after consent check)
          gtag('config', '${GA_MEASUREMENT_ID}', {
            send_page_view: false,
            anonymize_ip: true,
            cookie_domain: 'payetax.co.uk',
            transport_type: 'beacon'
          });
        `}
      </Script>
    </>
  );
}

export default Analytics;
