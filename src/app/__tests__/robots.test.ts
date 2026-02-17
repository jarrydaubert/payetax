import robots from '../robots';

describe('robots metadata', () => {
  it('includes allow rules for search crawlers and blocks training bots', () => {
    const result = robots();

    expect(result.sitemap).toBe('https://payetax.co.uk/sitemap.xml');
    expect(result.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userAgent: '*',
          disallow: expect.arrayContaining(['/monitoring']),
        }),
      ]),
    );
    expect(result.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userAgent: 'OAI-SearchBot', allow: '/' }),
        expect.objectContaining({ userAgent: 'GPTBot', disallow: '/' }),
        expect.objectContaining({ userAgent: 'Claude-SearchBot', allow: '/' }),
        expect.objectContaining({ userAgent: 'ClaudeBot', disallow: '/' }),
      ]),
    );
  });
});
