// src/lib/directorGuideAnalytics.ts
/**
 * Analytics tracking for Director Intelligence
 *
 * Tracks user journey through the guide while respecting privacy.
 * Revenue/expense values are bucketed, not logged raw.
 *
 * @module lib/directorGuideAnalytics
 * @see docs/business/DIRECTOR_CALCULATOR_BUILD.md
 * @see docs/business/DIRECTOR_VARIABLE_INCOME_SPEC.md
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
 * Track location step completion
 */
export function trackLocationSelected(region: 'scotland' | 'rUK'): void {
  trackEvent({
    action: 'guide_location_selected',
    category: 'director_guide',
    label: region,
  });
}

/**
 * Track revenue step completion (bucketed for privacy)
 */
export function trackRevenueEntered(revenue: number): void {
  trackEvent({
    action: 'guide_revenue_entered',
    category: 'director_guide',
    label: bucketValue(revenue),
  });
}

/**
 * Track expenses step completion
 */
export function trackExpensesEntered(): void {
  trackEvent({
    action: 'guide_expenses_entered',
    category: 'director_guide',
    label: 'completed',
  });
}

/**
 * Track already taken step completion
 */
export function trackAlreadyTaken(hasAlreadyTaken: boolean): void {
  trackEvent({
    action: 'guide_already_taken',
    category: 'director_guide',
    label: hasAlreadyTaken ? 'yes' : 'no',
  });
}

/**
 * Track other income gate display
 */
export function trackOtherIncomeGateShown(): void {
  trackEvent({
    action: 'guide_other_income_gate_shown',
    category: 'director_guide',
    label: 'displayed',
  });
}

/**
 * Track user confirmed no other income
 */
export function trackOtherIncomeNone(): void {
  trackEvent({
    action: 'guide_other_income_none',
    category: 'director_guide',
    label: 'none_selected',
  });
}

/**
 * Track user has other income
 */
export function trackOtherIncomeHasOther(): void {
  trackEvent({
    action: 'guide_other_income_has_other',
    category: 'director_guide',
    label: 'has_other_income',
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
 * Track copy results button clicked
 */
export function trackResultsCopied(): void {
  trackEvent({
    action: 'guide_results_copied',
    category: 'director_guide',
    label: 'copy_button',
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
 * Track education accordion expanded
 */
export function trackEducationExpanded(topic: 'payroll' | 'dividends' | 'salary'): void {
  trackEvent({
    action: 'guide_education_expanded',
    category: 'director_guide',
    label: topic,
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
