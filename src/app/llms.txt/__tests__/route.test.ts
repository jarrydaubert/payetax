// src/app/llms.txt/__tests__/route.test.ts

import { GET } from '../route';

describe('/llms.txt route', () => {
  it('should return llms.txt content', async () => {
    const response = await GET();
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    expect(text).toContain('# PayeTax - Free UK PAYE Tax Calculator');
    expect(text).toContain('https://payetax.co.uk');
  });

  it('should include site information', async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain('## Site Information');
    expect(text).toContain('URL: https://payetax.co.uk');
    expect(text).toContain('All calculations run client-side');
  });

  it('should include tax rates', async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain('## Tax Rates (2025-2026)');
    expect(text).toContain('Personal Allowance: £12,570');
    expect(text).toContain('Basic Rate: £12,571 - £50,270 (20%)');
  });

  it('should include blog post references', async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain('# Detailed Blog Posts');
    expect(text).toContain('https://payetax.co.uk/blog/');
  });

  it('should have proper cache headers', async () => {
    const response = await GET();

    expect(response.headers.get('Cache-Control')).toBe('public, max-age=86400, s-maxage=86400');
  });
});
