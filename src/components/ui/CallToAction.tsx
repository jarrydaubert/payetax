// src/components/ui/CallToAction.tsx
'use client';

import { Calculator, Coffee, Mail, MessageSquare } from 'lucide-react';

interface CallToActionProps {
  variant?: 'contact' | 'newsletter' | 'calculator';
  className?: string;
}

export default function CallToAction({ variant = 'contact', className = '' }: CallToActionProps) {
  const variants = {
    contact: {
      icon: MessageSquare,
      title: 'Get in Touch',
      description: "Questions, suggestions, or just want to say hello? We'd love to hear from you.",
      primaryAction: {
        href: '/feedback',
        text: 'Send Feedback',
        icon: MessageSquare,
      },
      secondaryAction: {
        href: 'mailto:hello@toolhubx.uk',
        text: 'Email Us',
        icon: Mail,
      },
    },
    newsletter: {
      icon: Coffee,
      title: 'Stay Updated',
      description:
        'Get the latest UK tax insights, updates, and practical tips. No spam, just valuable content.',
      primaryAction: {
        href: '/feedback',
        text: 'Subscribe to Updates',
        icon: Mail,
      },
      secondaryAction: {
        href: '/',
        text: 'Try Tax Calculator',
        icon: Calculator,
      },
    },
    calculator: {
      icon: Calculator,
      title: 'Ready to Calculate?',
      description:
        'Use our free UK tax calculator to see your exact take-home pay after tax, National Insurance, and deductions.',
      primaryAction: {
        href: '/',
        text: 'Start Calculating',
        icon: Calculator,
      },
      secondaryAction: {
        href: '/about',
        text: 'Learn More',
        icon: MessageSquare,
      },
    },
  };

  const config = variants[variant];
  const IconComponent = config.icon;
  const PrimaryIcon = config.primaryAction.icon;
  const SecondaryIcon = config.secondaryAction.icon;

  return (
    <div className={`glass-card my-16 p-8 text-center md:p-12 ${className}`}>
      <IconComponent className='mx-auto mb-6 h-12 w-12 text-blue-400' />
      <h2 className='mb-6 font-bold text-3xl text-white'>{config.title}</h2>
      <p className='mx-auto mb-8 max-w-2xl text-gray-300 text-xl leading-relaxed'>
        {config.description}
      </p>

      <div className='flex flex-col justify-center gap-4 sm:flex-row'>
        <a
          href={config.primaryAction.href}
          className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3 font-medium text-white transition-colors hover:from-purple-700 hover:to-cyan-700'
        >
          <PrimaryIcon className='h-4 w-4' />
          {config.primaryAction.text}
        </a>

        <a
          href={config.secondaryAction.href}
          className='inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-medium text-white transition-colors hover:bg-white/20'
        >
          <SecondaryIcon className='h-4 w-4' />
          {config.secondaryAction.text}
        </a>
      </div>
    </div>
  );
}
