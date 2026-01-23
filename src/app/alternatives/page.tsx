// src/app/alternatives/page.tsx
'use client';

import { ArrowRight, Calculator, RefreshCw } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { GradientText } from '@/components/atoms/GradientText';
import { Button } from '@/components/atoms/ui/button';
import { Card } from '@/components/atoms/ui/card';
import { CompetitorCard, PayeTaxCard } from '@/components/molecules/CompetitorCard';
import { PageHero } from '@/components/molecules/PageHero';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { ICON_SIZES, LAYOUT, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { COMPETITORS } from '@/data/competitors';
import { cn } from '@/lib/utils';

export default function AlternativesIndexPage() {
  return (
    <div className={LAYOUT.PAGE_WRAPPER}>
      {/* Hero Section */}
      <PageHero
        badge={{ icon: RefreshCw, text: 'Calculator Alternatives' }}
        title={
          <>
            Looking for a{' '}
            <GradientText variant='brand-full' as='span'>
              Better Alternative
            </GradientText>
            ?
          </>
        }
        subtitle={[
          'Not happy with your current tax calculator? We get it.',
          'Compare PayeTax with popular UK calculators and see the difference.',
        ]}
      />

      {/* Why People Switch */}
      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER}>
          <SectionHeading
            title='Common Frustrations with Tax Calculators'
            subtitle="Sound familiar? You're not alone."
            align='center'
          />
          <div className={cn('grid gap-6 md:grid-cols-3', SPACING.MT_8)}>
            <Card className={cn(SPACING.P_6, 'text-center')}>
              <div className={cn('text-4xl', SPACING.MB_4)}>📺</div>
              <h3 className={cn('font-bold', TYPOGRAPHY.TEXT_LG, SPACING.MB_2)}>Too Many Ads</h3>
              <p className='text-muted-foreground'>
                Pop-ups, banners, and intrusive ads that slow everything down and distract from what
                you&apos;re trying to do.
              </p>
            </Card>

            <Card className={cn(SPACING.P_6, 'text-center')}>
              <div className={cn('text-4xl', SPACING.MB_4)}>🐌</div>
              <h3 className={cn('font-bold', TYPOGRAPHY.TEXT_LG, SPACING.MB_2)}>Slow & Clunky</h3>
              <p className='text-muted-foreground'>
                Multiple page loads, poor mobile experience, and interfaces that feel stuck in 2010.
              </p>
            </Card>

            <Card className={cn(SPACING.P_6, 'text-center')}>
              <div className={cn('text-4xl', SPACING.MB_4)}>🔒</div>
              <h3 className={cn('font-bold', TYPOGRAPHY.TEXT_LG, SPACING.MB_2)}>
                Privacy Concerns
              </h3>
              <p className='text-muted-foreground'>
                Worried about who&apos;s tracking your salary data and what they&apos;re doing with
                it.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* PayeTax Solution */}
      <section className={LAYOUT.SECTION_TINTED_PRIMARY}>
        <div className={LAYOUT.CONTAINER_SM}>
          <PayeTaxCard />
          <div className={cn('text-center', SPACING.MT_8)}>
            <Button asChild size='lg'>
              <Link href='/'>
                <Calculator className={cn(ICON_SIZES.SIZE_4, 'mr-2')} />
                Try PayeTax Now
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Alternatives List */}
      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER}>
          <SectionHeading
            title='Alternatives by Calculator'
            subtitle='Compare PayeTax with specific calculators'
            align='center'
          />
          <div className={cn('grid gap-8 md:grid-cols-2 lg:grid-cols-3', SPACING.MT_8)}>
            {COMPETITORS.map((competitor) => (
              <CompetitorCard
                key={competitor.slug}
                competitor={competitor}
                showAdvantages={false}
                showCompareLink
                linkVariant='alternatives'
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={LAYOUT.SECTION_TINTED_ACCENT}>
        <div className={LAYOUT.CONTAINER_SM}>
          <Card
            className={cn(
              'border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 text-center',
              SPACING.P_8,
              'md:p-12'
            )}
          >
            <h2 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_3XL, SPACING.MB_4)}>
              Ready to Try Something Better?
            </h2>
            <p className={cn('mx-auto max-w-xl text-muted-foreground', SPACING.MB_8)}>
              Try the modern approach: cleaner, faster, and more private tax calculations.
            </p>
            <div className={cn('flex flex-col justify-center sm:flex-row', SPACING.GAP_4)}>
              <Button asChild size='lg'>
                <Link href='/'>
                  <Calculator className={cn(ICON_SIZES.SIZE_4, 'mr-2')} />
                  Calculate Your Take-Home Pay
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
