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
 * 1) cf-connecting-ip
 * 2) x-forwarded-for (first IP)
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

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return `${ipPrefix}${cfIp}`;

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
