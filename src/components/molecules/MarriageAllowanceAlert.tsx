/**
 * Marriage Allowance Alert Component
 *
 * Displayed when user qualifies for Marriage Allowance but doesn't have it in their tax code.
 * Shows below results table when eligible: partner earns < £12,570 AND user is basic rate taxpayer.
 *
 * Uses design tokens: SIZE_5 for alert icon, SIZE_4 for button icon
 *
 * @example
 * ```tsx
 * <MarriageAllowanceAlert
 *   userSalary={35000}
 *   partnerSalary={8000}
 *   hasMarriageCode={false}
 * />
 * ```
 */
'use client';

import { ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { CURRENT_TAX_YEAR, type TaxYear } from '@/constants/taxRates';
import { calculateMarriageAllowanceNetSaving } from '@/lib/tax/marriageAllowance';
import { cn, formatCurrency } from '@/lib/utils';

interface MarriageAllowanceAlertProps {
  /** Current annual gross salary */
  userSalary: number;
  /** Partner's annual gross salary */
  partnerSalary: number;
  /** Whether user already has M code in tax code */
  hasMarriageCode: boolean;
  /** Whether Scottish income tax rates apply */
  isScottish?: boolean;
  /** Tax year to use for rates and thresholds (defaults to latest available tax year) */
  taxYear?: TaxYear;
}

/**
 * Alert component suggesting Marriage Allowance claim when eligible
 * Only shows if user qualifies but hasn't updated tax code
 *
 * Eligibility requirements:
 * - User must be basic rate taxpayer (£12,570 - £50,270)
 * - Partner must earn less than Personal Allowance (£12,570)
 * - User must not already have M code in their tax code
 */
export function MarriageAllowanceAlert({
  userSalary,
  partnerSalary,
  hasMarriageCode,
  isScottish = false,
  taxYear = CURRENT_TAX_YEAR,
}: MarriageAllowanceAlertProps) {
  // Don't show if they already have the M code
  if (hasMarriageCode) {
    return null;
  }

  const effectiveTaxYear = taxYear ?? CURRENT_TAX_YEAR;
  const saving = calculateMarriageAllowanceNetSaving({
    recipientIncome: userSalary,
    transferorIncome: partnerSalary,
    taxYear: effectiveTaxYear,
    region: isScottish ? 'scotland' : 'rUK',
  });

  if (!saving) return null;

  const { netSaving, personalAllowance, higherRateThreshold, transferAmount } = saving;

  // User must be a basic rate taxpayer (between PA and higher rate threshold)
  if (userSalary <= personalAllowance || userSalary > higherRateThreshold) {
    return null;
  }

  // Partner must earn less than Personal Allowance
  if (partnerSalary >= personalAllowance || partnerSalary < 0) {
    return null;
  }

  const annualSaving = Math.round(netSaving);
  const monthlySaving = annualSaving / 12;

  return (
    <Alert
      variant='default'
      className='border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10'
    >
      <Heart className={cn(ICON_SIZES.SIZE_5, 'self-start text-primary')} aria-hidden='true' />
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-center sm:justify-between',
          SPACING.GAP_3,
        )}
      >
        <div className='flex-1'>
          <AlertTitle className='text-foreground'>
            You May Qualify for Marriage Allowance
          </AlertTitle>
          <AlertDescription className='text-muted-foreground'>
            Based on your partner's income of {formatCurrency(partnerSalary, 0)}, you may be
            eligible to receive Marriage Allowance. Estimated net saving:{' '}
            <span className='font-bold text-primary'>
              {formatCurrency(annualSaving, 0)} per year
            </span>{' '}
            ({formatCurrency(monthlySaving, 0)}/month) in tax.
            <span className={cn('block', SPACING.MT_2, TYPOGRAPHY.TEXT_SM)}>
              Your partner can transfer 10% of their Personal Allowance (
              {formatCurrency(transferAmount, 0)}) to you, which would update your tax code to
              include an 'M' suffix.
            </span>
          </AlertDescription>
        </div>

        {/* Marriage Allowance Calculator Link */}
        <Button
          asChild
          size='sm'
          className={cn(
            'w-full whitespace-nowrap border border-primary/40 bg-card text-primary shadow-sm hover:bg-primary/10 hover:text-primary sm:w-auto',
            SPACING.GAP_2,
          )}
        >
          <Link href='/tools/marriage-allowance-calculator'>
            Open Marriage Allowance Calculator
            <ArrowRight className={ICON_SIZES.SIZE_4} aria-hidden='true' />
          </Link>
        </Button>
      </div>
    </Alert>
  );
}
