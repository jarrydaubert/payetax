// src/app/vs/[competitor]/VsPageContent.tsx
import { ArrowRight, Calculator, Scale } from 'lucide-react';
import Link from 'next/link';
import { GradientText } from '@/components/atoms/GradientText';
import { Badge } from '@/components/atoms/ui/badge';
import { Button } from '@/components/atoms/ui/button';
import { Card } from '@/components/atoms/ui/card';
import { TwoColumnComparison } from '@/components/molecules/ComparisonTable';
import { PageHero } from '@/components/molecules/PageHero';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { NewsletterCTA } from '@/components/organisms/NewsletterCTA';
import { ICON_SIZES, LAYOUT, SPACING, SURFACES, TYPOGRAPHY } from '@/constants/designTokens';
import type { Competitor } from '@/data/competitors';
import { PAYETAX_INFO } from '@/data/competitors';
import { cn } from '@/lib/utils';
import { CompetitorCTAButton } from './CompetitorCTAButton';

interface VsPageContentProps {
  competitor: Competitor;
}

/**
 * Joins array items with "and", showing ellipsis when truncated.
 * @param items - Array of strings to join
 * @param maxItems - Maximum items to show before truncating
 */
function joinWithAnd(items: string[], maxItems = 2): string {
  const safe = items.filter(Boolean);
  if (safe.length === 0) return '';

  const first = safe[0];
  if (safe.length === 1 && first) return first;

  const subset = safe.slice(0, maxItems);
  const hasMore = safe.length > maxItems;

  if (subset.length === 2) {
    const base = `${subset[0]} and ${subset[1]}`;
    return hasMore ? `${base}, and more` : base;
  }

  const last = subset.at(-1);
  if (!last) return '';
  const base = `${subset.slice(0, -1).join(', ')}, and ${last}`;
  return hasMore ? `${base}, and more` : base;
}

/**
 * Converts first character to lowercase for sentence fragments.
 * Preserves case for acronyms (all caps words like "VAT", "IR35").
 */
function toSentenceFragment(str: string): string {
  if (!str) return str;
  const firstWord = str.split(' ')[0];
  if (firstWord && firstWord === firstWord.toUpperCase() && firstWord.length > 1) {
    return str;
  }
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export function VsPageContent({ competitor }: VsPageContentProps) {
  const competitorBestFor = toSentenceFragment(joinWithAnd(competitor.bestFor, 2));

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
                clean, no-display-ads experience with What-If salary comparisons (compare arbitrary
                salaries). Interactive calculations run in your browser and tax inputs aren&apos;t
                stored, though some pages are pre-rendered for SEO or email delivery.
              </p>
              <p className='text-muted-foreground'>
                <strong className='text-foreground'>{competitor.name}</strong> is better suited for{' '}
                {competitorBestFor}.
              </p>
              <p className='font-medium text-foreground'>
                Both are designed to follow official HMRC rates for UK tax calculations.
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
                        <span className='sr-only'>Strength:</span>
                        <span className='text-success' aria-hidden='true'>
                          +
                        </span>
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
                  <Link href='/#tax-calculator'>
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
                        <span className='sr-only'>Strength:</span>
                        <span className='text-success' aria-hidden='true'>
                          +
                        </span>
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
                        <span className='sr-only'>Weakness:</span>
                        <span className='text-warning' aria-hidden='true'>
                          −
                        </span>
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
                <CompetitorCTAButton competitor={competitor} />
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
                Both PayeTax and {competitor.name} aim to provide UK tax calculations based on
                official HMRC rates. The main differences come down to user experience, features,
                and design philosophy.
              </p>
              <p className='text-muted-foreground'>
                <strong className='text-foreground'>Choose PayeTax</strong> if you value a clean
                interface, want to compare arbitrary salary scenarios with What-If mode, and prefer
                no display ads with privacy-first analytics.
              </p>
              <p className='text-muted-foreground'>
                <strong className='text-foreground'>Choose {competitor.shortName}</strong> if you
                specifically need {competitorBestFor}.
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
              Ready to Try a Focused Approach?
            </h2>
            <p className={cn('mx-auto max-w-xl text-muted-foreground', SPACING.MB_8)}>
              Experience the difference with PayeTax. Clean, private, and packed with features you
              won&apos;t find elsewhere.
            </p>
            <div className={cn('flex flex-col justify-center sm:flex-row', SPACING.GAP_4)}>
              <Button asChild size='lg'>
                <Link href='/#tax-calculator'>
                  <Calculator className={cn(ICON_SIZES.SIZE_4, 'mr-2')} />
                  Try PayeTax Now
                </Link>
              </Button>
              <Button asChild variant='outline' size='lg'>
                <Link href='/best-uk-tax-calculators'>
                  Compare All Calculators
                  <ArrowRight className={cn(ICON_SIZES.SIZE_4, 'ml-2')} />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER_SM}>
          <NewsletterCTA
            title='Get HMRC Updates and Tax Guides'
            description='UK tax updates, practical explanations, and tool improvements. No spam.'
          />
        </div>
      </section>
    </div>
  );
}
