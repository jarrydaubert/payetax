jest.mock('@sentry/nextjs', () => ({
  withSentryConfig: (config: unknown) => config,
}));

jest.mock('@next/bundle-analyzer', () => () => (config: unknown) => config);

describe('next.config canonical redirects', () => {
  it('redirects stale blog category URLs to live category hubs', async () => {
    const { default: nextConfig } = await import('../../../next.config');
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: '/calculator',
          destination: '/#tax-calculator',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/blog/category/tax-tools',
          destination: '/blog/category/tax-basics',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/blog/category/self-assessment',
          destination: '/blog/category/tax-deadlines',
          permanent: true,
        }),
      ]),
    );
  });
});

describe('next.config crawler headers', () => {
  it('adds an X-Robots-Tag header to API routes', async () => {
    const { default: nextConfig } = await import('../../../next.config');
    const headers = await nextConfig.headers?.();

    expect(headers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: '/api/:path*',
          headers: expect.arrayContaining([{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]),
        }),
      ]),
    );
  });
});
