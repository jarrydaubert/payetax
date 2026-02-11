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

interface RateLimitConfig {
  max: number; // Maximum requests allowed
  window: number; // Time window in milliseconds
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

function runInMemoryCheck(key: string, config: RateLimitConfig): boolean {
  const requests = rateLimitCache.get(key) || 0;
  if (requests >= config.max) return false;
  rateLimitCache.set(key, requests + 1, { ttl: config.window });
  return true;
}

async function runUpstashCommand(parts: string[]): Promise<unknown> {
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

  const payload = (await response.json()) as { result?: unknown; error?: string };
  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload.result;
}

async function incrementDistributedCounter(key: string, windowMs: number): Promise<number | null> {
  if (!hasDistributedConfig()) {
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
  const distributedCount = await incrementDistributedCounter(key, config.window);
  if (distributedCount !== null) {
    return distributedCount <= config.max;
  }

  return runInMemoryCheck(key, config);
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
