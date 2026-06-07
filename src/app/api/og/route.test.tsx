/**
 * @jest-environment node
 *
 * Bug class: SECURITY-ABUSE
 * What bug will this test find?
 * - Input constraint regressions (salary/title/description clamping)
 * - Cache header regressions for expensive OG generation
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

function buildRequest(search: Record<string, string>, headers?: Record<string, string>) {
  const url = new URL('https://payetax.co.uk/api/og');
  for (const [key, value] of Object.entries(search)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url, { headers: new Headers(headers) });
}

describe('/api/og GET', () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReturnValue(true);
  });

  it('sets cache headers for OG responses', async () => {
    const { GET } = await import('./route');
    const response = (await GET(buildRequest({}))) as MockImageResponse;

    expect(response.headers.get('Cache-Control')).toContain('s-maxage');
  });

  it('renders the results view when salary and takeHome are valid', async () => {
    const { GET } = await import('./route');
    const response = (await GET(
      buildRequest({ salary: '50000', takeHome: '40000' }),
    )) as MockImageResponse;

    const text = collectText(response.element).join(' ');
    expect(text).toContain('Gross Salary');
    expect(text).toContain('Take-Home Pay');
    expect(text).toContain('Illustrative only.');
  });

  it('falls back to the default view when salary is out of bounds', async () => {
    const { GET } = await import('./route');
    const response = (await GET(
      buildRequest({ salary: '999999999', takeHome: '40000' }),
    )) as MockImageResponse;

    const text = collectText(response.element).join(' ');
    expect(text).toContain('See Your Take-Home Pay');
    expect(text).not.toContain('Gross Salary');
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockReturnValue(false);
    const { GET } = await import('./route');
    const response = await GET(buildRequest({}, { 'x-forwarded-for': '1.2.3.4' }));

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('60');
    expect(mockCheckRateLimit).toHaveBeenCalledWith('og:1.2.3.4', { max: 10, window: 60000 });
  });
});
