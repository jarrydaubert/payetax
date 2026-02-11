import { generateNewBlogPostHtml, generateNewBlogPostText } from '../../../../emails/new-blog-post';

jest.mock('@/lib/newsletter/unsubscribeToken', () => ({
  createUnsubscribeToken: jest.fn(() => 'mock-token'),
  resolveUnsubscribeSecret: jest.fn(() => 'mock-secret'),
}));

describe('new-blog-post email template', () => {
  it('escapes user content and sanitizes off-domain article URLs', () => {
    const html = generateNewBlogPostHtml({
      title: '<script>alert("x")</script>',
      excerpt: 'Safe <b>excerpt</b>',
      url: 'https://evil.com/phishing',
      category: 'Tax <Tips>',
      publishedAt: '2026-01-22',
      recipientEmail: 'reader@payetax.co.uk',
    });

    expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert("x")</script>');
    expect(html).toContain('Safe &lt;b&gt;excerpt&lt;/b&gt;');
    expect(html).toContain('Tax &lt;Tips&gt;');
    expect(html).toContain('utm_source=newsletter');
    expect(html).toContain('utm_content=read_article');
    expect(html).toContain('/api/newsletter/unsubscribe?token=mock-token');
  });

  it('generates plain text with signed unsubscribe URL', () => {
    const text = generateNewBlogPostText({
      title: 'Spring Statement',
      excerpt: 'What this means for your tax bill.',
      url: 'https://payetax.co.uk/blog/spring-statement-2026-uk-what-to-expect',
      category: 'Tax Changes',
      publishedAt: '2026-01-22',
      recipientEmail: 'reader@payetax.co.uk',
    });

    expect(text).toContain('Spring Statement');
    expect(text).toContain('/api/newsletter/unsubscribe?token=mock-token');
    expect(text).not.toContain('reader@payetax.co.uk');
  });
});
