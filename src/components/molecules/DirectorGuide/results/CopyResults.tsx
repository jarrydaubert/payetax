// src/components/molecules/DirectorGuide/results/CopyResults.tsx
'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/atoms/ui/button';
import { trackResultsCopied } from '@/lib/directorGuideAnalytics';
import { cn } from '@/lib/utils';
import type { DirectorInput, DirectorResult } from '@/lib/validation/directorValidation';

interface CopyResultsProps {
  result: DirectorResult;
  input: DirectorInput;
  className?: string;
}

/**
 * Formats a number as GBP currency for copy text
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generates the copy text for results
 */
function generateCopyText(result: DirectorResult, input: DirectorInput): string {
  const vatNote = input.includesVat ? '(before VAT)' : '(no VAT included)';
  const regionLabel = input.region === 'scotland' ? 'Scotland' : 'England, Wales, or NI';
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const hasDividends = result.dividendsAvailable > 0;
  const isLowProfit = result.salary < 12570;

  // Adjust messaging based on whether dividends are available
  const payDescription = hasDividends
    ? `(${formatCurrency(result.monthlySalary)} salary via payroll + dividends occasionally)`
    : `(${formatCurrency(result.monthlySalary)} salary via payroll - no dividends at this profit level)`;

  const companyTaxDescription =
    result.corporationTax > 0
      ? `(includes Corporation Tax + Employer NI)`
      : `(Employer NI only - no Corp Tax at this profit level)`;

  const salaryNote = isLowProfit
    ? `This is your full profit after employer NI - tax-free since it's within your Personal Allowance`
    : `We keep salary at £12,570/year to stay tax-efficient`;

  const howToDoIt = hasDividends
    ? `1. Set up payroll
2. Pay yourself ${formatCurrency(result.monthlySalary)}/month as salary
3. Take dividends occasionally when you have profit
4. Save ${formatCurrency(result.personalTaxMonthly)}/month for your tax bill`
    : `1. Set up payroll
2. Pay yourself ${formatCurrency(result.monthlySalary)}/month as salary
3. ${result.personalTaxMonthly > 0 ? `Save ${formatCurrency(result.personalTaxMonthly)}/month for your tax bill` : 'No personal tax to save - salary is within Personal Allowance'}`;

  return `How Much Can I Pay Myself? - PayeTax.co.uk
Tax Year: ${result.taxYear}

YOUR INPUTS
Location: ${regionLabel}
Revenue: ${formatCurrency(result.grossRevenue)} ${vatNote}
Expenses: ${formatCurrency(result.expenses)}
Already taken: ${formatCurrency(input.alreadyTaken)}
Profit: ~${formatCurrency(result.grossProfit)}

AVERAGE MONTHLY PAY (TARGET)
Around ${formatCurrency(result.averageMonthlyPay)}/month
${payDescription}

SET ASIDE FOR TAX
Company tax pot: ${formatCurrency(result.companyTaxPot)} ${companyTaxDescription}
Personal tax pot: ${formatCurrency(result.personalTaxMonthly)}/month ${result.personalTaxMonthly > 0 ? '(save for January)' : '(nothing to save)'}

HOW TO DO IT
${howToDoIt}

NOTE: ${salaryNote}

ASSUMPTIONS
• Your company is your only income
• Full-year trading
• No student loan repayments
• ${input.region === 'scotland' ? 'Scottish salary rates, UK dividend rates' : 'UK tax rates'}
• Uses ${result.taxYear} tax rules

⚠️ This is a rough estimate, not advice.
For precision, talk to an accountant.

Generated: ${date} | payetax.co.uk/tools/director-guide`;
}

/**
 * Copy results button with feedback
 */
export function CopyResults({ result, input, className }: CopyResultsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = generateCopyText(result, input);

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      trackResultsCopied();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handleCopy}
      className={cn('gap-2', className)}
      aria-label={copied ? 'Results copied' : 'Copy results'}
    >
      {copied ? (
        <>
          <Check className='size-4' aria-hidden='true' />
          Copied!
        </>
      ) : (
        <>
          <Copy className='size-4' aria-hidden='true' />
          Copy results
        </>
      )}
    </Button>
  );
}
