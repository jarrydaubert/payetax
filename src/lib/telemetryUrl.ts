/** Telemetry may identify a page, but must never carry URL credentials, queries or fragments. */
export function sanitizeTelemetryUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  const relative = value.startsWith('/') && !value.startsWith('//');
  if (!(relative || /^(https?:|app:)\/\//i.test(value))) return undefined;
  try {
    const url = new URL(value, 'https://payetax.invalid');
    if (relative) return url.pathname;
    return `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    return undefined;
  }
}

export function getTelemetryPageContext() {
  if (typeof window === 'undefined') return {};
  return {
    page_path: window.location.pathname,
    page_location: `${window.location.origin}${window.location.pathname}`,
    page_referrer: sanitizeTelemetryUrl(document.referrer) ?? '',
  };
}

export function sanitizeVercelTelemetry<T extends { url: string }>(event: T): T | null {
  // The vendor adds document.referrer after this hook and exposes no referrer override.
  // Suppress the event if that inaccessible field would carry private URL data.
  const referrer = typeof document === 'undefined' ? '' : document.referrer;
  if (referrer && sanitizeTelemetryUrl(referrer) !== referrer) return null;
  const url = sanitizeTelemetryUrl(event.url);
  return url ? { ...event, url } : null;
}

/** Error messages/component stacks can contain URLs outside structured URL fields. */
export function sanitizeTelemetryText(value: string): string {
  return value.replace(/(?:https?:\/\/|app:\/\/|\/|[?#])[^\s"'<>]+/g, (url) =>
    url.startsWith('?')
      ? '[query omitted]'
      : url.startsWith('#')
        ? '[fragment omitted]'
        : (sanitizeTelemetryUrl(url) ?? '[URL omitted]'),
  );
}
