// src/app/compliance/page.tsx

import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle.js';
import Award from 'lucide-react/dist/esm/icons/award.js';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle.js';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link.js';
import Shield from 'lucide-react/dist/esm/icons/shield.js';
import type { Metadata } from 'next';
import { GradientText } from '@/components/atoms/GradientText';
import { ContactFooter } from '@/components/molecules/ContactFooter';
import { PageHero } from '@/components/molecules/PageHero';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { StatsGrid } from '@/components/molecules/StatsGrid';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ICON_SIZES } from '@/constants/designTokens';
import {
  COMPLIANCE_FEATURES,
  COMPLIANCE_STATEMENTS,
  DATA_SOURCES,
} from '@/constants/pages/compliancePageData';

export const metadata: Metadata = {
  title: 'HMRC Compliance & Data Sources | PayeTax',
  description:
    'PayeTax uses official HMRC tax rates verified for accuracy. Learn about our compliance standards and data sources for UK tax calculations.',
  keywords:
    'hmrc compliance, tax rate verification, official tax rates, uk tax accuracy, paye compliance, hmrc data sources',
  alternates: {
    canonical: 'https://payetax.co.uk/compliance',
  },
  openGraph: {
    title: 'HMRC Compliance & Data Sources | PayeTax',
    description:
      'Official HMRC tax rates and thresholds. Verified accuracy for UK tax calculations.',
    url: 'https://payetax.co.uk/compliance',
    type: 'website',
  },
};

// Stats for compliance page
const complianceStats = [
  {
    icon: CheckCircle,
    value: '100%',
    label: 'HMRC Rates',
    description: 'All rates sourced from official publications',
    color: 'from-primary to-accent',
  },
  {
    icon: Shield,
    value: '24hrs',
    label: 'Update Time',
    description: 'New rates applied within 24 hours of announcement',
    color: 'from-accent to-primary',
  },
  {
    icon: Award,
    value: '4+',
    label: 'Official Sources',
    description: 'HMRC, Revenue Scotland, SLC, ONS',
    color: 'from-primary/80 to-accent/80',
  },
];

export default function CompliancePage() {
  return (
    <div className='min-h-screen'>
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
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <StatsGrid stats={complianceStats} columns={3} variant='elevated' />
        </div>
      </section>

      {/* Compliance Features */}
      <section className='bg-gradient-to-br from-primary/5 to-accent/5 py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <SectionHeading
            title='HMRC Compliance Standards'
            subtitle='How we ensure calculation accuracy'
            align='center'
          />

          <div className='grid gap-6 md:grid-cols-2'>
            {COMPLIANCE_FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className={`border-primary/20 bg-gradient-to-br ${feature.color} p-8 backdrop-blur-sm`}
                >
                  <div className='mb-6 flex items-start gap-4'>
                    <div className='flex size-12 items-center justify-center rounded-xl bg-primary/10'>
                      <Icon className={ICON_SIZES.SIZE_6} aria-hidden='true' />
                    </div>
                    <div>
                      <h3 className='mb-2 font-bold text-foreground text-xl'>{feature.title}</h3>
                      <p className='text-muted-foreground text-sm'>{feature.description}</p>
                    </div>
                  </div>
                  <ul className='space-y-2'>
                    {feature.details.map((detail, i) => (
                      <li key={i} className='flex items-start gap-2 text-muted-foreground text-sm'>
                        <CheckCircle
                          className='mt-0.5 size-4 flex-shrink-0 text-primary'
                          aria-hidden='true'
                        />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  <div className='mt-6 flex items-center justify-between border-t border-primary/10 pt-4 text-xs text-muted-foreground'>
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
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <SectionHeading
            badge={{ icon: AlertTriangle, text: 'Legal Compliance' }}
            title='Official Compliance Statements'
            subtitle='Verified against UK tax law and regulations'
            align='center'
          />

          <div className='grid gap-6 md:grid-cols-2'>
            {COMPLIANCE_STATEMENTS.map((statement, index) => (
              <Card key={index} className='border-primary/20 p-6'>
                <h3 className='mb-3 font-semibold text-foreground'>{statement.category}</h3>
                <p className='mb-4 text-muted-foreground text-sm'>{statement.statement}</p>
                <div className='space-y-2 border-t border-primary/10 pt-4 text-xs text-muted-foreground'>
                  <p className='font-medium'>{statement.verification}</p>
                  <p>Last verified: {statement.lastVerified}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className='bg-gradient-to-br from-accent/5 to-transparent py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <SectionHeading
            badge={{ icon: Award, text: 'Data Sources' }}
            title='Official Government Sources'
            subtitle='All calculations verified against these authoritative sources'
            align='center'
          />

          <div className='grid gap-6 md:grid-cols-2'>
            {DATA_SOURCES.map((source, index) => (
              <Card key={index} className='border-primary/20 p-6'>
                <div className='mb-4 flex items-start justify-between'>
                  <div>
                    <h3 className='mb-2 font-bold text-foreground'>{source.source}</h3>
                    <p className='text-muted-foreground text-sm'>{source.description}</p>
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
                  <div className='flex items-center justify-between text-xs text-muted-foreground'>
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
            text: 'compliance@payetax.co.uk',
            href: 'mailto:compliance@payetax.co.uk?subject=Compliance Question',
            type: 'email',
          },
          {
            text: 'View Tax Rate Source Code',
            href: 'https://github.com/jarryddev/payetax',
            type: 'link',
          },
        ]}
      />
    </div>
  );
}
