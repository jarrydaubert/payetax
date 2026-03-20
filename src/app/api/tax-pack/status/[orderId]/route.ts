import { type NextRequest, NextResponse } from 'next/server';
import { getTaxPackOrder } from '@/lib/taxPack/service';

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { orderId } = await context.params;
  const order = await getTaxPackOrder(orderId);

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({
    orderId: order.id,
    status: order.status,
    paidAt: order.paidAt ?? null,
    readyAt: order.readyAt ?? null,
    checkoutUrl: order.checkoutUrl ?? null,
    artifact: order.artifact
      ? {
          fileName: order.artifact.fileName,
          mimeType: order.artifact.mimeType,
          checksumSha256: order.artifact.checksumSha256,
          byteSize: order.artifact.byteSize,
          generatedAt: order.artifact.generatedAt,
        }
      : null,
  });
}
