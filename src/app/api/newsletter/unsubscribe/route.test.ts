/**
 * @jest-environment node
 *
 * Bug class: SECURITY-ABUSE
 * What bug will this test find?
 * - Missing secret handling in production
 * - Rate-limit bypass
 * - Token verification regressions
 * - Kit configuration failures
 */

import { NextRequest } from 'next/server';

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: jest.fn(),
  createRateLimitHeaders: jest.fn((config?: { window?: number }, headers?: HeadersInit) => {
    const responseHeaders = new Headers(headers);
    responseHeaders.set(
      'Retry-After',
      String(Math.max(1, Math.ceil((config?.window ?? 60000) / 1000))),
    );
    return responseHeaders;
  }),
}));

jest.mock('@/lib/newsletter/unsubscribeToken', () => ({
  resolveUnsubscribeSecret: jest.fn(),
  verifyUnsubscribeToken: jest.fn(),
}));

const unsubscribeEmailInKitMock = jest.fn();

jest.mock('@/lib/newsletter/kitClient', () => ({
  unsubscribeEmailInKit: (...args: unknown[]) => unsubscribeEmailInKitMock(...args),
}));

const ORIGINAL_ENV = process.env;
function buildRequest(
  params: Record<string, string>,
  headers?: Record<string, string>,
  urlBase = 'https://payetax.co.uk/api/newsletter/unsubscribe',
) {
  const url = new URL(urlBase);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url, {
    method: 'GET',
    headers: new Headers(headers),
  });
}

async function loadRoute(envOverrides: Record<string, string | undefined> = {}, rateLimit = true) {
  jest.resetModules();
  process.env = { ...ORIGINAL_ENV, ...envOverrides };
  const module = await import('./route');
  const { checkRateLimit } = jest.requireMock('@/lib/rateLimit') as {
    checkRateLimit: jest.Mock;
  };
  checkRateLimit.mockReturnValue(rateLimit);
  const { resolveUnsubscribeSecret, verifyUnsubscribeToken } = jest.requireMock(
    '@/lib/newsletter/unsubscribeToken',
  ) as {
    resolveUnsubscribeSecret: jest.Mock;
    verifyUnsubscribeToken: jest.Mock;
  };
  resolveUnsubscribeSecret.mockReturnValue('secret');
  verifyUnsubscribeToken.mockReturnValue('user@payetax.co.uk');
  return module.GET;
}

describe('/api/newsletter/unsubscribe GET', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    unsubscribeEmailInKitMock.mockReset();
    unsubscribeEmailInKitMock.mockResolvedValue(undefined);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    consoleWarnSpy?.mockRestore();
    process.env = ORIGINAL_ENV;
  });

  it('returns 503 when unsubscribe secret is missing in production', async () => {
    const GET = await loadRoute({
      NODE_ENV: 'production',
      UNSUBSCRIBE_SECRET: undefined,
      KIT_API_SECRET: 'kit-secret',
    });
    const request = buildRequest({ token: 'token' });
    const response = await GET(request);

    expect(response.status).toBe(503);
  });

  it('rate limits repeated unsubscribe attempts', async () => {
    const GET = await loadRoute({ KIT_API_SECRET: 'kit-secret' }, false);
    const request = buildRequest({ token: 'token' }, { 'x-forwarded-for': '1.2.3.4' });
    const response = await GET(request);
    const { checkRateLimit } = jest.requireMock('@/lib/rateLimit') as { checkRateLimit: jest.Mock };

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('60');
    expect(checkRateLimit).toHaveBeenCalledWith('newsletter-unsubscribe:1.2.3.4', {
      max: 5,
      window: 60000,
    });
  });

  it('rejects missing tokens', async () => {
    const GET = await loadRoute({ KIT_API_SECRET: 'kit-secret' });
    const request = buildRequest({});
    const response = await GET(request);
    const text = await response.text();

    expect(response.status).toBe(400);
    expect(text).toContain('Missing unsubscribe token');
  });

  it('rejects invalid tokens', async () => {
    const GET = await loadRoute({ KIT_API_SECRET: 'kit-secret' });
    const { verifyUnsubscribeToken } = jest.requireMock('@/lib/newsletter/unsubscribeToken') as {
      verifyUnsubscribeToken: jest.Mock;
    };
    verifyUnsubscribeToken.mockReturnValue(null);
    const request = buildRequest({ token: 'bad' });
    const response = await GET(request);
    const text = await response.text();

    expect(response.status).toBe(400);
    expect(text).toContain('Invalid or expired unsubscribe link');
  });

  it('returns 503 when Kit is not configured', async () => {
    const GET = await loadRoute({ KIT_API_SECRET: undefined });
    const request = buildRequest({ token: 'token' });
    const response = await GET(request);
    const text = await response.text();

    expect(response.status).toBe(503);
    expect(text).toContain('Service temporarily unavailable');
  });

  it('returns success for valid tokens', async () => {
    const GET = await loadRoute({ KIT_API_SECRET: 'kit-secret' });
    const request = buildRequest({ token: 'token' });
    const response = await GET(request);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('Unsubscribed');
    expect(unsubscribeEmailInKitMock).toHaveBeenCalledWith({
      apiSecret: 'kit-secret',
      email: 'user@payetax.co.uk',
    });
  });
});
