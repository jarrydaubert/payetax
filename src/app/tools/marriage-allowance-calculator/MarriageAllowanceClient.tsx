// src/app/tools/marriage-allowance-calculator/MarriageAllowanceClient.tsx
'use client';

import { ArrowRight, CheckCircle, Heart, Info, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useId, useState } from 'react';
import { NewsletterCTA } from '@/components/organisms/NewsletterCTA';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { CURRENT_TAX_YEAR, TAX_RATES } from '@/constants/taxRates';
import { calculateMarriageAllowanceNetSaving } from '@/lib/tax/marriageAllowance';
import { cn } from '@/lib/utils';

const TAX_YEAR = CURRENT_TAX_YEAR;
const rates = TAX_RATES[TAX_YEAR];
const MARRIAGE_ALLOWANCE = rates.marriageAllowance; // £1,260 for 2025-26
const PERSONAL_ALLOWANCE = rates.personalAllowance; // £12,570
const BASIC_RATE_LIMIT = PERSONAL_ALLOWANCE + (rates.bands[0]?.threshold ?? 0);
const TAX_SAVING = Math.round(MARRIAGE_ALLOWANCE * 0.2); // £252

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type EligibilityStatus = 'eligible' | 'not_eligible';

interface EligibilityResult {
  status: EligibilityStatus;
  reason: string;
  annualSaving: number;
  transferorIncome: number;
  recipientIncome: number;
}

function checkEligibility(transferorIncome: number, recipientIncome: number): EligibilityResult {
  const baseResult = {
    transferorIncome,
    recipientIncome,
    annualSaving: 0,
  };

  // Transferor must earn less than personal allowance
  if (transferorIncome > PERSONAL_ALLOWANCE) {
    return {
      ...baseResult,
      status: 'not_eligible',
      reason: `The lower earner must earn less than ${formatCurrency(PERSONAL_ALLOWANCE)} (the Personal Allowance) to transfer their unused allowance.`,
    };
  }

  // Recipient must be a basic rate taxpayer
  if (recipientIncome <= PERSONAL_ALLOWANCE) {
    return {
      ...baseResult,
      status: 'not_eligible',
      reason: `The higher earner must earn more than ${formatCurrency(PERSONAL_ALLOWANCE)} to benefit from the transferred allowance.`,
    };
  }

  if (recipientIncome > BASIC_RATE_LIMIT) {
    return {
      ...baseResult,
      status: 'not_eligible',
      reason: `The higher earner must be a basic rate taxpayer (earning up to ${formatCurrency(BASIC_RATE_LIMIT)}). Higher rate taxpayers cannot receive Marriage Allowance.`,
    };
  }

  const savingResult = calculateMarriageAllowanceNetSaving({
    recipientIncome,
    transferorIncome,
    taxYear: TAX_YEAR,
    region: 'rUK',
  });
  const saving = Math.round(savingResult?.netSaving ?? TAX_SAVING);

  return {
    ...baseResult,
    status: 'eligible',
    reason: `You qualify for Marriage Allowance. The lower earner can transfer ${formatCurrency(MARRIAGE_ALLOWANCE)} of their Personal Allowance to their partner.`,
    annualSaving: saving,
  };
}

