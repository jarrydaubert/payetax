// src/components/molecules/CallToAction.tsx
'use client';

import { Calculator, Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

interface CallToActionProps {
  variant?: 'contact' | 'calculator';
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
        href: 'mailto:support@payetax.co.uk?subject=Contact from PayeTax',
        text: 'Email Us',
        icon: Mail,
      },
      secondaryAction: {
        href: '/',
        text: 'Try Calculator',
        icon: Calculator,
      },
    },
    calculator: {
      icon: Calculator,
      title: 'Ready to Calculate?',
      description:
        'Use the UK tax calculator to estimate your take-home pay after tax, National Insurance, and deductions.',
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
  } as const;

  const config = variants[variant];
  const IconComponent = config.icon;
  const PrimaryIcon = config.primaryAction.icon;
  const SecondaryIcon = config.secondaryAction.icon;

  return (
    <div
      className={cn(
        'my-16 rounded-sm border border-border bg-card text-center',
        SPACING.P_8,
        'md:p-12',
        className,
      )}
    >
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
          TYPOGRAPHY.TEXT_XL,
        )}
      >
        {config.description}
      </p>

      <div className='flex flex-col justify-center gap-4 sm:flex-row'>
        <Button asChild variant='outline' size='lg'>
          {config.primaryAction.href.startsWith('mailto:') ? (
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
          <Link href={config.secondaryAction.href}>
            <SecondaryIcon className={`mr-2 ${ICON_SIZES.SIZE_4}`} aria-hidden='true' />
            {config.secondaryAction.text}
          </Link>
        </Button>
      </div>
    </div>
  );
}
