// src/components/ui/CallToAction.tsx
'use client';

import { Calculator, Coffee, Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CallToActionProps {
  variant?: 'contact' | 'newsletter' | 'calculator';
  className?: string;
}

export default function CallToAction({
  variant = 'contact',
  className = '',
}: CallToActionProps): React.JSX.Element {
  const variants = {
    contact: {
      icon: MessageSquare,
      title: 'Get in Touch',
      description: "Questions, suggestions, or just want to say hello? We'd love to hear from you.",
      primaryAction: {
        href: 'mailto:support@payetax.co.uk?subject=Contact from PayeTax' as const,
        text: 'Email Us',
        icon: Mail,
      },
      secondaryAction: {
        href: '/' as const,
        text: 'Try Calculator',
        icon: Calculator,
      },
    },
    newsletter: {
      icon: Coffee,
      title: 'Stay Updated',
      description:
        'Get the latest UK tax insights, updates, and practical tips. No spam, just valuable content.',
      primaryAction: {
        href: 'mailto:support@payetax.co.uk?subject=Newsletter Subscription' as const,
        text: 'Subscribe to Updates',
        icon: Mail,
      },
      secondaryAction: {
        href: '/' as const,
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
        href: '/' as const,
        text: 'Start Calculating',
        icon: Calculator,
      },
      secondaryAction: {
        href: '/about' as const,
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
    <div className={cn('glass-card my-16 p-8 text-center md:p-12', className)}>
      <IconComponent className='mx-auto mb-6 h-12 w-12 text-blue-400' />
      <h2 className='mb-6 font-bold text-3xl text-white'>{config.title}</h2>
      <p className='mx-auto mb-8 max-w-2xl text-gray-300 text-xl leading-relaxed'>
        {config.description}
      </p>

      <div className='flex flex-col justify-center gap-4 sm:flex-row'>
        <Button
          asChild
          size='lg'
          className='bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700'
        >
          {config.primaryAction.href.startsWith('http') ||
          config.primaryAction.href.startsWith('mailto:') ? (
            <a href={config.primaryAction.href}>
              <PrimaryIcon className='mr-2 h-4 w-4' />
              {config.primaryAction.text}
            </a>
          ) : (
            <Link href={config.primaryAction.href}>
              <PrimaryIcon className='mr-2 h-4 w-4' />
              {config.primaryAction.text}
            </Link>
          )}
        </Button>

        <Button asChild variant='outline' size='lg'>
          {config.secondaryAction.href.startsWith('http') ||
          config.secondaryAction.href.startsWith('mailto:') ? (
            <a href={config.secondaryAction.href}>
              <SecondaryIcon className='mr-2 h-4 w-4' />
              {config.secondaryAction.text}
            </a>
          ) : (
            <Link href={config.secondaryAction.href}>
              <SecondaryIcon className='mr-2 h-4 w-4' />
              {config.secondaryAction.text}
            </Link>
          )}
        </Button>
      </div>
    </div>
  );
}
