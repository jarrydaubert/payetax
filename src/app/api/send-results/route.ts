// src/app/api/send-results/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import type { PayPeriod, TaxYear } from '@/constants/taxRates';
import { resolveNewsletterBaseUrl } from '@/lib/newsletter/emailConfig';
import { checkRateLimit } from '@/lib/rateLimit';
import { detectLikelyBotRequest } from '@/lib/security/botGuard';
import { getClientIdentifier } from '@/lib/security/clientIdentifier';
import { isValidRequestOrigin } from '@/lib/security/origin';
import {
  calculateTax,
  type TaxCalculationInput,
  type TaxCalculationResults,
} from '@/lib/taxCalculator';
import { formatCurrency } from '@/lib/utils';
import { SendResultsRequestSchema } from '@/lib/validation/emailValidation';

export const runtime = 'nodejs';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function formatErrorForLog(error: unknown): { name?: string; message?: string } {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }

  return { message: 'Unknown error' };
}
const MAX_BODY_SIZE = 50 * 1024; // 50KB

type EmailResults = TaxCalculationResults;
const BASE_URL = resolveNewsletterBaseUrl();

/** Escape HTML to prevent injection */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Format tax year for display in emails (e.g., "2025-2026" -> "2025-26")
function formatTaxYearForEmail(taxYear: string): string {
  const [start, end] = taxYear.split('-');
  return `${start}-${end?.slice(-2) ?? ''}`;
}

/** Generate plain text email for deliverability */
function generateEmailText(results: EmailResults, taxYear?: string): string {
  const effectiveRate =
    results.grossSalary.annually > 0
      ? (
          ((results.incomeTax.annually + results.nationalInsurance.annually) /
            results.grossSalary.annually) *
          100
        ).toFixed(1)
      : '0';

  const year = taxYear || '2025-26';

  let text = `
YOUR UK TAX CALCULATION - PayeTax
${year}
${'='.repeat(40)}

TAKE-HOME PAY: ${formatCurrency(results.netPay.annually)}/year
(${effectiveRate}% effective tax rate)

BREAKDOWN
---------
Gross Salary:       ${formatCurrency(results.grossSalary.annually)}  (${formatCurrency(results.grossSalary.monthly)}/mo)
Income Tax:         -${formatCurrency(results.incomeTax.annually)}  (-${formatCurrency(results.incomeTax.monthly)}/mo)
National Insurance: -${formatCurrency(results.nationalInsurance.annually)}  (-${formatCurrency(results.nationalInsurance.monthly)}/mo)`;

  if (results.pensionContribution.annually > 0) {
    text += `
Pension:           -${formatCurrency(results.pensionContribution.annually)}  (-${formatCurrency(results.pensionContribution.monthly)}/mo)`;
  }

  if (results.studentLoan.annually > 0) {
    text += `
Student Loan:      -${formatCurrency(results.studentLoan.annually)}  (-${formatCurrency(results.studentLoan.monthly)}/mo)`;
  }

  text += `
---------
Take-Home Pay:      ${formatCurrency(results.netPay.annually)}  (${formatCurrency(results.netPay.monthly)}/mo)

${'='.repeat(40)}
For illustrative purposes only.
Not financial or tax advice.
Consult a qualified accountant for advice specific to your situation.
Based on HMRC rates for ${year} which may change.

Calculate again: ${BASE_URL}
`;

  return text.trim();
}

