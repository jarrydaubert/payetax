// emails/welcome.tsx
// Welcome email sent to new newsletter subscribers

export function generateWelcomeEmailHtml(unsubscribeUrl = '{{{RESEND_UNSUBSCRIBE_URL}}}'): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PayeTax</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="margin: 0; font-size: 24px; color: #020617;">
        <span style="color: #020617;">paye</span><span style="background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">tax</span>
      </h1>
    </div>

    <!-- Main Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #020617; line-height: 1.3;">
        Welcome to PayeTax! 🎉
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
        No spam, just valuable content. You can unsubscribe anytime.
      </p>

      <!-- CTA Button -->
      <a href="https://payetax.co.uk" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
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

export default generateWelcomeEmailHtml;
