import { z } from 'zod';
import { DirectorTaxYearSchema } from '@/lib/validation/directorValidation';
import { DirectorEmailInputSchema, EmailSchema } from '@/lib/validation/emailValidation';

export const TaxPackCheckoutRequestSchema = z
  .object({
    email: EmailSchema,
    input: DirectorEmailInputSchema,
    taxYear: DirectorTaxYearSchema.optional(),
  })
  .strict();

export const TaxPackWebhookEventSchema = z
  .object({
    id: z.string().min(1, 'Webhook event id is required'),
    type: z.literal('checkout.session.completed'),
    data: z
      .object({
        orderId: z.string().uuid('Order id must be a valid UUID'),
        sessionId: z.string().min(1, 'Checkout session id is required'),
        paymentIntentId: z.string().min(1).optional(),
      })
      .strict(),
  })
  .strict();

export type TaxPackCheckoutRequest = z.infer<typeof TaxPackCheckoutRequestSchema>;
export type TaxPackWebhookEvent = z.infer<typeof TaxPackWebhookEventSchema>;
