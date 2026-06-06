/**
 * @jest-environment node
 *
 * Bug class: SECURITY-ABUSE
 * What bug will this test find?
 * - Origin allowlist regressions (CSRF bypass)
 * - Rate-limit bypass
 * - Validation/size guard regressions
 * - outbound email configuration/response handling failures
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

const sendResultsEmailMock = jest.fn();

jest.mock('@/lib/email/outboundResultsDelivery', () => ({
  sendPayeResultsEmail: (...args: unknown[]) => sendResultsEmailMock(...args),
}));

const mockCaptureOperationalFailure = jest.fn();

jest.mock('@/lib/sentry', () => ({
  captureOperationalFailureAndFlush: (...args: unknown[]) => mockCaptureOperationalFailure(...args),
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
    sendResultsEmailMock.mockReset();
    sendResultsEmailMock.mockResolvedValue({ ok: true });
    mockCaptureOperationalFailure.mockReset();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    process.env = ORIGINAL_ENV;
  });

  it('rejects invalid origins', async () => {
    const POST = await loadRoute({ BREVO_API_KEY: 'test' });
    const request = buildRequest(validPayload, { origin: 'https://evil.com' });
    const response = await POST(request);

    expect(response.status).toBe(403);
  });

  it('rate limits when the limiter denies the client', async () => {
    const POST = await loadRoute(
      { BREVO_API_KEY: 'test' },
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
    expect(mockCaptureOperationalFailure).not.toHaveBeenCalled();
    expect(checkRateLimitWithPolicy).toHaveBeenCalledWith(
      'send-results:1.2.3.4',
      { max: 5, window: 60000 },
      'require_distributed_in_production',
    );
  });

  it('returns 503 when distributed rate-limit protection is unavailable in production', async () => {
    const POST = await loadRoute(
      { BREVO_API_KEY: 'test', NODE_ENV: 'production' },
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
    expect(mockCaptureOperationalFailure).toHaveBeenCalledWith({
      operation: 'send-results',
      route: '/api/send-results',
      reason: 'rate_limit_distributed_unavailable',
      statusCode: 503,
    });
  });

  it('returns 503 when outbound email is not configured', async () => {
    sendResultsEmailMock.mockResolvedValue({ ok: false, reason: 'not_configured' });
    const POST = await loadRoute();
    const request = buildRequest(validPayload, { origin: 'https://payetax.co.uk' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json).toEqual({ error: 'Email service not configured' });
    expect(mockCaptureOperationalFailure).toHaveBeenCalledWith({
      operation: 'send-results',
      route: '/api/send-results',
      reason: 'email_not_configured',
      statusCode: 503,
    });
  });

  it('rejects invalid JSON payloads', async () => {
    const POST = await loadRoute({ BREVO_API_KEY: 'test' });
    const request = buildRequest('{', { origin: 'https://payetax.co.uk' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: 'Invalid JSON body' });
  });

  it('rejects invalid request bodies', async () => {
    const POST = await loadRoute({ BREVO_API_KEY: 'test' });
    const request = buildRequest({ email: 'bad' }, { origin: 'https://payetax.co.uk' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid request');
    expect(json.details).toBeDefined();
    expect(mockCaptureOperationalFailure).not.toHaveBeenCalled();
  });

  it('rejects likely bot requests using honeypot fields', async () => {
    const POST = await loadRoute({ BREVO_API_KEY: 'test' });
    const request = buildRequest(
      { ...validPayload, homepage: 'https://spam.example' },
      { origin: 'https://payetax.co.uk' },
    );
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: 'Invalid request' });
    expect(mockCaptureOperationalFailure).not.toHaveBeenCalled();
  });

  it('sends the email when inputs are valid', async () => {
    sendResultsEmailMock.mockResolvedValue({ ok: true });
    const POST = await loadRoute({ BREVO_API_KEY: 'test' });
    const request = buildRequest(validPayload, { origin: 'https://payetax.co.uk' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ success: true });
    expect(sendResultsEmailMock).toHaveBeenCalledTimes(1);
    expect(mockCaptureOperationalFailure).not.toHaveBeenCalled();
  });

  it('returns 500 when outbound email delivery fails', async () => {
    sendResultsEmailMock.mockResolvedValue({ ok: false, reason: 'delivery_failed' });
    const POST = await loadRoute({ BREVO_API_KEY: 'test' });
    const request = buildRequest(validPayload, { origin: 'https://payetax.co.uk' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: 'Failed to send email' });
    expect(mockCaptureOperationalFailure).toHaveBeenCalledWith({
      operation: 'send-results',
      route: '/api/send-results',
      reason: 'email_delivery_failed',
      statusCode: 500,
    });
  });
});
