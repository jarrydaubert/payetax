// src/lib/analytics.ts
/**
 * Analytics tracking utilities for PayeTax
 * Includes event tracking, performance monitoring, and SEO analytics
 *
 * IMPORTANT: This module has NO side effects on import.
 * Call initCoreWebVitals() from Analytics.tsx after consent is granted.
 *
 * GA4 notes:
 * - Parameters are flattened (no custom_parameters wrapper)
 * - Use short, consistent param names (category, label, source, target)
 * - Register custom dimensions in GA4 admin for reporting
 *
 * @module lib/analytics
 */

import type { AnalyticsAction, SEOActionType } from '@/lib/analyticsEvents';
import { isAnalyticsConsented } from '@/lib/cookieUtils';

export type { AnalyticsAction, SEOActionType } from '@/lib/analyticsEvents';

/** High-signal events that warrant Sentry breadcrumbs */
const HIGH_SIGNAL_ACTIONS: ReadonlySet<string> = new Set(['calculator_error']);

const shouldLogWarnings = process.env.NODE_ENV !== 'production';

function logAnalyticsWarning(message: string, error: unknown): void {
  if (shouldLogWarnings) {
    console.warn(message, error);
  }
}

/**
 * Lazily load Sentry breadcrumb helper so analytics tracking does not force
 * Sentry into the initial client bundle.
 */
function addAnalyticsBreadcrumb(message: string, data: Record<string, unknown>): void {
  import('@/lib/sentry')
    .then(({ addBreadcrumb }) => {
      addBreadcrumb('analytics', {
        message,
        level: 'info',
        data,
      });
    })
    .catch(() => {
      // Ignore breadcrumb failures - analytics must stay non-blocking.
    });
}

export interface AnalyticsEvent {
  action: AnalyticsAction;
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
  timestamp?: string;
  destination?: string;
  // Note: user_agent removed - GA captures device info automatically, raw UA is a privacy concern
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
    if (!isAnalyticsConsented()) {
      return;
    }

    const pagePath = typeof window !== 'undefined' ? window.location.pathname : '';

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      // biome-ignore lint/suspicious/noConsole: Dev logging for analytics debugging
      console.log('🔍 SEO Analytics:', action, data);
    }

    // Only breadcrumb high-signal events to avoid Sentry noise
    if (HIGH_SIGNAL_ACTIONS.has(action)) {
      addAnalyticsBreadcrumb(`SEO action: ${action}`, {
        action,
        source: data.source,
        target: data.target,
        page_path: pagePath,
      });
    }

    // Track with Google Analytics if available
    // GA4: flatten all params (no custom_parameters wrapper)
    if (window?.gtag) {
      window.gtag('event', action, {
        category: 'seo_actions',
        label: data.source || 'unknown',
        source: data.source,
        target: data.target,
        action_type: data.action_type,
        destination: data.destination,
        page_path: pagePath,
      });
    }
  } catch (error) {
    logAnalyticsWarning('Analytics tracking error:', error);
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
    if (!isAnalyticsConsented()) {
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      // biome-ignore lint/suspicious/noConsole: Dev logging for analytics debugging
      console.log('📊 Analytics Event:', event);
    }

    // Only breadcrumb high-signal events to avoid Sentry noise
    if (HIGH_SIGNAL_ACTIONS.has(event.action)) {
      addAnalyticsBreadcrumb(`Analytics event: ${event.action}`, {
        action: event.action,
        category: event.category,
        label: event.label,
        value: event.value,
      });
    }

    // Track with Google Analytics if available
    // GA4: flatten all params (no custom_parameters wrapper)
    if (window?.gtag) {
      window.gtag('event', event.action, {
        category: event.category || 'general',
        label: event.label,
        value: event.value,
        ...(event.custom_data ?? {}),
      });
    }
  } catch (error) {
    logAnalyticsWarning('Analytics tracking error:', error);
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
 * Track lightweight GA4 page timing metrics.
 *
 * Call this from Analytics.tsx after consent is granted.
 * Do NOT call on module load (avoid side effects).
 *
 * Core Web Vitals are collected by Vercel Speed Insights. Keep GA4 timing
 * deliberately narrow so consented sessions do not duplicate LCP/FCP beacons
 * or run extra PerformanceObserver work on every page.
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
  } catch (error) {
    logAnalyticsWarning('Performance metrics tracking error:', error);
  }
}

/**
 * Initialize lightweight GA4 page timing tracking (non-blocking).
 *
 * Call this from Analytics.tsx once after consent is granted.
 * Uses requestIdleCallback to avoid blocking main thread.
 */
export function initCoreWebVitals(): void {
  if (typeof window === 'undefined') return;

  const windowWithIdleCallback = window as Window & {
    requestIdleCallback?: (callback: () => void) => number;
  };

  if (windowWithIdleCallback.requestIdleCallback) {
    windowWithIdleCallback.requestIdleCallback(() => {
      trackCoreWebVitals();
    });
  } else {
    // Fallback for Safari
    setTimeout(trackCoreWebVitals, 0);
  }
}

// NOTE: No module-level side effects!
// Analytics.tsx should call initCoreWebVitals() after consent is granted.
