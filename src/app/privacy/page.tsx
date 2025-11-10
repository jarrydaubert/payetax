// src/app/privacy/page.tsx

// Optimized Lucide imports (bypasses Turbopack tree-shaking issue)
// Generated via: bash scripts/optimize-lucide-pages.sh
import Calendar from 'lucide-react/dist/esm/icons/calendar.js';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle.js';
import Cookie from 'lucide-react/dist/esm/icons/cookie.js';
import Database from 'lucide-react/dist/esm/icons/database.js';
import Eye from 'lucide-react/dist/esm/icons/eye.js';
import FileText from 'lucide-react/dist/esm/icons/file-text.js';
import Globe from 'lucide-react/dist/esm/icons/globe.js';
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
import { ICON_SIZES } from '@/constants/designTokens';

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

const privacyPrinciples = [
  {
    icon: Lock,
    title: 'Client-Side Calculations',
    description:
      'All tax calculations run in your browser using JavaScript. Your salary, tax code, and personal details never leave your device.',
    gradient: {
      bg: 'from-primary/20 to-accent/20',
      icon: 'text-primary',
      border: 'border-primary/20',
    },
  },
  {
    icon: Database,
    title: 'Zero Server Storage',
    description:
      "We don't store your tax data on our servers. Calculations happen locally, results display instantly, nothing gets saved remotely.",
    gradient: {
      bg: 'from-accent/20 to-primary/20',
      icon: 'text-accent',
      border: 'border-accent/20',
    },
  },
  {
    icon: Eye,
    title: 'Optional Analytics',
    description:
      'Anonymous usage data (page views, device type) only with your consent. You can decline entirely - the calculator works exactly the same.',
    gradient: {
      bg: 'from-primary/10 to-accent/10',
      icon: 'text-primary',
      border: 'border-primary/10',
    },
  },
  {
    icon: Shield,
    title: 'Privacy by Design',
    description:
      "Your privacy isn't a feature we added - it's built into the architecture. We literally cannot see your tax calculations.",
    gradient: {
      bg: 'from-accent/10 to-primary/10',
      icon: 'text-accent',
      border: 'border-accent/10',
    },
  },
];

const dontDo = [
  'Store your tax calculations on servers',
  'Sell, share, or monetize your data',
  'Track you across other websites',
  'Require account creation or login',
  'Use third-party advertising networks',
  'Employ dark patterns or deceptive practices',
];

const doDo = [
  'Calculate everything in your browser',
  'Use privacy-focused analytics (Umami)',
  'Respect Do Not Track settings',
  'Provide complete transparency',
  'Keep the site forever free',
  'Maintain open-source code',
];

const dataFlowCards = [
  {
    icon: Database,
    iconColor: 'bg-primary',
    title: 'Your Device',
    description:
      'All calculations happen here in your browser. Your salary, tax code, and personal details never leave this device.',
  },
  {
    icon: Globe,
    iconColor: 'bg-primary/80',
    title: 'Our Servers',
    description:
      'Only serve the website code (HTML, CSS, JS). No tax data, no personal information, no calculation results stored.',
  },
  {
    icon: FileText,
    iconColor: 'bg-primary/60',
    title: 'Analytics (Optional)',
    description:
      'Privacy-focused Umami analytics tracks anonymous page views only if you consent. No personal data, no cross-site tracking.',
  },
];

export default function PrivacyPage() {
  return (
    <div className='min-h-screen'>
      {/* Hero Section - Using PageHero */}
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
      <section className='container mx-auto max-w-7xl px-4 py-4'>
        <div className='flex items-center justify-center gap-2 text-muted-foreground text-sm'>
          <Calendar className={ICON_SIZES.SIZE_4} aria-hidden='true' />
          <span>Last updated: October 4, 2025</span>
        </div>
      </section>

      {/* Quick Summary - Using ComparisonCards */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-6xl px-4'>
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
              items: dontDo,
              variant: 'negative',
            }}
            right={{
              icon: CheckCircle,
              title: 'What We DO',
              items: doDo,
              variant: 'positive',
            }}
          />
        </div>
      </section>

      {/* Privacy Principles - Using FeatureGrid */}
      <section className='bg-gradient-to-br from-primary/5 to-accent/5 py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <FeatureGrid
            heading={{
              title: 'How We Protect Your Privacy',
              subtitle: 'Four architectural decisions that make your data truly private',
              align: 'center',
            }}
            features={privacyPrinciples}
            columns={2}
            variant='showcase'
          />
        </div>
      </section>

      {/* Data Flow - Using DataFlowCards */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-6xl px-4'>
          <SectionHeading
            badge={{ icon: Lock, text: 'Data Flow' }}
            title={<GradientText variant='brand'>Where Your Tax Data Goes</GradientText>}
            subtitle="Spoiler: Nowhere. Here's the technical breakdown."
            align='center'
          />

          <DataFlowCards cards={dataFlowCards} columns={3} />
        </div>
      </section>

      {/* Analytics Section - Using FeatureGrid */}
      <section className='bg-gradient-to-br from-accent/5 to-transparent py-12 md:py-20'>
        <div className='container mx-auto max-w-6xl px-4'>
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

      {/* Contact Footer - Using ContactFooter */}
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
