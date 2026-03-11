import { randomUUID } from 'node:crypto';
import type {
  TaxPackCheckoutRequest,
  TaxPackWebhookEvent,
} from '@/lib/validation/taxPackValidation';
import { buildTaxPackArtifact } from './artifactBuilder';
import { getTaxPackOrderStore } from './orderStore';
import { getTaxPackPaymentGateway } from './paymentGateway';
import type { TaxPackOrder, TaxPackOrderStore } from './types';

type CheckoutDeps = {
  store?: TaxPackOrderStore;
  gateway?: ReturnType<typeof getTaxPackPaymentGateway>;
  now?: () => string;
  idFactory?: () => string;
};

type WebhookDeps = {
  store?: TaxPackOrderStore;
  now?: () => string;
};

function getNow(now?: () => string): string {
  return (now ?? (() => new Date().toISOString()))();
}

function normalizeTaxYear(value: TaxPackCheckoutRequest['taxYear']): TaxPackOrder['taxYear'] {
  return value ?? '2025-2026';
}

export async function createTaxPackCheckout(
  request: TaxPackCheckoutRequest,
  deps: CheckoutDeps = {},
): Promise<{ ok: true; order: TaxPackOrder } | { ok: false; reason: 'not_configured' }> {
  const gateway = deps.gateway ?? getTaxPackPaymentGateway();
  if (!gateway) {
    return { ok: false, reason: 'not_configured' };
  }

  const store = deps.store ?? getTaxPackOrderStore();
  const createdAt = getNow(deps.now);
  const orderId = (deps.idFactory ?? randomUUID)();
  const taxYear = normalizeTaxYear(request.taxYear);

  const draftOrder: TaxPackOrder = {
    id: orderId,
    email: request.email,
    status: 'draft',
    taxYear,
    input: request.input,
    createdAt,
    updatedAt: createdAt,
  };

  await store.create(draftOrder);

  const session = await gateway.createCheckoutSession({
    orderId,
    email: request.email,
    taxYear,
  });

  const pendingOrder: TaxPackOrder = {
    ...draftOrder,
    status: 'pending_payment',
    checkoutUrl: session.url,
    stripeSessionId: session.sessionId,
    updatedAt: getNow(deps.now),
  };

  await store.update(pendingOrder);

  return { ok: true, order: pendingOrder };
}

export async function processTaxPackWebhook(
  event: TaxPackWebhookEvent,
  deps: WebhookDeps = {},
): Promise<{ ok: true; order: TaxPackOrder } | { ok: false; reason: 'not_found' }> {
  const store = deps.store ?? getTaxPackOrderStore();
  const alreadyProcessed = await store.hasProcessedEvent(event.id);
  const order = await store.get(event.data.orderId);

  if (!order) {
    return { ok: false, reason: 'not_found' };
  }

  if (alreadyProcessed) {
    return { ok: true, order };
  }

  const processingAt = getNow(deps.now);
  const processingOrder: TaxPackOrder = {
    ...order,
    status: 'processing',
    updatedAt: processingAt,
    stripeSessionId: event.data.sessionId,
    stripePaymentIntentId: event.data.paymentIntentId ?? order.stripePaymentIntentId,
    paidAt: order.paidAt ?? processingAt,
  };

  await store.update(processingOrder);

  const artifact = buildTaxPackArtifact(processingOrder);
  const readyAt = getNow(deps.now);
  const readyOrder: TaxPackOrder = {
    ...processingOrder,
    status: 'ready',
    updatedAt: readyAt,
    readyAt,
    artifact,
    lastProcessedEventId: event.id,
  };

  await store.update(readyOrder);
  await store.recordProcessedEvent(event.id, readyOrder.id);

  return { ok: true, order: readyOrder };
}

export function getTaxPackOrder(
  orderId: string,
  store: TaxPackOrderStore = getTaxPackOrderStore(),
) {
  return store.get(orderId);
}
