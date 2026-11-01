// src/app/tools/national-insurance-calculator/NICalculatorClient.tsx
'use client';

import { ArrowRight, Calculator, ChevronDown, HelpCircle, Info, Shield } from 'lucide-react';
import Link from 'next/link';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CURRENT_TAX_YEAR_DISPLAY_SHORT } from '@/constants/freshness';
import { CURRENT_TAX_YEAR, getEmployeeNI, getEmployerNI, type NICategory } from '@/lib/tax';
import { cn, formatCurrency } from '@/lib/utils';

const TAX_YEAR = CURRENT_TAX_YEAR;

const EXAMPLE_SALARIES = [25000, 35000, 50000, 70000, 100000];

const NI_CATEGORIES: { code: NICategory; description: string; common: boolean }[] = [
  { code: 'A', description: 'Standard rate - most employees', common: true },
  { code: 'B', description: 'Married women (reduced rate)', common: false },
  { code: 'C', description: 'Over State Pension age', common: false },
  { code: 'H', description: 'Apprentice under 25', common: true },
  { code: 'J', description: 'Deferment (multiple employments)', common: false },
  { code: 'M', description: 'Under 21', common: true },
  { code: 'Z', description: 'Under 21 with deferment', common: false },
];

/**
 * Annual NI for the tool, via the shared tax-domain mechanics.
 *
 * This tool presents whole-pound annual figures, so the pence-accurate shared
 * results are rounded for display only.
 */
function calculateNI(salary: number, category: NICategory): { employee: number; employer: number } {
  return {
    employee: Math.round(getEmployeeNI(salary, TAX_YEAR, { niCategory: category })),
    employer: Math.round(getEmployerNI(salary, TAX_YEAR, { niCategory: category })),
  };
}

