// src/lib/rateLimit.ts
import { LRUCache } from 'lru-cache';

// In-memory rate limiter using LRU cache
// Stores IP addresses and request counts with automatic expiration

interface RateLimitConfig {
  max: number; // Maximum requests allowed
  window: number; // Time window in milliseconds
}

// Default: 10 requests per minute per IP
const DEFAULT_CONFIG: RateLimitConfig = {
  max: 10,
  window: 60000, // 1 minute
};

// Create LRU cache for rate limiting
// max: 500 entries (500 different IPs tracked simultaneously)
// ttl: 60000ms (1 minute) - entries expire after 1 minute
const rateLimitCache = new LRUCache<string, number>({
  max: 500,
  ttl: DEFAULT_CONFIG.window,
});

/**
 * Check if an IP address has exceeded the rate limit
 *
 * @param ip - IP address to check
 * @param config - Optional rate limit configuration
 * @returns true if request is allowed, false if rate limited
 *
 * @example
 * ```typescript
 * const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
 * if (!checkRateLimit(ipAddress)) {
 *   return NextResponse.json(
 *     { error: 'Too many requests. Please try again later.' },
 *     { status: 429 }
 *   );
 * }
 * ```
 */
export function checkRateLimit(
  ip: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): boolean {
  // Get current request count for this IP
  const requests = rateLimitCache.get(ip) || 0;

  // Check if limit exceeded
  if (requests >= config.max) {
    return false; // Rate limited
  }

  // Increment request count
  rateLimitCache.set(ip, requests + 1);

  return true; // Request allowed
}

/**
 * Get remaining requests for an IP address
 * Useful for adding rate limit headers to responses
 *
 * @param ip - IP address to check
 * @param config - Optional rate limit configuration
 * @returns Number of remaining requests
 */
export function getRemainingRequests(
  ip: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): number {
  const requests = rateLimitCache.get(ip) || 0;
  return Math.max(0, config.max - requests);
}

/**
 * Reset rate limit for an IP address
 * Useful for testing or manual overrides
 *
 * @param ip - IP address to reset
 */
export function resetRateLimit(ip: string): void {
  rateLimitCache.delete(ip);
}

/**
 * Clear all rate limit data
 * Useful for testing
 */
export function clearAllRateLimits(): void {
  rateLimitCache.clear();
}
