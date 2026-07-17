// src/app/privacy/PrivacyPageContent.tsx
// Server Component - all presentational, no hooks/handlers

import { Calendar, CheckCircle, FileText, Lock, Scale, Shield, X } from 'lucide-react';
import Link from 'next/link';
import { ComparisonCards } from '@/components/molecules/ComparisonCards';
import { DataFlowCards } from '@/components/molecules/DataFlowCards';
import { FeatureGrid } from '@/components/molecules/FeatureGrid';
import { LegalSection } from '@/components/molecules/LegalSection';
import { PageHero } from '@/components/molecules/PageHero';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import {
  PRIVACY_CONTACT_EMAIL,
  PRIVACY_DATA_CATEGORIES,
  PRIVACY_DATA_FLOW,
  PRIVACY_DO_DO,
  PRIVACY_DONT_DO,
  PRIVACY_LAST_UPDATED,
  PRIVACY_PRINCIPLES,
  PRIVACY_PROCESSORS,
  PRIVACY_RIGHTS,
  PRIVACY_STORAGE_INVENTORY,
  PRIVACY_TOC,
} from '@/constants/pages/privacyPageData';
import { cn } from '@/lib/utils';

export function PrivacyPageContent() {
  return (
    <div className='min-h-screen'>
      {/* Hero */}
      <PageHero
        badge={{ icon: Shield, text: 'Privacy Policy' }}
        title={
          <>
            Your Tax Data Stays
            <br />
            <span className='text-foreground'>On Your Device</span>
          </>
        }
        subtitle='Calculations run in your browser. The only time your inputs leave your device is when you choose to email your results — and even then we never store them.'
      />

      {/* Last Updated */}
      <section className='py-8'>
        <div
          className={cn('flex items-center justify-center gap-2 text-muted-foreground', 'text-sm')}
        >
          <Calendar className='size-4' aria-hidden='true' />
          <span>Last updated: {PRIVACY_LAST_UPDATED}</span>
        </div>
      </section>

      {/* Quick Summary */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
          <SectionHeading
            badge={{ icon: CheckCircle, text: 'Quick Summary' }}
            title='The 30-Second Version'
            subtitle='Everything you need to know at a glance. The full policy follows below.'
            align='center'
          />

          <ComparisonCards
            left={{
              icon: X,
              title: "What We DON'T Do",
              items: PRIVACY_DONT_DO,
              variant: 'negative',
            }}
            right={{
              icon: CheckCircle,
              title: 'What We DO',
              items: PRIVACY_DO_DO,
              variant: 'positive',
            }}
          />
        </div>
      </section>

      {/* Privacy Principles */}
      <section className='border-border/60 border-y bg-primary/5 py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <FeatureGrid
            heading={{
              title: 'How We Protect Your Privacy',
              subtitle: 'Four architectural decisions that keep your data yours',
              align: 'center',
            }}
            features={PRIVACY_PRINCIPLES}
            columns={2}
            variant='showcase'
          />
        </div>
      </section>

      {/* Data Flow */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
          <SectionHeading
            badge={{ icon: Lock, text: 'Data Flow' }}
            title='Where Your Tax Data Goes'
            subtitle='A plain-language map of what happens to your inputs.'
            align='center'
          />

          <DataFlowCards cards={PRIVACY_DATA_FLOW} columns={3} />
        </div>
      </section>

      {/* Formal policy */}
      <section className='border-border/60 border-t bg-card py-12 md:py-20'>
        <div className='container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
          <SectionHeading
            badge={{ icon: Scale, text: 'Full Policy' }}
            title='Privacy Policy'
            subtitle='The detail behind the summary, written to meet UK GDPR.'
          />

          {/* Contents */}
          <nav aria-label='Privacy policy contents' className='mb-12'>
            <ul className='flex flex-wrap gap-2'>
              {PRIVACY_TOC.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className='inline-flex rounded-sm border border-border bg-background px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:border-primary/45 hover:text-foreground'
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className='space-y-12'>
            {/* biome-ignore lint/correctness/useUniqueElementIds: Static ID required for in-page anchor navigation */}
            <LegalSection id='controller' title='Who we are'>
              <p>
                PayeTax is a free UK tax calculator operated by Jarryd Aubert (“PayeTax”, “we”,
                “us”). We are the data controller for the limited personal data described in this
                policy. You can reach us at{' '}
                <a
                  href={`mailto:${PRIVACY_CONTACT_EMAIL}`}
                  className='font-mono text-primary hover:text-primary/80'
                >
                  {PRIVACY_CONTACT_EMAIL}
                </a>
                .
              </p>
              <p>
                This policy explains what we process, why, the lawful basis for each, who else is
                involved, and the rights you have under UK GDPR.
              </p>
            </LegalSection>

            {/* biome-ignore lint/correctness/useUniqueElementIds: Static ID required for in-page anchor navigation */}
            <LegalSection id='data-we-process' title='Data we process'>
              <p>
                Your calculator inputs are processed in your browser to produce a result and are not
                sent to us for that purpose. We only receive your inputs if you ask us to email your
                results, and we do not store them. The table below summarises every category.
              </p>
              <div className='overflow-x-auto rounded-sm border border-border bg-background'>
                <table className='w-full min-w-3xl border-collapse text-sm'>
                  <thead>
                    <tr className='border-border/60 border-b text-left'>
                      <th className='px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                        Category
                      </th>
                      <th className='px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                        Data
                      </th>
                      <th className='px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                        Purpose
                      </th>
                      <th className='px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                        Lawful basis
                      </th>
                      <th className='px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                        Retention
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRIVACY_DATA_CATEGORIES.map((row) => (
                      <tr
                        key={row.category}
                        className='border-border/40 border-b align-top last:border-0'
                      >
                        <td className='px-4 py-3 font-semibold text-foreground'>{row.category}</td>
                        <td className='px-4 py-3 text-muted-foreground'>{row.data}</td>
                        <td className='px-4 py-3 text-muted-foreground'>{row.purpose}</td>
                        <td className='px-4 py-3 text-muted-foreground'>{row.lawfulBasis}</td>
                        <td className='px-4 py-3 text-muted-foreground'>{row.retention}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </LegalSection>

            {/* biome-ignore lint/correctness/useUniqueElementIds: Static ID required for in-page anchor navigation */}
            <LegalSection id='processors' title='Third parties we rely on'>
              <p>
                We use a small set of trusted processors to run the site and deliver features you
                request. Some may process data outside the UK; where they do, transfers rely on
                appropriate safeguards such as the UK International Data Transfer Agreement or
                Standard Contractual Clauses. We do not sell your data or use advertising networks.
              </p>
              <div className='overflow-x-auto rounded-sm border border-border bg-background'>
                <table className='w-full min-w-3xl border-collapse text-sm'>
                  <thead>
                    <tr className='border-border/60 border-b text-left'>
                      <th className='px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                        Provider
                      </th>
                      <th className='px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                        Role
                      </th>
                      <th className='px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                        Data involved
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRIVACY_PROCESSORS.map((row) => (
                      <tr
                        key={row.name}
                        className='border-border/40 border-b align-top last:border-0'
                      >
                        <td className='px-4 py-3 font-semibold text-foreground'>{row.name}</td>
                        <td className='px-4 py-3 text-muted-foreground'>{row.role}</td>
                        <td className='px-4 py-3 text-muted-foreground'>{row.data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </LegalSection>

            {/* biome-ignore lint/correctness/useUniqueElementIds: Static ID required for in-page anchor navigation */}
            <LegalSection id='cookies' title='Cookies and analytics'>
              <p>
                We do not load analytics cookies before you consent. On your first visit you can
                accept or decline analytics; declining is as easy as accepting. Google Analytics 4
                runs only after you opt in — and if you later withdraw consent, we switch it off and
                remove its cookies. Vercel&apos;s traffic and performance signals are designed to
                work without cookies or persistent identifiers and help us understand basic usage
                and page speed either way.
              </p>
              <p>This is everything the site stores in your browser:</p>
              <div className='overflow-x-auto rounded-sm border border-border bg-background'>
                <table className='w-full min-w-3xl border-collapse text-sm'>
                  <thead>
                    <tr className='border-border/60 border-b text-left'>
                      <th className='px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                        Name
                      </th>
                      <th className='px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                        Type
                      </th>
                      <th className='px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                        Purpose
                      </th>
                      <th className='px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRIVACY_STORAGE_INVENTORY.map((row) => (
                      <tr
                        key={row.name}
                        className='border-border/40 border-b align-top last:border-0'
                      >
                        <td className='px-4 py-3 font-mono font-semibold text-foreground'>
                          {row.name}
                        </td>
                        <td className='px-4 py-3 text-muted-foreground'>{row.type}</td>
                        <td className='px-4 py-3 text-muted-foreground'>{row.purpose}</td>
                        <td className='px-4 py-3 text-muted-foreground'>{row.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                Cookie lifetimes above are browser-side and separate from how long Google retains
                analytics data on its servers: our GA4 property keeps event-level data for 2 months
                and user-level data for 14 months.
              </p>
              <p>
                You can change your choice at any time using the{' '}
                <span className='font-medium text-foreground'>Cookie Settings</span> link in the
                footer. The calculator works exactly the same whether or not you accept analytics.
              </p>
            </LegalSection>

            {/* biome-ignore lint/correctness/useUniqueElementIds: Static ID required for in-page anchor navigation */}
            <LegalSection id='your-rights' title='Your rights'>
              <p>Under UK GDPR you have the following rights over your personal data:</p>
              <ul className='space-y-2'>
                {PRIVACY_RIGHTS.map((right) => (
                  <li key={right.title} className='flex items-start gap-3'>
                    <CheckCircle
                      className='mt-0.5 size-4 flex-shrink-0 text-primary'
                      aria-hidden='true'
                    />
                    <span>
                      <span className='font-medium text-foreground'>{right.title}:</span>{' '}
                      {right.description}
                    </span>
                  </li>
                ))}
              </ul>
              <p>
                To exercise any of these, email us at{' '}
                <a
                  href={`mailto:${PRIVACY_CONTACT_EMAIL}`}
                  className='font-mono text-primary hover:text-primary/80'
                >
                  {PRIVACY_CONTACT_EMAIL}
                </a>
                . We aim to respond within one month.
              </p>
            </LegalSection>

            {/* biome-ignore lint/correctness/useUniqueElementIds: Static ID required for in-page anchor navigation */}
            <LegalSection id='contact' title='Contact and complaints'>
              <p>
                Questions about this policy or how we handle data? Email{' '}
                <a
                  href={`mailto:${PRIVACY_CONTACT_EMAIL}`}
                  className='font-mono text-primary hover:text-primary/80'
                >
                  {PRIVACY_CONTACT_EMAIL}
                </a>
                .
              </p>
              <p>
                If you are unhappy with how we have handled your data, you can complain to the UK
                Information Commissioner’s Office (ICO) at{' '}
                <a
                  href='https://ico.org.uk'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary hover:text-primary/80'
                >
                  ico.org.uk
                </a>
                . We would appreciate the chance to resolve any concern first.
              </p>
              <p className='flex items-center gap-2 text-sm'>
                <FileText className='size-4' aria-hidden='true' />
                <Link href='/compliance' className='text-primary hover:text-primary/80'>
                  See our compliance and data-sources page
                </Link>
              </p>
            </LegalSection>
          </div>
        </div>
      </section>
    </div>
  );
}
