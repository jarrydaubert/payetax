/**
 * Shared config helpers for newsletter templates and scripts.
 */

/**
 * Resolve the canonical base URL used in newsletter links.
 * Prefer NEXT_PUBLIC_SITE_URL, keep NEXT_PUBLIC_BASE_URL as backward-compatible fallback.
 */
export function resolveNewsletterBaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const raw = env.NEXT_PUBLIC_SITE_URL || env.NEXT_PUBLIC_BASE_URL || 'https://payetax.co.uk';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}