export function MarriageAllowanceClient() {
  const id = useId();
  const transferorId = `${id}-transferor`;
  const recipientId = `${id}-recipient`;
  const [transferorIncome, setTransferorIncome] = useState<string>('');
  const [recipientIncome, setRecipientIncome] = useState<string>('');
  const [result, setResult] = useState<EligibilityResult | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Normalize: strip everything except digits
    const transferor = Number(transferorIncome.replace(/[^\d]/g, ''));
    const recipient = Number(recipientIncome.replace(/[^\d]/g, ''));

    setResult(checkEligibility(transferor, recipient));
  };

  const isFormValid = transferorIncome.trim() && recipientIncome.trim();

  return (
    <div className={cn('mx-auto max-w-4xl', SPACING.PX_4, SPACING.PY_12)}>
      {/* Header */}
      <div className='mb-12 text-center'>
        <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-2 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'>
          <Heart className={ICON_SIZES.SIZE_4} />
          <span className='font-medium text-sm'>Marriage Allowance</span>
        </div>
        <h1
          className={cn(
            'mb-4 bg-gradient-to-r from-brand-gradient-start via-brand-accent to-brand-gradient-end bg-clip-text font-bold text-transparent',
            TYPOGRAPHY.TEXT_4XL,
          )}
        >
          Marriage Allowance Calculator 2025-26
        </h1>
        <p className={cn('mx-auto max-w-2xl text-muted-foreground', TYPOGRAPHY.TEXT_LG)}>
          Married? In a civil partnership? You could save up to{' '}
          <span className='font-semibold text-foreground'>{formatCurrency(TAX_SAVING)}</span> per
          year by transferring unused Personal Allowance to your partner.
        </p>
      </div>

      {/* Quick Summary Card */}
      <Card className='mb-8 border-2 border-primary/20'>
        <CardContent className='pt-6'>
          <div className='grid gap-6 text-center md:grid-cols-3'>
            <div>
              <p className='mb-1 font-medium text-muted-foreground text-sm'>Amount Transferred</p>
              <p className='font-bold text-2xl'>{formatCurrency(MARRIAGE_ALLOWANCE)}</p>
            </div>
            <div>
              <p className='mb-1 font-medium text-muted-foreground text-sm'>Annual Tax Saving</p>
              <p className='font-bold text-2xl text-emerald-600'>{formatCurrency(TAX_SAVING)}</p>
            </div>
            <div>
              <p className='mb-1 font-medium text-muted-foreground text-sm'>Can Backdate</p>
              <p className='font-bold text-2xl'>4 Years</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eligibility Checker */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Check Your Eligibility</CardTitle>
          <CardDescription>
            Enter both partners&apos; annual income to see if you qualify.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <label htmlFor={transferorId} className='mb-2 block font-medium text-sm'>
                  Lower Earner&apos;s Income
                </label>
                <div className='relative'>
                  <span className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'>
                    £
                  </span>
                  <Input
                    id={transferorId}
                    type='text'
                    placeholder='10,000'
                    value={transferorIncome}
                    onChange={(e) => setTransferorIncome(e.target.value)}
                    className='pl-7 font-mono'
                    autoComplete='off'
                    spellCheck={false}
                  />
                </div>
                <p className='mt-1 text-muted-foreground text-xs'>
                  The person who will transfer their allowance
                </p>
              </div>
              <div>
                <label htmlFor={recipientId} className='mb-2 block font-medium text-sm'>
                  Higher Earner&apos;s Income
                </label>
                <div className='relative'>
                  <span className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'>
                    £
                  </span>
                  <Input
                    id={recipientId}
                    type='text'
                    placeholder='35,000'
                    value={recipientIncome}
                    onChange={(e) => setRecipientIncome(e.target.value)}
                    className='pl-7 font-mono'
                    autoComplete='off'
                    spellCheck={false}
                  />
                </div>
                <p className='mt-1 text-muted-foreground text-xs'>
                  The person who will receive the allowance
                </p>
              </div>
            </div>
            <Button type='submit' size='lg' className='w-full' disabled={!isFormValid}>
              Check Eligibility
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card
          className={cn(
            'mb-8',
            result.status === 'eligible'
              ? 'border-emerald-200 dark:border-emerald-800'
              : 'border-destructive/30',
          )}
        >
          <CardContent className='pt-6'>
            <div className='flex items-start gap-4'>
              {result.status === 'eligible' ? (
                <CheckCircle className={cn(ICON_SIZES.SIZE_8, 'flex-shrink-0 text-emerald-600')} />
              ) : (
                <XCircle className={cn(ICON_SIZES.SIZE_8, 'flex-shrink-0 text-destructive')} />
              )}
              <div>
                <h3
                  className={cn(
                    'mb-2 font-semibold text-lg',
                    result.status === 'eligible' ? 'text-emerald-700 dark:text-emerald-300' : '',
                  )}
                >
                  {result.status === 'eligible'
                    ? 'You Qualify for Marriage Allowance!'
                    : "You Don't Qualify"}
                </h3>
                <p className='text-muted-foreground'>{result.reason}</p>
                {result.status === 'eligible' && (
                  <div className='mt-4 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20'>
                    <p className='font-medium text-emerald-800 dark:text-emerald-200'>
                      Your annual saving:{' '}
                      <span className='text-xl'>{formatCurrency(result.annualSaving)}</span>
                    </p>
                    <p className='mt-1 text-emerald-700 text-sm dark:text-emerald-300'>
                      Plus, you can backdate up to 4 years for a total of up to{' '}
                      {formatCurrency(result.annualSaving * 4)}!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>How Marriage Allowance Works</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='rounded-lg border p-4'>
              <h3 className='mb-2 font-semibold'>The Transferor (Lower Earner)</h3>
              <ul className='space-y-2 text-muted-foreground text-sm'>
                <li>• Must earn less than {formatCurrency(PERSONAL_ALLOWANCE)}</li>
                <li>
                  • Transfers {formatCurrency(MARRIAGE_ALLOWANCE)} of their Personal Allowance
                </li>
                <li>
                  • Their Personal Allowance reduces to{' '}
                  {formatCurrency(PERSONAL_ALLOWANCE - MARRIAGE_ALLOWANCE)}
                </li>
                <li>• Usually pays no tax anyway, so no impact</li>
              </ul>
            </div>
            <div className='rounded-lg border p-4'>
              <h3 className='mb-2 font-semibold'>The Recipient (Higher Earner)</h3>
              <ul className='space-y-2 text-muted-foreground text-sm'>
                <li>• Must be a basic rate taxpayer (20%)</li>
                <li>• Cannot earn more than {formatCurrency(BASIC_RATE_LIMIT)}</li>
                <li>• Receives {formatCurrency(MARRIAGE_ALLOWANCE)} extra allowance</li>
                <li>
                  • Saves {formatCurrency(TAX_SAVING)} in tax (20% of{' '}
                  {formatCurrency(MARRIAGE_ALLOWANCE)})
                </li>
              </ul>
            </div>
          </div>

          <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20'>
            <div className='flex items-start gap-2'>
              <Info className={cn(ICON_SIZES.SIZE_4, 'mt-0.5 flex-shrink-0 text-blue-600')} />
              <div className='text-blue-800 text-sm dark:text-blue-200'>
                <p className='font-medium'>Important Notes:</p>
                <ul className='mt-1 space-y-1'>
                  <li>• You must be married or in a civil partnership</li>
                  <li>• The saving is a tax reduction, not a refund</li>
                  <li>• Apply on GOV.UK - it&apos;s free and takes 5 minutes</li>
                  <li>• You can usually backdate claims for up to 4 tax years</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div>
            <h3 className='mb-2 font-semibold'>How do I apply for Marriage Allowance?</h3>
            <p className='text-muted-foreground'>
              Apply online at{' '}
              <a
                href='https://www.gov.uk/apply-marriage-allowance'
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary hover:underline'
              >
                GOV.UK/apply-marriage-allowance
              </a>
              . It&apos;s free and takes about 5 minutes. You&apos;ll need National Insurance
              numbers for both partners.
            </p>
          </div>
          <div>
            <h3 className='mb-2 font-semibold'>Can I backdate my claim?</h3>
            <p className='text-muted-foreground'>
              Yes! You can backdate your claim for up to 4 tax years. If you qualified for all 4
              years, you could receive up to {formatCurrency(TAX_SAVING * 4)} as a lump sum.
            </p>
          </div>
          <div>
            <h3 className='mb-2 font-semibold'>What if my partner is Scottish?</h3>
            <p className='text-muted-foreground'>
              Scottish taxpayers can still qualify for Marriage Allowance. The higher earner must
              not be a higher-rate taxpayer. Scottish tax bands differ from rUK, so check the
              current Scottish thresholds on GOV.UK if your partner pays Scottish income tax.
            </p>
          </div>
          <div>
            <h3 className='mb-2 font-semibold'>What happens if I get divorced?</h3>
            <p className='text-muted-foreground'>
              You should cancel your Marriage Allowance as soon as you separate. You&apos;ll get the
              benefit for the full tax year in which you cancel.
            </p>
          </div>
        </CardContent>
      </Card>

      <NewsletterCTA
        className='mb-8'
        title='Get UK Tax Savings Tips by Email'
        description='Marriage Allowance updates, HMRC changes, and practical tax-saving guides.'
      />

      {/* CTA */}
      <div className='mt-12 text-center'>
        <p className={cn('mb-4 text-muted-foreground', TYPOGRAPHY.TEXT_LG)}>
          See your full household tax breakdown with Marriage Allowance applied.
        </p>
        <Link href='/?marriageAllowance=receiving'>
          <Button size='lg' variant='brandOutline'>
            Calculate with Marriage Allowance
            <ArrowRight className={cn('ml-2', ICON_SIZES.SIZE_4)} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
