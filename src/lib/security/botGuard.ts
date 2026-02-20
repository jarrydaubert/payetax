import type { NextRequest } from 'next/server';

const DEFAULT_HONEYPOT_KEYS = ['website', 'homepage', 'url', 'companyWebsite', 'botField'] as const;

const AUTOMATED_USER_AGENT_MARKERS = [
  'curl/',
  'wget/',
  'python-requests',
  'python-urllib',
  'httpclient',
  'go-http-client',
  'postmanruntime',
  'insomnia',
  'scrapy',
  'aiohttp',
  'node-fetch',
  'axios/',
  'apache-httpclient',
  'okhttp',
] as const;

export interface BotGuardOptions {
  honeypotKeys?: readonly string[];
}

/**
 * Returns a compact reason string for likely bot traffic, otherwise null.
 *
 * Designed to be low-risk: only blocks obvious automation markers and
 * non-empty honeypot fields.
 */
export function detectLikelyBotRequest(
  request: NextRequest,
  body: unknown,
  options: BotGuardOptions = {},
): string | null {
  const honeypotKeys = options.honeypotKeys ?? DEFAULT_HONEYPOT_KEYS;

  if (body && typeof body === 'object' && !Array.isArray(body)) {
    const bodyRecord = body as Record<string, unknown>;
    for (const key of honeypotKeys) {
      const value = bodyRecord[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return `honeypot:${key}`;
      }
    }
  }

  const userAgent = request.headers.get('user-agent')?.toLowerCase().trim();
  if (userAgent) {
    for (const marker of AUTOMATED_USER_AGENT_MARKERS) {
      if (userAgent.includes(marker)) {
        return `user-agent:${marker}`;
      }
    }
  }

  return null;
}
