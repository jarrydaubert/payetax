#!/usr/bin/env bun

/**
 * Production verification helper for distributed rate limiting.
 *
 * Required env:
 * - RATE_LIMIT_VERIFY_BASE_URL (e.g. https://payetax.co.uk)
 * - RATE_LIMIT_HEALTH_SECRET
 */

type RateLimitDiagnostics = {
  configured: boolean;
  backend: 'distributed' | 'in-memory';
  upstashPing: 'ok' | 'failed' | 'not_configured';
  lastFallbackReason: 'missing_config' | 'upstash_error' | null;
  lastFallbackAt: string | null;
  upstashError?: string;
};

type HealthPayload = {
  ok: boolean;
  checkedAt: string;
  diagnostics: RateLimitDiagnostics;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

async function verifyHealth(baseUrl: string, secret: string): Promise<RateLimitDiagnostics> {
  const response = await fetch(`${baseUrl}/api/ops/rate-limit-health`, {
    headers: { 'x-rate-limit-health-secret': secret },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Health endpoint failed (${response.status})`);
  }

  const payload = (await response.json()) as HealthPayload;
  if (!payload.ok) {
    throw new Error('Health endpoint returned non-ok payload');
  }

  return payload.diagnostics;
}

async function verifyThrottle(
  baseUrl: string,
): Promise<{ statuses: number[]; throttled: boolean }> {
  const statuses: number[] = [];
  const probeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=invalid&probe=${Date.now()}`;

  for (let i = 0; i < 7; i += 1) {
    const response = await fetch(probeUrl, {
      headers: { 'User-Agent': 'PayeTaxRateLimitProbe/1.0' },
      cache: 'no-store',
    });
    statuses.push(response.status);
  }

  return { statuses, throttled: statuses.includes(429) };
}

async function main(): Promise<void> {
  const baseUrl = getRequiredEnv('RATE_LIMIT_VERIFY_BASE_URL').replace(/\/$/, '');
  const secret = getRequiredEnv('RATE_LIMIT_HEALTH_SECRET');

  console.log(`🔎 Verifying rate limiting on ${baseUrl}`);

  const diagnostics = await verifyHealth(baseUrl, secret);
  console.log(`   - configured: ${diagnostics.configured}`);
  console.log(`   - backend: ${diagnostics.backend}`);
  console.log(`   - upstashPing: ${diagnostics.upstashPing}`);
  console.log(`   - lastFallbackReason: ${diagnostics.lastFallbackReason ?? 'none'}`);
  console.log(`   - lastFallbackAt: ${diagnostics.lastFallbackAt ?? 'never'}`);

  if (
    !diagnostics.configured ||
    diagnostics.backend !== 'distributed' ||
    diagnostics.upstashPing !== 'ok'
  ) {
    throw new Error('Distributed rate limiter is not healthy/configured');
  }

  const throttleCheck = await verifyThrottle(baseUrl);
  console.log(`   - throttle statuses: ${throttleCheck.statuses.join(', ')}`);

  if (!throttleCheck.throttled) {
    throw new Error('Expected at least one 429 during throttle probe');
  }

  console.log('✅ Distributed rate-limit verification passed');
}

main().catch((error) => {
  console.error(
    `❌ Rate-limit verification failed: ${error instanceof Error ? error.message : 'unknown error'}`,
  );
  process.exit(1);
});
