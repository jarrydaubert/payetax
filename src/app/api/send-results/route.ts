import { type NextRequest, NextResponse } from 'next/server';
import { sendPayeResultsEmail } from '@/lib/email/outboundResultsDelivery';
import { checkRateLimitWithPolicy, createRateLimitHeaders } from '@/lib/rateLimit';
import { detectLikelyBotRequest } from '@/lib/security/botGuard';
import { getClientIdentifier } from '@/lib/security/clientIdentifier';
import { isValidRequestOrigin } from '@/lib/security/origin';
import { SendResultsRequestSchema } from '@/lib/validation/emailValidation';

const MAX_BODY_SIZE = 50 * 1024; // 50KB
const RATE_LIMIT = { max: 5, window: 60000 } as const;

export async function POST(request: NextRequest) {
  if (!isValidRequestOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }

  const clientId = getClientIdentifier(request, { fallbackPrefix: 'ua:' });
  const rateLimit = await checkRateLimitWithPolicy(
    `send-results:${clientId}`,
    RATE_LIMIT,
    'require_distributed_in_production',
  );
  if (rateLimit.reason === 'distributed_unavailable') {
    return NextResponse.json(
      { error: 'Email service temporarily unavailable. Please try again later.' },
      { status: 503 },
    );
  }
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: createRateLimitHeaders(RATE_LIMIT) },
    );
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: 'Failed to read request body' }, { status: 400 });
  }

  if (rawBody.length > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const botReason = detectLikelyBotRequest(request, body);
  if (botReason) {
    console.warn(`[send-results] blocked likely bot request (${botReason})`);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const validation = SendResultsRequestSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: validation.error.flatten() },
      { status: 400 },
    );
  }

  const delivery = await sendPayeResultsEmail(validation.data);
  if (!delivery.ok) {
    if (delivery.reason === 'not_configured') {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
    }

    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
