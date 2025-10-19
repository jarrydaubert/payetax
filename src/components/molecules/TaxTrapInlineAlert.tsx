/**
 * Tax Trap Inline Alert Component
 *
 * Single-line compact alert displayed below the results table when user is in the £100k-£125k tax trap.
 * Shows the scenario they're in and suggests pension optimization with a clear call-to-action.
 *
 * @example
 * ```tsx
 * <TaxTrapInlineAlert
 *   salary={110000}
 *   suggestedPension={10000}
 *   onOptimizeClick={() => handleOptimize()}
 * />
 * ```
 */
'use client';

import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface TaxTrapInlineAlertProps {
  /** Current annual gross salary */
  salary: number;
  /** Suggested pension contribution amount */
  suggestedPension: number;
  /** Callback when user clicks optimize button - receives the suggested pension amount */
  onApplyPension?: (amount: number) => void;
}

/**
 * Compact single-line tax trap alert using shadcn Alert component
 * Highlights the user's situation and provides quick optimization action
 */
export function TaxTrapInlineAlert({
  salary,
  suggestedPension,
  onApplyPension,
}: TaxTrapInlineAlertProps) {
  // Calculate excess over 100k for contextual messaging
  const excessOver100k = salary - 100000;
  const allowanceLost = Math.min(excessOver100k / 2, 12570);

  const handleApplyPension = () => {
    if (onApplyPension) {
      onApplyPension(suggestedPension);
    }
  };

  return (
    <Alert variant='warning' className='border-2'>
      <AlertTriangle className='size-5' />
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex-1'>
          <AlertTitle>Tax Trap Alert</AlertTitle>
          <AlertDescription>
            You're losing{' '}
            <span className='font-bold text-red-600 dark:text-red-400'>
              {formatCurrency(allowanceLost, 0)}
            </span>{' '}
            in personal allowance due to the 60% tax trap (£100k-£125k zone).
            {onApplyPension && (
              <span className='mt-1 block'>
                Add {formatCurrency(suggestedPension, 0)} to your pension to avoid this trap?
              </span>
            )}
          </AlertDescription>
        </div>

        {/* Apply Pension Button */}
        {onApplyPension && (
          <Button
            onClick={handleApplyPension}
            size='sm'
            className='w-full gap-2 whitespace-nowrap bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 sm:w-auto'
          >
            Add {formatCurrency(suggestedPension, 0)} to Pension
            <ArrowRight className='size-4' />
          </Button>
        )}
      </div>
    </Alert>
  );
}
