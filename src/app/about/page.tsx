// src/app/about/page.tsx

import Shield from 'lucide-react/dist/esm/icons/shield.js';
import type { Metadata } from 'next';
import { GradientText } from '@/components/atoms/GradientText';
import { ContactFooter } from '@/components/molecules/ContactFooter';
import { FeatureGrid } from '@/components/molecules/FeatureGrid';
import { PageHero } from '@/components/molecules/PageHero';
import { StatsGrid } from '@/components/molecules/StatsGrid';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ICON_SIZES, TYPOGRAPHY } from '@/constants/designTokens';
import {
  ABOUT_STATS,
  ABOUT_TECH_STACK,
  ABOUT_UNIQUE_FEATURES,
  ABOUT_VALUES,
} from '@/constants/pages/aboutPageData';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
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
    <div className='min-h-screen'>
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
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <StatsGrid stats={ABOUT_STATS} columns={4} variant='elevated' />
        </div>
      </section>

      {/* Values Section */}
      <section className='bg-gradient-to-br from-primary/5 to-accent/5 py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
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
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
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
      <section className='bg-gradient-to-br from-accent/5 to-transparent py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
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
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-4xl px-4'>
          <div className='text-center'>
            <Badge variant='outline' className={cn('mb-6', ICON_SIZES.SIZE_4)}>
              The Team
            </Badge>
            <h2 className={cn('mb-4 font-bold text-foreground', TYPOGRAPHY.TEXT_4XL)}>
              Built by One Person
            </h2>
            <div className='mx-auto max-w-2xl space-y-4 text-muted-foreground'>
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

          <Card className='mx-auto mt-12 max-w-2xl border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-8'>
            <div className='space-y-4 text-center'>
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
