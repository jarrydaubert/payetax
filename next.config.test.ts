import nextConfig from './next.config';

describe('next.config redirects', () => {
  it('redirects /vs routes to the canonical /alternatives routes', async () => {
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
