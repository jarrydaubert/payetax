// src/app/about/page.tsx

// Optimized Lucide imports (bypasses Turbopack tree-shaking issue)
// Generated via: bash scripts/optimize-lucide-pages.sh
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle.js';
import ArrowLeftRight from 'lucide-react/dist/esm/icons/arrow-left-right.js';
import Award from 'lucide-react/dist/esm/icons/award.js';
import Calculator from 'lucide-react/dist/esm/icons/calculator.js';
import Code from 'lucide-react/dist/esm/icons/code.js';
import Eye from 'lucide-react/dist/esm/icons/eye.js';
import Heart from 'lucide-react/dist/esm/icons/heart.js';
import Lightbulb from 'lucide-react/dist/esm/icons/lightbulb.js';
import Lock from 'lucide-react/dist/esm/icons/lock.js';
import Palette from 'lucide-react/dist/esm/icons/palette.js';
import Rocket from 'lucide-react/dist/esm/icons/rocket.js';
import Shield from 'lucide-react/dist/esm/icons/shield.js';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles.js';
import Target from 'lucide-react/dist/esm/icons/target.js';
import Zap from 'lucide-react/dist/esm/icons/zap.js';
import type { Metadata } from 'next';
import { GradientText } from '@/components/atoms/GradientText';
import { ContactFooter } from '@/components/molecules/ContactFooter';
import { FeatureGrid } from '@/components/molecules/FeatureGrid';
import { PageHero } from '@/components/molecules/PageHero';
import { StatsGrid } from '@/components/molecules/StatsGrid';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ICON_SIZES, TYPOGRAPHY } from '@/constants/designTokens';
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

// Static data moved outside component (no longer needs to be in state)
const stats = [
  { icon: Calculator, value: '100%', label: 'Free Forever', color: 'from-primary to-accent' },
  { icon: Lock, value: '0', label: 'Data Stored', color: 'from-primary/80 to-accent/80' },
  {
    icon: Award,
    value: 'HMRC',
    label: 'Official Rates',
    color: 'from-accent to-primary',
  },
  { icon: Zap, value: '<300kB', label: 'Bundle Size', color: 'from-accent/80 to-primary/80' },
];

const values = [
  {
    icon: Shield,
    title: 'Privacy is Sacred',
    description:
      "Every calculation runs in your browser. We never see your salary, tax code, or personal details. This isn't a promise - it's architectural impossibility.",
    gradient: {
      bg: 'from-primary/20 to-accent/20',
      icon: 'text-primary',
      border: 'border-primary/20',
    },
  },
  {
    icon: Eye,
    title: 'Radical Transparency',
    description:
      'Open-source philosophy, honest analytics, and clear documentation. No dark patterns, no hidden fees, no corporate speak. Just honest tax calculations.',
    gradient: {
      bg: 'from-accent/20 to-primary/20',
      icon: 'text-accent',
      border: 'border-accent/20',
    },
  },
  {
    icon: Target,
    title: 'Accuracy First',
    description:
      'Official HMRC rates updated within 24 hours of changes. Comprehensive testing for Scottish rates, student loans, pensions, and edge cases.',
    gradient: {
      bg: 'from-primary/10 to-accent/10',
      icon: 'text-primary',
      border: 'border-primary/10',
    },
  },
  {
    icon: Heart,
    title: 'Genuinely Free',
    description:
      'No premium tiers, no paywalls, no "upgrade to see more". Every feature is free for everyone, forever. Tax calculations should be accessible to all.',
    gradient: {
      bg: 'from-accent/10 to-primary/10',
      icon: 'text-accent',
      border: 'border-accent/10',
    },
  },
];

const uniqueFeatures = [
  {
    icon: AlertTriangle,
    title: '£100k Tax Trap Optimizer',
    description:
      "Automatically detects when you're in the 60% effective tax rate zone (£100k-£125k) and calculates optimal pension contributions to save thousands.",
    metric: '60%',
    gradient: {
      bg: 'from-amber-500/10 to-orange-500/10',
      icon: 'text-amber-500',
      border: 'border-amber-500/30',
    },
  },
  {
    icon: ArrowLeftRight,
    title: 'Salary Comparison',
    description:
      'Compare job offers or raises with 3 input modes (%, £ amount, total). See marginal rates and exactly what you keep from every increase.',
    metric: '3 modes',
    gradient: {
      bg: 'from-cyan-500/10 to-blue-500/10',
      icon: 'text-cyan-500',
      border: 'border-cyan-500/30',
    },
  },
  {
    icon: Palette,
    title: 'Adaptive Theming',
    description:
      'Light, dark, or system-matched themes. Your calculator, your eyes, your choice. Smooth transitions, zero flash, perfect accessibility.',
    metric: '3 themes',
    gradient: {
      bg: 'from-purple-500/10 to-pink-500/10',
      icon: 'text-purple-500',
      border: 'border-purple-500/30',
    },
  },
];

const techFeatures = [
  {
    icon: Rocket,
    title: 'Blazing Fast',
    metric: '<1.5s',
    description: 'Sub-second page loads, instant calculations, 60fps animations',
  },
  {
    icon: Code,
    title: 'Modern Stack',
    metric: 'Next.js 16',
    description: 'React 19, TypeScript, Tailwind CSS v4, cutting-edge architecture',
  },
  {
    icon: Sparkles,
    title: 'Lighthouse Score',
    metric: '95+',
    description: 'Performance, accessibility, SEO, and best practices',
  },
];

