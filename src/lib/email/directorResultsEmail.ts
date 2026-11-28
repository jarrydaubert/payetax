// src/lib/email/directorResultsEmail.ts
/**
 * Director results email templates (pure functions)
 *
 * Extracted from the API route so we can test:
 * - HTML escaping (injection prevention)
 * - Financial summary and reserve presentation
 */

import {
  DIRECTOR_BUDGET_NOTE,
  type DirectorFinancialPresentation,
} from '@/lib/directorFinancialPresentation';
import { resolveTaxYear } from '@/lib/tax';
import { formatCurrency } from '@/lib/utils';

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://payetax.co.uk';

const PAYMENTS_ON_ACCOUNT_GUIDANCE =
  'https://www.gov.uk/understand-self-assessment-bill/payments-on-account';
const COMPANY_PAYMENT_GUIDANCE = 'https://www.gov.uk/pay-corporation-tax';
const COMPANY_FILING_GUIDANCE = 'https://www.gov.uk/company-tax-returns';
const PAYMENTS_ON_ACCOUNT_NOTE =
  'Payments on account, if required, are normally due on 31 January and 31 July. Check your HMRC account for what you owe and when.';
const COMPANY_DEADLINES_NOTE =
  'This report does not include company deadlines. Corporation Tax payment and Company Tax Return filing follow the company accounting period. Instalment rules may change when Corporation Tax is due.';

function getSelfAssessmentReminder(taxYear?: string): string {
  const endYear = Number(resolveTaxYear(taxYear).split('-')[1]);
  return `Self Assessment for ${formatTaxYearLabel(taxYear)}: 31 January ${endYear + 1} is the usual deadline to file online and pay any balance due.`;
}

function formatTaxYearLabel(taxYear?: string): string {
  const normalized = resolveTaxYear(taxYear);
  const [start, end] = normalized.split('-');
  return `${start}-${end?.slice(-2) ?? ''}`;
}

interface DirectorEmailArgs {
  strategyName: string;
  financials: DirectorFinancialPresentation;
  savingsVsAllSalary: number;
  taxYear?: string;
}

function describeCompanyShortfall(amount = 0): string {
  return amount > 0
    ? `Available company profit falls short of the Class 1A National Insurance bill by ${formatCurrency(amount)}. The strategy has £0 available for salary or dividends.`
    : '';
}

function describeMinimumSalaryShortfall({
  salary,
  minimumSalaryShortfall = 0,
}: DirectorFinancialPresentation['scenario']): string {
  return minimumSalaryShortfall > 0
    ? `The highest affordable salary is ${formatCurrency(salary)}, which falls ${formatCurrency(minimumSalaryShortfall)} short of your minimum.`
    : '';
}

export function generateDirectorEmailText({
  strategyName,
  financials,
  savingsVsAllSalary,
  taxYear,
}: DirectorEmailArgs): string {
  const {
    scenario: strategy,
    profitAfterBusinessExpenses,
    companyBalance,
    companyBalanceLabel,
  } = financials;
  const year = formatTaxYearLabel(taxYear);
  const companyShortfall = describeCompanyShortfall(strategy.companyShortfall);
  const minimumSalaryShortfall = describeMinimumSalaryShortfall(strategy);

  return `
DIRECTOR TAX STRATEGY REPORT - PayeTax
${year}
${'='.repeat(50)}

EXECUTIVE SUMMARY
-----------------
Scenario Summary: ${strategyName}
Monthly Take-Home: ${formatCurrency(strategy.takeHome / 12)}
Annual Take-Home: ${formatCurrency(strategy.takeHome)}
${companyShortfall ? `\n${companyShortfall}\n` : ''}
${minimumSalaryShortfall ? `\n${minimumSalaryShortfall}\n` : ''}

SAVINGS vs All Salary: ${formatCurrency(savingsVsAllSalary)}

COMPANY OVERVIEW
---------------
Profit after business expenses: ${formatCurrency(profitAfterBusinessExpenses)}

COMPARISON BREAKDOWN
--------------------
Salary: ${formatCurrency(strategy.salary)}
Dividends: ${formatCurrency(strategy.dividends)}
Pension: ${formatCurrency(strategy.pension)}
Corporation Tax: ${formatCurrency(strategy.corporationTax)}
Employer NI: ${formatCurrency(strategy.employerNI)}
${companyBalanceLabel}: ${formatCurrency(companyBalance)}

ESTIMATED PERSONAL DEDUCTIONS (Annual)
--------------------------------------
Income Tax: ${formatCurrency(strategy.incomeTax)}
Employee NI: ${formatCurrency(strategy.employeeNI)}
Dividend Tax: ${formatCurrency(strategy.dividendTax)}
Student loan from this scenario: ${formatCurrency(strategy.studentLoan)}
Personal deductions: ${formatCurrency(financials.personalDeductions)}

PROJECTED BUDGETS (Annual)
--------------------------
Company tax and NI budget: ${formatCurrency(financials.companyTaxBudget)}
Personal tax and loan budget: ${formatCurrency(financials.personalBudget)}
${DIRECTOR_BUDGET_NOTE}

TAX DATE REMINDER
-----------------
${getSelfAssessmentReminder(taxYear)}
${PAYMENTS_ON_ACCOUNT_NOTE}
HMRC payments on account: ${PAYMENTS_ON_ACCOUNT_GUIDANCE}

${COMPANY_DEADLINES_NOTE}
HMRC Corporation Tax payment: ${COMPANY_PAYMENT_GUIDANCE}
HMRC Company Tax Return filing: ${COMPANY_FILING_GUIDANCE}

DISCLAIMERS
----------
For illustrative purposes only.
Not financial or tax advice.
Consult a qualified accountant for advice specific to your situation.
Based on published UK tax rates for ${year}, including Scottish Government rates for Scottish Income Tax.

Recalculate: ${BASE_URL}/tools/director-guide
`.trim();
}

