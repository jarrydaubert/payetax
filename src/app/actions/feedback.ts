'use server';

/**
 * Server Action for feedback form submission
 * React 19 pattern: Replaces API route with server action
 * Uses Next.js 16 after() API for non-blocking email sends
 * Used with useActionState hook for optimistic UI updates
 */

import { after } from 'next/server';
import { Resend } from 'resend';
import { checkRateLimit } from '@/lib/rateLimit';
import { validateFeedbackForm } from '@/lib/validation/moleculesValidation';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface FeedbackFormState {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Submit feedback form server action
 * React 19 useActionState compatible
 *
 * @param _prevState - Previous form state (from useActionState) - unused but required for useActionState signature
 * @param formData - Form data from the submission
 * @returns Promise<FeedbackFormState> - New state with success/error
 */
export async function submitFeedback(
  _prevState: FeedbackFormState,
  formData: FormData
): Promise<FeedbackFormState> {
  // Extract form data
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;
  const url = formData.get('url') as string;
  const userAgent = formData.get('userAgent') as string;
  const timestamp = formData.get('timestamp') as string;

  // IP address will be extracted from headers in production
  // For server actions, we'll use a placeholder and rely on Resend's logging
  const ipAddress = 'server-action';

  // Validate using Zod schema
  const validationResult = validateFeedbackForm({ email, message });

  if (!validationResult.success) {
    const zodErrors = validationResult.error.flatten().fieldErrors;
    const firstError = zodErrors.email?.[0] || zodErrors.message?.[0] || 'Invalid form data';
    return {
      success: false,
      error: firstError,
    };
  }

  // Check rate limit (10 requests per minute per IP)
  if (!checkRateLimit(ipAddress)) {
    return {
      success: false,
      error: 'Too many requests. Please try again in a minute.',
    };
  }

  // Early exit if Resend not configured
  if (!resend) {
    return {
      success: false,
      error: 'Server configuration error. Please check environment variables.',
    };
  }

  // Escape HTML to prevent XSS in email
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const safeMessage = escapeHtml(message);
  const safeEmail = email ? escapeHtml(email) : 'Not provided';
  const safeUrl = url ? escapeHtml(url) : 'N/A';

  // Validate Resend is configured before scheduling email
  const resendClient = await Promise.resolve(resend);

  // Next.js 16 after() API: Send email AFTER response is returned to user
  // This makes the feedback submission feel instant while email sends in background
  after(async () => {
    if (!resendClient) return;
    try {
      const { error } = await resendClient.emails.send({
        from: 'PayeTax <support@payetax.co.uk>',
        to: ['support@payetax.co.uk'],
        replyTo: email || undefined,
        subject: `New Feedback from ${safeEmail} on PayeTax`,
        tags: [
          { name: 'source', value: 'website' },
          { name: 'type', value: 'feedback' },
        ],
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">
              💬 New User Feedback
            </h2>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>📧 Email:</strong> ${safeEmail}</p>
              <p style="margin: 0 0 10px 0;"><strong>📅 Timestamp:</strong> ${timestamp || new Date().toLocaleString()}</p>
              <p style="margin: 0 0 10px 0;"><strong>🌐 Page URL:</strong> ${safeUrl}</p>
              <p style="margin: 0;"><strong>🖥️ IP Address:</strong> ${ipAddress}</p>
            </div>

            <div style="background: white; padding: 20px; border-left: 4px solid #7c3aed; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Message:</h3>
              <p style="white-space: pre-wrap; color: #1f2937;">${safeMessage}</p>
            </div>

            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;"><strong>User Agent:</strong></p>
              <p style="margin: 5px 0 0 0; font-size: 11px; color: #9ca3af; font-family: monospace;">${(userAgent || 'N/A').slice(0, 200)}...</p>
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
      });

      if (error) {
        console.error('Feedback email failed:', error.message);
      }
    } catch (err) {
      console.error('Feedback email failed:', err);
    }
  });

  // Return success immediately - email sends in background
  return {
    success: true,
    message: 'Thanks! Your feedback has been sent to the team.',
  };
}
