// src/app/privacy/PrivacyPageClient.tsx
'use client';

import Calendar from 'lucide-react/dist/esm/icons/calendar.js';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle.js';
import Cookie from 'lucide-react/dist/esm/icons/cookie.js';
import Eye from 'lucide-react/dist/esm/icons/eye.js';
import Lock from 'lucide-react/dist/esm/icons/lock.js';
import Shield from 'lucide-react/dist/esm/icons/shield.js';
import X from 'lucide-react/dist/esm/icons/x.js';
import { GradientText } from '@/components/atoms/GradientText';
import { ComparisonCards } from '@/components/molecules/ComparisonCards';
import { DataFlowCards } from '@/components/molecules/DataFlowCards';
import { FeatureGrid } from '@/components/molecules/FeatureGrid';
import { PageHero } from '@/components/molecules/PageHero';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { ICON_SIZES, LAYOUT, TYPOGRAPHY } from '@/constants/designTokens';
import {
  PRIVACY_DATA_FLOW,
  PRIVACY_DO_DO,
  PRIVACY_DONT_DO,
  PRIVACY_PRINCIPLES,
} from '@/constants/pages/privacyPageData';
import { cn } from '@/lib/utils';

export function PrivacyPageClient() {
  return (
    <div className={LAYOUT.PAGE_WRAPPER}>
      {/* Hero Section */}
      <PageHero
        badge={{ icon: Shield, text: 'Privacy Policy' }}
        title={
          <>
            <GradientText variant='brand-full' as='span'>
              Your Data Stays
            </GradientText>
            <br />
            <span className='text-foreground'>In Your Browser</span>
          </>
        }
        subtitle='Client-side calculations mean zero server-side data storage. Not one byte of your financial information leaves your device.'
      />

      {/* Last Updated */}
      <section className={LAYOUT.SECTION}>
        <div
          className={cn(
            'flex items-center justify-center gap-2 text-muted-foreground',
            TYPOGRAPHY.TEXT_SM
          )}
        >
          <Calendar className={ICON_SIZES.SIZE_4} aria-hidden='true' />
          <span>Last updated: October 4, 2025</span>
        </div>
      </section>

      {/* Quick Summary */}
      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER_MD}>
          <SectionHeading
            badge={{ icon: CheckCircle, text: 'Quick Summary' }}
            title={<GradientText variant='brand'>The 30-Second Version</GradientText>}
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
      <section className={LAYOUT.SECTION_TINTED_PRIMARY}>
        <div className={LAYOUT.CONTAINER}>
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
      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER_MD}>
          <SectionHeading
            badge={{ icon: Lock, text: 'Data Flow' }}
            title={<GradientText variant='brand'>Where Your Tax Data Goes</GradientText>}
            subtitle="Spoiler: Nowhere. Here's the technical breakdown."
            align='center'
          />

          <DataFlowCards cards={PRIVACY_DATA_FLOW} columns={3} />
        </div>
      </section>

      {/* Analytics Section */}
      <section className={LAYOUT.SECTION_TINTED_ACCENT}>
        <div className={LAYOUT.CONTAINER_MD}>
          <FeatureGrid
            heading={{
              badge: { icon: Eye, text: 'Analytics' },
              title: 'What We Track (With Your Permission)',
              subtitle: 'Anonymous analytics that respect your privacy',
              align: 'center',
            }}
            features={[
              {
                icon: Cookie,
                title: 'Privacy-Focused Analytics',
                description:
                  'We use Umami Analytics - a privacy-focused, GDPR-compliant alternative to Google Analytics. No cookies, no cross-site tracking, no personal data collection.',
              },
              {
                icon: Eye,
                title: 'What We Track',
                description:
                  'Page views, referral sources, device types (mobile/desktop), and country-level location. Nothing personally identifiable. No IP addresses stored.',
              },
              {
                icon: Shield,
                title: 'Your Control',
                description:
                  'You can decline analytics entirely via our cookie banner. The calculator works exactly the same. We also respect Do Not Track browser settings.',
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
