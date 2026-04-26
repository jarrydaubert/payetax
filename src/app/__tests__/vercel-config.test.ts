import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('vercel.json canonical host redirect', () => {
  const readVercelConfig = () => {
    const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
    const raw = readFileSync(vercelConfigPath, 'utf8');
    return JSON.parse(raw) as {
      redirects?: Array<{
        source?: string;
        destination?: string;
        statusCode?: number;
        permanent?: boolean;
        has?: Array<{ type?: string; value?: string }>;
      }>;
    };
  };

  it('uses explicit 308 redirects from www to apex for the homepage and nested routes', () => {
    const config = readVercelConfig();

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

  it('redirects the stale embed widget URL to the tools hub', () => {
    const config = readVercelConfig();

    const embedWidgetRedirect = config.redirects?.find(
      (redirect) => redirect.source === '/tools/embed-widget' && redirect.destination === '/tools',
    );

    expect(embedWidgetRedirect).toBeDefined();
    expect(embedWidgetRedirect?.permanent).toBe(true);
  });
});
