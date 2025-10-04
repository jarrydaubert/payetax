// src/app/about/page.tsx
'use client';

import {
  Award,
  Calculator,
  Code,
  Coffee,
  Heart,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import CallToAction from '@/components/ui/CallToAction';

export default function AboutPage() {
  const stats = [
    { icon: Calculator, value: 'Free', label: 'Always' },
    { icon: Code, value: '99.9%', label: 'Uptime' },
    { icon: Award, value: 'HMRC', label: 'Compliant' },
    { icon: Shield, value: 'Zero', label: 'Data Collected' },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Privacy First, Always',
      description:
        'Every calculation happens in your browser. Your salary, tax code, and personal details never touch our servers. Privacy by architecture, not just policy.',
      color: 'from-green-400 to-emerald-500',
    },
    {
      icon: Zap,
      title: 'Lightning Fast Performance',
      description:
        'Built with cutting-edge Next.js 15 and React 19. Sub-second load times, instant calculations, and silky smooth animations.',
      color: 'from-yellow-400 to-orange-500',
    },
    {
      icon: Calculator,
      title: 'HMRC Compliant Calculations',
      description:
        'Official tax rates and thresholds from HMRC. Updated within 24 hours of any government changes. Scottish rates fully supported.',
      color: 'from-blue-400 to-cyan-500',
    },
    {
      icon: Heart,
      title: 'Actually Free Forever',
      description:
        'No premium features, no paywalls, no "trial periods". Every feature is free for everyone, forever. Because tax calculations should be accessible to all.',
      color: 'from-purple-400 to-pink-500',
    },
  ];

  return (
    <div className='min-h-screen pt-20'>
      <div className='container mx-auto max-w-6xl px-4 lg:max-w-7xl'>
        {/* Header */}
        <div className='mb-16'>
          <div className='text-center'>
            <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2'>
              <Sparkles className='h-4 w-4 text-primary' />
              <span className='font-medium text-primary text-sm'>About PayeTax</span>
            </div>

            <h1 className='mb-6 font-bold text-4xl md:text-6xl'>
              <span className='bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent'>
                Tax Calculations
              </span>
              <br />
              <span className='text-foreground'>That Respect Your Privacy</span>
            </h1>

            <p className='mx-auto max-w-3xl text-muted-foreground text-xl leading-relaxed'>
              UK tax shouldn't require handing over your personal data. We built PayeTax as the
              calculator we wished existed - instant, accurate, and completely private.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className='mb-16 grid grid-cols-2 gap-6 md:grid-cols-4'>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className='glass-card p-6 text-center transition-colors hover:border-primary/50'
            >
              <stat.icon className='mx-auto mb-3 h-8 w-8 text-primary' />
              <div className='mb-1 font-bold text-2xl text-foreground'>{stat.value}</div>
              <div className='text-muted-foreground text-sm'>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div className='glass-card mb-16 border-primary border-l-4 p-8 text-center md:p-12'>
          <Heart className='mx-auto mb-6 h-12 w-12 text-primary' />
          <h2 className='mb-6 font-bold text-3xl text-foreground'>Our Mission</h2>
          <p className='mx-auto max-w-4xl text-muted-foreground text-xl leading-relaxed'>
            Every UK taxpayer deserves instant, accurate tax calculations without sacrificing their
            privacy or opening their wallet. We're building the most transparent, accessible, and
            trustworthy tax calculator in the UK - and it will always be free.
          </p>
        </div>

        {/* Features Grid */}
        <div className='mb-16'>
          <h2 className='mb-12 text-center font-bold text-3xl text-foreground'>Built Different</h2>
          <div className='grid gap-8 md:grid-cols-2'>
            {features.map((feature) => (
              <div
                key={feature.title}
                className='glass-card group p-8 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg'
              >
                <div
                  className={`h-16 w-16 rounded-xl bg-gradient-to-r ${feature.color} mb-6 p-4 transition-transform group-hover:scale-110`}
                >
                  <feature.icon className='h-8 w-8 text-white' />
                </div>
                <h3 className='mb-4 font-semibold text-foreground text-xl'>{feature.title}</h3>
                <p className='text-muted-foreground leading-relaxed'>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className='glass-card mb-16 p-8 md:p-12'>
          <div className='mb-12 text-center'>
            <Code className='mx-auto mb-6 h-12 w-12 text-primary' />
            <h2 className='mb-6 font-bold text-3xl text-foreground'>
              Built with Modern Technology
            </h2>
            <p className='mx-auto max-w-3xl text-muted-foreground text-xl leading-relaxed'>
              We use the latest web technologies to deliver exceptional performance, security, and
              user experience.
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-3'>
            <div className='text-center'>
              <TrendingUp className='mx-auto mb-4 h-8 w-8 text-green-500' />
              <h3 className='mb-3 font-semibold text-foreground text-lg'>Performance</h3>
              <p className='text-muted-foreground text-sm'>
                Sub-300kB bundle size, &lt; 1.5s load times, and 95+ Lighthouse scores across the
                board.
              </p>
            </div>

            <div className='text-center'>
              <Shield className='mx-auto mb-4 h-8 w-8 text-blue-500' />
              <h3 className='mb-3 font-semibold text-foreground text-lg'>Security</h3>
              <p className='text-muted-foreground text-sm'>
                Client-side calculations mean zero data collection. Not "minimal" tracking -
                actually zero.
              </p>
            </div>

            <div className='text-center'>
              <Sparkles className='mx-auto mb-4 h-8 w-8 text-purple-500' />
              <h3 className='mb-3 font-semibold text-foreground text-lg'>Innovation</h3>
              <p className='text-muted-foreground text-sm'>
                Weekly improvements, instant tax rate updates, and features requested by users like
                you.
              </p>
            </div>
          </div>

          {/* Tech stack badges */}
          <div className='mt-12 text-center'>
            <h4 className='mb-6 font-semibold text-foreground text-lg'>Powered by</h4>
            <div className='flex flex-wrap justify-center gap-3'>
              {[
                'Next.js 15',
                'React 19',
                'TypeScript',
                'Tailwind CSS 4',
                'Zustand',
                'shadcn/ui',
                'Framer Motion',
              ].map((tech) => (
                <span
                  key={tech}
                  className='rounded-full border border-border bg-muted px-4 py-2 text-muted-foreground text-sm transition-colors hover:border-primary/50 hover:text-foreground'
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Story */}
        <div className='glass-card mb-16 p-8 md:p-12'>
          <h2 className='mb-8 font-bold text-3xl text-foreground'>Why We Built PayeTax</h2>
          <div className='prose prose-lg max-w-none'>
            <p className='mb-6 text-muted-foreground leading-relaxed'>
              As UK taxpayers and software engineers, we were frustrated by the state of online tax
              calculators. They were slow, cluttered with ads, required personal information, or hid
              features behind paywalls. We knew it didn't have to be this way.
            </p>
            <p className='mb-6 text-muted-foreground leading-relaxed'>
              PayeTax started with a simple philosophy: tax calculations should be instant,
              accurate, and completely private. No accounts, no tracking, no compromises. Just pure,
              client-side calculations using official HMRC rates.
            </p>
            <p className='mb-6 text-muted-foreground leading-relaxed'>
              Today, we're proud to help people across the UK understand their take-home pay, plan
              salary negotiations, compare job offers, and make informed financial decisions - all
              while respecting their privacy.
            </p>
            <p className='text-muted-foreground leading-relaxed'>
              We're continuously improving based on your feedback. Every feature request matters,
              every bug report helps, and every suggestion makes PayeTax better for everyone.
            </p>
          </div>
        </div>

        {/* Contact */}
        <CallToAction variant='contact' className='mt-16 mb-8' />

        {/* Footer */}
        <div className='border-border border-t py-12 text-center'>
          <div className='mb-4 flex items-center justify-center gap-2'>
            <Coffee className='h-5 w-5 text-primary' />
            <span className='font-semibold text-foreground text-lg'>
              Built with care for UK taxpayers
            </span>
          </div>
          <p className='text-muted-foreground text-sm'>
            Free, fast, and privacy-first tax calculations since 2024
          </p>
        </div>
      </div>
    </div>
  );
}
