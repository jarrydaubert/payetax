// src/lib/rateLimit.ts
/**
 * Server-side rate limiter.
 *
 * Preferred mode (production):
 * - Distributed counters via Upstash Redis REST API.
 *
 * Fallback mode:
 * - In-memory LRU cache (used when distributed config is missing/unavailable).
 *
 * SECURITY NOTE:
 * - x-forwarded-for must be trusted only behind a proxy/CDN that sanitizes it.
 * - On Vercel, this header is edge-controlled.
 *
 * Required env vars for distributed mode:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */
import { LRUCache } from 'lru-cache';

export interface RateLimitConfig {
  max: number; // Maximum requests allowed
  window: number; // Time window in milliseconds
}

export type RateLimitBackend = 'distributed' | 'in-memory';
export type RateLimitFallbackReason = 'missing_config' | 'upstash_error';
export type RateLimitFallbackPolicy =
  | 'allow_in_memory_fallback'
  | 'require_distributed_in_production';

export interface RateLimitCheckResult {
  allowed: boolean;
  backend: RateLimitBackend;
  fallbackPolicy: RateLimitFallbackPolicy;
  reason: 'allowed' | 'rate_limited' | 'distributed_unavailable';
}

export interface RateLimitDiagnostics {
  configured: boolean;
  backend: RateLimitBackend;
  upstashPing: 'ok' | 'failed' | 'not_configured';
  lastFallbackReason: RateLimitFallbackReason | null;
  lastFallbackAt: string | null;
  upstashError?: string;
}

interface UpstashResponse {
  result?: string | number | boolean;
  error?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isUpstashResponse(value: unknown): value is UpstashResponse {
  if (!isRecord(value)) {
    return false;
  }

  const { error, result } = value;
  return (
    (error === undefined || typeof error === 'string') &&
    (result === undefined ||
      typeof result === 'string' ||
      typeof result === 'number' ||
      typeof result === 'boolean')
  );
}

// Default: 10 requests per minute per IP
const DEFAULT_CONFIG: RateLimitConfig = {
  max: 10,
  window: 60000, // 1 minute
};

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const DISTRIBUTED_KEY_PREFIX = 'payetax:ratelimit:v1';

let loggedMissingDistributedConfig = false;
let loggedDistributedFailure = false;
let lastFallbackReason: RateLimitFallbackReason | null = null;
let lastFallbackAt: string | null = null;

// Create LRU cache for rate limiting
// max: 500 entries (500 different IPs tracked simultaneously)
// ttl: 60000ms (1 minute) - entries expire after 1 minute
const rateLimitCache = new LRUCache<string, number>({
  max: 500,
  ttl: DEFAULT_CONFIG.window,
});

function hasDistributedConfig(): boolean {
  return Boolean(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN);
}

function markFallback(reason: RateLimitFallbackReason): void {
  lastFallbackReason = reason;
  lastFallbackAt = new Date().toISOString();
}

function runInMemoryCheck(key: string, config: RateLimitConfig): boolean {
  const requests = rateLimitCache.get(key) || 0;
  if (requests >= config.max) return false;
  rateLimitCache.set(key, requests + 1, { ttl: config.window });
  return true;
}

async function runUpstashCommand(parts: string[]): Promise<UpstashResponse['result']> {
  if (!(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN)) {
    throw new Error('Distributed rate limiter not configured');
  }

  const encodedCommand = parts.map((part) => encodeURIComponent(part)).join('/');
  const response = await fetch(`${UPSTASH_REDIS_REST_URL}/${encodedCommand}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Upstash request failed: ${response.status}`);
  }

  const payload: unknown = await response.json();
  if (!isUpstashResponse(payload)) {
    throw new Error('Upstash response was not valid JSON');
  }

  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload.result;
}

