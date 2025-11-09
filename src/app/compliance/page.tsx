// src/app/compliance/page.tsx

// Optimized Lucide imports (bypasses Turbopack tree-shaking issue)
// Generated via: bash scripts/optimize-lucide-pages.sh
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle.js';
import Award from 'lucide-react/dist/esm/icons/award.js';
import Calendar from 'lucide-react/dist/esm/icons/calendar.js';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle.js';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link.js';
import FileText from 'lucide-react/dist/esm/icons/file-text.js';
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

// HMRC compliance features and certifications
const COMPLIANCE_FEATURES = [
  {
    title: 'Official HMRC Tax Tables',
    description:
      'All calculations use official HMRC tax rates and thresholds published for each tax year',
    details: [
      'Income tax bands and rates verified against HMRC publications',
      'National Insurance rates updated for Class 1 contributions',
      'Student loan thresholds for all plan types (1, 2, 4, 5, Postgraduate)',
      'Scottish tax rates independently verified against Revenue Scotland',
    ],
    icon: FileText,
    lastUpdated: '2024-08-25',
    source: 'HMRC Gov.UK Publications',
    color: 'from-primary to-accent',
  },
  {
    title: 'Formula Verification',
    description: 'Calculation formulas verified against official HMRC examples and test cases',
    details: [
      'Tested against HMRC published example calculations',
      'Formulas match official PAYE calculation methods',
      'Edge cases validated against gov.uk guidance',
      'Open source for professional review and verification',
    ],
    icon: Shield,
    lastUpdated: '2024-08-01',
    source: 'HMRC Example Calculations',
    color: 'from-accent to-primary',
  },
  {
    title: 'Regular Updates',
    description: 'Tax rates and thresholds updated immediately when HMRC announces changes',
    details: [
      'Autumn Budget updates within 24 hours',
      'Spring Statement changes applied same day',
      'Emergency rate changes implemented immediately',
      'Historical rates maintained for comparison',
    ],
    icon: Calendar,
    lastUpdated: '2024-08-25',
    source: 'HMRC Announcements',
    color: 'from-primary/80 to-accent/80',
  },
  {
    title: 'Quality Assurance',
    description:
      'Multi-layer testing and validation ensures calculation accuracy across all scenarios',
    details: [
      'Automated testing against HMRC examples',
      'Manual verification of edge cases',
      'Cross-platform calculation consistency',
      'Professional user feedback integration',
    ],
    icon: Shield,
    lastUpdated: '2024-08-20',
    source: 'Internal QA Process',
    color: 'from-accent/80 to-primary/80',
  },
];

// Specific HMRC compliance statements
const COMPLIANCE_STATEMENTS = [
  {
    category: 'Tax Rate Accuracy',
    statement:
      'All tax rates are sourced directly from official HMRC publications and updated within 24 hours of any announced changes.',
    verification: 'Verified against HMRC Income Tax rates and allowances (ITTOIA 2005)',
    lastVerified: '2024-08-25',
  },
  {
    category: 'National Insurance Compliance',
    statement:
      'National Insurance calculations follow official HMRC guidance for Class 1 contributions including current rates and thresholds.',
    verification: 'Compliant with National Insurance Contributions Act 2014 and subsequent updates',
    lastVerified: '2024-08-25',
  },
  {
    category: 'Student Loan Accuracy',
    statement:
      'Student loan calculations are accurate for all current repayment plans as defined by the Student Loans Company.',
    verification: 'Verified against SLC guidance and HMRC PAYE procedures',
    lastVerified: '2024-08-20',
  },
  {
    category: 'Scottish Tax Compliance',
    statement:
      'Scottish tax calculations use official rates published by Revenue Scotland and Scottish Government.',
    verification: 'Compliant with Scotland Act 2016 and Scottish Rate Resolution',
    lastVerified: '2024-08-15',
  },
];