function generateEmailHtml(results: EmailResults, taxYear?: string): string {
  // Escape taxYear for safe HTML interpolation
  const safeTaxYear = escapeHtml(taxYear || '2025-26');
  const effectiveRate =
    results.grossSalary.annually > 0
      ? (
          ((results.incomeTax.annually + results.nationalInsurance.annually) /
            results.grossSalary.annually) *
          100
        ).toFixed(1)
      : '0';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your UK Tax Calculation - PayeTax</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent; font-size: 1px; line-height: 1px;">
    Your take-home pay: ${formatCurrency(results.netPay.annually)} per year (${effectiveRate}% effective tax rate).
    ${'&nbsp;'.repeat(40)}
  </div>

  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 28px;">
      <h1 style="margin: 0; font-size: 24px;">
        <span style="color: #020617;">paye</span><span style="color: #0d9488;">tax</span>
      </h1>
      <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">UK Tax Calculator</p>
    </div>

    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px;">
      <div style="margin-bottom: 18px;">
        <span style="display: inline-block; background-color: rgba(13, 148, 136, 0.1); color: #0d9488; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.4px;">Calculation Ready</span>
        <span style="color: #94a3b8; font-size: 12px; margin-left: 10px;">Tax Year ${safeTaxYear}</span>
      </div>

      <h2 style="margin: 0 0 8px; font-size: 26px; line-height: 1.25; color: #020617;">Your tax results are in</h2>
      <p style="margin: 0 0 20px; color: #64748b; font-size: 15px; line-height: 1.6;">Below is your annual and monthly breakdown using HMRC rates${safeTaxYear ? ` for ${safeTaxYear}` : ''}.</p>

      <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
        <p style="margin: 0 0 6px; color: #0f766e; font-size: 12px; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700;">Take-Home Pay</p>
        <p style="margin: 0; font-size: 34px; font-weight: 700; color: #0f766e; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1, 'lnum' 1;">${formatCurrency(results.netPay.annually)}</p>
        <p style="margin: 8px 0 0; color: #115e59; font-size: 14px; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1, 'lnum' 1;">${formatCurrency(results.netPay.monthly)}/month • ${effectiveRate}% effective tax rate</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1, 'lnum' 1;">
        <thead>
          <tr style="border-bottom: 2px solid #e2e8f0;">
            <th style="text-align: left; padding: 10px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
            <th style="text-align: right; padding: 10px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Annual</th>
            <th style="text-align: right; padding: 10px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Monthly</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 14px 0; color: #0f172a; font-weight: 600;">Gross Salary</td>
            <td style="padding: 14px 0; text-align: right; color: #0f172a; font-weight: 600;">${formatCurrency(results.grossSalary.annually)}</td>
            <td style="padding: 14px 0; text-align: right; color: #475569;">${formatCurrency(results.grossSalary.monthly)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 14px 0; color: #b91c1c;">Income Tax</td>
            <td style="padding: 14px 0; text-align: right; color: #b91c1c;">-${formatCurrency(results.incomeTax.annually)}</td>
            <td style="padding: 14px 0; text-align: right; color: #475569;">-${formatCurrency(results.incomeTax.monthly)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 14px 0; color: #b91c1c;">National Insurance</td>
            <td style="padding: 14px 0; text-align: right; color: #b91c1c;">-${formatCurrency(results.nationalInsurance.annually)}</td>
            <td style="padding: 14px 0; text-align: right; color: #475569;">-${formatCurrency(results.nationalInsurance.monthly)}</td>
          </tr>
          ${
            results.pensionContribution.annually > 0
              ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 14px 0; color: #92400e;">Pension</td>
            <td style="padding: 14px 0; text-align: right; color: #92400e;">-${formatCurrency(results.pensionContribution.annually)}</td>
            <td style="padding: 14px 0; text-align: right; color: #475569;">-${formatCurrency(results.pensionContribution.monthly)}</td>
          </tr>
          `
              : ''
          }
          ${
            results.studentLoan.annually > 0
              ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 14px 0; color: #6d28d9;">Student Loan</td>
            <td style="padding: 14px 0; text-align: right; color: #6d28d9;">-${formatCurrency(results.studentLoan.annually)}</td>
            <td style="padding: 14px 0; text-align: right; color: #475569;">-${formatCurrency(results.studentLoan.monthly)}</td>
          </tr>
          `
              : ''
          }
          <tr style="background: #ecfeff;">
            <td style="padding: 14px 0; color: #0f766e; font-weight: 700;">Take-Home Pay</td>
            <td style="padding: 14px 0; text-align: right; color: #0f766e; font-weight: 700;">${formatCurrency(results.netPay.annually)}</td>
            <td style="padding: 14px 0; text-align: right; color: #0f766e; font-weight: 700;">${formatCurrency(results.netPay.monthly)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${BASE_URL}?utm_source=results_email&utm_medium=email&utm_campaign=results_followup" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; line-height: 1.2;">
        Recalculate with New Inputs →
      </a>
    </div>

    <div style="text-align: center; margin-top: 28px; padding-top: 22px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.7;">
        For illustrative purposes only. Not financial or tax advice.
        <br>Consult a qualified accountant for advice specific to your situation.
        <br>Based on HMRC rates${safeTaxYear ? ` for ${safeTaxYear}` : ''} which may change.
      </p>
      <p style="margin: 14px 0 0; color: #94a3b8; font-size: 12px;">
        <a href="${BASE_URL}" style="color: #06b6d4; text-decoration: none;">payetax.co.uk</a>
        &nbsp;•&nbsp;
        <a href="${BASE_URL}/privacy" style="color: #94a3b8; text-decoration: none;">Privacy</a>
      </p>
    </div>
  </div>
</body>
</html>
`;
}

export async function POST(request: NextRequest) {
  // CSRF protection check (origin/referer allowlist).
  if (!isValidRequestOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }

  // Rate limiting: 5 emails per minute per client
  const clientId = getClientIdentifier(request, { fallbackPrefix: 'ua:' });
  if (!(await checkRateLimit(`send-results:${clientId}`, { max: 5, window: 60000 }))) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  if (!resend) {
    console.error('[send-results] Resend not configured');
    return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
  }

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

  const botReason = detectLikelyBotRequest(request, body);
  if (botReason) {
    console.warn(`[send-results] blocked likely bot request (${botReason})`);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const validation = SendResultsRequestSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: validation.error.flatten() },
      { status: 400 },
    );
  }

  const { email, input } = validation.data;
  const calculationInput: TaxCalculationInput = {
    ...input,
    payPeriod: input.payPeriod as PayPeriod,
    taxYear: input.taxYear as TaxYear,
    incomeSources: input.incomeSources?.map((source, index) => ({
      id: source.id ?? `email-source-${index}`,
      label: source.label,
      type: source.type,
      amount: source.amount,
      period: source.period as PayPeriod,
    })),
  };
  const results = calculateTax(calculationInput);
  const taxYearLabel = formatTaxYearForEmail(input.taxYear);

  try {
    const { error } = await resend.emails.send({
      from: 'PayeTax <noreply@payetax.co.uk>',
      to: email,
      subject: `Your UK Tax Calculation - ${formatCurrency(results.netPay.annually)} take-home`,
      html: generateEmailHtml(results, taxYearLabel),
      text: generateEmailText(results, taxYearLabel),
    });

    if (error) {
      console.error('[send-results] Resend error:', formatErrorForLog(error));
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[send-results] Error:', formatErrorForLog(error));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
