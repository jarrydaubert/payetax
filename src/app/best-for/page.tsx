import { ArrowRight, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/molecules/PageHero';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { NewsletterCTA } from '@/components/organisms/NewsletterCTA';
import { StructuredData } from '@/components/organisms/StructuredData';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ICON_SIZES, LAYOUT, SPACING, SURFACES, TYPOGRAPHY } from '@/constants/designTokens';
import { USE_CASES } from '@/data/useCases';
import { generateMetadata as generateBaseMetadata, SITE_URL } from '@/lib/metadata';
import { cn } from '@/lib/utils';

export const metadata: Metadata = generateBaseMetadata({
  title: 'Best For: UK Tax Calculator by Audience | PayeTax',
  description:
    'Find the right UK tax calculator for your situation. Explore tailored guides for freelancers, contractors, students, first jobs, and more.',
  keywords:
    'uk tax calculator by audience, tax calculator for freelancers, contractor tax calculator, student loan calculator, first job tax calculator',
  pathname: '/best-for',
});

export const revalidate = 86400;

const formatSalary = (value: number) => `£${(value / 1000).toFixed(0)}k`;

export default function BestForPage() {
  const useCases = [...USE_CASES].sort((a, b) => {
    if (a.highPriority && !b.highPriority) return -1;
    if (!a.highPriority && b.highPriority) return 1;
    return a.audience.localeCompare(b.audience);
  });

  return (
    <>
      <StructuredData
        type='breadcrumb'
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: 'Best For', url: `${SITE_URL}/best-for` },
        ]}
      />
      <StructuredData
        type='itemlist'
        itemList={{
          listName: 'Best For UK Tax Calculator Guides',
          listDescription: 'Audience-specific UK tax calculator guides and landing pages.',
          items: useCases.map((useCase, index) => ({
            name: useCase.title,
            url: `${SITE_URL}/best-for/${useCase.slug}`,
            description: useCase.description,
            position: index + 1,
          })),
        }}
      />

      <div className={LAYOUT.PAGE_WRAPPER}>
        <PageHero
          badge={{ icon: Users, text: 'Best For' }}
          title='Find the right tax calculator for your situation'
          subtitle={[
            'Audience-specific guides built on official HMRC rates.',
            'Choose the page that matches your job or life stage.',
          ]}
        />

        <section className={LAYOUT.SECTION}>
          <div className={LAYOUT.CONTAINER}>
            <SectionHeading
              title='Browse by Audience'
              subtitle='Tailored landing pages with defaults and guidance'
              align='center'
            />

            <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-3', SPACING.MT_8)}>
              {useCases.map((useCase) => (
                <Link key={useCase.slug} href={`/best-for/${useCase.slug}`} className='group'>
                  <Card
                    className={cn(
                      SURFACES.CARD_STANDARD,
                      'flex h-full flex-col justify-between transition-all duration-200',
                      'hover:-translate-y-0.5 hover:shadow-lg',
                    )}
                  >
                    <div>
                      <div className={cn('flex items-start justify-between', SPACING.GAP_2)}>
                        <h3 className={cn('font-semibold', TYPOGRAPHY.TEXT_LG)}>{useCase.title}</h3>
                        {useCase.highPriority && (
                          <Badge variant='secondary' className='shrink-0'>
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM, SPACING.MT_2)}>
                        {useCase.description}
                      </p>
                    </div>

                    <div className={cn('flex items-center justify-between', SPACING.MT_6)}>
                      <span className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                        Typical: {formatSalary(useCase.salaryRange.min)}–
                        {formatSalary(useCase.salaryRange.max)}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center text-primary',
                          TYPOGRAPHY.TEXT_SM,
                          'transition-colors group-hover:text-primary/80',
                        )}
                      >
                        View Guide
                        <ArrowRight className={cn(ICON_SIZES.SIZE_4, 'ml-1')} />
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={LAYOUT.SECTION}>
          <div className={LAYOUT.CONTAINER_SM}>
            <NewsletterCTA
              title='Get UK Tax Guidance by Email'
              description='HMRC updates, practical tax tips, and new calculator features. No spam.'
            />
          </div>
        </section>
      </div>
    </>
  );
}
