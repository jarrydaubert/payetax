// src/app/api/newsletter/subscribe/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateWelcomeEmailHtml, generateWelcomeEmailText } from '@/../emails/welcome';
import { resolveNewsletterBaseUrl } from '@/lib/newsletter/emailConfig';
import {
  createUnsubscribeToken,
  resolveUnsubscribeSecret,
} from '@/lib/newsletter/unsubscribeToken';
import { checkRateLimit } from '@/lib/rateLimit';
import { isValidRequestOrigin } from '@/lib/security/origin';
import { NewsletterSubscribeRequestSchema } from '@/lib/validation/emailValidation';

// Explicit Node.js runtime (Resend SDK requires Node APIs)
export const runtime = 'nodejs';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const audienceId = process.env.RESEND_AUDIENCE_ID;
const BASE_URL = resolveNewsletterBaseUrl();

const MAX_BODY_SIZE = 1024; // 1KB is plenty for an email subscription

/** Escape HTML to prevent injection (including single quotes for attributes) */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Get client IP from headers (Vercel/Cloudflare set these securely) */
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

  // Fallback: hash of user-agent to avoid single "unknown" bucket
  const ua = request.headers.get('user-agent') || 'unknown';
  return `anon-${Buffer.from(ua).toString('base64').slice(0, 16)}`;
}

export async function POST(request: NextRequest) {
  // Basic CSRF check
  if (!isValidRequestOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }

  // Get client identifier - always rate limit (never skip)
  const clientId = getClientIdentifier(request);

  if (!(await checkRateLimit(`newsletter-subscribe:${clientId}`, { max: 3, window: 60000 }))) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  // Check configuration
  if (!resend) {
    console.error('[newsletter/subscribe] Resend not configured');
    return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
  }

  if (!audienceId) {
    console.error('[newsletter/subscribe] Audience ID not configured');
    return NextResponse.json({ error: 'Newsletter not configured' }, { status: 503 });
  }

  // Read body as text first to enforce size limit
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: 'Failed to read request body' }, { status: 400 });
  }

  if (rawBody.length > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
  }

  // Parse JSON
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate with Zod
  const validation = NewsletterSubscribeRequestSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid email address', details: validation.error.flatten() },
      { status: 400 },
    );
  }

  const { email } = validation.data;

  try {
    // Ensure unsubscribe token signing is configured before doing any work in production.
    // (In dev/test we allow a safe fallback to keep local flows working.)
    let unsubscribeSecret: string;
    try {
      unsubscribeSecret = resolveUnsubscribeSecret();
    } catch (err) {
      console.error('[newsletter/subscribe] Unsubscribe signing not configured:', err);
      return NextResponse.json({ error: 'Newsletter not configured' }, { status: 503 });
    }

    // Try to create contact directly (skip the extra GET call)
    // Resend returns an error if contact already exists - we handle that as success
    const { error } = await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });

    // Check if "already exists" error - treat as idempotent success
    // This avoids email enumeration attacks (same response for new vs existing)
    const isAlreadySubscribed =
      error?.message?.toLowerCase().includes('already') ||
      error?.message?.toLowerCase().includes('exists') ||
      error?.message?.toLowerCase().includes('contact');

    if (error && !isAlreadySubscribed) {
      console.error('[newsletter/subscribe] Resend error:', error);
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    // Only send welcome email for NEW subscribers
    if (!isAlreadySubscribed) {
      // Generate unsubscribe URL with signed token
      const unsubscribeToken = createUnsubscribeToken(email, unsubscribeSecret);
      const unsubscribeUrl = `${BASE_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

      // Send welcome email with both HTML and plain-text (fire and forget)
      resend.emails
        .send({
          from: 'PayeTax <noreply@payetax.co.uk>',
          to: email,
          subject: 'Welcome to PayeTax!',
          html: generateWelcomeEmailHtml(email),
          text: generateWelcomeEmailText(email),
          headers: {
            'List-Unsubscribe': `<${unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        })
        .catch((err) => {
          console.error('[newsletter/subscribe] Failed to send welcome email:', err);
        });

      // Notify admin of new subscriber (escape email in HTML)
      const safeEmail = escapeHtml(email);
      resend.emails
        .send({
          from: 'PayeTax <noreply@payetax.co.uk>',
          to: 'support@payetax.co.uk',
          subject: `New subscriber: ${email}`,
          html: `<p>New newsletter subscriber: <strong>${safeEmail}</strong></p><p>Time: ${new Date().toISOString()}</p>`,
          text: `New newsletter subscriber: ${email}\nTime: ${new Date().toISOString()}`,
        })
        .catch((err) => {
          console.error('[newsletter/subscribe] Failed to send admin notification:', err);
        });
    }

    // Return same success response regardless of new vs existing (idempotent)
    return NextResponse.json({
      success: true,
      message: "You're subscribed to the newsletter!",
    });
  } catch (error) {
    console.error('[newsletter/subscribe] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
