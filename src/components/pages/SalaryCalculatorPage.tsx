// src/components/pages/SalaryCalculatorPage.tsx
// Main component for salary-specific landing pages
//
// Architecture note: `results` is frozen to `initialResults` intentionally for SEO.
// Structured data uses the SSR snapshot for deterministic indexing by Googlebot.
// The interactive calculator (CalculatorContent) uses store state separately.

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { SalaryQuickResults } from '@/components/molecules/SalaryQuickResults';
import { SalarySEOContent } from '@/components/molecules/SalarySEOContent';
import { CalculatorContent } from '@/components/organisms/CalculatorContent';
import { StructuredData } from '@/components/organisms/StructuredData';
import { SPACING, SURFACES, TYPOGRAPHY } from '@/constants/designTokens';
import { TAX_YEARS } from '@/constants/taxRates';

// Current tax year is the first in the TAX_YEARS array (newest first)
const CURRENT_TAX_YEAR = TAX_YEARS[0] ?? '2025-2026';

import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { cn } from '@/lib/utils';
import { useCalculatorStore } from '@/store/calculatorStore';

/** Format tax year for display (e.g., "2025-2026" -> "2025-26") */
function formatTaxYearDisplay(taxYear: string): string {
  const [start, end] = taxYear.split('-');
  return `${start}-${end?.slice(-2) ?? ''}`;
}

// Blog posts that exist for specific salaries
const SALARY_BLOG_POSTS = new Map<number, { slug: string; title: string }>([
  [
    40000,
    {
      slug: 'what-40k-salary-actually-looks-like-uk-2025',
      title: 'What a £40k Salary Actually Looks Like',
    },
  ],
  [
    50000,
    {
      slug: 'what-50k-salary-actually-looks-like-uk-2025',
      title: 'What a £50k Salary Actually Looks Like',
    },
  ],
  [
    60000,
    {
      slug: 'what-60k-salary-actually-looks-like-uk-2025',
      title: 'What a £60k Salary Actually Looks Like',
    },
  ],
  [
    70000,
    {
      slug: 'what-70k-salary-actually-looks-like-uk-2025',
      title: 'What a £70k Salary Actually Looks Like',
    },
  ],
  [
    80000,
    {
      slug: 'what-80k-salary-actually-looks-like-uk-2025',
      title: 'What an £80k Salary Actually Looks Like',
    },
  ],
  [
    100000,
    {
      slug: 'what-100k-salary-actually-looks-like-uk-2025',
      title: 'What a £100k Salary Actually Looks Like',
    },
  ],
]);

// Generate salary-specific FAQs
function generateSalaryFAQs(
  salary: number,
  results: TaxCalculationResults,
  taxYearDisplay: string,
) {
  const formattedSalary = salary.toLocaleString('en-GB');
  const faqs = [
    {
      question: `How much tax do I pay on a £${formattedSalary} salary in the UK?`,
      answer: `On a £${formattedSalary} salary in the UK for ${taxYearDisplay}, you pay £${results.incomeTax.annually.toLocaleString('en-GB')} in income tax and £${results.nationalInsurance.annually.toLocaleString('en-GB')} in National Insurance, leaving you with £${results.netPay.annually.toLocaleString('en-GB')} take-home pay per year.`,
    },
    {
      question: `What is the monthly take-home pay on £${formattedSalary}?`,
      answer: `With a gross salary of £${formattedSalary} per year, your monthly take-home pay is £${results.netPay.monthly.toLocaleString('en-GB')} after tax and National Insurance deductions.`,
    },
    {
      question: `What is the effective tax rate on £${formattedSalary}?`,
      answer: `The effective tax rate on a £${formattedSalary} salary is ${(((results.incomeTax.annually + results.nationalInsurance.annually) / salary) * 100).toFixed(1)}%. This includes both income tax and National Insurance contributions.`,
    },
  ];

  // Add tax trap FAQ for £100k-£125k earners
  if (salary >= 100000 && salary <= 125140) {
    faqs.push({
      question: `How does the £100k tax trap affect a £${formattedSalary} salary?`,
      answer: `At £${formattedSalary}, you lose £1 of Personal Allowance for every £2 earned over £100,000. This creates an effective marginal tax rate of around 60% between £100,000 and £125,140 for most employees in England, Wales, and Northern Ireland. The impact depends on your circumstances.`,
    });
  }

  return faqs;
}

