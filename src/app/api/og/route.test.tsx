/**
 * @jest-environment node
 *
 * Bug class: SECURITY-ABUSE
 * What bug will this test find?
 * - Input constraint regressions (salary/title/description clamping)
 * - Cache header regressions for expensive OG generation
 */

import { NextRequest } from 'next/server';

type MockImageResponse = Response & {
  element?: unknown;
  options?: { headers?: Record<string, string> };
};

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
    node.forEach((child) => collectText(child, buffer));
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

function buildRequest(search: Record<string, string>) {
  const url = new URL('https://payetax.co.uk/api/og');
  Object.entries(search).forEach(([key, value]) => url.searchParams.set(key, value));
  return new NextRequest(url);
}

describe('/api/og GET', () => {
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
  });

  it('falls back to the default view when salary is out of bounds', async () => {
    const { GET } = await import('./route');
    const response = (await GET(
      buildRequest({ salary: '999999999', takeHome: '40000' }),
    )) as MockImageResponse;

    const text = collectText(response.element).join(' ');
    expect(text).toContain('UK Tax Calculator');
    expect(text).not.toContain('Gross Salary');
  });
});
