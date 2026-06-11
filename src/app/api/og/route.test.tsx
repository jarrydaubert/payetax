/**
 * @jest-environment node
 *
 * Bug class: SECURITY-ABUSE
 * What bug will this test find?
 * - Cache header regressions for expensive OG generation
 * - Rate-limit guard regressions for the OG renderer
 * - Hero content regressions in the single shared OG card
 */

import { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: jest.fn(() => true),
  createRateLimitHeaders: jest.fn((config?: { window?: number }, headers?: HeadersInit) => {
    const responseHeaders = new Headers(headers);
    responseHeaders.set(
      'Retry-After',
      String(Math.max(1, Math.ceil((config?.window ?? 60000) / 1000))),
    );
    return responseHeaders;
  }),
}));

type MockImageResponse = Response & {
  element?: unknown;
  options?: { headers?: Record<string, string> };
};

const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;

jest.mock('next/og', () => ({
  ImageResponse: class extends Response {
    element: unknown;
    options: { headers?: Record<string, string> };

    constructor(element: unknown, options: { headers?: Record<string, string> }) {
      super(null, { headers: options?.headers });
      this.element = element;
      this.options = options;
    }
  },
}));

function collectText(node: unknown, buffer: string[] = []): string[] {
  if (node === null || node === undefined) return buffer;
  if (typeof node === 'string' || typeof node === 'number') {
    buffer.push(String(node));
    return buffer;
  }
  if (Array.isArray(node)) {
    for (const child of node) {
      collectText(child, buffer);
    }
    return buffer;
  }
  if (typeof node === 'object' && 'props' in (node as { props?: unknown })) {
    const props = (node as { props?: { children?: unknown } }).props;
    if (props?.children) {
      collectText(props.children, buffer);
    }
  }
  return buffer;
}

function buildRequest(headers?: Record<string, string>) {
  const url = new URL('https://payetax.co.uk/api/og');
  return new NextRequest(url, { headers: new Headers(headers) });
}

describe('/api/og GET', () => {
  beforeEach(() => {
    mockCheckRateLimit.mockResolvedValue(true);
  });

  it('sets cache headers for OG responses', async () => {
    const { GET } = await import('./route');
    const response = (await GET(buildRequest())) as MockImageResponse;

    expect(response.headers.get('Cache-Control')).toContain('s-maxage');
  });

  it('renders the shared hero card', async () => {
    const { GET } = await import('./route');
    const response = (await GET(buildRequest())) as MockImageResponse;

    const text = collectText(response.element).join(' ');
    expect(text).toContain('UK PAYE tax calculator');
    expect(text).toContain('See your take-home pay');
    expect(text).toContain('Official HMRC rates');
    expect(text).toContain('payetax.co.uk');
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue(false);
    const { GET } = await import('./route');
    const response = await GET(buildRequest({ 'x-forwarded-for': '1.2.3.4' }));

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('60');
    expect(mockCheckRateLimit).toHaveBeenCalledWith('og:1.2.3.4', { max: 10, window: 60000 });
  });
});