export function NICalculatorClient() {
  const inputId = useId();
  const [salary, setSalary] = useState<string>('');
  const [category, setCategory] = useState<NICategory>('A');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [result, setResult] = useState<{
    employee: number;
    employer: number;
    total: number;
  } | null>(null);

  // Shared calculation logic with optional category override
  const runCalculation = (salaryValue: number, categoryOverride?: NICategory) => {
    const ni = calculateNI(salaryValue, categoryOverride ?? category);
    setResult({
      employee: ni.employee,
      employer: ni.employer,
      total: ni.employee + ni.employer,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Normalize: strip everything except digits
    const salaryNum = Number(salary.replace(/[^\d]/g, ''));
    if (Number.isNaN(salaryNum) || salaryNum < 0) return;
    runCalculation(salaryNum);
  };

  const handleQuickCalculate = (salaryValue: number) => {
    setSalary(salaryValue.toLocaleString());
    runCalculation(salaryValue);
  };

  const handleCategoryChange = (newCategory: NICategory) => {
    setCategory(newCategory);
    if (salary) {
      const salaryNum = Number(salary.replace(/[^\d]/g, ''));
      if (!Number.isNaN(salaryNum) && salaryNum > 0) {
        runCalculation(salaryNum, newCategory);
      }
    }
  };

  return (
    <div className={cn('mx-auto max-w-4xl', 'px-4', 'py-12')}>
      {/* Header */}
      <div className='mb-12 text-center'>
        <div className='mb-4 inline-flex items-center gap-2 rounded-sm border border-primary/35 bg-background px-4 py-2 text-primary'>
          <Shield className={'size-4'} />
          <span className='font-medium text-sm uppercase tracking-[0.2em]'>National Insurance</span>
        </div>
        <h1
          className={cn(
            'mb-4 font-display font-semibold text-foreground leading-tight',
            'text-4xl',
          )}
        >
          National Insurance Calculator {CURRENT_TAX_YEAR_DISPLAY_SHORT}
        </h1>
        <p className={cn('mx-auto max-w-2xl text-muted-foreground', 'text-lg')}>
          Calculate your employee and employer National Insurance contributions. NI is separate from
          income tax and funds state benefits including the NHS.
        </p>
      </div>

      {/* Calculator */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calculator className={'size-5'} />
            Calculate Your NI
          </CardTitle>
          <CardDescription>
            Enter your annual salary to see employee and employer contributions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
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
                Calculate
              </Button>
            </form>

            {/* NI Category Selection */}
            <fieldset>
              <legend className='mb-2 block font-medium text-sm'>NI Category</legend>
              <div className='flex flex-wrap gap-2'>
                {NI_CATEGORIES.filter((c) => c.common).map((cat) => (
                  <button
                    key={cat.code}
                    type='button'
                    onClick={() => handleCategoryChange(cat.code)}
                    className={cn(
                      'rounded-lg border px-4 py-2 text-sm transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                      category === cat.code
                        ? 'border-primary bg-primary/10 font-medium text-primary'
                        : 'hover:border-primary hover:bg-primary/5',
                    )}
                    title={cat.description}
                  >
                    Category {cat.code}
                  </button>
                ))}
                <button
                  type='button'
                  className={cn(
                    'rounded-lg border px-4 py-2 text-muted-foreground text-sm',
                    'hover:border-primary hover:bg-primary/5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  )}
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  aria-expanded={showAllCategories}
                >
                  More
                  <ChevronDown
                    className={cn(
                      'ml-1 inline-block size-4 transition-transform',
                      showAllCategories && 'rotate-180',
                    )}
                  />
                </button>
              </div>

              {/* Expanded categories */}
              {showAllCategories && (
                <div className='mt-3 rounded-lg border bg-muted/50 p-3'>
                  <div className='flex flex-wrap gap-2'>
                    {NI_CATEGORIES.filter((c) => !c.common).map((cat) => (
                      <button
                        key={cat.code}
                        type='button'
                        onClick={() => handleCategoryChange(cat.code)}
                        className={cn(
                          'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                          category === cat.code
                            ? 'border-primary bg-primary/10 font-medium text-primary'
                            : 'hover:border-primary hover:bg-primary/5',
                        )}
                        title={cat.description}
                      >
                        {cat.code}: {cat.description}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className='mt-2 text-muted-foreground text-sm'>
                Most employees are Category A. Check your payslip for your NI category.
              </p>
            </fieldset>

            {/* Quick Examples */}
            <div>
              <p className={cn('mb-2 text-muted-foreground', 'text-sm')}>Quick examples:</p>
              <div className='flex flex-wrap gap-2'>
                {EXAMPLE_SALARIES.map((exampleSalary) => (
                  <button
                    key={exampleSalary}
                    type='button'
                    onClick={() => handleQuickCalculate(exampleSalary)}
                    className={cn(
                      'rounded-full border px-3 py-1 font-mono text-sm transition-colors',
                      'hover:border-primary hover:bg-primary/5',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                    )}
                  >
                    £{exampleSalary.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className='mb-8'>
          <CardContent className='pt-6'>
            <div className='grid gap-4 md:grid-cols-3'>
              <div className='rounded-lg border border-success/30 bg-success/10 p-4'>
                <p className='mb-1 font-medium text-sm text-success'>Your NI (Employee)</p>
                <p className='font-bold text-2xl text-foreground'>
                  {formatCurrency(result.employee, 0)}
                </p>
                <p className='text-sm text-success'>
                  {formatCurrency(Math.round(result.employee / 12), 0)}/month
                </p>
              </div>
              <div className='rounded-lg border border-warning/30 bg-warning/10 p-4'>
                <p className='mb-1 font-medium text-sm text-warning'>Employer NI</p>
                <p className='font-bold text-2xl text-foreground'>
                  {formatCurrency(result.employer, 0)}
                </p>
                <p className='text-sm text-warning'>
                  {formatCurrency(Math.round(result.employer / 12), 0)}/month
                </p>
              </div>
              <div className='rounded-lg border border-border/50 bg-card p-4'>
                <p className='mb-1 font-medium text-muted-foreground text-sm'>Total NI Cost</p>
                <p className='font-bold text-2xl'>{formatCurrency(result.total, 0)}</p>
                <p className='text-muted-foreground text-sm'>Employment cost to employer</p>
              </div>
            </div>

            {/* Annualized estimate disclosure */}
            <p className='mt-4 text-center text-muted-foreground text-xs'>
              This is an annualized estimate. NI is calculated per pay period in practice, which may
              differ slightly.{' '}
              <Link href='/' className='text-primary hover:underline'>
                Use the full calculator
              </Link>{' '}
              for payslip-accurate figures.
            </p>
          </CardContent>
        </Card>
      )}

      {/* NI Rates Table */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HelpCircle className={'size-5'} />
            NI Rates {CURRENT_TAX_YEAR_DISPLAY_SHORT}
          </CardTitle>
          <CardDescription>Current National Insurance thresholds and rates.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Employee Rates */}
            <div>
              <h3 className='mb-3 font-semibold'>Employee NI (Category A)</h3>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b'>
                      <th className='px-4 py-2 text-left font-medium'>Band</th>
                      <th className='px-4 py-2 text-left font-medium'>Rate</th>
                      <th className='px-4 py-2 text-left font-medium'>Income Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className='border-b'>
                      <td className='px-4 py-2'>Below threshold</td>
                      <td className='px-4 py-2 font-mono'>0%</td>
                      <td className='px-4 py-2 text-muted-foreground'>Up to £12,570</td>
                    </tr>
                    <tr className='border-b'>
                      <td className='px-4 py-2'>Main rate</td>
                      <td className='px-4 py-2 font-mono'>8%</td>
                      <td className='px-4 py-2 text-muted-foreground'>£12,570 - £50,270</td>
                    </tr>
                    <tr>
                      <td className='px-4 py-2'>Upper rate</td>
                      <td className='px-4 py-2 font-mono'>2%</td>
                      <td className='px-4 py-2 text-muted-foreground'>Above £50,270</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Employer Rates */}
            <div>
              <h3 className='mb-3 font-semibold'>
                Employer NI ({CURRENT_TAX_YEAR_DISPLAY_SHORT} changes)
              </h3>
              <div className='rounded-lg border border-warning/30 bg-warning/10 p-4'>
                <div className='flex items-start gap-2'>
                  <Info className={cn('size-4', 'mt-0.5 flex-shrink-0 text-warning')} />
                  <div className='text-sm text-warning'>
                    <p className='font-medium'>Autumn Budget 2024 Changes:</p>
                    <ul className='mt-1 space-y-1'>
                      <li>• Threshold reduced from £9,100 to £5,000</li>
                      <li>• Rate increased from 13.8% to 15%</li>
                      <li>• Employers now pay NI on more of each salary</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className='mt-3 overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b'>
                      <th className='px-4 py-2 text-left font-medium'>Band</th>
                      <th className='px-4 py-2 text-left font-medium'>Rate</th>
                      <th className='px-4 py-2 text-left font-medium'>Threshold</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className='border-b'>
                      <td className='px-4 py-2'>Below threshold</td>
                      <td className='px-4 py-2 font-mono'>0%</td>
                      <td className='px-4 py-2 text-muted-foreground'>Up to £5,000</td>
                    </tr>
                    <tr>
                      <td className='px-4 py-2'>Secondary rate</td>
                      <td className='px-4 py-2 font-mono'>15%</td>
                      <td className='px-4 py-2 text-muted-foreground'>Above £5,000</td>
                    </tr>
                  </tbody>
                </table>
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
            <h3 className='mb-2 font-semibold'>What does National Insurance pay for?</h3>
            <p className='text-muted-foreground'>
              NI contributions fund state benefits including the State Pension, NHS, statutory sick
              pay, and unemployment benefits. Your NI record affects your pension entitlement.
            </p>
          </div>
          <div>
            <h3 className='mb-2 font-semibold'>Do I pay NI after State Pension age?</h3>
            <p className='text-muted-foreground'>
              No. Once you reach State Pension age, you stop paying employee NI. You&apos;ll be put
              on Category C. However, your employer still pays employer NI on your salary.
            </p>
          </div>
          <div>
            <h3 className='mb-2 font-semibold'>Is NI the same as income tax?</h3>
            <p className='text-muted-foreground'>
              No. NI is a separate contribution that goes to the National Insurance Fund. Income tax
              goes to general government spending. Both are deducted from your salary, but they have
              different thresholds and rates.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className='mt-12 text-center'>
        <p className={cn('mb-4 text-muted-foreground', 'text-lg')}>
          See your full take-home pay with tax, NI, pension, and student loans.
        </p>
        <Link href='/'>
          <Button size='lg' variant='outline'>
            Open Full Tax Calculator
            <ArrowRight className={cn('ml-2', 'size-4')} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
