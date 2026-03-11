import { type NextRequest, NextResponse } from 'next/server';
import { checkRateLimitWithPolicy } from '@/lib/rateLimit';
import { getClientIdentifier } from '@/lib/security/clientIdentifier';
import { isValidRequestOrigin } from '@/lib/security/origin';
import { createTaxPackCheckout } from '@/lib/taxPack/service';
import { TaxPackCheckoutRequestSchema } from '@/lib/validation/taxPackValidation';

export const runtime = 'nodejs';

const MAX_BODY_SIZE = 64 * 1024;

export async function POST(request: NextRequest) {
  if (!isValidRequestOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }

  const clientId = getClientIdentifier(request, { fallbackPrefix: 'ua:' });
  const rateLimit = await checkRateLimitWithPolicy(
    `tax-pack-checkout:${clientId}`,
    { max: 5, window: 3600000 },
    'require_distributed_in_production',
  );
  if (rateLimit.reason === 'distributed_unavailable') {
    return NextResponse.json(
      { error: 'Tax Pack checkout is temporarily unavailable. Please try again later.' },
      { status: 503 },
    );
  }
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
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

  const validationResult = TaxPackCheckoutRequestSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validationResult.error.flatten() },
      { status: 400 },
    );
  }

  const checkout = await createTaxPackCheckout(validationResult.data);
  if (!checkout.ok) {
    return NextResponse.json({ error: 'Tax Pack checkout is not configured' }, { status: 503 });
  }

  return NextResponse.json({
    success: true,
    orderId: checkout.order.id,
    status: checkout.order.status,
    checkoutUrl: checkout.order.checkoutUrl,
    stripeSessionId: checkout.order.stripeSessionId,
  });
}
