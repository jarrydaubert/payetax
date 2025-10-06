// src/app/compliance/page.tsx
'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle,
  ExternalLink,
  FileText,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
    color: 'from-blue-500 to-cyan-500',
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
    icon: Users,
    lastUpdated: '2024-08-01',
    source: 'HMRC Example Calculations',
    color: 'from-purple-500 to-pink-500',
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
    color: 'from-green-500 to-emerald-500',
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
    color: 'from-orange-500 to-red-500',
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
      {/* Hero Section */}
      <section className='relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-transparent pt-20 md:pt-32 pb-10 md:pb-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='text-center'
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className='mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-6 py-2.5 backdrop-blur-sm'
            >
              <Shield className='size-5 text-primary' />
              <span className='font-semibold text-foreground text-sm'>HMRC Compliance</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='mb-6 font-bold text-5xl leading-tight md:text-7xl'
            >
              <span className='bg-gradient-to-r from-brand-gradient-start via-brand-accent to-brand-gradient-end bg-clip-text text-transparent'>
                Verified Accuracy
              </span>
              <br />
              <span className='text-foreground'>Official Compliance</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className='mx-auto mb-12 max-w-3xl text-muted-foreground text-xl leading-relaxed md:text-2xl'
            >
              Every calculation verified against official HMRC rates and examples. Transparent
              formulas. Updated within 24 hours of changes.
            </motion.p>

            {/* Trust Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className='grid gap-6 md:grid-cols-4'
            >
              {[
                {
                  icon: Award,
                  value: '100%',
                  label: 'HMRC Rates',
                  color: 'from-blue-500 to-cyan-500',
                },
                {
                  icon: FileText,
                  value: 'Open',
                  label: 'Source',
                  color: 'from-purple-500 to-pink-500',
                },
                {
                  icon: Calendar,
                  value: '<24h',
                  label: 'Update Time',
                  color: 'from-green-500 to-emerald-500',
                },
                {
                  icon: Shield,
                  value: '2025',
                  label: 'Tax Year',
                  color: 'from-orange-500 to-red-500',
                },
              ].map((stat, _idx) => (
                <Card
                  key={stat.label}
                  className='group relative overflow-hidden border-primary/20 p-8 transition-all duration-300 md:hover:scale-105 active:scale-[1.02] md:hover:border-primary/40 md:hover:shadow-2xl'
                >
                  <div
                    className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`}
                  />
                  <stat.icon className='mx-auto mb-4 size-10 text-primary' />
                  <div className='relative font-bold text-3xl text-foreground'>{stat.value}</div>
                  <div className='mt-2 text-muted-foreground text-sm'>{stat.label}</div>
                </Card>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Compliance Features */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className='mb-16 text-center'
          >
            <h2 className='mb-4 font-bold text-4xl text-foreground md:text-5xl'>
              Professional Standards
            </h2>
            <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
              Multi-layer verification ensures every calculation meets HMRC standards
            </p>
          </motion.div>

          <div className='grid gap-4 md:gap-8 md:grid-cols-2'>
            {COMPLIANCE_FEATURES.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + idx * 0.1 }}
              >
                <Card className='group h-full border-primary/20 p-8 transition-all duration-300 md:hover:scale-105 active:scale-[1.02] md:hover:border-primary/40 md:hover:shadow-2xl'>
                  <div className='mb-6 flex items-start justify-between'>
                    <div className='flex items-center gap-4'>
                      <div
                        className={`rounded-xl bg-gradient-to-br ${feature.color} p-3 shadow-lg`}
                      >
                        <feature.icon className='size-6 text-white' />
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
                        <CheckCircle className='mt-0.5 size-5 flex-shrink-0 text-primary' />
                        <span className='text-muted-foreground text-sm'>{detail}</span>
                      </div>
                    ))}
                  </div>

                  <div className='mt-6 border-primary/10 border-t pt-4'>
                    <div className='flex items-center gap-2 text-muted-foreground text-sm'>
                      <FileText className='size-4' />
                      <span>Source: {feature.source}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Statements */}
      <section className='bg-gradient-to-br from-accent/5 to-transparent py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className='mb-16 text-center'
          >
            <h2 className='mb-4 font-bold text-4xl text-foreground md:text-5xl'>
              Official Compliance
            </h2>
            <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
              Legal verification and regulatory compliance statements
            </p>
          </motion.div>

          <div className='space-y-6'>
            {COMPLIANCE_STATEMENTS.map((item, idx) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + idx * 0.1 }}
              >
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className='mb-16 text-center'
          >
            <h2 className='mb-4 font-bold text-4xl text-foreground md:text-5xl'>
              Official Sources
            </h2>
            <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
              All data sourced from government authorities and professional bodies
            </p>
          </motion.div>

          <div className='grid gap-4 md:gap-6 md:grid-cols-2'>
            {DATA_SOURCES.map((source, idx) => (
              <motion.div
                key={source.source}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.3 + idx * 0.1 }}
              >
                <Card className='group h-full border-primary/20 p-6 transition-all duration-300 md:hover:scale-105 active:scale-[1.02] md:hover:border-primary/40 md:hover:shadow-xl'>
                  <div className='mb-4 flex items-start justify-between'>
                    <h3 className='font-bold text-foreground text-lg'>{source.source}</h3>
                    <ExternalLink className='size-5 text-muted-foreground transition-colors group-hover:text-primary' />
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className='bg-gradient-to-br from-primary/5 to-transparent py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            <Card className='border-yellow-500/30 p-8 md:p-12'>
              <div className='flex flex-col items-start gap-6 md:flex-row'>
                <div className='rounded-xl bg-yellow-500/10 p-4'>
                  <AlertTriangle className='size-8 text-yellow-500' />
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

                  <div className='grid gap-4 md:gap-6 md:grid-cols-2'>
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
                            <CheckCircle className='size-4 text-primary' />
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
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.6 }}
            className='text-center'
          >
            <Sparkles className='mx-auto mb-6 size-12 text-primary' />
            <h2 className='mb-4 font-bold text-4xl text-foreground md:text-5xl'>
              Questions About Compliance?
            </h2>
            <p className='mx-auto mb-8 max-w-2xl text-lg text-muted-foreground leading-relaxed'>
              We're committed to maintaining the highest standards of accuracy and compliance. If
              you have questions about our methodology or sources, we're here to help.
            </p>

            <div className='flex flex-col justify-center gap-4 sm:flex-row'>
              <Button asChild size='lg' className='group'>
                <Link href='/'>
                  Try the Calculator
                  <Sparkles className='ml-2 size-4 transition-transform group-hover:rotate-12' />
                </Link>
              </Button>
              <Button asChild variant='outline' size='lg'>
                <a href='mailto:support@payetax.co.uk?subject=Compliance Issue Report'>
                  Report an Issue
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
