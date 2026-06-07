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
  <style>
    @media only screen and (max-width: 640px) {
      .email-shell { padding: 24px 12px !important; }
      .email-card { padding: 24px 18px !important; }
      .email-title { font-size: 34px !important; line-height: 1.02 !important; }
      .money-xl { font-size: 34px !important; }
      .mobile-hide { display: none !important; }
      .mobile-block { display: block !important; width: 100% !important; }
      .mobile-right { text-align: right !important; }
      .cta { display: block !important; width: auto !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f5ed; color: #07111f; font-family: Arial, Helvetica, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent; font-size: 1px; line-height: 1px;">
    Your take-home pay: ${formatCurrency(results.netPay.annually)} per year (${effectiveRate}% effective tax rate).
    ${'&nbsp;'.repeat(40)}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; background-color: #f8f5ed;">
    <tr>
      <td class="email-shell" align="center" style="padding: 40px 18px;">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 640px; border-collapse: collapse;">
          <tr>
            <td style="padding: 0 0 24px; border-bottom: 1px solid #cec6b7;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="font-family: Georgia, 'Times New Roman', serif; font-size: 30px; font-weight: 700; line-height: 1;">
                    <span style="color: #07111f;">paye</span><span style="color: #123a66;">tax</span>
                  </td>
                  <td align="right" style="color: #465468; font-size: 13px; line-height: 1.4;">
                    UK PAYE Calculator
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="email-card" style="padding: 32px; border: 1px solid #cec6b7; background-color: #fffdf7;">
              <div style="margin-bottom: 18px;">
                <span style="display: inline-block; border: 1px solid #123a66; background-color: #f2eee4; color: #123a66; font-family: Menlo, Consolas, monospace; font-size: 11px; font-weight: 700; letter-spacing: 2px; padding: 7px 10px; text-transform: uppercase;">Calculation Ready</span>
                <span style="display: inline-block; margin-left: 10px; color: #536174; font-size: 13px;">Tax year ${safeTaxYear}</span>
              </div>

              <h2 class="email-title" style="margin: 0 0 12px; color: #07111f; font-family: Georgia, 'Times New Roman', serif; font-size: 42px; font-weight: 700; line-height: 1.02;">Your tax results are in</h2>
              <p style="margin: 0 0 24px; color: #465468; font-size: 16px; line-height: 1.55;">Below is your annual and monthly PAYE breakdown using HMRC rates${safeTaxYear ? ` for ${safeTaxYear}` : ''}.</p>

              <div style="border: 1px solid #123a66; border-left: 4px solid #123a66; background-color: #f2eee4; padding: 20px 22px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; color: #123a66; font-family: Menlo, Consolas, monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Take-home pay</p>
                <p class="money-xl" style="margin: 0; color: #2f6f4e; font-family: Menlo, Consolas, monospace; font-size: 42px; font-weight: 700; line-height: 1.08; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1, 'lnum' 1;">${formatCurrency(results.netPay.annually)}</p>
                <p style="margin: 10px 0 0; color: #465468; font-size: 14px; line-height: 1.5; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1, 'lnum' 1;">${formatCurrency(results.netPay.monthly)}/month. ${effectiveRate}% effective tax rate.</p>
              </div>

              <table style="width: 100%; border-collapse: collapse; color: #07111f; font-size: 14px; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1, 'lnum' 1;">
        <thead>
          <tr style="border-bottom: 2px solid #cec6b7;">
            <th style="text-align: left; padding: 10px 0; color: #536174; font-family: Menlo, Consolas, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 1.8px;">Item</th>
            <th style="text-align: right; padding: 10px 0; color: #536174; font-family: Menlo, Consolas, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 1.8px;">Annual</th>
            <th class="mobile-hide" style="text-align: right; padding: 10px 0; color: #536174; font-family: Menlo, Consolas, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 1.8px;">Monthly</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e1dbce;">
            <td style="padding: 14px 0; color: #07111f; font-weight: 700;">Gross salary</td>
            <td style="padding: 14px 0; text-align: right; color: #07111f; font-family: Menlo, Consolas, monospace; font-weight: 700;">${formatCurrency(results.grossSalary.annually)}</td>
            <td class="mobile-hide" style="padding: 14px 0; text-align: right; color: #465468; font-family: Menlo, Consolas, monospace;">${formatCurrency(results.grossSalary.monthly)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e1dbce;">
            <td style="padding: 14px 0; color: #a6453c;">Income tax</td>
            <td style="padding: 14px 0; text-align: right; color: #a6453c; font-family: Menlo, Consolas, monospace;">-${formatCurrency(results.incomeTax.annually)}</td>
            <td class="mobile-hide" style="padding: 14px 0; text-align: right; color: #465468; font-family: Menlo, Consolas, monospace;">-${formatCurrency(results.incomeTax.monthly)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e1dbce;">
            <td style="padding: 14px 0; color: #a6453c;">National Insurance</td>
            <td style="padding: 14px 0; text-align: right; color: #a6453c; font-family: Menlo, Consolas, monospace;">-${formatCurrency(results.nationalInsurance.annually)}</td>
            <td class="mobile-hide" style="padding: 14px 0; text-align: right; color: #465468; font-family: Menlo, Consolas, monospace;">-${formatCurrency(results.nationalInsurance.monthly)}</td>
          </tr>
          ${
            results.pensionContribution.annually > 0
              ? `
          <tr style="border-bottom: 1px solid #e1dbce;">
            <td style="padding: 14px 0; color: #8a641f;">Pension</td>
            <td style="padding: 14px 0; text-align: right; color: #8a641f; font-family: Menlo, Consolas, monospace;">-${formatCurrency(results.pensionContribution.annually)}</td>
            <td class="mobile-hide" style="padding: 14px 0; text-align: right; color: #465468; font-family: Menlo, Consolas, monospace;">-${formatCurrency(results.pensionContribution.monthly)}</td>
          </tr>
          `
              : ''
          }
          ${
            results.studentLoan.annually > 0
              ? `
          <tr style="border-bottom: 1px solid #e1dbce;">
            <td style="padding: 14px 0; color: #123a66;">Student loan</td>
            <td style="padding: 14px 0; text-align: right; color: #123a66; font-family: Menlo, Consolas, monospace;">-${formatCurrency(results.studentLoan.annually)}</td>
            <td class="mobile-hide" style="padding: 14px 0; text-align: right; color: #465468; font-family: Menlo, Consolas, monospace;">-${formatCurrency(results.studentLoan.monthly)}</td>
          </tr>
          `
              : ''
          }
          <tr style="background: #eef4ed; border-top: 2px solid #cec6b7;">
            <td style="padding: 14px 10px; color: #2f6f4e; font-weight: 700;">Take-home pay</td>
            <td style="padding: 14px 10px; text-align: right; color: #2f6f4e; font-family: Menlo, Consolas, monospace; font-weight: 700;">${formatCurrency(results.netPay.annually)}</td>
            <td class="mobile-hide" style="padding: 14px 10px; text-align: right; color: #2f6f4e; font-family: Menlo, Consolas, monospace; font-weight: 700;">${formatCurrency(results.netPay.monthly)}</td>
          </tr>
        </tbody>
      </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 28px 0 0;">
              <a class="cta" href="${BASE_URL}?utm_source=results_email&utm_medium=email&utm_campaign=results_followup" style="display: inline-block; border: 1px solid #123a66; background-color: #123a66; color: #fffdf7; padding: 14px 24px; text-decoration: none; font-size: 14px; font-weight: 700; line-height: 1.2;">
                Recalculate with new inputs
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding: 28px 0 0; border-top: 1px solid #cec6b7; text-align: center;">
              <p style="margin: 0; color: #536174; font-size: 12px; line-height: 1.7;">
                For illustrative purposes only. Not financial or tax advice.
                <br>Consult a qualified accountant for advice specific to your situation.
                <br>Based on HMRC rates${safeTaxYear ? ` for ${safeTaxYear}` : ''} which may change.
              </p>
              <p style="margin: 14px 0 0; color: #7d8795; font-size: 12px;">
                <a href="${BASE_URL}" style="color: #123a66; text-decoration: none;">payetax.co.uk</a>
                &nbsp;&middot;&nbsp;
                <a href="${BASE_URL}/privacy" style="color: #536174; text-decoration: none;">Privacy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
