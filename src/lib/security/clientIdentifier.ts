import type { NextRequest } from 'next/server';

interface ClientIdentifierOptions {
  ipPrefix?: string;
  fallbackPrefix?: string;
  includeAcceptHeaderInFallback?: boolean;
}

/**
 * Derive a stable per-client identifier for rate limiting.
 *
 * Header priority is consistent across the app:
 * 1) cf-connecting-ip — ONLY when TRUST_CF_CONNECTING_IP=true (i.e. a
 *    Cloudflare proxy we control sets it). On Vercel without Cloudflare
 *    proxying this header is client-supplied and must be ignored, or it
 *    becomes a per-request rate-limit-bucket bypass.
 * 2) x-forwarded-for (first IP; platform-set on Vercel)
 * 3) x-real-ip
 * 4) user-agent (hashed fallback)
 */
export function getClientIdentifier(
  request: NextRequest,
  options: ClientIdentifierOptions = {},
): string {
  const {
    ipPrefix = '',
    fallbackPrefix = 'anon-',
    includeAcceptHeaderInFallback = false,
  } = options;

  if (process.env.TRUST_CF_CONNECTING_IP === 'true') {
    const cfIp = request.headers.get('cf-connecting-ip');
    if (cfIp) return `${ipPrefix}${cfIp}`;
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return `${ipPrefix}${firstIp}`;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return `${ipPrefix}${realIp}`;

  const ua = request.headers.get('user-agent') || 'unknown';
  const accept = includeAcceptHeaderInFallback ? request.headers.get('accept') || '' : '';
  const hashSource = ua + accept;

  return `${fallbackPrefix}${Buffer.from(hashSource).toString('base64').slice(0, 16)}`;
}
