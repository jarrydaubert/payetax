// src/app/tools/marriage-allowance-calculator/MarriageAllowanceClient.tsx
'use client';

import { ArrowRight, Heart, Info } from 'lucide-react';
import Link from 'next/link';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CURRENT_TAX_YEAR_DISPLAY_SHORT } from '@/constants/freshness';
import { parseCurrencyInput } from '@/lib/currencyInput';
import {
  CURRENT_TAX_YEAR,
  calculateMarriageAllowanceNetSaving,
  getMarriageAllowanceAmounts,
} from '@/lib/tax';
import { cn, formatCurrency } from '@/lib/utils';

const TAX_YEAR = CURRENT_TAX_YEAR;
const { transferAmount, personalAllowance, maxRecipientRelief } =
  getMarriageAllowanceAmounts(TAX_YEAR);
const REGIONS = [
  { region: 'rUK', label: 'England, Wales and Northern Ireland' },
  { region: 'scotland', label: 'Scotland' },
] as const;

export function MarriageAllowanceClient() {
  const id = useId();
  const transferorId = `${id}-transferor`;
  const recipientId = `${id}-recipient`;
  const [transferorIncome, setTransferorIncome] = useState<string>('');
  const [recipientIncome, setRecipientIncome] = useState<string>('');
  const [transferorError, setTransferorError] = useState<string | null>(null);
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [incomes, setIncomes] = useState<{
    transferorIncome: number;
    recipientIncome: number;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transferor = parseCurrencyInput(transferorIncome);
    const recipient = parseCurrencyInput(recipientIncome);
    const incomesReversed =
      transferor.status === 'valid' &&
      recipient.status === 'valid' &&
      transferor.value > recipient.value;

    setTransferorError(
      transferor.status === 'empty'
        ? 'Enter the lower earner’s annual income, or enter 0 if none.'
        : transferor.status === 'invalid'
          ? transferor.error
          : incomesReversed
            ? 'Enter the lower annual income here.'
            : null,
    );
    setRecipientError(
      recipient.status === 'empty'
        ? 'Enter the higher earner’s annual income, or enter 0 if none.'
        : recipient.status === 'invalid'
          ? recipient.error
          : null,
    );
    setIncomes(
      !incomesReversed && transferor.status === 'valid' && recipient.status === 'valid'
        ? { transferorIncome: transferor.value, recipientIncome: recipient.value }
        : null,
    );
  };

  return (
    <div className={cn('mx-auto max-w-4xl', 'px-4', 'py-12')}>
      {/* Header */}
      <div className='mb-12 text-center'>
        <div className='mb-4 inline-flex items-center gap-2 rounded-sm border border-primary/35 bg-background px-4 py-2 text-primary'>
          <Heart className={'size-4'} />
          <span className='text-sm font-medium tracking-[0.2em] uppercase'>Marriage Allowance</span>
        </div>
        <h1
          className={cn(
            'font-display mb-4 leading-tight font-semibold text-foreground',
            'text-4xl',
          )}
        >
          Marriage Allowance Calculator {CURRENT_TAX_YEAR_DISPLAY_SHORT}
        </h1>
        <p className={cn('mx-auto max-w-2xl text-muted-foreground', 'text-lg')}>
          Married? In a civil partnership? You could save up to{' '}
          <span className='font-semibold text-foreground'>
            {formatCurrency(maxRecipientRelief, 0)}
          </span>{' '}
          per year as a couple through Marriage Allowance.
        </p>
      </div>

      {/* Quick Summary Card */}
      <Card className='mb-8 border-primary/30'>
        <CardContent className='pt-6'>
          <div className='grid gap-6 text-center md:grid-cols-3'>
            <div>
              <p className='mb-1 text-sm font-medium text-muted-foreground'>Amount Transferred</p>
              <p className='text-2xl font-bold'>{formatCurrency(transferAmount, 0)}</p>
            </div>
            <div>
              <p className='mb-1 text-sm font-medium text-muted-foreground'>
                Maximum Recipient Tax Relief
              </p>
              <p className='text-2xl font-bold text-success'>
                {formatCurrency(maxRecipientRelief, 0)}
              </p>
            </div>
            <div>
              <p className='mb-1 text-sm font-medium text-muted-foreground'>Can Backdate</p>
              <p className='text-2xl font-bold'>4 Years</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eligibility Checker */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Check Your Eligibility</CardTitle>
          <CardDescription>
            Enter both partners&apos; annual pay before Income Tax. If you earn the same amount,
            enter it in both fields.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <label htmlFor={transferorId} className='mb-2 block text-sm font-medium'>
                  Lower Earner&apos;s Income
                </label>
                <div className='relative'>
                  <span className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'>
                    £
                  </span>
                  <Input
                    id={transferorId}
                    type='text'
                    inputMode='decimal'
                    placeholder='10,000'
                    value={transferorIncome}
                    onChange={(e) => {
                      setTransferorIncome(e.target.value);
                      setTransferorError(null);
                      setIncomes(null);
                    }}
                    aria-invalid={transferorError ? true : undefined}
                    aria-describedby={
                      transferorError
                        ? `${transferorId}-hint ${transferorId}-error`
                        : `${transferorId}-hint`
                    }
                    className='pl-7 font-mono'
                    autoComplete='off'
                    spellCheck={false}
                  />
                </div>
                <p id={`${transferorId}-hint`} className='mt-1 text-xs text-muted-foreground'>
                  The person who will transfer their allowance
                </p>
                {transferorError && (
                  <p
                    id={`${transferorId}-error`}
                    role='alert'
                    className='mt-1 text-sm text-destructive'
                  >
                    {transferorError}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor={recipientId} className='mb-2 block text-sm font-medium'>
                  Higher Earner&apos;s Income
                </label>
                <div className='relative'>
                  <span className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'>
                    £
                  </span>
                  <Input
                    id={recipientId}
                    type='text'
                    inputMode='decimal'
                    placeholder='35,000'
                    value={recipientIncome}
                    onChange={(e) => {
                      setRecipientIncome(e.target.value);
                      setRecipientError(null);
                      setIncomes(null);
                    }}
                    aria-invalid={recipientError ? true : undefined}
                    aria-describedby={
                      recipientError
                        ? `${recipientId}-hint ${recipientId}-error`
                        : `${recipientId}-hint`
                    }
                    className='pl-7 font-mono'
                    autoComplete='off'
                    spellCheck={false}
                  />
                </div>
                <p id={`${recipientId}-hint`} className='mt-1 text-xs text-muted-foreground'>
                  The person who will receive the allowance
                </p>
                {recipientError && (
                  <p
                    id={`${recipientId}-error`}
                    role='alert'
                    className='mt-1 text-sm text-destructive'
                  >
                    {recipientError}
                  </p>
                )}
              </div>
            </div>
            <Button type='submit' size='lg' className='w-full'>
              Check Eligibility
            </Button>
          </form>
        </CardContent>
      </Card>

      <div aria-live='polite'>
        {incomes && (
          <Card className='mb-8'>
            <CardHeader>
              <CardTitle>Estimated annual household impact</CardTitle>
              <CardDescription>
                These estimates assume wages only, standard Personal Allowances and both partners
                using the same tax regime. If your tax regimes differ or you have other income or
                reliefs, check with HMRC.
              </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-4 sm:grid-cols-2'>
              {REGIONS.map(({ region, label }) => {
                const { eligibility, recipientSaving, transferorAdditionalTax, netSaving } =
                  calculateMarriageAllowanceNetSaving({ ...incomes, taxYear: TAX_YEAR, region });
                const headingId = `${id}-${region}`;

                return (
                  <section
                    key={region}
                    aria-labelledby={headingId}
                    className='rounded-lg border p-4'
                  >
                    <h4 id={headingId} className='font-semibold'>
                      {label}
                    </h4>
                    <p className='mt-1 text-sm text-muted-foreground'>
                      {eligibility === 'eligible'
                        ? 'Eligible on these incomes'
                        : 'Ineligible on these incomes'}
                    </p>
                    {eligibility === 'eligible' ? (
                      <dl className='mt-3 space-y-2 text-sm'>
                        <div className='flex justify-between gap-2'>
                          <dt>Recipient tax relief</dt>
                          <dd>{formatCurrency(recipientSaving)}</dd>
                        </div>
                        <div className='flex justify-between gap-2'>
                          <dt>Transferor additional tax</dt>
                          <dd>{formatCurrency(transferorAdditionalTax)}</dd>
                        </div>
                        <div className='flex justify-between gap-2 border-t pt-2 font-semibold'>
                          <dt>
                            {netSaving === 0
                              ? 'No net household change'
                              : netSaving < 0
                                ? 'Net household cost'
                                : 'Net household saving'}
                          </dt>
                          <dd>{formatCurrency(Math.abs(netSaving))}</dd>
                        </div>
                      </dl>
                    ) : (
                      <p className='mt-3 text-sm'>
                        {eligibility === 'recipient-higher-rate'
                          ? 'The recipient pays Income Tax above the eligible rates.'
                          : 'The transferor would pay Income Tax above the eligible rates after the transfer.'}
                      </p>
                    )}
                  </section>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      {/* How It Works */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>How Marriage Allowance Works</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='rounded-lg border p-4'>
              <h3 className='mb-2 font-semibold'>The Transferor (Lower Earner)</h3>
              <p className='text-sm text-muted-foreground'>
                Gives up {formatCurrency(transferAmount, 0)} of Personal Allowance, leaving{' '}
                {formatCurrency(personalAllowance - transferAmount, 0)} with a standard allowance.
                The transferor usually earns below their Personal Allowance and can pay more Income
                Tax after the transfer.
              </p>
            </div>
            <div className='rounded-lg border p-4'>
              <h3 className='mb-2 font-semibold'>The Recipient (Higher Earner)</h3>
              <p className='text-sm text-muted-foreground'>
                Gets an annual tax reduction of up to {formatCurrency(maxRecipientRelief, 0)},
                limited to their Income Tax. The Scottish starter, basic and intermediate rates
                qualify, as does the basic rate elsewhere in the UK.
              </p>
            </div>
          </div>

          <div className='rounded-lg border border-primary/30 bg-primary/10 p-4'>
            <div className='flex items-start gap-2'>
              <Info className={cn('size-4', 'mt-0.5 flex-shrink-0 text-primary')} />
              <div className='text-sm text-primary'>
                <p className='font-medium'>Important Notes:</p>
                <ul className='mt-1 space-y-1'>
                  <li>• You must be married or in a civil partnership</li>
                  <li>• Apply on GOV.UK - it&apos;s free and takes 5 minutes</li>
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
              You can usually backdate a claim for up to four previous tax years if you were
              eligible in each year you claim. Check the{' '}
              <a
                href='https://www.gov.uk/marriage-allowance/how-it-works#backdating-your-claim'
                className='text-primary underline'
              >
                GOV.UK backdating guidance
              </a>{' '}
              for the earliest year you can claim.
            </p>
          </div>
          <div>
            <h3 className='mb-2 font-semibold'>What if my partner is Scottish?</h3>
            <p className='text-muted-foreground'>
              HMRC can adjust a Scottish recipient&apos;s PAYE code according to their tax band. Use
              the code HMRC gives you to estimate deductions from your pay.
            </p>
          </div>
          <div>
            <h3 className='mb-2 font-semibold'>What happens if I get divorced?</h3>
            <p className='text-muted-foreground'>
              If you divorce, dissolve your civil partnership or legally separate, you must cancel
              Marriage Allowance. Either partner can cancel. HMRC may make the change effective from
              6 April at the start of the tax year, so you or your partner may owe tax for that
              year. Read{' '}
              <a
                href='https://www.gov.uk/marriage-allowance/if-your-circumstances-change'
                className='text-primary underline'
              >
                HMRC&apos;s cancellation guidance
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
      {/* CTA */}
      <div className='mt-12 text-center'>
        <p className={cn('mb-4 text-muted-foreground', 'text-lg')}>
          Estimate deductions and take-home pay with your HMRC tax code.
        </p>
        <Button asChild size='lg' variant='outline'>
          <Link href='/#tax-calculator'>
            Open PAYE Calculator
            <ArrowRight className='ml-2 size-4' aria-hidden='true' />
          </Link>
        </Button>
      </div>
    </div>
  );
}
