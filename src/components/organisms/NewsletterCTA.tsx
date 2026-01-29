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
import { useCallback, useState } from 'react';

import { cn } from '@/lib/utils';

interface NewsletterCTAProps {
  className?: string;
}

export function NewsletterCTA({ className }: NewsletterCTAProps) {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Bot check - honeypot should be empty
      if (honeypot) {
        // Silently ignore bot submissions
        setStatus('success');
        return;
      }

      if (!email) return;

      setStatus('loading');
      setErrorMessage('');

      try {
        const response = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to subscribe');
        }

        setStatus('success');
        setEmail('');
      } catch (error) {
        setStatus('error');
        setErrorMessage(
          error instanceof Error ? error.message : 'Something went wrong. Please try again.'
        );
      }
    },
    [email, honeypot]
  );

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl p-8 md:p-12',
        'bg-gradient-to-br from-cyan-500 to-emerald-500',
        className
      )}
      aria-labelledby='newsletter-heading'
    >
      {/* Background decoration */}
      <div className='absolute inset-0 opacity-10'>
        <div className='absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white blur-3xl' />
        <div className='absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white blur-3xl' />
      </div>

      <div className='relative text-center'>
        <h2
          id='newsletter-heading'
          className='mb-3 font-bold font-display text-2xl text-white md:text-3xl'
        >
          Stay Updated on UK Tax Changes
        </h2>

        <p className='mb-6 text-white/90'>
          HMRC rate updates, tax-saving strategies, and deadline reminders. No spam, ever.
        </p>

        {status === 'success' ? (
          <div className='rounded-lg bg-white/20 p-4 backdrop-blur-sm'>
            <p className='font-medium text-white'>
              Thanks! Check your inbox to confirm your subscription.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='mx-auto max-w-md'>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <label htmlFor='newsletter-email' className='sr-only'>
                Email address
              </label>
              <input
                id='newsletter-email'
                type='email'
                name='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email'
                required
                disabled={status === 'loading'}
                className={cn(
                  'flex-1 rounded-lg border-0 bg-white/20 px-4 py-3',
                  'text-white placeholder:text-white/60',
                  'focus:outline-none focus:ring-2 focus:ring-white/50',
                  'disabled:opacity-50'
                )}
                aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
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
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                {status === 'loading' ? (
                  <span className='flex items-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Subscribing...
                  </span>
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>

            {status === 'error' && (
              <p id='newsletter-error' className='mt-3 text-sm text-white/90' role='alert'>
                {errorMessage}
              </p>
            )}

            <p className='mt-4 text-white/70 text-xs'>
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
