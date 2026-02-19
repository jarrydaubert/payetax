// src/components/molecules/CallToAction.tsx
'use client';

import { Calculator, CheckCircle, Coffee, Loader2, Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface CallToActionProps {
  variant?: 'contact' | 'newsletter' | 'calculator';
  className?: string;
}

export default function CallToAction({
  variant = 'contact',
  className = '',
}: CallToActionProps): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle "already subscribed" as a friendly message, not an error
        if (res.status === 409) {
          setStatus('success');
          setErrorMessage('already');
          setEmail('');
          return;
        }
        setStatus('error');
        setErrorMessage(data.error || 'Failed to subscribe');
        return;
      }

      setStatus('success');
      setErrorMessage('');
      setEmail('');
      trackEvent({
        action: 'newsletter_subscribed',
        category: 'engagement',
        label: 'cta_newsletter_form',
      });
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

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
        href: '/' as const,
        text: 'Subscribe',
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
        'Use our free UK tax calculator to estimate your take-home pay after tax, National Insurance, and deductions.',
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
          TYPOGRAPHY.TEXT_XL,
        )}
      >
        {config.description}
      </p>

      {variant === 'newsletter' ? (
        <div className='mx-auto max-w-md'>
          {status === 'success' ? (
            <div className='flex items-center justify-center gap-2 text-emerald-500'>
              <CheckCircle className={ICON_SIZES.SIZE_5} />
              <span>
                {errorMessage === 'already'
                  ? "You're already subscribed - thanks for your support!"
                  : 'Thanks for subscribing!'}
              </span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className='flex flex-col gap-3 sm:flex-row'>
              <Input
                type='email'
                placeholder='Enter your email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='flex-1'
                disabled={status === 'loading'}
              />
              <Button
                type='submit'
                size='lg'
                variant='brandOutline'
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <Loader2 className={cn('animate-spin', ICON_SIZES.SIZE_4)} />
                ) : (
                  <>
                    <Mail className={cn('mr-2', ICON_SIZES.SIZE_4)} aria-hidden='true' />
                    Subscribe
                  </>
                )}
              </Button>
            </form>
          )}
          {status === 'error' && <p className='mt-2 text-red-500 text-sm'>{errorMessage}</p>}
          <div className='mt-6'>
            <Button
              asChild
              variant='outline'
              size='lg'
              className='border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white'
            >
              <Link href='/'>
                <Calculator className={cn('mr-2', ICON_SIZES.SIZE_4)} aria-hidden='true' />
                Try Tax Calculator
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className={cn('flex flex-col justify-center sm:flex-row', SPACING.GAP_4)}>
          <Button asChild size='lg' variant='brandOutline'>
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
      )}
    </div>
  );
}
