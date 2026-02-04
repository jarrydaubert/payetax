/**
 * @jest-environment node
 *
 * Bug class: SECURITY-ABUSE
 * What bug will this test find?
 * - Unauthorized IndexNow submissions (missing/invalid secret)
 * - Rate-limit bypass regressions
 * - URL validation gaps (non-HTTPS or off-domain URLs)
 * - Missing IndexNow configuration handling
 */

import { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { POST } from './route';

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: jest.fn(),
}));

const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;

const ORIGINAL_ENV = process.env;
let consoleErrorSpy: jest.SpyInstance;
let consoleLogSpy: jest.SpyInstance;
let consoleWarnSpy: jest.SpyInstance;

function buildRequest(body: unknown, headers?: Record<string, string>) {
  return new NextRequest('https://payetax.co.uk/api/indexnow', {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/json',
      ...headers,
    }),
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('/api/indexnow POST', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    mockCheckRateLimit.mockReturnValue(true);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    consoleLogSpy?.mockRestore();
    consoleWarnSpy?.mockRestore();
  });

  it('rejects unauthorized requests when secret is configured', async () => {
    process.env.NODE_ENV = 'production';
    process.env.INDEXNOW_SUBMIT_SECRET = 'secret';

    const request = buildRequest(
      { urls: ['https://payetax.co.uk/blog/valid'] },
      { 'x-indexnow-secret': 'wrong' },
    );
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ error: 'Unauthorized' });
  });

  it('rate limits requests when the limiter rejects the client', async () => {
    process.env.NODE_ENV = 'production';
    process.env.INDEXNOW_SUBMIT_SECRET = 'secret';
    mockCheckRateLimit.mockReturnValue(false);

    const request = buildRequest(
      { urls: ['https://payetax.co.uk/blog/valid'] },
      { 'x-indexnow-secret': 'secret' },
    );
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(429);
    expect(json).toEqual({ error: 'Too many requests. Please try again later.' });
  });

  it('rejects invalid JSON payloads', async () => {
    process.env.NODE_ENV = 'production';
    process.env.INDEXNOW_SUBMIT_SECRET = 'secret';

    const request = buildRequest('{', { 'x-indexnow-secret': 'secret' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: 'Invalid JSON' });
  });

  it('rejects URLs that are not HTTPS payetax.co.uk paths', async () => {
    process.env.NODE_ENV = 'production';
    process.env.INDEXNOW_SUBMIT_SECRET = 'secret';

    const request = buildRequest(
      { urls: ['http://example.com/'] },
      { 'x-indexnow-secret': 'secret' },
    );
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      error: 'All URLs must be valid HTTPS payetax.co.uk URLs',
      invalidCount: 1,
    });
  });

  it('returns a configured message when IndexNow key is missing', async () => {
    process.env.NODE_ENV = 'production';
    process.env.INDEXNOW_SUBMIT_SECRET = 'secret';
    process.env.INDEXNOW_KEY = undefined;

    const request = buildRequest(
      { urls: ['https://payetax.co.uk/blog/valid'] },
      { 'x-indexnow-secret': 'secret' },
    );
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: false,
      message: 'IndexNow not configured. Set INDEXNOW_KEY environment variable.',
    });
  });

  it('surfaces IndexNow submission failures', async () => {
    process.env.NODE_ENV = 'production';
    process.env.INDEXNOW_SUBMIT_SECRET = 'secret';
    process.env.INDEXNOW_KEY = 'indexnow-key';

    const fetchSpy = jest.spyOn(global, 'fetch').mockRejectedValue(new Error('boom'));

    const request = buildRequest(
      { urls: ['https://payetax.co.uk/blog/valid'] },
      { 'x-indexnow-secret': 'secret' },
    );
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(502);
    expect(json).toEqual({ success: false, error: 'Failed to reach IndexNow service' });

    fetchSpy.mockRestore();
  });

  it('submits valid URLs when configuration is present', async () => {
    process.env.NODE_ENV = 'production';
    process.env.INDEXNOW_SUBMIT_SECRET = 'secret';
    process.env.INDEXNOW_KEY = 'indexnow-key';

    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response('', {
        status: 200,
      }),
    );

    const request = buildRequest(
      { urls: ['https://payetax.co.uk/blog/valid', 'https://payetax.co.uk/tools'] },
      { 'x-indexnow-secret': 'secret' },
    );
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      submitted: 2,
      message: 'Successfully submitted 2 URLs to IndexNow',
    });

    fetchSpy.mockRestore();
  });
});
