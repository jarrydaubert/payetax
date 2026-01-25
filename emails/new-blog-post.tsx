// emails/new-blog-post.tsx
// Newsletter email template matching the calculator results email style

interface NewBlogPostEmailProps {
  title: string;
  excerpt: string;
  url: string;
  category?: string;
  publishedAt?: string;
  recipientEmail: string;
}

export function generateNewBlogPostHtml({
  title = 'New Blog Post Title',
  excerpt = 'This is a preview of the blog post content that gives readers a taste of what to expect...',
  url = 'https://payetax.co.uk/blog/example-post',
  category = 'Tax Tips',
  publishedAt,
  recipientEmail,
}: NewBlogPostEmailProps): string {
  const unsubscribeUrl = `https://payetax.co.uk/api/newsletter/unsubscribe?email=${encodeURIComponent(recipientEmail)}`;
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New on PayeTax: ${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="margin: 0; font-size: 24px; color: #020617;">
        <span style="color: #020617;">paye</span><span style="background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">tax</span>
      </h1>
      <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">TaxInsights Newsletter</p>
    </div>

    <!-- Main Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <!-- Category & Date -->
      <div style="margin-bottom: 16px;">
        <span style="display: inline-block; background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%); color: #0d9488; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">${category}</span>
        ${formattedDate ? `<span style="color: #94a3b8; font-size: 12px; margin-left: 12px;">${formattedDate}</span>` : ''}
      </div>

      <!-- Title -->
      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #020617; line-height: 1.3;">
        ${title}
      </h2>

      <!-- Excerpt -->
      <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
        ${excerpt}
      </p>

      <!-- CTA Button -->
      <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Read Full Article →
      </a>
    </div>

    <!-- Secondary CTA -->
    <div style="text-align: center; margin-top: 24px;">
      <p style="margin: 0 0 12px; color: #64748b; font-size: 14px;">
        Need to calculate your take-home pay?
      </p>
      <a href="https://payetax.co.uk" style="display: inline-block; background: white; color: #0d9488; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; border: 1px solid #e2e8f0;">
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
        <a href="https://payetax.co.uk/privacy" style="color: #94a3b8; text-decoration: none;">Privacy</a>
        &nbsp;•&nbsp;
        <a href="https://payetax.co.uk" style="color: #94a3b8; text-decoration: none;">payetax.co.uk</a>
      </p>
      <p style="margin: 16px 0 0; color: #cbd5e1; font-size: 11px;">
        © 2026 PayeTax. Free UK tax calculator.
      </p>
    </div>
  </div>
</body>
</html>
`;
}

export default generateNewBlogPostHtml;