interface SalaryCalculatorPageProps {
  salary: number;
  isHighPriority?: boolean;
  initialResults: TaxCalculationResults; // SSR: passed from server for Googlebot
}

export function SalaryCalculatorPage({ salary, initialResults }: SalaryCalculatorPageProps) {
  // Use SSR results immediately - no "Loading..." state for Googlebot
  // Note: This is intentionally frozen for deterministic structured data indexing
  const [results] = useState<TaxCalculationResults>(initialResults);
  const setSalary = useCalculatorStore((state) => state.setSalary);
  const calculate = useCalculatorStore((state) => state.calculate);

  // Sync store on mount for interactive calculator
  useEffect(() => {
    setSalary(salary);
    // Use queueMicrotask to ensure calculate reads updated salary
    queueMicrotask(() => calculate());
  }, [salary, setSalary, calculate]);

  const formattedSalary = salary.toLocaleString('en-GB');
  const taxYearDisplay = formatTaxYearDisplay(CURRENT_TAX_YEAR);

  // Generate comparison salaries
  const comparisons = useMemo(
    () =>
      [
        { amount: salary - 10000, label: '£10k less' },
        { amount: salary - 5000, label: '£5k less' },
        { amount: salary + 5000, label: '£5k more' },
        { amount: salary + 10000, label: '£10k more' },
      ].filter((c) => c.amount >= 20000 && c.amount <= 500000),
    [salary],
  );

  // Generate structured data for SEO (use #tax-calculator to match homepage)
  const breadcrumbItems = [
    { name: 'Home', url: 'https://payetax.co.uk/' },
    { name: 'Calculator', url: 'https://payetax.co.uk/#tax-calculator' },
    {
      name: `£${formattedSalary} Salary`,
      url: `https://payetax.co.uk/calculator/${salary}-after-tax`,
    },
  ];

  // Memoize FAQ generation
  const salaryFAQs = useMemo(
    () => generateSalaryFAQs(salary, results, taxYearDisplay),
    [salary, results, taxYearDisplay],
  );

  // Find related blog post for this salary
  const relatedBlogPost = SALARY_BLOG_POSTS.get(salary);

  // Find nearby salary blog posts (within £20k range)
  const nearbyBlogPosts = useMemo(
    () =>
      Array.from(SALARY_BLOG_POSTS.entries())
        .filter(([blogSalary]) => blogSalary !== salary && Math.abs(blogSalary - salary) <= 20000)
        .slice(0, 3)
        .map(([, post]) => post),
    [salary],
  );

  return (
    <div className='min-h-screen bg-background'>
      {/* Structured Data for SEO */}
      <StructuredData type='breadcrumb' breadcrumbs={breadcrumbItems} />
      <StructuredData type='faq' faqs={salaryFAQs} />
      <StructuredData type='calculator' />
      <StructuredData type='dataset' />
      <StructuredData
        type='salarycalculation'
        salaryData={{
          salary,
          netPay: results.netPay.annually,
          incomeTax: results.incomeTax.annually,
          nationalInsurance: results.nationalInsurance.annually,
          url: `https://payetax.co.uk/calculator/${salary}-after-tax`,
        }}
      />

      {/* Hero Section with Instant Answer */}
      <section className={cn('relative overflow-hidden', 'py-8 sm:py-12')}>
        <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent' />
        <div className={cn('container relative mx-auto max-w-7xl', SPACING.PX_RESPONSIVE)}>
          {/* Breadcrumbs */}
          <nav className={SPACING.MB_4} aria-label='Breadcrumb'>
            <ol
              className={cn(
                'flex items-center space-x-2 text-muted-foreground',
                TYPOGRAPHY.TEXT_SM,
              )}
            >
              <li>
                <Link href='/' className='hover:text-primary'>
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href='/#tax-calculator' className='hover:text-primary'>
                  Calculator
                </Link>
              </li>
              <li>/</li>
              <li className='font-medium text-foreground'>£{formattedSalary} Salary</li>
            </ol>
          </nav>

          {/* H1 for SEO */}
          <h1
            className={cn(
              'font-bold font-display tracking-tight',
              TYPOGRAPHY.TEXT_3XL,
              'sm:text-4xl',
            )}
          >
            £{formattedSalary} After Tax UK {taxYearDisplay}
          </h1>
          <p className={cn('text-muted-foreground', SPACING.MB_8)}>
            UK take-home pay calculator for {taxYearDisplay} tax year
          </p>
          <div className='mb-8 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-amber-200 text-xs'>
            <p>
              <strong>Disclaimer:</strong> For illustrative purposes only. Not financial or tax
              advice. Consult a qualified accountant for advice specific to your situation. Based on
              HMRC rates for {taxYearDisplay} which may change.
            </p>
          </div>

          <div className='grid gap-8 lg:grid-cols-[400px_1fr] lg:items-start'>
            {/* Quick Results Card */}
            <SalaryQuickResults salary={salary} results={results} comparisons={comparisons} />

            {/* SEO Content */}
            <div className={cn(SURFACES.CARD_ROUNDED)}>
              <SalarySEOContent salary={salary} results={results} />
            </div>
          </div>
        </div>
      </section>

      {/* Full Calculator Section */}
      <section className={cn('bg-muted/30', 'py-8 sm:py-12')}>
        <div className={cn('container mx-auto max-w-7xl', SPACING.PX_RESPONSIVE)}>
          <div className={cn('text-center', SPACING.MB_8)}>
            <h2 className={cn('font-bold', SPACING.MB_2, TYPOGRAPHY.TEXT_2XL)}>
              Customize Your Calculation
            </h2>
            <p className='text-muted-foreground'>
              Add student loans, pension contributions, and more for a more detailed estimate
            </p>
          </div>
          <CalculatorContent />
        </div>
      </section>

      {/* Related Reading (Blog Links) */}
      {(relatedBlogPost || nearbyBlogPosts.length > 0) && (
        <section className={cn('bg-muted/20', 'py-8 sm:py-12')}>
          <div className={cn('container mx-auto max-w-7xl', SPACING.PX_RESPONSIVE)}>
            <h2 className={cn('font-semibold', SPACING.MB_4, TYPOGRAPHY.TEXT_XL)}>
              Related Reading
            </h2>
            <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3')}>
              {relatedBlogPost && (
                <Link
                  href={`/blog/${relatedBlogPost.slug}`}
                  className={cn(
                    SURFACES.SHAPE_ROUNDED_LG,
                    'block border border-border bg-card p-4 transition-colors hover:bg-muted/50',
                  )}
                >
                  <span className={cn('font-medium text-primary', TYPOGRAPHY.TEXT_SM)}>
                    Featured Guide
                  </span>
                  <h3 className={cn('font-semibold', SPACING.MT_1, TYPOGRAPHY.TEXT_BASE)}>
                    {relatedBlogPost.title}
                  </h3>
                  <p className={cn('text-muted-foreground', SPACING.MT_1, TYPOGRAPHY.TEXT_SM)}>
                    Detailed breakdown of a £{formattedSalary} salary in the UK
                  </p>
                </Link>
              )}
              {nearbyBlogPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className={cn(
                    SURFACES.SHAPE_ROUNDED_LG,
                    'block border border-border bg-card p-4 transition-colors hover:bg-muted/50',
                  )}
                >
                  <h3 className={cn('font-semibold', TYPOGRAPHY.TEXT_BASE)}>{post.title}</h3>
                  <p className={cn('text-muted-foreground', SPACING.MT_1, TYPOGRAPHY.TEXT_SM)}>
                    Read the full guide
                  </p>
                </Link>
              ))}
              {/* Additional tax tips link for high earners */}
              {salary >= 100000 && (
                <Link
                  href='/blog/100k-tax-trap-avoid-60-percent-tax-2025'
                  className={cn(
                    SURFACES.SHAPE_ROUNDED_LG,
                    'block border border-border bg-card p-4 transition-colors hover:bg-muted/50',
                  )}
                >
                  <span className={cn('font-medium text-destructive', TYPOGRAPHY.TEXT_SM)}>
                    Tax Planning
                  </span>
                  <h3 className={cn('font-semibold', SPACING.MT_1, TYPOGRAPHY.TEXT_BASE)}>
                    The £100k Tax Trap: How to Avoid 60% Tax
                  </h3>
                  <p className={cn('text-muted-foreground', SPACING.MT_1, TYPOGRAPHY.TEXT_SM)}>
                    Essential reading for high earners
                  </p>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
