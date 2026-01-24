// src/components/pages/SalaryCalculatorPage.tsx
// Main component for salary-specific landing pages

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SalaryQuickResults } from '@/components/molecules/SalaryQuickResults';
import { SalarySEOContent } from '@/components/molecules/SalarySEOContent';
import { CalculatorContent } from '@/components/organisms/CalculatorContent';
import { StructuredData } from '@/components/organisms/StructuredData';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { calculateTax, type TaxCalculationResults } from '@/lib/taxCalculator';
import { cn } from '@/lib/utils';
import { useCalculatorStore } from '@/store/calculatorStore';

// Blog posts that exist for specific salaries
const SALARY_BLOG_POSTS: Record<number, { slug: string; title: string }> = {
  40000: {
    slug: 'what-40k-salary-actually-looks-like-uk-2025',
    title: 'What a £40k Salary Actually Looks Like',
  },
  50000: {
    slug: 'what-50k-salary-actually-looks-like-uk-2025',
    title: 'What a £50k Salary Actually Looks Like',
  },
  60000: {
    slug: 'what-60k-salary-actually-looks-like-uk-2025',
    title: 'What a £60k Salary Actually Looks Like',
  },
  70000: {
    slug: 'what-70k-salary-actually-looks-like-uk-2025',
    title: 'What a £70k Salary Actually Looks Like',
  },
  80000: {
    slug: 'what-80k-salary-actually-looks-like-uk-2025',
    title: 'What a £80k Salary Actually Looks Like',
  },
  100000: {
    slug: 'what-100k-salary-actually-looks-like-uk-2025',
    title: 'What a £100k Salary Actually Looks Like',
  },
};

// Generate salary-specific FAQs
function generateSalaryFAQs(salary: number, results: TaxCalculationResults) {
  const formattedSalary = salary.toLocaleString('en-GB');
  const faqs = [
    {
      question: `How much tax do I pay on a £${formattedSalary} salary in the UK?`,
      answer: `On a £${formattedSalary} salary in the UK for 2025-26, you pay £${results.incomeTax.annually.toLocaleString('en-GB')} in income tax and £${results.nationalInsurance.annually.toLocaleString('en-GB')} in National Insurance, leaving you with £${results.netPay.annually.toLocaleString('en-GB')} take-home pay per year.`,
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
      answer: `At £${formattedSalary}, you lose £1 of Personal Allowance for every £2 earned over £100,000. This creates an effective 60% marginal tax rate between £100,000 and £125,140. Consider pension contributions to reduce your adjusted net income below £100,000.`,
    });
  }

  return faqs;
}

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

  // Generate structured data for SEO
  const breadcrumbItems = [
    { name: 'Home', url: 'https://payetax.co.uk/' },
    { name: 'Calculator', url: 'https://payetax.co.uk/#calculator' },
    {
      name: `£${formattedSalary} Salary`,
      url: `https://payetax.co.uk/calculator/${salary}-after-tax`,
    },
  ];

  const salaryFAQs = generateSalaryFAQs(salary, results);

  // Find related blog post for this salary
  const relatedBlogPost = SALARY_BLOG_POSTS[salary];

  // Find nearby salary blog posts (within £20k range)
  const nearbyBlogPosts = Object.entries(SALARY_BLOG_POSTS)
    .filter(([s]) => {
      const blogSalary = parseInt(s, 10);
      return blogSalary !== salary && Math.abs(blogSalary - salary) <= 20000;
    })
    .slice(0, 3)
    .map(([, post]) => post);

  return (
    <div className='min-h-screen bg-background'>
      {/* Structured Data for SEO */}
      <StructuredData type='breadcrumb' breadcrumbs={breadcrumbItems} />
      <StructuredData type='faq' faqs={salaryFAQs} />
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

      {/* Related Reading (Blog Links) */}
      {(relatedBlogPost || nearbyBlogPosts.length > 0) && (
        <section className={cn('bg-muted/20', 'py-8 sm:py-12')}>
          <div className={cn('container mx-auto max-w-7xl', SPACING.PX_4, 'sm:px-6 lg:px-8')}>
            <h2 className={cn('font-semibold', SPACING.MB_4, TYPOGRAPHY.TEXT_XL)}>
              Related Reading
            </h2>
            <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3')}>
              {relatedBlogPost && (
                <Link
                  href={`/blog/${relatedBlogPost.slug}`}
                  className={cn(
                    'rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50',
                    'block'
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
                    'rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50',
                    'block'
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
                    'rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50',
                    'block'
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
