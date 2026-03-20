import { createHmac, timingSafeEqual } from 'node:crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { processTaxPackWebhook } from '@/lib/taxPack/service';
import { TaxPackWebhookEventSchema } from '@/lib/validation/taxPackValidation';

const MAX_BODY_SIZE = 16 * 1024;

function isValidSignature(
  rawBody: string,
  providedSignature: string | null,
  secret: string,
): boolean {
  if (!providedSignature) return false;

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const providedBuffer = Buffer.from(providedSignature, 'utf8');

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.TAX_PACK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Tax Pack webhook is not configured' }, { status: 503 });
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

  if (!isValidSignature(rawBody, request.headers.get('x-tax-pack-signature'), webhookSecret)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validationResult = TaxPackWebhookEventSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      { error: 'Invalid webhook payload', details: validationResult.error.flatten() },
      { status: 400 },
    );
  }

  const processed = await processTaxPackWebhook(validationResult.data);
  if (!processed.ok) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({
    received: true,
    orderId: processed.order.id,
    status: processed.order.status,
    readyAt: processed.order.readyAt ?? null,
    artifact: processed.order.artifact
      ? {
          fileName: processed.order.artifact.fileName,
          checksumSha256: processed.order.artifact.checksumSha256,
          byteSize: processed.order.artifact.byteSize,
        }
      : null,
  });
}
