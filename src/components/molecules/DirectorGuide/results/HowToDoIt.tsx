// src/components/molecules/DirectorGuide/results/HowToDoIt.tsx
'use client';

import { ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card';
import { cn } from '@/lib/utils';
import type { DirectorResult } from '@/lib/validation/directorValidation';

interface HowToDoItProps {
  result: DirectorResult;
  className?: string;
}

/**
 * Formats a number as GBP currency
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
 * Action steps card explaining how to implement the strategy
 *
 * Converts abstract numbers into concrete actions.
 */
export function HowToDoIt({ result, className }: HowToDoItProps) {
  const monthlySalary = formatCurrency(result.monthlySalary);
  const monthlyTaxSavings = formatCurrency(result.personalTaxMonthly);
  const hasDividends = result.dividendsAvailable > 0;
  const isLowProfit = result.salary < 12570;

  const steps = [
    {
      number: 1,
      text: 'Set up payroll (FreeAgent, Xero, or an accountant can help)',
    },
    {
      number: 2,
      text: `Pay yourself ${monthlySalary}/month as salary via payroll`,
      subtext: isLowProfit 
        ? 'This is your full profit after employer NI - no tax on this amount'
        : 'We keep salary at £12,570/year to stay tax-efficient',
    },
    ...(hasDividends ? [{
      number: 3,
      text: 'Take dividends occasionally when you have profit',
    }] : []),
    {
      number: hasDividends ? 4 : 3,
      text: result.personalTaxMonthly > 0
        ? `Move ${monthlyTaxSavings}/mo to a savings account for your tax bill`
        : 'No personal tax to save - your salary is within your Personal Allowance',
    },
  ];

  return (
    <Card className={cn(className)}>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <ClipboardList className='size-5 text-primary' aria-hidden='true' />
          How to Actually Do This
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className='space-y-3'>
          {steps.map((step) => (
            <li key={step.number} className='flex gap-3'>
              <span
                className='flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-sm'
                aria-hidden='true'
              >
                {step.number}
              </span>
              <div className='flex-1'>
                <p className='text-foreground text-sm'>{step.text}</p>
                {step.subtext && (
                  <p className='mt-0.5 text-muted-foreground text-xs'>({step.subtext})</p>
                )}
              </div>
            </li>
          ))}
        </ol>

        {/* Bank transfer references */}
        <div className='mt-4 rounded-md border border-border/50 bg-muted/30 p-3'>
          <p className='font-medium text-foreground text-xs'>Bank transfer references</p>
          <p className='mt-1 text-muted-foreground text-xs'>
            Label your transfers clearly for easier bookkeeping:
          </p>
          <ul className='mt-2 space-y-1 text-muted-foreground text-xs'>
            <li>
              <code className='rounded bg-muted px-1'>SALARY JAN</code> — for monthly salary
            </li>
            {hasDividends && (
              <li>
                <code className='rounded bg-muted px-1'>DIVIDEND</code> — for dividend payments
              </li>
            )}
            <li>
              <code className='rounded bg-muted px-1'>TAX RESERVE</code> — for tax savings transfers
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
