import type { Event } from '@sentry/nextjs';

const MONITORED_EXACT_PATHS = new Set(['/', '/api/send-results', '/api/send-director-results']);

const MONITORED_PATH_PREFIXES = ['/blog', '/tools'];

function stripMethod(value: string): string {
  const methodMatch = value.match(
    /^(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+([^\s?#]+)(?:[?#]\S*)?/i,
  );
  return methodMatch?.[1] ?? value;
}

export function normalizeSentryPath(value: string | null | undefined): string | null {
  if (!value) return null;

  const trimmed = stripMethod(value.trim());
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed, 'https://payetax.local');
    const path = url.pathname || '/';
    return path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
  } catch {
    const firstPathIndex = trimmed.indexOf('/');
    if (firstPathIndex === -1) return null;
    const rawPath = trimmed.slice(firstPathIndex).split(/[?#]/)[0] || '/';
    return rawPath !== '/' && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;
  }
}

export function isSentryMonitoredPath(value: string | null | undefined): boolean {
  const path = normalizeSentryPath(value);
  if (!path) return false;

  return (
    MONITORED_EXACT_PATHS.has(path) ||
    MONITORED_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
  );
}

function getTagValue(event: Event, tagName: string): string | null {
  const value = event.tags?.[tagName];
  return typeof value === 'string' ? value : null;
}

export function shouldDropSentryEventForUnmonitoredPath(
  event: Event,
  fallbackPath?: string | null,
): boolean {
  const candidates = [
    fallbackPath,
    event.request?.url,
    event.transaction,
    getTagValue(event, 'route'),
    getTagValue(event, 'request_path'),
  ];

  const path = candidates
    .map(normalizeSentryPath)
    .find((candidate): candidate is string => Boolean(candidate));

  // Keep pathless events. Explicit calculator utilities already tag their feature,
  // and dropping unknown events would hide unexpected SDK shapes.
  if (!path) return false;

  return !isSentryMonitoredPath(path);
}
