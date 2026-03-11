import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('vercel.json canonical host redirect', () => {
  it('uses explicit 308 redirects from www to apex for the homepage and nested routes', () => {
    const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
    const raw = readFileSync(vercelConfigPath, 'utf8');
    const config = JSON.parse(raw) as {
      redirects?: Array<{
        source?: string;
        destination?: string;
        statusCode?: number;
        has?: Array<{ type?: string; value?: string }>;
      }>;
    };

    const homepageRedirect = config.redirects?.find(
      (redirect) =>
        redirect.source === '/' &&
        redirect.destination === 'https://payetax.co.uk/' &&
        redirect.has?.some(
          (condition) => condition.type === 'host' && condition.value === 'www.payetax.co.uk',
        ),
    );

    const nestedRouteRedirect = config.redirects?.find(
      (redirect) =>
        redirect.source === '/:path*' &&
        redirect.destination === 'https://payetax.co.uk/:path*' &&
        redirect.has?.some(
          (condition) => condition.type === 'host' && condition.value === 'www.payetax.co.uk',
        ),
    );

    expect(homepageRedirect).toBeDefined();
    expect(homepageRedirect?.statusCode).toBe(308);
    expect(nestedRouteRedirect).toBeDefined();
    expect(nestedRouteRedirect?.statusCode).toBe(308);
  });
});
