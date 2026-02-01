// emails/welcome.tsx
// Welcome email sent to new newsletter subscribers

import { createUnsubscribeToken, resolveUnsubscribeSecret } from '@/lib/newsletter/unsubscribeToken';

// ============================================================================
// CONFIGURATION
// ============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://payetax.co.uk';

// ============================================================================
// SECURITY HELPERS
// ============================================================================

/**
 * Generate a signed unsubscribe token.
 * Prevents abuse and avoids leaking email in URLs.
 * Uses 128-bit signature (32 hex chars) for security.
 *
 * NOTE: Email is embedded in token (base64 encoded). This is visible to
 * anyone with the URL but is acceptable since:
 * - The URL is only shared with the subscriber via their email
 * - Referrer-Policy: no-referrer prevents leakage to third parties
 * - For truly opaque tokens, would need server-side token storage
 */
export function generateUnsubscribeToken(email: string): string {
  const secret = resolveUnsubscribeSecret();
  return createUnsubscribeToken(email, secret);
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

/**
 * Generate HTML welcome email for new subscribers.
 */
export function generateWelcomeEmailHtml(email: string): string {
  const unsubscribeToken = generateUnsubscribeToken(email);
  const unsubscribeUrl = `${BASE_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PayeTax</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <!-- Preheader (hidden preview text) -->
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent; font-size: 1px; line-height: 1px;">
    Thanks for subscribing — tax tips, allowances, and updates. No spam.
    ${'&nbsp;'.repeat(50)}
  </div>

  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header (Outlook-safe: no gradient text) -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="margin: 0; font-size: 24px;">
        <span style="color: #020617;">paye</span><span style="color: #0d9488;">tax</span>
      </h1>
    </div>

    <!-- Main Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #020617; line-height: 1.3;">
        Welcome to PayeTax!
      </h2>

      <p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 1.6;">
        Thanks for subscribing. You'll receive occasional updates when we publish new content about:
      </p>

      <ul style="margin: 0 0 24px; padding-left: 20px; color: #475569; font-size: 16px; line-height: 1.8;">
        <li>UK tax changes and budget updates</li>
        <li>Practical tips to reduce your tax bill</li>
        <li>Guides on pensions, NI, and allowances</li>
      </ul>

      <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
        No spam, just valuable content (1-2 emails per month). You can unsubscribe anytime.
      </p>

      <!-- CTA Button -->
      <a href="${BASE_URL}?utm_source=newsletter&utm_medium=email&utm_campaign=welcome" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Calculate Your Take-Home Pay →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; color: #94a3b8; font-size: 12px;">
        You're receiving this because you subscribed to PayeTax updates.
      </p>
      <p style="margin: 16px 0 0; color: #94a3b8; font-size: 12px;">
        <a href="${unsubscribeUrl}" style="color: #06b6d4; text-decoration: none;">Unsubscribe</a>
        &nbsp;•&nbsp;
        <a href="${BASE_URL}/privacy" style="color: #94a3b8; text-decoration: none;">Privacy</a>
        &nbsp;•&nbsp;
        <a href="${BASE_URL}" style="color: #94a3b8; text-decoration: none;">payetax.co.uk</a>
      </p>
      <p style="margin: 16px 0 0; color: #cbd5e1; font-size: 11px;">
        © ${new Date().getFullYear()} PayeTax. Free UK tax calculator.
      </p>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Generate plain-text welcome email for new subscribers.
 * Required for deliverability - send as multipart with HTML.
 */
export function generateWelcomeEmailText(email: string): string {
  const unsubscribeToken = generateUnsubscribeToken(email);
  const unsubscribeUrl = `${BASE_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

  return `
Welcome to PayeTax!
===================

Thanks for subscribing. You'll receive occasional updates when we publish new content about:

- UK tax changes and budget updates
- Practical tips to reduce your tax bill
- Guides on pensions, NI, and allowances

No spam, just valuable content (1-2 emails per month). You can unsubscribe anytime.

Calculate your take-home pay:
${BASE_URL}

---

You're receiving this because you subscribed to PayeTax updates.

Unsubscribe: ${unsubscribeUrl}
Privacy: ${BASE_URL}/privacy

© ${new Date().getFullYear()} PayeTax. Free UK tax calculator.
`.trim();
}

export default generateWelcomeEmailHtml;
