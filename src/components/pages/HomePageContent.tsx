// src/components/pages/HomePageContent.tsx
'use client';

import { BookOpen, Calculator, FileText } from 'lucide-react';
import Link from 'next/link';
import { memo, useEffect, useRef, useTransition } from 'react';
import { CalculatorContainer } from '@/components/organisms/CalculatorContainer';
import { CalculatorContent } from '@/components/organisms/CalculatorContent';
import SimpleHero from '@/components/organisms/SimpleHero';

const HomePageContent = memo(function HomePageContent() {
  const [_isPending, startTransition] = useTransition();
  const calculatorRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Initialize calculator store on mount
    const { init } = require('@/store/calculatorStore').useCalculatorStore.getState();
    init();
  }, []);

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
    <main className='flex min-h-screen flex-col'>
      <SimpleHero onScrollToCalculator={handleScrollToCalculator} />

      {/* biome-ignore lint/correctness/useUniqueElementIds: Static ID required for deep linking from navbar /#tax-calculator */}
      <section id='tax-calculator' ref={calculatorRef} className='py-8 lg:py-12'>
        <CalculatorContainer />
      </section>

      {/* SEO-optimized content for Answer Engine Optimization */}
      <section className='container mx-auto px-2 pb-16 sm:px-4'>
        <CalculatorContent />
      </section>

      {/* UK Tax System Overview - SEO Enhancement with semantic keywords */}
      <section className='container mx-auto max-w-4xl px-4 py-12'>
        <h2 className='mb-6 text-center font-bold text-3xl'>
          Understanding the UK Tax System
        </h2>
        <div className='prose prose-lg mx-auto dark:prose-invert'>
          <p className='text-center text-foreground/90 text-lg leading-relaxed'>
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
        <div className='mt-10 grid gap-6 md:grid-cols-3'>
          <div className='rounded-lg border bg-card p-6 text-center'>
            <h3 className='mb-2 font-semibold text-lg'>Personal Allowance</h3>
            <p className='font-bold text-3xl text-primary'>£12,570</p>
            <p className='mt-2 text-muted-foreground text-sm'>Tax-free earnings for 2025/26</p>
          </div>
          <div className='rounded-lg border bg-card p-6 text-center'>
            <h3 className='mb-2 font-semibold text-lg'>Basic Rate</h3>
            <p className='font-bold text-3xl text-primary'>20%</p>
            <p className='mt-2 text-muted-foreground text-sm'>On income £12,571 - £50,270</p>
          </div>
          <div className='rounded-lg border bg-card p-6 text-center'>
            <h3 className='mb-2 font-semibold text-lg'>Higher Rate</h3>
            <p className='font-bold text-3xl text-primary'>40%</p>
            <p className='mt-2 text-muted-foreground text-sm'>On income £50,271 - £125,140</p>
          </div>
        </div>
      </section>

      {/* Popular Salary Calculators - Internal linking for SEO */}
      <section className='container mx-auto max-w-7xl px-4 py-16'>
        <h2 className='mb-2 text-center font-bold text-3xl'>Popular Salary Calculators</h2>
        <p className='mb-8 text-center text-muted-foreground'>
          Calculate exact take-home pay for common UK salaries
        </p>
        <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
          {[
            { salary: 30000, label: '£30k' },
            { salary: 40000, label: '£40k' },
            { salary: 50000, label: '£50k' },
            { salary: 60000, label: '£60k' },
            { salary: 70000, label: '£70k' },
            { salary: 80000, label: '£80k' },
            { salary: 90000, label: '£90k' },
            { salary: 100000, label: '£100k' },
            { salary: 110000, label: '£110k' },
            { salary: 120000, label: '£120k' },
          ].map(({ salary, label }) => (
            <Link
              key={salary}
              href={`/calculator/${salary}-after-tax`}
              className='group flex flex-col items-center rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-md'
            >
              <Calculator className='mb-2 size-5 text-primary' />
              <span className='font-semibold text-foreground group-hover:text-primary'>
                {label} Salary
              </span>
              <span className='text-muted-foreground text-xs'>After Tax</span>
            </Link>
          ))}
        </div>
        <div className='mt-6 text-center'>
          <p className='text-muted-foreground text-sm'>
            View detailed breakdowns including income tax, National Insurance, and monthly take-home
            pay
          </p>
        </div>
      </section>

      {/* Featured Tax Resources - Internal linking for SEO */}
      <section className='container mx-auto max-w-7xl px-4 py-16'>
        <h2 className='mb-2 text-center font-bold text-3xl'>Popular Tax Guides</h2>
        <p className='mb-8 text-center text-muted-foreground'>
          Expert guides to help you understand UK tax calculations
        </p>
        <div className='grid gap-6 md:grid-cols-3'>
          {/* Calculator Guide */}
          <Link
            href='/blog/uk-tax-calculator-2025-complete-guide'
            className='group block rounded-lg border bg-card p-6 transition-all hover:shadow-lg'
          >
            <div className='mb-4 flex items-center gap-3'>
              <div className='rounded-full bg-primary/10 p-3'>
                <Calculator className='size-6 text-primary' />
              </div>
              <h3 className='font-semibold text-lg group-hover:text-primary'>
                UK Tax Calculator Guide
              </h3>
            </div>
            <p className='text-muted-foreground text-sm'>
              Complete guide to using our tax calculator for accurate PAYE calculations with
              official HMRC rates.
            </p>
          </Link>

          {/* Tax Examples */}
          <Link
            href='/blog/how-much-tax-will-i-pay-uk-2025'
            className='group block rounded-lg border bg-card p-6 transition-all hover:shadow-lg'
          >
            <div className='mb-4 flex items-center gap-3'>
              <div className='rounded-full bg-primary/10 p-3'>
                <FileText className='size-6 text-primary' />
              </div>
              <h3 className='font-semibold text-lg group-hover:text-primary'>
                How Much Tax Will I Pay?
              </h3>
            </div>
            <p className='text-muted-foreground text-sm'>
              Real salary examples showing exact tax calculations for £20k, £30k, £50k, and £100k+
              UK earners.
            </p>
          </Link>

          {/* Tax Codes */}
          <Link
            href='/blog/understanding-uk-tax-codes'
            className='group block rounded-lg border bg-card p-6 transition-all hover:shadow-lg'
          >
            <div className='mb-4 flex items-center gap-3'>
              <div className='rounded-full bg-primary/10 p-3'>
                <BookOpen className='size-6 text-primary' />
              </div>
              <h3 className='font-semibold text-lg group-hover:text-primary'>
                Understanding Tax Codes
              </h3>
            </div>
            <p className='text-muted-foreground text-sm'>
              Learn what your tax code means and how it affects your take-home pay. Decode 1257L,
              BR, and more.
            </p>
          </Link>
        </div>
      </section>

      {/* Browse Tax Topics - Internal linking to blog categories */}
      <section className='container mx-auto max-w-7xl px-4 py-16'>
        <h2 className='mb-2 text-center font-bold text-3xl'>Browse Tax Topics</h2>
        <p className='mb-8 text-center text-muted-foreground'>
          Explore our comprehensive guides organized by topic
        </p>
        <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3'>
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
              className='group block rounded-lg border bg-card p-5 transition-all hover:border-primary hover:shadow-md'
            >
              <h3 className='mb-2 font-semibold text-foreground text-lg group-hover:text-primary'>
                {category.name}
              </h3>
              <p className='text-muted-foreground text-sm'>{category.description}</p>
            </Link>
          ))}
        </div>
        <div className='mt-6 text-center'>
          <Link href='/blog' className='text-primary hover:underline'>
            View all articles →
          </Link>
        </div>
      </section>
    </main>
  );
});

export default HomePageContent;
