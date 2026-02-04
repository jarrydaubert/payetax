// src/app/best-uk-tax-calculators/page.tsx
'use client';

import { ArrowRight, Award, Calculator, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { GradientText } from '@/components/atoms/GradientText';
import { Button } from '@/components/atoms/ui/button';
import { Card } from '@/components/atoms/ui/card';
import { ComparisonTable } from '@/components/molecules/ComparisonTable';
import { CompetitorCard, PayeTaxCard } from '@/components/molecules/CompetitorCard';
import { PageHero } from '@/components/molecules/PageHero';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { StructuredData } from '@/components/organisms/StructuredData';
import { ICON_SIZES, LAYOUT, SPACING, SURFACES, TYPOGRAPHY } from '@/constants/designTokens';
import { COMPETITORS } from '@/data/competitors';
import { SITE_URL } from '@/lib/metadata';
import { cn } from '@/lib/utils';

export default function BestUKTaxCalculatorsPage() {
  return (
    <>
      <StructuredData
        type='breadcrumb'
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: 'Best UK Tax Calculators', url: `${SITE_URL}/best-uk-tax-calculators` },
        ]}
      />
      <div className={LAYOUT.PAGE_WRAPPER}>
        {/* Hero Section */}
        <PageHero
          badge={{ icon: Award, text: 'Calculator Comparison' }}
          title={
            <>
              The Best{' '}
              <GradientText variant='brand-full' as='span'>
                UK Tax Calculators
              </GradientText>{' '}
              for 2026
            </>
          }
          subtitle={[
            "Looking for the most accurate UK tax calculator? We've compared the top options so you can choose the right tool for your needs.",
            'Honest reviews with no hidden agenda — just the facts.',
          ]}
        />

        {/* Quick Comparison Table */}
        <section className={LAYOUT.SECTION}>
          <div className={LAYOUT.CONTAINER}>
            <SectionHeading
              title='At-a-Glance Comparison'
              subtitle='See which features each calculator offers'
              align='center'
            />
            <div className={cn(SPACING.MT_8, 'overflow-hidden rounded-lg border border-border')}>
              <ComparisonTable competitors={COMPETITORS} highlightPayeTax />
            </div>
          </div>
        </section>

        {/* Who Should Use What */}
        <section className={LAYOUT.SECTION_TINTED_PRIMARY}>
          <div className={LAYOUT.CONTAINER}>
            <SectionHeading
              badge={{ icon: Users, text: 'Recommendations' }}
              title='Which Calculator is Right for You?'
              subtitle='Quick guide based on your needs'
              align='center'
            />
            <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-4', SPACING.MT_8)}>
              <Card className={cn(SURFACES.CARD_STANDARD, 'text-center')}>
                <div
                  className={cn(
                    'mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10',
                    SPACING.MB_4,
                  )}
                >
                  <Calculator className={cn(ICON_SIZES.SIZE_6, 'text-primary')} />
                </div>
                <h3 className={cn('font-bold', TYPOGRAPHY.TEXT_LG, SPACING.MB_2)}>Quick & Clean</h3>
                <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM, SPACING.MB_4)}>
                  Need focused results without distractions?
                </p>
                <p className={cn('font-semibold text-primary', TYPOGRAPHY.TEXT_SM)}>
                  → Use PayeTax
                </p>
              </Card>

              <Card className={cn(SURFACES.CARD_STANDARD, 'text-center')}>
                <div
                  className={cn(
                    'mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10',
                    SPACING.MB_4,
                  )}
                >
                  <Search className={cn(ICON_SIZES.SIZE_6, 'text-amber-600')} />
                </div>
                <h3 className={cn('font-bold', TYPOGRAPHY.TEXT_LG, SPACING.MB_2)}>
                  Self-Assessment
                </h3>
                <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM, SPACING.MB_4)}>
                  Filing your own tax return?
                </p>
                <p className={cn('font-semibold text-amber-600', TYPOGRAPHY.TEXT_SM)}>
                  → Use GOV.UK
                </p>
              </Card>

              <Card className={cn(SURFACES.CARD_STANDARD, 'text-center')}>
                <div
                  className={cn(
                    'mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10',
                    SPACING.MB_4,
                  )}
                >
                  <Users className={cn(ICON_SIZES.SIZE_6, 'text-blue-600')} />
                </div>
                <h3 className={cn('font-bold', TYPOGRAPHY.TEXT_LG, SPACING.MB_2)}>
                  Financial Advice
                </h3>
                <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM, SPACING.MB_4)}>
                  Want guides and editorial content?
                </p>
                <p className={cn('font-semibold text-blue-600', TYPOGRAPHY.TEXT_SM)}>→ Use MSE</p>
              </Card>

              <Card className={cn(SURFACES.CARD_STANDARD, 'text-center')}>
                <div
                  className={cn(
                    'mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10',
                    SPACING.MB_4,
                  )}
                >
                  <Award className={cn(ICON_SIZES.SIZE_6, 'text-purple-600')} />
                </div>
                <h3 className={cn('font-bold', TYPOGRAPHY.TEXT_LG, SPACING.MB_2)}>
                  Maximum Features
                </h3>
                <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM, SPACING.MB_4)}>
                  Need maternity pay or advanced options?
                </p>
                <p className={cn('font-semibold text-purple-600', TYPOGRAPHY.TEXT_SM)}>
                  → Use Salary Calculator
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Detailed Reviews */}
        <section className={LAYOUT.SECTION}>
          <div className={LAYOUT.CONTAINER}>
            <SectionHeading
              title='Detailed Calculator Reviews'
              subtitle='In-depth look at each option'
              align='center'
            />
            <div className={cn('grid gap-8 lg:grid-cols-2', SPACING.MT_8)}>
              {/* PayeTax - Featured */}
              <PayeTaxCard className='lg:col-span-2 lg:mx-auto lg:max-w-2xl' />

              {/* Competitors */}
              {COMPETITORS.map((competitor) => (
                <CompetitorCard
                  key={competitor.slug}
                  competitor={competitor}
                  showAdvantages
                  showCompareLink
                  linkVariant='alternatives'
                />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Schema Content */}
        <section className={LAYOUT.SECTION_TINTED_ACCENT}>
          <div className={LAYOUT.CONTAINER_SM}>
            <SectionHeading
              title='Frequently Asked Questions'
              subtitle='Common questions about UK tax calculators'
              align='center'
            />
            <div className={cn(SPACING.MT_8, SPACING.SPACE_Y_6)}>
              <Card className={SPACING.P_6}>
                <h3 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_LG, SPACING.MB_2)}>
                  Which UK tax calculator is most accurate?
                </h3>
                <p className='text-muted-foreground'>
                  All reputable calculators (PayeTax, GOV.UK, MSE, The Salary Calculator) use the
                  same official HMRC rates and should give identical results for standard PAYE
                  calculations. The main differences are in user experience and additional features
                  like What-If salary comparisons.
                </p>
              </Card>

              <Card className={SPACING.P_6}>
                <h3 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_LG, SPACING.MB_2)}>
                  What makes PayeTax different from other calculators?
                </h3>
                <p className='text-muted-foreground'>
                  PayeTax is the only UK tax calculator with What-If salary comparisons, allowing
                  you to compare arbitrary salaries side-by-side. Interactive calculations run in
                  your browser and tax inputs aren&apos;t stored, though some pages are pre-rendered
                  for SEO or email delivery. There are no display ads, and outbound links may be
                  affiliate-tracked.
                </p>
              </Card>

              <Card className={SPACING.P_6}>
                <h3 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_LG, SPACING.MB_2)}>
                  Should I use the GOV.UK calculator?
                </h3>
                <p className='text-muted-foreground'>
                  The GOV.UK calculator is excellent for self-assessment and official tax return
                  purposes. However, for quick PAYE salary calculations, dedicated calculators like
                  PayeTax offer a cleaner, more focused experience with real-time results and better
                  mobile support.
                </p>
              </Card>

              <Card className={SPACING.P_6}>
                <h3 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_LG, SPACING.MB_2)}>
                  Are free tax calculators reliable?
                </h3>
                <p className='text-muted-foreground'>
                  Yes, free tax calculators from reputable sources are reliable for estimating your
                  take-home pay. They all use the same official HMRC tax bands and rates. The key is
                  to use calculators that are regularly updated for each tax year and clearly state
                  which rates they&apos;re using.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={LAYOUT.SECTION}>
          <div className={LAYOUT.CONTAINER_SM}>
            <Card
              className={cn(
                'border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 text-center',
                SPACING.P_8,
                'md:p-12',
              )}
            >
              <h2 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_3XL, SPACING.MB_4)}>
                Ready to Calculate Your Take-Home Pay?
              </h2>
              <p className={cn('mx-auto max-w-xl text-muted-foreground', SPACING.MB_8)}>
                Try PayeTax now — it&apos;s free, focused, and respects your privacy. No display
                ads, no account required, just accurate UK tax calculations.
              </p>
              <div className={cn('flex flex-col justify-center sm:flex-row', SPACING.GAP_4)}>
                <Button asChild size='lg'>
                  <Link href='/'>
                    <Calculator className={cn(ICON_SIZES.SIZE_4, 'mr-2')} />
                    Try PayeTax Now
                  </Link>
                </Button>
                <Button asChild variant='outline' size='lg'>
                  <Link href='/about'>
                    Learn More
                    <ArrowRight className={cn(ICON_SIZES.SIZE_4, 'ml-2')} />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
