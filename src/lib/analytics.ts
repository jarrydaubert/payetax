// src/lib/analytics.ts
/**
 * Analytics tracking utilities for PayeTax
 * Includes event tracking, performance monitoring, and SEO analytics
 *
 * @module lib/analytics
 */

import { areCookiesAccepted } from '@/lib/cookieUtils';
import { addBreadcrumb } from '@/lib/sentry';

// Types for analytics events
export type SEOActionType =
  | 'external_link'
  | 'download'
  | 'share'
  | 'print'
  | 'scroll_to_top'
  | 'navigation'
  | 'form_interaction'
  | 'affiliate_click';

export interface AnalyticsEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  custom_data?: Record<string, unknown>;
}

export interface SEOAnalyticsData {
  source?: string;
  target?: string;
  action_type?: string;
  page_path?: string;
  user_agent?: string;
  timestamp?: string;
  destination?: string;
}

/**
 * Track SEO-related actions for analytics
 *
 * @param action - The type of SEO action being tracked
 * @param data - Additional data about the action
 */
export function trackSEOAction(action: SEOActionType, data: SEOAnalyticsData = {}): void {
  try {
    // Respect user consent - only track if cookies accepted
    if (!areCookiesAccepted()) {
      return;
    }

    // Enhanced data object with browser info
    const enhancedData = {
      ...data,
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: new Date().toISOString(),
    };

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      // biome-ignore lint/suspicious/noConsole: Dev logging for analytics debugging
      console.log('🔍 SEO Analytics:', action, enhancedData);
    }

    // Add breadcrumb for Sentry error tracking
    addBreadcrumb('analytics', {
      message: `SEO action: ${action}`,
      level: 'info',
      data: {
        action,
        source: data.source,
        target: data.target,
        page_path: enhancedData.page_path,
      },
    });

    // Track with Google Analytics if available
    if (window?.gtag) {
      window.gtag('event', action, {
        event_category: 'seo_actions',
        event_label: data.source || 'unknown',
        custom_parameters: enhancedData,
      });
    }

    // Track with other analytics providers here
    // Example: Mixpanel, Amplitude, etc.
  } catch (error) {
    console.warn('Analytics tracking error:', error);
  }
}

/**
 * Track general analytics events
 *
 * @param event - The analytics event to track
 */
export function trackEvent(event: AnalyticsEvent): void {
  try {
    // Respect user consent - only track if cookies accepted
    if (!areCookiesAccepted()) {
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      // biome-ignore lint/suspicious/noConsole: Dev logging for analytics debugging
      console.log('📊 Analytics Event:', event);
    }

    // Add breadcrumb for Sentry error tracking
    addBreadcrumb('analytics', {
      message: `Analytics event: ${event.action}`,
      level: 'info',
      data: {
        action: event.action,
        category: event.category,
        label: event.label,
        value: event.value,
      },
    });

    // Track with Google Analytics if available
    if (window?.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category || 'general',
        event_label: event.label,
        value: event.value,
        custom_parameters: event.custom_data,
      });
    }
  } catch (error) {
    console.warn('Analytics tracking error:', error);
  }
}

/**
 * Track a calculator-specific event
 *
 * @param action - The specific calculator action
 * @param data - Calculator-related data
 */
export function trackCalculatorEvent(
  action: 'calculate' | 'reset' | 'update' | 'error',
  data?: Record<string, unknown>,
): void {
  trackEvent({
    action: 'calculator_action',
    category: 'calculator',
    label: action,
    custom_data: data,
  });
}

/**
 * Track calculator usage
 *
 * @param calculation_type - Type of calculation performed
 * @param salary_range - Salary range for analytics segmentation
 */
