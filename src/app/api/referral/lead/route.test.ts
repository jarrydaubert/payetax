/**
 * @jest-environment node
 *
 * Bug class: SECURITY-ABUSE
 * What bug will this test find?
 * - Origin allowlist regressions (CSRF bypass)
 * - Rate-limit bypass
 * - Validation/consent enforcement failures
 * - Resend configuration/response handling failures
 */

import { NextRequest } from 'next/server';

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimitWithPolicy: jest.fn(),
}));

const sendMock = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: sendMock,
    },
  })),
}));

const ORIGINAL_ENV = process.env;

function buildRequest(
  body: unknown,
  headers?: Record<string, string>,
  url = 'https://payetax.co.uk/api/referral/lead',
) {
  return new NextRequest(url, {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/json',
      ...headers,
    }),
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const validPayload = {
  email: 'lead@payetax.co.uk',
  salaryRange: '100k-125k',
  reason: 'tax-trap',
  isScottish: false,
  consent: true,
  source: 'test',
};

async function loadRoute(
  envOverrides: Record<string, string | undefined> = {},
  rateLimit = { allowed: true, reason: 'allowed' as const },
) {
  jest.resetModules();
  process.env = { ...ORIGINAL_ENV, ...envOverrides };
  const module = await import('./route');
  const { checkRateLimitWithPolicy } = jest.requireMock('@/lib/rateLimit') as {
    checkRateLimitWithPolicy: jest.Mock;
  };
  checkRateLimitWithPolicy.mockReturnValue(rateLimit);
  return module.POST;
}

describe('/api/referral/lead POST', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    sendMock.mockReset();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    consoleWarnSpy?.mockRestore();
    process.env = ORIGINAL_ENV;
  });

  it('rejects invalid origins', async () => {
    const POST = await loadRoute({ RESEND_API_KEY: 'test' });
    const request = buildRequest(validPayload, { origin: 'https://evil.com' });
    const response = await POST(request);

    expect(response.status).toBe(403);
  });

  it('rate limits when the limiter denies the client', async () => {
    const POST = await loadRoute(
      { RESEND_API_KEY: 'test' },
      { allowed: false, reason: 'rate_limited' },
    );
    const request = buildRequest(validPayload, {
      origin: 'https://payetax.co.uk',
      'x-forwarded-for': '1.2.3.4',
    });
    const response = await POST(request);
    const json = await response.json();
    const { checkRateLimitWithPolicy } = jest.requireMock('@/lib/rateLimit') as {
      checkRateLimitWithPolicy: jest.Mock;
    };

    expect(response.status).toBe(429);
    expect(json).toEqual({ error: 'Too many requests. Please try again later.' });
    expect(checkRateLimitWithPolicy).toHaveBeenCalledWith(
      'referral-lead:ip:1.2.3.4',
      { max: 3, window: 3600000 },
      'require_distributed_in_production',
    );
  });

  it('returns 503 when distributed rate-limit protection is unavailable in production', async () => {
    const POST = await loadRoute(
      {
        RESEND_API_KEY: 'test',
        REFERRAL_PARTNER_EMAIL: 'partner@example.com',
        NODE_ENV: 'production',
      },
      { allowed: false, reason: 'distributed_unavailable' },
    );
    const request = buildRequest(validPayload, {
      origin: 'https://payetax.co.uk',
      'x-forwarded-for': '1.2.3.4',
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json).toEqual({
      error: 'Lead service temporarily unavailable. Please try again later.',
    });
  });

  it('returns 503 when Resend is not configured', async () => {
    const POST = await loadRoute({ RESEND_API_KEY: undefined });
    const request = buildRequest(validPayload, { origin: 'https://payetax.co.uk' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json).toEqual({ error: 'Email service not configured' });
  });

  it('returns 503 when partner email is missing in production', async () => {
    const POST = await loadRoute({
      RESEND_API_KEY: 'test',
      REFERRAL_PARTNER_EMAIL: undefined,
      NODE_ENV: 'production',
    });
    const request = buildRequest(validPayload, { origin: 'https://payetax.co.uk' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json).toEqual({ error: 'Lead service not configured' });
  });

  it('rejects invalid JSON payloads', async () => {
    const POST = await loadRoute({ RESEND_API_KEY: 'test' });
    const request = buildRequest('{', { origin: 'https://payetax.co.uk' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: 'Invalid JSON body' });
  });

  it('rejects invalid request bodies', async () => {
    const POST = await loadRoute({ RESEND_API_KEY: 'test' });
    const request = buildRequest({ email: 'bad' }, { origin: 'https://payetax.co.uk' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid request');
    expect(json.details).toBeDefined();
  });

  it('rejects obvious non-browser user agents', async () => {
    const POST = await loadRoute({ RESEND_API_KEY: 'test' });
    const request = buildRequest(validPayload, {
      origin: 'https://payetax.co.uk',
      'user-agent': 'python-requests/2.32.3',
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: 'Invalid request' });
  });

  it('returns 500 when user confirmation email fails', async () => {
    sendMock.mockResolvedValue({ error: { message: 'failed' } });
    const POST = await loadRoute({ RESEND_API_KEY: 'test' });
    const request = buildRequest(validPayload, { origin: 'https://payetax.co.uk' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: 'Failed to send confirmation email' });
  });

  it('sends confirmation and partner emails for valid leads', async () => {
    sendMock.mockResolvedValue({ error: null });
    const POST = await loadRoute({
      RESEND_API_KEY: 'test',
      REFERRAL_PARTNER_EMAIL: 'partner@payetax.co.uk',
    });
    const request = buildRequest(validPayload, { origin: 'https://payetax.co.uk' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ success: true });
    expect(sendMock).toHaveBeenCalled();
  });
});
