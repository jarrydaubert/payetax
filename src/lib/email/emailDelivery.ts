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

type BrevoFailureCategory =
  | 'unauthorized_ip'
  | 'authorization'
  | 'rate_limit'
  | 'request_rejected'
  | 'provider_error';

const BREVO_TRANSACTIONAL_EMAIL_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

interface BrevoErrorDetails {
  code?: string;
  message?: string;
}

function getBrevoErrorDetails(body: string): BrevoErrorDetails {
  try {
    const parsed = JSON.parse(body) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return {};

    const details: BrevoErrorDetails = {};
    if (
      'code' in parsed &&
      typeof parsed.code === 'string' &&
      /^[a-z0-9_-]{1,64}$/iu.test(parsed.code)
    ) {
      details.code = parsed.code;
    }

    if ('message' in parsed && typeof parsed.message === 'string') details.message = parsed.message;
    return details;
  } catch {
    // Brevo can return non-JSON responses. Status and category remain diagnostic.
  }

  return {};
}

function classifyBrevoFailure(status: number, message?: string): BrevoFailureCategory {
  const normalizedMessage = message?.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ') ?? '';
  const describesBlockedIp =
    /\b(?:unknown|unrecogni[sz]ed|unauthori[sz]ed) ip(?: address)?\b/u.test(normalizedMessage) ||
    /\bip(?: address)? (?:(?:is|was|has) )?(?:not (?:been )?(?:authori[sz]ed|verified)|unknown|unrecogni[sz]ed|unauthori[sz]ed)\b/u.test(
      normalizedMessage,
    );

  if ((status === 401 || status === 403) && describesBlockedIp) {
    return 'unauthorized_ip';
  }

  if (status === 401 || status === 403) return 'authorization';
  if (status === 429) return 'rate_limit';
  if (status >= 400 && status < 500) return 'request_rejected';
  return 'provider_error';
}

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
      const { code, message: providerMessage } = getBrevoErrorDetails(body);
      console.error(`[${logPrefix}] Brevo API error:`, {
        status: response.status,
        category: classifyBrevoFailure(response.status, providerMessage),
        ...(code ? { code } : {}),
      });
      return { ok: false, reason: 'delivery_failed' };
    }

    return { ok: true };
  } catch (error) {
    console.error(`[${logPrefix}] Brevo API error:`, formatErrorForLog(error));
    return { ok: false, reason: 'delivery_failed' };
  }
}