// Data sources and references
const DATA_SOURCES = [
  {
    source: 'HM Revenue & Customs',
    description: 'Official UK tax authority providing tax rates, allowances, and guidance',
    url: 'https://www.gov.uk/government/organisations/hm-revenue-customs',
    lastAccessed: '2024-08-25',
    reliability: 'Official Government Source',
  },
  {
    source: 'Revenue Scotland',
    description: 'Official Scottish tax authority for devolved Scottish income tax rates',
    url: 'https://www.revenue.scot/',
    lastAccessed: '2024-08-15',
    reliability: 'Official Government Source',
  },
  {
    source: 'Student Loans Company',
    description: 'Official body managing student loans and repayment thresholds',
    url: 'https://www.slc.co.uk/',
    lastAccessed: '2024-08-20',
    reliability: 'Official Government Source',
  },
  {
    source: 'Institute of Chartered Accountants',
    description: 'Professional body providing technical guidance and standards',
    url: 'https://www.icaew.com/',
    lastAccessed: '2024-08-01',
    reliability: 'Professional Authority',
  },
];

export default function CompliancePage() {
  return (
    <div className='min-h-screen'>
      {/* Hero Section - Using PageHero */}
      <PageHero
        badge={{ icon: Shield, text: 'HMRC Compliance' }}
        title={
          <>
            <GradientText variant='brand-full' as='span'>
              Verified Accuracy
            </GradientText>
            <br />
            <span className='text-foreground'>Official Compliance</span>
          </>
        }
        subtitle='Every calculation verified against official HMRC rates and examples. Transparent formulas. Updated within 24 hours of changes.'
      />

      {/* Trust Stats - Using StatsGrid */}
      <section className='container mx-auto max-w-7xl px-4 py-12'>
        <StatsGrid
          stats={[
            { icon: Award, value: '100%', label: 'HMRC Rates', color: 'from-primary to-accent' },
            { icon: FileText, value: 'Open', label: 'Source', color: 'from-accent to-primary' },
            {
              icon: Calendar,
              value: '<24h',
              label: 'Update Time',
              color: 'from-primary/80 to-accent/80',
            },
            { icon: Shield, value: '2025', label: 'Tax Year', color: 'from-orange-500 to-red-500' },
          ]}
          columns={4}
          variant='elevated'
        />
      </section>

      {/* Compliance Features */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <SectionHeading
            title='Professional Standards'
            subtitle='Multi-layer verification ensures every calculation meets HMRC standards'
            align='center'
          />

          <div className='grid gap-4 md:grid-cols-2 md:gap-8'>
            {COMPLIANCE_FEATURES.map((feature) => (
              <div key={feature.title}>
                <Card className='group h-full border-primary/20 p-8 transition-all duration-300 active:scale-[1.02] md:hover:scale-105 md:hover:border-primary/40 md:hover:shadow-2xl'>
                  <div className='mb-6 flex items-start justify-between'>
                    <div className='flex items-center gap-4'>
                      <div
                        className={`rounded-xl bg-gradient-to-br ${feature.color} p-3 shadow-lg`}
                      >
                        <feature.icon
                          className={`${ICON_SIZES.SIZE_6} text-white`}
                          aria-hidden='true'
                        />
                      </div>
                      <div>
                        <h3 className='mb-1 font-bold text-foreground text-xl'>{feature.title}</h3>
                        <p className='text-primary text-xs'>Updated: {feature.lastUpdated}</p>
                      </div>
                    </div>
                  </div>

                  <p className='mb-6 text-muted-foreground leading-relaxed'>
                    {feature.description}
                  </p>

                  <div className='space-y-3'>
                    {feature.details.map((detail) => (
                      <div key={detail} className='flex items-start gap-3'>
                        <CheckCircle
                          className={`mt-0.5 ${ICON_SIZES.SIZE_5} flex-shrink-0 text-primary`}
                          aria-hidden='true'
                        />
                        <span className='text-muted-foreground text-sm'>{detail}</span>
                      </div>
                    ))}
                  </div>

                  <div className='mt-6 border-primary/10 border-t pt-4'>
                    <div className='flex items-center gap-2 text-muted-foreground text-sm'>
                      <FileText className={ICON_SIZES.SIZE_4} aria-hidden='true' />
                      <span>Source: {feature.source}</span>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Statements */}
      <section className='bg-gradient-to-br from-accent/5 to-transparent py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <SectionHeading
            title='Official Compliance'
            subtitle='Legal verification and regulatory compliance statements'
            align='center'
          />

          <div className='space-y-6'>
            {COMPLIANCE_STATEMENTS.map((item) => (
              <div key={item.category}>
                <Card className='border-l-4 border-l-primary p-6 transition-all duration-300 md:hover:shadow-xl'>
                  <h3 className='mb-3 font-bold text-foreground text-xl'>{item.category}</h3>
                  <p className='mb-6 text-muted-foreground leading-relaxed'>{item.statement}</p>

                  <div className='grid gap-4 md:grid-cols-2'>
                    <div>
                      <div className='mb-1 font-semibold text-primary text-sm'>
                        Legal Compliance
                      </div>
                      <p className='text-muted-foreground text-sm'>{item.verification}</p>
                    </div>
                    <div>
                      <div className='mb-1 font-semibold text-primary text-sm'>Last Verified</div>
                      <p className='text-muted-foreground text-sm'>{item.lastVerified}</p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <SectionHeading
            title='Official Sources'
            subtitle='All data sourced from government authorities and professional bodies'
            align='center'
          />

          <div className='grid gap-4 md:grid-cols-2 md:gap-6'>
            {DATA_SOURCES.map((source) => (
              <div key={source.source}>
                <Card className='group h-full border-primary/20 p-6 transition-all duration-300 active:scale-[1.02] md:hover:scale-105 md:hover:border-primary/40 md:hover:shadow-xl'>
                  <div className='mb-4 flex items-start justify-between'>
                    <h3 className='font-bold text-foreground text-lg'>{source.source}</h3>
                    <ExternalLink
                      className={`${ICON_SIZES.SIZE_5} text-muted-foreground transition-colors group-hover:text-primary`}
                      aria-hidden='true'
                    />
                  </div>

                  <p className='mb-6 text-muted-foreground text-sm leading-relaxed'>
                    {source.description}
                  </p>

                  <div className='mb-6 space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Reliability:</span>
                      <span className='font-semibold text-primary'>{source.reliability}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Last Accessed:</span>
                      <span className='text-foreground'>{source.lastAccessed}</span>
                    </div>
                  </div>

                  <Button
                    asChild
                    variant='outline'
                    size='sm'
                    className='w-full transition-all group-hover:border-primary group-hover:bg-primary/10'
                  >
                    <a href={source.url} target='_blank' rel='noopener noreferrer'>
                      View Official Source
                    </a>
                  </Button>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className='bg-gradient-to-br from-primary/5 to-transparent py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <div>
            <Card className='border-yellow-500/30 p-8 md:p-12'>
              <div className='flex flex-col items-start gap-6 md:flex-row'>
                <div className='rounded-xl bg-yellow-500/10 p-4'>
                  <AlertTriangle
                    className={`${ICON_SIZES.SIZE_8} text-yellow-500`}
                    aria-hidden='true'
                  />
                </div>

                <div className='flex-1'>
                  <h3 className='mb-4 font-bold text-2xl text-foreground'>
                    Important Legal Notice
                  </h3>
                  <p className='mb-6 text-muted-foreground leading-relaxed'>
                    While we maintain strict compliance with HMRC regulations and professional
                    standards, this calculator is provided for informational purposes only. For
                    official tax calculations, complex scenarios, or professional tax advice, please
                    consult with a qualified accountant or tax advisor.
                  </p>

                  <div className='grid gap-4 md:grid-cols-2 md:gap-6'>
                    <div>
                      <div className='mb-3 font-semibold text-yellow-500'>✓ Suitable for:</div>
                      <ul className='space-y-2'>
                        {[
                          'Standard PAYE calculations',
                          'Salary and pension planning',
                          'General tax estimates',
                        ].map((item) => (
                          <li
                            key={item}
                            className='flex items-center gap-2 text-muted-foreground text-sm'
                          >
                            <CheckCircle
                              className={`${ICON_SIZES.SIZE_4} text-primary`}
                              aria-hidden='true'
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className='mb-3 font-semibold text-yellow-500'>
                        ⚠ Professional advice recommended:
                      </div>
                      <ul className='space-y-2 text-muted-foreground text-sm'>
                        <li>• Complex tax situations</li>
                        <li>• Multiple income sources</li>
                        <li>• Self-employment income</li>
                        <li>• Official HMRC submissions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Using ContactFooter */}
      <ContactFooter
        title='Questions About Compliance?'
        description="We're committed to maintaining the highest standards of accuracy and compliance. If you have questions about our methodology or sources, we're here to help."
        links={[
          { text: 'Try the Calculator', href: '/', type: 'link' },
          {
            text: 'support@payetax.co.uk',
            href: 'mailto:support@payetax.co.uk?subject=Compliance Issue Report',
            type: 'email',
          },
        ]}
      />
    </div>
  );
}
