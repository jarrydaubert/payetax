// src/app/api/send-director-results/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { checkRateLimit } from '@/lib/rateLimit';
import { isValidRequestOrigin } from '@/lib/security/origin';
import { formatCurrency } from '@/lib/utils';
import {
  type DirectorStrategy,
  SendDirectorResultsRequestSchema,
} from '@/lib/validation/emailValidation';

export const runtime = 'nodejs';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const MAX_BODY_SIZE = 50 * 1024; // 50KB

// TODO: Apply escapeHtml to all string interpolations in email templates
// (strategy.name, taxYear, generatedDate, etc.) for full HTML injection protection.
// Currently relying on Zod schema constraints (strategy.name max 100 chars,
// taxYear regex validated) but should add escaping for defense in depth.

/** Get client identifier - always returns a key */
function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0];
    if (firstIp) return firstIp.trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  // Fallback: hash of user-agent
  const ua = request.headers.get('user-agent') || 'unknown';
  return `ua:${Buffer.from(ua).toString('base64').slice(0, 16)}`;
}

// Tax year constants for 2025-26
const TAX_THRESHOLDS = {
  personalAllowance: 12570,
  basicRateLimit: 50270,
  higherRateLimit: 125140,
  niPrimaryThreshold: 12570,
  niUpperLimit: 50270,
  dividendAllowance: 500,
  corpTaxSmallProfitsRate: 19,
  corpTaxMainRate: 25,
  corpTaxSmallProfitsLimit: 50000,
  corpTaxUpperLimit: 250000,
  employerNiThreshold: 5000,
  employerNiRate: 15,
};

interface AllStrategies {
  allSalary: DirectorStrategy;
  optimalMix: DirectorStrategy;
  allDividends: DirectorStrategy;
}

/** Generate plain text email for deliverability */
function generateDirectorEmailText(
  grossProfit: number,
  strategies: AllStrategies,
  recommended: 'allSalary' | 'optimalMix' | 'allDividends',
  savingsVsAllSalary: number,
  taxYear?: string,
): string {
  const strategy = strategies[recommended];
  const year = taxYear || '2025-26';

  return `
DIRECTOR TAX STRATEGY REPORT - PayeTax
${year}
${'='.repeat(50)}

EXECUTIVE SUMMARY
-----------------
Gross Profit: ${formatCurrency(grossProfit)}
Recommended Strategy: ${strategy.name}
Take-Home Pay: ${formatCurrency(strategy.takeHome)}
Effective Tax Rate: ${strategy.effectiveRate.toFixed(1)}%
Savings vs All-Salary: ${formatCurrency(savingsVsAllSalary)}

RECOMMENDED EXTRACTION
----------------------
Salary: ${formatCurrency(strategy.salary)} (${formatCurrency(strategy.salary / 12)}/mo)
Dividends: ${formatCurrency(strategy.dividends)} (${formatCurrency(strategy.dividends / 12)}/mo)
${strategy.pension > 0 ? `Pension: ${formatCurrency(strategy.pension)} (${formatCurrency(strategy.pension / 12)}/mo)` : ''}

TAXES
-----
Corporation Tax: ${formatCurrency(strategy.corporationTax)}
Employer NI: ${formatCurrency(strategy.employerNI)}
Income Tax: ${formatCurrency(strategy.incomeTax)}
Employee NI: ${formatCurrency(strategy.employeeNI)}
Dividend Tax: ${formatCurrency(strategy.dividendTax)}
${strategy.studentLoan > 0 ? `Student Loan: ${formatCurrency(strategy.studentLoan)}` : ''}
Total Tax: ${formatCurrency(strategy.corporationTax + strategy.employerNI + strategy.totalPersonalTax)}

MONTHLY SET-ASIDE POTS
----------------------
Company Tax Pot: ${formatCurrency((strategy.corporationTax + strategy.employerNI) / 12)}/mo
Personal Tax Pot: ${formatCurrency(strategy.totalPersonalTax / 12)}/mo (for Self Assessment)

KEY DATES
---------
Self Assessment Deadline: 31 January 2027
Corporation Tax Due: 9 months + 1 day after year-end
PAYE/NI Payments: 22nd of each month (electronic)

${'='.repeat(50)}
This calculation uses official HMRC rates for ${year}.
For professional tax advice, please consult a qualified accountant.

Recalculate: https://payetax.co.uk/tools/director-guide
`.trim();
}

