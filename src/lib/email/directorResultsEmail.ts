// src/lib/email/directorResultsEmail.ts
/**
 * Director results email templates (pure functions)
 *
 * Extracted from the API route so we can test:
 * - HTML escaping (injection prevention)
 * - Threshold sourcing from `src/constants/taxRates.ts` (no drift)
 */

import type { TaxYear } from '@/constants/taxRates';
import { CT_RATES, CURRENT_TAX_YEAR, TAX_RATES } from '@/constants/taxRates';
import { formatCurrency } from '@/lib/utils';
import type { DirectorStrategy } from '@/lib/validation/emailValidation';

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://payetax.co.uk';

function normalizeTaxYear(taxYear?: string): TaxYear {
  if (!taxYear) return CURRENT_TAX_YEAR;

  // Accept "2026-27" and "2026-2027".
  const short = /^(\d{4})-(\d{2})$/;
  const long = /^(\d{4})-(\d{4})$/;

  const mShort = taxYear.match(short);
  if (mShort) {
    const start = Number(mShort[1]);
    const end2 = Number(mShort[2]);
    const century = Math.floor(start / 100) * 100;
    const end = century + end2;
    const normalized = `${start}-${end}` as TaxYear;
    return TAX_RATES[normalized] ? normalized : CURRENT_TAX_YEAR;
  }

  const mLong = taxYear.match(long);
  if (mLong) {
    const normalized = `${mLong[1]}-${mLong[2]}` as TaxYear;
    return TAX_RATES[normalized] ? normalized : CURRENT_TAX_YEAR;
  }

  return CURRENT_TAX_YEAR;
}

function getSelfAssessmentDeadlineLabel(taxYear?: string): string {
  const normalized = normalizeTaxYear(taxYear);
  const startYear = Number.parseInt(normalized.slice(0, 4), 10);
  return `31 January ${startYear + 2}`;
}

function formatTaxYearLabel(taxYear?: string): string {
  const normalized = normalizeTaxYear(taxYear);
  const [start, end] = normalized.split('-');
  return `${start}-${end?.slice(-2) ?? ''}`;
}

export function getDirectorEmailThresholds(taxYear?: string) {
  const year = normalizeTaxYear(taxYear);
  const rates = TAX_RATES[year];

  const personalAllowance = rates.personalAllowance;
  const basicBand = rates.bands[0]?.threshold ?? 0;
  const additionalThreshold = rates.bands[1]?.threshold ?? 0;

  const basicRateLimit = personalAllowance + basicBand;

  const niPrimaryThreshold = rates.nationalInsurance.employee.A.primary.threshold;
  const niUpperLimit = rates.nationalInsurance.employee.A.upper.threshold;
  const employerNiThreshold = rates.nationalInsurance.employer.A.secondary.threshold;
  const employerNiRate = rates.nationalInsurance.employer.A.secondary.rate;

  return {
    taxYear: year,
    personalAllowance,
    basicRateLimit,
    higherRateLimit: additionalThreshold,
    niPrimaryThreshold,
    niUpperLimit,
    employerNiThreshold,
    employerNiRate,
    dividendAllowance: rates.dividendAllowance,
    corpTaxSmallProfitsRate: Math.round(CT_RATES.SMALL_PROFITS_RATE * 100),
    corpTaxMainRate: Math.round(CT_RATES.MAIN_RATE * 100),
    corpTaxSmallProfitsLimit: CT_RATES.SMALL_PROFITS_LIMIT,
    corpTaxUpperLimit: CT_RATES.MAIN_RATE_LIMIT,
  };
}

interface AllStrategies {
  allSalary: DirectorStrategy;
  optimalMix: DirectorStrategy;
  allDividends: DirectorStrategy;
}

