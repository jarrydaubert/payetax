// src/app/alternatives/[competitor]/AlternativePageContent.tsx
import { ArrowRight, Calculator, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { GradientText } from '@/components/atoms/GradientText';
import { TwoColumnComparison } from '@/components/molecules/ComparisonTable';
import { PageHero } from '@/components/molecules/PageHero';
import { AdvantagesList, ProsCons } from '@/components/molecules/ProsCons';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { NewsletterCTA } from '@/components/organisms/NewsletterCTA';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ICON_SIZES, LAYOUT, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import type { Competitor } from '@/data/competitors';
import { cn } from '@/lib/utils';
import { CompetitorLink } from './CompetitorLink';

interface AlternativePageContentProps {
  competitor: Competitor;
}

export function AlternativePageContent({ competitor }: AlternativePageContentProps) {
  // Safe defaults for optional arrays
  const strengths = competitor.strengths ?? [];
  const weaknesses = competitor.weaknesses ?? [];
  const bestFor = competitor.bestFor ?? [];
  const advantages = competitor.payeTaxAdvantages ?? [];

  return (
    <div className={LAYOUT.PAGE_WRAPPER}>
      {/* Hero Section */}
      <PageHero
        badge={{ icon: RefreshCw, text: `${competitor.shortName} Alternative` }}
        title={
          <>
            Looking for a{' '}
            <GradientText variant='brand-full' as='span'>
              {competitor.name}
            </GradientText>{' '}
            Alternative?
          </>
        }
        subtitle={[
          `${competitor.description}`,
          "But if you're looking for something cleaner and more focused — PayeTax might be what you need.",
        ]}
      />

      {/* Why People Look for Alternatives */}
      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER_SM}>
          <SectionHeading
            title={`Why People Search for ${competitor.shortName} Alternatives`}
            subtitle='Common pain points we hear about'
            align='center'
          />
          <div className={SPACING.MT_8}>
            <ProsCons
              pros={strengths}
              cons={weaknesses}
              prosTitle={`What ${competitor.shortName} Does Well`}
              consTitle='Where It Falls Short'
            />
          </div>
        </div>
      </section>

      {/* Side-by-Side Comparison */}
      <section className={LAYOUT.SECTION_TINTED_PRIMARY}>
        <div className={LAYOUT.CONTAINER}>
          <SectionHeading
            title='Feature Comparison'
            subtitle={`PayeTax vs ${competitor.name}`}
            align='center'
          />
          <div className={cn(SPACING.MT_8, 'overflow-hidden rounded-lg border border-border')}>
            <TwoColumnComparison competitor={competitor} />
          </div>
        </div>
      </section>

      {/* PayeTax Advantages */}
      {advantages.length > 0 && (
        <section className={LAYOUT.SECTION}>
          <div className={LAYOUT.CONTAINER_SM}>
            <SectionHeading
              title={`Why Choose PayeTax Over ${competitor.shortName}`}
              subtitle='Key advantages that make a difference'
              align='center'
            />
            <div className={SPACING.MT_8}>
              <AdvantagesList items={advantages} title='PayeTax Advantages' />
            </div>
          </div>
        </section>
      )}

      {/* Who Should Use What */}
      <section className={LAYOUT.SECTION_TINTED_ACCENT}>
        <div className={LAYOUT.CONTAINER}>
          <SectionHeading
            title='Which Should You Use?'
            subtitle='An honest assessment'
            align='center'
          />
          <div className={cn('grid gap-8 md:grid-cols-2', SPACING.MT_8)}>
            <Card className={cn(SPACING.P_6, 'border-primary/30')}>
              <h3 className={cn('font-bold text-primary', TYPOGRAPHY.TEXT_XL, SPACING.MB_4)}>
                Choose PayeTax if you want:
              </h3>
              <ul className={SPACING.SPACE_Y_3}>
                <li className={cn('flex items-start', SPACING.GAP_3)}>
                  <span className='sr-only'>Advantage:</span>
                  <span className='text-primary' aria-hidden='true'>
                    ✓
                  </span>
                  <span>Quick, clean calculations without distractions</span>
                </li>
                <li className={cn('flex items-start', SPACING.GAP_3)}>
                  <span className='sr-only'>Advantage:</span>
                  <span className='text-primary' aria-hidden='true'>
                    ✓
                  </span>
                  <span>What-If salary comparisons (compare arbitrary salaries)</span>
                </li>
                <li className={cn('flex items-start', SPACING.GAP_3)}>
                  <span className='sr-only'>Advantage:</span>
                  <span className='text-primary' aria-hidden='true'>
                    ✓
                  </span>
                  <span>No display ads (affiliate links are tracked)</span>
                </li>
                <li className={cn('flex items-start', SPACING.GAP_3)}>
                  <span className='sr-only'>Advantage:</span>
                  <span className='text-primary' aria-hidden='true'>
                    ✓
                  </span>
                  <span>Mobile-first design</span>
                </li>
                <li className={cn('flex items-start', SPACING.GAP_3)}>
                  <span className='sr-only'>Advantage:</span>
                  <span className='text-primary' aria-hidden='true'>
                    ✓
                  </span>
                  <span>Instant real-time results</span>
                </li>
              </ul>
            </Card>

            <Card className={cn(SPACING.P_6)}>
              <h3 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_XL, SPACING.MB_4)}>
                Choose {competitor.shortName} if you need:
              </h3>
              <ul className={SPACING.SPACE_Y_3}>
                {bestFor.map((item) => (
                  <li key={item} className={cn('flex items-start', SPACING.GAP_3)}>
                    <span className='text-muted-foreground'>•</span>
                    <span className='text-muted-foreground'>{item}</span>
                  </li>
                ))}
              </ul>
              <CompetitorLink competitor={competitor} />
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
              Built on Official HMRC Rates
            </h2>
            <p className={cn('mx-auto max-w-xl text-muted-foreground', SPACING.MB_8)}>
              PayeTax is built around official HMRC rates and guidance, with a clean interface, no
              display ads, and What-If salary comparisons you won&apos;t find elsewhere.
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
            title='Get UK Tax Updates by Email'
            description='HMRC changes, practical tips, and new calculator guidance. No spam.'
          />
        </div>
      </section>
    </div>
  );
}
