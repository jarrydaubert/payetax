// src/lib/directorGuideAnalytics.ts
/**
 * Analytics tracking for Director Intelligence
 *
 * Tracks user journey through the guide while respecting privacy.
 * Revenue/expense values are bucketed, not logged raw.
 *
 * @module lib/directorGuideAnalytics
 * @see docs/business/DIRECTOR_INTELLIGENCE.md
 */

import { trackEvent } from '@/lib/analytics';

type StrategyKey = 'allSalary' | 'optimalMix' | 'allDividends';

/**
 * Bucket a revenue/profit value for privacy-safe analytics
 */
function bucketValue(value: number): string {
  if (value <= 0) return '0_or_loss';
  if (value < 25000) return 'under_25k';
  if (value < 50000) return '25k_50k';
  if (value < 100000) return '50k_100k';
  if (value < 250000) return '100k_250k';
  return 'over_250k';
}

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

/**
 * Track results shown (bucketed profit for privacy)
 */
export function trackResultsShown(
  profit: number,
  mode: 'normal' | 'survival' | 'modified_survival',
): void {
  const profitBucket = bucketValue(profit);

  trackEvent({
    action: 'guide_results_shown',
    category: 'director_guide',
    label: mode,
    custom_data: {
      profit_bucket: profitBucket,
    },
  });

  // New canonical naming for dashboard-level funnels.
  trackEvent({
    action: 'pro_calculator_completed',
    category: 'director_guide',
    label: mode,
    custom_data: {
      profit_bucket: profitBucket,
    },
  });
}

/**
 * Track strategy card selection in the pro calculator.
 */
export function trackStrategySelected(strategy: StrategyKey, isRecommended: boolean): void {
  trackEvent({
    action: 'pro_strategy_selected',
    category: 'director_guide',
    label: strategy,
    custom_data: {
      recommended: isRecommended,
    },
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

/**
 * Track when a calculation run is triggered.
 * Note: values are bucketed for privacy (no raw revenue/expenses).
 */
export function trackCalculationRun(params: {
  revenue: number;
  expenses: number;
  region: 'scotland' | 'rUK';
  includesVat: boolean;
}): void {
  trackEvent({
    action: 'guide_calculation_run',
    category: 'director_guide',
    label: 'auto',
    custom_data: {
      region: params.region,
      includes_vat: params.includesVat,
      revenue_bucket: bucketValue(params.revenue),
      expenses_bucket: bucketValue(params.expenses),
    },
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
 * Track warning displayed
 */
export function trackWarningShown(warningType: string): void {
  trackEvent({
    action: 'guide_warning_shown',
    category: 'director_guide',
    label: warningType,
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

/**
 * Track when monthly buffer shortfall warning condition is reached.
 */
export function trackBufferShortfallShown(): void {
  trackEvent({
    action: 'director_guide_buffer_shortfall_shown',
    category: 'director_guide',
    label: 'shown',
  });
}
