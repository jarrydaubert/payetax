// src/components/molecules/DirectorGuide/results/PersonalBox.tsx
'use client';

import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card';
import { cn } from '@/lib/utils';
import type { DirectorResult } from '@/lib/validation/directorValidation';

interface PersonalBoxProps {
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
 * Personal position box showing monthly take-home and tax savings target
 *
 * Helps users understand what they can actually spend vs save.
 */
export function PersonalBox({ result, className }: PersonalBoxProps) {
  const monthlyPay = formatCurrency(result.averageMonthlyPay);
  const monthlySalary = formatCurrency(result.monthlySalary);
  const monthlyTaxSavings = formatCurrency(result.personalTaxMonthly);

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <User className='size-5 text-primary' aria-hidden='true' />
          You
        </CardTitle>
        <p className='text-muted-foreground text-sm'>You work for your company and it pays you.</p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <div className='flex items-baseline justify-between'>
            <span className='font-medium text-muted-foreground text-sm'>Average Monthly Pay</span>
            <span className='font-semibold text-foreground text-xl'>~{monthlyPay}</span>
          </div>
          <p className='mt-1 text-muted-foreground text-xs'>
            Salary ({monthlySalary}/mo) goes monthly via payroll. The rest comes as dividends
            occasionally.
          </p>
        </div>

        <div className='space-y-2 border-border/50 border-t pt-3'>
          <div className='flex items-baseline justify-between'>
            <span className='font-medium text-muted-foreground text-sm'>Your Tax Savings</span>
            <span className='font-semibold text-foreground text-xl'>{monthlyTaxSavings}/mo</span>
          </div>
          <p className='text-muted-foreground text-xs'>
            Put this in a personal savings account for your tax bill (due 31 Jan).
          </p>
        </div>

        {result.includesPOA && (
          <p className='rounded-md bg-amber-500/10 p-2 text-amber-600 text-xs dark:text-amber-400'>
            Includes 50% payment on account — HMRC asks for this when your tax bill exceeds £1,000.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
