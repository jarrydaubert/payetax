// src/lib/analytics.ts
/**
 * Analytics tracking utilities for PayeTax
 * Includes event tracking, performance monitoring, and SEO analytics
 *
 * @module lib/analytics
 */

// Types for analytics events
export type SEOActionType =
  | 'external_link'
  | 'download'
  | 'share'
  | 'print'
  | 'scroll_to_top'
  | 'navigation'
  | 'form_interaction';

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
    // Enhanced data object with browser info
    const enhancedData = {
      ...data,
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: new Date().toISOString(),
    };

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 SEO Analytics:', action, enhancedData);
    }

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
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event);
    }

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
  data?: Record<string, unknown>
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
    if (process.env.NODE_ENV === 'development') {
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
 * Track performance metrics
 *
 * @param metric_name - Name of the performance metric
 * @param value - The measured value
 * @param unit - The unit of measurement
 */
export function trackPerformanceMetric(
  metric_name: string,
  value: number,
  unit: string = 'ms'
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

// Initialize analytics on client-side
if (typeof window !== 'undefined') {
  // Track initial page load performance
  window.addEventListener('load', () => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        trackPerformanceMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
        trackPerformanceMetric(
          'dom_content_loaded',
          navigation.domContentLoadedEventEnd - navigation.fetchStart
        );
        trackPerformanceMetric(
          'first_contentful_paint',
          navigation.loadEventEnd - navigation.fetchStart
        );
      }
    }
  });
}
