import { ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';
import { useId } from 'react';
import { Badge } from '@/components/atoms/ui/badge';
import { Card } from '@/components/atoms/ui/card';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { ICON_SIZES, LAYOUT, SPACING, SURFACES, TYPOGRAPHY } from '@/constants/designTokens';
import { USE_CASES } from '@/data/useCases';
import { cn } from '@/lib/utils';

interface BestForAudienceSectionProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

function formatSalary(value: number) {
  return value >= 1000
    ? `GBP ${(value / 1000).toFixed(0)}k`
    : `GBP ${value.toLocaleString('en-GB')}`;
}

export function BestForAudienceSection({
  title = 'Browse by Situation',
  subtitle = 'Audience-specific starting points for the calculator and related guidance.',
  className,
}: BestForAudienceSectionProps) {
  const headingId = useId();
  const useCases = [...USE_CASES].sort((a, b) => {
    if (a.highPriority && !b.highPriority) return -1;
    if (!a.highPriority && b.highPriority) return 1;
    return a.audience.localeCompare(b.audience);
  });

  return (
    <section className={cn(LAYOUT.SECTION, className)} aria-labelledby={headingId}>
      <div className={LAYOUT.CONTAINER}>
        <SectionHeading
          badge={{ icon: Users, text: 'Best For' }}
          id={headingId}
          title={title}
          subtitle={subtitle}
          align='center'
        />

        <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', SPACING.MT_8)}>
          {useCases.map((useCase) => (
            <Link
              key={useCase.slug}
              href={`/best-for/${useCase.slug}`}
              data-testid={`best-for-link-${useCase.slug}`}
              className='group block h-full'
            >
              <Card
                className={cn(
                  SURFACES.CARD_STANDARD,
                  'flex h-full flex-col justify-between transition-all duration-200',
                  'hover:-translate-y-0.5 hover:border-primary/40',
                )}
              >
                <div>
                  <div className={cn('flex items-start justify-between', SPACING.GAP_2)}>
                    <h3 className={cn('font-semibold text-foreground', TYPOGRAPHY.TEXT_BASE)}>
                      {useCase.audience}
                    </h3>
                    {useCase.highPriority && (
                      <Badge variant='secondary' className='shrink-0'>
                        Popular
                      </Badge>
                    )}
                  </div>
                  <p className={cn('mt-2 text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                    {useCase.description}
                  </p>
                </div>

                <div
                  className={cn(
                    'mt-5 flex items-center justify-between text-muted-foreground',
                    TYPOGRAPHY.TEXT_SM,
                  )}
                >
                  <span>
                    Typical: {formatSalary(useCase.salaryRange.min)} to{' '}
                    {formatSalary(useCase.salaryRange.max)}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center text-primary transition-colors group-hover:text-primary/80',
                    )}
                  >
                    Open
                    <ArrowRight className={cn(ICON_SIZES.SIZE_4, 'ml-1')} />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BestForAudienceSection;