export function generateDirectorEmailText(args: {
  grossProfit: number;
  strategies: AllStrategies;
  recommended: 'allSalary' | 'optimalMix' | 'allDividends';
  savingsVsAllSalary: number;
  taxYear?: string;
}): string {
  const { grossProfit, strategies, recommended, savingsVsAllSalary, taxYear } = args;
  const strategy = strategies[recommended];
  const year = formatTaxYearLabel(taxYear);

  return `
DIRECTOR TAX STRATEGY REPORT - PayeTax
${year}
${'='.repeat(50)}

EXECUTIVE SUMMARY
-----------------
Scenario Summary: ${strategy.name}
Monthly Take-Home: ${formatCurrency(strategy.takeHome / 12)}
Annual Take-Home: ${formatCurrency(strategy.takeHome)}
Total Company Cost: ${formatCurrency(strategy.companyCost)}

SAVINGS vs All Salary: ${formatCurrency(savingsVsAllSalary)}

COMPANY OVERVIEW
---------------
Gross Profit Available: ${formatCurrency(grossProfit)}

COMPARISON BREAKDOWN
--------------------
Salary: ${formatCurrency(strategy.salary)}
Dividends: ${formatCurrency(strategy.dividends)}
Pension: ${formatCurrency(strategy.pension)}

TAX BREAKDOWN (Annual)
---------------------
Income Tax: ${formatCurrency(strategy.incomeTax)}
Employee NI: ${formatCurrency(strategy.employeeNI)}
Dividend Tax: ${formatCurrency(strategy.dividendTax)}
Student Loan: ${formatCurrency(strategy.studentLoan)}
Corporation Tax: ${formatCurrency(strategy.corporationTax)}
Employer NI: ${formatCurrency(strategy.employerNI)}

DISCLAIMERS
----------
For illustrative purposes only.
Not financial or tax advice.
Consult a qualified accountant for advice specific to your situation.
Based on HMRC rates for ${year} which may change.

Recalculate: ${BASE_URL}/tools/director-guide
`.trim();
}

