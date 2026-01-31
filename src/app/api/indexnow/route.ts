// src/app/api/indexnow/route.ts
/**
 * IndexNow API integration for faster search engine indexing
 * Submits URLs to Bing, Yandex, and other IndexNow-supporting search engines
 *
 * @see https://www.indexnow.org/
 */

import { type NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';

// Security constants
const MAX_URLS = 100;
const MAX_BODY_SIZE = 50 * 1024; // 50KB
const ALLOWED_HOST = 'payetax.co.uk';

/**
 * Validate URL format and domain
 */
function isValidPayetaxUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      (parsed.host === ALLOWED_HOST || parsed.host === `www.${ALLOWED_HOST}`)
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting: 10 requests per minute per IP
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!checkRateLimit(ipAddress)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  try {
    // Check body size before parsing
    const contentLength = request.headers.get('content-length');
    if (contentLength && Number.parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
    }

    const { urls } = await request.json();

    // Validate URLs array
    if (!(urls && Array.isArray(urls)) || urls.length === 0) {
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
        { error: 'All URLs must be valid payetax.co.uk URLs' },
        { status: 400 },
      );
    }

    // IndexNow key should be stored in environment variables
    // Generate one at https://www.bing.com/indexnow
    const indexNowKey = process.env.INDEXNOW_KEY;

    if (!indexNowKey) {
      console.warn('INDEXNOW_KEY not configured - skipping IndexNow submission');
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

    // Submit to IndexNow API (shared by Bing, Yandex, etc.)
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PayeTax/2.0.1 (https://payetax.co.uk)',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Log details server-side only
      const errorText = await response.text();
      console.error('IndexNow submission failed:', response.status, errorText);
      // Return generic error to client (security: don't expose implementation details)
      return NextResponse.json(
        { success: false, error: 'Failed to submit URLs to search engines' },
        { status: 500 },
      );
    }
    return NextResponse.json({
      success: true,
      submitted: urls.length,
      message: `Successfully submitted ${urls.length} URLs to IndexNow`,
    });
  } catch (error) {
    // Log details server-side only
    console.error('IndexNow error:', error);
    // Return generic error to client (security: don't expose implementation details)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Health check endpoint (no config exposure for security)
export function GET() {
  return NextResponse.json({ status: 'ok', service: 'IndexNow' });
}
