import type { TaxPackOrder, TaxPackOrderStore } from './types';

class InMemoryTaxPackOrderStore implements TaxPackOrderStore {
  private readonly orders = new Map<string, TaxPackOrder>();
  private readonly processedEvents = new Map<string, string>();

  create(order: TaxPackOrder): Promise<TaxPackOrder> {
    this.orders.set(order.id, order);
    return Promise.resolve(order);
  }

  get(orderId: string): Promise<TaxPackOrder | null> {
    return Promise.resolve(this.orders.get(orderId) ?? null);
  }

  update(order: TaxPackOrder): Promise<TaxPackOrder> {
    this.orders.set(order.id, order);
    return Promise.resolve(order);
  }

  hasProcessedEvent(eventId: string): Promise<boolean> {
    return Promise.resolve(this.processedEvents.has(eventId));
  }

  recordProcessedEvent(eventId: string, orderId: string): Promise<void> {
    this.processedEvents.set(eventId, orderId);
    return Promise.resolve();
  }

  reset(): void {
    this.orders.clear();
    this.processedEvents.clear();
  }
}

let storeSingleton: TaxPackOrderStore | null = null;

export function getTaxPackOrderStore(): TaxPackOrderStore {
  storeSingleton ??= new InMemoryTaxPackOrderStore();
  return storeSingleton;
}

export function resetTaxPackTestState(): void {
  getTaxPackOrderStore().reset();
}
