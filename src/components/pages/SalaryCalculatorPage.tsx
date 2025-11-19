// src/components/pages/SalaryCalculatorPage.tsx
// Main component for salary-specific landing pages

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SalaryQuickResults } from '@/components/molecules/SalaryQuickResults';
import { SalarySEOContent } from '@/components/molecules/SalarySEOContent';
import { CalculatorContent } from '@/components/organisms/CalculatorContent';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { calculateTax, type TaxCalculationResults } from '@/lib/taxCalculator';
import { cn } from '@/lib/utils';
import { useCalculatorStore } from '@/store/calculatorStore';

interface SalaryCalculatorPageProps {
  salary: number;
  isHighPriority?: boolean;
}

export function SalaryCalculatorPage({ salary }: SalaryCalculatorPageProps) {
  const [results, setResults] = useState<TaxCalculationResults | null>(null);
  const setSalary = useCalculatorStore((state) => state.setSalary);
  const calculate = useCalculatorStore((state) => state.calculate);

  // Calculate results immediately on mount
  useEffect(() => {
    const quickResults = calculateTax({
      salary: salary,
      payPeriod: 'annually',
      taxYear: '2025-2026',
      taxCode: '1257L',
      isScottish: false,
      isMarried: false,
      partnerGrossWage: 0,
      isBlind: false,
      payNoNI: false,
      studentLoanPlans: 'none',
      pensionContribution: 0,
      pensionContributionType: 'percentage',
      niCategory: 'A',
      hoursPerWeek: 37.5,
    });
    setResults(quickResults);

    // Also set in store for the full calculator
    setSalary(salary);
    calculate();
  }, [salary, setSalary, calculate]);

  const formattedSalary = salary.toLocaleString('en-GB');

  // Generate comparison salaries
  const comparisons = [
    { amount: salary - 10000, label: '£10k less' },
    { amount: salary - 5000, label: '£5k less' },
    { amount: salary + 5000, label: '£5k more' },
    { amount: salary + 10000, label: '£10k more' },
  ].filter((c) => c.amount >= 20000 && c.amount <= 500000);

  if (!results) {
    return <div className='min-h-screen bg-background'>Loading...</div>;
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Hero Section with Instant Answer */}
      <section className={cn('relative overflow-hidden', 'py-8 sm:py-12')}>
        <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent' />
        <div
          className={cn('container relative mx-auto max-w-7xl', SPACING.PX_4, 'sm:px-6 lg:px-8')}
        >
          {/* Breadcrumbs */}
          <nav className={SPACING.MB_4} aria-label='Breadcrumb'>
            <ol
              className={cn(
                'flex items-center space-x-2 text-muted-foreground',
                TYPOGRAPHY.TEXT_SM
              )}
            >
              <li>
                <Link href='/' className='hover:text-primary'>
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href='/#calculator' className='hover:text-primary'>
                  Calculator
                </Link>
              </li>
              <li>/</li>
              <li className='font-medium text-foreground'>£{formattedSalary} Salary</li>
            </ol>
          </nav>

          <div className={cn('grid lg:grid-cols-2', SPACING.GAP_6)}>
            {/* Quick Results Card */}
            <SalaryQuickResults salary={salary} results={results} comparisons={comparisons} />

            {/* SEO Content */}
            <SalarySEOContent salary={salary} results={results} />
          </div>
        </div>
      </section>

      {/* Full Calculator Section */}
      <section className={cn('bg-muted/30', 'py-8 sm:py-12')}>
        <div className={cn('container mx-auto max-w-7xl', SPACING.PX_4, 'sm:px-6 lg:px-8')}>
          <div className={cn('text-center', SPACING.MB_8)}>
            <h2 className={cn('font-bold', SPACING.MB_2, TYPOGRAPHY.TEXT_2XL)}>
              Customize Your Calculation
            </h2>
            <p className='text-muted-foreground'>
              Add student loans, pension contributions, and more for a precise calculation
            </p>
          </div>
          <CalculatorContent />
        </div>
      </section>

      {/* Related Searches (SEO) */}
      <section className='py-8 sm:py-12'>
        <div className={cn('container mx-auto max-w-7xl', SPACING.PX_4, 'sm:px-6 lg:px-8')}>
          <h2 className={cn('font-semibold', SPACING.MB_4, TYPOGRAPHY.TEXT_XL)}>
            Related Salary Calculations
          </h2>
          <div className={cn('flex flex-wrap', SPACING.GAP_2)}>
            {[25000, 30000, 35000, 40000, 45000, 50000, 60000, 70000, 80000, 90000, 100000]
              .filter((s) => Math.abs(s - salary) > 5000 && Math.abs(s - salary) <= 30000)
              .map((relatedSalary) => (
                <Link
                  key={relatedSalary}
                  href={`/calculator/${relatedSalary}-after-tax`}
                  className={cn(
                    'rounded-md bg-muted transition-colors hover:bg-muted/80',
                    SPACING.PX_4,
                    SPACING.PY_2,
                    TYPOGRAPHY.TEXT_SM
                  )}
                >
                  £{relatedSalary.toLocaleString('en-GB')} salary
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
