// src/app/api/send-director-results/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';
import { formatCurrency } from '@/lib/utils';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const DirectorResultsSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  results: z.object({
    grossProfit: z.number(),
    strategy: z.object({
      name: z.string(),
      salary: z.number(),
      dividends: z.number(),
      pension: z.number(),
      companyCarBIK: z.number(),
      employerNI: z.number(),
      employeeNI: z.number(),
      incomeTax: z.number(),
      corporationTax: z.number(),
      dividendTax: z.number(),
      studentLoan: z.number(),
      totalPersonalTax: z.number(),
      companyCost: z.number(),
      takeHome: z.number(),
      effectiveRate: z.number(),
    }),
  }),
  taxYear: z.string().optional(),
});

function generateDirectorEmailHtml(
  grossProfit: number,
  strategy: z.infer<typeof DirectorResultsSchema>['results']['strategy'],
  taxYear?: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Director Tax Strategy - PayeTax</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="margin: 0; font-size: 24px; color: #020617;">
        <span style="color: #020617;">paye</span><span style="background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">tax</span>
      </h1>
      <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">Director Tax Calculator${taxYear ? ` - ${taxYear}` : ''}</p>
    </div>

    <!-- Main Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <!-- Summary -->
      <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #e2e8f0;">
        <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">Your Take-Home Pay</p>
        <p style="margin: 0; font-size: 36px; font-weight: 700; color: #10b981;">${formatCurrency(strategy.takeHome)}</p>
        <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">per year (${strategy.effectiveRate.toFixed(1)}% effective tax rate)</p>
        <p style="margin: 8px 0 0; color: #020617; font-size: 14px; font-weight: 500;">${strategy.name}</p>
      </div>

      <!-- Breakdown Table -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
        <thead>
          <tr style="border-bottom: 2px solid #e2e8f0;">
            <th style="text-align: left; padding: 12px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Item</th>
            <th style="text-align: right; padding: 12px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Annual</th>
            <th style="text-align: right; padding: 12px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Monthly</th>
          </tr>
        </thead>
        <tbody>
          <!-- Income Section -->
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 16px 0; color: #020617; font-weight: 500;">Gross Profit</td>
            <td style="padding: 16px 0; text-align: right; color: #020617;">${formatCurrency(grossProfit)}</td>
            <td style="padding: 16px 0; text-align: right; color: #64748b;">${formatCurrency(grossProfit / 12)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 16px 0; color: #020617; font-weight: 500;">Salary</td>
            <td style="padding: 16px 0; text-align: right; color: #020617;">${formatCurrency(strategy.salary)}</td>
            <td style="padding: 16px 0; text-align: right; color: #64748b;">${formatCurrency(strategy.salary / 12)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 16px 0; color: #020617; font-weight: 500;">Dividends</td>
            <td style="padding: 16px 0; text-align: right; color: #020617;">${formatCurrency(strategy.dividends)}</td>
            <td style="padding: 16px 0; text-align: right; color: #64748b;">${formatCurrency(strategy.dividends / 12)}</td>
          </tr>
          ${strategy.pension > 0 ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 16px 0; color: #f59e0b;">Employer Pension</td>
            <td style="padding: 16px 0; text-align: right; color: #f59e0b;">${formatCurrency(strategy.pension)}</td>
            <td style="padding: 16px 0; text-align: right; color: #64748b;">${formatCurrency(strategy.pension / 12)}</td>
          </tr>
          ` : ''}
          ${strategy.companyCarBIK > 0 ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 16px 0; color: #8b5cf6;">Company Car (BIK)</td>
            <td style="padding: 16px 0; text-align: right; color: #8b5cf6;">${formatCurrency(strategy.companyCarBIK)}</td>
            <td style="padding: 16px 0; text-align: right; color: #64748b;">${formatCurrency(strategy.companyCarBIK / 12)}</td>
          </tr>
          ` : ''}
          
          <!-- Company Taxes -->
          <tr style="border-bottom: 1px solid #f1f5f9; background: #fef2f2;">
            <td style="padding: 16px 0; padding-left: 8px; color: #ef4444;">Corporation Tax</td>
            <td style="padding: 16px 0; text-align: right; color: #ef4444;">-${formatCurrency(strategy.corporationTax)}</td>
            <td style="padding: 16px 0; text-align: right; color: #64748b;">-${formatCurrency(strategy.corporationTax / 12)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 16px 0; color: #ef4444;">Employer NI</td>
            <td style="padding: 16px 0; text-align: right; color: #ef4444;">-${formatCurrency(strategy.employerNI)}</td>
            <td style="padding: 16px 0; text-align: right; color: #64748b;">-${formatCurrency(strategy.employerNI / 12)}</td>
          </tr>
          
          <!-- Personal Taxes -->
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 16px 0; color: #ef4444;">Income Tax</td>
            <td style="padding: 16px 0; text-align: right; color: #ef4444;">-${formatCurrency(strategy.incomeTax)}</td>
            <td style="padding: 16px 0; text-align: right; color: #64748b;">-${formatCurrency(strategy.incomeTax / 12)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 16px 0; color: #ef4444;">Employee NI</td>
            <td style="padding: 16px 0; text-align: right; color: #ef4444;">-${formatCurrency(strategy.employeeNI)}</td>
            <td style="padding: 16px 0; text-align: right; color: #64748b;">-${formatCurrency(strategy.employeeNI / 12)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 16px 0; color: #ef4444;">Dividend Tax</td>
            <td style="padding: 16px 0; text-align: right; color: #ef4444;">-${formatCurrency(strategy.dividendTax)}</td>
            <td style="padding: 16px 0; text-align: right; color: #64748b;">-${formatCurrency(strategy.dividendTax / 12)}</td>
          </tr>
          ${strategy.studentLoan > 0 ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 16px 0; color: #8b5cf6;">Student Loan</td>
            <td style="padding: 16px 0; text-align: right; color: #8b5cf6;">-${formatCurrency(strategy.studentLoan)}</td>
            <td style="padding: 16px 0; text-align: right; color: #64748b;">-${formatCurrency(strategy.studentLoan / 12)}</td>
          </tr>
          ` : ''}
          
          <!-- Take-Home -->
          <tr style="background: #f0fdf4;">
            <td style="padding: 16px 0; padding-left: 8px; color: #10b981; font-weight: 700;">Take-Home Pay</td>
            <td style="padding: 16px 0; text-align: right; color: #10b981; font-weight: 700;">${formatCurrency(strategy.takeHome)}</td>
            <td style="padding: 16px 0; text-align: right; color: #10b981; font-weight: 600;">${formatCurrency(strategy.takeHome / 12)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Two Pots Summary -->
      <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 8px;">
        <p style="margin: 0 0 12px; font-weight: 600; color: #020617; font-size: 14px;">Monthly Set-Aside</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Company Tax Pot (CT + Employer NI)</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 500; font-size: 13px;">${formatCurrency((strategy.corporationTax + strategy.employerNI) / 12)}/mo</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Personal Tax Pot (for Self Assessment)</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 500; font-size: 13px;">${formatCurrency(strategy.totalPersonalTax / 12)}/mo</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin-top: 32px;">
      <a href="https://payetax.co.uk/tools/director-calculator" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Calculate Again
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; color: #94a3b8; font-size: 12px;">
        This calculation uses official HMRC rates${taxYear ? ` for ${taxYear}` : ''}.
        <br>For professional tax advice, consult a qualified accountant.
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
`.trim();
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 emails per minute per IP
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ipAddress, { max: 5, window: 60000 })) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Check for Resend API key
    if (!resend) {
      console.error('[send-director-results] Resend not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = DirectorResultsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { email, results, taxYear } = validationResult.data;

    // Generate email HTML
    const html = generateDirectorEmailHtml(results.grossProfit, results.strategy, taxYear);

    // Send email
    const { error } = await resend.emails.send({
      from: 'PayeTax <results@payetax.uk>',
      to: email,
      subject: `Your Director Tax Strategy - ${results.strategy.name}`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send director results error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
