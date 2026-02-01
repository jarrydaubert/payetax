// src/app/compliance/CompliancePageContent.tsx
// Server Component - all presentational, no hooks/handlers

import { AlertTriangle, Award, CheckCircle, ExternalLink, Shield } from 'lucide-react';
import { GradientText } from '@/components/atoms/GradientText';
import { ContactFooter } from '@/components/molecules/ContactFooter';
import { PageHero } from '@/components/molecules/PageHero';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { StatsGrid } from '@/components/molecules/StatsGrid';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ICON_SIZES, LAYOUT, SPACING, SURFACES, TYPOGRAPHY } from '@/constants/designTokens';
import {
  COMPLIANCE_FEATURES,
  COMPLIANCE_STATEMENTS,
  complianceStats,
  DATA_SOURCES,
} from '@/constants/pages/compliancePageData';
import { cn } from '@/lib/utils';

export function CompliancePageContent() {
  return (
    <div className={LAYOUT.PAGE_WRAPPER}>
      {/* Hero */}
      <PageHero
        badge={{ icon: Shield, text: 'Compliance' }}
        title={
          <>
            <GradientText variant='brand-full' as='span'>
              Official HMRC
            </GradientText>
            <br />
            <span className='text-foreground'>Tax Rates & Compliance</span>
          </>
        }
        subtitle='All calculations use official HMRC tax rates and thresholds, updated within 24 hours of any changes.'
      />

      {/* Stats */}
      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER}>
          <StatsGrid stats={complianceStats} columns={3} variant='elevated' />
        </div>
      </section>

      {/* Compliance Features */}
      <section className={LAYOUT.SECTION_TINTED_PRIMARY}>
        <div className={LAYOUT.CONTAINER}>
          <SectionHeading
            title='HMRC Compliance Standards'
            subtitle='How we ensure calculation accuracy'
            align='center'
          />

          <div className='grid gap-6 md:grid-cols-2'>
            {COMPLIANCE_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className={cn(
                    'bg-gradient-to-br',
                    feature.color,
                    SPACING.P_8,
                    'backdrop-blur-sm',
                  )}
                >
                  <div className='mb-6 flex items-start gap-4'>
                    <div className='flex size-12 items-center justify-center rounded-xl bg-primary/10'>
                      <Icon className={ICON_SIZES.SIZE_6} aria-hidden='true' />
                    </div>
                    <div>
                      <h3 className={cn('mb-2 font-bold text-foreground', TYPOGRAPHY.TEXT_XL)}>
                        {feature.title}
                      </h3>
                      <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <ul className='space-y-2'>
                    {feature.details.map((detail) => (
                      <li
                        key={detail}
                        className={cn(
                          'flex items-start gap-2 text-muted-foreground',
                          TYPOGRAPHY.TEXT_SM,
                        )}
                      >
                        <CheckCircle
                          className='mt-0.5 size-4 flex-shrink-0 text-primary'
                          aria-hidden='true'
                        />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  <div
                    className={cn(
                      'mt-6 flex items-center justify-between border-primary/10 border-t pt-4 text-muted-foreground',
                      TYPOGRAPHY.TEXT_XS,
                    )}
                  >
                    <span>Last updated: {feature.lastUpdated}</span>
                    <span className='font-medium'>{feature.source}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Compliance Statements */}
      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER}>
          <SectionHeading
            badge={{ icon: AlertTriangle, text: 'Legal Compliance' }}
            title='Official Compliance Statements'
            subtitle='Verified against UK tax law and regulations'
            align='center'
          />

          <div className={LAYOUT.GRID_2}>
            {COMPLIANCE_STATEMENTS.map((statement) => (
              <Card key={statement.category} className={SURFACES.CARD_STANDARD}>
                <h3 className='mb-3 font-semibold text-foreground'>{statement.category}</h3>
                <p className={cn('mb-4 text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                  {statement.statement}
                </p>
                <div
                  className={cn(
                    'space-y-2 border-primary/10 border-t pt-4 text-muted-foreground',
                    TYPOGRAPHY.TEXT_XS,
                  )}
                >
                  <p className='font-medium'>{statement.verification}</p>
                  <p>Last verified: {statement.lastVerified}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className={LAYOUT.SECTION_TINTED_ACCENT}>
        <div className={LAYOUT.CONTAINER}>
          <SectionHeading
            badge={{ icon: Award, text: 'Data Sources' }}
            title='Official Government Sources'
            subtitle='All calculations verified against these authoritative sources'
            align='center'
          />

          <div className={LAYOUT.GRID_2}>
            {DATA_SOURCES.map((source) => (
              <Card key={source.source} className={SURFACES.CARD_STANDARD}>
                <div className='mb-4 flex items-start justify-between'>
                  <div>
                    <h3 className='mb-2 font-bold text-foreground'>{source.source}</h3>
                    <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                      {source.description}
                    </p>
                  </div>
                </div>
                <div className='space-y-3'>
                  <Button variant='outline' size='sm' asChild>
                    <a
                      href={source.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-2'
                    >
                      Visit Source
                      <ExternalLink className={ICON_SIZES.SIZE_4} aria-hidden='true' />
                    </a>
                  </Button>
                  <div
                    className={cn(
                      'flex items-center justify-between text-muted-foreground',
                      TYPOGRAPHY.TEXT_XS,
                    )}
                  >
                    <span className='font-medium text-primary'>{source.reliability}</span>
                    <span>Last accessed: {source.lastAccessed}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Footer */}
      <ContactFooter
        title='Questions About Compliance?'
        description='If you have questions about our data sources, calculation methods, or compliance standards, reach out.'
        links={[
          {
            text: 'support@payetax.co.uk',
            href: `mailto:support@payetax.co.uk?subject=${encodeURIComponent('Compliance Question')}`,
            type: 'email',
          },
        ]}
      />
    </div>
  );
}
