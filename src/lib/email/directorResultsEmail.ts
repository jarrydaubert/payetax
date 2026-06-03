// src/lib/email/directorResultsEmail.ts
/**
 * Director results email templates (pure functions)
 *
 * Extracted from the API route so we can test:
 * - HTML escaping (injection prevention)
 * - Threshold sourcing from `src/constants/taxRates.ts` (no drift)
 */

import type { TaxYear } from '@/constants/taxRates';
import { CT_RATES, TAX_RATES } from '@/constants/taxRates';
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
  if (!taxYear) return '2025-2026';

  // Accept "2025-26" and "2025-2026".
  const short = /^(\d{4})-(\d{2})$/;
  const long = /^(\d{4})-(\d{4})$/;

  const mShort = taxYear.match(short);
  if (mShort) {
    const start = Number(mShort[1]);
    const end2 = Number(mShort[2]);
    const century = Math.floor(start / 100) * 100;
    const end = century + end2;
    const normalized = `${start}-${end}` as TaxYear;
    return TAX_RATES[normalized] ? normalized : '2025-2026';
  }

  const mLong = taxYear.match(long);
  if (mLong) {
    const normalized = `${mLong[1]}-${mLong[2]}` as TaxYear;
    return TAX_RATES[normalized] ? normalized : '2025-2026';
  }

  return '2025-2026';
}

