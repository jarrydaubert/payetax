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
          allow: '/',
          disallow: expect.arrayContaining(['/_vercel/', '/monitoring']),
        }),
      ]),
    );
    expect(result.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userAgent: 'OAI-SearchBot', allow: '/' }),
        expect.objectContaining({ userAgent: 'Claude-SearchBot', allow: '/' }),
        expect.objectContaining({ userAgent: 'PerplexityBot', allow: '/' }),
      ]),
    );
    expect(rules.map((rule) => rule.userAgent)).not.toEqual(
      expect.arrayContaining([
        'GPTBot',
        'ClaudeBot',
        'Google-Extended',
        'Applebot-Extended',
        'CCBot',
      ]),
    );
  });
});