export function generateDirectorEmailHtml(args: {
  grossProfit: number;
  strategies: AllStrategies;
  recommended: 'allSalary' | 'optimalMix' | 'allDividends';
  savingsVsAllSalary: number;
  taxYear?: string;
  generatedDate?: string;
}): string {
  const { grossProfit, strategies, recommended, savingsVsAllSalary, taxYear, generatedDate } = args;

  const strategy = strategies[recommended];
  const safeStrategyName = escapeHtml(strategy.name);
  const safeTaxYear = escapeHtml(formatTaxYearLabel(taxYear));
  const safeGeneratedDate =
    generatedDate ??
    new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const thresholds = getDirectorEmailThresholds(taxYear);
  const saDeadline = getSelfAssessmentDeadlineLabel(taxYear);
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

              <div style="border: 1px solid #123a66; border-left: 4px solid #123a66; background-color: #f2eee4; padding: 20px 22px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; color: #123a66; font-family: Menlo, Consolas, monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Annual take-home</p>
                <p class="money-xl" style="margin: 0; color: #123a66; font-family: Menlo, Consolas, monospace; font-size: 42px; font-weight: 700; line-height: 1.08; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1, 'lnum' 1;">${formatCurrency(strategy.takeHome)}</p>
                <p style="margin: 10px 0 0; color: #465468; font-size: 14px; line-height: 1.5; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1, 'lnum' 1;">${formatCurrency(strategy.takeHome / 12)}/month. ${strategy.effectiveRate.toFixed(1)}% effective rate.</p>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: separate; border-spacing: 0 12px; table-layout: fixed;">
                <tr>
                  <td class="stack" style="width: 50%; padding-right: 6px; vertical-align: top;">
                    <div style="border: 1px solid #cec6b7; background-color: #f8f5ed; padding: 16px;">
                      <p style="margin: 0 0 6px; color: #536174; font-family: Menlo, Consolas, monospace; font-size: 11px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase;">Gross profit</p>
                      <p style="margin: 0; color: #07111f; font-family: Menlo, Consolas, monospace; font-size: 24px; font-weight: 700; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1, 'lnum' 1;">${formatCurrency(grossProfit)}</p>
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
                  <th style="text-align: left; padding: 10px 0; color: #536174; font-family: Menlo, Consolas, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 1.8px;">Strategy line</th>
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
                <tr style="border-bottom: 1px solid #e1dbce;">
                  <td style="padding: 14px 0; color: #a6453c;">Personal tax</td>
                  <td style="padding: 14px 0; text-align: right; color: #a6453c; font-family: Menlo, Consolas, monospace;">${formatCurrency(strategy.totalPersonalTax)}</td>
                </tr>
                <tr style="background: #eef4ed; border-top: 2px solid #cec6b7;">
                  <td style="padding: 14px 10px; color: #2f6f4e; font-weight: 700;">Take-home pay</td>
                  <td style="padding: 14px 10px; text-align: right; color: #2f6f4e; font-family: Menlo, Consolas, monospace; font-weight: 700;">${formatCurrency(strategy.takeHome)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="email-card" style="padding: 28px 32px; border-right: 1px solid #cec6b7; border-bottom: 1px solid #cec6b7; border-left: 1px solid #cec6b7; background-color: #fffdf7;">
              <h3 style="margin: 0 0 16px; color: #07111f; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; line-height: 1.1;">Tax dates and pots</h3>
              <table style="width: 100%; border-collapse: collapse; color: #07111f; font-size: 14px;">
                <tr style="border-bottom: 1px solid #e1dbce;">
                  <td style="padding: 12px 0; color: #07111f; font-weight: 700;">Self Assessment deadline</td>
                  <td style="padding: 12px 0; text-align: right; color: #a6453c; font-weight: 700;">${escapeHtml(saDeadline)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e1dbce;">
                  <td style="padding: 12px 0; color: #465468;">Company tax pot</td>
                  <td style="padding: 12px 0; text-align: right; color: #123a66; font-family: Menlo, Consolas, monospace;">${formatCurrency(strategy.corporationTax + strategy.employerNI)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #465468;">Personal tax pot</td>
                  <td style="padding: 12px 0; text-align: right; color: #123a66; font-family: Menlo, Consolas, monospace;">${formatCurrency(strategy.totalPersonalTax)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="email-card" style="padding: 28px 32px; border-right: 1px solid #cec6b7; border-bottom: 1px solid #cec6b7; border-left: 1px solid #cec6b7; background-color: #fffdf7;">
              <h3 style="margin: 0 0 16px; color: #07111f; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; line-height: 1.1;">Rates used (${safeTaxYear})</h3>
              <table style="width: 100%; border-collapse: collapse; color: #07111f; font-size: 13px; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1, 'lnum' 1;">
                <tr style="background-color: #f2eee4;">
                  <td colspan="2" style="padding: 10px 12px; color: #536174; font-family: Menlo, Consolas, monospace; font-size: 11px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase;">Income Tax</td>
                </tr>
                <tr style="border-bottom: 1px solid #e1dbce;">
                  <td style="padding: 9px 12px; color: #465468;">Personal Allowance</td>
                  <td style="padding: 9px 12px; text-align: right; font-family: Menlo, Consolas, monospace;">${formatCurrency(thresholds.personalAllowance)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e1dbce;">
                  <td style="padding: 9px 12px; color: #465468;">Basic Rate band</td>
                  <td style="padding: 9px 12px; text-align: right; font-family: Menlo, Consolas, monospace;">to ${formatCurrency(thresholds.basicRateLimit)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e1dbce;">
                  <td style="padding: 9px 12px; color: #465468;">Higher Rate band</td>
                  <td style="padding: 9px 12px; text-align: right; font-family: Menlo, Consolas, monospace;">to ${formatCurrency(thresholds.higherRateLimit)}</td>
                </tr>
                <tr style="background-color: #f2eee4;">
                  <td colspan="2" style="padding: 10px 12px; color: #536174; font-family: Menlo, Consolas, monospace; font-size: 11px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase;">Dividends and Corporation Tax</td>
                </tr>
                <tr style="border-bottom: 1px solid #e1dbce;">
                  <td style="padding: 9px 12px; color: #465468;">Dividend Allowance</td>
                  <td style="padding: 9px 12px; text-align: right; font-family: Menlo, Consolas, monospace;">${formatCurrency(thresholds.dividendAllowance)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e1dbce;">
                  <td style="padding: 9px 12px; color: #465468;">Small Profits Rate</td>
                  <td style="padding: 9px 12px; text-align: right; font-family: Menlo, Consolas, monospace;">${thresholds.corpTaxSmallProfitsRate}%</td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; color: #465468;">Main CT Rate</td>
                  <td style="padding: 9px 12px; text-align: right; font-family: Menlo, Consolas, monospace;">${thresholds.corpTaxMainRate}%</td>
                </tr>
              </table>
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
`.trim();
}
