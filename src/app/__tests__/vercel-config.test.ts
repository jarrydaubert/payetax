import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('vercel.json canonical host redirect', () => {
  it('uses an explicit 308 redirect from www to apex', () => {
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

    const wwwRedirect = config.redirects?.find(
      (redirect) =>
        redirect.source === '/:path*' &&
        redirect.destination === 'https://payetax.co.uk/:path*' &&
        redirect.has?.some(
          (condition) => condition.type === 'host' && condition.value === 'www.payetax.co.uk',
        ),
    );

    expect(wwwRedirect).toBeDefined();
    expect(wwwRedirect?.statusCode).toBe(308);
  });
});
