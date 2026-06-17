// src/components/molecules/CallToAction.tsx
'use client';

import { Calculator, type LucideIcon, Mail, MessageSquare } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { contactMailto } from '@/constants/contact';
import { cn } from '@/lib/utils';

interface CallToActionProps {
  variant?: 'contact' | 'calculator';
  className?: string;
}

type MailAction = {
  href: `mailto:${string}`;
  text: string;
  icon: LucideIcon;
};

type RouteAction = {
  href: Route;
  text: string;
  icon: LucideIcon;
};

type CtaConfig = {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction: MailAction | RouteAction;
  secondaryAction: RouteAction;
};

function isMailAction(action: MailAction | RouteAction): action is MailAction {
  return action.href.startsWith('mailto:');
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
        href: contactMailto('Contact from PayeTax'),
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
  } satisfies Record<NonNullable<CallToActionProps['variant']>, CtaConfig>;

  const config = variants[variant];
  const IconComponent = config.icon;
  const PrimaryIcon = config.primaryAction.icon;
  const SecondaryIcon = config.secondaryAction.icon;

  return (
    <div
      className={cn(
        'my-16 rounded-sm border border-border bg-card text-center',
        'p-8',
        'md:p-12',
        className,
      )}
    >
      <IconComponent className={cn('mx-auto text-primary', 'mb-6', 'size-12')} aria-hidden='true' />
      <h2 className={cn('font-bold text-foreground', 'mb-6', 'text-3xl')}>{config.title}</h2>
      <p className={cn('mx-auto mb-8 max-w-2xl text-muted-foreground leading-relaxed', 'text-xl')}>
        {config.description}
      </p>

      <div className='flex flex-col justify-center gap-4 sm:flex-row'>
        <Button asChild variant='outline' size='lg'>
          {isMailAction(config.primaryAction) ? (
            <a href={config.primaryAction.href}>
              <PrimaryIcon className={`mr-2 size-4`} aria-hidden='true' />
              {config.primaryAction.text}
            </a>
          ) : (
            <Link href={config.primaryAction.href}>
              <PrimaryIcon className={`mr-2 size-4`} aria-hidden='true' />
              {config.primaryAction.text}
            </Link>
          )}
        </Button>

        <Button asChild variant='outline' size='lg'>
          <Link href={config.secondaryAction.href}>
            <SecondaryIcon className={`mr-2 size-4`} aria-hidden='true' />
            {config.secondaryAction.text}
          </Link>
        </Button>
      </div>
    </div>
  );
}
