'use client';

// src/components/organisms/NewsletterCTA.tsx
/**
 * Newsletter CTA Component
 *
 * Email subscription form with brand gradient background.
 * Includes honeypot for bot protection and GDPR-compliant messaging.
 *
 * @see docs/planning/BLOG_PAGE_BUILD.md
 */

import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { FormEvent } from 'react';
import { useCallback, useId, useState } from 'react';

import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

interface NewsletterCTAProps {
  className?: string;
}

export function NewsletterCTA({ className }: NewsletterCTAProps) {
  const id = useId();
  const headingId = `${id}-heading`;
  const emailId = `${id}-email`;
  const errorId = `${id}-error`;

  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Bot check - honeypot should be empty
      // Silently no-op to avoid polluting conversion metrics
      if (honeypot) return;

      const trimmedEmail = email.trim();
      if (!trimmedEmail) return;

      setStatus('loading');
      setErrorMessage('');

      try {
        const response = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail }),
        });

        if (!response.ok) {
          // Safely parse error - API may return non-JSON (edge errors, HTML, etc.)
          const text = await response.text();
          let message = 'Failed to subscribe';
          try {
            const data = JSON.parse(text) as { error?: string };
            message = data.error ?? message;
          } catch {
            // Non-JSON response; keep default message
          }
          throw new Error(message);
        }

        setStatus('success');
        setEmail('');
      } catch (error) {
        setStatus('error');
        setErrorMessage(
          error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        );
      }
    },
    [email, honeypot],
  );

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl p-8 md:p-12',
        'bg-gradient-to-br from-cyan-500 to-emerald-500',
        className,
      )}
      aria-labelledby={headingId}
    >
      {/* Background decoration */}
      <div className='absolute inset-0 opacity-10'>
        <div className='absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white blur-3xl' />
        <div className='absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white blur-3xl' />
      </div>

      <div className='relative text-center'>
        <h2 id={headingId} className='mb-3 font-bold font-display text-2xl text-white md:text-3xl'>
          Stay Updated on UK Tax Changes
        </h2>

        <p className='mb-6 text-white/90'>
          HMRC rate updates, tax-saving strategies, and deadline reminders. No spam, ever.
        </p>

        {/* Status region for SR announcements */}
        <div aria-live='polite' aria-atomic='true'>
          {status === 'success' && (
            <div className={cn('rounded-lg bg-white/20 backdrop-blur-sm', SPACING.P_4)}>
              <p className='font-medium text-white'>
                Thanks! Check your inbox to confirm your subscription.
              </p>
            </div>
          )}
        </div>

        {status !== 'success' && (
          <form onSubmit={handleSubmit} className='mx-auto max-w-md'>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <label htmlFor={emailId} className='sr-only'>
                Email address
              </label>
              <input
                id={emailId}
                type='email'
                name='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email'
                required
                disabled={status === 'loading'}
                autoComplete='email'
                inputMode='email'
                className={cn(
                  'flex-1 rounded-lg border-0 bg-white/20 px-4 py-3',
                  'text-white placeholder:text-white/60',
                  'focus:outline-none focus:ring-2 focus:ring-white/50',
                  'disabled:opacity-50',
                )}
                aria-invalid={status === 'error'}
                aria-describedby={status === 'error' ? errorId : undefined}
              />

              {/* Honeypot field - hidden from users, visible to bots */}
              <input
                type='text'
                name='website'
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className='absolute -left-[9999px] opacity-0'
                tabIndex={-1}
                autoComplete='off'
                aria-hidden='true'
              />

              <button
                type='submit'
                disabled={status === 'loading'}
                className={cn(
                  'rounded-lg bg-white px-6 py-3 font-semibold text-emerald-600',
                  'transition-all hover:bg-white/90',
                  'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-emerald-500',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                {status === 'loading' ? (
                  <span className={cn('flex items-center', SPACING.GAP_2)}>
                    <Loader2 className={cn(ICON_SIZES.SIZE_4, 'animate-spin')} />
                    Subscribing...
                  </span>
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>

            {status === 'error' && (
              <p
                id={errorId}
                className={cn(SPACING.MT_3, TYPOGRAPHY.TEXT_SM, 'text-white/90')}
                role='alert'
              >
                {errorMessage}
              </p>
            )}

            <p className={cn(SPACING.MT_4, TYPOGRAPHY.TEXT_XS, 'text-white/70')}>
              We respect your privacy.{' '}
              <Link href='/privacy' className='underline hover:text-white'>
                Privacy Policy
              </Link>
              . Unsubscribe anytime.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

export default NewsletterCTA;
