// src/components/pages/HomePageContent.tsx
'use client';

import { BookOpen, Calculator, FileText } from 'lucide-react';
import Link from 'next/link';
import { memo, useEffect, useRef, useTransition } from 'react';
import { PopularSalaryLinks } from '@/components/molecules/PopularSalaryLinks';
import SimpleHero from '@/components/molecules/SimpleHero';
import { CalculatorContainer } from '@/components/organisms/CalculatorContainer';
import { CalculatorContent } from '@/components/organisms/CalculatorContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { TAX_RATES } from '@/constants/taxRates';
import { cn } from '@/lib/utils';
import { useCalculatorStore } from '@/store/calculatorStore';

// Current tax year rates (single source of truth from constants)
const CURRENT_RATES = TAX_RATES['2025-2026'];
const PERSONAL_ALLOWANCE = CURRENT_RATES.personalAllowance;
const BASIC_RATE = CURRENT_RATES.bands[0].rate;
const HIGHER_RATE = CURRENT_RATES.bands[1].rate;
const BASIC_RATE_THRESHOLD = CURRENT_RATES.bands[0].threshold + PERSONAL_ALLOWANCE;
const HIGHER_RATE_THRESHOLD = CURRENT_RATES.bands[1].threshold;

const HomePageContent = memo(function HomePageContent() {
  const [, startTransition] = useTransition();
  const calculatorRef = useRef<HTMLElement>(null);
  const init = useCalculatorStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  const handleScrollToCalculator = () => {
    startTransition(() => {
      if (calculatorRef.current) {
        calculatorRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  };

  return (
    <div className='flex min-h-screen flex-col'>
      <SimpleHero onScrollToCalculator={handleScrollToCalculator} />

      {/* biome-ignore lint/correctness/useUniqueElementIds: Static ID required for deep linking from navbar /#tax-calculator */}
      <section
        id='tax-calculator'
        ref={calculatorRef}
        className={cn(SPACING.PY_12, 'md:py-16 lg:py-20')}
      >
        <CalculatorContainer />
      </section>

      {/* SEO-optimized content for Answer Engine Optimization */}
      <section className={cn('container mx-auto pb-12 md:pb-16', SPACING.PX_4, 'md:px-6')}>
        <CalculatorContent />
      </section>

      {/* UK Tax System Overview - SEO Enhancement with semantic keywords */}
      <section className={cn('bg-muted/30', SPACING.PY_12, 'md:py-16 lg:py-20')}>
        <div className={cn('container mx-auto max-w-4xl', SPACING.PX_4, 'md:px-6')}>
          <h2
            className={cn(
              'text-center font-bold tracking-tight',
              SPACING.MB_6,
              TYPOGRAPHY.TEXT_3XL,
              `md:${TYPOGRAPHY.TEXT_4XL}`
            )}
          >
            Understanding the UK Tax System
          </h2>
          <div className='prose prose-lg dark:prose-invert mx-auto'>
            <p className='text-center text-base text-foreground/90 leading-relaxed md:text-lg'>
              Her Majesty's Revenue and Customs (HMRC) administers the UK tax system, which includes
              income tax rates, National Insurance, capital gains tax, and inheritance tax.
              Understanding your effective tax rate and tax band is crucial for financial planning.
            </p>
            <p className='text-center text-foreground/80 leading-relaxed'>
              Whether you're a higher rate taxpayer filing a tax return or simply calculating your
              take-home pay, our calculator uses official HMRC rates to help you understand the UK
              tax system. From basic income tax rates to complex scenarios involving tax revenue and
              tax reliefs, we provide accurate calculations for all taxpayers.
            </p>
          </div>

          {/* Tax Rates Quick Reference */}
          <div className={cn('grid md:grid-cols-3', 'mt-10', SPACING.GAP_4, 'md:gap-6')}>
            <Card className='text-center'>
              <CardHeader>
                <CardTitle className='text-lg'>Personal Allowance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='font-bold text-3xl text-primary'>
                  £{PERSONAL_ALLOWANCE.toLocaleString()}
                </p>
                <CardDescription className={SPACING.MT_2}>
                  Tax-free earnings for 2025/26
                </CardDescription>
              </CardContent>
            </Card>
            <Card className='text-center'>
              <CardHeader>
                <CardTitle className='text-lg'>Basic Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='font-bold text-3xl text-primary'>{BASIC_RATE}%</p>
                <CardDescription className={SPACING.MT_2}>
                  On income £{(PERSONAL_ALLOWANCE + 1).toLocaleString()} - £
                  {BASIC_RATE_THRESHOLD.toLocaleString()}
                </CardDescription>
              </CardContent>
            </Card>
            <Card className='text-center'>
              <CardHeader>
                <CardTitle className='text-lg'>Higher Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='font-bold text-3xl text-primary'>{HIGHER_RATE}%</p>
                <CardDescription className={SPACING.MT_2}>
                  On income £{(BASIC_RATE_THRESHOLD + 1).toLocaleString()} - £
                  {HIGHER_RATE_THRESHOLD.toLocaleString()}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Salary Calculators */}
      <PopularSalaryLinks />

      {/* Featured Tax Resources - Internal linking for SEO */}
      <section className={cn('bg-muted/30', SPACING.PY_12, 'md:py-16 lg:py-20')}>
        <div className={cn('container mx-auto max-w-7xl', SPACING.PX_4, 'md:px-6')}>
          <div className={cn('text-center', SPACING.MB_12)}>
            <h2
              className={cn(
                'font-bold tracking-tight',
                SPACING.MB_3,
                TYPOGRAPHY.TEXT_3XL,
                `md:${TYPOGRAPHY.TEXT_4XL}`
              )}
            >
              Popular Tax Guides
            </h2>
            <Separator className='mx-auto my-4 w-24' />
            <p className='text-muted-foreground md:text-lg'>
              Expert guides to help you understand UK tax calculations
            </p>
          </div>
          <div className={cn('grid md:grid-cols-3', SPACING.GAP_4, 'md:gap-6')}>
            {/* Calculator Guide */}
            <Link
              href='/blog/uk-tax-calculator-2025-complete-guide'
              className={cn(
                'group block rounded-lg border bg-card transition-all hover:shadow-lg',
                SPACING.P_6
              )}
            >
              <div className={cn('flex items-center', SPACING.MB_4, SPACING.GAP_3)}>
                <div className={cn('rounded-full bg-primary/10', SPACING.P_3)}>
                  <Calculator className={`${ICON_SIZES.SIZE_6} text-primary`} aria-hidden='true' />
                </div>
                <p className='font-semibold text-lg group-hover:text-primary'>
                  UK Tax Calculator Guide
                </p>
              </div>
              <p className='text-muted-foreground text-sm'>
                Complete guide to using our tax calculator for accurate PAYE calculations with
                official HMRC rates.
              </p>
            </Link>

            {/* Tax Examples */}
            <Link
              href='/blog/how-much-tax-will-i-pay-uk-2025'
              className={cn(
                'group block rounded-lg border bg-card transition-all hover:shadow-lg',
                SPACING.P_6
              )}
            >
              <div className={cn('flex items-center', SPACING.MB_4, SPACING.GAP_3)}>
                <div className={cn('rounded-full bg-primary/10', SPACING.P_3)}>
                  <FileText className={`${ICON_SIZES.SIZE_6} text-primary`} aria-hidden='true' />
                </div>
                <p className='font-semibold text-lg group-hover:text-primary'>
                  How Much Tax Will I Pay?
                </p>
              </div>
              <p className='text-muted-foreground text-sm'>
                Real salary examples showing exact tax calculations for £20k, £30k, £50k, and £100k+
                UK earners.
              </p>
            </Link>

            {/* Tax Codes */}
            <Link
              href='/blog/understanding-uk-tax-codes'
              className={cn(
                'group block rounded-lg border bg-card transition-all hover:shadow-lg',
                SPACING.P_6
              )}
            >
              <div className={cn('flex items-center', SPACING.MB_4, SPACING.GAP_3)}>
                <div className={cn('rounded-full bg-primary/10', SPACING.P_3)}>
                  <BookOpen className={`${ICON_SIZES.SIZE_6} text-primary`} aria-hidden='true' />
                </div>
                <p className='font-semibold text-lg group-hover:text-primary'>
                  Understanding Tax Codes
                </p>
              </div>
              <p className='text-muted-foreground text-sm'>
                Learn what your tax code means and how it affects your take-home pay. Decode 1257L,
                BR, and more.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Browse Tax Topics - Internal linking to blog categories */}
      <section
        className={cn(
          'container mx-auto max-w-7xl',
          SPACING.PX_4,
          SPACING.PY_12,
          'md:px-6 md:py-16 lg:py-20'
        )}
      >
        <div className={cn('text-center', SPACING.MB_12)}>
          <h2
            className={cn(
              'font-bold tracking-tight',
              SPACING.MB_3,
              TYPOGRAPHY.TEXT_3XL,
              `md:${TYPOGRAPHY.TEXT_4XL}`
            )}
          >
            Browse Tax Topics
          </h2>
          <Separator className='mx-auto my-4 w-24' />
          <p className='text-muted-foreground md:text-lg'>
            Explore our comprehensive guides organized by topic
          </p>
        </div>
        <div className={cn('grid sm:grid-cols-2 md:grid-cols-3', SPACING.GAP_4, 'md:gap-6')}>
          {[
            {
              slug: 'tax-basics',
              name: 'Tax Basics',
              description: 'Essential guides for understanding UK taxation',
            },
            {
              slug: 'tax-tips',
              name: 'Tax Tips',
              description: 'Smart strategies to reduce your tax bill',
            },
            {
              slug: 'tax-changes',
              name: 'Tax Changes',
              description: 'Latest updates and changes to UK tax laws',
            },
            {
              slug: 'student-loans',
              name: 'Student Loans',
              description: 'Understanding loan repayments and thresholds',
            },
            {
              slug: 'personal-finance',
              name: 'Personal Finance',
              description: 'Money management and financial planning',
            },
            {
              slug: 'self-assessment',
              name: 'Self Assessment',
              description: 'Guides for filing your tax return',
            },
          ].map((category) => (
            <Link
              key={category.slug}
              href={`/blog/category/${category.slug}`}
              className={cn(
                'group block rounded-lg border bg-card transition-all hover:border-primary hover:shadow-md',
                'p-5'
              )}
            >
              <p
                className={cn(
                  'font-semibold text-foreground group-hover:text-primary',
                  SPACING.MB_2,
                  TYPOGRAPHY.TEXT_LG
                )}
              >
                {category.name}
              </p>
              <p className='text-muted-foreground text-sm'>{category.description}</p>
            </Link>
          ))}
        </div>
        <div className={cn('text-center', SPACING.MT_6)}>
          <Link href='/blog' className='text-primary hover:underline'>
            View all articles →
          </Link>
        </div>
      </section>
    </div>
  );
});

export default HomePageContent;
