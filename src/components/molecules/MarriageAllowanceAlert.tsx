/**
 * Marriage Allowance Alert Component
 *
 * Displayed when user qualifies for Marriage Allowance but doesn't have it in their tax code.
 * Shows below results table when eligible: partner earns < £12,570 AND user is basic rate taxpayer.
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
import { formatCurrency } from '@/lib/utils';

interface MarriageAllowanceAlertProps {
  /** Current annual gross salary */
  userSalary: number;
  /** Partner's annual gross salary */
  partnerSalary: number;
  /** Whether user already has M code in tax code */
  hasMarriageCode: boolean;
}

/**
 * Alert component suggesting Marriage Allowance claim when eligible
 * Only shows if user qualifies but hasn't updated tax code
 */
export function MarriageAllowanceAlert({
  partnerSalary,
  hasMarriageCode,
}: MarriageAllowanceAlertProps) {
  // Don't show if they already have the M code
  if (hasMarriageCode) {
    return null;
  }

  // Calculate potential annual saving (£1,260 × 20% basic rate)
  const annualSaving = 252;
  const monthlySaving = 21; // £252 / 12

  return (
    <Alert
      variant='default'
      className='border-2 border-pink-500/30 bg-gradient-to-r from-pink-50/50 to-purple-50/50 dark:from-pink-950/20 dark:to-purple-950/20'
    >
      <Heart className='size-5 self-start text-pink-600 dark:text-pink-400' />
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
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
            <span className='mt-2 block text-sm'>
              Your partner can transfer 10% of their Personal Allowance (£1,260) to you, which would
              update your tax code to include an 'M' suffix.
            </span>
          </AlertDescription>
        </div>

        {/* HMRC Link Button */}
        <Button
          asChild
          size='sm'
          className='w-full gap-2 whitespace-nowrap bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 sm:w-auto'
        >
          <a href='https://www.gov.uk/marriage-allowance' target='_blank' rel='noopener noreferrer'>
            Check Eligibility on GOV.UK
            <ExternalLink className='size-4' />
          </a>
        </Button>
      </div>
    </Alert>
  );
}