function getSelfAssessmentDeadlineLabel(taxYear?: string): string {
  const normalized = normalizeTaxYear(taxYear);
  const startYear = Number.parseInt(normalized.slice(0, 4), 10);
  // For tax year 2025-26 (ending Apr 2026), the online filing/payment deadline is 31 Jan 2027.
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

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Director Strategy Report - PayeTax</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent; font-size: 1px; line-height: 1px;">
    Director strategy summary: ${safeStrategyName} with estimated take-home ${formatCurrency(strategy.takeHome)} per year.
    ${'&nbsp;'.repeat(40)}
  </div>

  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="margin: 0; font-size: 24px;">
        <span style="color: #020617;">paye</span><span style="color: #0d9488;">tax</span>
      </h1>
      <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">Director Strategy Report${safeTaxYear ? ` - ${safeTaxYear}` : ''}</p>
      <p style="margin: 4px 0 0; color: #94a3b8; font-size: 12px;">Generated: ${escapeHtml(safeGeneratedDate)}</p>
    </div>

    <!-- Executive Summary -->
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
      <h2 style="margin: 0 0 8px; font-size: 20px; color: #020617;">Scenario Summary</h2>
      <p style="margin: 0 0 24px; font-size: 28px; font-weight: 700; color: #10b981;">${safeStrategyName}</p>

      <table role="presentation" style="width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed;">
        <tr>
          <td style="width: 50%; vertical-align: top; padding-right: 8px;">
            <div style="height: 120px; box-sizing: border-box; padding: 16px; background: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0;">
              <p style="margin: 0 0 6px; color: #166534; font-size: 12px; text-transform: uppercase; font-weight: 600;">Monthly Take-Home</p>
              <p style="margin: 0; font-size: 24px; font-weight: 700; color: #10b981; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1, 'lnum' 1;">${formatCurrency(strategy.takeHome / 12)}<span style="font-size: 14px; font-weight: 400;">/mo</span></p>
              <p style="margin: 10px 0 0; color: #166534; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Annual: ${formatCurrency(strategy.takeHome)}</p>
            </div>
          </td>
          <td style="width: 50%; vertical-align: top; padding-left: 8px;">
            <div style="height: 120px; box-sizing: border-box; padding: 16px; background: #fef3c7; border-radius: 12px; border: 1px solid #fde68a;">
              <p style="margin: 0 0 6px; color: #92400e; font-size: 12px; text-transform: uppercase; font-weight: 600;">Savings vs All Salary</p>
              <p style="margin: 0; font-size: 24px; font-weight: 700; color: #f59e0b; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1, 'lnum' 1;">${formatCurrency(savingsVsAllSalary)}<span style="font-size: 14px; font-weight: 400;">/year</span></p>
              <p style="margin: 10px 0 0; color: #92400e; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Tax saved annually</p>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Company Overview Card -->
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
      <h2 style="margin: 0 0 16px; font-size: 18px; color: #020617;">Company Overview</h2>
      <p style="margin: 0; color: #64748b; font-size: 14px;">Gross profit available for extraction: <strong style="color: #020617;">${formatCurrency(grossProfit)}</strong></p>
    </div>

    <!-- Detailed Breakdown Card -->
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
      <h2 style="margin: 0 0 16px; font-size: 18px; color: #020617;">Detailed Breakdown - ${safeStrategyName}</h2>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; color: #64748b;">Salary</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #020617;">${formatCurrency(strategy.salary)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; color: #64748b;">Dividends</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #020617;">${formatCurrency(strategy.dividends)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; color: #64748b;">Employer Pension</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #020617;">${formatCurrency(strategy.pension)}</td>
        </tr>
        <tr style="border-bottom: 2px solid #e2e8f0;">
          <td style="padding: 12px 0; color: #64748b;">Total Company Cost</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #dc2626;">${formatCurrency(strategy.companyCost)}</td>
        </tr>
      </table>

      <table role="presentation" style="width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; margin-top: 24px;">
        <tr>
          <td style="width: 50%; vertical-align: top; padding-right: 8px;">
            <div style="height: 120px; box-sizing: border-box; padding: 16px; background: #eff6ff; border-radius: 12px; border: 1px solid #bfdbfe;">
              <p style="margin: 0 0 6px; color: #1e40af; font-size: 12px; text-transform: uppercase; font-weight: 600;">Company Tax Pot</p>
              <p style="margin: 0; font-size: 24px; font-weight: 700; color: #2563eb; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1, 'lnum' 1;">${formatCurrency((strategy.corporationTax + strategy.employerNI) / 12)}<span style="font-size: 14px; font-weight: 400;">/mo</span></p>
              <p style="margin: 10px 0 0; color: #1e40af; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Corporation Tax + Employer NI</p>
            </div>
          </td>
          <td style="width: 50%; vertical-align: top; padding-left: 8px;">
            <div style="height: 120px; box-sizing: border-box; padding: 16px; background: #faf5ff; border-radius: 12px; border: 1px solid #e9d5ff;">
              <p style="margin: 0 0 6px; color: #6b21a8; font-size: 12px; text-transform: uppercase; font-weight: 600;">Personal Tax Pot</p>
              <p style="margin: 0; font-size: 24px; font-weight: 700; color: #7c3aed; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1, 'lnum' 1;">${formatCurrency(strategy.totalPersonalTax / 12)}<span style="font-size: 14px; font-weight: 400;">/mo</span></p>
              <p style="margin: 10px 0 0; color: #6b21a8; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Self Assessment due ${escapeHtml(saDeadline)}</p>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Key Dates Card -->
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
      <h2 style="margin: 0 0 16px; font-size: 18px; color: #020617;">Key Tax Dates</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; color: #020617; font-weight: 500;">Self Assessment Deadline</td>
          <td style="padding: 12px 0; text-align: right; color: #dc2626; font-weight: 600;">${escapeHtml(saDeadline)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; color: #020617; font-weight: 500;">Corporation Tax Due</td>
          <td style="padding: 12px 0; text-align: right; color: #64748b;">9 months + 1 day after year-end</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; color: #020617; font-weight: 500;">Company Tax Return</td>
          <td style="padding: 12px 0; text-align: right; color: #64748b;">12 months after year-end</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #020617; font-weight: 500;">PAYE/NI Payments</td>
          <td style="padding: 12px 0; text-align: right; color: #64748b;">22nd of each month (electronic)</td>
        </tr>
      </table>
    </div>

    <!-- Tax Thresholds Card -->
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
      <h2 style="margin: 0 0 24px; font-size: 18px; color: #020617;">Tax Rates & Thresholds Used (${safeTaxYear || '2025-26'})</h2>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr style="background: #f8fafc;">
          <td colspan="2" style="padding: 10px 12px; font-weight: 600; color: #475569; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Income Tax</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #64748b;">Personal Allowance</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">${formatCurrency(thresholds.personalAllowance)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #64748b;">Basic Rate (20%)</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">to ${formatCurrency(thresholds.basicRateLimit)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #64748b;">Higher Rate (40%)</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">to ${formatCurrency(thresholds.higherRateLimit)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 12px; color: #64748b;">Additional Rate (45%)</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">above ${formatCurrency(thresholds.higherRateLimit)}</td>
        </tr>
        
        <tr style="background: #f8fafc;">
          <td colspan="2" style="padding: 10px 12px; font-weight: 600; color: #475569; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">National Insurance</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #64748b;">Primary Threshold</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">${formatCurrency(thresholds.niPrimaryThreshold)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #64748b;">Upper Earnings Limit</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">${formatCurrency(thresholds.niUpperLimit)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #64748b;">Employer NI Threshold</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">${formatCurrency(thresholds.employerNiThreshold)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 12px; color: #64748b;">Employer NI Rate</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">${thresholds.employerNiRate}%</td>
        </tr>
        
        <tr style="background: #f8fafc;">
          <td colspan="2" style="padding: 10px 12px; font-weight: 600; color: #475569; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Dividends & Corporation Tax</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #64748b;">Dividend Allowance</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">${formatCurrency(thresholds.dividendAllowance)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #64748b;">Small Profits Rate</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">${thresholds.corpTaxSmallProfitsRate}%</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #64748b;">Main CT Rate</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">${thresholds.corpTaxMainRate}%</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; color: #64748b;">Small Profits Limit</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">${formatCurrency(thresholds.corpTaxSmallProfitsLimit)}</td>
        </tr>
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin-top: 32px;">
      <a href="${BASE_URL}/tools/director-guide?utm_source=director_results_email&utm_medium=email&utm_campaign=director_recalculate" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); color: #052e2b; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
        Recalculate with Different Inputs
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; color: #94a3b8; font-size: 12px;">
        For illustrative purposes only. Not financial or tax advice.
        <br><strong>Consult a qualified accountant for advice specific to your situation.</strong>
        <br>Based on HMRC rates${safeTaxYear ? ` for ${safeTaxYear}` : ''} which may change.
      </p>
      <p style="margin: 16px 0 0; color: #94a3b8; font-size: 12px;">
        <a href="${BASE_URL}" style="color: #06b6d4; text-decoration: none;">payetax.co.uk</a>
        &nbsp;•&nbsp;
        <a href="${BASE_URL}/privacy" style="color: #94a3b8; text-decoration: none;">Privacy</a>
      </p>
    </div>
  </div>
</body>
</html>
`.trim();
}
