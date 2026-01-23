// src/components/molecules/NewsletterSignup.tsx
'use client';

import { CheckCircle, Loader2, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/ui/button';
import { Input } from '@/components/atoms/ui/input';
import { ICON_SIZES } from '@/constants/designTokens';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface NewsletterSignupProps {
  /** Optional className for styling */
  className?: string;
  /** Variant for different contexts */
  variant?: 'inline' | 'card' | 'minimal';
  /** Source for analytics tracking */
  source?: 'footer' | 'blog' | 'results';
}

/**
 * Newsletter signup form for tax updates and blog notifications.
 * Uses Resend Audiences for subscriber management.
 */
export function NewsletterSignup({
  className,
  variant = 'inline',
  source = 'footer',
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!email?.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    trackEvent({ action: 'newsletter_signup', category: 'engagement', label: source });

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'Already subscribed') {
          setError('This email is already subscribed');
          trackEvent({
            action: 'newsletter_signup_duplicate',
            category: 'engagement',
            label: source,
          });
        } else {
          throw new Error(data.error || 'Failed to subscribe');
        }
        return;
      }

      setIsSubscribed(true);
      trackEvent({ action: 'newsletter_signup_success', category: 'engagement', label: source });
      toast.success('Subscribed!', {
        description: "You'll receive tax updates and new blog posts.",
      });
    } catch {
      setError('Something went wrong. Please try again.');
      toast.error('Failed to subscribe', {
        description: 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSubscribed) {
    return (
      <output
        className={cn(
          'flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-emerald-600 text-sm dark:text-emerald-400',
          className
        )}
        aria-live='polite'
      >
        <CheckCircle className={ICON_SIZES.SIZE_4} aria-hidden='true' />
        <span>You're subscribed! Check your inbox.</span>
      </output>
    );
  }

  // Minimal variant (just input + button)
  if (variant === 'minimal') {
    return (
      <form onSubmit={handleSubmit} className={cn('flex gap-2', className)}>
        <Input
          type='email'
          placeholder='your@email.com'
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          disabled={isLoading}
          aria-label='Email address for newsletter'
          aria-invalid={!!error}
          className={cn(error && 'border-destructive')}
        />
        <Button type='submit' disabled={isLoading || !email} size='sm'>
          {isLoading ? (
            <Loader2
              className={cn('animate-spin', ICON_SIZES.SIZE_4)}
              aria-label='Subscribing...'
            />
          ) : (
            'Subscribe'
          )}
        </Button>
      </form>
    );
  }

  // Inline variant (footer style)
  if (variant === 'inline') {
    return (
      <div className={cn('space-y-2', className)}>
        <form onSubmit={handleSubmit} className='flex gap-2'>
          <div className='relative flex-1'>
            <Mail
              className={cn(
                'absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground',
                ICON_SIZES.SIZE_4
              )}
              aria-hidden='true'
            />
            <Input
              type='email'
              placeholder='Get tax updates'
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              className={cn('pl-10', error && 'border-destructive')}
              disabled={isLoading}
              aria-label='Email address for newsletter'
              aria-invalid={!!error}
            />
          </div>
          <Button type='submit' disabled={isLoading || !email} variant='secondary' size='sm'>
            {isLoading ? (
              <Loader2
                className={cn('animate-spin', ICON_SIZES.SIZE_4)}
                aria-label='Subscribing...'
              />
            ) : (
              'Subscribe'
            )}
          </Button>
        </form>
        {error && (
          <p className='text-destructive text-xs' role='alert'>
            {error}
          </p>
        )}
      </div>
    );
  }

  // Card variant (blog sidebar style)
  return (
    <div className={cn('rounded-lg border border-border bg-card p-4 shadow-sm', className)}>
      <div className='mb-3 flex items-center gap-2'>
        <Mail className={cn('text-primary', ICON_SIZES.SIZE_5)} aria-hidden='true' />
        <h3 className='font-semibold text-foreground'>Get Tax Updates</h3>
      </div>
      <p className='mb-4 text-muted-foreground text-sm'>
        New tax rates, deadlines, and tips delivered to your inbox.
      </p>
      <form onSubmit={handleSubmit} className='space-y-3'>
        <Input
          type='email'
          placeholder='your@email.com'
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          disabled={isLoading}
          aria-label='Email address for newsletter'
          aria-invalid={!!error}
          className={cn(error && 'border-destructive')}
        />
        {error && (
          <p className='text-destructive text-xs' role='alert'>
            {error}
          </p>
        )}
        <Button type='submit' disabled={isLoading || !email} className='w-full'>
          {isLoading ? (
            <>
              <Loader2 className={cn('mr-2 animate-spin', ICON_SIZES.SIZE_4)} aria-hidden='true' />
              Subscribing...
            </>
          ) : (
            'Subscribe'
          )}
        </Button>
      </form>
      <p className='mt-3 text-muted-foreground text-xs'>No spam. Unsubscribe anytime.</p>
    </div>
  );
}

export default NewsletterSignup;
