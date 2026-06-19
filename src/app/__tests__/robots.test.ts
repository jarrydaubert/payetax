import robots from '../robots';

describe('robots metadata', () => {
  it('allows search and AI crawlers while disallowing operational paths', () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];

    expect(result.sitemap).toBe('https://payetax.co.uk/sitemap.xml');
    expect(result.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userAgent: '*',
          allow: expect.arrayContaining(['/', '/api/og', '/api/tax-rates']),
          disallow: expect.arrayContaining(['/api/', '/_vercel/', '/monitoring']),
        }),
      ]),
    );
    expect(result.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userAgent: 'OAI-SearchBot',
          allow: expect.arrayContaining(['/api/og', '/api/tax-rates']),
        }),
        expect.objectContaining({
          userAgent: 'Claude-SearchBot',
          allow: expect.arrayContaining(['/api/og', '/api/tax-rates']),
        }),
        expect.objectContaining({
          userAgent: 'PerplexityBot',
          allow: expect.arrayContaining(['/api/og', '/api/tax-rates']),
        }),
      ]),
    );
    expect(result.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userAgent: 'GPTBot',
          disallow: ['/'],
        }),
        expect.objectContaining({
          userAgent: 'Google-Extended',
          disallow: ['/'],
        }),
        expect.objectContaining({
          userAgent: 'Applebot-Extended',
          disallow: ['/'],
        }),
        expect.objectContaining({
          userAgent: 'CCBot',
          disallow: ['/'],
        }),
      ]),
    );
    expect(rules.map((rule) => rule.userAgent)).not.toContain('ClaudeBot');
  });
});
