// src/lib/analytics.ts
/**
 * Analytics utilities for tracking user interactions and SEO metrics
 *
 * This module provides functions for tracking various user events and
 * interactions with the application, respecting user privacy preferences.
 * It integrates with Google Analytics and ensures events are only tracked
 * when user consent has been provided.
 */

/**
 * Track a user event with Google Analytics
 *
 * Only tracks events if the user has consented to analytics cookies.
 * Safe to call on both client and server, though only works on client.
 *
 * @param eventName - Name of the event to track
 * @param properties - Additional properties for the event
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  // Skip if not in browser or gtag not available
  if (typeof window === 'undefined' || !window.gtag) return;

  // Only track if consent is given
  const hasConsent =
    window.consentMode?.isConsentGiven || localStorage.getItem('cookie-consent') === 'accepted';

  if (!hasConsent) return;

  // Track the event with Google Analytics
  window.gtag('event', eventName, properties);
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
  trackEvent('calculator_action', {
    event_category: 'calculator',
    event_label: action,
    ...data,
  });
}

/**
 * Track a form submission event
 *
 * @param formName - Name of the form
 * @param success - Whether the submission was successful
 * @param data - Additional form data
 */
export function trackFormSubmission(
  formName: string,
  success: boolean,
  data?: Record<string, unknown>
): void {
  trackEvent('form_submission', {
    event_category: 'forms',
    event_label: formName,
    success,
    ...data,
  });
}

/**
 * Track an SEO-relevant action
 *
 * @param action - The SEO-relevant action
 * @param data - Additional action data
 */
export function trackSEOAction(
  action: 'external_link' | 'download' | 'share' | 'print',
  data?: Record<string, unknown>
): void {
  trackEvent('seo_action', {
    event_category: 'seo',
    event_label: action,
    ...data,
  });
}

/**
 * Initialize enhanced ecommerce tracking
 *
 * For potential future use with premium features or products.
 * Only initializes if user has provided consent.
 */
export function initEnhancedEcommerce(): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  // Check for consent before initializing
  const hasConsent =
    window.consentMode?.isConsentGiven || localStorage.getItem('cookie-consent') === 'accepted';

  if (!hasConsent) return;

  // Initialize enhanced ecommerce
  window.gtag('require', 'ec');
}

/**
 * Track a page view event
 *
 * @param pageTitle - Title of the page
 * @param pagePath - Path of the page (defaults to current path)
 */
export function trackPageView(pageTitle: string, pagePath?: string): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  // Only track if consent is given
  const hasConsent =
    window.consentMode?.isConsentGiven || localStorage.getItem('cookie-consent') === 'accepted';

  if (!hasConsent) return;

  // Track page view
  window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
    page_title: pageTitle,
    page_path: pagePath || window.location.pathname,
  });
}
