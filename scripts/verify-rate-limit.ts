#!/usr/bin/env bun

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
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

async function main(): Promise<void> {
  const baseUrl = getRequiredEnv('RATE_LIMIT_VERIFY_BASE_URL').replace(/\/$/, '');
  const secret = getRequiredEnv('RATE_LIMIT_HEALTH_SECRET');

  console.log(`Verifying rate limiting on ${baseUrl}`);

  const response = await fetch(`${baseUrl}/api/ops/rate-limit-health`, {
    headers: { 'x-rate-limit-health-secret': secret },
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`Health endpoint failed (${response.status})`);

  const payload = (await response.json()) as HealthPayload;
  if (!payload.ok) throw new Error('Health endpoint returned non-ok payload');

  const diagnostics = payload.diagnostics;
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

  console.log('Distributed rate-limit verification passed');
}

main().catch((error) => {
  console.error(
    `Rate-limit verification failed: ${error instanceof Error ? error.message : 'unknown error'}`,
  );
  process.exit(1);
});
