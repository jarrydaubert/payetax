// src/app/about/page.tsx

import {
  AlertTriangle,
  ArrowLeftRight,
  Award,
  Calculator,
  Code,
  Eye,
  Heart,
  Lightbulb,
  Lock,
  Palette,
  Rocket,
  Shield,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { GradientText } from '@/components/atoms/GradientText';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ICON_SIZES } from '@/constants/designTokens';

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
    gradient: 'from-primary/20 to-accent/20',
    iconGradient: 'from-primary to-accent',
  },
  {
    icon: Eye,
    title: 'Radical Transparency',
    description:
      'Open-source philosophy, honest analytics, and clear documentation. No dark patterns, no hidden fees, no corporate speak. Just honest tax calculations.',
    gradient: 'from-accent/20 to-primary/20',
    iconGradient: 'from-accent to-primary',
  },
  {
    icon: Target,
    title: 'Accuracy First',
    description:
      'Official HMRC rates updated within 24 hours of changes. Comprehensive testing for Scottish rates, student loans, pensions, and edge cases.',
    gradient: 'from-primary/10 to-accent/10',
    iconGradient: 'from-primary to-accent',
  },
  {
    icon: Heart,
    title: 'Genuinely Free',
    description:
      'No premium tiers, no paywalls, no "upgrade to see more". Every feature is free for everyone, forever. Tax calculations should be accessible to all.',
    gradient: 'from-accent/10 to-primary/10',
    iconGradient: 'from-accent to-primary',
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
    metric: 'Next.js 15',
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
      {/* Hero Section */}
      <section className='relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-transparent pt-20 pb-10 md:pt-32 md:pb-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <div className='text-center'>
            <Badge
              variant='outline'
              className='mb-6 gap-2 border-primary/30 bg-primary/10 px-6 py-2.5 backdrop-blur-sm'
            >
              <Sparkles className={ICON_SIZES.SIZE_5} aria-hidden='true' />
              <span>About PayeTax</span>
            </Badge>

            <h1 className='mb-6 font-bold text-6xl leading-tight'>
              <GradientText variant='brand-full' as='span'>
                Tax Calculations
              </GradientText>
              <br />
              <span className='text-foreground'>Built for Privacy</span>
            </h1>

            <p className='mx-auto mb-4 max-w-3xl text-lg text-muted-foreground leading-relaxed'>
              The UK tax calculator that respects your privacy, delivers instant accuracy, and costs
              nothing. No compromises.
            </p>

            <p className='mx-auto mb-12 max-w-2xl text-lg text-muted-foreground'>
              With intelligent tax trap detection, salary comparisons, and adaptive theming.
            </p>

            {/* Stats Grid */}
            <div className='grid gap-3 md:grid-cols-4 md:gap-6'>
              {stats.map((stat, _idx) => (
                <Card
                  key={stat.label}
                  className='group relative overflow-hidden border-primary/20 p-8 transition-all duration-300 active:scale-[1.02] md:hover:scale-105 md:hover:border-primary/40 md:hover:shadow-2xl'
                >
                  <div
                    className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`}
                  />
                  <stat.icon
                    className={`mx-auto mb-4 ${ICON_SIZES.SIZE_10} text-primary`}
                    aria-hidden='true'
                  />
                  <div className='mb-2 font-bold text-3xl text-foreground'>{stat.value}</div>
                  <div className='text-muted-foreground text-sm'>{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-5xl px-4'>
          <Card className='border-primary/30 border-l-8 bg-gradient-to-br from-primary/5 to-accent/5 p-12 text-center'>
            <Heart
              className={`mx-auto mb-6 ${"size-16"} text-primary`}
              aria-hidden='true'
            />
            <GradientText variant='brand' as='h2' className='mb-6 font-bold text-4xl'>
              Our Mission
            </GradientText>
            <p className='mx-auto max-w-3xl text-muted-foreground text-xl leading-relaxed'>
              Every UK taxpayer deserves instant, accurate tax calculations without sacrificing
              privacy or paying a penny. We&apos;re building the most transparent, accessible, and
              trustworthy tax calculator in the UK.
            </p>
          </Card>
        </div>
      </section>

      {/* Unique Features Section - NEW in v2.0.0 */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <div className='mb-16 text-center'>
            <Badge
              variant='outline'
              className='mb-6 gap-2 border-warning/50 bg-warning/20 px-6 py-2.5 text-warning'
            >
              <Sparkles className={ICON_SIZES.SIZE_5} aria-hidden='true' />
              <span>Unique Features</span>
            </Badge>
            <GradientText
              variant='custom'
              as='h2'
              className='mb-4 bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-4xl'
            >
              What Makes Us Different
            </GradientText>
            <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
              Features you won't find anywhere else - completely free
            </p>
          </div>

          <div className='grid gap-6 md:grid-cols-3 md:gap-8'>
            {/* Feature 1: Tax Trap Optimizer */}
            <div>
              <Card className='group h-full overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-8 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] md:hover:border-amber-500/50 md:hover:shadow-2xl'>
                <div
                  className={`mb-6 inline-flex ${"size-16"} items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-4 shadow-lg transition-transform group-hover:scale-110`}
                >
                  <AlertTriangle className={`${ICON_SIZES.SIZE_8} text-white`} aria-hidden='true' />
                </div>
                <div className='mb-4 flex items-baseline gap-2'>
                  <span className='font-bold text-5xl text-foreground'>60%</span>
                  <span className='text-muted-foreground text-sm'>tax trap detected</span>
                </div>
                <h3 className='mb-4 font-bold text-2xl text-foreground'>
                  £100k Tax Trap Optimizer
                </h3>
                <p className='mb-6 text-muted-foreground leading-relaxed'>
                  Automatically detects when you&apos;re in the 60% effective tax rate zone
                  (£100k-£125k) and calculates optimal pension contributions to save thousands.
                </p>
                <Link
                  href='/blog/100k-tax-trap-avoid-60-percent-tax-2025'
                  className='inline-flex items-center gap-2 font-semibold text-amber-600 transition-colors hover:text-amber-700'
                >
                  Read our complete £100k tax trap guide →
                </Link>
              </Card>
            </div>

            {/* Feature 2: Salary Comparison */}
            <div>
              <Card className='group h-full overflow-hidden border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-8 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] md:hover:border-blue-500/50 md:hover:shadow-2xl'>
                <div
                  className={`mb-6 inline-flex ${"size-16"} items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-4 shadow-lg transition-transform group-hover:scale-110`}
                >
                  <ArrowLeftRight
                    className={`${ICON_SIZES.SIZE_8} text-white`}
                    aria-hidden='true'
                  />
                </div>
                <div className='mb-4 flex items-baseline gap-2'>
                  <span className='font-bold text-5xl text-foreground'>3</span>
                  <span className='text-muted-foreground text-sm'>comparison modes</span>
                </div>
                <h3 className='mb-4 font-bold text-2xl text-foreground'>Salary Comparison</h3>
                <p className='mb-6 text-muted-foreground leading-relaxed'>
                  Compare job offers or raises with 3 input modes (%, £ amount, total). See marginal
                  rates and exactly what you keep from every increase.
                </p>
                <Link
                  href='/#calculator'
                  className='inline-flex items-center gap-2 font-semibold text-blue-600 transition-colors hover:text-blue-700'
                >
                  Try it now →
                </Link>
              </Card>
            </div>

            {/* Feature 3: Adaptive Theming */}
            <div>
              <Card className='group h-full overflow-hidden border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-8 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] md:hover:border-purple-500/50 md:hover:shadow-2xl'>
                <div
                  className={`mb-6 inline-flex ${"size-16"} items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-4 shadow-lg transition-transform group-hover:scale-110`}
                >
                  <Palette className={`${ICON_SIZES.SIZE_8} text-white`} aria-hidden='true' />
                </div>
                <div className='mb-4 flex items-baseline gap-2'>
                  <span className='font-bold text-5xl text-foreground'>3</span>
                  <span className='text-muted-foreground text-sm'>theme options</span>
                </div>
                <h3 className='mb-4 font-bold text-2xl text-foreground'>Adaptive Theming</h3>
                <p className='mb-6 text-muted-foreground leading-relaxed'>
                  Light, dark, or system-matched themes. Your calculator, your eyes, your choice.
                  Smooth transitions, zero flash, perfect accessibility.
                </p>
                <span className='inline-flex items-center gap-2 font-semibold text-purple-600'>
                  Check the footer ↓
                </span>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className='bg-gradient-to-br from-accent/5 via-primary/5 to-transparent py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <div className='mb-16 text-center'>
            <GradientText variant='brand' as='h2' className='mb-4 font-bold text-4xl'>
              What We Stand For
            </GradientText>
            <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
              Four principles that guide everything we build
            </p>
          </div>

          <div className='grid gap-4 md:grid-cols-2 md:gap-8'>
            {values.map((value) => (
              <div key={value.title}>
                <Card
                  className={`group h-full overflow-hidden border-primary/20 bg-gradient-to-br ${value.gradient} p-8 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] md:hover:border-primary/40 md:hover:shadow-2xl`}
                >
                  <div
                    className={`mb-6 inline-flex ${"size-16"} items-center justify-center rounded-2xl bg-gradient-to-br ${value.iconGradient} p-4 shadow-lg transition-transform group-hover:scale-110`}
                  >
                    <value.icon className={`${ICON_SIZES.SIZE_8} text-white`} aria-hidden='true' />
                  </div>
                  <h3 className='mb-4 font-bold text-2xl text-foreground'>{value.title}</h3>
                  <p className='text-muted-foreground leading-relaxed'>{value.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <div className='mb-16 text-center'>
            <Badge
              variant='outline'
              className='mb-6 gap-2 border-primary/50 bg-primary/20 px-6 py-2.5 text-primary'
            >
              <Code className={ICON_SIZES.SIZE_5} aria-hidden='true' />
              <span>Modern Technology</span>
            </Badge>
            <GradientText
              variant='custom'
              as='h2'
              className='mb-4 bg-gradient-to-r from-primary to-accent font-bold text-4xl'
            >
              Built for Performance
            </GradientText>
            <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
              Cutting-edge web technologies for exceptional speed, security, and experience
            </p>
          </div>

          <div className='mb-12 grid gap-8 md:grid-cols-3'>
            {techFeatures.map((feature) => (
              <div key={feature.title}>
                <Card className='group h-full border-primary/20 p-8 text-center transition-all duration-300 active:scale-[1.02] md:hover:scale-105 md:hover:border-primary/40 md:hover:shadow-2xl'>
                  <feature.icon
                    className={`mx-auto mb-4 ${ICON_SIZES.SIZE_12} text-primary`}
                    aria-hidden='true'
                  />
                  <div className='mb-2 font-bold text-3xl text-foreground'>{feature.metric}</div>
                  <h3 className='mb-3 font-semibold text-foreground text-lg'>{feature.title}</h3>
                  <p className='text-muted-foreground text-sm'>{feature.description}</p>
                </Card>
              </div>
            ))}
          </div>

          {/* Tech Stack */}
          <Card className='border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-8'>
            <h3 className='mb-6 text-center font-bold text-foreground text-xl'>Powered By</h3>
            <div className='flex flex-wrap justify-center gap-3'>
              {[
                'Next.js 15',
                'React 19',
                'TypeScript 5',
                'Tailwind CSS v4',
                'Zustand 5',
                'shadcn/ui',
                'Framer Motion 12',
                'Biome',
              ].map((tech) => (
                <span
                  key={tech}
                  className='rounded-full border border-primary/30 bg-background px-5 py-2.5 font-medium text-foreground text-sm transition-all hover:border-primary hover:shadow-lg active:scale-[1.02] md:hover:scale-105'
                >
                  {tech}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Story Section */}
      <section className='bg-gradient-to-br from-primary/10 via-accent/5 to-transparent py-12 md:py-20'>
        <div className='container mx-auto max-w-5xl px-4'>
          <div>
            <Card className='border-primary/20 p-12'>
              <div className='mb-8 text-center'>
                <Lightbulb
                  className={`mx-auto mb-6 ${"size-16"} text-primary`}
                  aria-hidden='true'
                />
                <GradientText variant='brand' as='h2' className='mb-4 font-bold text-4xl'>
                  Why We Built PayeTax
                </GradientText>
              </div>

              <div className='space-y-6'>
                <p className='text-lg text-muted-foreground leading-relaxed'>
                  As UK taxpayers and software engineers, we were frustrated by online tax
                  calculators. They were slow, cluttered with ads, required personal information, or
                  hid features behind paywalls.
                </p>
                <p className='text-lg text-muted-foreground leading-relaxed'>
                  We knew it didn&apos;t have to be this way. Tax calculations should be instant,
                  accurate, and completely private. No accounts, no tracking, no compromises.
                </p>
                <p className='text-lg text-muted-foreground leading-relaxed'>
                  Today, PayeTax helps thousands of people across the UK understand their take-home
                  pay, plan salary negotiations, compare job offers, and make informed financial
                  decisions - all while respecting their privacy.
                </p>
                <p className='text-lg text-muted-foreground leading-relaxed'>
                  In v2.0.0, we added intelligent tax trap detection and salary comparison tools -
                  features that would cost £50+/month elsewhere, completely free for everyone.
                  Because we believe tax planning should be accessible to all.
                </p>
                <p className='text-lg text-muted-foreground leading-relaxed'>
                  We're continuously improving based on your feedback. Every feature request
                  matters, every bug report helps, and every suggestion makes PayeTax better for
                  everyone.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-4xl px-4'>
          <Card className='border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 p-12 text-center'>
            <h2 className='mb-4 font-bold text-3xl text-foreground'>
              Ready to Calculate Your Take-Home Pay?
            </h2>
            <p className='mb-8 text-lg text-muted-foreground'>
              Free, fast, and completely private. No sign-up required.
            </p>
            <Link
              href='/'
              className='inline-block rounded-lg bg-primary px-8 py-4 font-bold text-lg text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl active:scale-[1.02] md:hover:scale-105'
            >
              Try the Calculator →
            </Link>
          </Card>
        </div>
      </section>

      <Separator className='my-0' />

      {/* Contact Footer */}
      <section className='py-16'>
        <div className='container mx-auto max-w-4xl px-4 text-center'>
          <h3 className='mb-4 font-bold text-2xl text-foreground'>Get in Touch</h3>
          <p className='mb-6 text-muted-foreground'>
            Questions, feedback, or suggestions? We&apos;d love to hear from you.
          </p>
          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6'>
            <a
              href='mailto:support@payetax.co.uk'
              className='text-primary transition-colors hover:text-brand-gradient-end'
            >
              support@payetax.co.uk
            </a>
            <span className='hidden text-muted-foreground sm:inline'>•</span>
            <Link
              href='/privacy'
              className='text-primary transition-colors hover:text-brand-gradient-end'
            >
              Privacy Policy
            </Link>
            <span className='hidden text-muted-foreground sm:inline'>•</span>
            <Link
              href='/blog'
              className='text-primary transition-colors hover:text-brand-gradient-end'
            >
              Blog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
