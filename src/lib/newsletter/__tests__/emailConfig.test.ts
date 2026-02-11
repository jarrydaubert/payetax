import { resolveNewsletterBaseUrl } from '../emailConfig';

describe('resolveNewsletterBaseUrl', () => {
  it('prefers NEXT_PUBLIC_SITE_URL over NEXT_PUBLIC_BASE_URL', () => {
    const result = resolveNewsletterBaseUrl({
      NEXT_PUBLIC_SITE_URL: 'https://site.example',
      NEXT_PUBLIC_BASE_URL: 'https://base.example',
    } as NodeJS.ProcessEnv);

    expect(result).toBe('https://site.example');
  });

  it('uses NEXT_PUBLIC_BASE_URL as fallback', () => {
    const result = resolveNewsletterBaseUrl({
      NEXT_PUBLIC_BASE_URL: 'https://base.example/',
    } as NodeJS.ProcessEnv);

    expect(result).toBe('https://base.example');
  });

  it('falls back to production default when env vars are missing', () => {
    const result = resolveNewsletterBaseUrl({} as NodeJS.ProcessEnv);
    expect(result).toBe('https://payetax.co.uk');
  });
});
