// src/app/vs/[competitor]/VsPageContent.tsx
'use client';

import { ArrowRight, Calculator, Scale } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { GradientText } from '@/components/atoms/GradientText';
import { TrackedAffiliateLink } from '@/components/atoms/TrackedAffiliateLink';
import { Badge } from '@/components/atoms/ui/badge';
import { Button } from '@/components/atoms/ui/button';
import { Card } from '@/components/atoms/ui/card';
import { TwoColumnComparison } from '@/components/molecules/ComparisonTable';
import { PageHero } from '@/components/molecules/PageHero';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { ICON_SIZES, LAYOUT, SPACING, SURFACES, TYPOGRAPHY } from '@/constants/designTokens';
import type { Competitor } from '@/data/competitors';
import { PAYETAX_INFO } from '@/data/competitors';
import { cn } from '@/lib/utils';

interface VsPageContentProps {
  competitor: Competitor;
}

export function VsPageContent({ competitor }: VsPageContentProps) {
  return (
    <div className={LAYOUT.PAGE_WRAPPER}>
      {/* Hero Section */}
      <PageHero
        badge={{ icon: Scale, text: 'Head-to-Head Comparison' }}
        title={
          <>
            <GradientText variant='brand-full' as='span'>
              PayeTax
            </GradientText>{' '}
            vs {competitor.name}
          </>
        }
        subtitle={[
          'An honest, side-by-side comparison to help you choose the right UK tax calculator.',
        ]}
      />

      {/* TL;DR Summary */}
      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER_SM}>
          <Card className={cn('border-primary/30', SURFACES.BG_GRADIENT_PRIMARY, SPACING.P_6)}>
            <Badge className={SPACING.MB_4}>TL;DR</Badge>
            <h2 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_XL, SPACING.MB_4)}>
              Quick Summary
            </h2>
            <div className={SPACING.SPACE_Y_4}>
              <p className='text-muted-foreground'>
                <strong className='text-foreground'>PayeTax</strong> is best for users who want a
                fast, modern, ad-free experience with unique What-If salary comparison features. All
                calculations happen in your browser for complete privacy.
              </p>
              <p className='text-muted-foreground'>
                <strong className='text-foreground'>{competitor.name}</strong> is better for{' '}
                {competitor.bestFor.slice(0, 2).join(' and ').toLowerCase()}.
              </p>
              <p className='font-medium text-foreground'>
                Both use official HMRC rates and will give you accurate results.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* At-a-Glance Comparison */}
      <section className={LAYOUT.SECTION_TINTED_PRIMARY}>
        <div className={LAYOUT.CONTAINER}>
          <SectionHeading
            title='Feature Comparison'
            subtitle='At-a-glance differences'
            align='center'
          />
          <div className={cn(SPACING.MT_8, 'overflow-hidden rounded-lg border border-border')}>
            <TwoColumnComparison competitor={competitor} />
          </div>
        </div>
      </section>

      {/* Detailed Comparison */}
      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER}>
          <SectionHeading
            title='Detailed Comparison'
            subtitle='What each calculator offers'
            align='center'
          />
          <div className={cn('grid gap-8 md:grid-cols-2', SPACING.MT_8)}>
            {/* PayeTax Column */}
            <Card className={cn(SPACING.P_6, 'border-primary/30')}>
              <div className={cn('flex items-center justify-between', SPACING.MB_6)}>
                <h3 className={cn('font-bold text-primary', TYPOGRAPHY.TEXT_2XL)}>PayeTax</h3>
                <Badge>Recommended</Badge>
              </div>

              <div className={SPACING.SPACE_Y_6}>
                <div>
                  <h4 className={cn('font-semibold', TYPOGRAPHY.TEXT_SM, SPACING.MB_2)}>
                    Strengths
                  </h4>
                  <ul className={SPACING.SPACE_Y_2}>
                    {PAYETAX_INFO.strengths.map((strength) => (
                      <li key={strength} className={cn('flex items-start', SPACING.GAP_2)}>
                        <span className='text-green-600 dark:text-green-400'>+</span>
                        <span className={TYPOGRAPHY.TEXT_SM}>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className={cn('font-semibold', TYPOGRAPHY.TEXT_SM, SPACING.MB_2)}>
                    Best For
                  </h4>
                  <ul className={SPACING.SPACE_Y_2}>
                    {PAYETAX_INFO.bestFor.map((item) => (
                      <li key={item} className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={SPACING.MT_6}>
                <Button asChild className='w-full'>
                  <Link href='/'>
                    <Calculator className={cn(ICON_SIZES.SIZE_4, 'mr-2')} />
                    Try PayeTax
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Competitor Column */}
            <Card className={SPACING.P_6}>
              <div className={cn('flex items-center justify-between', SPACING.MB_6)}>
                <h3 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_2XL)}>
                  {competitor.shortName}
                </h3>
              </div>

              <div className={SPACING.SPACE_Y_6}>
                <div>
                  <h4 className={cn('font-semibold', TYPOGRAPHY.TEXT_SM, SPACING.MB_2)}>
                    Strengths
                  </h4>
                  <ul className={SPACING.SPACE_Y_2}>
                    {competitor.strengths.map((strength) => (
                      <li key={strength} className={cn('flex items-start', SPACING.GAP_2)}>
                        <span className='text-green-600 dark:text-green-400'>+</span>
                        <span className={TYPOGRAPHY.TEXT_SM}>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className={cn('font-semibold', TYPOGRAPHY.TEXT_SM, SPACING.MB_2)}>
                    Weaknesses
                  </h4>
                  <ul className={SPACING.SPACE_Y_2}>
                    {competitor.weaknesses.slice(0, 4).map((weakness) => (
                      <li key={weakness} className={cn('flex items-start', SPACING.GAP_2)}>
                        <span className='text-amber-600 dark:text-amber-400'>-</span>
                        <span className={TYPOGRAPHY.TEXT_SM}>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className={cn('font-semibold', TYPOGRAPHY.TEXT_SM, SPACING.MB_2)}>
                    Best For
                  </h4>
                  <ul className={SPACING.SPACE_Y_2}>
                    {competitor.bestFor.map((item) => (
                      <li key={item} className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={SPACING.MT_6}>
                <Button asChild variant='outline' className='w-full'>
                  <TrackedAffiliateLink competitor={competitor} pageType='vs'>
                    Visit {competitor.shortName}
                  </TrackedAffiliateLink>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* The Verdict */}
      <section className={LAYOUT.SECTION_TINTED_ACCENT}>
        <div className={LAYOUT.CONTAINER_SM}>
          <SectionHeading title='The Verdict' align='center' />
          <Card className={cn(SPACING.MT_8, SPACING.P_8)}>
            <div className={SPACING.SPACE_Y_4}>
              <p className='text-muted-foreground'>
                Both PayeTax and {competitor.name} will give you accurate UK tax calculations based
                on official HMRC rates. The main differences come down to user experience, features,
                and design philosophy.
              </p>
              <p className='text-muted-foreground'>
                <strong className='text-foreground'>Choose PayeTax</strong> if you value a modern,
                clean interface, want to compare different salary scenarios with What-If mode, and
                prefer an ad-free, privacy-first experience.
              </p>
              <p className='text-muted-foreground'>
                <strong className='text-foreground'>Choose {competitor.shortName}</strong> if you
                specifically need {competitor.bestFor.slice(0, 2).join(' or ').toLowerCase()}.
              </p>
            </div>
          </Card>
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
              Ready to Try the Modern Approach?
            </h2>
            <p className={cn('mx-auto max-w-xl text-muted-foreground', SPACING.MB_8)}>
              Experience the difference with PayeTax. Fast, clean, private, and packed with features
              you won&apos;t find elsewhere.
            </p>
            <div className={cn('flex flex-col justify-center sm:flex-row', SPACING.GAP_4)}>
              <Button asChild size='lg'>
                <Link href='/'>
                  <Calculator className={cn(ICON_SIZES.SIZE_4, 'mr-2')} />
                  Try PayeTax Now
                </Link>
              </Button>
              <Button asChild variant='outline' size='lg'>
                <Link href={'/best-uk-tax-calculators' as Route}>
                  Compare All Calculators
                  <ArrowRight className={cn(ICON_SIZES.SIZE_4, 'ml-2')} />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