export default function AboutPage() {
  return (
    <div className='min-h-screen'>
      {/* Hero Section - Using PageHero */}
      <PageHero
        badge={{ icon: Sparkles, text: 'About PayeTax' }}
        title={
          <>
            <GradientText variant='brand-full' as='span'>
              Tax Calculations
            </GradientText>
            <br />
            <span className='text-foreground'>Built for Privacy</span>
          </>
        }
        subtitle={[
          'The UK tax calculator that respects your privacy, delivers instant accuracy, and costs nothing. No compromises.',
          'With intelligent tax trap detection, salary comparisons, and adaptive theming.',
        ]}
      />

      {/* Stats Grid - Using StatsGrid */}
      <section className='container mx-auto max-w-7xl px-4 py-12'>
        <StatsGrid stats={stats} columns={4} variant='elevated' />
      </section>

      {/* Mission Section */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-5xl px-4'>
          <Card className='border-primary/30 border-l-8 bg-gradient-to-br from-primary/5 to-accent/5 p-12 text-center'>
            <Heart className={`mx-auto mb-6 ${'size-16'} text-primary`} aria-hidden='true' />
            <GradientText
              variant='brand'
              as='h2'
              className={cn('mb-6 font-bold', TYPOGRAPHY.TEXT_4XL)}
            >
              Our Mission
            </GradientText>
            <p
              className={cn(
                'mx-auto max-w-3xl text-muted-foreground leading-relaxed',
                TYPOGRAPHY.TEXT_XL
              )}
            >
              Every UK taxpayer deserves instant, accurate tax calculations without sacrificing
              privacy or paying a penny. We&apos;re building the most transparent, accessible, and
              trustworthy tax calculator in the UK.
            </p>
          </Card>
        </div>
      </section>

      {/* Unique Features - Using FeatureGrid */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <FeatureGrid
            heading={{
              badge: { icon: Sparkles, text: 'Unique Features', variant: 'outline' },
              title: (
                <GradientText
                  variant='custom'
                  className='bg-gradient-to-r from-amber-500 to-orange-500'
                >
                  What Makes Us Different
                </GradientText>
              ),
              subtitle: "Features you won't find anywhere else - completely free",
              align: 'center',
            }}
            features={uniqueFeatures}
            columns={3}
            variant='showcase'
          />
        </div>
      </section>

      {/* Core Values - Using FeatureGrid */}
      <section className='bg-gradient-to-br from-primary/5 to-accent/5 py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <FeatureGrid
            heading={{
              badge: { icon: Heart, text: 'Our Values', variant: 'outline' },
              title: 'Built on Principles',
              subtitle: 'What we stand for and why it matters',
              align: 'center',
            }}
            features={values}
            columns={2}
            variant='default'
          />
        </div>
      </section>

      {/* Tech Features - Using FeatureGrid */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <FeatureGrid
            heading={{
              badge: { icon: Code, text: 'Technology', variant: 'outline' },
              title: 'Modern Tech Stack',
              subtitle: 'Built with the latest and greatest technologies',
              align: 'center',
            }}
            features={techFeatures}
            columns={3}
            variant='showcase'
          />
        </div>
      </section>

      {/* The Story Section - Custom (unique layout) */}
      <section className='bg-gradient-to-br from-accent/5 to-transparent py-12 md:py-20'>
        <div className='container mx-auto max-w-5xl px-4'>
          <div className='mb-12 text-center'>
            <Badge
              variant='outline'
              className='mb-6 gap-2 border-primary/30 bg-primary/10 px-6 py-2.5'
            >
              <Lightbulb className={ICON_SIZES.SIZE_5} aria-hidden='true' />
              <span>The Story</span>
            </Badge>
            <GradientText
              variant='brand'
              as='h2'
              className={cn('mb-4 font-bold', TYPOGRAPHY.TEXT_4XL)}
            >
              Why We Built This
            </GradientText>
          </div>

          <div className='space-y-8'>
            <Card className='border-l-4 border-l-primary bg-card/50 p-8 backdrop-blur-sm'>
              <p className={cn('text-muted-foreground leading-relaxed', TYPOGRAPHY.TEXT_LG)}>
                Like most people, I needed to calculate my take-home pay when comparing job offers.
                The existing tools were frustrating: paywalls for basic features, invasive
                analytics, dark patterns pushing premium upgrades, and uncertainty about data
                privacy.
              </p>
            </Card>

            <Card className='border-l-4 border-l-accent bg-card/50 p-8 backdrop-blur-sm'>
              <p className={cn('text-muted-foreground leading-relaxed', TYPOGRAPHY.TEXT_LG)}>
                I wanted something different: instant results without signup, complete privacy by
                design, and no hidden costs. Every feature free for everyone. Transparent
                calculations you can verify. An interface that respects your intelligence and time.
              </p>
            </Card>

            <Card className='border-l-4 border-l-primary bg-card/50 p-8 backdrop-blur-sm'>
              <p className={cn('text-muted-foreground leading-relaxed', TYPOGRAPHY.TEXT_LG)}>
                So I built PayeTax - the tax calculator I wished existed. Client-side calculations
                mean your salary never leaves your device. Open-source code means you can verify
                every formula. And it&apos;s completely free because tax calculations should be
                accessible to all.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Footer - Using ContactFooter */}
      <ContactFooter
        title='Get in Touch'
        description="Questions, feedback, or suggestions? We'd love to hear from you."
        links={[
          { text: 'support@payetax.co.uk', href: 'mailto:support@payetax.co.uk', type: 'email' },
          { text: 'Feedback Form', href: '/feedback', type: 'link' },
        ]}
      />
    </div>
  );
}
