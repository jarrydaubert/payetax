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

import { ExternalLink, Heart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { TAX_RATES, TAX_YEARS, type TaxYear } from '@/constants/taxRates';
import { cn, formatCurrency } from '@/lib/utils';

interface MarriageAllowanceAlertProps {
  /** Current annual gross salary */
  userSalary: number;
  /** Partner's annual gross salary */
  partnerSalary: number;
  /** Whether user already has M code in tax code */
  hasMarriageCode: boolean;
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
  taxYear = TAX_YEARS[0],
}: MarriageAllowanceAlertProps) {
  // Don't show if they already have the M code
  if (hasMarriageCode) {
    return null;
  }

  // Get tax rates for the specified tax year
  const taxRates = TAX_RATES[taxYear];
  const personalAllowance = taxRates.personalAllowance;
  const higherRateThreshold = personalAllowance + taxRates.bands[0].threshold;
  const marriageAllowanceTransfer = taxRates.marriageAllowance;
  const basicRate = taxRates.bands[0].rate;

  // User must be a basic rate taxpayer (between PA and higher rate threshold)
  if (userSalary <= personalAllowance || userSalary > higherRateThreshold) {
    return null;
  }

  // Partner must earn less than Personal Allowance
  if (partnerSalary >= personalAllowance) {
    return null;
  }

  // Calculate potential annual saving (marriage allowance × basic rate)
  const annualSaving = (marriageAllowanceTransfer * basicRate) / 100;
  const monthlySaving = annualSaving / 12;

  return (
    <Alert
      variant='default'
      className='border-2 border-pink-500/30 bg-gradient-to-r from-pink-50/50 to-purple-50/50 dark:from-pink-950/20 dark:to-purple-950/20'
    >
      <Heart
        className={cn(ICON_SIZES.SIZE_5, 'self-start text-pink-600 dark:text-pink-400')}
        aria-hidden='true'
      />
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-center sm:justify-between',
          SPACING.GAP_3
        )}
      >
        <div className='flex-1'>
          <AlertTitle className='text-pink-900 dark:text-pink-100'>
            You May Qualify for Marriage Allowance
          </AlertTitle>
          <AlertDescription className='text-pink-800/90 dark:text-pink-200/90'>
            Based on your partner's income of {formatCurrency(partnerSalary, 0)}, you may be
            eligible to receive Marriage Allowance. This could save you up to{' '}
            <span className='font-bold text-pink-600 dark:text-pink-400'>
              {formatCurrency(annualSaving, 0)} per year
            </span>{' '}
            ({formatCurrency(monthlySaving, 0)}/month) in tax.
            <span className={cn('block', SPACING.MT_2, TYPOGRAPHY.TEXT_SM)}>
              Your partner can transfer 10% of their Personal Allowance (£1,260) to you, which would
              update your tax code to include an 'M' suffix.
            </span>
          </AlertDescription>
        </div>

        {/* HMRC Link Button */}
        <Button
          asChild
          size='sm'
          className={cn(
            'w-full whitespace-nowrap bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 sm:w-auto',
            SPACING.GAP_2
          )}
        >
          <a href='https://www.gov.uk/marriage-allowance' target='_blank' rel='noopener noreferrer'>
            Check Eligibility on GOV.UK
            <ExternalLink className={ICON_SIZES.SIZE_4} aria-hidden='true' />
          </a>
        </Button>
      </div>
    </Alert>
  );
}
