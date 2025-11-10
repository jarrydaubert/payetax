// src/app/about/page.tsx
'use client';

import Shield from 'lucide-react/dist/esm/icons/shield.js';
import { GradientText } from '@/components/atoms/GradientText';
import { ContactFooter } from '@/components/molecules/ContactFooter';
import { FeatureGrid } from '@/components/molecules/FeatureGrid';
import { PageHero } from '@/components/molecules/PageHero';
import { StatsGrid } from '@/components/molecules/StatsGrid';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ICON_SIZES, LAYOUT, SPACING, SURFACES, TYPOGRAPHY } from '@/constants/designTokens';
import {
  ABOUT_STATS,
  ABOUT_TECH_STACK,
  ABOUT_UNIQUE_FEATURES,
  ABOUT_VALUES,
} from '@/constants/pages/aboutPageData';
import { cn } from '@/lib/utils';

// Metadata moved to layout.tsx since this is a client component
export const _metadata = {
  title: 'About PayeTax | Free UK Tax Calculator Built for Privacy',
  description:
    'Free UK PAYE tax calculator with complete privacy. Client-side calculations, zero data storage, instant results using official HMRC rates for 2025-26.',
  keywords:
    'about payetax, uk tax calculator, privacy-first tax calculator, free paye calculator, open source tax tool, hmrc rates calculator',
  alternates: {
    canonical: 'https://payetax.co.uk/about',
  },
  openGraph: {
    title: 'About PayeTax | Free UK Tax Calculator Built for Privacy',
    description:
      'The UK tax calculator that respects your privacy, delivers instant accuracy, and costs nothing. No compromises.',
    url: 'https://payetax.co.uk/about',
    type: 'website',
    siteName: 'PayeTax',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About PayeTax',
    description: 'Free UK tax calculator built for privacy. No data collection, instant results.',
  },
};

export default function AboutPage() {
  return (
    <div className={LAYOUT.PAGE_WRAPPER}>
      {/* Hero Section */}
      <PageHero
        badge={{ icon: Shield, text: 'About PayeTax' }}
        title={
          <>
            <GradientText variant='brand-full' as='span'>
              Built for Privacy
            </GradientText>
            <br />
            <span className='text-foreground'>Designed for You</span>
          </>
        }
        subtitle={[
          "We're not here to collect your data. We're here to help you understand your take-home pay with zero compromises on privacy.",
          'Free forever. No premium tiers. No paywalls. Just honest tax calculations built with care.',
        ]}
      />

      {/* Stats Section */}
      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER}>
          <StatsGrid stats={ABOUT_STATS} columns={4} variant='elevated' />
        </div>
      </section>

      {/* Values Section */}
      <section className={LAYOUT.SECTION_TINTED_PRIMARY}>
        <div className={LAYOUT.CONTAINER}>
          <FeatureGrid
            heading={{
              badge: { icon: Shield, text: 'Our Values' },
              title: 'What We Stand For',
              subtitle: 'The principles that guide every decision we make',
              align: 'center',
            }}
            features={ABOUT_VALUES}
            columns={2}
            variant='showcase'
          />
        </div>
      </section>

      {/* Unique Features Section */}
      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER}>
          <FeatureGrid
            heading={{
              title: 'What Makes Us Different',
              subtitle: "Features you won't find in other tax calculators",
              align: 'center',
            }}
            features={ABOUT_UNIQUE_FEATURES}
            columns={3}
            variant='showcase'
          />
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className={LAYOUT.SECTION_TINTED_ACCENT}>
        <div className={LAYOUT.CONTAINER}>
          <FeatureGrid
            heading={{
              title: 'Built with Modern Technology',
              subtitle: 'Professional tools for a free service',
              align: 'center',
            }}
            features={ABOUT_TECH_STACK}
            columns={3}
            variant='default'
          />
        </div>
      </section>

      {/* Team Section */}
      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER_SM}>
          <div className={LAYOUT.TEXT_CENTER}>
            <Badge variant='outline' className={cn(SPACING.MB_6, ICON_SIZES.SIZE_4)}>
              The Team
            </Badge>
            <h2 className={cn(SPACING.MB_4, 'font-bold text-foreground', TYPOGRAPHY.TEXT_4XL)}>
              Built by One Person
            </h2>
            <div
              className={cn(LAYOUT.CENTERED_CONTENT, SPACING.SPACE_Y_4, 'text-muted-foreground')}
            >
              <p className={TYPOGRAPHY.TEXT_LG}>
                PayeTax is a solo project built with care by a developer who got tired of
                complicated, data-hungry tax calculators.
              </p>
              <p>
                Every line of code, every design decision, every privacy guarantee comes from a
                single person who believes tax calculations should be private, accurate, and free.
              </p>
            </div>
          </div>

          <Card
            className={cn(
              LAYOUT.CENTERED_CONTENT,
              SPACING.MT_12,
              SURFACES.CARD_LARGE,
              SURFACES.BG_GRADIENT_PRIMARY
            )}
          >
            <div className={cn(SPACING.SPACE_Y_4, LAYOUT.TEXT_CENTER)}>
              <p className={cn('font-semibold text-foreground', TYPOGRAPHY.TEXT_XL)}>
                Why build this?
              </p>
              <p className='text-muted-foreground'>
                Because understanding your take-home pay shouldn&apos;t require sacrificing your
                privacy or paying subscription fees. Tax calculations are a basic utility that
                should be accessible, accurate, and respect your data.
              </p>
              <p className='text-muted-foreground'>
                No VC funding. No premium tiers. No data harvesting. Just a useful tool built
                because it needed to exist.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Contact Footer */}
      <ContactFooter
        title='Questions or Feedback?'
        description="We're always improving. If you have suggestions, found a bug, or just want to say hi, reach out!"
        links={[
          {
            text: 'feedback@payetax.co.uk',
            href: 'mailto:feedback@payetax.co.uk?subject=Feedback',
            type: 'email',
          },
          { text: 'View Source Code', href: 'https://github.com/jarryddev/payetax', type: 'link' },
        ]}
      />
    </div>
  );
}
