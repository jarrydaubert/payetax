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
import Server from 'lucide-react/dist/esm/icons/server.js';
import Shield from 'lucide-react/dist/esm/icons/shield.js';
import UserX from 'lucide-react/dist/esm/icons/user-x.js';
import X from 'lucide-react/dist/esm/icons/x.js';
import type { Metadata } from 'next';
import Link from 'next/link';
import { GradientText } from '@/components/atoms/GradientText';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ICON_SIZES, TYPOGRAPHY } from '@/constants/designTokens';
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

const privacyPrinciples = [
  {
    icon: Lock,
    title: 'Client-Side Calculations',
    description:
      'All tax calculations run in your browser using JavaScript. Your salary, tax code, and personal details never leave your device.',
    color: 'from-primary/20 to-accent/20',
    iconColor: 'from-primary to-accent',
  },
  {
    icon: Database,
    title: 'Zero Server Storage',
    description:
      "We don't store your tax data on our servers. Calculations happen locally, results display instantly, nothing gets saved remotely.",
    color: 'from-accent/20 to-primary/20',
    iconColor: 'from-accent to-primary',
  },
  {
    icon: Eye,
    title: 'Optional Analytics',
    description:
      'Anonymous usage data (page views, device type) only with your consent. You can decline entirely - the calculator works exactly the same.',
    color: 'from-primary/10 to-accent/10',
    iconColor: 'from-primary to-accent',
  },
  {
    icon: Shield,
    title: 'Privacy by Design',
    description:
      "Your privacy isn't a feature we added - it's built into the architecture. We literally cannot see your tax calculations.",
    color: 'from-accent/10 to-primary/10',
    iconColor: 'from-accent to-primary',
  },
];

const dontDo = [
  'Store your tax calculations on servers',
  'Sell, share, or monetize your data',
  'Track you across other websites',
  'Require accounts or personal info',
  'Use invasive advertising pixels',
  'Share data with third parties',
];

const doDo = [
  'Provide completely free calculations',
  'Use anonymous analytics (with consent)',
  'Save preferences locally on your device',
  'Keep this policy simple and honest',
  'Respect your choice to decline tracking',
  'Update you on any policy changes',
];