export function generateDirectorEmailHtml({
  strategyName,
  financials,
  savingsVsAllSalary,
  taxYear,
  generatedDate,
}: DirectorEmailArgs & { generatedDate?: string }): string {
  const {
    scenario: strategy,
    profitAfterBusinessExpenses,
    companyBalance,
    companyBalanceLabel,
  } = financials;
  const companyShortfall = describeCompanyShortfall(strategy.companyShortfall);
  const minimumSalaryShortfall = describeMinimumSalaryShortfall(strategy);
  const safeStrategyName = escapeHtml(strategyName);
  const safeTaxYear = escapeHtml(formatTaxYearLabel(taxYear));
  const safeGeneratedDate =
    generatedDate ??
    new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const savingsColour = savingsVsAllSalary >= 0 ? '#2f6f4e' : '#a6453c';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Director Strategy Report - PayeTax</title>
  <style>
    @media only screen and (max-width: 680px) {
      .email-shell { padding: 24px 12px !important; }
      .email-card { padding: 24px 18px !important; }
      .email-title { font-size: 34px !important; line-height: 1.02 !important; }
      .money-xl { font-size: 34px !important; }
      .stack { display: block !important; width: 100% !important; padding: 0 0 12px 0 !important; }
      .mobile-hide { display: none !important; }
      .cta { display: block !important; width: auto !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f5ed; color: #07111f; font-family: Arial, Helvetica, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent; font-size: 1px; line-height: 1px;">
    Director strategy summary: ${safeStrategyName} with estimated take-home ${formatCurrency(strategy.takeHome)} per year.
    ${'&nbsp;'.repeat(40)}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; background-color: #f8f5ed;">
    <tr>
      <td class="email-shell" align="center" style="padding: 40px 18px;">
        <table role="presentation" width="680" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 680px; border-collapse: collapse;">
          <tr>
            <td style="padding: 0 0 24px; border-bottom: 1px solid #cec6b7;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="font-family: Georgia, 'Times New Roman', serif; font-size: 30px; font-weight: 700; line-height: 1;">
                    <span style="color: #07111f;">paye</span><span style="color: #123a66;">tax</span>
                  </td>
                  <td align="right" style="color: #465468; font-size: 13px; line-height: 1.4;">
                    Director Strategy Report<br>
                    <span style="color: #7d8795;">Generated ${escapeHtml(safeGeneratedDate)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="email-card" style="padding: 32px; border: 1px solid #cec6b7; background-color: #fffdf7;">
              <div style="margin-bottom: 18px;">
                <span style="display: inline-block; border: 1px solid #123a66; background-color: #f2eee4; color: #123a66; font-family: Menlo, Consolas, monospace; font-size: 11px; font-weight: 700; letter-spacing: 2px; padding: 7px 10px; text-transform: uppercase;">Recommended Strategy</span>
                <span style="display: inline-block; margin-left: 10px; color: #536174; font-size: 13px;">Tax year ${safeTaxYear}</span>
              </div>

              <h2 class="email-title" style="margin: 0 0 10px; color: #07111f; font-family: Georgia, 'Times New Roman', serif; font-size: 42px; font-weight: 700; line-height: 1.02;">${safeStrategyName}</h2>
              <p style="margin: 0 0 24px; color: #465468; font-size: 16px; line-height: 1.55;">Estimated salary and dividend extraction based on the company profit details supplied in Director Intelligence.</p>
              ${companyShortfall ? `<p style="margin: 0 0 24px; color: #a6453c; font-size: 16px; line-height: 1.55;">${escapeHtml(companyShortfall)}</p>` : ''}
              ${minimumSalaryShortfall ? `<p style="margin: 0 0 24px; color: #a6453c; font-size: 16px; line-height: 1.55;">${escapeHtml(minimumSalaryShortfall)}</p>` : ''}

              <div style="border: 1px solid #123a66; border-left: 4px solid #123a66; background-color: #f2eee4; padding: 20px 22px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; color: #123a66; font-family: Menlo, Consolas, monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Annual take-home</p>
                <p class="money-xl" style="margin: 0; color: #123a66; font-family: Menlo, Consolas, monospace; font-size: 42px; font-weight: 700; line-height: 1.08; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1, 'lnum' 1;">${formatCurrency(strategy.takeHome)}</p>
                <p style="margin: 10px 0 0; color: #465468; font-size: 14px; line-height: 1.5; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1, 'lnum' 1;">${formatCurrency(strategy.takeHome / 12)}/month</p>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: separate; border-spacing: 0 12px; table-layout: fixed;">
                <tr>
                  <td class="stack" style="width: 50%; padding-right: 6px; vertical-align: top;">
                    <div style="border: 1px solid #cec6b7; background-color: #f8f5ed; padding: 16px;">
                      <p style="margin: 0 0 6px; color: #536174; font-family: Menlo, Consolas, monospace; font-size: 11px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase;">Profit after business expenses</p>
                      <p style="margin: 0; color: #07111f; font-family: Menlo, Consolas, monospace; font-size: 24px; font-weight: 700; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1, 'lnum' 1;">${formatCurrency(profitAfterBusinessExpenses)}</p>
                    </div>
                  </td>
                  <td class="stack" style="width: 50%; padding-left: 6px; vertical-align: top;">
                    <div style="border: 1px solid #cec6b7; background-color: #f8f5ed; padding: 16px;">
                      <p style="margin: 0 0 6px; color: #536174; font-family: Menlo, Consolas, monospace; font-size: 11px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase;">Vs all salary</p>
                      <p style="margin: 0; color: ${savingsColour}; font-family: Menlo, Consolas, monospace; font-size: 24px; font-weight: 700; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1, 'lnum' 1;">${formatCurrency(savingsVsAllSalary)}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <table style="width: 100%; border-collapse: collapse; color: #07111f; font-size: 14px; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1, 'lnum' 1;">
                <tr style="border-bottom: 2px solid #cec6b7;">
                  <th style="text-align: left; padding: 10px 0; color: #536174; font-family: Menlo, Consolas, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 1.8px;">Estimated company allocation</th>
                  <th style="text-align: right; padding: 10px 0; color: #536174; font-family: Menlo, Consolas, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 1.8px;">Annual</th>
                </tr>
                <tr style="border-bottom: 1px solid #e1dbce;">
                  <td style="padding: 14px 0; color: #07111f; font-weight: 700;">Salary</td>
                  <td style="padding: 14px 0; text-align: right; color: #07111f; font-family: Menlo, Consolas, monospace; font-weight: 700;">${formatCurrency(strategy.salary)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e1dbce;">
                  <td style="padding: 14px 0; color: #07111f; font-weight: 700;">Dividends</td>
                  <td style="padding: 14px 0; text-align: right; color: #07111f; font-family: Menlo, Consolas, monospace; font-weight: 700;">${formatCurrency(strategy.dividends)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e1dbce;">
                  <td style="padding: 14px 0; color: #123a66;">Employer pension</td>
                  <td style="padding: 14px 0; text-align: right; color: #123a66; font-family: Menlo, Consolas, monospace;">${formatCurrency(strategy.pension)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e1dbce;">
                  <td style="padding: 14px 0; color: #a6453c;">Corporation Tax</td>
                  <td style="padding: 14px 0; text-align: right; color: #a6453c; font-family: Menlo, Consolas, monospace;">${formatCurrency(strategy.corporationTax)}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 0; color: #07111f;">Employer NI</td>
                  <td style="padding: 14px 0; text-align: right; font-family: Menlo, Consolas, monospace;">${formatCurrency(strategy.employerNI)}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 0; color: #07111f;">${companyBalanceLabel}</td>
                  <td style="padding: 14px 0; text-align: right; font-family: Menlo, Consolas, monospace;">${formatCurrency(companyBalance)}</td>
                </tr>
                <tr>
                  <th colspan="2" style="text-align: left; padding: 14px 0 8px; color: #536174; font-size: 13px;">Personal cash from this company</th>
                </tr>
                <tr style="border-bottom: 1px solid #e1dbce;">
                  <td style="padding: 14px 0; color: #07111f;">Salary and dividends before deductions</td>
                  <td style="padding: 14px 0; text-align: right; font-family: Menlo, Consolas, monospace;">${formatCurrency(financials.grossPersonalCash)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e1dbce;">
                  <td style="padding: 14px 0; color: #a6453c;">Personal deductions</td>
                  <td style="padding: 14px 0; text-align: right; color: #a6453c; font-family: Menlo, Consolas, monospace;">${formatCurrency(financials.personalDeductions)}</td>
                </tr>
                <tr style="background: #eef4ed; border-top: 2px solid #cec6b7;">
                  <td style="padding: 14px 10px; color: #2f6f4e; font-weight: 700;">Estimated take-home pay</td>
                  <td style="padding: 14px 10px; text-align: right; color: #2f6f4e; font-family: Menlo, Consolas, monospace; font-weight: 700;">${formatCurrency(strategy.takeHome)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="email-card" style="padding: 28px 32px; border-right: 1px solid #cec6b7; border-bottom: 1px solid #cec6b7; border-left: 1px solid #cec6b7; background-color: #fffdf7;">
              <h3 style="margin: 0 0 16px; color: #07111f; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; line-height: 1.1;">Tax dates and projected budgets</h3>
              <p style="margin: 0 0 12px; color: #465468; font-size: 14px; line-height: 1.5;">
                <strong style="color: #07111f;">${escapeHtml(getSelfAssessmentReminder(taxYear))}</strong>
                ${PAYMENTS_ON_ACCOUNT_NOTE}
                <a href="${PAYMENTS_ON_ACCOUNT_GUIDANCE}" style="color: #123a66;">HMRC payments on account</a>
              </p>
              <p style="margin: 0 0 12px; color: #465468; font-size: 14px; line-height: 1.5;">
                ${COMPANY_DEADLINES_NOTE}
                <a href="${COMPANY_PAYMENT_GUIDANCE}" style="color: #123a66;">HMRC Corporation Tax payment</a>
                &middot;
                <a href="${COMPANY_FILING_GUIDANCE}" style="color: #123a66;">HMRC Company Tax Return filing</a>
              </p>
              <table style="width: 100%; border-collapse: collapse; color: #07111f; font-size: 14px;">
                <tr style="border-bottom: 1px solid #e1dbce;">
                  <td style="padding: 12px 0; color: #465468;">Company tax and NI budget</td>
                  <td style="padding: 12px 0; text-align: right; color: #123a66; font-family: Menlo, Consolas, monospace;">${formatCurrency(financials.companyTaxBudget)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #465468;">Personal tax and loan budget</td>
                  <td style="padding: 12px 0; text-align: right; color: #123a66; font-family: Menlo, Consolas, monospace;">${formatCurrency(financials.personalBudget)}</td>
                </tr>
              </table>
              <p style="margin: 12px 0 0; color: #465468; font-size: 14px;">${DIRECTOR_BUDGET_NOTE}</p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 28px 0 0;">
              <a class="cta" href="${BASE_URL}/tools/director-guide?utm_source=director_results_email&utm_medium=email&utm_campaign=director_recalculate" style="display: inline-block; border: 1px solid #123a66; background-color: #123a66; color: #fffdf7; padding: 14px 24px; text-decoration: none; font-size: 14px; font-weight: 700; line-height: 1.2;">
                Recalculate in Director Intelligence
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding: 28px 0 0; border-top: 1px solid #cec6b7; text-align: center;">
              <p style="margin: 0; color: #536174; font-size: 12px; line-height: 1.7;">
                For illustrative purposes only. Not financial or tax advice.
                <br>Consult a qualified accountant for advice specific to your situation.
                <br>Based on published UK tax rates${safeTaxYear ? ` for ${safeTaxYear}` : ''}, including Scottish Government rates for Scottish Income Tax.
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
`.trim();
}
