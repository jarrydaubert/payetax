// src/components/ui/CallToAction.tsx
'use client';

import { Calculator, Coffee, Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
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
    <div className={cn('glass-card my-16 text-center', SPACING.P_8, 'md:p-12', className)}>
      <IconComponent
        className={cn('mx-auto text-primary', SPACING.MB_6, ICON_SIZES.SIZE_12)}
        aria-hidden='true'
      />
      <h2 className={cn('font-bold text-foreground', SPACING.MB_6, TYPOGRAPHY.TEXT_3XL)}>
        {config.title}
      </h2>
      <p
        className={cn(
          'mx-auto mb-8 max-w-2xl text-muted-foreground leading-relaxed',
          TYPOGRAPHY.TEXT_XL
        )}
      >
        {config.description}
      </p>

      <div className={cn('flex flex-col justify-center sm:flex-row', SPACING.GAP_4)}>
        <Button
          asChild
          size='lg'
          className='bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700'
        >
          {config.primaryAction.href.startsWith('http') ||
          config.primaryAction.href.startsWith('mailto:') ? (
            <a href={config.primaryAction.href}>
              <PrimaryIcon className={`mr-2 ${ICON_SIZES.SIZE_4}`} aria-hidden='true' />
              {config.primaryAction.text}
            </a>
          ) : (
            <Link href={config.primaryAction.href}>
              <PrimaryIcon className={`mr-2 ${ICON_SIZES.SIZE_4}`} aria-hidden='true' />
              {config.primaryAction.text}
            </Link>
          )}
        </Button>

        <Button asChild variant='outline' size='lg'>
          {config.secondaryAction.href.startsWith('http') ||
          config.secondaryAction.href.startsWith('mailto:') ? (
            <a href={config.secondaryAction.href}>
              <SecondaryIcon className={`mr-2 ${ICON_SIZES.SIZE_4}`} aria-hidden='true' />
              {config.secondaryAction.text}
            </a>
          ) : (
            <Link href={config.secondaryAction.href}>
              <SecondaryIcon className={`mr-2 ${ICON_SIZES.SIZE_4}`} aria-hidden='true' />
              {config.secondaryAction.text}
            </Link>
          )}
        </Button>
      </div>
    </div>
  );
}
