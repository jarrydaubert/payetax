// src/app/privacy/page.tsx
'use client';

import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  Cookie,
  Database,
  Eye,
  FileText,
  Globe,
  Lock,
  Server,
  Shield,
  UserX,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  const privacyPrinciples = [
    {
      icon: Lock,
      title: 'Client-Side Calculations',
      description:
        'All tax calculations run in your browser using JavaScript. Your salary, tax code, and personal details never leave your device.',
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Database,
      title: 'Zero Server Storage',
      description:
        "We don't store your tax data on our servers. Calculations happen locally, results display instantly, nothing gets saved remotely.",
      color: 'from-green-500/20 to-emerald-500/20',
      iconColor: 'from-green-500 to-emerald-500',
    },
    {
      icon: Eye,
      title: 'Optional Analytics',
      description:
        'Anonymous usage data (page views, device type) only with your consent. You can decline entirely - the calculator works exactly the same.',
      color: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'from-purple-500 to-pink-500',
    },
    {
      icon: Shield,
      title: 'Privacy by Design',
      description:
        'Not just policy - architectural impossibility to see your data. We built privacy into the foundation, not added it later.',
      color: 'from-orange-500/20 to-red-500/20',
      iconColor: 'from-orange-500 to-red-500',
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

  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className='relative overflow-hidden bg-gradient-to-br from-green-500/5 via-blue-500/5 to-purple-500/5 pt-32 pb-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='text-center'
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className='mb-6 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-6 py-2.5 backdrop-blur-sm'
            >
              <Shield className='size-5 text-green-500' />
              <span className='font-semibold text-green-500 text-sm'>Privacy Policy</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='mb-6 font-bold text-5xl leading-tight md:text-7xl'
            >
              <span className='bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent'>
                Your Privacy
              </span>
              <br />
              <span className='text-foreground'>Comes First</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className='mx-auto mb-8 max-w-3xl text-muted-foreground text-xl leading-relaxed md:text-2xl'
            >
              Radical transparency about your data. Here&apos;s exactly what we do and don&apos;t do
              with your information.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className='inline-flex items-center gap-2 text-muted-foreground'
            >
              <Calendar className='size-4' />
              <span className='text-sm'>Last updated: October 4, 2025</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Summary */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className='py-20'
      >
        <div className='container mx-auto max-w-6xl px-4'>
          <div className='mb-12 text-center'>
            <CheckCircle className='mx-auto mb-4 size-16 text-green-500' />
            <h2 className='mb-4 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text font-bold text-4xl text-transparent'>
              The 30-Second Version
            </h2>
            <p className='text-lg text-muted-foreground'>Everything you need to know at a glance</p>
          </div>

          <div className='grid gap-8 md:grid-cols-2'>
            <Card className='overflow-hidden border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-500/10 p-8'>
              <div className='mb-6 flex items-center gap-3'>
                <div className='flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg'>
                  <X className='size-6 text-white' />
                </div>
                <h3 className='font-bold text-2xl text-foreground'>What We DON'T Do</h3>
              </div>
              <ul className='space-y-3'>
                {dontDo.map((item, idx) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className='flex items-start gap-3 text-muted-foreground'
                  >
                    <UserX className='mt-0.5 size-5 flex-shrink-0 text-red-500' />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </Card>

            <Card className='overflow-hidden border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-500/10 p-8'>
              <div className='mb-6 flex items-center gap-3'>
                <div className='flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg'>
                  <CheckCircle className='size-6 text-white' />
                </div>
                <h3 className='font-bold text-2xl text-foreground'>What We DO</h3>
              </div>
              <ul className='space-y-3'>
                {doDo.map((item, idx) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className='flex items-start gap-3 text-muted-foreground'
                  >
                    <CheckCircle className='mt-0.5 size-5 flex-shrink-0 text-green-500' />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </motion.section>

      {/* Privacy Principles */}
      <section className='bg-gradient-to-br from-accent/5 via-primary/5 to-transparent py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className='mb-16 text-center'
          >
            <h2 className='mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text font-bold text-4xl text-transparent md:text-5xl'>
              How We Protect Your Privacy
            </h2>
            <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
              Four architectural decisions that make your data truly private
            </p>
          </motion.div>

          <div className='grid gap-8 md:grid-cols-2'>
            {privacyPrinciples.map((principle, idx) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card
                  className={`group h-full overflow-hidden border-primary/20 bg-gradient-to-br ${principle.color} p-8 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-2xl`}
                >
                  <div
                    className={`mb-6 inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br ${principle.iconColor} p-4 shadow-lg transition-transform group-hover:scale-110`}
                  >
                    <principle.icon className='size-8 text-white' />
                  </div>
                  <h3 className='mb-4 font-bold text-2xl text-foreground'>{principle.title}</h3>
                  <p className='text-muted-foreground leading-relaxed'>{principle.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Flow */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className='py-20'
      >
        <div className='container mx-auto max-w-6xl px-4'>
          <div className='mb-16 text-center'>
            <Lock className='mx-auto mb-6 size-16 text-blue-500' />
            <h2 className='mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text font-bold text-4xl text-transparent'>
              Where Your Tax Data Goes
            </h2>
            <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
              Spoiler: Nowhere. Here&apos;s the technical breakdown.
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-3'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className='h-full border-primary/20 p-8 text-center transition-all duration-300 hover:border-primary/40 hover:shadow-xl'>
                <div className='mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg'>
                  <Database className='size-10 text-white' />
                </div>
                <h3 className='mb-4 font-bold text-foreground text-xl'>Your Device</h3>
                <p className='text-muted-foreground leading-relaxed'>
                  All calculations happen here in your browser. Your salary, tax code, and personal
                  details never leave this device.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className='h-full border-primary/20 p-8 text-center transition-all duration-300 hover:border-primary/40 hover:shadow-xl'>
                <div className='mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg'>
                  <Server className='size-10 text-white' />
                </div>
                <h3 className='mb-4 font-bold text-foreground text-xl'>Our Servers</h3>
                <p className='text-muted-foreground leading-relaxed'>
                  Only serve the website code (HTML, CSS, JS). No tax data, no personal information,
                  no calculation results stored.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className='h-full border-primary/20 p-8 text-center transition-all duration-300 hover:border-primary/40 hover:shadow-xl'>
                <div className='mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg'>
                  <FileText className='size-10 text-white' />
                </div>
                <h3 className='mb-4 font-bold text-foreground text-xl'>localStorage</h3>
                <p className='text-muted-foreground leading-relaxed'>
                  We save your inputs locally for convenience. This data stays on your device and
                  can be cleared anytime.
                </p>
              </Card>
            </motion.div>
          </div>

          <Card className='mt-8 border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-blue-500/10 p-8'>
            <h4 className='mb-4 font-bold text-foreground text-xl'>Technical Explanation</h4>
            <p className='text-muted-foreground leading-relaxed'>
              We use client-side JavaScript to perform all tax calculations in your browser. The
              calculation engine runs entirely on your device - we literally cannot see your tax
              information even if we wanted to. This is privacy by design, not just policy.
            </p>
          </Card>
        </div>
      </motion.section>

      {/* Analytics & Cookies */}
      <section className='bg-gradient-to-br from-primary/10 via-accent/5 to-transparent py-20'>
        <div className='container mx-auto max-w-6xl px-4'>
          <div className='grid gap-12 md:grid-cols-2'>
            {/* Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5 }}
            >
              <div className='mb-8 text-center'>
                <Globe className='mx-auto mb-6 size-16 text-purple-500' />
                <h2 className='mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text font-bold text-3xl text-transparent'>
                  Website Analytics
                </h2>
                <p className='text-muted-foreground'>Anonymous usage data (completely optional)</p>
              </div>

              <Card className='border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-500/10 p-8'>
                <h4 className='mb-4 font-semibold text-foreground text-lg'>
                  What We See (If You Consent)
                </h4>
                <ul className='space-y-2 text-muted-foreground text-sm'>
                  <li>✓ Which pages are most popular</li>
                  <li>✓ General location (city level, not address)</li>
                  <li>✓ Device type (mobile, tablet, desktop)</li>
                  <li>✓ Time spent on the site</li>
                  <li>✓ Which features are used most</li>
                  <li>✓ Basic error reports (no personal data)</li>
                </ul>
              </Card>

              <Card className='mt-6 border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-500/10 p-8'>
                <h4 className='mb-4 font-semibold text-foreground text-lg'>What We Never See</h4>
                <ul className='space-y-2 text-muted-foreground text-sm'>
                  <li>✗ Your tax calculations or results</li>
                  <li>✗ Personal information you enter</li>
                  <li>✗ Your exact IP address or identity</li>
                  <li>✗ Your browsing history on other sites</li>
                  <li>✗ Data that could identify you personally</li>
                </ul>
              </Card>
            </motion.div>

            {/* Cookies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className='mb-8 text-center'>
                <Cookie className='mx-auto mb-6 size-16 text-yellow-500' />
                <h2 className='mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text font-bold text-3xl text-transparent'>
                  Cookies We Use
                </h2>
                <p className='text-muted-foreground'>Minimal, transparent, under your control</p>
              </div>

              <Card className='border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-500/10 p-8'>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='flex size-8 items-center justify-center rounded-lg bg-red-500'>
                    <span className='font-bold text-sm text-white'>!</span>
                  </div>
                  <h4 className='font-bold text-foreground text-lg'>Essential (Required)</h4>
                </div>
                <p className='mb-3 text-muted-foreground text-sm'>
                  Necessary for the website to function. Remember your cookie preferences and keep
                  the site working.
                </p>
                <div className='text-muted-foreground text-xs'>
                  Examples: Cookie consent, theme preference
                </div>
              </Card>

              <Card className='mt-6 border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-blue-500/10 p-8'>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='flex size-8 items-center justify-center rounded-lg bg-blue-500'>
                    <span className='font-bold text-sm text-white'>?</span>
                  </div>
                  <h4 className='font-bold text-foreground text-lg'>Analytics (Optional)</h4>
                </div>
                <p className='mb-3 text-muted-foreground text-sm'>
                  Google Analytics helps us improve. You can decline these completely - the
                  calculator works the same.
                </p>
                <div className='text-muted-foreground text-xs'>
                  Examples: Page views, session duration, anonymized patterns
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className='py-20'
      >
        <div className='container mx-auto max-w-6xl px-4'>
          <div className='grid gap-8 md:grid-cols-2'>
            <Card className='border-primary/20 p-8 transition-all duration-300 hover:border-primary/40 hover:shadow-xl'>
              <Globe className='mb-4 size-12 text-cyan-500' />
              <h3 className='mb-4 font-bold text-foreground text-xl'>External Links</h3>
              <p className='text-muted-foreground leading-relaxed'>
                We link to official sources like HMRC for tax information and rates. These external
                sites have their own privacy policies that we don&apos;t control.
              </p>
            </Card>

            <Card className='border-primary/20 p-8 transition-all duration-300 hover:border-primary/40 hover:shadow-xl'>
              <Calendar className='mb-4 size-12 text-green-500' />
              <h3 className='mb-4 font-bold text-foreground text-xl'>Policy Updates</h3>
              <p className='text-muted-foreground leading-relaxed'>
                If we update this policy, we&apos;ll change the date at the top and add a notice on
                the site. We&apos;ll never make changes that compromise your privacy.
              </p>
            </Card>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className='bg-gradient-to-br from-green-500/5 via-blue-500/5 to-purple-500/5 py-20'>
        <div className='container mx-auto max-w-4xl px-4'>
          <Card className='border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 p-12 text-center'>
            <Shield className='mx-auto mb-6 size-16 text-primary' />
            <h2 className='mb-4 font-bold text-3xl text-foreground md:text-4xl'>
              Privacy-First Tax Calculations
            </h2>
            <p className='mb-8 text-lg text-muted-foreground'>
              Experience the UK&apos;s most private tax calculator. No compromises on your data.
            </p>
            <Link
              href='/'
              className='inline-block rounded-lg bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end px-8 py-4 font-bold text-lg text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl'
            >
              Try the Calculator →
            </Link>
          </Card>
        </div>
      </section>

      {/* Contact Footer */}
      <section className='border-border border-t py-16'>
        <div className='container mx-auto max-w-4xl px-4 text-center'>
          <h3 className='mb-4 font-bold text-2xl text-foreground'>Questions About Privacy?</h3>
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
