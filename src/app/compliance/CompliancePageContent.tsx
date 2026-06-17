// src/app/compliance/CompliancePageContent.tsx
// Server Component - all presentational, no hooks/handlers

import { AlertTriangle, Award, CheckCircle, ExternalLink, Shield } from 'lucide-react';
import { ContactFooter } from '@/components/molecules/ContactFooter';
import { PageHero } from '@/components/molecules/PageHero';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { StatsGrid } from '@/components/molecules/StatsGrid';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { contactMailto, SITE_CONTACT_EMAIL } from '@/constants/contact';
import {
  CURRENT_TAX_YEAR_DISPLAY_SHORT,
  formatIsoDateForDisplay,
  RATES_LAST_VERIFIED,
} from '@/constants/freshness';
import {
  COMPLIANCE_FEATURES,
  COMPLIANCE_STATEMENTS,
  complianceStats,
  DATA_SOURCES,
} from '@/constants/pages/compliancePageData';
import { APP_VERSION } from '@/constants/version';
import { cn } from '@/lib/utils';

export function CompliancePageContent() {
  const integritySnapshot = [
    {
      label: 'App release',
      value: `v${APP_VERSION}`,
      note: 'Version currently deployed from repository release tags.',
    },
    {
      label: 'Tax ruleset',
      value: CURRENT_TAX_YEAR_DISPLAY_SHORT,
      note: 'Single source of truth: src/constants/taxRates.ts',
    },
    {
      label: 'Rates verified',
      value: formatIsoDateForDisplay(RATES_LAST_VERIFIED),
      note: 'HMRC/Revenue Scotland rates last manually verified.',
    },
    {
      label: 'Model class',
      value: 'Deterministic',
      note: 'No AI-generated tax outputs; fixed formulas and thresholds.',
    },
  ] as const;

  return (
    <div className={'min-h-screen'}>
      {/* Hero */}
      <PageHero
        badge={{ icon: Shield, text: 'Compliance' }}
        title={
          <>
            Official HMRC
            <br />
            <span className='text-foreground'>Tax Rates & Compliance</span>
          </>
        }
        subtitle='All calculations use official HMRC and Revenue Scotland rates and thresholds, verified against published guidance. The last verification date is shown below.'
      />

      {/* Stats */}
      <section className={'py-12 md:py-20'}>
        <div className={'container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'}>
          <StatsGrid stats={complianceStats} columns={3} variant='elevated' />
        </div>
      </section>

      {/* Integrity Snapshot */}
      <section className={'border-border/60 border-y bg-card py-12 md:py-20'}>
        <div className={'container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'}>
          <SectionHeading
            badge={{ icon: Shield, text: 'Integrity Snapshot' }}
            title='Calculation Integrity Snapshot'
            subtitle='Versioned references so assumptions and rate coverage are explicit.'
            align='center'
          />

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {integritySnapshot.map((item) => (
              <Card key={item.label} className={'border-primary/20 p-6'}>
                <p className='font-medium text-muted-foreground text-xs uppercase tracking-wide'>
                  {item.label}
                </p>
                <p className='mt-2 font-semibold text-foreground text-xl'>{item.value}</p>
                <p className='mt-2 text-muted-foreground text-sm'>{item.note}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Features */}
      <section className={'border-border/60 border-y bg-primary/5 py-12 md:py-20'}>
        <div className={'container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'}>
          <SectionHeading
            title='HMRC Compliance Standards'
            subtitle='How we ensure calculation accuracy'
            align='center'
          />

          <div className='grid gap-6 md:grid-cols-2'>
            {COMPLIANCE_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className={cn('rounded-sm border-border bg-card', 'p-8')}>
                  <div className='mb-6 flex items-start gap-4'>
                    <div className='flex size-12 items-center justify-center rounded-sm border border-primary/25 bg-background text-primary'>
                      <Icon className={'size-6'} aria-hidden='true' />
                    </div>
                    <div>
                      <h3
                        className={cn('mb-2 font-display font-semibold text-foreground', 'text-xl')}
                      >
                        {feature.title}
                      </h3>
                      <p className={cn('text-muted-foreground', 'text-sm')}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <ul className='space-y-2'>
                    {feature.details.map((detail) => (
                      <li
                        key={detail}
                        className={cn('flex items-start gap-2 text-muted-foreground', 'text-sm')}
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
                      'text-xs',
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
      <section className={'py-12 md:py-20'}>
        <div className={'container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'}>
          <SectionHeading
            badge={{ icon: AlertTriangle, text: 'Legal Compliance' }}
            title='Official Compliance Statements'
            subtitle='Verified against UK tax law and regulations'
            align='center'
          />

          <div className={'grid gap-6 md:grid-cols-2'}>
            {COMPLIANCE_STATEMENTS.map((statement) => (
              <Card key={statement.category} className={'border-primary/20 p-6'}>
                <h3 className='mb-3 font-semibold text-foreground'>{statement.category}</h3>
                <p className={cn('mb-4 text-muted-foreground', 'text-sm')}>{statement.statement}</p>
                <div
                  className={cn(
                    'space-y-2 border-primary/10 border-t pt-4 text-muted-foreground',
                    'text-xs',
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
      <section className={'border-border/60 border-y bg-card py-12 md:py-20'}>
        <div className={'container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'}>
          <SectionHeading
            badge={{ icon: Award, text: 'Data Sources' }}
            title='Official Government Sources'
            subtitle='All calculations verified against these authoritative sources'
            align='center'
          />

          <div className={'grid gap-6 md:grid-cols-2'}>
            {DATA_SOURCES.map((source) => (
              <Card key={source.source} className={'border-primary/20 p-6'}>
                <div className='mb-4 flex items-start justify-between'>
                  <div>
                    <h3 className='mb-2 font-bold text-foreground'>{source.source}</h3>
                    <p className={cn('text-muted-foreground', 'text-sm')}>{source.description}</p>
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
                      <ExternalLink className={'size-4'} aria-hidden='true' />
                    </a>
                  </Button>
                  <div
                    className={cn(
                      'flex items-center justify-between text-muted-foreground',
                      'text-xs',
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
            text: SITE_CONTACT_EMAIL,
            href: contactMailto('Compliance Question'),
            type: 'email',
          },
        ]}
      />
    </div>
  );
}
