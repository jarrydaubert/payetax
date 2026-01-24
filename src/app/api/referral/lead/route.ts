// src/app/api/referral/lead/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Email to receive lead notifications - configure via environment variable
const PARTNER_NOTIFICATION_EMAIL = process.env.REFERRAL_PARTNER_EMAIL || 'support@payetax.co.uk';

const ReferralLeadSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  salaryRange: z.enum(['75k-100k', '100k-125k', '125k+']),
  reason: z.enum(['tax-trap', 'high-earner', 'scottish-high', 'additional-rate']),
  isScottish: z.boolean(),
});

type ReferralLead = z.infer<typeof ReferralLeadSchema>;

function getReasonLabel(reason: ReferralLead['reason']): string {
  const labels: Record<ReferralLead['reason'], string> = {
    'tax-trap': '£100k Tax Trap (Personal Allowance Taper)',
    'high-earner': 'High Earner (£75k-£100k)',
    'scottish-high': 'Scottish High Earner',
    'additional-rate': 'Additional Rate Taxpayer (£125k+)',
  };
  return labels[reason];
}

function generatePartnerNotificationEmail(lead: ReferralLead): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Tax Advice Lead - PayeTax</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <h1 style="margin: 0 0 24px; font-size: 24px; color: #020617;">New Tax Advice Lead</h1>

      <p style="margin: 0 0 16px; color: #64748b;">A PayeTax user has requested professional tax advice.</p>

      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 0; color: #64748b; font-weight: 600;">Email</td>
          <td style="padding: 12px 0; color: #020617;"><a href="mailto:${lead.email}" style="color: #06b6d4;">${lead.email}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 0; color: #64748b; font-weight: 600;">Salary Range</td>
          <td style="padding: 12px 0; color: #020617;">${lead.salaryRange}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 0; color: #64748b; font-weight: 600;">Situation</td>
          <td style="padding: 12px 0; color: #020617;">${getReasonLabel(lead.reason)}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #64748b; font-weight: 600;">Region</td>
          <td style="padding: 12px 0; color: #020617;">${lead.isScottish ? 'Scotland' : 'England/Wales/NI'}</td>
        </tr>
      </table>

      <div style="margin-top: 24px; padding: 16px; background: #f0fdf4; border-radius: 8px;">
        <p style="margin: 0; color: #166534; font-size: 14px;">
          <strong>Recommended action:</strong> Reach out within 24 hours. This lead has actively requested tax advice through PayeTax.
        </p>
      </div>
    </div>

    <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px;">
      <p>PayeTax Referral Program</p>
    </div>
  </div>
</body>
</html>
`;
}

function generateUserConfirmationEmail(lead: ReferralLead): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Advice Request Received - PayeTax</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="margin: 0; font-size: 24px; color: #020617;">
        <span style="color: #020617;">paye</span><span style="background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">tax</span>
      </h1>
    </div>

    <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <h2 style="margin: 0 0 16px; font-size: 20px; color: #020617;">Thanks for your interest!</h2>

      <p style="margin: 0 0 16px; color: #64748b;">
        We've received your request for professional tax advice. A qualified UK tax specialist will be in touch within 24-48 hours to discuss your situation.
      </p>

      <div style="padding: 16px; background: #f8fafc; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0 0 8px; color: #64748b; font-size: 14px; font-weight: 600;">Your situation:</p>
        <p style="margin: 0; color: #020617;">${getReasonLabel(lead.reason)}</p>
      </div>

      <p style="margin: 0; color: #64748b; font-size: 14px;">
        In the meantime, you can continue using PayeTax to explore different salary scenarios and understand your tax position better.
      </p>
    </div>

    <div style="text-align: center; margin-top: 32px;">
      <a href="https://payetax.co.uk" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Back to PayeTax
      </a>
    </div>

    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; color: #94a3b8; font-size: 12px;">
        This email was sent because you requested tax advice through PayeTax.
      </p>
      <p style="margin: 16px 0 0; color: #94a3b8; font-size: 12px;">
        <a href="https://payetax.co.uk" style="color: #06b6d4; text-decoration: none;">payetax.co.uk</a>
        &nbsp;•&nbsp;
        <a href="https://payetax.co.uk/privacy" style="color: #94a3b8; text-decoration: none;">Privacy</a>
      </p>
    </div>
  </div>
</body>
</html>
`;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 leads per hour per IP
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ipAddress, { max: 3, window: 3600000 })) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    if (!resend) {
      console.error('[referral/lead] Resend not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
    }

    const body = await request.json();
    const validation = ReferralLeadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const lead = validation.data;

    // Send notification to partner/business
    const partnerEmailResult = await resend.emails.send({
      from: 'PayeTax Leads <noreply@payetax.co.uk>',
      to: PARTNER_NOTIFICATION_EMAIL,
      subject: `New Tax Advice Lead - ${lead.salaryRange} - ${getReasonLabel(lead.reason)}`,
      html: generatePartnerNotificationEmail(lead),
    });

    if (partnerEmailResult.error) {
      console.error('[referral/lead] Partner notification error:', partnerEmailResult.error);
      // Continue anyway - don't fail the user request
    }

    // Send confirmation to user
    const userEmailResult = await resend.emails.send({
      from: 'PayeTax <noreply@payetax.co.uk>',
      to: lead.email,
      subject: 'Your Tax Advice Request - PayeTax',
      html: generateUserConfirmationEmail(lead),
    });

    if (userEmailResult.error) {
      console.error('[referral/lead] User confirmation error:', userEmailResult.error);
      return NextResponse.json({ error: 'Failed to send confirmation email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[referral/lead] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
