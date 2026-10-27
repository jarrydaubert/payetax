import type { Breadcrumb, Event } from '@sentry/nextjs';
import { sanitizeTelemetryText, sanitizeTelemetryUrl } from '@/lib/telemetryUrl';

// Custom data is opt-in. Unknown/nested properties (including captured Error properties)
// must not turn a diagnostic into a copy of calculator state or an email request.
const CONTEXT_FIELDS: Record<string, readonly string[]> = {
  calculator: ['stage'],
  error_details: ['digest'],
  request: ['url'],
  operationalFailure: ['operation', 'route', 'reason', 'statusCode'],
  api: ['endpoint', 'method', 'statusCode', 'responseBodyShape'],
  performance: ['operation', 'duration', 'dataSize'],
  runtime: ['name', 'version', 'type', 'environment'],
  browser: ['name', 'version'],
  os: ['name', 'version'],
  device: ['family', 'model', 'brand', 'arch', 'orientation'],
  app: ['app_identifier', 'app_version', 'app_build'],
  trace: ['trace_id', 'span_id', 'parent_span_id', 'op', 'status', 'origin'],
  react: ['version', 'componentStack'],
  culture: ['locale', 'timezone', 'calendar'],
  browser_info: ['viewport', 'screen', 'orientation', 'online', 'connection'],
  server_info: [
    'platform',
    'arch',
    'uptime',
    'rss',
    'heapTotal',
    'heapUsed',
    'external',
    'arrayBuffers',
  ],
};
const TAG_FIELDS = [
  'error_type',
  'issue_type',
  'operation',
  'route',
  'reason',
  'status_code',
  'endpoint',
  'method',
  'feature',
  'error_boundary',
  'router_kind',
  'request_path',
];
const BREADCRUMB_FIELDS = [
  'operation',
  'source',
  'stage',
  'resultShape',
  'anomaly_count',
  'anomaly_codes',
  'anomaly_fields',
  'field',
  'location',
  'attemptedValueShape',
  'errorCount',
  'errorCodes',
  'method',
  'status_code',
  'url',
  'from',
  'to',
];
const URL_FIELDS = new Set(['url', 'from', 'to', 'endpoint', 'route', 'request_path']);

function pickFields(
  value: unknown,
  fields: readonly string[],
): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};
  if (!value || typeof value !== 'object') return result;
  const record = value as Record<string, unknown>;
  for (const key of fields) {
    const item = record[key];
    if (key === 'digest') {
      if (typeof item === 'string' && /^[a-z0-9_-]{1,128}$/i.test(item)) result[key] = item;
      continue;
    }
    if (key === 'error_boundary') {
      if (typeof item === 'string' && ['component', 'global', 'tools', 'blog'].includes(item))
        result[key] = item;
      continue;
    }
    if (key === 'router_kind') {
      if (item === 'App Router' || item === 'Pages Router') result[key] = item;
      continue;
    }
    if (URL_FIELDS.has(key)) {
      const url = sanitizeTelemetryUrl(item);
      if (url) result[key] = url;
    } else if (
      typeof item === 'string' ||
      typeof item === 'boolean' ||
      (typeof item === 'number' && Number.isFinite(item))
    ) {
      result[key] = typeof item === 'string' ? sanitizeTelemetryText(item) : item;
    }
  }
  return result;
}

export function sanitizeSentryBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  if (breadcrumb.category === 'console' || breadcrumb.category?.startsWith('ui.')) return null;
  return {
    ...breadcrumb,
    message: breadcrumb.message ? sanitizeTelemetryText(breadcrumb.message) : undefined,
    data: pickFields(breadcrumb.data, BREADCRUMB_FIELDS),
  };
}

export function sanitizeSentryEvent<T extends Event>(event: T): T {
  event.user = undefined;
  event.extra = undefined;
  if (event.message) event.message = sanitizeTelemetryText(event.message);
  if (event.request) {
    event.request = {
      url: sanitizeTelemetryUrl(event.request.url),
      method: event.request.method,
      headers: Object.fromEntries(
        Object.entries(event.request.headers ?? {}).flatMap(([key, value]) => {
          if (key.toLowerCase() === 'user-agent') return [[key, value]];
          if (key.toLowerCase() === 'referer') {
            const url = sanitizeTelemetryUrl(value);
            return url ? [[key, url]] : [];
          }
          return [];
        }),
      ),
    };
  }
  if (event.contexts) {
    event.contexts = Object.fromEntries(
      Object.entries(event.contexts).flatMap(([key, value]) =>
        CONTEXT_FIELDS[key] ? [[key, pickFields(value, CONTEXT_FIELDS[key])]] : [],
      ),
    );
  }
  if (event.tags) event.tags = pickFields(event.tags, TAG_FIELDS);
  if (event.breadcrumbs)
    event.breadcrumbs = event.breadcrumbs.flatMap((breadcrumb) => {
      const safe = sanitizeSentryBreadcrumb(breadcrumb);
      return safe ? [safe] : [];
    });
  if (event.transaction) {
    const match = event.transaction.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) (.+)$/);
    event.transaction = match
      ? `${match[1]} ${sanitizeTelemetryUrl(match[2]) ?? '/'}`
      : sanitizeTelemetryUrl(event.transaction);
  }
  for (const exception of event.exception?.values ?? []) {
    if (exception.value) exception.value = sanitizeTelemetryText(exception.value);
    for (const frame of exception.stacktrace?.frames ?? []) {
      if (frame.filename && /[?#]|^https?:|^app:/.test(frame.filename))
        frame.filename = sanitizeTelemetryUrl(frame.filename);
      if (frame.abs_path && /[?#]|^https?:|^app:/.test(frame.abs_path))
        frame.abs_path = sanitizeTelemetryUrl(frame.abs_path);
      frame.vars = undefined;
    }
  }
  return event;
}
