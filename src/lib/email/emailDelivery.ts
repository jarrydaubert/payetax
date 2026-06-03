export interface OutboundEmailMessage {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export type SendOutboundEmailResult =
  | { ok: true }
  | { ok: false; reason: 'not_configured' | 'delivery_failed' | 'unexpected_error' };

interface BrevoEmailIdentity {
  email: string;
  name?: string;
}

const BREVO_TRANSACTIONAL_EMAIL_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

function formatErrorForLog(error: unknown): { name?: string; message?: string } {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }

  return { message: 'Unknown error' };
}

function getBrevoApiKey(): string | null {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  return apiKey || null;
}

function parseEmailIdentity(value: string): BrevoEmailIdentity {
  const trimmed = value.trim();
  const match = trimmed.match(/^(?<name>.+?)\s*<(?<email>[^>]+)>$/u);

  if (match?.groups?.email) {
    const name = (match.groups.name ?? '').trim().replace(/^["']|["']$/g, '');
    const email = match.groups.email.trim();

    return name ? { email, name } : { email };
  }

  return { email: trimmed };
}

function normalizeRecipients(recipients: string | string[]): BrevoEmailIdentity[] {
  const values = Array.isArray(recipients) ? recipients : recipients.split(',');
  return values.map(parseEmailIdentity).filter((recipient) => recipient.email.length > 0);
}

export function isOutboundEmailConfigured(): boolean {
  return Boolean(getBrevoApiKey());
}

export async function sendOutboundEmail(
  message: OutboundEmailMessage,
  logPrefix: string,
): Promise<SendOutboundEmailResult> {
  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    console.error(`[${logPrefix}] Brevo API not configured`);
    return { ok: false, reason: 'not_configured' };
  }

  try {
    const payload = {
      sender: parseEmailIdentity(message.from),
      to: normalizeRecipients(message.to),
      subject: message.subject,
      htmlContent: message.html,
      textContent: message.text,
      ...(message.replyTo ? { replyTo: parseEmailIdentity(message.replyTo) } : {}),
    };

    const response = await fetch(BREVO_TRANSACTIONAL_EMAIL_ENDPOINT, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[${logPrefix}] Brevo API error:`, {
        status: response.status,
        body: body.slice(0, 500),
      });
      return { ok: false, reason: 'delivery_failed' };
    }

    return { ok: true };
  } catch (error) {
    console.error(`[${logPrefix}] Brevo API error:`, formatErrorForLog(error));
    return { ok: false, reason: 'delivery_failed' };
  }
}
