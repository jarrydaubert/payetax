'use client';

import { ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CURRENT_TAX_YEAR, calculateMarriageAllowanceNetSaving, type TaxYear } from '@/lib/tax';
import { cn, formatCurrency } from '@/lib/utils';

interface MarriageAllowanceAlertProps {
  userSalary: number;
  partnerSalary: number;
  hasMarriageCode: boolean;
  isScottish?: boolean;
  taxYear?: TaxYear;
  recipientTaxFreeAmount?: number;
  includedInPayeEstimate?: boolean;
}

export function MarriageAllowanceAlert({
  userSalary,
  partnerSalary,
  hasMarriageCode,
  isScottish = false,
  taxYear = CURRENT_TAX_YEAR,
  recipientTaxFreeAmount,
  includedInPayeEstimate = false,
}: MarriageAllowanceAlertProps) {
  if (hasMarriageCode || partnerSalary < 0 || partnerSalary >= userSalary) return null;

  const { recipientSaving, transferorAdditionalTax, netSaving } =
    calculateMarriageAllowanceNetSaving({
      recipientIncome: userSalary,
      transferorIncome: partnerSalary,
      recipientTaxFreeAmount,
      taxYear,
      region: isScottish ? 'scotland' : 'rUK',
    });

  if (netSaving <= 0) return null;

  return (
    <Alert variant='default' className='mt-4 border-primary/30 bg-primary/5'>
      <Heart className={cn('size-5', 'self-start text-primary')} aria-hidden='true' />
      <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between', 'gap-3')}>
        <div className='flex-1'>
          <AlertTitle className='text-foreground'>
            You May Qualify for Marriage Allowance
          </AlertTitle>
          <AlertDescription className='text-muted-foreground'>
            Based on your partner's income of {formatCurrency(partnerSalary, 0)}, you may be
            eligible to receive Marriage Allowance. For the year, your estimated tax relief is{' '}
            {formatCurrency(recipientSaving)} and your partner's additional tax is{' '}
            {formatCurrency(transferorAdditionalTax)}.
            <span className='block font-semibold text-primary'>
              Net household saving {formatCurrency(netSaving)} per year
            </span>
            <span className={cn('block', 'mt-2', 'text-sm')}>
              This annual estimate assumes your partner has wage income only and uses the same tax
              regime as you.{' '}
              {includedInPayeEstimate
                ? 'The PAYE estimate above already includes the assumed transfer.'
                : 'If HMRC updates your tax code with an M suffix, enter the new code to estimate your PAYE.'}
            </span>
          </AlertDescription>
        </div>

        {/* Marriage Allowance Calculator Link */}
        <Button
          asChild
          size='sm'
          className={cn(
            'w-full border border-primary/40 bg-card whitespace-nowrap text-primary hover:bg-primary/10 hover:text-primary sm:w-auto',
            'gap-2',
          )}
        >
          <Link href='/tools/marriage-allowance-calculator'>
            Open Marriage Allowance Calculator
            <ArrowRight className={'size-4'} aria-hidden='true' />
          </Link>
        </Button>
      </div>
    </Alert>
  );
}
