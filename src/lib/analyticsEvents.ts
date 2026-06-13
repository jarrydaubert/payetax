/**
 * Canonical analytics event contract for PayeTax.
 *
 * Keep this list as the single source of truth for event names.
 * CI enforces this contract via scripts/check-analytics-events.ts.
 */

export const ANALYTICS_EVENT_ACTIONS = [
  'blog_article_read',
  'calculator_action',
  'calculator_completed',
  'calculator_error',
  'calculator_start',
  'calculator_usage',
  'director_guide_buffer_shortfall_shown',
  'director_guide_mode_changed',
  'director_guide_safe_draw_calculated',
  'guide_calculation_run',
  'guide_email_opened',
  'guide_email_sent',
  'guide_reset',
  'guide_results_shown',
  'guide_started',
  'guide_warning_shown',
  'performance_metric',
  'pro_calculator_completed',
  'pro_calculator_started',
  'pro_calendar_downloaded',
  'pro_strategy_selected',
  'pwa_installed',
  'result_shared',
  'result_viewed',
  'scroll_depth',
  'time_on_page',
] as const;

export type AnalyticsAction = (typeof ANALYTICS_EVENT_ACTIONS)[number];

export const SEO_ACTIONS = [
  'download',
  'external_link',
  'form_interaction',
  'navigation',
  'print',
  'scroll_to_top',
  'share',
] as const;

export type SEOActionType = (typeof SEO_ACTIONS)[number];
