/**
 * @jest-environment node
 *
 * Bug class: SECURITY-ABUSE
 * What bug will this test find?
 * - Origin allowlist regressions (CSRF bypass)
 * - Rate-limit bypass
 * - Validation guard regressions
 * - Resend configuration/response handling failures
 */

import { NextRequest } from 'next/server';
jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: jest.fn(),
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

const baseStrategy = {
  name: 'All salary',
  salary: 10000,
  dividends: 0,
  pension: 0,
  companyCarBIK: 0,
  employerNI: 0,
  employeeNI: 0,
  incomeTax: 0,
  corporationTax: 0,
  dividendTax: 0,
  studentLoan: 0,
  totalPersonalTax: 0,
  companyCost: 10000,
  takeHome: 10000,
  effectiveRate: 10,
};

const validPayload = {
  email: 'director@payetax.co.uk',
  results: {
    grossProfit: 100000,
    strategies: {
      allSalary: baseStrategy,
      optimalMix: { ...baseStrategy, name: 'Baseline Mix' },
      allDividends: { ...baseStrategy, name: 'All dividends' },
    },
    recommended: 'optimalMix',
    savingsVsAllSalary: 1000,
  },
  taxYear: '2025-2026',
};

async function loadRoute(
  envOverrides: Record<string, string | undefined> = {},
  rateLimit = true,
) {
  jest.resetModules();
  process.env = { ...ORIGINAL_ENV, ...envOverrides };
  const module = await import('./route');
  const { checkRateLimit } = jest.requireMock('@/lib/rateLimit') as {
    checkRateLimit: jest.Mock;
  };
  checkRateLimit.mockReturnValue(rateLimit);
  return module.POST;
}

describe('/api/send-director-results POST', () => {
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
    const POST = await loadRoute({ RESEND_API_KEY: 'test' }, false);
    const request = buildRequest(validPayload, { origin: 'https://payetax.co.uk' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(429);
    expect(json).toEqual({ error: 'Too many requests. Please try again later.' });
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
    expect(json.error).toBe('Invalid request data');
    expect(json.details).toBeDefined();
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
