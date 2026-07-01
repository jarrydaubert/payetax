jest.mock('@sentry/nextjs', () => ({
  withSentryConfig: (config: unknown) => config,
}));

jest.mock('@next/bundle-analyzer', () => () => (config: unknown) => config);

describe('next.config canonical redirects', () => {
  it('redirects stale URLs to retained canonical surfaces', async () => {
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
          source: '/calculator/:path*',
          destination: '/#tax-calculator',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/scenarios',
          destination: '/#tax-calculator',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/scenarios/:path*',
          destination: '/#tax-calculator',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/alternatives',
          destination: '/tools',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/alternatives/:path*',
          destination: '/tools',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/best-for',
          destination: '/tools',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/best-for/:path*',
          destination: '/tools',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/best-uk-tax-calculators',
          destination: '/tools',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/best-uk-tax-calculators/:path*',
          destination: '/tools',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/vs',
          destination: '/tools',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/vs/:path*',
          destination: '/tools',
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
  it('allows Sentry browser envelopes for US and EU ingest hosts', async () => {
    const { default: nextConfig } = await import('../../../next.config');
    const headers = await nextConfig.headers?.();
    const globalHeaders =
      headers?.find((entry: { source: string }) => entry.source === '/(.*)')?.headers ?? [];
    const csp = globalHeaders.find(
      (header: { key: string; value: string }) => header.key === 'Content-Security-Policy',
    )?.value;

    expect(csp).toContain('connect-src');
    expect(csp).toContain('https://*.ingest.sentry.io');
    expect(csp).toContain('https://*.ingest.de.sentry.io');
  });

  it('allows Vercel Analytics and Speed Insights scripts', async () => {
    const { default: nextConfig } = await import('../../../next.config');
    const headers = await nextConfig.headers?.();
    const globalHeaders =
      headers?.find((entry: { source: string }) => entry.source === '/(.*)')?.headers ?? [];
    const csp = globalHeaders.find(
      (header: { key: string; value: string }) => header.key === 'Content-Security-Policy',
    )?.value;

    expect(csp).toContain('script-src');
    expect(csp).toContain('connect-src');
    expect(csp).toContain('https://va.vercel-scripts.com');
  });

  it('adds X-Robots-Tag only to private API routes', async () => {
    const { default: nextConfig } = await import('../../../next.config');
    const headers = await nextConfig.headers?.();

    expect(headers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: '/api/send-results',
          headers: expect.arrayContaining([{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]),
        }),
        expect.objectContaining({
          source: '/api/send-director-results',
          headers: expect.arrayContaining([{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]),
        }),
        expect.objectContaining({
          source: '/api/ops/:path*',
          headers: expect.arrayContaining([{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]),
        }),
      ]),
    );
    expect(headers).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: '/api/:path*',
        }),
      ]),
    );
    expect(headers).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: '/api/tax-rates',
          headers: expect.arrayContaining([{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]),
        }),
      ]),
    );
  });
});

describe('next.config Sentry options', () => {
  it('routes browser envelopes through a first-party tunnel', async () => {
    const { sentryConfigOptions } = await import('../../../next.config');

    expect(sentryConfigOptions).toEqual(
      expect.objectContaining({
        tunnelRoute: '/monitoring',
      }),
    );
  });

  it('skips Sentry source-map upload work for default local and CI builds', async () => {
    const { default: nextConfig, sentryConfigOptions } = await import('../../../next.config');

    expect(nextConfig.productionBrowserSourceMaps).toBe(false);
    expect(sentryConfigOptions).toEqual(
      expect.objectContaining({
        widenClientFileUpload: false,
        release: {
          create: false,
          finalize: false,
        },
        sourcemaps: {
          disable: true,
        },
      }),
    );
  });

  it('enables Sentry source maps for production Vercel builds with an auth token', async () => {
    const { shouldEnableSentrySourceMaps } = await import('../../../next.config');

    expect(
      shouldEnableSentrySourceMaps({
        VERCEL_ENV: 'production',
        SENTRY_AUTH_TOKEN: 'sentry-token',
      }),
    ).toBe(true);
  });

  it('lets the explicit Sentry source-map toggle override production defaults', async () => {
    const { shouldEnableSentrySourceMaps } = await import('../../../next.config');

    expect(
      shouldEnableSentrySourceMaps({
        PAYETAX_ENABLE_SENTRY_SOURCEMAPS: 'false',
        VERCEL_ENV: 'production',
        SENTRY_AUTH_TOKEN: 'sentry-token',
      }),
    ).toBe(false);
  });
});
