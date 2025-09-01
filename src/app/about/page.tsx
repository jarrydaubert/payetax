// src/app/about/page.tsx
/**
 * About Page - Company and Product Information
 *
 * This page provides comprehensive information about ToolHubX, including:
 * - Mission and values
 * - Product features and benefits
 * - Privacy and security commitments
 * - Technical specifications
 * - Team and company background
 *
 * The page is designed to build trust with users by being transparent about
 * our approach to tax calculations, data privacy, and technical standards.
 *
 * Features:
 * - Responsive hero section with company overview
 * - Statistical highlights showing credibility
 * - Feature showcase with icons and descriptions
 * - Privacy-first messaging
 * - Call-to-action for calculator usage
 * - Clean glass-morphism design consistent with app
 *
 * SEO Optimized:
 * - Comprehensive metadata for search engines
 * - Structured content for rich snippets
 * - Keyword optimization for UK tax calculator searches
 */

import {
  ArrowLeft,
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
import type { Metadata } from 'next';
import Link from 'next/link';
import CallToAction from '@/components/ui/CallToAction';

export const metadata: Metadata = {
  title: 'About ToolHubX - UK Tax Calculator',
  description:
    'Learn about ToolHubX - the modern, accurate UK PAYE tax calculator built with privacy and performance in mind. Free, fast, and HMRC-compliant.',
  keywords:
    'about toolhubx, uk tax calculator team, hmrc compliant calculator, privacy-first tax tools',
};

export default function AboutPage() {
  const stats = [
    { icon: Calculator, value: 'Daily', label: 'Calculations' },
    { icon: Code, value: '99.9%', label: 'Uptime' },
    { icon: Award, value: 'HMRC', label: 'Compliant' },
    { icon: Shield, value: 'Secure', label: 'By Design' },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Privacy First',
      description:
        'All calculations happen in your browser. We never see or store your personal data.',
      color: 'from-green-400 to-emerald-500',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built with Next.js 15 and React 19 for instant calculations and smooth UX.',
      color: 'from-yellow-400 to-orange-500',
    },
    {
      icon: Calculator,
      title: 'HMRC Compliant',
      description:
        'Uses official HMRC rates and thresholds. Always up-to-date with latest changes.',
      color: 'from-blue-400 to-cyan-500',
    },
    {
      icon: Heart,
      title: 'Free Forever',
      description:
        'No hidden costs, premium features, or paywalls. Just honest, reliable calculations.',
      color: 'from-purple-400 to-pink-500',
    },
  ];

  return (
    <div className='min-h-screen pt-20'>
      <div className='container mx-auto max-w-6xl px-4 lg:max-w-7xl'>
        {/* Header */}
        <div className='mb-16'>
          <Link
            href='/'
            className='group mb-8 inline-flex items-center text-purple-400 transition-colors hover:text-purple-300'
          >
            <ArrowLeft className='group-hover:-translate-x-1 mr-2 h-4 w-4 transition-transform' />
            Back to Calculator
          </Link>

          <div className='text-center'>
            <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 px-4 py-2'>
              <Sparkles className='h-4 w-4 text-purple-400' />
              <span className='font-medium text-purple-300 text-sm'>About ToolHubX</span>
            </div>

            <h1 className='mb-6 font-bold text-4xl md:text-6xl'>
              <span className='bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent'>
                Modern Tax Calculator
              </span>
              <br />
              <span className='text-white'>Built for Everyone</span>
            </h1>

            <p className='mx-auto max-w-3xl text-gray-300 text-xl leading-relaxed'>
              We believe UK tax calculations should be simple, accurate, and accessible. No accounts
              required, no personal data stored - just honest, reliable calculations.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className='mb-16 grid grid-cols-2 gap-6 md:grid-cols-4'>
          {stats.map((stat) => (
            <div key={stat.label} className='glass-card p-6 text-center'>
              <stat.icon className='mx-auto mb-3 h-8 w-8 text-purple-400' />
              <div className='mb-1 font-bold text-2xl text-white'>{stat.value}</div>
              <div className='text-gray-300 text-sm'>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div className='glass-card mb-16 p-8 text-center md:p-12'>
          <Heart className='mx-auto mb-6 h-12 w-12 text-pink-400' />
          <h2 className='mb-6 font-bold text-3xl text-white'>Our Mission</h2>
          <p className='mx-auto max-w-4xl text-gray-300 text-xl leading-relaxed'>
            To democratize UK tax calculations by providing a free, privacy-first, and accurate tool
            that helps millions of people understand their take-home pay without compromising their
            personal data.
          </p>
        </div>

        {/* Features Grid */}
        <div className='mb-16'>
          <h2 className='mb-12 text-center font-bold text-3xl text-white'>Why Choose ToolHubX?</h2>
          <div className='grid gap-8 md:grid-cols-2'>
            {features.map((feature) => (
              <div
                key={feature.title}
                className='glass-card group p-8 transition-transform duration-300 hover:scale-105'
              >
                <div className={`h-16 w-16 rounded-xl bg-gradient-to-r ${feature.color} mb-6 p-4`}>
                  <feature.icon className='h-8 w-8 text-white' />
                </div>
                <h3 className='mb-4 font-semibold text-white text-xl'>{feature.title}</h3>
                <p className='text-gray-300 leading-relaxed'>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className='glass-card mb-16 p-8 md:p-12'>
          <div className='mb-12 text-center'>
            <Code className='mx-auto mb-6 h-12 w-12 text-cyan-400' />
            <h2 className='mb-6 font-bold text-3xl text-white'>Built with Modern Technology</h2>
            <p className='mx-auto max-w-3xl text-gray-300 text-xl leading-relaxed'>
              ToolHubX is crafted using cutting-edge web technologies to deliver the best possible
              experience while maintaining privacy and performance.
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-3'>
            <div className='text-center'>
              <TrendingUp className='mx-auto mb-4 h-8 w-8 text-green-400' />
              <h3 className='mb-3 font-semibold text-lg text-white'>Performance</h3>
              <p className='text-gray-300 text-sm'>
                Bundle size under 280kB, load times under 1.5s, and 99.9% uptime for reliability you
                can count on.
              </p>
            </div>

            <div className='text-center'>
              <Shield className='mx-auto mb-4 h-8 w-8 text-purple-400' />
              <h3 className='mb-3 font-semibold text-lg text-white'>Security</h3>
              <p className='text-gray-300 text-sm'>
                All calculations happen client-side. Zero data collection, no tracking, complete
                privacy by design.
              </p>
            </div>

            <div className='text-center'>
              <Sparkles className='mx-auto mb-4 h-8 w-8 text-pink-400' />
              <h3 className='mb-3 font-semibold text-lg text-white'>Innovation</h3>
              <p className='text-gray-300 text-sm'>
                Continuous improvements, latest tax rates, and user-requested features delivered
                regularly.
              </p>
            </div>
          </div>

          {/* Tech stack badges */}
          <div className='mt-12 text-center'>
            <h4 className='mb-6 font-semibold text-lg text-white'>Powered by</h4>
            <div className='flex flex-wrap justify-center gap-3'>
              {[
                'Next.js 15',
                'React 19',
                'TypeScript',
                'Tailwind CSS',
                'Zustand',
                'ExcelJS',
                'Lucide Icons',
              ].map((tech) => (
                <span
                  key={tech}
                  className='rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80'
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Story */}
        <div className='glass-card mb-16 p-8 md:p-12'>
          <h2 className='mb-8 font-bold text-3xl text-white'>Our Story</h2>
          <div className='prose prose-lg prose-invert max-w-none'>
            <p className='mb-6 text-gray-300 leading-relaxed'>
              ToolHubX was born from frustration with complex, invasive tax calculators that
              required personal information just to estimate take-home pay. As developers and UK
              taxpayers ourselves, we knew there had to be a better way.
            </p>
            <p className='mb-6 text-gray-300 leading-relaxed'>
              We built ToolHubX with a simple philosophy: tax calculations should be instant,
              accurate, and completely private. No accounts, no tracking, no data collection - just
              the calculations you need, when you need them.
            </p>
            <p className='text-gray-300 leading-relaxed'>
              Today, ToolHubX helps hundreds of people every month understand their finances better,
              plan for the future, and make informed decisions about their careers and earnings.
            </p>
          </div>
        </div>

        {/* Contact */}
        <CallToAction variant='contact' className='mt-16 mb-8' />

        {/* Footer */}
        <div className='border-white/20 border-t py-12 text-center'>
          <div className='mb-4 flex items-center justify-center gap-2'>
            <Coffee className='h-5 w-5 text-yellow-400' />
            <span className='font-semibold text-lg text-white'>Made with ❤️ for UK taxpayers</span>
          </div>
          <p className='text-gray-300'>Free, fast, and privacy-first tax calculations since 2024</p>
        </div>
      </div>
    </div>
  );
}
