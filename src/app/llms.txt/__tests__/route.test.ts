// src/app/llms.txt/__tests__/route.test.ts

import { GET } from '../route';

describe('/llms.txt route', () => {
  it('should return llms.txt content following spec', async () => {
    const response = await GET();
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    // Should have H1 title (required by spec)
    expect(text).toContain('# PayeTax');
    // Should have blockquote summary (required by spec)
    expect(text).toContain('> Free UK PAYE tax calculator');
    expect(text).toContain('https://payetax.co.uk');
  });

  it('should include H2 sections with link lists', async () => {
    const response = await GET();
    const text = await response.text();

    // H2 sections as per llms.txt spec
    expect(text).toContain('## Main Pages');
    expect(text).toContain('## Tax Rates');
    expect(text).toContain('## Blog Posts');
    // Links should be in markdown format [title](url)
    expect(text).toContain('[Calculator](https://payetax.co.uk)');
  });

  it('should include tax rates information', async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain('## Tax Rates (2025-2026)');
    expect(text).toContain('Personal Allowance: £12,570');
    expect(text).toContain('Basic Rate: £12,571 - £50,270 (20%)');
  });

  it('should include blog post links', async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain('## Blog Posts');
    expect(text).toContain('[Understanding UK Tax Codes 2025]');
    expect(text).toContain('https://payetax.co.uk/blog/');
  });

  it('should include Optional section for secondary info', async () => {
    const response = await GET();
    const text = await response.text();

    // Optional section can be skipped for shorter context
    expect(text).toContain('## Optional');
    expect(text).toContain('[Sitemap]');
    expect(text).toContain('[Privacy Policy]');
  });

  it('should have proper cache headers', async () => {
    const response = await GET();

    expect(response.headers.get('Cache-Control')).toBe('public, max-age=86400, s-maxage=86400');
  });
});
