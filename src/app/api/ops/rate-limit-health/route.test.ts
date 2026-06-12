/**
 * @jest-environment node
 *
 * Bug class: OBSERVABILITY-CONTRACT
 * What bug will this test find?
 * - Production health endpoint accidentally left open.
 * - Missing production secret reported as healthy.
 * - Healthy route stops returning the shared Upstash diagnostics.
 */

import { NextRequest } from 'next/server';
import { setNodeEnv } from '@/test/env';

const ORIGINAL_ENV = process.env;
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

const getRateLimitDiagnosticsMock = jest.fn();

const HEALTH_DIAGNOSTICS = {
  configured: true,
  backend: 'distributed',
  upstashPing: 'ok',
  upstashReadWriteDelete: 'ok',
  lastFallbackReason: null,
  lastFallbackAt: null,
};

function buildRequest(secret?: string): NextRequest {
  const headers = new Headers();
  if (secret) {
    headers.set('x-rate-limit-health-secret', secret);
  }

  return new NextRequest('https://payetax.co.uk/api/ops/rate-limit-health', {
    method: 'GET',
    headers,
  });
}

async function loadRoute({ nodeEnv = 'test', secret }: { nodeEnv?: string; secret?: string } = {}) {
  jest.resetModules();
  process.env = { ...ORIGINAL_ENV };
  if (secret === undefined) {
    delete process.env.RATE_LIMIT_HEALTH_SECRET;
  } else {
    process.env.RATE_LIMIT_HEALTH_SECRET = secret;
  }
  setNodeEnv(nodeEnv);

  getRateLimitDiagnosticsMock.mockReset();
  getRateLimitDiagnosticsMock.mockResolvedValue(HEALTH_DIAGNOSTICS);
  jest.doMock('@/lib/rateLimit', () => ({
    getRateLimitDiagnostics: getRateLimitDiagnosticsMock,
  }));

  const module = await import('./route');
  return module.GET;
}

describe('/api/ops/rate-limit-health GET', () => {
  afterEach(() => {
    jest.dontMock('@/lib/rateLimit');
    jest.resetModules();
    process.env = ORIGINAL_ENV;
    setNodeEnv(ORIGINAL_NODE_ENV);
  });

  it('returns 503 in production when the health secret is missing', async () => {
    const GET = await loadRoute({ nodeEnv: 'production' });

    const response = await GET(buildRequest());
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(json).toEqual({ error: 'Rate-limit health check is not configured' });
    expect(getRateLimitDiagnosticsMock).not.toHaveBeenCalled();
  });

  it('rejects missing or wrong production secrets without running diagnostics', async () => {
    const GET = await loadRoute({ nodeEnv: 'production', secret: 'expected-secret' });

    const missingSecretResponse = await GET(buildRequest());
    const wrongSecretResponse = await GET(buildRequest('wrong-secret'));

    await expect(missingSecretResponse.json()).resolves.toEqual({ error: 'Unauthorized' });
    await expect(wrongSecretResponse.json()).resolves.toEqual({ error: 'Unauthorized' });
    expect(missingSecretResponse.status).toBe(401);
    expect(wrongSecretResponse.status).toBe(401);
    expect(getRateLimitDiagnosticsMock).not.toHaveBeenCalled();
  });

  it('returns shared rate-limit diagnostics when the production secret matches', async () => {
    const GET = await loadRoute({ nodeEnv: 'production', secret: 'expected-secret' });

    const response = await GET(buildRequest('expected-secret'));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(json).toEqual({
      ok: true,
      checkedAt: expect.any(String),
      diagnostics: HEALTH_DIAGNOSTICS,
    });
    expect(Date.parse(json.checkedAt)).not.toBeNaN();
    expect(getRateLimitDiagnosticsMock).toHaveBeenCalledTimes(1);
  });

  it('allows local checks without a secret outside production', async () => {
    const GET = await loadRoute({ nodeEnv: 'test' });

    const response = await GET(buildRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.diagnostics).toEqual(HEALTH_DIAGNOSTICS);
    expect(getRateLimitDiagnosticsMock).toHaveBeenCalledTimes(1);
  });

  it('requires the configured secret outside production when one is set', async () => {
    const GET = await loadRoute({ nodeEnv: 'test', secret: 'local-secret' });

    const unauthorized = await GET(buildRequest());
    const authorized = await GET(buildRequest('local-secret'));

    expect(unauthorized.status).toBe(401);
    expect(authorized.status).toBe(200);
    expect(getRateLimitDiagnosticsMock).toHaveBeenCalledTimes(1);
  });
});
