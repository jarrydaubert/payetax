jest.mock('@sentry/nextjs', () => ({
  withSentryConfig: (config: unknown) => config,
}));

jest.mock('@next/bundle-analyzer', () => () => (config: unknown) => config);

describe('next.config canonical redirects', () => {
  it('redirects legacy /vs competitor URLs to canonical alternatives routes', async () => {
    const { default: nextConfig } = await import('../../../next.config');
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: '/vs',
          destination: '/alternatives',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/vs/:competitor',
          destination: '/alternatives/:competitor',
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
