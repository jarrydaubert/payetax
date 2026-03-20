// src/app/best-for/[use-case]/UseCasePageContent.tsx

import {
  ArrowRight,
  BarChart3,
  Calculator,
  Clock,
  type LucideIcon,
  PiggyBank,
  Shield,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { GradientText } from '@/components/atoms/GradientText';
import { PageHero } from '@/components/molecules/PageHero';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { NewsletterCTA } from '@/components/organisms/NewsletterCTA';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ICON_SIZES, LAYOUT, SPACING, SURFACES, TYPOGRAPHY } from '@/constants/designTokens';
import type { UseCase, UseCaseFeature } from '@/data/useCases';
import { cn } from '@/lib/utils';

interface UseCasePageContentProps {
  useCase: UseCase;
}

// Map feature icon strings to Lucide icons
const FEATURE_ICONS: Record<UseCaseFeature['icon'], LucideIcon> = {
  calculator: Calculator,
  shield: Shield,
  chart: BarChart3,
  clock: Clock,
  target: Target,
  users: Users,
  piggy: PiggyBank,
  trending: TrendingUp,
};

export function UseCasePageContent({ useCase }: UseCasePageContentProps) {
  // Format salary range
  const formatSalary = (n: number) =>
    n >= 1000 ? `£${(n / 1000).toFixed(0)}k` : `£${n.toLocaleString()}`;
  const salaryRangeText = `${formatSalary(useCase.salaryRange.min)} - ${formatSalary(useCase.salaryRange.max)}`;

  return (
    <div className={LAYOUT.PAGE_WRAPPER}>
      {/* Hero Section */}
      <PageHero
        badge={{ icon: Calculator, text: `For ${useCase.audience}` }}
        title={
          <>
            <GradientText variant='brand-full' as='span'>
              {useCase.audience}
            </GradientText>{' '}
            Tax Calculator
          </>
        }
        subtitle={[useCase.description]}
      />

      {/* Hero CTA */}
      <div className={cn('flex justify-center', SPACING.MT_6, '-mt-8')}>
        <Button asChild size='lg'>
          <Link
            href={`/?salary=${useCase.defaults.salary}${useCase.defaults.scottish ? '&scottish=true' : ''}${useCase.defaults.studentLoan ? `&studentLoan=${useCase.defaults.studentLoan}` : ''}`}
          >
            <Calculator className={cn(ICON_SIZES.SIZE_4, 'mr-2')} />
            Calculate Now
          </Link>
        </Button>
      </div>

      {/* Key Features */}
      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER}>
          <SectionHeading
            title={`Why ${useCase.audience} Use PayeTax`}
            subtitle='Purpose-built for your needs'
            align='center'
          />
          <div className={cn('grid gap-6 md:grid-cols-3', SPACING.MT_8)}>
            {useCase.features.map((feature) => {
              const Icon = FEATURE_ICONS[feature.icon];
              return (
                <Card key={feature.title} className={cn(SURFACES.CARD_STANDARD, 'text-center')}>
                  <div
                    className={cn(
                      'mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10',
                      SPACING.MB_4,
                    )}
                  >
                    <Icon className={cn(ICON_SIZES.SIZE_6, 'text-primary')} />
                  </div>
                  <h3 className={cn('font-bold', TYPOGRAPHY.TEXT_LG, SPACING.MB_2)}>
                    {feature.title}
                  </h3>
                  <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className={LAYOUT.SECTION_TINTED_PRIMARY}>
        <div className={LAYOUT.CONTAINER_SM}>
          <Card className={cn('border-primary/30', SURFACES.BG_GRADIENT_PRIMARY, SPACING.P_6)}>
            <div className='grid gap-6 text-center md:grid-cols-3'>
              <div>
                <div className={cn('font-bold text-primary', TYPOGRAPHY.TEXT_2XL)}>
                  {salaryRangeText}
                </div>
                <div className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>Typical Range</div>
              </div>
              <div>
                <div className={cn('font-bold text-primary', TYPOGRAPHY.TEXT_2XL)}>Instant</div>
                <div className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>Results</div>
              </div>
              <div>
                <div className={cn('font-bold text-primary', TYPOGRAPHY.TEXT_2XL)}>100%</div>
                <div className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                  Free & Private
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Main Explanation */}
      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER_SM}>
          <SectionHeading
            title={`Tax Guide for ${useCase.audience}`}
            subtitle='Everything you need to know'
            align='center'
          />
          <Card className={cn(SPACING.MT_8, SPACING.P_6, 'md:p-8')}>
            <div className='prose prose-slate dark:prose-invert max-w-none'>
              {useCase.explanation.split('\n\n').map((paragraph) => (
                <p
                  key={paragraph.slice(0, 50)}
                  className='mb-4 whitespace-pre-line text-muted-foreground'
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Tips Section */}
      <section className={LAYOUT.SECTION_TINTED_ACCENT}>
        <div className={LAYOUT.CONTAINER_SM}>
          <SectionHeading
            title={`Tips for ${useCase.audience}`}
            subtitle='Practical advice'
            align='center'
          />
          <div className={cn(SPACING.MT_8, SPACING.SPACE_Y_4)}>
            {useCase.tips.map((tip, index) => (
              <Card key={tip} className={cn(SPACING.P_4, 'flex items-start gap-3')}>
                <Badge variant='outline' className='shrink-0'>
                  {index + 1}
                </Badge>
                <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>{tip}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER_SM}>
          <SectionHeading
            title='Frequently Asked Questions'
            subtitle={`Common questions from ${useCase.audience.toLowerCase()}`}
            align='center'
          />
          <div className={cn(SPACING.MT_8, SPACING.SPACE_Y_6)}>
            {useCase.faqs.map((faq) => (
              <Card key={faq.question} className={SPACING.P_6}>
                <h3 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_LG, SPACING.MB_2)}>
                  {faq.question}
                </h3>
                <p className='text-muted-foreground'>{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Related Blog Posts */}
      {useCase.relatedBlogSlugs.length > 0 && (
        <section className={LAYOUT.SECTION_TINTED_PRIMARY}>
          <div className={LAYOUT.CONTAINER_SM}>
            <SectionHeading
              title='Related Guides'
              subtitle='Learn more about UK tax'
              align='center'
            />
            <div className={cn('flex flex-wrap justify-center', SPACING.GAP_4, SPACING.MT_8)}>
              {useCase.relatedBlogSlugs.slice(0, 4).map((slug) => (
                <Button key={slug} asChild variant='outline' size='sm'>
                  <Link href={`/blog/${slug}`}>
                    {slug
                      .replace(/-/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())
                      .replace(/Uk/g, 'UK')
                      .slice(0, 40)}
                    {slug.length > 40 ? '...' : ''}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER_SM}>
          <NewsletterCTA
            title={`Get Tax Updates for ${useCase.audience}`}
            description='Practical HMRC updates, deadline reminders, and tax guidance by email.'
          />
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
              Get instant, accurate UK tax calculations. Free, private, and designed for{' '}
              {useCase.audience.toLowerCase()}.
            </p>
            <div className={cn('flex flex-col justify-center sm:flex-row', SPACING.GAP_4)}>
              <Button asChild size='lg'>
                <Link
                  href={`/?salary=${useCase.defaults.salary}${useCase.defaults.scottish ? '&scottish=true' : ''}${useCase.defaults.studentLoan ? `&studentLoan=${useCase.defaults.studentLoan}` : ''}`}
                >
                  <Calculator className={cn(ICON_SIZES.SIZE_4, 'mr-2')} />
                  Calculate Now
                </Link>
              </Button>
              <Button asChild variant='outline' size='lg'>
                <Link href='/blog'>
                  Read Tax Guides
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
