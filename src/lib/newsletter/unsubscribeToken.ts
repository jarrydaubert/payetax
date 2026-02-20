// src/lib/newsletter/unsubscribeToken.ts
/**
 * Newsletter Unsubscribe Token helpers
 *
 * Design goals:
 * - Same logic used everywhere (email templates + API routes)
 * - No default secret in production (missing config must be explicit)
 * - Backwards compatible with legacy 16-hex signature tokens until cutoff
 */

import crypto from 'node:crypto';
import { z } from 'zod';

// Token validity: 30 days (in milliseconds)
export const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
export const LEGACY_64BIT_SIGNATURE_SUPPORT_END_ISO = '2026-06-30';
const LEGACY_64BIT_SIGNATURE_SUPPORT_END_MS = Date.parse(
  `${LEGACY_64BIT_SIGNATURE_SUPPORT_END_ISO}T23:59:59.999Z`,
);

const DEV_FALLBACK_SECRET = 'payetax-dev-secret-do-not-use-in-prod';

const emailSchema = z.string().email('Invalid email address');

export function resolveUnsubscribeSecret(env: NodeJS.ProcessEnv = process.env): string {
  const secret = env.UNSUBSCRIBE_SECRET;
  const isProduction = env.NODE_ENV === 'production';

  if (secret && secret.length > 0) return secret;

  if (isProduction) {
    throw new Error('UNSUBSCRIBE_SECRET is required in production');
  }

  return DEV_FALLBACK_SECRET;
}

export function createUnsubscribeToken(
  email: string,
  secret: string,
  nowMs: number = Date.now(),
  signatureHexLength: 16 | 32 = 32,
): string {
  const data = `${email}:${nowMs}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  const signature = hmac.digest('hex').slice(0, signatureHexLength);
  return Buffer.from(`${data}:${signature}`).toString('base64url');
}

/**
 * Verify and decode an unsubscribe token.
 * Returns the email if valid, null otherwise.
 */
export function verifyUnsubscribeToken(
  token: string,
  secret: string,
  nowMs: number = Date.now(),
): string | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return null;

    const [email, timestampStr, signature] = parts;
    if (!(email && timestampStr && signature)) return null;

    const timestamp = Number.parseInt(timestampStr, 10);
    if (Number.isNaN(timestamp)) return null;

    const age = nowMs - timestamp;
    if (age > TOKEN_MAX_AGE_MS || age < 0) return null;

    const data = `${email}:${timestampStr}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    const expectedSignature = hmac.digest('hex').slice(0, 32); // 128-bit

    // Backwards compat: accept 16-hex (64-bit) signatures until the sunset date.
    const isLegacy64BitSignature = signature.length === 16;
    if (isLegacy64BitSignature && nowMs > LEGACY_64BIT_SIGNATURE_SUPPORT_END_MS) {
      return null;
    }

    const sigToCompare = isLegacy64BitSignature
      ? expectedSignature.slice(0, 16)
      : expectedSignature;

    if (signature.length !== sigToCompare.length) return null;
    if (
      !crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(sigToCompare, 'utf8'))
    ) {
      return null;
    }

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) return null;

    return email;
  } catch {
    return null;
  }
}
