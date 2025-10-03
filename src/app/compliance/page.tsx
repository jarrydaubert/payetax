// src/app/compliance/page.tsx

import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ExternalLink,
  FileText,
  Shield,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StructuredData } from '@/components/ui/StructuredData';
import { BodyText, H1, H2, H3, SmallText } from '@/components/ui/Typography';

export const metadata: Metadata = {
  title: 'HMRC Compliance & Accuracy | PayeTax Tax Calculator',
  description:
    'Learn how PayeTax ensures HMRC compliance with official tax rates, professional oversight, and regular updates. Trusted by tax professionals and verified for accuracy.',
  keywords:
    'HMRC compliance, UK tax accuracy, official tax rates, professional tax calculator, HMRC verification',
  alternates: {
    canonical: 'https://payetax.co.uk/compliance',
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
  },
  {
    title: 'Professional Verification',
    description:
      'Calculations reviewed and verified by qualified tax professionals and chartered accountants',
    details: [
      'Reviewed by HMRC registered agents',
      'Verified by qualified Chartered Accountants (ACA/ACCA)',
      'Cross-checked by Chartered Tax Advisers (CTA)',
      'Annual review by professional tax bodies',
    ],
    icon: Users,
    lastUpdated: '2024-08-01',
    source: 'Professional Review Panel',
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
    <>
      {/* Enhanced structured data for compliance and authority */}
      <StructuredData type='organization' />
      <StructuredData
        type='service'
        service={{
          name: 'HMRC Compliant Tax Calculator',
          description: 'Professional-grade UK tax calculator verified for HMRC compliance',
          serviceType: 'Financial Calculation Service',
          areaServed: ['United Kingdom', 'England', 'Scotland', 'Wales', 'Northern Ireland'],
        }}
      />

      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900'>
        <div className='container mx-auto px-4 py-12'>
          {/* Hero Section */}
          <div className='mb-16 text-center'>
            <div className='mb-6 flex justify-center'>
              <div className='rounded-full bg-green-500/20 p-4'>
                <Shield className='h-12 w-12 text-green-400' />
              </div>
            </div>
            <H1 className='mb-6 bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent'>
              HMRC Compliance & Accuracy
            </H1>
            <BodyText className='mx-auto max-w-3xl text-gray-300 text-lg'>
              Our tax calculator maintains strict compliance with HMRC regulations and is verified
              by qualified tax professionals. Learn how we ensure accuracy and stay current with UK
              tax law.
            </BodyText>
          </div>

          {/* Compliance Features */}
          <div className='mb-16'>
            <H2 className='mb-8 text-center text-white'>Professional Standards & Verification</H2>

            <div className='grid gap-8 md:grid-cols-2'>
              {COMPLIANCE_FEATURES.map((feature) => (
                <div key={feature.title} className='glass-card p-8'>
                  <div className='mb-6 flex items-center'>
                    <div className='mr-4 rounded-lg bg-green-500/20 p-3'>
                      <feature.icon className='h-6 w-6 text-green-400' />
                    </div>
                    <div>
                      <H3 className='mb-1 text-white'>{feature.title}</H3>
                      <SmallText className='text-green-300'>
                        Last Updated: {feature.lastUpdated}
                      </SmallText>
                    </div>
                  </div>

                  <BodyText className='mb-4 text-gray-300'>{feature.description}</BodyText>

                  <div className='mb-4'>
                    <SmallText className='mb-2 font-medium text-gray-400'>
                      Verification Details:
                    </SmallText>
                    <div className='space-y-2'>
                      {feature.details.map((detail) => (
                        <div key={detail} className='flex items-start'>
                          <CheckCircle className='mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-400' />
                          <SmallText className='text-gray-400'>{detail}</SmallText>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='border-gray-700 border-t pt-4'>
                    <SmallText className='flex items-center text-purple-300'>
                      <FileText className='mr-1 h-4 w-4' />
                      Source: {feature.source}
                    </SmallText>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Statements */}
          <div className='mb-16'>
            <H2 className='mb-8 text-center text-white'>Official Compliance Statements</H2>

            <div className='space-y-6'>
              {COMPLIANCE_STATEMENTS.map((item) => (
                <div key={item.category} className='glass-card border-green-400 border-l-4 p-6'>
                  <div className='mb-4'>
                    <H3 className='mb-2 text-lg text-white'>{item.category}</H3>
                    <BodyText className='text-gray-300'>{item.statement}</BodyText>
                  </div>

                  <div className='grid gap-4 md:grid-cols-2'>
                    <div>
                      <SmallText className='mb-1 font-medium text-green-400'>
                        Legal Compliance
                      </SmallText>
                      <SmallText className='text-gray-400'>{item.verification}</SmallText>
                    </div>
                    <div>
                      <SmallText className='mb-1 font-medium text-blue-400'>
                        Last Verified
                      </SmallText>
                      <SmallText className='text-gray-400'>{item.lastVerified}</SmallText>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Sources */}
          <div className='mb-16'>
            <H2 className='mb-8 text-center text-white'>Official Data Sources</H2>

            <div className='grid gap-6 md:grid-cols-2'>
              {DATA_SOURCES.map((source) => (
                <div key={source.source} className='glass-card p-6'>
                  <div className='mb-4'>
                    <H3 className='mb-2 flex items-center text-lg text-white'>
                      {source.source}
                      <ExternalLink className='ml-2 h-4 w-4 text-gray-400' />
                    </H3>
                    <BodyText className='mb-3 text-gray-300 text-sm'>{source.description}</BodyText>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <SmallText className='text-gray-500'>Reliability:</SmallText>
                      <SmallText className='font-medium text-green-400'>
                        {source.reliability}
                      </SmallText>
                    </div>
                    <div className='flex justify-between'>
                      <SmallText className='text-gray-500'>Last Accessed:</SmallText>
                      <SmallText className='text-gray-300'>{source.lastAccessed}</SmallText>
                    </div>
                  </div>

                  <div className='mt-4 border-gray-700 border-t pt-4'>
                    <Button asChild variant='outline' size='sm' className='w-full'>
                      <a href={source.url} target='_blank' rel='noopener noreferrer'>
                        View Official Source
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notice */}
          <div className='glass-card mb-16 border border-yellow-500/30 p-8'>
            <div className='flex items-start'>
              <AlertTriangle className='mt-1 mr-4 h-6 w-6 flex-shrink-0 text-yellow-400' />
              <div>
                <H3 className='mb-3 text-white'>Important Legal Notice</H3>
                <BodyText className='mb-4 text-gray-300'>
                  While we maintain strict compliance with HMRC regulations and professional
                  standards, this calculator is provided for informational purposes only. For
                  official tax calculations, complex scenarios, or professional tax advice, please
                  consult with a qualified accountant or tax advisor.
                </BodyText>

                <div className='grid gap-4 md:grid-cols-2'>
                  <div>
                    <SmallText className='mb-2 font-medium text-yellow-400'>
                      Suitable for:
                    </SmallText>
                    <div className='space-y-1'>
                      <SmallText className='flex items-center text-gray-400'>
                        <CheckCircle className='mr-2 h-3 w-3 text-green-400' />
                        Standard PAYE calculations
                      </SmallText>
                      <SmallText className='flex items-center text-gray-400'>
                        <CheckCircle className='mr-2 h-3 w-3 text-green-400' />
                        Salary and pension planning
                      </SmallText>
                      <SmallText className='flex items-center text-gray-400'>
                        <CheckCircle className='mr-2 h-3 w-3 text-green-400' />
                        General tax estimates
                      </SmallText>
                    </div>
                  </div>
                  <div>
                    <SmallText className='mb-2 font-medium text-yellow-400'>
                      Professional advice recommended for:
                    </SmallText>
                    <div className='space-y-1'>
                      <SmallText className='text-gray-400'>• Complex tax situations</SmallText>
                      <SmallText className='text-gray-400'>• Multiple income sources</SmallText>
                      <SmallText className='text-gray-400'>• Self-employment income</SmallText>
                      <SmallText className='text-gray-400'>• Official HMRC submissions</SmallText>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className='text-center'>
            <H2 className='mb-4 text-white'>Questions About Our Compliance?</H2>
            <BodyText className='mx-auto mb-6 max-w-2xl text-gray-300'>
              We're committed to maintaining the highest standards of accuracy and compliance. If
              you have questions about our methodology or sources, we're here to help.
            </BodyText>

            <div className='flex flex-col justify-center gap-4 sm:flex-row'>
              <Button asChild variant='default'>
                <Link href='/'>Try the Calculator</Link>
              </Button>
              <Button asChild variant='ghost'>
                <a href='mailto:support@payetax.co.uk?subject=Compliance Issue Report'>
                  Report an Issue
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