export default function PrivacyPolicyPage() {
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
              <Shield className={ICON_SIZES.SIZE_5} aria-hidden='true' />
              <span>Privacy Policy</span>
            </Badge>

            <h1 className={cn('mb-6 font-bold leading-tight md:text-7xl', TYPOGRAPHY.TEXT_5XL)}>
              <GradientText variant='brand-full' as='span'>
                Your Privacy
              </GradientText>
              <br />
              <span className='text-foreground'>Comes First</span>
            </h1>

            <p
              className={cn(
                'mx-auto mb-8 max-w-3xl text-muted-foreground leading-relaxed md:text-2xl',
                TYPOGRAPHY.TEXT_XL
              )}
            >
              Radical transparency about your data. Here&apos;s exactly what we do and don&apos;t do
              with your information.
            </p>

            <div className='inline-flex items-center gap-2 text-muted-foreground'>
              <Calendar className={ICON_SIZES.SIZE_4} aria-hidden='true' />
              <span className={TYPOGRAPHY.TEXT_SM}>Last updated: October 4, 2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-6xl px-4'>
          <div className='mb-12 text-center'>
            <CheckCircle className={`mx-auto mb-4 ${'size-16'} text-primary`} aria-hidden='true' />
            <GradientText
              variant='brand'
              as='h2'
              className={cn('mb-4 font-bold', TYPOGRAPHY.TEXT_4XL)}
            >
              The 30-Second Version
            </GradientText>
            <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_LG)}>
              Everything you need to know at a glance
            </p>
          </div>

          <div className='grid gap-4 md:grid-cols-2 md:gap-8'>
            <Card className='overflow-hidden border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10 p-8'>
              <div className='mb-6 flex items-center gap-3'>
                <div
                  className={`flex ${ICON_SIZES.SIZE_12} items-center justify-center rounded-xl bg-destructive shadow-lg`}
                >
                  <X
                    className={`${ICON_SIZES.SIZE_6} text-destructive-foreground`}
                    aria-hidden='true'
                  />
                </div>
                <h3 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_2XL)}>
                  What We DON'T Do
                </h3>
              </div>
              <ul className='space-y-3'>
                {dontDo.map((item) => (
                  <li key={item} className='flex items-start gap-3 text-muted-foreground'>
                    <UserX
                      className={`mt-0.5 ${ICON_SIZES.SIZE_5} flex-shrink-0 text-destructive`}
                      aria-hidden='true'
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className='overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-8'>
              <div className='mb-6 flex items-center gap-3'>
                <div
                  className={`flex ${ICON_SIZES.SIZE_12} items-center justify-center rounded-xl bg-primary shadow-lg`}
                >
                  <CheckCircle
                    className={`${ICON_SIZES.SIZE_6} text-primary-foreground`}
                    aria-hidden='true'
                  />
                </div>
                <h3 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_2XL)}>What We DO</h3>
              </div>
              <ul className='space-y-3'>
                {doDo.map((item) => (
                  <li key={item} className='flex items-start gap-3 text-muted-foreground'>
                    <CheckCircle
                      className={`mt-0.5 ${ICON_SIZES.SIZE_5} flex-shrink-0 text-primary`}
                      aria-hidden='true'
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy Principles */}
      <section className='bg-gradient-to-br from-accent/5 via-primary/5 to-transparent py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <div className='mb-16 text-center'>
            <GradientText
              variant='brand'
              as='h2'
              className={cn('mb-4 font-bold md:text-5xl', TYPOGRAPHY.TEXT_4XL)}
            >
              How We Protect Your Privacy
            </GradientText>
            <p className={cn('mx-auto max-w-2xl text-muted-foreground', TYPOGRAPHY.TEXT_LG)}>
              Four architectural decisions that make your data truly private
            </p>
          </div>

          <div className='grid gap-4 md:grid-cols-2 md:gap-8'>
            {privacyPrinciples.map((principle) => (
              <div key={principle.title}>
                <Card
                  className={`group h-full overflow-hidden border-primary/20 bg-gradient-to-br ${principle.color} p-8 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-2xl`}
                >
                  <div
                    className={`mb-6 inline-flex ${'size-16'} items-center justify-center rounded-2xl bg-gradient-to-br ${principle.iconColor} p-4 shadow-lg transition-transform group-hover:scale-110`}
                  >
                    <principle.icon
                      className={`${ICON_SIZES.SIZE_8} text-white`}
                      aria-hidden='true'
                    />
                  </div>
                  <h3 className={cn('mb-4 font-bold text-foreground', TYPOGRAPHY.TEXT_2XL)}>
                    {principle.title}
                  </h3>
                  <p className='text-muted-foreground leading-relaxed'>{principle.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Flow */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-6xl px-4'>
          <div className='mb-16 text-center'>
            <Lock className={`mx-auto mb-6 ${'size-16'} text-primary`} aria-hidden='true' />
            <GradientText
              variant='brand'
              as='h2'
              className={cn('mb-4 font-bold', TYPOGRAPHY.TEXT_4XL)}
            >
              Where Your Tax Data Goes
            </GradientText>
            <p className={cn('mx-auto max-w-2xl text-muted-foreground', TYPOGRAPHY.TEXT_LG)}>
              Spoiler: Nowhere. Here&apos;s the technical breakdown.
            </p>
          </div>

          <div className='grid gap-4 md:grid-cols-3 md:gap-8'>
            <div>
              <Card className='h-full border-primary/20 p-8 text-center transition-all duration-300 active:scale-[1.02] md:hover:border-primary/40 md:hover:shadow-xl'>
                <div
                  className={`mx-auto mb-6 flex ${'size-20'} items-center justify-center rounded-2xl bg-primary shadow-lg`}
                >
                  <Database
                    className={`${ICON_SIZES.SIZE_10} text-primary-foreground`}
                    aria-hidden='true'
                  />
                </div>
                <h3 className={cn('mb-4 font-bold text-foreground', TYPOGRAPHY.TEXT_XL)}>
                  Your Device
                </h3>
                <p className='text-muted-foreground leading-relaxed'>
                  All calculations happen here in your browser. Your salary, tax code, and personal
                  details never leave this device.
                </p>
              </Card>
            </div>

            <div>
              <Card className='h-full border-primary/20 p-8 text-center transition-all duration-300 active:scale-[1.02] md:hover:border-primary/40 md:hover:shadow-xl'>
                <div
                  className={`mx-auto mb-6 flex ${'size-20'} items-center justify-center rounded-2xl bg-accent shadow-lg`}
                >
                  <Server
                    className={`${ICON_SIZES.SIZE_10} text-accent-foreground`}
                    aria-hidden='true'
                  />
                </div>
                <h3 className={cn('mb-4 font-bold text-foreground', TYPOGRAPHY.TEXT_XL)}>
                  Our Servers
                </h3>
                <p className='text-muted-foreground leading-relaxed'>
                  Only serve the website code (HTML, CSS, JS). No tax data, no personal information,
                  no calculation results stored.
                </p>
              </Card>
            </div>

            <div>
              <Card className='h-full border-primary/20 p-8 text-center transition-all duration-300 active:scale-[1.02] md:hover:border-primary/40 md:hover:shadow-xl'>
                <div
                  className={`mx-auto mb-6 flex ${'size-20'} items-center justify-center rounded-2xl bg-primary/80 shadow-lg`}
                >
                  <FileText
                    className={`${ICON_SIZES.SIZE_10} text-primary-foreground`}
                    aria-hidden='true'
                  />
                </div>
                <h3 className={cn('mb-4 font-bold text-foreground', TYPOGRAPHY.TEXT_XL)}>
                  localStorage
                </h3>
                <p className='text-muted-foreground leading-relaxed'>
                  We save your inputs locally for convenience. This data stays on your device and
                  can be cleared anytime.
                </p>
              </Card>
            </div>
          </div>

          <Card className='mt-8 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-8'>
            <h3 className={cn('mb-4 font-bold text-foreground', TYPOGRAPHY.TEXT_XL)}>
              Technical Explanation
            </h3>
            <p className='text-muted-foreground leading-relaxed'>
              We use client-side JavaScript to perform all tax calculations in your browser. The
              calculation engine runs entirely on your device - we literally cannot see your tax
              information even if we wanted to. This is privacy by design, not just policy.
            </p>
          </Card>
        </div>
      </section>

      {/* Analytics & Cookies */}
      <section className='bg-gradient-to-br from-primary/10 via-accent/5 to-transparent py-12 md:py-20'>
        <div className='container mx-auto max-w-6xl px-4'>
          <div className='grid gap-12 md:grid-cols-2'>
            {/* Analytics */}
            <div>
              <div className='mb-8 text-center'>
                <Globe className={`mx-auto mb-6 ${'size-16'} text-accent`} aria-hidden='true' />
                <GradientText
                  variant='brand'
                  as='h2'
                  className={cn('mb-4 font-bold', TYPOGRAPHY.TEXT_3XL)}
                >
                  Website Analytics
                </GradientText>
                <p className='text-muted-foreground'>Anonymous usage data (completely optional)</p>
              </div>

              <Card className='border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-8'>
                <h3 className={cn('mb-4 font-semibold text-foreground', TYPOGRAPHY.TEXT_LG)}>
                  What We See (If You Consent)
                </h3>
                <ul className='space-y-2 text-muted-foreground text-sm'>
                  <li>✓ Which pages are most popular</li>
                  <li>✓ General location (city level, not address)</li>
                  <li>✓ Device type (mobile, tablet, desktop)</li>
                  <li>✓ Time spent on the site</li>
                  <li>✓ Which features are used most</li>
                  <li>✓ Basic error reports (no personal data)</li>
                </ul>
              </Card>

              <Card className='mt-6 border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10 p-8'>
                <h3 className={cn('mb-4 font-semibold text-foreground', TYPOGRAPHY.TEXT_LG)}>
                  What We Never See
                </h3>
                <ul className='space-y-2 text-muted-foreground text-sm'>
                  <li>✗ Your tax calculations or results</li>
                  <li>✗ Personal information you enter</li>
                  <li>✗ Your exact IP address or identity</li>
                  <li>✗ Your browsing history on other sites</li>
                  <li>✗ Data that could identify you personally</li>
                </ul>
              </Card>
            </div>

            {/* Cookies */}
            <div>
              <div className='mb-8 text-center'>
                <Cookie
                  className={`mx-auto mb-6 ${'size-16'} text-yellow-500`}
                  aria-hidden='true'
                />
                <h2
                  className={cn(
                    'mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text font-bold text-transparent',
                    TYPOGRAPHY.TEXT_3XL
                  )}
                >
                  Cookies We Use
                </h2>
                <p className='text-muted-foreground'>Minimal, transparent, under your control</p>
              </div>

              <Card className='border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-500/10 p-8'>
                <div className='mb-4 flex items-center gap-3'>
                  <div
                    className={`flex ${ICON_SIZES.SIZE_8} items-center justify-center rounded-lg bg-red-500`}
                  >
                    <span className='font-bold text-sm text-white'>!</span>
                  </div>
                  <h3 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_LG)}>
                    Essential (Required)
                  </h3>
                </div>
                <p className={cn('mb-3 text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                  Necessary for the website to function. Remember your cookie preferences and keep
                  the site working.
                </p>
                <div className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>
                  Examples: Cookie consent, theme preference
                </div>
              </Card>

              <Card className='mt-6 border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-blue-500/10 p-8'>
                <div className='mb-4 flex items-center gap-3'>
                  <div
                    className={`flex ${ICON_SIZES.SIZE_8} items-center justify-center rounded-lg bg-blue-500`}
                  >
                    <span className='font-bold text-sm text-white'>?</span>
                  </div>
                  <h3 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_LG)}>
                    Analytics (Optional)
                  </h3>
                </div>
                <p className={cn('mb-3 text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                  Google Analytics helps us improve. You can decline these completely - the
                  calculator works the same.
                </p>
                <div className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>
                  Examples: Page views, session duration, anonymized patterns
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-6xl px-4'>
          <div className='grid gap-4 md:grid-cols-2 md:gap-8'>
            <Card className='border-primary/20 p-8 transition-all duration-300 active:scale-[1.02] md:hover:border-primary/40 md:hover:shadow-xl'>
              <Globe className={`mb-4 ${ICON_SIZES.SIZE_12} text-accent`} aria-hidden='true' />
              <h3 className={cn('mb-4 font-bold text-foreground', TYPOGRAPHY.TEXT_XL)}>
                External Links
              </h3>
              <p className='text-muted-foreground leading-relaxed'>
                We link to official sources like HMRC for tax information and rates. These external
                sites have their own privacy policies that we don&apos;t control.
              </p>
            </Card>

            <Card className='border-primary/20 p-8 transition-all duration-300 active:scale-[1.02] md:hover:border-primary/40 md:hover:shadow-xl'>
              <Calendar className={`mb-4 ${ICON_SIZES.SIZE_12} text-primary`} aria-hidden='true' />
              <h3 className={cn('mb-4 font-bold text-foreground', TYPOGRAPHY.TEXT_XL)}>
                Policy Updates
              </h3>
              <p className='text-muted-foreground leading-relaxed'>
                If we update this policy, we&apos;ll change the date at the top and add a notice on
                the site. We&apos;ll never make changes that compromise your privacy.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='bg-gradient-to-br from-primary/5 via-accent/5 to-transparent py-12 md:py-20'>
        <div className='container mx-auto max-w-4xl px-4'>
          <Card className='border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 p-12 text-center'>
            <Shield className={`mx-auto mb-6 ${'size-16'} text-primary`} aria-hidden='true' />
            <h2 className={cn('mb-4 font-bold text-foreground md:text-4xl', TYPOGRAPHY.TEXT_3XL)}>
              Privacy-First Tax Calculations
            </h2>
            <p className={cn('mb-8 text-muted-foreground', TYPOGRAPHY.TEXT_LG)}>
              Experience the UK&apos;s most private tax calculator. No compromises on your data.
            </p>
            <Link
              href='/'
              className={cn(
                'inline-block rounded-lg bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end px-8 py-4 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl',
                TYPOGRAPHY.TEXT_LG
              )}
            >
              Try the Calculator →
            </Link>
          </Card>
        </div>
      </section>

      {/* Contact Footer */}
      <section className='border-border border-t py-16'>
        <div className='container mx-auto max-w-4xl px-4 text-center'>
          <h3 className={cn('mb-4 font-bold text-foreground', TYPOGRAPHY.TEXT_2XL)}>
            Questions About Privacy?
          </h3>
          <p className='mb-6 text-muted-foreground'>
            We&apos;re happy to answer any questions about how we protect your data.
          </p>
          <div className='flex flex-wrap items-center justify-center gap-6'>
            <a
              href='mailto:support@payetax.co.uk'
              className='text-primary transition-colors hover:text-brand-gradient-end'
            >
              support@payetax.co.uk
            </a>
            <span className='text-muted-foreground'>•</span>
            <Link
              href='/about'
              className='text-primary transition-colors hover:text-brand-gradient-end'
            >
              About Us
            </Link>
            <span className='text-muted-foreground'>•</span>
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
