'use server';

/**
 * Server Action for feedback form submission
 * React 19 pattern: Replaces API route with server action
 * Uses Next.js 16 after() API for non-blocking email sends
 */

import { headers } from 'next/headers';
import { after } from 'next/server';
import { isOutboundEmailConfigured, sendOutboundEmail } from '@/lib/email/emailDelivery';
import { checkRateLimitWithPolicy } from '@/lib/rateLimit';
import { validateFeedbackForm } from '@/lib/validation/moleculesValidation';

// Max message length to prevent abuse (10KB)
const MAX_MESSAGE_LENGTH = 10000;

export interface FeedbackFormState {
  success: boolean;
  error?: string;
  message?: string;
}

/** Safely extract string from FormData (handles null/File) */
function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

/** Escape HTML to prevent injection in email */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Get client IP from headers (Vercel securely sets x-forwarded-for) */
async function getClientIp(): Promise<string> {
  const headersList = await headers();
  // Vercel/Cloudflare set these securely at the edge
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const cfIp = headersList.get('cf-connecting-ip');

  // x-forwarded-for can be comma-separated; take the first (client) IP
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0];
    if (firstIp) return firstIp.trim();
  }

  return cfIp || realIp || 'unknown';
}

/**
 * Submit feedback form server action
 * React 19 useActionState compatible
 */
export async function submitFeedback(
  _prevState: FeedbackFormState,
  formData: FormData,
): Promise<FeedbackFormState> {
  // Safely extract form data
  const email = getString(formData, 'email');
  const message = getString(formData, 'message');
  const url = getString(formData, 'url');
  const userAgent = getString(formData, 'userAgent');
  const timestamp = getString(formData, 'timestamp');

  // Validate using Zod schema
  const validationResult = validateFeedbackForm({ email, message });

  if (!validationResult.success) {
    const zodErrors = validationResult.error.flatten().fieldErrors;
    const firstError = zodErrors.email?.[0] || zodErrors.message?.[0] || 'Invalid form data';
    return { success: false, error: firstError };
  }

  // Cap message length to prevent abuse
  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      success: false,
      error: `Message too long. Please keep it under ${MAX_MESSAGE_LENGTH.toLocaleString()} characters.`,
    };
  }

  // Get real client IP for rate limiting
  const ipAddress = await getClientIp();

  // Check rate limit (10 requests per minute per IP)
  const rateLimit = await checkRateLimitWithPolicy(
    `feedback:${ipAddress}`,
    undefined,
    'require_distributed_in_production',
  );
  if (rateLimit.reason === 'distributed_unavailable') {
    return {
      success: false,
      error: 'Something went wrong. Please try again later.',
    };
  }
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: 'Too many requests. Please try again in a minute.',
    };
  }

  if (!isOutboundEmailConfigured()) {
    console.error('Feedback submission failed: Brevo SMTP not configured');
    return {
      success: false,
      error: 'Something went wrong. Please try again later.',
    };
  }

  // Escape ALL values interpolated into HTML (including timestamp, userAgent, IP)
  const safeMessage = escapeHtml(message);
  const safeEmail = email ? escapeHtml(email) : 'Not provided';
  const safeUrl = url ? escapeHtml(url) : 'N/A';
  const safeTimestamp = escapeHtml(timestamp || new Date().toLocaleString());
  const safeUserAgent = escapeHtml((userAgent || 'N/A').slice(0, 200));
  const safeIp = escapeHtml(ipAddress);
  // Send email AFTER response is returned (non-blocking)
  after(async () => {
    try {
      const result = await sendOutboundEmail(
        {
          from: process.env.BREVO_FROM_EMAIL || 'PayeTax <support@payetax.co.uk>',
          to: process.env.FEEDBACK_TO_EMAIL || 'support@payetax.co.uk',
          replyTo: email || undefined,
          subject: `New Feedback from ${safeEmail} on PayeTax`,
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">
              💬 New User Feedback
            </h2>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>📧 Email:</strong> ${safeEmail}</p>
              <p style="margin: 0 0 10px 0;"><strong>📅 Timestamp:</strong> ${safeTimestamp}</p>
              <p style="margin: 0 0 10px 0;"><strong>🌐 Page URL:</strong> ${safeUrl}</p>
              <p style="margin: 0;"><strong>🖥️ IP Address:</strong> ${safeIp}</p>
            </div>

            <div style="background: white; padding: 20px; border-left: 4px solid #7c3aed; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Message:</h3>
              <p style="white-space: pre-wrap; color: #1f2937;">${safeMessage}</p>
            </div>

            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;"><strong>User Agent:</strong></p>
              <p style="margin: 5px 0 0 0; font-size: 11px; color: #9ca3af; font-family: monospace;">${safeUserAgent}...</p>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="text-align: center; color: #9ca3af; font-size: 12px;">
              Submitted via <a href="https://payetax.co.uk" style="color: #7c3aed;">PayeTax.co.uk</a>
            </p>
          </div>
        `,
          text: `New feedback from ${email || 'Anonymous'}

Message: ${message}

---
Page: ${url || 'N/A'}
Timestamp: ${timestamp || new Date().toLocaleString()}
IP: ${ipAddress}

Submitted via PayeTax.co.uk`,
        },
        'feedback',
      );

      if (!result.ok) {
        console.error('Feedback email failed:', result.reason);
      }
    } catch (err) {
      console.error('Feedback email failed:', err);
    }
  });

  return {
    success: true,
    message: 'Thanks! Your feedback has been sent to the team.',
  };
}
