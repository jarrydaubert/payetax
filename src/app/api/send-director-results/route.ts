import { type NextRequest, NextResponse } from 'next/server';
import { sendDirectorResultsEmail } from '@/lib/email/outboundResultsDelivery';
import { checkRateLimitWithPolicy, createRateLimitHeaders } from '@/lib/rateLimit';
import { detectLikelyBotRequest } from '@/lib/security/botGuard';
import { getClientIdentifier } from '@/lib/security/clientIdentifier';
import { isValidRequestOrigin } from '@/lib/security/origin';
import { captureOperationalFailureAndFlush } from '@/lib/sentry';
import { SendDirectorResultsRequestSchema } from '@/lib/validation/emailValidation';

const MAX_BODY_SIZE = 50 * 1024; // 50KB
const RATE_LIMIT = { max: 5, window: 60000 } as const;

export async function POST(request: NextRequest) {
  if (!isValidRequestOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }

  const clientId = getClientIdentifier(request, { fallbackPrefix: 'ua:' });
  const rateLimit = await checkRateLimitWithPolicy(
    `send-director-results:${clientId}`,
    RATE_LIMIT,
    'require_distributed_in_production',
  );
  if (rateLimit.reason === 'distributed_unavailable') {
    await captureOperationalFailureAndFlush({
      operation: 'send-director-results',
      route: '/api/send-director-results',
      reason: 'rate_limit_distributed_unavailable',
      statusCode: 503,
    });

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
    console.warn(`[send-director-results] blocked likely bot request (${botReason})`);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const validationResult = SendDirectorResultsRequestSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validationResult.error.flatten() },
      { status: 400 },
    );
  }

  const delivery = await sendDirectorResultsEmail(validationResult.data);
  if (!delivery.ok) {
    if (delivery.reason === 'not_configured') {
      await captureOperationalFailureAndFlush({
        operation: 'send-director-results',
        route: '/api/send-director-results',
        reason: 'email_not_configured',
        statusCode: 503,
      });

      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
    }

    await captureOperationalFailureAndFlush({
      operation: 'send-director-results',
      route: '/api/send-director-results',
      reason:
        delivery.reason === 'unexpected_error' ? 'email_unexpected_error' : 'email_delivery_failed',
      statusCode: 500,
    });

    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
