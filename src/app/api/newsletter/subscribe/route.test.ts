/**
 * @jest-environment node
 *
 * Bug class: SECURITY-ABUSE
 * What bug will this test find?
 * - Origin allowlist regressions (CSRF bypass)
 * - Rate-limit bypass
 * - Kit configuration errors
 * - JSON/Zod validation failures
 */

import { NextRequest } from 'next/server';

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: jest.fn(),
}));

const subscribeEmailToKitMock = jest.fn();

jest.mock('@/lib/newsletter/kitClient', () => ({
  subscribeEmailToKit: (...args: unknown[]) => subscribeEmailToKitMock(...args),
}));

const ORIGINAL_ENV = process.env;

function buildRequest(
  body: unknown,
  headers?: Record<string, string>,
  url = 'https://payetax.co.uk/api/newsletter/subscribe',
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

async function loadRoute(envOverrides: Record<string, string | undefined> = {}, rateLimit = true) {
  jest.resetModules();
  process.env = { ...ORIGINAL_ENV, ...envOverrides };
  const module = await import('./route');
  const { checkRateLimit } = jest.requireMock('@/lib/rateLimit') as {
    checkRateLimit: jest.Mock;
  };
  checkRateLimit.mockReturnValue(rateLimit);
  return module.POST;
}

describe('/api/newsletter/subscribe POST', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    subscribeEmailToKitMock.mockReset();
    subscribeEmailToKitMock.mockResolvedValue(undefined);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    process.env = ORIGINAL_ENV;
  });

  it('rejects invalid origins', async () => {
    const POST = await loadRoute({ KIT_API_SECRET: 'kit-secret', KIT_FORM_ID: '123' });
    const request = buildRequest({ email: 'test@payetax.co.uk' }, { origin: 'https://evil.com' });
    const response = await POST(request);

    expect(response.status).toBe(403);
  });

  it('rate limits when the limiter denies the client', async () => {
    const POST = await loadRoute({ KIT_API_SECRET: 'kit-secret', KIT_FORM_ID: '123' }, false);
    const request = buildRequest(
      { email: 'test@payetax.co.uk' },
      { origin: 'https://payetax.co.uk', 'x-forwarded-for': '1.2.3.4' },
    );
    const response = await POST(request);
    const json = await response.json();
    const { checkRateLimit } = jest.requireMock('@/lib/rateLimit') as { checkRateLimit: jest.Mock };

    expect(response.status).toBe(429);
    expect(json).toEqual({ error: 'Too many requests. Please try again later.' });
    expect(checkRateLimit).toHaveBeenCalledWith('newsletter-subscribe:1.2.3.4', {
      max: 3,
      window: 60000,
    });
  });

  it('returns 503 when Kit is not configured', async () => {
    const POST = await loadRoute({ KIT_API_SECRET: undefined, KIT_FORM_ID: '123' });
    const request = buildRequest(
      { email: 'test@payetax.co.uk' },
      { origin: 'https://payetax.co.uk' },
    );
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json).toEqual({ error: 'Newsletter not configured' });
  });

  it('returns 503 when Kit form is not configured', async () => {
    const POST = await loadRoute({ KIT_API_SECRET: 'kit-secret', KIT_FORM_ID: undefined });
    const request = buildRequest(
      { email: 'test@payetax.co.uk' },
      { origin: 'https://payetax.co.uk' },
    );
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json).toEqual({ error: 'Newsletter not configured' });
  });

  it('rejects invalid JSON payloads', async () => {
    const POST = await loadRoute({ KIT_API_SECRET: 'kit-secret', KIT_FORM_ID: '123' });
    const request = buildRequest('{', { origin: 'https://payetax.co.uk' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: 'Invalid JSON body' });
  });

  it('rejects invalid email payloads', async () => {
    const POST = await loadRoute({ KIT_API_SECRET: 'kit-secret', KIT_FORM_ID: '123' });
    const request = buildRequest({ email: 'bad' }, { origin: 'https://payetax.co.uk' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid email address');
  });

  it('subscribes via Kit and returns success', async () => {
    const POST = await loadRoute({ KIT_API_SECRET: 'kit-secret', KIT_FORM_ID: '123' });
    const request = buildRequest(
      { email: 'test@payetax.co.uk' },
      { origin: 'https://payetax.co.uk' },
    );
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(subscribeEmailToKitMock).toHaveBeenCalledWith({
      apiSecret: 'kit-secret',
      formId: '123',
      email: 'test@payetax.co.uk',
    });
  });

  it('returns 500 when Kit subscribe fails', async () => {
    subscribeEmailToKitMock.mockRejectedValue(new Error('Kit failed'));
    const POST = await loadRoute({ KIT_API_SECRET: 'kit-secret', KIT_FORM_ID: '123' });
    const request = buildRequest(
      { email: 'test@payetax.co.uk' },
      { origin: 'https://payetax.co.uk' },
    );
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: 'Internal server error' });
  });
});
