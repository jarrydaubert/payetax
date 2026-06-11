/**
 * @jest-environment node
 *
 * Bug class: SECURITY-ABUSE
 * What bug will this test find?
 * - Origin allowlist regressions (CSRF bypass)
 * - Rate-limit bypass
 * - Validation guard regressions
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
  sendDirectorResultsEmail: (...args: unknown[]) => sendResultsEmailMock(...args),
}));

const mockCaptureOperationalFailure = jest.fn();

jest.mock('@/lib/sentry', () => ({
  captureOperationalFailureAndFlush: (...args: unknown[]) => mockCaptureOperationalFailure(...args),
}));

const ORIGINAL_ENV = process.env;
function buildRequest(
  body: unknown,
  headers?: Record<string, string>,
  url = 'https://payetax.co.uk/api/send-director-results',
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
  email: 'director@payetax.co.uk',
  input: {
    region: 'rUK',
    revenue: 100000,
    includesVat: false,
    expenses: 20000,
    lossesBroughtForward: 0,
    otherIncome: 0,
    employmentAllowance: false,
    studentLoanPlans: [],
    pensionContribution: 0,
    companyCarBIK: 0,
    minimumSalaryRequirement: 0,
    hasOtherPAYEEmployment: false,
    ytdSalary: 0,
    ytdDividends: 0,
    ytdDrawings: 0,
    yourSetupSalary: 0,
    yourSetupDividends: 0,
  },
  taxYear: '2025-2026',
};

async function loadRoute(
  envOverrides: Record<string, string | undefined> = {},
  rateLimit: {
    allowed: boolean;
    reason: 'allowed' | 'rate_limited' | 'distributed_unavailable';
  } = { allowed: true, reason: 'allowed' },
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

describe('/api/send-director-results POST', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    sendResultsEmailMock.mockReset();
    sendResultsEmailMock.mockResolvedValue({ ok: true });
    mockCaptureOperationalFailure.mockReset();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    consoleWarnSpy?.mockRestore();
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
      'send-director-results:1.2.3.4',
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
      operation: 'send-director-results',
      route: '/api/send-director-results',
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
      operation: 'send-director-results',
      route: '/api/send-director-results',
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
    expect(json.error).toBe('Invalid request data');
    expect(json.details).toBeDefined();
    expect(mockCaptureOperationalFailure).not.toHaveBeenCalled();
  });

  it('rejects likely bot requests using honeypot fields', async () => {
    const POST = await loadRoute({ BREVO_API_KEY: 'test' });
    const request = buildRequest(
      { ...validPayload, website: 'https://spam.example' },
      { origin: 'https://payetax.co.uk' },
    );
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: 'Invalid request' });
    expect(sendResultsEmailMock).not.toHaveBeenCalled();
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
      operation: 'send-director-results',
      route: '/api/send-director-results',
      reason: 'email_delivery_failed',
      statusCode: 500,
    });
  });
});
