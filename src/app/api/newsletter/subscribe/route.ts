// src/app/api/newsletter/subscribe/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { subscribeEmailToKit } from '@/lib/newsletter/kitClient';
import { checkRateLimit } from '@/lib/rateLimit';
import { detectLikelyBotRequest } from '@/lib/security/botGuard';
import { getClientIdentifier } from '@/lib/security/clientIdentifier';
import { isValidRequestOrigin } from '@/lib/security/origin';
import { NewsletterSubscribeRequestSchema } from '@/lib/validation/emailValidation';

// Explicit Node.js runtime for consistent server behavior and Buffer usage.
export const runtime = 'nodejs';

const KIT_API_SECRET = process.env.KIT_API_SECRET;
const KIT_FORM_ID = process.env.KIT_FORM_ID;

const MAX_BODY_SIZE = 1024; // 1KB is plenty for an email subscription

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
  if (!(KIT_API_SECRET && KIT_FORM_ID)) {
    console.error('[newsletter/subscribe] Kit is not configured');
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

  const botReason = detectLikelyBotRequest(request, body);
  if (botReason) {
    console.warn(`[newsletter/subscribe] blocked likely bot request (${botReason})`);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
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
    await subscribeEmailToKit({ apiSecret: KIT_API_SECRET, formId: KIT_FORM_ID, email });

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
