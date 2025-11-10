// src/app/privacy/page.tsx

import Calendar from 'lucide-react/dist/esm/icons/calendar.js';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle.js';
import Cookie from 'lucide-react/dist/esm/icons/cookie.js';
import Eye from 'lucide-react/dist/esm/icons/eye.js';
import Lock from 'lucide-react/dist/esm/icons/lock.js';
import Shield from 'lucide-react/dist/esm/icons/shield.js';
import X from 'lucide-react/dist/esm/icons/x.js';
import type { Metadata } from 'next';
import { GradientText } from '@/components/atoms/GradientText';
import { ComparisonCards } from '@/components/molecules/ComparisonCards';
import { ContactFooter } from '@/components/molecules/ContactFooter';
import { DataFlowCards } from '@/components/molecules/DataFlowCards';
import { FeatureGrid } from '@/components/molecules/FeatureGrid';
import { PageHero } from '@/components/molecules/PageHero';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { ICON_SIZES, LAYOUT, SPACING } from '@/constants/designTokens';
import {
  PRIVACY_DATA_FLOW,
  PRIVACY_DO_DO,
  PRIVACY_DONT_DO,
  PRIVACY_PRINCIPLES,
} from '@/constants/pages/privacyPageData';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Privacy Policy | PayeTax - Client-Side Tax Calculations',
  description:
    'PayeTax privacy policy: All tax calculations run in your browser with zero server-side data storage. Learn how we protect your financial privacy.',
  keywords:
    'privacy policy, data privacy, client-side calculations, zero data storage, uk tax calculator privacy',
  alternates: {
    canonical: 'https://payetax.co.uk/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | PayeTax',
    description: 'All tax calculations run in your browser. Zero server-side data storage.',
    url: 'https://payetax.co.uk/privacy',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return (
    <div className={LAYOUT.PAGE_WRAPPER}>
      {/* Hero Section */}
      <PageHero
        badge={{ icon: Shield, text: 'Privacy Policy' }}
        title={
          <>
            <GradientText variant='brand-full' as='span'>
              Your Privacy
            </GradientText>
            <br />
            <span className='text-foreground'>Comes First</span>
          </>
        }
        subtitle="Radical transparency about your data. Here's exactly what we do and don't do with your information."
      />

      {/* Last Updated */}
      <section className={cn(LAYOUT.CONTAINER, SPACING.PY_4)}>
        <div className='flex items-center justify-center gap-2 text-muted-foreground text-sm'>
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

      {/* Contact Footer */}
      <ContactFooter
        title='Privacy Questions?'
        description="We're committed to transparency. If you have questions about how we handle your data, we're here to answer."
        links={[
          {
            text: 'privacy@payetax.co.uk',
            href: 'mailto:privacy@payetax.co.uk?subject=Privacy Question',
            type: 'email',
          },
          { text: 'View Our Code', href: 'https://github.com/jarryddev/payetax', type: 'link' },
        ]}
      />
    </div>
  );
}
