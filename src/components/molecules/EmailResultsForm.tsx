/**
 * Email Results Form - Inline form to send PAYE tax results to user's inbox
 *
 * Compact form variant (vs dialog) for embedding in results sections.
 * Shares validation/sending logic patterns with EmailResultsDialog.
 */
'use client';

import { Mail, RotateCcw, Send } from 'lucide-react';
import Link from 'next/link';
import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import type { PayeEmailInput } from '@/lib/validation/emailValidation';

// Mask email for privacy (j***@domain.com)
const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!(local && domain)) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***@${domain}`;
};

interface EmailResultsFormProps {
  prepare: () => { input: PayeEmailInput; isCurrent: () => boolean };
  className?: string;
}

export function EmailResultsForm({ prepare, className }: EmailResultsFormProps) {
  const formId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState<{ email: string; earlierCalculation: boolean } | null>(null);
  const [submitError, setSubmitError] = useState('');

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (abortControllerRef.current || sent) return;

    // Use native validation
    if (!inputRef.current?.validity.valid) {
      inputRef.current?.reportValidity();
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setSubmitError('');

    try {
      const { input, isCurrent } = prepare();
      setIsLoading(true);
      const response = await fetch('/api/send-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          input,
        }),
        signal: controller.signal,
      });

      const errorData = response.ok ? null : await response.json().catch(() => null);
      if (controller.signal.aborted) return;
      if (response.status === 429) {
        setSubmitError('Too many requests. Please wait a minute before trying again.');
        return;
      }
      if (!response.ok) throw new Error(errorData?.error || 'Failed to send email');

      setSent({ email: normalizedEmail, earlierCalculation: !isCurrent() });
      trackEvent({
        action: 'result_shared',
        category: 'engagement',
        label: 'email',
      });
    } catch (error) {
      if (controller.signal.aborted) return;

      setSubmitError(error instanceof Error ? error.message : 'Please try again later');
    } finally {
      if (!controller.signal.aborted) {
        abortControllerRef.current = null;
        setIsLoading(false);
      }
    }
  };

  const handleReset = () => {
    setSent(null);
    setEmail('');
    setSubmitError('');
  };

  if (sent) {
    return (
      <output
        className={cn(
          'flex items-center justify-between gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm',
          'text-success',
          className,
        )}
        aria-live='polite'
      >
        <div className='flex items-center gap-2'>
          <Mail className={'size-4'} aria-hidden='true' />
          <span>
            {sent.earlierCalculation ? 'Earlier results sent to' : 'Results sent to'}{' '}
            {maskEmail(sent.email)}
          </span>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={handleReset}
          className={cn('h-auto p-1 hover:bg-success/20', 'text-success')}
          aria-label='Send to different email'
        >
          <RotateCcw className={'size-4'} aria-hidden='true' />
        </Button>
      </output>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <form onSubmit={handleSubmit} className='flex flex-col gap-2 sm:flex-row'>
        <div className='relative flex-1'>
          <Mail
            className={cn(
              'absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground',
              'size-4',
            )}
            aria-hidden='true'
          />
          <Input
            ref={inputRef}
            id={`${formId}-email`}
            type='email'
            required
            autoComplete='email'
            placeholder='Enter your email'
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (submitError) setSubmitError('');
            }}
            onBlur={(e) => setEmail(e.target.value.trim())}
            className='pl-10'
            disabled={isLoading}
            aria-label='Email address for results'
            aria-describedby={submitError ? `${formId}-email-error` : undefined}
          />
        </div>
        <Button
          type='submit'
          disabled={isLoading || !email.trim()}
          variant='outline'
          className='sm:shrink-0'
        >
          {isLoading ? (
            <span className='animate-pulse'>Sending...</span>
          ) : (
            <>
              <Send className={cn('mr-2', 'size-4')} aria-hidden='true' />
              Email Results
            </>
          )}
        </Button>
      </form>
      <p className='text-xs text-muted-foreground'>
        Sending shares your email address and calculator inputs with PayeTax to prepare your
        results, which Brevo delivers by email. See our{' '}
        <Link href='/privacy' className='underline underline-offset-2'>
          Privacy Policy
        </Link>
        .
      </p>
      {submitError && (
        <p id={`${formId}-email-error`} className='text-sm text-destructive' role='alert'>
          {submitError}
        </p>
      )}
    </div>
  );
}