export function trackCalculatorUsage(calculation_type: string, salary_range?: string): void {
  trackEvent({
    action: 'calculator_usage',
    category: 'engagement',
    label: calculation_type,
    custom_data: {
      salary_range,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Track page views
 *
 * @param page_path - The path of the page being viewed
 * @param page_title - The title of the page
 */
export function trackPageView(page_path: string, page_title?: string): void {
  try {
    // Respect user consent - only track if cookies accepted
    if (!areCookiesAccepted()) {
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      // biome-ignore lint/suspicious/noConsole: Dev logging for analytics debugging
      console.log('📄 Page View:', page_path, page_title);
    }

    // Track with Google Analytics if available
    if (window?.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
        page_path,
        page_title,
      });
    }
  } catch (error) {
    console.warn('Page view tracking error:', error);
  }
}

/**
 * Track form interactions
 *
 * @param form_name - Name of the form
 * @param action - The action taken (submit, focus, etc.)
 * @param field_name - Optional field name for field-specific tracking
 */
export function trackFormInteraction(form_name: string, action: string, field_name?: string): void {
  trackSEOAction('form_interaction', {
    source: form_name,
    action_type: action,
    target: field_name,
  });
}

/**
 * Track affiliate link clicks for monetization tracking
 *
 * @param competitorSlug - The slug of the competitor being clicked
 * @param competitorName - Display name of the competitor
 * @param affiliateProgram - The affiliate program name (e.g., 'xero-partner')
 * @param pageType - The page type where click occurred ('alternative' | 'vs' | 'hub')
 */
export function trackAffiliateClick(
  competitorSlug: string,
  competitorName: string,
  affiliateProgram: string | undefined,
  pageType: 'alternative' | 'vs' | 'hub',
): void {
  trackSEOAction('affiliate_click', {
    source: `${pageType}_page`,
    target: competitorSlug,
    action_type: affiliateProgram ?? 'direct_link',
    destination: competitorName,
  });

  // Also track as a custom event for easier revenue attribution
  trackEvent({
    action: 'affiliate_click',
    category: 'monetization',
    label: competitorSlug,
    custom_data: {
      competitor_name: competitorName,
      affiliate_program: affiliateProgram,
      page_type: pageType,
      is_affiliate: !!affiliateProgram,
    },
  });
}

/**
 * Track performance metrics
 *
 * @param metric_name - Name of the performance metric
 * @param value - The measured value
 * @param unit - The unit of measurement
 */
export function trackPerformanceMetric(
  metric_name: string,
  value: number,
  unit: string = 'ms',
): void {
  trackEvent({
    action: 'performance_metric',
    category: 'performance',
    label: metric_name,
    value,
    custom_data: {
      unit,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Track Core Web Vitals and page performance metrics
 * Exported for testing and manual triggering
 */
export function trackCoreWebVitals(): void {
  try {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigation) {
      // Track page load time
      const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      if (pageLoadTime > 0) {
        trackPerformanceMetric('page_load_time', pageLoadTime);
      }

      // Track DOM content loaded time
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      if (domContentLoaded > 0) {
        trackPerformanceMetric('dom_content_loaded', domContentLoaded);
      }

      // Track time to interactive
      const timeToInteractive = navigation.domInteractive - navigation.fetchStart;
      if (timeToInteractive > 0) {
        trackPerformanceMetric('time_to_interactive', timeToInteractive);
      }
    }

    // Track First Contentful Paint (FCP) - use the actual FCP metric
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcpEntry?.startTime) {
      trackPerformanceMetric('first_contentful_paint', fcpEntry.startTime);
    }

    // Track Largest Contentful Paint (LCP) if available
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
            renderTime?: number;
            loadTime?: number;
          };
          if (lastEntry) {
            const lcp = lastEntry.renderTime || lastEntry.loadTime || 0;
            if (lcp > 0) {
              trackPerformanceMetric('largest_contentful_paint', lcp);
            }
            lcpObserver.disconnect();
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {
        // LCP not supported
      }
    }
  } catch (error) {
    console.warn('Performance metrics tracking error:', error);
  }
}

// Initialize analytics on client-side (non-blocking)
if (typeof window !== 'undefined') {
  // Use requestIdleCallback to avoid blocking main thread, fallback to setTimeout
  const windowWithIdleCallback = window as Window & {
    requestIdleCallback?: (callback: () => void) => number;
  };
  if ('requestIdleCallback' in window && windowWithIdleCallback.requestIdleCallback) {
    windowWithIdleCallback.requestIdleCallback(() => {
      trackCoreWebVitals();
    });
  } else {
    window.addEventListener('load', () => {
      setTimeout(trackCoreWebVitals, 0);
    });
  }
}
