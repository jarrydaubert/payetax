// src/components/organisms/Analytics.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useCallback, useEffect, useState } from 'react';

// GA4 Measurement ID - Configure NEXT_PUBLIC_GA_ID in Vercel environment variables
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

import type { GtagFunction } from '@/types/gtag';

// Track consent status in window object for persistence
declare global {
  interface Window {
    gtag?: GtagFunction;
    dataLayer: Record<string, unknown>[];
    consentMode: {
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
   */
  const updateConsent = useCallback((hasConsent: boolean) => {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag?.('consent', 'update', {
      analytics_storage: hasConsent ? 'granted' : 'denied',
      ad_storage: hasConsent ? 'granted' : 'denied',
      functionality_storage: hasConsent ? 'granted' : 'denied',
      personalization_storage: hasConsent ? 'granted' : 'denied',
    });

    // Store in window for other components to access
    if (window.consentMode) {
      window.consentMode.isConsentGiven = hasConsent;
    }
  }, []);

  /**
   * Track SEO-relevant metrics
   * - Time on page
   * - Scroll depth
   * - Engagement events
   */
  const trackSEOMetrics = useCallback(() => {
    if (typeof window === 'undefined' || !window.gtag) return;

    // Track time on page
    const startTime = Date.now();
    const trackTimeSpent = () => {
      const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);
      if (timeSpentSeconds >= 30) {
        window.gtag?.('event', 'engagement', {
          event_category: 'time_on_page',
          event_label: pathname,
          value: timeSpentSeconds,
        });
      }
    };

    // Track scroll depth
    let maxScrollPercentage = 0;
    const trackScrollDepth = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollTop = window.scrollY;

      if (scrollHeight <= clientHeight) return;

      const scrollPercentage = Math.floor((scrollTop / (scrollHeight - clientHeight)) * 100);

      if (scrollPercentage > maxScrollPercentage) {
        maxScrollPercentage = scrollPercentage;

        // Track at 25%, 50%, 75%, and 100% scroll depths
        if (
          (maxScrollPercentage >= 25 && maxScrollPercentage < 50) ||
          (maxScrollPercentage >= 50 && maxScrollPercentage < 75) ||
          (maxScrollPercentage >= 75 && maxScrollPercentage < 100) ||
          maxScrollPercentage === 100
        ) {
          const scrollLabel = `${Math.floor(maxScrollPercentage / 25) * 25}%`;
          window.gtag?.('event', 'scroll_depth', {
            event_category: 'engagement',
            event_label: scrollLabel,
            value: maxScrollPercentage,
          });
        }
      }
    };

    // Add event listeners
    window.addEventListener('scroll', trackScrollDepth);
    window.addEventListener('beforeunload', trackTimeSpent);

    // Clean up on page navigation
    return () => {
      window.removeEventListener('scroll', trackScrollDepth);
      window.removeEventListener('beforeunload', trackTimeSpent);
      trackTimeSpent(); // Track time spent when navigating away
    };
  }, [pathname]);

  // Initialize analytics when component mounts
  useEffect(() => {
    if (!isLoaded) return;

    // Initialize consent mode
    if (window?.gtag) {
      // Default to denied consent until user accepts
      window.gtag?.('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
        security_storage: 'granted', // Always allowed for security
      });

      // Check if user previously gave consent
      const hasConsent = localStorage.getItem('cookie-consent') === 'accepted';

      // Store in window for other components to access
      window.consentMode = {
        isConsentGiven: hasConsent,
      };

      // Update consent if previously given
      if (hasConsent) {
        updateConsent(true);
      }
    }
  }, [isLoaded, updateConsent]);

  // Track page views when pathname or search params change
  useEffect(() => {
    if (!isLoaded) return;

    // Only track page views if consent is given
    const hasConsent = localStorage.getItem('cookie-consent') === 'accepted';
    if (!(hasConsent && window.gtag)) return;

    // Construct full URL for tracking
    const searchParamsString = searchParams?.toString();
    const url = pathname + (searchParamsString ? `?${searchParamsString}` : '');

    // Track page view
    window.gtag?.('config', GA_MEASUREMENT_ID, {
      page_path: url,
      send_page_view: true,
      anonymize_ip: true, // Enhanced privacy compliance
      cookie_flags: 'SameSite=None;Secure', // Enhanced cookie security
      transport_type: 'beacon', // Improves tracking reliability
    });

    // Track additional SEO metrics
    trackSEOMetrics();
  }, [pathname, searchParams, isLoaded, trackSEOMetrics]);

  // Handle storage events for consent changes from other tabs
  useEffect(() => {
    if (!isLoaded) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cookie-consent') {
        const newConsent = e.newValue === 'accepted';
        if (window.consentMode) {
          window.consentMode.isConsentGiven = newConsent;
        }
        updateConsent(newConsent);
      }
    };

    const handleConsentUpdate = () => {
      const newConsent = localStorage.getItem('cookie-consent') === 'accepted';
      updateConsent(newConsent);
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('cookieConsentUpdated', handleConsentUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('cookieConsentUpdated', handleConsentUpdate);
    };
  }, [isLoaded, updateConsent]);

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy='afterInteractive'
        onLoad={() => setIsLoaded(true)}
      />

      {/* Google Analytics Initialization */}
      <Script strategy='afterInteractive'>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          // Initialize with consent mode
          gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'functionality_storage': 'denied',
            'security_storage': 'granted',
            'personalization_storage': 'denied'
          });
          
          // Configure GA with detailed settings
          gtag('config', '${GA_MEASUREMENT_ID}', {
            send_page_view: false,
            anonymize_ip: true,
            cookie_domain: 'payetax.co.uk',
            cookie_flags: 'SameSite=None;Secure',
            transport_type: 'beacon'
          });
        `}
      </Script>
    </>
  );
}

export default Analytics;
