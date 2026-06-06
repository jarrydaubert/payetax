// src/app/tools/scottish-tax-calculator/ScottishTaxCalculatorClient.tsx
'use client';

import { ArrowRight, Calculator, Info, MapPin, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CURRENT_TAX_YEAR_DISPLAY_SHORT } from '@/constants/freshness';
import { CURRENT_TAX_YEAR, SCOTTISH_TAX_RATES, TAX_RATES } from '@/constants/taxRates';
import { cn, formatCurrency } from '@/lib/utils';

const TAX_YEAR = CURRENT_TAX_YEAR;
const scottishRates = SCOTTISH_TAX_RATES[TAX_YEAR];
const englishRates = TAX_RATES[TAX_YEAR];

// Quick salary examples for comparison
const EXAMPLE_SALARIES = [30000, 50000, 70000, 100000, 150000];

function calculateTax(
  salary: number,
  bands: typeof scottishRates.bands,
  personalAllowance: number,
  paReductionThreshold: number,
  paReductionRate: number,
): number {
  // Handle personal allowance reduction for high earners
  let effectiveAllowance = personalAllowance;
  if (salary > paReductionThreshold) {
    const reduction = Math.floor((salary - paReductionThreshold) * paReductionRate);
    effectiveAllowance = Math.max(0, personalAllowance - reduction);
  }

  const taxableIncome = Math.max(0, salary - effectiveAllowance);
  let tax = 0;
  let remainingIncome = taxableIncome;
  let previousThreshold = 0;

  for (const band of bands) {
    const bandWidth = band.threshold - previousThreshold;
    const incomeInBand = Math.min(remainingIncome, bandWidth);
    tax += incomeInBand * (band.rate / 100);
    remainingIncome -= incomeInBand;
    previousThreshold = band.threshold;
    if (remainingIncome <= 0) break;
  }

  return Math.round(tax);
}

export function ScottishTaxCalculatorClient() {
  const inputId = useId();
  const [salary, setSalary] = useState<string>('');
  const [comparison, setComparison] = useState<{
    scottishTax: number;
    englishTax: number;
    difference: number;
  } | null>(null);

  // Shared comparison logic
  const runComparison = (salaryValue: number) => {
    const scottishTax = calculateTax(
      salaryValue,
      scottishRates.bands,
      scottishRates.personalAllowance,
      scottishRates.personalAllowanceReductionThreshold,
      scottishRates.personalAllowanceReductionRate,
    );
    const englishTax = calculateTax(
      salaryValue,
      englishRates.bands,
      englishRates.personalAllowance,
      englishRates.personalAllowanceReductionThreshold,
      englishRates.personalAllowanceReductionRate,
    );
    setComparison({
      scottishTax,
      englishTax,
      difference: scottishTax - englishTax,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Normalize: strip everything except digits
    const salaryNum = Number(salary.replace(/[^\d]/g, ''));
    if (Number.isNaN(salaryNum) || salaryNum < 0) return;
    runComparison(salaryNum);
  };

  const handleQuickCalculate = (salaryValue: number) => {
    setSalary(salaryValue.toLocaleString());
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
          Scotland has 6 income tax bands with different rates to the rest of the UK. See how much
          how much tax you&apos;ll pay and compare with English rates.
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
            Enter your salary to see the tax difference between Scotland and England.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                placeholder='50,000'
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className='pl-7 font-mono text-lg'
                autoComplete='off'
                spellCheck={false}
              />
            </div>
            <Button type='submit' size='lg' disabled={!salary.trim()}>
              Compare
            </Button>
          </form>

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
                <p className='mb-1 font-medium text-muted-foreground text-sm'>English Tax</p>
                <p className='font-bold text-2xl'>{formatCurrency(comparison.englishTax, 0)}</p>
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
                  This comparison shows income tax only. National Insurance is the same across the
                  UK. Scottish taxpayers have an &quot;S&quot; prefix in their tax code (e.g.,
                  S1257L).
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
            Scotland has 6 income tax bands compared to England&apos;s 3 bands.
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
                  <td className='px-4 py-3 text-muted-foreground'>Up to £12,570</td>
                </tr>
                {scottishRates.bands.map((band, index) => {
                  const prevThreshold =
                    index === 0 ? 0 : (scottishRates.bands[index - 1]?.threshold ?? 0);
                  // Use exact thresholds (half-open intervals [prev+1, threshold])
                  const startIncome = scottishRates.personalAllowance + prevThreshold + 1;
                  const endIncome =
                    band.threshold === Number.POSITIVE_INFINITY
                      ? null
                      : scottishRates.personalAllowance + band.threshold;

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
              <h3 className='font-semibold'>Scotland (6 bands)</h3>
              <ul className='space-y-2 text-muted-foreground text-sm'>
                <li>• Starter rate: 19% (unique to Scotland)</li>
                <li>• Intermediate rate: 21% (unique to Scotland)</li>
                <li>• Higher rate: 42% (vs 40% in England)</li>
                <li>• Advanced rate: 45% (unique to Scotland)</li>
                <li>• Top rate: 48% (vs 45% in England)</li>
              </ul>
            </div>
            <div className='space-y-3'>
              <h3 className='font-semibold'>England, Wales, NI (3 bands)</h3>
              <ul className='space-y-2 text-muted-foreground text-sm'>
                <li>• Basic rate: 20% (£12,571 - £50,270)</li>
                <li>• Higher rate: 40% (£50,271 - £125,140)</li>
                <li>• Additional rate: 45% (over £125,140)</li>
                <li>• Simpler structure with fewer bands</li>
                <li>• Same personal allowance (£12,570)</li>
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
              You pay Scottish income tax if Scotland is your main residence. Your tax code will
              start with &quot;S&quot; (e.g., S1257L). Check your payslip or P60.
            </p>
          </div>
          <div>
            <h3 className='mb-2 font-semibold'>Is Scottish tax always higher?</h3>
            <p className='text-muted-foreground'>
              Not always. Lower earners (under ~£28,000) often pay slightly less due to the starter
              rate. Higher earners typically pay more due to the higher rates at 42% and 48%.
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
      {/* CTA */}
      <div className='mt-12 text-center'>
        <p className={cn('mb-4 text-muted-foreground', 'text-lg')}>
          Get a full breakdown with NI, pension, and student loan calculations.
        </p>
        <Link href='/?scottish=true'>
          <Button size='lg' variant='outline'>
            Open Full Scottish Calculator
            <ArrowRight className={cn('ml-2', 'size-4')} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
