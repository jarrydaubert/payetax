// src/app/about/page.tsx
'use client';

import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right.js';
import Shield from 'lucide-react/dist/esm/icons/shield.js';
import Link from 'next/link';
import { GradientText } from '@/components/atoms/GradientText';
import { ContactFooter } from '@/components/molecules/ContactFooter';
import { FeatureGrid } from '@/components/molecules/FeatureGrid';
import { PageHero } from '@/components/molecules/PageHero';
import { StatsGrid } from '@/components/molecules/StatsGrid';
import { StructuredData } from '@/components/organisms/StructuredData';
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

export default function AboutPage() {
  return (
    <div className={LAYOUT.PAGE_WRAPPER}>
      {/* Structured Data for SEO */}
      <StructuredData type='organization' />
      <StructuredData
        type='person'
        expert={{
          name: 'Jarryd',
          jobTitle: 'Creator & Developer',
          description: 'Creator of PayeTax, building privacy-first tax tools for UK taxpayers.',
          organization: 'PayeTax',
        }}
      />

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
              title: 'Why It Just Works',
              subtitle: 'Built for accuracy, not profit',
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
            <Badge variant='outline' className={SPACING.MB_6}>
              <Shield className={cn(ICON_SIZES.SIZE_3_5, 'mr-1.5')} />
              The Creator
            </Badge>
            <h2 className={cn(SPACING.MB_4, 'font-bold text-foreground', TYPOGRAPHY.TEXT_4XL)}>
              Hey, I&apos;m Jarryd
            </h2>
            <div
              className={cn(LAYOUT.CENTERED_CONTENT, SPACING.SPACE_Y_4, 'text-muted-foreground')}
            >
              <p className={TYPOGRAPHY.TEXT_LG}>
                I built PayeTax because I was frustrated with existing tax calculators &mdash; they
                were either riddled with ads, demanded my email, or felt stuck in 2010.
              </p>
              <p>
                So I created the calculator I actually wanted to use: fast, private, accurate, and
                genuinely free. Every feature exists because it solves a real problem I encountered
                when trying to understand UK taxes.
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
                Why this matters
              </p>
              <p className='text-muted-foreground'>
                Understanding your take-home pay shouldn&apos;t require sacrificing your privacy or
                navigating subscription walls. Whether you&apos;re negotiating a raise, comparing
                job offers, or just curious about your tax breakdown &mdash; you deserve a tool that
                respects your time and data.
              </p>
              <p className='text-muted-foreground'>User-funded. Always free. Your data is yours.</p>
            </div>
          </Card>

          {/* Try Calculator CTA */}
          <div className={cn(SPACING.MT_12, LAYOUT.TEXT_CENTER)}>
            <Link
              href='/'
              className='group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-8 py-4 font-semibold text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg'
            >
              Try the Calculator
              <ArrowRight className='size-5 transition-transform group-hover:translate-x-1' />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Footer */}
      <ContactFooter
        title='Questions or Feedback?'
        description="We're always improving. If you have suggestions, found a bug, or just want to say hi, reach out!"
        links={[
          {
            text: 'support@payetax.co.uk',
            href: 'mailto:support@payetax.co.uk?subject=Feedback',
            type: 'email',
          },
        ]}
      />
    </div>
  );
}
