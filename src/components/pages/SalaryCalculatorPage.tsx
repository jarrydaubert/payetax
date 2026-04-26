// src/components/pages/SalaryCalculatorPage.tsx
// Main component for salary-specific landing pages
//
// Architecture note: `results` is frozen to `initialResults` intentionally for SEO.
// Structured data is emitted from the parent Server Component using the same SSR snapshot.
// The interactive calculator (CalculatorContent) uses store state separately.

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { SalaryQuickResults } from '@/components/molecules/SalaryQuickResults';
import { SalarySEOContent } from '@/components/molecules/SalarySEOContent';
import { CalculatorContent } from '@/components/organisms/CalculatorContent';
import { NewsletterCTA } from '@/components/organisms/NewsletterCTA';
import { SPACING, SURFACES, TYPOGRAPHY } from '@/constants/designTokens';
import { formatIsoDateForDisplay, RATES_LAST_VERIFIED } from '@/constants/freshness';
import { CURRENT_TAX_YEAR, formatTaxYearDisplay } from '@/constants/taxRates';
import { getSalaryComparisonLinks } from '@/lib/seo/salaryPages';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { cn } from '@/lib/utils';
import { useCalculatorStore } from '@/store/calculatorStore';

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

const EVERGREEN_TAX_GUIDES = [
  {
    slug: 'uk-tax-calculator-2025-complete-guide',
    title: 'UK Tax Calculator: Complete Guide',
  },
  {
    slug: 'how-much-tax-will-i-pay-uk-2025',
    title: 'How Much Tax Will I Pay?',
  },
  {
    slug: 'understanding-the-uk-tax-system-2025',
    title: 'Understanding the UK Tax System',
  },
  {
    slug: 'higher-rate-taxpayer-guide-uk-2025',
    title: 'Higher Rate Taxpayer Guide',
  },
  {
    slug: 'marriage-allowance-uk-2025-guide',
    title: 'Marriage Allowance Guide',
  },
];

const SALARY_SCENARIO_LINKS = new Map<number, Array<{ slug: string; title: string }>>([
  [
    40000,
    [
      {
        slug: 'student-loan-plan-2-40k',
        title: 'Plan 2 Student Loan at £40k',
      },
    ],
  ],
  [
    60000,
    [
      {
        slug: 'scotland-vs-england-60k',
        title: 'Scotland vs England Tax at £60k',
      },
    ],
  ],
]);

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
  const taxYearDisplay = formatTaxYearDisplay(CURRENT_TAX_YEAR, {
    separator: '-',
    shortEndYear: true,
  });
  const ratesVerifiedDisplay = formatIsoDateForDisplay(RATES_LAST_VERIFIED);

  const comparisons = useMemo(() => getSalaryComparisonLinks(salary), [salary]);

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
  const evergreenBlogPosts = useMemo(() => {
    const existingSlugs = new Set([
      relatedBlogPost?.slug,
      ...nearbyBlogPosts.map((post) => post.slug),
    ]);

    return EVERGREEN_TAX_GUIDES.filter((post) => !existingSlugs.has(post.slug)).slice(0, 3);
  }, [nearbyBlogPosts, relatedBlogPost]);
  const relatedScenarioLinks = SALARY_SCENARIO_LINKS.get(salary) ?? [];

  return (
    <div className='min-h-screen bg-background'>
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
                <Link href='/' className='hover:text-primary'>
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
          <p className={cn('text-muted-foreground', SPACING.MB_2)}>
            UK take-home pay calculator for {taxYearDisplay} tax year
          </p>
          <p className={cn('text-muted-foreground/80 text-xs', SPACING.MB_8)}>
            Rates verified for {taxYearDisplay} (last checked {ratesVerifiedDisplay}).
          </p>
          <div className='mb-8 rounded-lg border border-warning/30 bg-warning/10 p-3 text-warning text-xs'>
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
      {(relatedBlogPost ||
        nearbyBlogPosts.length > 0 ||
        evergreenBlogPosts.length > 0 ||
        relatedScenarioLinks.length > 0) && (
        <section className={cn('bg-muted/20', 'py-8 sm:py-12')}>
          <div className={cn('container mx-auto max-w-7xl', SPACING.PX_RESPONSIVE)}>
            <h2 className={cn('font-semibold', SPACING.MB_4, TYPOGRAPHY.TEXT_XL)}>
              Related Reading
            </h2>
            <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3')}>
              {relatedScenarioLinks.map((scenario) => (
                <Link
                  key={scenario.slug}
                  href={`/scenarios/${scenario.slug}`}
                  className={cn(
                    SURFACES.SHAPE_ROUNDED_LG,
                    'block border border-border bg-card p-4 transition-colors hover:bg-muted/50',
                  )}
                >
                  <span className={cn('font-medium text-primary', TYPOGRAPHY.TEXT_SM)}>
                    Scenario
                  </span>
                  <h3 className={cn('font-semibold', SPACING.MT_1, TYPOGRAPHY.TEXT_BASE)}>
                    {scenario.title}
                  </h3>
                  <p className={cn('text-muted-foreground', SPACING.MT_1, TYPOGRAPHY.TEXT_SM)}>
                    Explore a pre-filled example for this salary.
                  </p>
                </Link>
              ))}
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
              {evergreenBlogPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className={cn(
                    SURFACES.SHAPE_ROUNDED_LG,
                    'block border border-border bg-card p-4 transition-colors hover:bg-muted/50',
                  )}
                >
                  <span className={cn('font-medium text-primary', TYPOGRAPHY.TEXT_SM)}>Guide</span>
                  <h3 className={cn('font-semibold', SPACING.MT_1, TYPOGRAPHY.TEXT_BASE)}>
                    {post.title}
                  </h3>
                  <p className={cn('text-muted-foreground', SPACING.MT_1, TYPOGRAPHY.TEXT_SM)}>
                    Build confidence in the tax rules behind the result.
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

      <section className={cn('bg-muted/30', 'py-8 sm:py-12')}>
        <div className={cn('container mx-auto max-w-4xl', SPACING.PX_RESPONSIVE)}>
          <NewsletterCTA
            title='Get UK Tax Updates by Email'
            description='HMRC updates, practical salary-tax tips, and important deadlines.'
          />
        </div>
      </section>
    </div>
  );
}