async function incrementDistributedCounter(key: string, windowMs: number): Promise<number | null> {
  if (!hasDistributedConfig()) {
    markFallback('missing_config');
    if (process.env.NODE_ENV === 'production' && !loggedMissingDistributedConfig) {
      loggedMissingDistributedConfig = true;
      console.error(
        '[rateLimit] Missing UPSTASH_REDIS_REST_URL/TOKEN; falling back to in-memory limits.',
      );
    }
    return null;
  }

  try {
    const distributedKey = `${DISTRIBUTED_KEY_PREFIX}:${key}`;
    const countValue = await runUpstashCommand(['INCR', distributedKey]);
    const count = Number(countValue);
    if (!Number.isFinite(count)) throw new Error('Invalid distributed counter result');

    // Set TTL only on first hit for this key/window.
    if (count === 1) {
      await runUpstashCommand(['PEXPIRE', distributedKey, String(windowMs)]);
    }

    return count;
  } catch (error) {
    markFallback('upstash_error');
    if (process.env.NODE_ENV === 'production' && !loggedDistributedFailure) {
      loggedDistributedFailure = true;
      const message = error instanceof Error ? error.message : 'unknown error';
      console.error(`[rateLimit] Distributed limiter failed; using in-memory fallback: ${message}`);
    }
    return null;
  }
}

/**
 * Check if an IP address has exceeded the rate limit
 *
 * @param ip - IP address to check
 * @param config - Optional rate limit configuration
 * @returns true if request is allowed, false if rate limited
 *
 * @example
 * ```typescript
 * const clientId = request.headers.get('x-forwarded-for') || 'unknown';
 * if (!(await checkRateLimit(clientId))) {
 *   return NextResponse.json(
 *     { error: 'Too many requests. Please try again later.' },
 *     { status: 429 }
 *   );
 * }
 * ```
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
): Promise<boolean> {
  const result = await checkRateLimitWithPolicy(key, config);
  return result.allowed;
}

export async function checkRateLimitWithPolicy(
  key: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
  fallbackPolicy: RateLimitFallbackPolicy = 'allow_in_memory_fallback',
): Promise<RateLimitCheckResult> {
  const distributedCount = await incrementDistributedCounter(key, config.window);
  if (distributedCount !== null) {
    return {
      allowed: distributedCount <= config.max,
      backend: 'distributed',
      fallbackPolicy,
      reason: distributedCount <= config.max ? 'allowed' : 'rate_limited',
    };
  }

  if (
    process.env.NODE_ENV === 'production' &&
    fallbackPolicy === 'require_distributed_in_production'
  ) {
    return {
      allowed: false,
      backend: 'in-memory',
      fallbackPolicy,
      reason: 'distributed_unavailable',
    };
  }

  const allowed = runInMemoryCheck(key, config);
  return {
    allowed,
    backend: 'in-memory',
    fallbackPolicy,
    reason: allowed ? 'allowed' : 'rate_limited',
  };
}

export function getRetryAfterSeconds(config: RateLimitConfig = DEFAULT_CONFIG): string {
  return String(Math.max(1, Math.ceil(config.window / 1000)));
}

export function createRateLimitHeaders(
  config: RateLimitConfig = DEFAULT_CONFIG,
  headers?: HeadersInit,
): Headers {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('Retry-After', getRetryAfterSeconds(config));
  return responseHeaders;
}

/**
 * Runtime diagnostics used for production verification of distributed rate limiting.
 */
export async function getRateLimitDiagnostics(): Promise<RateLimitDiagnostics> {
  const configured = hasDistributedConfig();

  if (!configured) {
    return {
      configured: false,
      backend: 'in-memory',
      upstashPing: 'not_configured',
      lastFallbackReason,
      lastFallbackAt,
    };
  }

  try {
    await runUpstashCommand(['PING']);
    return {
      configured: true,
      backend: 'distributed',
      upstashPing: 'ok',
      lastFallbackReason,
      lastFallbackAt,
    };
  } catch (error) {
    return {
      configured: true,
      backend: 'in-memory',
      upstashPing: 'failed',
      lastFallbackReason,
      lastFallbackAt,
      upstashError: error instanceof Error ? error.message : 'unknown error',
    };
  }
}

/**
 * Get remaining requests for an identifier from local fallback cache.
 * Note: This does not reflect distributed counters.
 *
 * @param key - Identifier to check
 * @param config - Optional rate limit configuration
 * @returns Number of remaining requests
 */
export function getRemainingRequests(
  key: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
): number {
  const requests = rateLimitCache.get(key) || 0;
  return Math.max(0, config.max - requests);
}

/**
 * Reset rate limit for an identifier in local fallback cache.
 * Useful for testing or manual overrides
 *
 * @param key - Identifier to reset
 */
export function resetRateLimit(key: string): void {
  rateLimitCache.delete(key);
}

/**
 * Clear all rate limit data
 * Useful for testing
 */
export function clearAllRateLimits(): void {
  rateLimitCache.clear();
}
