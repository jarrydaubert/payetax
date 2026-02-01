// emails/new-blog-post.tsx
// Newsletter email template matching the calculator results email style

import { createUnsubscribeToken, resolveUnsubscribeSecret } from '@/lib/newsletter/unsubscribeToken';

// ============================================================================
// CONFIGURATION
// ============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://payetax.co.uk';
const ALLOWED_HOSTS = ['payetax.co.uk', 'www.payetax.co.uk'];

// ============================================================================
// SECURITY HELPERS
// ============================================================================

/**
 * Escape HTML special characters to prevent XSS/injection.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validate and sanitize URL - only allow our domain(s).
 */
function safeUrl(raw: string): string {
  try {
    const url = new URL(raw);
    if (!ALLOWED_HOSTS.includes(url.hostname)) {
      return BASE_URL;
    }
    return url.toString();
  } catch {
    return BASE_URL;
  }
}

/**
 * Generate a signed unsubscribe token.
 * This prevents abuse (unsubscribing other people) and avoids leaking email in URLs.
 */
function generateUnsubscribeToken(email: string): string {
  const secret = resolveUnsubscribeSecret();
  return createUnsubscribeToken(email, secret);
}

/**
 * Add UTM parameters to a URL for tracking.
 */
function addUtmParams(
  url: string,
  params: { source?: string; medium?: string; campaign?: string; content?: string } = {},
): string {
  try {
    const parsed = new URL(url);
    if (params.source) parsed.searchParams.set('utm_source', params.source);
    if (params.medium) parsed.searchParams.set('utm_medium', params.medium);
    if (params.campaign) parsed.searchParams.set('utm_campaign', params.campaign);
    if (params.content) parsed.searchParams.set('utm_content', params.content);
    return parsed.toString();
  } catch {
    return url;
  }
}

// ============================================================================
// EMAIL TEMPLATE
// ============================================================================

interface NewBlogPostEmailProps {
  title: string;
  excerpt: string;
  url: string;
  category?: string;
  publishedAt?: string;
  recipientEmail: string;
}

/**
 * Generate HTML email for new blog post notification.
 */
export function generateNewBlogPostHtml({
  title = 'New Blog Post Title',
  excerpt = 'This is a preview of the blog post content that gives readers a taste of what to expect...',
  url = 'https://payetax.co.uk/blog/example-post',
  category = 'Tax Tips',
  publishedAt,
  recipientEmail,
}: NewBlogPostEmailProps): string {
  // Security: escape all user/CMS content
  const safeTitle = escapeHtml(title);
  const safeExcerpt = escapeHtml(excerpt);
  const safeCategory = escapeHtml(category);
  const articleUrl = safeUrl(url);

  // Generate signed unsubscribe token (not raw email)
  const unsubscribeToken = generateUnsubscribeToken(recipientEmail);
  const unsubscribeUrl = `${BASE_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

  // Add UTM tracking to links
  const utmParams = { source: 'newsletter', medium: 'email', campaign: 'taxinsights' };
  const trackedArticleUrl = addUtmParams(articleUrl, { ...utmParams, content: 'read_article' });
  const trackedCalculatorUrl = addUtmParams(`${BASE_URL}`, {
    ...utmParams,
    content: 'calculator_cta',
  });

  // Format date in UTC to avoid timezone issues
  const formattedDate = publishedAt
    ? new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(publishedAt))
    : null;

  // Preheader text (shown in email client preview)
  const preheaderText = safeExcerpt.slice(0, 90) + (safeExcerpt.length > 90 ? '...' : '');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New on PayeTax: ${safeTitle}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <!-- Preheader (hidden preview text) -->
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent; font-size: 1px; line-height: 1px;">
    ${preheaderText}
    ${'&nbsp;'.repeat(50)}
  </div>

  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header (Outlook-safe: no gradient text) -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="margin: 0; font-size: 24px;">
        <span style="color: #020617;">paye</span><span style="color: #0d9488;">tax</span>
      </h1>
      <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">TaxInsights Newsletter</p>
    </div>

    <!-- Main Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <!-- Category & Date -->
      <div style="margin-bottom: 16px;">
        <span style="display: inline-block; background-color: rgba(13, 148, 136, 0.1); color: #0d9488; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">${safeCategory}</span>
        ${formattedDate ? `<span style="color: #94a3b8; font-size: 12px; margin-left: 12px;">${formattedDate}</span>` : ''}
      </div>

      <!-- Title -->
      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #020617; line-height: 1.3;">
        ${safeTitle}
      </h2>

      <!-- Excerpt -->
      <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
        ${safeExcerpt}
      </p>

      <!-- CTA Button (gradient works on button backgrounds in most clients) -->
      <a href="${trackedArticleUrl}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;" aria-label="Read Full Article: ${safeTitle}">
        Read Full Article →
      </a>
    </div>

    <!-- Secondary CTA -->
    <div style="text-align: center; margin-top: 24px;">
      <p style="margin: 0 0 12px; color: #64748b; font-size: 14px;">
        Need to calculate your take-home pay?
      </p>
      <a href="${trackedCalculatorUrl}" style="display: inline-block; background: white; color: #0d9488; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; border: 1px solid #e2e8f0;">
        Try Tax Calculator
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
 * Generate plain-text email for new blog post notification.
 * Required for deliverability - send as multipart with HTML.
 */
export function generateNewBlogPostText({
  title = 'New Blog Post Title',
  excerpt = 'This is a preview of the blog post content...',
  url = 'https://payetax.co.uk/blog/example-post',
  category = 'Tax Tips',
  publishedAt,
  recipientEmail,
}: NewBlogPostEmailProps): string {
  const articleUrl = safeUrl(url);
  const unsubscribeToken = generateUnsubscribeToken(recipientEmail);
  const unsubscribeUrl = `${BASE_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

  const formattedDate = publishedAt
    ? new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(publishedAt))
    : '';

  return `
PayeTax TaxInsights Newsletter
==============================

${category.toUpperCase()}${formattedDate ? ` | ${formattedDate}` : ''}

${title}
${'='.repeat(title.length)}

${excerpt}

Read the full article:
${articleUrl}

---

Need to calculate your take-home pay?
Visit: ${BASE_URL}

---

You're receiving this because you subscribed to PayeTax updates.

Unsubscribe: ${unsubscribeUrl}
Privacy: ${BASE_URL}/privacy

© ${new Date().getFullYear()} PayeTax. Free UK tax calculator.
`.trim();
}

export default generateNewBlogPostHtml;