function generateDirectorEmailHtml(
  grossProfit: number,
  strategies: AllStrategies,
  recommended: 'allSalary' | 'optimalMix' | 'allDividends',
  savingsVsAllSalary: number,
  taxYear?: string,
): string {
  const strategy = strategies[recommended];
  const generatedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate retained profits
  const totalExtracted = strategy.salary + strategy.dividends + strategy.pension;
  const retainedInCompany =
    grossProfit - totalExtracted - strategy.corporationTax - strategy.employerNI;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Director Tax Strategy Report - PayeTax</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 700px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="margin: 0; font-size: 24px; color: #020617;">
        <span style="color: #020617;">paye</span><span style="background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">tax</span>
      </h1>
      <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">Director Tax Strategy Report${taxYear ? ` - ${taxYear}` : ''}</p>
      <p style="margin: 4px 0 0; color: #94a3b8; font-size: 12px;">Generated: ${generatedDate}</p>
    </div>

    <!-- Executive Summary Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 24px;">
      <h2 style="margin: 0 0 16px; font-size: 18px; color: #020617;">Executive Summary</h2>
      
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 24px;">
        <div style="flex: 1; min-width: 140px; text-align: center; padding: 16px; background: #f0fdf4; border-radius: 12px;">
          <p style="margin: 0 0 4px; color: #64748b; font-size: 12px; text-transform: uppercase;">Take-Home Pay</p>
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #10b981;">${formatCurrency(strategy.takeHome)}</p>
        </div>
        <div style="flex: 1; min-width: 140px; text-align: center; padding: 16px; background: #f8fafc; border-radius: 12px;">
          <p style="margin: 0 0 4px; color: #64748b; font-size: 12px; text-transform: uppercase;">Effective Rate</p>
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #020617;">${strategy.effectiveRate.toFixed(1)}%</p>
        </div>
        <div style="flex: 1; min-width: 140px; text-align: center; padding: 16px; background: #ecfeff; border-radius: 12px;">
          <p style="margin: 0 0 4px; color: #64748b; font-size: 12px; text-transform: uppercase;">Savings vs All-Salary</p>
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #06b6d4;">${formatCurrency(savingsVsAllSalary)}</p>
        </div>
      </div>

    </div>

    <!-- Strategy Comparison Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 24px;">
      <h2 style="margin: 0 0 16px; font-size: 18px; color: #020617;">Strategy Comparison</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #e2e8f0;">
            <th style="text-align: left; padding: 12px 8px; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase;">Strategy</th>
            <th style="text-align: right; padding: 12px 8px; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase;">Salary</th>
            <th style="text-align: right; padding: 12px 8px; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase;">Dividends</th>
            <th style="text-align: right; padding: 12px 8px; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase;">Total Tax</th>
            <th style="text-align: right; padding: 12px 8px; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase;">Take-Home</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #f1f5f9;${recommended === 'allSalary' ? ' background: #f0fdf4;' : ''}">
            <td style="padding: 12px 8px; color: #020617; font-weight: 500;">${strategies.allSalary.name}${recommended === 'allSalary' ? ' ✓' : ''}</td>
            <td style="padding: 12px 8px; text-align: right; color: #64748b;">${formatCurrency(strategies.allSalary.salary)}</td>
            <td style="padding: 12px 8px; text-align: right; color: #64748b;">${formatCurrency(strategies.allSalary.dividends)}</td>
            <td style="padding: 12px 8px; text-align: right; color: #ef4444;">${formatCurrency(strategies.allSalary.corporationTax + strategies.allSalary.employerNI + strategies.allSalary.totalPersonalTax)}</td>
            <td style="padding: 12px 8px; text-align: right; color: #020617; font-weight: 600;">${formatCurrency(strategies.allSalary.takeHome)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;${recommended === 'optimalMix' ? ' background: #f0fdf4;' : ''}">
            <td style="padding: 12px 8px; color: #020617; font-weight: 500;">${strategies.optimalMix.name}${recommended === 'optimalMix' ? ' ✓' : ''}</td>
            <td style="padding: 12px 8px; text-align: right; color: #64748b;">${formatCurrency(strategies.optimalMix.salary)}</td>
            <td style="padding: 12px 8px; text-align: right; color: #64748b;">${formatCurrency(strategies.optimalMix.dividends)}</td>
            <td style="padding: 12px 8px; text-align: right; color: #ef4444;">${formatCurrency(strategies.optimalMix.corporationTax + strategies.optimalMix.employerNI + strategies.optimalMix.totalPersonalTax)}</td>
            <td style="padding: 12px 8px; text-align: right; color: #020617; font-weight: 600;">${formatCurrency(strategies.optimalMix.takeHome)}</td>
          </tr>
          <tr style="${recommended === 'allDividends' ? 'background: #f0fdf4;' : ''}">
            <td style="padding: 12px 8px; color: #020617; font-weight: 500;">${strategies.allDividends.name}${recommended === 'allDividends' ? ' ✓' : ''}</td>
            <td style="padding: 12px 8px; text-align: right; color: #64748b;">${formatCurrency(strategies.allDividends.salary)}</td>
            <td style="padding: 12px 8px; text-align: right; color: #64748b;">${formatCurrency(strategies.allDividends.dividends)}</td>
            <td style="padding: 12px 8px; text-align: right; color: #ef4444;">${formatCurrency(strategies.allDividends.corporationTax + strategies.allDividends.employerNI + strategies.allDividends.totalPersonalTax)}</td>
            <td style="padding: 12px 8px; text-align: right; color: #020617; font-weight: 600;">${formatCurrency(strategies.allDividends.takeHome)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detailed Breakdown Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 24px;">
      <h2 style="margin: 0 0 16px; font-size: 18px; color: #020617;">Detailed Breakdown - ${strategy.name}</h2>
      
      <!-- Income Section -->
      <h3 style="margin: 0 0 12px; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Income</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; color: #020617;">Gross Profit</td>
          <td style="padding: 12px 0; text-align: right; color: #020617; font-weight: 600;">${formatCurrency(grossProfit)}</td>
          <td style="padding: 12px 0; text-align: right; color: #64748b; font-size: 13px;">${formatCurrency(grossProfit / 12)}/mo</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; color: #020617;">Director's Salary</td>
          <td style="padding: 12px 0; text-align: right; color: #020617;">${formatCurrency(strategy.salary)}</td>
          <td style="padding: 12px 0; text-align: right; color: #64748b; font-size: 13px;">${formatCurrency(strategy.salary / 12)}/mo</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; color: #020617;">Dividends</td>
          <td style="padding: 12px 0; text-align: right; color: #020617;">${formatCurrency(strategy.dividends)}</td>
          <td style="padding: 12px 0; text-align: right; color: #64748b; font-size: 13px;">${formatCurrency(strategy.dividends / 12)}/mo</td>
        </tr>
        ${
          strategy.pension > 0
            ? `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; color: #f59e0b;">Employer Pension Contribution</td>
          <td style="padding: 12px 0; text-align: right; color: #f59e0b;">${formatCurrency(strategy.pension)}</td>
          <td style="padding: 12px 0; text-align: right; color: #64748b; font-size: 13px;">${formatCurrency(strategy.pension / 12)}/mo</td>
        </tr>
        `
            : ''
        }
        ${
          strategy.companyCarBIK > 0
            ? `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; color: #8b5cf6;">Company Car (Benefit in Kind)</td>
          <td style="padding: 12px 0; text-align: right; color: #8b5cf6;">${formatCurrency(strategy.companyCarBIK)}</td>
          <td style="padding: 12px 0; text-align: right; color: #64748b; font-size: 13px;">${formatCurrency(strategy.companyCarBIK / 12)}/mo</td>
        </tr>
        `
            : ''
        }
      </table>

      <!-- Company Taxes Section -->
      <h3 style="margin: 0 0 12px; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Company Taxes</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr style="border-bottom: 1px solid #f1f5f9; background: #fef2f2;">
          <td style="padding: 12px 8px; color: #ef4444;">Corporation Tax</td>
          <td style="padding: 12px 8px; text-align: right; color: #ef4444;">-${formatCurrency(strategy.corporationTax)}</td>
          <td style="padding: 12px 8px; text-align: right; color: #64748b; font-size: 13px;">-${formatCurrency(strategy.corporationTax / 12)}/mo</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; color: #ef4444;">Employer's National Insurance</td>
          <td style="padding: 12px 0; text-align: right; color: #ef4444;">-${formatCurrency(strategy.employerNI)}</td>
          <td style="padding: 12px 0; text-align: right; color: #64748b; font-size: 13px;">-${formatCurrency(strategy.employerNI / 12)}/mo</td>
        </tr>
        <tr style="background: #fef2f2;">
          <td style="padding: 12px 8px; color: #dc2626; font-weight: 600;">Total Company Tax</td>
          <td style="padding: 12px 8px; text-align: right; color: #dc2626; font-weight: 600;">-${formatCurrency(strategy.corporationTax + strategy.employerNI)}</td>
          <td style="padding: 12px 8px; text-align: right; color: #64748b; font-size: 13px;">-${formatCurrency((strategy.corporationTax + strategy.employerNI) / 12)}/mo</td>
        </tr>
      </table>

      <!-- Personal Taxes Section -->
      <h3 style="margin: 0 0 12px; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Personal Taxes (Self Assessment)</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; color: #ef4444;">Income Tax</td>
          <td style="padding: 12px 0; text-align: right; color: #ef4444;">-${formatCurrency(strategy.incomeTax)}</td>
          <td style="padding: 12px 0; text-align: right; color: #64748b; font-size: 13px;">-${formatCurrency(strategy.incomeTax / 12)}/mo</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; color: #ef4444;">Employee National Insurance</td>
          <td style="padding: 12px 0; text-align: right; color: #ef4444;">-${formatCurrency(strategy.employeeNI)}</td>
          <td style="padding: 12px 0; text-align: right; color: #64748b; font-size: 13px;">-${formatCurrency(strategy.employeeNI / 12)}/mo</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; color: #ef4444;">Dividend Tax</td>
          <td style="padding: 12px 0; text-align: right; color: #ef4444;">-${formatCurrency(strategy.dividendTax)}</td>
          <td style="padding: 12px 0; text-align: right; color: #64748b; font-size: 13px;">-${formatCurrency(strategy.dividendTax / 12)}/mo</td>
        </tr>
        ${
          strategy.studentLoan > 0
            ? `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; color: #8b5cf6;">Student Loan Repayment</td>
          <td style="padding: 12px 0; text-align: right; color: #8b5cf6;">-${formatCurrency(strategy.studentLoan)}</td>
          <td style="padding: 12px 0; text-align: right; color: #64748b; font-size: 13px;">-${formatCurrency(strategy.studentLoan / 12)}/mo</td>
        </tr>
        `
            : ''
        }
        <tr style="background: #fef2f2;">
          <td style="padding: 12px 8px; color: #dc2626; font-weight: 600;">Total Personal Tax</td>
          <td style="padding: 12px 8px; text-align: right; color: #dc2626; font-weight: 600;">-${formatCurrency(strategy.totalPersonalTax)}</td>
          <td style="padding: 12px 8px; text-align: right; color: #64748b; font-size: 13px;">-${formatCurrency(strategy.totalPersonalTax / 12)}/mo</td>
        </tr>
      </table>

      <!-- Net Result -->
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #f0fdf4;">
          <td style="padding: 16px 12px; color: #10b981; font-weight: 700; font-size: 16px;">Your Take-Home Pay</td>
          <td style="padding: 16px 12px; text-align: right; color: #10b981; font-weight: 700; font-size: 20px;">${formatCurrency(strategy.takeHome)}</td>
          <td style="padding: 16px 12px; text-align: right; color: #10b981; font-weight: 600;">${formatCurrency(strategy.takeHome / 12)}/mo</td>
        </tr>
        ${
          retainedInCompany > 0
            ? `
        <tr style="background: #f8fafc;">
          <td style="padding: 12px; color: #64748b;">Retained in Company</td>
          <td style="padding: 12px; text-align: right; color: #020617; font-weight: 500;">${formatCurrency(retainedInCompany)}</td>
          <td style="padding: 12px; text-align: right; color: #64748b;">${formatCurrency(retainedInCompany / 12)}/mo</td>
        </tr>
        `
            : ''
        }
        <tr style="background: #f8fafc;">
          <td style="padding: 12px; color: #64748b;">Total Company Cost</td>
          <td style="padding: 12px; text-align: right; color: #020617; font-weight: 500;">${formatCurrency(strategy.companyCost)}</td>
          <td style="padding: 12px; text-align: right; color: #64748b;">${formatCurrency(strategy.companyCost / 12)}/mo</td>
        </tr>
      </table>
    </div>

    <!-- Monthly Set-Aside Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 24px;">
      <h2 style="margin: 0 0 16px; font-size: 18px; color: #020617;">Monthly Set-Aside Pots</h2>
      <p style="margin: 0 0 16px; color: #64748b; font-size: 14px;">Amounts to set aside each month to cover tax liabilities:</p>
      
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px; padding: 16px; background: #fef2f2; border-radius: 12px; border: 1px solid #fecaca;">
          <p style="margin: 0 0 4px; color: #991b1b; font-size: 12px; text-transform: uppercase; font-weight: 600;">Company Tax Pot</p>
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #dc2626;">${formatCurrency((strategy.corporationTax + strategy.employerNI) / 12)}<span style="font-size: 14px; font-weight: 400;">/mo</span></p>
          <p style="margin: 8px 0 0; color: #991b1b; font-size: 12px;">Corporation Tax + Employer NI</p>
        </div>
        <div style="flex: 1; min-width: 200px; padding: 16px; background: #faf5ff; border-radius: 12px; border: 1px solid #e9d5ff;">
          <p style="margin: 0 0 4px; color: #6b21a8; font-size: 12px; text-transform: uppercase; font-weight: 600;">Personal Tax Pot</p>
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #7c3aed;">${formatCurrency(strategy.totalPersonalTax / 12)}<span style="font-size: 14px; font-weight: 400;">/mo</span></p>
          <p style="margin: 8px 0 0; color: #6b21a8; font-size: 12px;">For Self Assessment (31 Jan)</p>
        </div>
      </div>
    </div>

    <!-- Key Dates Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 24px;">
      <h2 style="margin: 0 0 16px; font-size: 18px; color: #020617;">Key Tax Dates</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; color: #020617; font-weight: 500;">Self Assessment Deadline</td>
          <td style="padding: 12px 0; text-align: right; color: #dc2626; font-weight: 600;">31 January 2027</td>
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
    <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 24px;">
      <h2 style="margin: 0 0 24px; font-size: 18px; color: #020617;">Tax Rates & Thresholds Used (${taxYear || '2025-26'})</h2>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr style="background: #f8fafc;">
          <td colspan="2" style="padding: 10px 12px; font-weight: 600; color: #475569; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Income Tax</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #64748b;">Personal Allowance</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">${formatCurrency(TAX_THRESHOLDS.personalAllowance)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #64748b;">Basic Rate (20%)</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">to ${formatCurrency(TAX_THRESHOLDS.basicRateLimit)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #64748b;">Higher Rate (40%)</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">to ${formatCurrency(TAX_THRESHOLDS.higherRateLimit)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 12px; color: #64748b;">Additional Rate (45%)</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">above ${formatCurrency(TAX_THRESHOLDS.higherRateLimit)}</td>
        </tr>
        
        <tr style="background: #f8fafc;">
          <td colspan="2" style="padding: 10px 12px; font-weight: 600; color: #475569; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">National Insurance</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #64748b;">Primary Threshold</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">${formatCurrency(TAX_THRESHOLDS.niPrimaryThreshold)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #64748b;">Upper Earnings Limit</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">${formatCurrency(TAX_THRESHOLDS.niUpperLimit)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #64748b;">Employer NI Threshold</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">${formatCurrency(TAX_THRESHOLDS.employerNiThreshold)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 12px; color: #64748b;">Employer NI Rate</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">${TAX_THRESHOLDS.employerNiRate}%</td>
        </tr>
        
        <tr style="background: #f8fafc;">
          <td colspan="2" style="padding: 10px 12px; font-weight: 600; color: #475569; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Dividends & Corporation Tax</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #64748b;">Dividend Allowance</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">${formatCurrency(TAX_THRESHOLDS.dividendAllowance)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #64748b;">Small Profits Rate</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">${TAX_THRESHOLDS.corpTaxSmallProfitsRate}%</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #64748b;">Main CT Rate</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">${TAX_THRESHOLDS.corpTaxMainRate}%</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; color: #64748b;">Small Profits Limit</td>
          <td style="padding: 8px 12px; text-align: right; color: #020617;">${formatCurrency(TAX_THRESHOLDS.corpTaxSmallProfitsLimit)}</td>
        </tr>
      </table>
    </div>

    <!-- Assumptions Card -->
    <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 12px; font-size: 14px; color: #64748b; text-transform: uppercase;">Assumptions</h3>
      <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 13px; line-height: 1.8;">
        <li>Director has no other taxable income</li>
        <li>Company is sole-director owned (no associated companies)</li>
        <li>Standard NI Category A applies</li>
        <li>Director is UK resident and domiciled</li>
        <li>No Marriage Allowance transfer</li>
        <li>Dividends paid from distributable reserves</li>
      </ul>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin-top: 32px;">
      <a href="https://payetax.co.uk/tools/director-guide" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Recalculate with Different Inputs
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; color: #94a3b8; font-size: 12px;">
        This calculation uses official HMRC rates${taxYear ? ` for ${taxYear}` : ''}. Calculations are estimates only.
        <br><strong>For professional tax advice, please consult a qualified accountant.</strong>
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
  // CSRF protection check (origin/referer allowlist).
  if (!isValidRequestOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }

  // Rate limiting: 5 emails per minute per client
  const clientId = getClientIdentifier(request);
  if (!checkRateLimit(clientId, { max: 5, window: 60000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  if (!resend) {
    console.error('[send-director-results] Resend not configured');
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

  const validationResult = SendDirectorResultsRequestSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validationResult.error.flatten() },
      { status: 400 },
    );
  }

  const { email, results, taxYear } = validationResult.data;
  const recommendedStrategy = results.strategies[results.recommended];

  try {
    const html = generateDirectorEmailHtml(
      results.grossProfit,
      results.strategies,
      results.recommended,
      results.savingsVsAllSalary,
      taxYear,
    );

    const text = generateDirectorEmailText(
      results.grossProfit,
      results.strategies,
      results.recommended,
      results.savingsVsAllSalary,
      taxYear,
    );

    const { error } = await resend.emails.send({
      from: 'PayeTax <noreply@payetax.co.uk>',
      to: email,
      subject: `Director Tax Strategy Report - ${formatCurrency(recommendedStrategy.takeHome)} Take-Home`,
      html,
      text,
    });

    if (error) {
      console.error('[send-director-results] Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[send-director-results] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
