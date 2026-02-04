// src/lib/security/origin.ts

import type { NextRequest } from 'next/server';

type HeaderSource =
  | Pick<NextRequest, 'headers'>
  | { headers: Headers }
  | { headers: { get(name: string): string | null } };

function parseHost(urlLike: string): string | null {
  try {
    return new URL(urlLike).host;
  } catch {
    return null;
  }
}

function hostMatches(needleHost: string, allowedHost: string): boolean {
  return needleHost === allowedHost || needleHost.endsWith(`.${allowedHost}`);
}

export function getDefaultCsrfAllowedHosts(): string[] {
  const hosts = new Set<string>(['payetax.co.uk', 'www.payetax.co.uk']);

  // Allow Vercel preview deployments without turning on a broad *.vercel.app wildcard.
  if (process.env.VERCEL_URL) hosts.add(process.env.VERCEL_URL);
  if (process.env.NEXT_PUBLIC_VERCEL_URL) hosts.add(process.env.NEXT_PUBLIC_VERCEL_URL);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    const host = parseHost(siteUrl);
    if (host) hosts.add(host);
  }

  // Local dev / tests.
  if (process.env.NODE_ENV !== 'production') {
    hosts.add('localhost:3000');
  }

  return [...hosts];
}

/**
 * Basic origin/referrer allowlist check for CSRF protection.
 *
 * - Allows requests with no origin/referer (same-origin, non-browser clients).
 * - If origin/referer is present, it must be a valid URL whose host matches the allowlist.
 */
export function isValidRequestOrigin(
  request: HeaderSource,
  allowedHosts: string[] = getDefaultCsrfAllowedHosts(),
  options: { allowMissingOrigin?: boolean } = {},
): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const allowMissingOrigin = options.allowMissingOrigin ?? false;

  if (!(origin || referer)) return allowMissingOrigin;

  if (origin) {
    const host = parseHost(origin);
    if (!host) return false;
    return allowedHosts.some((h) => hostMatches(host, h));
  }

  if (referer) {
    const host = parseHost(referer);
    if (!host) return false;
    return allowedHosts.some((h) => hostMatches(host, h));
  }

  return false;
}
