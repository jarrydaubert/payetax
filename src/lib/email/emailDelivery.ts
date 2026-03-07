import { Resend } from 'resend';

export interface OutboundEmailMessage {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

export type SendOutboundEmailResult =
  | { ok: true }
  | { ok: false; reason: 'not_configured' | 'delivery_failed' | 'unexpected_error' };

function formatErrorForLog(error: unknown): { name?: string; message?: string } {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }

  return { message: 'Unknown error' };
}

function getResendClient(): Resend | null {
  return process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
}

export async function sendOutboundEmail(
  message: OutboundEmailMessage,
  logPrefix: string,
): Promise<SendOutboundEmailResult> {
  const resend = getResendClient();
  if (!resend) {
    console.error(`[${logPrefix}] Resend not configured`);
    return { ok: false, reason: 'not_configured' };
  }

  try {
    const { error } = await resend.emails.send(message);

    if (error) {
      console.error(`[${logPrefix}] Resend error:`, formatErrorForLog(error));
      return { ok: false, reason: 'delivery_failed' };
    }

    return { ok: true };
  } catch (error) {
    console.error(`[${logPrefix}] Error:`, formatErrorForLog(error));
    return { ok: false, reason: 'unexpected_error' };
  }
}
