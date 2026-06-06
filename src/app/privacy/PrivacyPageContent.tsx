// src/app/privacy/PrivacyPageContent.tsx
// Server Component - all presentational, no hooks/handlers

import { Calendar, CheckCircle, Cookie, Eye, Lock, Shield, X } from 'lucide-react';

// Last updated date - update when privacy policy changes
const PRIVACY_LAST_UPDATED = 'June 5, 2026';

import { ComparisonCards } from '@/components/molecules/ComparisonCards';
import { DataFlowCards } from '@/components/molecules/DataFlowCards';
import { FeatureGrid } from '@/components/molecules/FeatureGrid';
import { PageHero } from '@/components/molecules/PageHero';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import {
  PRIVACY_DATA_FLOW,
  PRIVACY_DO_DO,
  PRIVACY_DONT_DO,
  PRIVACY_PRINCIPLES,
} from '@/constants/pages/privacyPageData';
import { cn } from '@/lib/utils';

export function PrivacyPageContent() {
  return (
    <div className={'min-h-screen'}>
      {/* Hero Section */}
      <PageHero
        badge={{ icon: Shield, text: 'Privacy Policy' }}
        title={
          <>
            Your Data Stays
            <br />
            <span className='text-foreground'>In Your Browser</span>
          </>
        }
        subtitle='Client-side calculations mean zero server-side data storage. Not one byte of your financial information leaves your device.'
      />

      {/* Last Updated */}
      <section className={'py-12 md:py-20'}>
        <div
          className={cn('flex items-center justify-center gap-2 text-muted-foreground', 'text-sm')}
        >
          <Calendar className={'size-4'} aria-hidden='true' />
          <span>Last updated: {PRIVACY_LAST_UPDATED}</span>
        </div>
      </section>

      {/* Quick Summary */}
      <section className={'py-12 md:py-20'}>
        <div className={'container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'}>
          <SectionHeading
            badge={{ icon: CheckCircle, text: 'Quick Summary' }}
            title='The 30-Second Version'
            subtitle='Everything you need to know at a glance'
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
      <section className={'border-border/60 border-y bg-primary/5 py-12 md:py-20'}>
        <div className={'container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'}>
          <FeatureGrid
            heading={{
              title: 'How We Protect Your Privacy',
              subtitle: 'Four architectural decisions that make your data truly private',
              align: 'center',
            }}
            features={PRIVACY_PRINCIPLES}
            columns={2}
            variant='showcase'
          />
        </div>
      </section>

      {/* Data Flow */}
      <section className={'py-12 md:py-20'}>
        <div className={'container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'}>
          <SectionHeading
            badge={{ icon: Lock, text: 'Data Flow' }}
            title='Where Your Tax Data Goes'
            subtitle="Spoiler: Nowhere. Here's the technical breakdown."
            align='center'
          />

          <DataFlowCards cards={PRIVACY_DATA_FLOW} columns={3} />
        </div>
      </section>

      {/* Analytics Section */}
      <section className={'border-border/60 border-y bg-card py-12 md:py-20'}>
        <div className={'container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'}>
          <FeatureGrid
            heading={{
              badge: { icon: Eye, text: 'Analytics' },
              title: 'What We Track',
              subtitle: 'Privacy-conscious analytics and monitoring',
              align: 'center',
            }}
            features={[
              {
                icon: Cookie,
                title: 'Analytics Tools',
                description:
                  'We use Vercel Web Analytics for cookieless traffic counts, Google Analytics 4 with Consent Mode, and Sentry for calculator error monitoring. GA4 only tracks after you accept analytics cookies.',
              },
              {
                icon: Eye,
                title: 'What We Track',
                description:
                  'Page views, anonymized salary ranges (not exact values), calculator usage patterns, and calculator error context needed to diagnose failures. No financial data is intentionally recorded.',
              },
              {
                icon: Shield,
                title: 'Your Control',
                description:
                  'Decline analytics via our cookie banner to block GA4 tracking entirely. Cookieless Vercel Web Analytics still helps us understand basic traffic. The calculator works identically either way.',
              },
            ]}
            columns={3}
            variant='default'
          />
        </div>
      </section>
    </div>
  );
}
