// src/components/organisms/TechShowcase.tsx
'use client';

import {
  Brain,
  ChevronRight,
  Cpu,
  Database,
  FileSpreadsheet,
  Gauge,
  Shield,
  Smartphone,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

const TechShowcase: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Real-time calculations powered by Next.js 15 and React 19',
      tech: 'Next.js 15 • React 19 • TypeScript',
      color: 'from-yellow-400 to-orange-500',
      details:
        'Built with the latest React Server Components and Next.js App Router for blazing fast performance',
    },
    {
      icon: Shield,
      title: 'HMRC Compliant',
      description: 'Accurate UK tax calculations using official HMRC rates',
      tech: 'Tax Engine • Zustand • Validation',
      color: 'from-green-400 to-emerald-500',
      details: 'Our sophisticated calculation engine implements every HMRC rule with precision',
    },
    {
      icon: FileSpreadsheet,
      title: 'Professional Exports',
      description: 'Beautiful Excel reports with landscape formatting',
      tech: 'ExcelJS • Professional Layout • Dynamic Columns',
      color: 'from-blue-400 to-cyan-500',
      details: 'Export your payslip summaries to Excel with professional formatting and styling',
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Responsive design that works perfectly on all devices',
      tech: 'Tailwind CSS • Mobile UX • Touch Optimized',
      color: 'from-purple-400 to-pink-500',
      details:
        'Every interaction is optimized for mobile with smooth scrolling and touch-friendly controls',
    },
    {
      icon: Brain,
      title: 'Smart Defaults',
      description: 'Intelligent form handling with auto-detection',
      tech: 'Scottish Tax Detection • Validation • UX',
      color: 'from-indigo-400 to-purple-500',
      details: 'Automatically detects Scottish tax codes and provides smart defaults for better UX',
    },
    {
      icon: Gauge,
      title: 'Optimized Performance',
      description: 'Bundle size under 280kB with dynamic imports',
      tech: 'Bundle Analysis • Tree Shaking • Code Splitting',
      color: 'from-red-400 to-rose-500',
      details: 'Every byte optimized for the fastest possible loading times',
    },
  ];

  const techStats = [
    {
      icon: Cpu,
      label: 'Bundle Size',
      value: '279kB',
      description: 'Optimized & fast',
      color: 'text-blue-400',
    },
    {
      icon: Zap,
      label: 'Load Time',
      value: '<1.5s',
      description: 'Lightning fast',
      color: 'text-yellow-400',
    },
    {
      icon: Database,
      label: 'Components',
      value: '40+',
      description: 'Modular design',
      color: 'text-green-400',
    },
    {
      icon: Users,
      label: 'Accessibility',
      value: 'WCAG AA',
      description: 'Inclusive design',
      color: 'text-purple-400',
    },
  ];

  return (
    <section className='relative z-10 py-16'>
      <div className='container mx-auto max-w-6xl px-4'>
        {/* Header */}
        <div className='mb-12 text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 px-4 py-2'>
            <Sparkles className='h-4 w-4 text-purple-400' />
            <span className='font-medium text-purple-300 text-sm'>Cutting-Edge Technology</span>
          </div>
          <h2 className='mb-4 font-bold text-3xl text-white md:text-4xl'>
            Built with Modern Web Tech
          </h2>
          <p className='mx-auto max-w-2xl text-lg text-white/80'>
            Professional-grade tax calculator powered by the latest technologies and optimized for
            performance
          </p>
        </div>

        {/* Tech Stats Grid */}
        <div className='mb-12 grid grid-cols-2 gap-4 md:grid-cols-4'>
          {techStats.map((stat) => (
            <div key={stat.label} className='glass-card p-4 text-center'>
              <stat.icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
              <div className='mb-1 font-bold text-white text-xl'>{stat.value}</div>
              <div className='mb-1 text-white/80 text-xs'>{stat.label}</div>
              <div className='text-white/60 text-xs'>{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Interactive Features Grid */}
        <div className='mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {features.map((feature, index) => (
            <button
              key={feature.title}
              type='button'
              className={`glass-card w-full cursor-pointer p-6 text-left transition-all duration-300 hover:scale-105 ${
                activeFeature === index ? 'ring-2 ring-purple-400/50' : ''
              }`}
              onClick={() => setActiveFeature(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveFeature(index);
                }
              }}
              aria-label={`View details for ${feature.title}`}
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-r ${feature.color} mb-4 p-3`}>
                <feature.icon className='h-6 w-6 text-white' />
              </div>

              <h3 className='mb-2 font-semibold text-lg text-white'>{feature.title}</h3>

              <p className='mb-3 text-sm text-white/80'>{feature.description}</p>

              <div className='mb-3 font-mono text-purple-300 text-xs'>{feature.tech}</div>

              {activeFeature === index && (
                <div className='mt-4 rounded-lg border-purple-400 border-l-2 bg-white/5 p-3'>
                  <p className='text-white/90 text-xs'>{feature.details}</p>
                </div>
              )}

              <div className='mt-3 flex items-center text-purple-400 text-xs'>
                <span>Learn more</span>
                <ChevronRight className='ml-1 h-3 w-3' />
              </div>
            </button>
          ))}
        </div>

        {/* Call to Action */}
        <div className='glass-card p-8 text-center'>
          <h3 className='mb-4 font-semibold text-white text-xl'>Want to see the code?</h3>
          <p className='mb-6 text-white/80'>
            This calculator is built with modern web technologies and best practices. Check out our
            technical implementation and architecture.
          </p>
          <div className='flex flex-col justify-center gap-4 sm:flex-row'>
            <a
              href='/about'
              className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3 font-medium text-white transition-colors hover:from-purple-700 hover:to-cyan-700'
            >
              <Brain className='h-4 w-4' />
              Technical Details
            </a>
            <a
              href='/blog'
              className='inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-medium text-white transition-colors hover:bg-white/20'
            >
              <Brain className='h-4 w-4' />
              Read Blog
            </a>
          </div>
        </div>

        {/* Technology Stack */}
        <div className='mt-12 text-center'>
          <h4 className='mb-6 font-semibold text-lg text-white'>Powered by</h4>
          <div className='flex flex-wrap justify-center gap-4 text-sm'>
            {[
              'Next.js 15',
              'React 19',
              'TypeScript',
              'Tailwind CSS',
              'Zustand',
              'ExcelJS',
              'Lucide Icons',
              'Vercel',
            ].map((tech) => (
              <div
                key={tech}
                className='rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white/80'
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechShowcase;
