// src/app/api/newsletter/unsubscribe/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import {
  resolveUnsubscribeSecret,
  verifyUnsubscribeToken,
} from '@/lib/newsletter/unsubscribeToken';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const audienceId = process.env.RESEND_AUDIENCE_ID;

// SECURITY: Require secret in production, use dev fallback only in development
const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Security headers for all responses
const SECURITY_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store, max-age=0',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy':
    "default-src 'none'; style-src 'unsafe-inline'; img-src https: data:; base-uri 'none'; form-action 'none'",
};

/** Escape HTML to prevent injection */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Get client identifier - never returns null */
function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0];
    if (firstIp) return firstIp.trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  // Fallback: hash of user-agent to avoid unlimited requests
  const ua = request.headers.get('user-agent') || 'unknown';
  return `anon-${Buffer.from(ua).toString('base64').slice(0, 16)}`;
}

export async function GET(request: NextRequest) {
  // SECURITY: Require secret in production
  if (!UNSUBSCRIBE_SECRET) {
    if (IS_PRODUCTION) {
      console.error('[newsletter/unsubscribe] UNSUBSCRIBE_SECRET missing in production!');
      return new NextResponse(renderUnsubscribePage('Service configuration error', false), {
        status: 503,
        headers: SECURITY_HEADERS,
      });
    }
    // Dev fallback - log warning
    console.warn('[newsletter/unsubscribe] Using dev fallback secret - set UNSUBSCRIBE_SECRET');
  }

  // In production, we return 503 above. In dev/test, allow a safe fallback secret.
  const secret = UNSUBSCRIBE_SECRET || resolveUnsubscribeSecret();

  // Rate limiting: 5 unsubscribe attempts per minute per client
  const clientId = getClientIdentifier(request);
  if (!(await checkRateLimit(`newsletter-unsubscribe:${clientId}`, { max: 5, window: 60000 }))) {
    return new NextResponse(
      renderUnsubscribePage('Too many requests. Please try again later.', false),
      { status: 429, headers: SECURITY_HEADERS },
    );
  }

  // Only accept token-based unsubscribe (legacy email param removed for security)
  const tokenParam = request.nextUrl.searchParams.get('token');

  if (!tokenParam) {
    // Check if legacy email param was used
    if (request.nextUrl.searchParams.get('email')) {
      console.warn('[newsletter/unsubscribe] Legacy email param rejected - tokens required');
      return new NextResponse(
        renderUnsubscribePage(
          'This unsubscribe link has expired. Please use a link from a recent email.',
          false,
        ),
        { status: 400, headers: SECURITY_HEADERS },
      );
    }
    return new NextResponse(renderUnsubscribePage('Missing unsubscribe token', false), {
      status: 400,
      headers: SECURITY_HEADERS,
    });
  }

  // Verify signed token
  const email = verifyUnsubscribeToken(tokenParam, secret);
  if (!email) {
    return new NextResponse(
      renderUnsubscribePage('Invalid or expired unsubscribe link. Please contact support.', false),
      { status: 400, headers: SECURITY_HEADERS },
    );
  }

  if (!(resend && audienceId)) {
    return new NextResponse(renderUnsubscribePage('Service temporarily unavailable', false), {
      status: 503,
      headers: SECURITY_HEADERS,
    });
  }

  try {
    // Update contact to mark as unsubscribed (preserves suppression records)
    // This is preferred over remove() which deletes the contact entirely
    await resend.contacts.update({
      id: email, // Resend accepts email as ID
      audienceId,
      unsubscribed: true,
    });

    // Always show success (idempotent - prevents email enumeration)
    return new NextResponse(renderUnsubscribeSuccessPage(), {
      headers: SECURITY_HEADERS,
    });
  } catch (error) {
    // If update fails (contact doesn't exist), try remove as fallback
    try {
      await resend.contacts.remove({ email, audienceId });
      return new NextResponse(renderUnsubscribeSuccessPage(), {
        headers: SECURITY_HEADERS,
      });
    } catch {
      // Ignore - contact may not exist, which is fine
    }

    console.error('[newsletter/unsubscribe] Error:', error);
    // Generic error - don't reveal if email existed
    return new NextResponse(
      renderUnsubscribePage('Unable to process request. Please try again.', false),
      { status: 500, headers: SECURITY_HEADERS },
    );
  }
}

function renderUnsubscribeSuccessPage(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribed - PayeTax</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    h1 { color: #020617; margin: 0 0 16px; }
    p { color: #64748b; margin: 0 0 24px; line-height: 1.6; }
    a {
      display: inline-block;
      background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Unsubscribed</h1>
    <p>You've been removed from the PayeTax newsletter. You won't receive any more emails from us.</p>
    <a href="https://payetax.co.uk">Back to PayeTax</a>
  </div>
</body>
</html>
`;
}

function renderUnsubscribePage(errorMessage: string, _success: boolean): string {
  const safeContent = escapeHtml(errorMessage);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - PayeTax</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    h1 { color: #ef4444; margin: 0 0 16px; }
    p { color: #64748b; margin: 0 0 24px; line-height: 1.6; }
    a {
      display: inline-block;
      background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Error</h1>
    <p>${safeContent}</p>
    <a href="https://payetax.co.uk">Back to PayeTax</a>
  </div>
</body>
</html>
`;
}
