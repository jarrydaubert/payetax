// src/app/tools/scottish-tax-calculator/ScottishTaxCalculatorClient.tsx
'use client';

import { ArrowRight, Calculator, ExternalLink, Info, MapPin, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CURRENT_TAX_YEAR_DISPLAY_SHORT } from '@/constants/freshness';
import {
  type AnnualIncomeTaxComparison,
  CURRENT_SCOTTISH_TAX_CROSSOVER,
  calculateAnnualIncomeTaxComparison,
  formatAnnualSalaryInput,
  parseAnnualSalaryInput,
} from '@/lib/scottishTaxComparison';
import {
  CURRENT_TAX_YEAR,
  SCOTTISH_TAX_RATES,
  TAX_RATES,
  TAX_YEAR_SOURCES,
  taxableThresholdToTotalIncome,
} from '@/lib/tax';
import { cn, formatCurrency } from '@/lib/utils';
import { useCalculatorActions } from '@/store/calculatorStore';

const TAX_YEAR = CURRENT_TAX_YEAR;
const scottishRates = SCOTTISH_TAX_RATES[TAX_YEAR];
const rukRates = TAX_RATES[TAX_YEAR];
const taxYearSources = TAX_YEAR_SOURCES[TAX_YEAR];
const scottishSourceUrl = taxYearSources.incomeTax.scotlandBands[0];
const rukSourceUrl = taxYearSources.incomeTax.ukMainBands[0];

// Quick salary examples for comparison
const EXAMPLE_SALARIES = [30000, 50000, 70000, 100000, 150000];

