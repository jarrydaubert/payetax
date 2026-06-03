import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { formatCurrency } from '@/lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://payetax.co.uk';

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatTaxYearForEmail(taxYear: string): string {
  const [start, end] = taxYear.split('-');
  return `${start}-${end?.slice(-2) ?? ''}`;
}

export function generatePayeEmailText(results: TaxCalculationResults, taxYear?: string): string {
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

export function generatePayeEmailHtml(results: TaxCalculationResults, taxYear?: string): string {
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
