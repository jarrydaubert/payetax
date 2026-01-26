// src/components/molecules/DirectorGuide/warnings/SurvivalMode.tsx
'use client';

import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/atoms/ui/card';
import { cn } from '@/lib/utils';
import type { SurvivalResult } from '@/lib/validation/directorValidation';

interface SurvivalModeProps {
  result: SurvivalResult;
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
 * Survival mode warning for low/no profit scenarios
 *
 * Shows when profit <= £12,570 (personal allowance threshold).
 */
export function SurvivalMode({ result, className }: SurvivalModeProps) {
  const profit = formatCurrency(result.grossProfit);
  const isZeroOrNegative = result.grossProfit <= 0;

  return (
    <Card className={cn('border-amber-500/50 bg-amber-500/5', className)}>
      <CardContent className='pt-6'>
        <div className='flex items-start gap-3'>
          <AlertTriangle className='mt-0.5 size-5 shrink-0 text-amber-500' aria-hidden='true' />
          <div>
            <h2 className='font-semibold text-foreground'>
              {isZeroOrNegative
                ? "Your company hasn't made profit yet"
                : "Your company hasn't made enough profit yet"}
            </h2>

            <p className='mt-2 text-muted-foreground text-sm'>
              Based on your numbers, profit is ~{profit}.
            </p>

            {isZeroOrNegative ? (
              <p className='mt-2 text-muted-foreground text-sm'>
                Dividends aren&apos;t possible without profit. If you take money, it&apos;s a loan
                you&apos;ll owe back to the company.
              </p>
            ) : (
              <p className='mt-2 text-muted-foreground text-sm'>
                This isn&apos;t enough to pay yourself a full salary + dividends in the most
                tax-efficient way.
              </p>
            )}

            <div className='mt-4'>
              <p className='font-medium text-foreground text-sm'>Your options:</p>
              <ol className='mt-2 space-y-1 text-muted-foreground text-sm'>
                {!isZeroOrNegative && (
                  <li>
                    1. Take a smaller salary (up to {formatCurrency(result.maxPossibleSalary)})
                  </li>
                )}
                <li>
                  {isZeroOrNegative ? '1' : '2'}. Wait until you have more profit before taking
                  dividends
                </li>
                <li>
                  {isZeroOrNegative ? '2' : '3'}. If you need money now, talk to an accountant about
                  Director&apos;s Loans (there are tax implications)
                </li>
              </ol>
            </div>

            <p className='mt-4 text-muted-foreground text-sm'>
              This is normal in year 1. Focus on growing the business.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
