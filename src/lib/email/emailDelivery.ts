import { createTransport } from 'nodemailer';

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

function formatErrorForLog(error: unknown): { name?: string; message?: string } {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }

  return { message: 'Unknown error' };
}

function getSmtpConfig() {
  const host = process.env.BREVO_SMTP_HOST;
  const login = process.env.BREVO_SMTP_LOGIN;
  const password = process.env.BREVO_SMTP_PASSWORD;
  const port = Number(process.env.BREVO_SMTP_PORT || '587');

  if (!(host && login && password && Number.isFinite(port))) return null;

  return { host, login, password, port };
}

export function isOutboundEmailConfigured(): boolean {
  return Boolean(getSmtpConfig());
}

export async function sendOutboundEmail(
  message: OutboundEmailMessage,
  logPrefix: string,
): Promise<SendOutboundEmailResult> {
  const config = getSmtpConfig();
  if (!config) {
    console.error(`[${logPrefix}] Brevo SMTP not configured`);
    return { ok: false, reason: 'not_configured' };
  }

  try {
    const transporter = createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.login,
        pass: config.password,
      },
    });

    await transporter.sendMail({
      from: message.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      replyTo: message.replyTo,
    });

    return { ok: true };
  } catch (error) {
    console.error(`[${logPrefix}] Brevo SMTP error:`, formatErrorForLog(error));
    return { ok: false, reason: 'delivery_failed' };
  }
}