export function ScottishTaxCalculatorClient() {
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const [salary, setSalary] = useState<string>('');
  const [salaryError, setSalaryError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<AnnualIncomeTaxComparison | null>(null);
  const { setRegion } = useCalculatorActions();

  const runComparison = (salaryValue: number) => {
    setSalaryError(null);
    setSalary(formatAnnualSalaryInput(salaryValue));
    setComparison(calculateAnnualIncomeTaxComparison(salaryValue));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSalary = parseAnnualSalaryInput(salary);

    if (!parsedSalary.success) {
      setComparison(null);
      setSalaryError(parsedSalary.error);
      return;
    }

    runComparison(parsedSalary.salary);
  };

  const handleSalaryChange = (value: string) => {
    setSalary(value);
    setSalaryError(null);
    setComparison(null);
  };

  const handleSalaryBlur = () => {
    const parsedSalary = parseAnnualSalaryInput(salary);
    if (parsedSalary.success) {
      setSalary(formatAnnualSalaryInput(parsedSalary.salary));
    }
  };

  const handleQuickCalculate = (salaryValue: number) => {
    runComparison(salaryValue);
  };

  return (
    <div className={cn('mx-auto max-w-4xl', 'px-4', 'py-12')}>
      {/* Header */}
      <div className='mb-12 text-center'>
        <div className='mb-4 inline-flex items-center gap-2 rounded-sm border border-primary/35 bg-background px-4 py-2 text-primary'>
          <MapPin className={'size-4'} />
          <span className='font-medium text-sm uppercase tracking-[0.2em]'>
            Scottish Income Tax
          </span>
        </div>
        <h1
          className={cn(
            'mb-4 font-display font-semibold text-foreground leading-tight',
            'text-4xl',
          )}
        >
          Scottish Tax Calculator {CURRENT_TAX_YEAR_DISPLAY_SHORT}
        </h1>
        <p className={cn('mx-auto max-w-2xl text-muted-foreground', 'text-lg')}>
          Compare annual Scottish Income Tax with rest-of-UK Income Tax on the same salary. This
          tool does not calculate take-home pay.
        </p>
      </div>

      {/* Quick Comparison Calculator */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calculator className={'size-5'} />
            Quick Comparison
          </CardTitle>
          <CardDescription>
            Enter an annual salary from £0 to £10,000,000 to compare Scotland with England, Wales
            and Northern Ireland.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='mb-5 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm'>
            <p className='font-semibold text-foreground'>Annual Income Tax only</p>
            <p className='mt-1 text-muted-foreground'>
              Assumes salary is your only income and applies the standard Personal Allowance,
              tapered from salary where applicable. It does not apply your tax code, other income,
              benefits, pension contributions, allowances or reliefs. National Insurance, Student
              Loans and take-home pay are excluded.
            </p>
          </div>
          <form onSubmit={handleSubmit} className='flex gap-3'>
            <label htmlFor={inputId} className='sr-only'>
              Annual salary
            </label>
            <div className='relative flex-1'>
              <span className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'>
                £
              </span>
              <Input
                id={inputId}
                type='text'
                inputMode='decimal'
                placeholder='50,000.00'
                value={salary}
                onChange={(e) => handleSalaryChange(e.target.value)}
                onBlur={handleSalaryBlur}
                className='pl-7 font-mono text-lg'
                autoComplete='off'
                spellCheck={false}
                aria-invalid={salaryError ? 'true' : undefined}
                aria-describedby={salaryError ? `${helpId} ${errorId}` : helpId}
              />
            </div>
            <Button type='submit' size='lg' disabled={!salary.trim()}>
              Compare
            </Button>
          </form>
          <p id={helpId} className='mt-2 text-muted-foreground text-sm'>
            Use digits, optional commas and up to 2 decimal places, for example 50000.50 or
            50,000.50.
          </p>
          {salaryError && (
            <p id={errorId} className='mt-2 text-destructive text-sm' role='alert'>
              {salaryError}
            </p>
          )}

          {/* Quick Examples */}
          <div className='mt-4'>
            <p className={cn('mb-2 text-muted-foreground', 'text-sm')}>Quick examples:</p>
            <div className='flex flex-wrap gap-2'>
              {EXAMPLE_SALARIES.map((exampleSalary) => (
                <button
                  key={exampleSalary}
                  type='button'
                  onClick={() => handleQuickCalculate(exampleSalary)}
                  className={cn(
                    'rounded-full border border-border/50 px-3 py-1 font-mono text-sm transition-colors',
                    'hover:border-primary hover:bg-primary/5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  )}
                >
                  £{exampleSalary.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Result */}
      {comparison && (
        <Card className='mb-8'>
          <CardContent className='pt-6'>
            <div className='grid gap-4 md:grid-cols-3'>
              <div className='rounded-lg border border-primary/30 bg-primary/10 p-4'>
                <p className='mb-1 font-medium text-primary text-sm'>Scottish Tax</p>
                <p className='font-bold text-2xl text-foreground'>
                  {formatCurrency(comparison.scottishTax, 0)}
                </p>
              </div>
              <div className='rounded-lg border border-border/50 bg-card p-4'>
                <p className='mb-1 font-medium text-muted-foreground text-sm'>Rest of UK Tax</p>
                <p className='font-bold text-2xl'>{formatCurrency(comparison.rukTax, 0)}</p>
              </div>
              <div
                className={cn(
                  'rounded-lg border border-border/50 p-4',
                  comparison.difference > 0
                    ? 'bg-warning/10'
                    : comparison.difference < 0
                      ? 'bg-success/10'
                      : 'bg-card',
                )}
              >
                <p className='mb-1 font-medium text-sm'>
                  {comparison.difference > 0
                    ? 'You pay more in Scotland'
                    : comparison.difference < 0
                      ? 'You pay less in Scotland'
                      : 'Same tax'}
                </p>
                <p
                  className={cn(
                    'font-bold text-2xl',
                    comparison.difference > 0
                      ? 'text-warning'
                      : comparison.difference < 0
                        ? 'text-success'
                        : '',
                  )}
                >
                  {comparison.difference > 0 ? '+' : ''}
                  {formatCurrency(comparison.difference, 0)}/year
                </p>
              </div>
            </div>

            <div className='mt-6 rounded-lg border border-primary/30 bg-primary/10 p-4'>
              <div className='flex items-start gap-2'>
                <Info className={cn('size-4', 'mt-0.5 flex-shrink-0 text-primary')} />
                <p className='text-primary text-sm'>
                  This is an annual Income Tax comparison, not a payslip or take-home calculation.
                  Scottish taxpayers usually have an &quot;S&quot; prefix in their tax code (for
                  example, S1257L).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scottish Tax Bands */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className={'size-5'} />
            Scottish Tax Bands {CURRENT_TAX_YEAR_DISPLAY_SHORT}
          </CardTitle>
          <CardDescription>
            Scotland has {scottishRates.bands.length} Income Tax bands compared with{' '}
            {rukRates.bands.length} across the rest of the UK.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-border/50 border-b'>
                  <th className='px-4 py-3 text-left font-medium'>Band</th>
                  <th className='px-4 py-3 text-left font-medium'>Rate</th>
                  <th className='px-4 py-3 text-left font-medium'>Income Range</th>
                </tr>
              </thead>
              <tbody>
                <tr className='border-border/50 border-b'>
                  <td className='px-4 py-3'>Personal Allowance</td>
                  <td className='px-4 py-3 font-mono'>0%</td>
                  <td className='px-4 py-3 text-muted-foreground'>
                    Up to £{scottishRates.personalAllowance.toLocaleString('en-GB')}
                  </td>
                </tr>
                {scottishRates.bands.map((band, index) => {
                  const prevThreshold =
                    index === 0 ? 0 : (scottishRates.bands[index - 1]?.threshold ?? 0);
                  // Thresholds are taxable-income amounts; map to total income
                  // with the taper-aware helper so the boundary above £100k is
                  // right (top rate starts at £125,140, where the PA is zero).
                  const startIncome =
                    taxableThresholdToTotalIncome(
                      prevThreshold,
                      scottishRates.personalAllowance,
                      scottishRates.personalAllowanceReductionThreshold,
                    ) + 1;
                  const endIncome =
                    band.threshold === Number.POSITIVE_INFINITY
                      ? null
                      : taxableThresholdToTotalIncome(
                          band.threshold,
                          scottishRates.personalAllowance,
                          scottishRates.personalAllowanceReductionThreshold,
                        );

                  return (
                    <tr key={band.name} className='border-border/50 border-b last:border-0'>
                      <td className='px-4 py-3'>{band.name}</td>
                      <td className='px-4 py-3 font-medium font-mono'>{band.rate}%</td>
                      <td className='px-4 py-3 text-muted-foreground'>
                        {endIncome
                          ? `£${startIncome.toLocaleString()} to £${endIncome.toLocaleString()}`
                          : `Over £${(startIncome - 1).toLocaleString()}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Comparison with English Rates */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Scottish vs English Tax Rates</CardTitle>
          <CardDescription>
            Key differences in the tax systems for {CURRENT_TAX_YEAR_DISPLAY_SHORT}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-3'>
              <h3 className='font-semibold'>Scotland ({scottishRates.bands.length} bands)</h3>
              <ul className='space-y-2 text-muted-foreground text-sm'>
                {scottishRates.bands.map((band) => (
                  <li key={band.name}>
                    • {band.name}: {band.rate}%
                  </li>
                ))}
              </ul>
            </div>
            <div className='space-y-3'>
              <h3 className='font-semibold'>Rest of UK ({rukRates.bands.length} bands)</h3>
              <ul className='space-y-2 text-muted-foreground text-sm'>
                {rukRates.bands.map((band) => (
                  <li key={band.name}>
                    • {band.name}: {band.rate}%
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div>
            <h3 className='mb-2 font-semibold'>How do I know if I pay Scottish tax?</h3>
            <p className='text-muted-foreground'>
              You pay Scottish Income Tax if Scotland is your main residence. If you&apos;re
              employed or receive a pension under PAYE, your tax code will usually start with
              &quot;S&quot; (for example, S1257L). Check your payslip or P60.
            </p>
          </div>
          <div>
            <h3 className='mb-2 font-semibold'>Is Scottish tax always higher?</h3>
            <p className='text-muted-foreground'>
              Not always. With the standard Personal Allowance and salary as your only income,
              annual Scottish and rest-of-UK Income Tax are the same at approximately £
              {CURRENT_SCOTTISH_TAX_CROSSOVER.toLocaleString('en-GB')}. Scottish tax is slightly
              lower between the Personal Allowance and that crossover, then generally higher above
              it.
            </p>
          </div>
          <div>
            <h3 className='mb-2 font-semibold'>What about National Insurance?</h3>
            <p className='text-muted-foreground'>
              National Insurance rates are the same across the entire UK. Only income tax differs
              for Scottish residents.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Official sources and checks</CardTitle>
          <CardDescription>
            Check the current rates and whether Scottish Income Tax applies to you.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          <a
            href={scottishSourceUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-2 text-primary hover:underline'
          >
            Scottish Government: {CURRENT_TAX_YEAR_DISPLAY_SHORT} rates and bands
            <ExternalLink className='size-4' aria-hidden='true' />
          </a>
          <a
            href={rukSourceUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-2 text-primary hover:underline'
          >
            HMRC: {CURRENT_TAX_YEAR_DISPLAY_SHORT} rates and thresholds
            <ExternalLink className='size-4' aria-hidden='true' />
          </a>
          <a
            href='https://www.gov.uk/scottish-income-tax'
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-2 text-primary hover:underline'
          >
            GOV.UK: check whether you pay Scottish Income Tax
            <ExternalLink className='size-4' aria-hidden='true' />
          </a>
        </CardContent>
      </Card>
      {/* CTA */}
      <div className='mt-12 text-center'>
        <p className={cn('mb-4 text-muted-foreground', 'text-lg')}>
          Get a full breakdown with NI, pension, and student loan calculations.
        </p>
        <Link href='/#tax-calculator' onClick={() => setRegion('Scotland')}>
          <Button size='lg' variant='outline'>
            Open Full Scottish Calculator
            <ArrowRight className={cn('ml-2', 'size-4')} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
