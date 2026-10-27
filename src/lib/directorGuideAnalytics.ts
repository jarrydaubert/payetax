// src/lib/directorGuideAnalytics.ts
/**
 * Analytics tracking for Director Intelligence
 *
 * Tracks user journey through the guide while respecting privacy.
 * Counts interactions without recording financial inputs, outcomes or warning conditions.
 *
 * @module lib/directorGuideAnalytics
 * @see docs/business/DIRECTOR_INTELLIGENCE.md
 */

import { trackEvent } from '@/lib/analytics';

/**
 * Track when guide page loads
 */
export function trackGuideStarted(): void {
  trackEvent({
    action: 'guide_started',
    category: 'director_guide',
    label: 'page_load',
  });

  // New canonical naming for dashboard-level funnels.
  trackEvent({
    action: 'pro_calculator_started',
    category: 'director_guide',
    label: 'page_load',
  });
}

/** Count result displays without recording profitability or financial mode. */
export function trackResultsShown(): void {
  trackEvent({
    action: 'guide_results_shown',
    category: 'director_guide',
    label: 'shown',
  });

  // New canonical naming for dashboard-level funnels.
  trackEvent({
    action: 'pro_calculator_completed',
    category: 'director_guide',
    label: 'shown',
  });
}

/**
 * Track strategy card selection in the pro calculator.
 */
export function trackStrategySelected(): void {
  trackEvent({
    action: 'pro_strategy_selected',
    category: 'director_guide',
    label: 'selected',
  });
}

/**
 * Track key-date calendar file downloads.
 */
export function trackCalendarDownloaded(): void {
  trackEvent({
    action: 'pro_calendar_downloaded',
    category: 'director_guide',
    label: 'ics',
  });
}

/** Count calculation runs without receiving the calculation inputs. */
export function trackCalculationRun(): void {
  trackEvent({
    action: 'guide_calculation_run',
    category: 'director_guide',
    label: 'auto',
  });
}

/**
 * Track email dialog opened.
 */
export function trackEmailOpened(): void {
  trackEvent({
    action: 'guide_email_opened',
    category: 'director_guide',
    label: 'dialog_open',
  });
}

/**
 * Track successful email send.
 */
export function trackEmailSent(): void {
  trackEvent({
    action: 'guide_email_sent',
    category: 'director_guide',
    label: 'success',
  });
}

/**
 * Track guide reset
 */
export function trackGuideReset(): void {
  trackEvent({
    action: 'guide_reset',
    category: 'director_guide',
    label: 'start_over',
  });
}

/**
 * Track annual/monthly mode toggle.
 */
export function trackModeChanged(mode: 'annual' | 'monthly'): void {
  trackEvent({
    action: 'director_guide_mode_changed',
    category: 'director_guide',
    label: mode,
  });
}

/**
 * Track when a monthly safe draw is calculated.
 */
export function trackSafeDrawCalculated(): void {
  trackEvent({
    action: 'director_guide_safe_draw_calculated',
    category: 'director_guide',
    label: 'calculated',
  });
}
