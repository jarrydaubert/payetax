import type { TaxPackCheckoutSession, TaxPackCheckoutSessionRequest } from './types';

export interface TaxPackPaymentGateway {
  createCheckoutSession(request: TaxPackCheckoutSessionRequest): Promise<TaxPackCheckoutSession>;
}

let testGateway: TaxPackPaymentGateway | null = null;

export function getTaxPackPaymentGateway(): TaxPackPaymentGateway | null {
  return testGateway;
}

export function setTaxPackPaymentGatewayForTests(gateway: TaxPackPaymentGateway | null): void {
  testGateway = gateway;
}
