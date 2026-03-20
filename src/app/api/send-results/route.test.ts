/**
 * @jest-environment node
 *
 * Bug class: SECURITY-ABUSE
 * What bug will this test find?
 * - Origin allowlist regressions (CSRF bypass)
 * - Rate-limit bypass
 * - Validation/size guard regressions
 * - Resend configuration/response handling failures
 */

import { NextRequest } from 'next/server';

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimitWithPolicy: jest.fn(),
  createRateLimitHeaders: jest.fn((config?: { window?: number }, headers?: HeadersInit) => {
    const responseHeaders = new Headers(headers);
    responseHeaders.set(
      'Retry-After',
      String(Math.max(1, Math.ceil((config?.window ?? 60000) / 1000))),
    );
    return responseHeaders;
  }),
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
  url = 'https://payetax.co.uk/api/send-results',
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
  email: 'test@payetax.co.uk',
  input: {
    salary: 50000,
    payPeriod: 'annually',
    taxYear: '2025-2026',
    taxCode: '1257L',
    isScottish: false,
    isMarried: false,
    partnerGrossWage: 0,
    isBlind: false,
    age: 30,
    payNoNI: false,
    pensionContribution: 0,
    pensionContributionType: 'percentage',
    studentLoanPlans: 'none',
    niCategory: 'A',
    hoursPerWeek: 40,
    allowancesDeductions: 0,
    incomeSources: [],
  },
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

describe('/api/send-results POST', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    sendMock.mockReset();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
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
    expect(response.headers.get('Retry-After')).toBe('60');
    expect(checkRateLimitWithPolicy).toHaveBeenCalledWith(
      'send-results:1.2.3.4',
      { max: 5, window: 60000 },
      'require_distributed_in_production',
    );
  });

  it('returns 503 when distributed rate-limit protection is unavailable in production', async () => {
    const POST = await loadRoute(
      { RESEND_API_KEY: 'test', NODE_ENV: 'production' },
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
      error: 'Email service temporarily unavailable. Please try again later.',
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

  it('rejects likely bot requests using honeypot fields', async () => {
    const POST = await loadRoute({ RESEND_API_KEY: 'test' });
    const request = buildRequest(
      { ...validPayload, homepage: 'https://spam.example' },
      { origin: 'https://payetax.co.uk' },
    );
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: 'Invalid request' });
  });

  it('sends the email when inputs are valid', async () => {
    sendMock.mockResolvedValue({ error: null });
    const POST = await loadRoute({ RESEND_API_KEY: 'test' });
    const request = buildRequest(validPayload, { origin: 'https://payetax.co.uk' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ success: true });
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it('returns 500 when Resend returns an error', async () => {
    sendMock.mockResolvedValue({ error: { message: 'failed' } });
    const POST = await loadRoute({ RESEND_API_KEY: 'test' });
    const request = buildRequest(validPayload, { origin: 'https://payetax.co.uk' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: 'Failed to send email' });
  });
});
