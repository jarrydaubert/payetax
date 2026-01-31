/**
 * Tax Trap Inline Alert Component
 *
 * Single-line compact alert displayed below the results table when user is in the £100k-£125k tax trap.
 * Shows the scenario they're in and suggests pension optimization with a clear call-to-action.
 * Can be dismissed by user - preference is saved to localStorage.
 *
 * Uses design tokens: SIZE_5 for alert icon, SIZE_4 for button icons
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

import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ICON_SIZES, SPACING } from '@/constants/designTokens';
import { TAX_RATES, TAX_YEARS, type TaxYear } from '@/constants/taxRates';
import { cn, formatCurrency } from '@/lib/utils';

interface TaxTrapInlineAlertProps {
  /** Current annual gross salary */
  salary: number;
  /** Suggested pension contribution amount */
  suggestedPension: number;
  /** Callback when user clicks optimize button - receives the suggested pension amount */
  onApplyPension?: (amount: number) => void;
  /** Tax year to use for rates and thresholds (defaults to latest available tax year) */
  taxYear?: TaxYear;
}

/**
 * Compact single-line tax trap alert using shadcn Alert component
 * Highlights the user's situation and provides quick optimization action
 * Dismissible - preference saved to localStorage
 */
export function TaxTrapInlineAlert({
  salary,
  suggestedPension,
  onApplyPension,
  taxYear = TAX_YEARS[0],
}: TaxTrapInlineAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('taxTrapAlertDismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch (error) {
      // localStorage might not be available (SSR, private browsing)
      console.warn('[TaxTrapInlineAlert] localStorage unavailable:', error);
    }
  }, []);

  // Get tax rates for the specified tax year
  const effectiveTaxYear = taxYear ?? '2025-2026';
  const taxRates = TAX_RATES[effectiveTaxYear];
  if (!taxRates) return null;
  const paReductionThreshold = taxRates.personalAllowanceReductionThreshold; // £100,000
  const personalAllowance = taxRates.personalAllowance; // £12,570

  // Calculate excess over £100k for contextual messaging
  const excessOver100k = salary - paReductionThreshold;
  const allowanceLost = Math.min(excessOver100k / 2, personalAllowance);

  const handleApplyPension = () => {
    if (onApplyPension) {
      onApplyPension(suggestedPension);
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem('taxTrapAlertDismissed', 'true');
      setIsDismissed(true);
    } catch (error) {
      console.warn('[TaxTrapInlineAlert] Failed to save dismissal:', error);
      setIsDismissed(true); // Still dismiss in UI even if localStorage fails
    }
  };

  // Don't render if dismissed
  if (isDismissed) {
    return null;
  }

  return (
    <Alert variant='warning' className='relative border-2'>
      <AlertTriangle className={ICON_SIZES.SIZE_5} aria-hidden='true' />

      {/* Close button */}
      <button
        type='button'
        onClick={handleDismiss}
        className={cn(
          'absolute top-3 right-3 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          SPACING.P_2,
        )}
        aria-label='Dismiss tax trap alert'
      >
        <X className={ICON_SIZES.SIZE_4} aria-hidden='true' />
      </button>

      <div
        className={cn(
          'flex flex-col pr-8 sm:flex-row sm:items-center sm:justify-between',
          SPACING.GAP_3,
        )}
      >
        <div className='flex-1'>
          <AlertTitle>Tax Trap Alert</AlertTitle>
          <AlertDescription>
            You're losing{' '}
            <span className='font-bold text-destructive'>{formatCurrency(allowanceLost, 0)}</span>{' '}
            in personal allowance due to the 60% tax trap (£100k-£125k zone).
            {onApplyPension && (
              <span className={cn('block', SPACING.MT_1)}>
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
            className={cn(
              'w-full whitespace-nowrap bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 sm:w-auto',
              SPACING.GAP_2,
            )}
          >
            Add {formatCurrency(suggestedPension, 0)} to Pension
            <ArrowRight className={ICON_SIZES.SIZE_4} aria-hidden='true' />
          </Button>
        )}
      </div>
    </Alert>
  );
}
