// src/app/api/referral/lead/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';
import { isValidRequestOrigin } from '@/lib/security/origin';
import { ReferralLeadRequestSchema } from '@/lib/validation/emailValidation';

export const runtime = 'nodejs';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Email to receive lead notifications - REQUIRED in production
const PARTNER_NOTIFICATION_EMAIL = process.env.REFERRAL_PARTNER_EMAIL;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const MAX_BODY_SIZE = 2048; // 2KB is plenty for a lead form

const ReferralLeadSchema = ReferralLeadRequestSchema.extend({
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must consent to being contacted',
  }),
  source: z.string().max(100).optional(),
}).strict();

type ReferralLead = z.infer<typeof ReferralLeadSchema>;

/** Escape HTML to prevent injection */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Get client identifier - never returns shared bucket */
function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp) return `ip:${firstIp}`;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return `ip:${realIp}`;

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return `ip:${cfIp}`;

  // Fallback: hash of user-agent to avoid shared bucket
  const ua = request.headers.get('user-agent') || 'unknown';
  return `ua:${Buffer.from(ua).toString('base64').slice(0, 16)}`;
}

function getReasonLabel(reason: ReferralLead['reason']): string {
  const labels: Record<ReferralLead['reason'], string> = {
    'tax-trap': '£100k Tax Trap (Personal Allowance Taper)',
    'high-earner': 'High Earner (£75k-£100k)',
    'scottish-high': 'Scottish High Earner',
    'additional-rate': 'Additional Rate Taxpayer (£125k+)',
  };
  return labels[reason];
}

function generatePartnerNotificationEmail(lead: ReferralLead): { html: string; text: string } {
  const safeEmail = escapeHtml(lead.email);
  const safeSalaryRange = escapeHtml(lead.salaryRange);
  const safeReason = escapeHtml(getReasonLabel(lead.reason));
  const safeRegion = lead.isScottish ? 'Scotland' : 'England/Wales/NI';
  const safeSource = lead.source ? escapeHtml(lead.source) : 'Direct';

  const html = `
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
          <td style="padding: 12px 0; color: #020617;"><a href="mailto:${encodeURIComponent(lead.email)}" style="color: #06b6d4;">${safeEmail}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 0; color: #64748b; font-weight: 600;">Salary Range</td>
          <td style="padding: 12px 0; color: #020617;">${safeSalaryRange}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 0; color: #64748b; font-weight: 600;">Situation</td>
          <td style="padding: 12px 0; color: #020617;">${safeReason}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 0; color: #64748b; font-weight: 600;">Region</td>
          <td style="padding: 12px 0; color: #020617;">${safeRegion}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #64748b; font-weight: 600;">Source</td>
          <td style="padding: 12px 0; color: #020617;">${safeSource}</td>
        </tr>
      </table>

      <div style="margin-top: 24px; padding: 16px; background: #f0fdf4; border-radius: 8px;">
        <p style="margin: 0; color: #166534; font-size: 14px;">
          <strong>Recommended action:</strong> Reach out within 24 hours. This lead has actively requested tax advice and consented to contact.
        </p>
      </div>
    </div>

    <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px;">
      <p>PayeTax Referral Program • Submitted ${new Date().toISOString()}</p>
    </div>
  </div>
</body>
</html>
`;

  const text = `
New Tax Advice Lead - PayeTax
=============================

A PayeTax user has requested professional tax advice.

Email: ${lead.email}
Salary Range: ${lead.salaryRange}
Situation: ${getReasonLabel(lead.reason)}
Region: ${safeRegion}
Source: ${lead.source || 'Direct'}

Recommended action: Reach out within 24 hours.
This lead has actively requested tax advice and consented to contact.

Submitted: ${new Date().toISOString()}
`.trim();

  return { html, text };
}

function generateUserConfirmationEmail(lead: ReferralLead): { html: string; text: string } {
  const safeReason = escapeHtml(getReasonLabel(lead.reason));

  const html = `
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
        <span style="color: #020617;">paye</span><span style="color: #0d9488;">tax</span>
      </h1>
    </div>

    <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <h2 style="margin: 0 0 16px; font-size: 20px; color: #020617;">Thanks for your interest!</h2>

      <p style="margin: 0 0 16px; color: #64748b;">
        We've received your request for professional tax advice. A qualified UK tax specialist will be in touch within 24-48 hours to discuss your situation.
      </p>

      <div style="padding: 16px; background: #f8fafc; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0 0 8px; color: #64748b; font-size: 14px; font-weight: 600;">Your situation:</p>
        <p style="margin: 0; color: #020617;">${safeReason}</p>
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

  const text = `
Thanks for your interest!
========================

We've received your request for professional tax advice. A qualified UK tax specialist will be in touch within 24-48 hours to discuss your situation.

Your situation: ${getReasonLabel(lead.reason)}

In the meantime, you can continue using PayeTax to explore different salary scenarios.

Visit: https://payetax.co.uk

---
This email was sent because you requested tax advice through PayeTax.
Privacy: https://payetax.co.uk/privacy
`.trim();

  return { html, text };
}

export async function POST(request: NextRequest) {
  // CSRF protection
  if (!isValidRequestOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }

  // Rate limiting: 3 leads per hour per client
  const clientId = getClientIdentifier(request);
  if (!checkRateLimit(clientId, { max: 3, window: 3600000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  // Check configuration
  if (!resend) {
    console.error('[referral/lead] Resend not configured');
    return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
  }

  if (!PARTNER_NOTIFICATION_EMAIL) {
    if (IS_PRODUCTION) {
      console.error('[referral/lead] REFERRAL_PARTNER_EMAIL not configured in production');
      return NextResponse.json({ error: 'Lead service not configured' }, { status: 503 });
    }
    console.warn('[referral/lead] Using fallback support@ email - set REFERRAL_PARTNER_EMAIL');
  }

  const partnerEmail = PARTNER_NOTIFICATION_EMAIL || 'support@payetax.co.uk';

  // Read body with size limit
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: 'Failed to read request body' }, { status: 400 });
  }

  if (rawBody.length > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
  }

  // Parse JSON
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate with Zod
  const validation = ReferralLeadSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: validation.error.flatten() },
      { status: 400 },
    );
  }

  const lead = validation.data;

  // Generate emails with HTML escaping
  const partnerEmailContent = generatePartnerNotificationEmail(lead);
  const userEmailContent = generateUserConfirmationEmail(lead);

  try {
    // Send user confirmation (core UX - must succeed)
    const userEmailResult = await resend.emails.send({
      from: 'PayeTax <noreply@payetax.co.uk>',
      to: lead.email,
      subject: 'Your Tax Advice Request - PayeTax',
      html: userEmailContent.html,
      text: userEmailContent.text,
    });

    if (userEmailResult.error) {
      console.error('[referral/lead] User confirmation error:', userEmailResult.error);
      return NextResponse.json({ error: 'Failed to send confirmation email' }, { status: 500 });
    }

    // Send partner notification (fire-and-forget - don't block user)
    resend.emails
      .send({
        from: 'PayeTax Leads <noreply@payetax.co.uk>',
        to: partnerEmail,
        replyTo: lead.email,
        subject: `New Tax Advice Lead - ${lead.salaryRange} - ${getReasonLabel(lead.reason)}`,
        html: partnerEmailContent.html,
        text: partnerEmailContent.text,
      })
      .catch((err) => {
        console.error('[referral/lead] Partner notification error:', err);
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[referral/lead] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
