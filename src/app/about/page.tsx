// src/app/about/page.tsx
'use client';

import { motion } from 'framer-motion';
import {
  Award,
  Calculator,
  Code,
  Eye,
  Heart,
  Lightbulb,
  Lock,
  Rocket,
  Shield,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function AboutPage() {
  const stats = [
    { icon: Calculator, value: '100%', label: 'Free Forever', color: 'from-blue-500 to-cyan-500' },
    { icon: Lock, value: '0', label: 'Data Stored', color: 'from-green-500 to-emerald-500' },
    {
      icon: Award,
      value: 'HMRC',
      label: 'Official Rates',
      color: 'from-purple-500 to-pink-500',
    },
    { icon: Zap, value: '<300kB', label: 'Bundle Size', color: 'from-orange-500 to-red-500' },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Privacy is Sacred',
      description:
        "Every calculation runs in your browser. We never see your salary, tax code, or personal details. This isn't a promise - it's architectural impossibility.",
      gradient: 'from-green-500/20 to-emerald-500/20',
      iconGradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Eye,
      title: 'Radical Transparency',
      description:
        'Open-source philosophy, honest analytics, and clear documentation. No dark patterns, no hidden fees, no corporate speak. Just honest tax calculations.',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconGradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Target,
      title: 'Accuracy First',
      description:
        'Official HMRC rates updated within 24 hours of changes. Comprehensive testing for Scottish rates, student loans, pensions, and edge cases.',
      gradient: 'from-purple-500/20 to-pink-500/20',
      iconGradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Heart,
      title: 'Genuinely Free',
      description:
        'No premium tiers, no paywalls, no "upgrade to see more". Every feature is free for everyone, forever. Tax calculations should be accessible to all.',
      gradient: 'from-red-500/20 to-orange-500/20',
      iconGradient: 'from-red-500 to-orange-500',
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

  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className='relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-transparent pt-20 pb-10 md:pt-32 md:pb-20'>
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
              className='mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-6 py-2.5 backdrop-blur-sm'
            >
              <Sparkles className='size-5 text-primary' />
              <span className='font-semibold text-foreground text-sm'>About PayeTax</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='mb-6 font-bold text-5xl leading-tight md:text-7xl'
            >
              <span className='bg-gradient-to-r from-brand-gradient-start via-brand-accent to-brand-gradient-end bg-clip-text text-transparent'>
                Tax Calculations
              </span>
              <br />
              <span className='text-foreground'>Built for Privacy</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className='mx-auto mb-12 max-w-3xl text-muted-foreground text-xl leading-relaxed md:text-2xl'
            >
              The UK tax calculator that respects your privacy, delivers instant accuracy, and costs
              nothing. No compromises.
            </motion.p>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className='grid gap-3 md:grid-cols-4 md:gap-6'
            >
              {stats.map((stat, _idx) => (
                <Card
                  key={stat.label}
                  className='group relative overflow-hidden border-primary/20 p-8 transition-all duration-300 active:scale-[1.02] md:hover:scale-105 md:hover:border-primary/40 md:hover:shadow-2xl'
                >
                  <div
                    className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`}
                  />
                  <stat.icon className='mx-auto mb-4 size-10 text-primary' />
                  <div className='mb-2 font-bold text-3xl text-foreground'>{stat.value}</div>
                  <div className='text-muted-foreground text-sm'>{stat.label}</div>
                </Card>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className='py-12 md:py-20'
      >
        <div className='container mx-auto max-w-5xl px-4'>
          <Card className='border-primary/30 border-l-8 bg-gradient-to-br from-primary/5 to-accent/5 p-12 text-center'>
            <Heart className='mx-auto mb-6 size-16 text-primary' />
            <h2 className='mb-6 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text font-bold text-4xl text-transparent'>
              Our Mission
            </h2>
            <p className='mx-auto max-w-3xl text-muted-foreground text-xl leading-relaxed'>
              Every UK taxpayer deserves instant, accurate tax calculations without sacrificing
              privacy or paying a penny. We&apos;re building the most transparent, accessible, and
              trustworthy tax calculator in the UK.
            </p>
          </Card>
        </div>
      </motion.section>

      {/* Values Grid */}
      <section className='bg-gradient-to-br from-accent/5 via-primary/5 to-transparent py-12 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className='mb-16 text-center'
          >
            <h2 className='mb-4 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text font-bold text-4xl text-transparent md:text-5xl'>
              What We Stand For
            </h2>
            <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
              Four principles that guide everything we build
            </p>
          </motion.div>

          <div className='grid gap-4 md:grid-cols-2 md:gap-8'>
            {values.map((value, idx) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card
                  className={`group h-full overflow-hidden border-primary/20 bg-gradient-to-br ${value.gradient} p-8 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] md:hover:border-primary/40 md:hover:shadow-2xl`}
                >
                  <div
                    className={`mb-6 inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br ${value.iconGradient} p-4 shadow-lg transition-transform group-hover:scale-110`}
                  >
                    <value.icon className='size-8 text-white' />
                  </div>
                  <h3 className='mb-4 font-bold text-2xl text-foreground'>{value.title}</h3>
                  <p className='text-muted-foreground leading-relaxed'>{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className='py-12 md:py-20'
      >
        <div className='container mx-auto max-w-7xl px-4'>
          <div className='mb-16 text-center'>
            <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-6 py-2.5'>
              <Code className='size-5 text-blue-500' />
              <span className='font-semibold text-blue-500 text-sm'>Modern Technology</span>
            </div>
            <h2 className='mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text font-bold text-4xl text-transparent md:text-5xl'>
              Built for Performance
            </h2>
            <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
              Cutting-edge web technologies for exceptional speed, security, and experience
            </p>
          </div>

          <div className='mb-12 grid gap-8 md:grid-cols-3'>
            {techFeatures.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className='group h-full border-primary/20 p-8 text-center transition-all duration-300 active:scale-[1.02] md:hover:scale-105 md:hover:border-primary/40 md:hover:shadow-2xl'>
                  <feature.icon className='mx-auto mb-4 size-12 text-primary' />
                  <div className='mb-2 font-bold text-3xl text-foreground'>{feature.metric}</div>
                  <h3 className='mb-3 font-semibold text-foreground text-lg'>{feature.title}</h3>
                  <p className='text-muted-foreground text-sm'>{feature.description}</p>
                </Card>
              </motion.div>
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
      </motion.section>

      {/* Story Section */}
      <section className='bg-gradient-to-br from-primary/10 via-accent/5 to-transparent py-12 md:py-20'>
        <div className='container mx-auto max-w-5xl px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
          >
            <Card className='border-primary/20 p-12'>
              <div className='mb-8 text-center'>
                <Lightbulb className='mx-auto mb-6 size-16 text-primary' />
                <h2 className='mb-4 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text font-bold text-4xl text-transparent'>
                  Why We Built PayeTax
                </h2>
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
                  We're continuously improving based on your feedback. Every feature request
                  matters, every bug report helps, and every suggestion makes PayeTax better for
                  everyone.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className='py-12 md:py-20'
      >
        <div className='container mx-auto max-w-4xl px-4'>
          <Card className='border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 p-12 text-center'>
            <h2 className='mb-4 font-bold text-3xl text-foreground md:text-4xl'>
              Ready to Calculate Your Take-Home Pay?
            </h2>
            <p className='mb-8 text-lg text-muted-foreground'>
              Free, fast, and completely private. No sign-up required.
            </p>
            <Link
              href='/'
              className='inline-block rounded-lg bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end px-8 py-4 font-bold text-lg text-white shadow-lg transition-all hover:shadow-xl active:scale-[1.02] md:hover:scale-105'
            >
              Try the Calculator →
            </Link>
          </Card>
        </div>
      </motion.section>

      {/* Contact Footer */}
      <section className='border-border border-t py-16'>
        <div className='container mx-auto max-w-4xl px-4 text-center'>
          <h3 className='mb-4 font-bold text-2xl text-foreground'>Get in Touch</h3>
          <p className='mb-6 text-muted-foreground'>
            Questions, feedback, or suggestions? We&apos;d love to hear from you.
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
              href='/privacy'
              className='text-primary transition-colors hover:text-brand-gradient-end'
            >
              Privacy Policy
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
