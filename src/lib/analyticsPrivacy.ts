import { ANALYTICS_EVENT_ACTIONS, SEO_ACTIONS } from '@/lib/analyticsEvents';
import { sanitizeTelemetryUrl } from '@/lib/telemetryUrl';

const ACTIONS = new Set<string>([...ANALYTICS_EVENT_ACTIONS, ...SEO_ACTIONS, 'page_view']);
const SEO_ACTION_SET = new Set<string>(SEO_ACTIONS);
const LABELS: Record<string, readonly string[]> = {
  calculator_action: ['calculate', 'reset', 'update', 'error'],
  calculator_usage: ['paye'],
  calculator_start: ['paye_calculator'],
  calculator_completed: ['paye_calculator'],
  calculator_error: [
    'calculation_anomaly_primary',
    'calculation_anomaly_previous_year',
    'calculation_anomaly_what_if',
  ],
  guide_started: ['page_load'],
  pro_calculator_started: ['page_load'],
  guide_results_shown: ['shown'],
  pro_calculator_completed: ['shown'],
  pro_strategy_selected: ['selected'],
  pro_calendar_downloaded: ['ics'],
  guide_calculation_run: ['auto'],
  guide_email_opened: ['dialog_open'],
  guide_email_sent: ['success'],
  guide_reset: ['start_over'],
  director_guide_mode_changed: ['annual', 'monthly'],
  director_guide_safe_draw_calculated: ['calculated'],
  result_shared: ['email'],
  result_viewed: ['Yearly', 'Monthly', '4-Weekly', 'Fortnightly', 'Weekly', 'Daily', 'Hourly'],
  pwa_installed: ['appinstalled'],
  performance_metric: ['page_load_time', 'dom_content_loaded', 'time_to_interactive'],
  scroll_depth: ['25%', '50%', '75%', '100%'],
};

function safeSeoValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return /^[a-z][a-z0-9_-]{0,159}$/i.test(value) ? value : sanitizeTelemetryUrl(value);
}

function safeSlug(value: unknown): string | undefined {
  return typeof value === 'string' &&
    value.length <= 160 &&
    /[a-z]/.test(value) &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
    ? value
    : undefined;
}

/** Unknown custom parameters are dropped, including nested objects and financial derivatives. */
export function sanitizeAnalyticsParameters(
  action: string,
  params: Record<string, unknown>,
): Record<string, string | number | boolean> | null {
  if (!ACTIONS.has(action)) return null;
  const result: Record<string, string | number | boolean> = {};
  const copyText = (key: string) => {
    const value = params[key];
    if (typeof value === 'string') result[key] = value;
  };
  if (
    [
      'general',
      'content',
      'funnel',
      'quality',
      'engagement',
      'calculator',
      'director_guide',
      'performance',
      'seo_actions',
    ].includes(String(params.category))
  )
    result.category = String(params.category);
  const label = typeof params.label === 'string' ? params.label : undefined;
  const safeLabel = LABELS[action]?.includes(label ?? '')
    ? label
    : SEO_ACTION_SET.has(action)
      ? safeSeoValue(label)
      : action === 'blog_article_read'
        ? safeSlug(label)
        : action === 'time_on_page'
          ? sanitizeTelemetryUrl(label)
          : undefined;
  if (safeLabel !== undefined) result.label = safeLabel;
  if (
    ['performance_metric', 'scroll_depth', 'time_on_page'].includes(action) &&
    (action !== 'performance_metric' ||
      LABELS.performance_metric?.includes(String(params.label))) &&
    typeof params.value === 'number' &&
    Number.isFinite(params.value)
  )
    result.value = params.value;
  if (action === 'performance_metric' && params.unit === 'ms') result.unit = 'ms';
  if (action === 'result_viewed') {
    if (typeof params.selected === 'boolean') result.selected = params.selected;
    if (
      Number.isInteger(params.visible_period_count) &&
      Number(params.visible_period_count) >= 1 &&
      Number(params.visible_period_count) <= 7
    ) {
      result.visible_period_count = Number(params.visible_period_count);
    }
  }
  if (action === 'calculator_error') {
    if (params.error_type === 'calculation_anomaly') result.error_type = params.error_type;
    if (['primary', 'previous_year', 'what_if'].includes(String(params.source))) copyText('source');
    if (Number.isInteger(params.anomaly_count) && Number(params.anomaly_count) > 0)
      result.anomaly_count = Number(params.anomaly_count);
    if (
      typeof params.anomaly_codes === 'string' &&
      /^(non_finite_value|negative_component|invalid_effective_rate|negative_net_pay)(,(non_finite_value|negative_component|invalid_effective_rate|negative_net_pay))*$/.test(
        params.anomaly_codes,
      )
    )
      copyText('anomaly_codes');
  }
  if (action === 'blog_article_read') {
    const slug = safeSlug(params.slug);
    if (slug) result.slug = slug;
  }
  if (SEO_ACTION_SET.has(action)) {
    for (const key of ['source', 'target', 'action_type', 'destination']) {
      const value = safeSeoValue(params[key]);
      if (value !== undefined) result[key] = value;
    }
  }
  for (const key of ['page_path', 'page_location', 'page_referrer']) {
    if (key in params) result[key] = sanitizeTelemetryUrl(params[key]) ?? '';
  }
  if (action === 'page_view') copyText('page_title');
  return result;
}
