// src/app/api/indexnow/route.ts
/**
 * IndexNow API integration for faster search engine indexing
 * Submits URLs to Bing, Yandex, and other IndexNow-supporting search engines
 *
 * SECURITY: This endpoint requires authentication via X-IndexNow-Secret header
 * to prevent abuse (spam submissions, rate limit exhaustion).
 *
 * @see https://www.indexnow.org/
 */

import { type NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';

// Security constants
const MAX_URLS = 100;
const MAX_BODY_SIZE = 50 * 1024; // 50KB
const ALLOWED_HOST = 'payetax.co.uk';
const FETCH_TIMEOUT_MS = 10000; // 10 seconds

// Allowed exact content pages (no prefix matching here)
const ALLOWED_EXACT_PATHS = new Set([
  '/',
  '/about',
  '/privacy',
  '/compliance',
  '/blog',
  '/tools',
  '/scenarios',
  '/alternatives',
  '/vs',
]);

// Allowed section prefixes (supports nested detail pages)
const ALLOWED_PATH_PREFIXES = [
  '/blog/',
  '/alternatives/',
  '/vs/',
  '/calculator/',
  '/tools/',
  '/scenarios/',
];

function isAllowedPath(pathname: string): boolean {
  // Normalize trailing slash for exact-page checks (except root)
  const normalizedPath =
    pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  return (
    ALLOWED_EXACT_PATHS.has(normalizedPath) ||
    ALLOWED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

/**
 * Verify request authentication
 */
function isAuthenticated(request: NextRequest): boolean {
  const secret = process.env.INDEXNOW_SUBMIT_SECRET;
  if (!secret) {
    // In development, allow unauthenticated if no secret configured
    return process.env.NODE_ENV === 'development';
  }
  return request.headers.get('x-indexnow-secret') === secret;
}

/**
 * Validate URL format, domain, and path
 * - Must be HTTPS only
 * - Must be payetax.co.uk domain
 * - No fragments, no auth info
 * - Must match allowed path prefixes
 */
function isValidPayetaxUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      (parsed.host === ALLOWED_HOST || parsed.host === `www.${ALLOWED_HOST}`) &&
      parsed.hash === '' &&
      parsed.username === '' &&
      parsed.password === '' &&
      isAllowedPath(parsed.pathname)
    );
  } catch {
    return false;
  }
}

/**
 * Get client IP with better fallback than "unknown"
 */
function getClientIdentifier(request: NextRequest): string {
  // Vercel sets x-forwarded-for securely at the edge
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  // Fallback: hash of user-agent + accept to avoid single "unknown" bucket
  const ua = request.headers.get('user-agent') || '';
  const accept = request.headers.get('accept') || '';
  const hash = `anon-${Buffer.from(ua + accept)
    .toString('base64')
    .slice(0, 16)}`;
  return hash;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID().slice(0, 8);

  // Authentication check
  if (!isAuthenticated(request)) {
    console.warn(`[IndexNow:${requestId}] Unauthorized request rejected`);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting: 10 requests per minute per IP
  const clientId = getClientIdentifier(request);

  if (!(await checkRateLimit(`indexnow:${clientId}`))) {
    console.warn(`[IndexNow:${requestId}] Rate limited: ${clientId}`);
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  try {
    // Read body as text first to enforce size limit properly
    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_SIZE) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
    }

    let data: unknown;
    try {
      data = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const urls = (data as { urls?: unknown }).urls;

    // Validate URLs array
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'URLs array is required' }, { status: 400 });
    }

    if (urls.length > MAX_URLS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_URLS} URLs allowed per request` },
        { status: 400 },
      );
    }

    // Validate each URL format and domain
    const invalidUrls = urls.filter(
      (url: unknown) => typeof url !== 'string' || !isValidPayetaxUrl(url),
    );
    if (invalidUrls.length > 0) {
      return NextResponse.json(
        {
          error: 'All URLs must be valid HTTPS payetax.co.uk URLs',
          invalidCount: invalidUrls.length,
        },
        { status: 400 },
      );
    }

    // IndexNow key from environment
    const indexNowKey = process.env.INDEXNOW_KEY;

    if (!indexNowKey) {
      console.warn(`[IndexNow:${requestId}] INDEXNOW_KEY not configured`);
      return NextResponse.json(
        {
          success: false,
          message: 'IndexNow not configured. Set INDEXNOW_KEY environment variable.',
        },
        { status: 200 },
      );
    }

    const payload = {
      host: 'payetax.co.uk',
      key: indexNowKey,
      keyLocation: `https://payetax.co.uk/${indexNowKey}.txt`,
      urlList: urls,
    };

    // Submit to IndexNow API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PayeTax/2.0.1 (https://payetax.co.uk)',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeout);
      const isTimeout = fetchError instanceof Error && fetchError.name === 'AbortError';
      console.error(`[IndexNow:${requestId}] Fetch failed: ${isTimeout ? 'timeout' : fetchError}`);
      return NextResponse.json(
        { success: false, error: 'Failed to reach IndexNow service' },
        { status: 502 },
      );
    }

    clearTimeout(timeout);

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[IndexNow:${requestId}] Submission failed | status=${response.status} | latency=${latency}ms | error=${errorText}`,
      );
      return NextResponse.json(
        { success: false, error: 'Failed to submit URLs to search engines' },
        { status: 502 },
      );
    }

    // biome-ignore lint/suspicious/noConsole: Structured logging for observability
    console.log(
      `[IndexNow:${requestId}] Success | urls=${urls.length} | latency=${latency}ms | client=${clientId.slice(0, 8)}`,
    );

    return NextResponse.json({
      success: true,
      submitted: urls.length,
      message: `Successfully submitted ${urls.length} URLs to IndexNow`,
    });
  } catch (error) {
    const latency = Date.now() - startTime;
    console.error(`[IndexNow:${requestId}] Error | latency=${latency}ms |`, error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Minimal health check - no service details exposed
export function GET() {
  return NextResponse.json({ status: 'ok' });
}
