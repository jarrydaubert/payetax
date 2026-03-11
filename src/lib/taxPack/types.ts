import type { DirectorTaxYear } from '@/lib/validation/directorValidation';
import type { DirectorEmailInput } from '@/lib/validation/emailValidation';

export type TaxPackOrderStatus = 'draft' | 'pending_payment' | 'processing' | 'ready' | 'failed';

export interface TaxPackArtifact {
  fileName: string;
  mimeType: 'application/json';
  checksumSha256: string;
  byteSize: number;
  generatedAt: string;
  content: string;
}

export interface TaxPackOrder {
  id: string;
  email: string;
  status: TaxPackOrderStatus;
  taxYear: DirectorTaxYear;
  input: DirectorEmailInput;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  readyAt?: string;
  checkoutUrl?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  artifact?: TaxPackArtifact;
  lastProcessedEventId?: string;
}

export interface TaxPackCheckoutSession {
  sessionId: string;
  url: string;
}

export interface TaxPackCheckoutSessionRequest {
  orderId: string;
  email: string;
  taxYear: DirectorTaxYear;
}

export interface TaxPackWebhookEventData {
  id: string;
  type: 'checkout.session.completed';
  data: {
    orderId: string;
    sessionId: string;
    paymentIntentId?: string;
  };
}

export interface TaxPackOrderStore {
  create(order: TaxPackOrder): Promise<TaxPackOrder>;
  get(orderId: string): Promise<TaxPackOrder | null>;
  update(order: TaxPackOrder): Promise<TaxPackOrder>;
  hasProcessedEvent(eventId: string): Promise<boolean>;
  recordProcessedEvent(eventId: string, orderId: string): Promise<void>;
  reset(): void;
}
