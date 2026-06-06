/**
 * Email Results Dialog - Send director tax strategy report to user's inbox
 *
 * Security/Privacy notes:
 * - Email sent via Brevo API (third-party provider subject to their privacy policy)
 * - No results stored on our servers after email is sent
 * - Rate limited server-side (5 emails/min per client)
 */
'use client';

import { Mail, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CURRENT_TAX_YEAR } from '@/constants/taxRates';
import { trackEmailOpened, trackEmailSent } from '@/lib/directorGuideAnalytics';
import type { StrategyComparison } from '@/lib/tax/strategyComparison';
import type { DirectorEmailInput } from '@/lib/validation/emailValidation';

const TAX_YEAR = CURRENT_TAX_YEAR;

interface EmailResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comparison: StrategyComparison | null;
  emailInput: DirectorEmailInput | null;
}

export function EmailResultsDialog({
  open,
  onOpenChange,
  comparison,
  emailInput,
}: EmailResultsDialogProps) {
  const emailInputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [sentEmail, setSentEmail] = useState('');

  useEffect(() => {
    if (open) {
      trackEmailOpened();
    } else {
      setEmail('');
      setIsLoading(false);
      setSubmitError('');
      setSentEmail('');
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Use native validation
    if (!inputRef.current?.validity.valid) {
      inputRef.current?.reportValidity();
      return;
    }

    if (!(comparison && emailInput)) {
      setSubmitError('No results to send right now.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    setSubmitError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/send-director-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          input: emailInput,
          taxYear: TAX_YEAR,
        }),
      });

      if (!response.ok) {
        // Parse structured error if available
        const errorData = await response.json().catch(() => null);

        if (response.status === 429) {
          setSubmitError('Too many requests. Please wait a minute before trying again.');
          return;
        }

        if (response.status === 400 && errorData?.details) {
          setSubmitError('Please check your email address and try again.');
          return;
        }

        throw new Error(errorData?.error || 'Failed to send email');
      }

      trackEmailSent();
      setSentEmail(normalizedEmail);
      setEmail('');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Please try again later');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='rounded-sm border-border/60 bg-card text-card-foreground shadow-none sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-card-foreground'>
            <Mail className='size-5' aria-hidden='true' />
            Email Your Results
          </DialogTitle>
          <DialogDescription className='text-muted-foreground'>
            We&apos;ll send your director pay breakdown to your inbox. Results are sent directly via
            email and not stored on our servers.{' '}
            <Link href='/privacy' className='text-primary underline hover:text-primary/80'>
              Privacy policy
            </Link>
          </DialogDescription>
        </DialogHeader>

        {sentEmail ? (
          <div className='mt-4 space-y-4'>
            <div className='rounded-sm border border-success/30 bg-success/10 p-4 text-sm text-success'>
              Results sent to {sentEmail}. You can close this dialog or send the report to a
              different address.
            </div>
            <div className='flex justify-end gap-3'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => {
                  setSentEmail('');
                  setSubmitError('');
                }}
                className='text-muted-foreground hover:text-foreground'
              >
                <RotateCcw className='mr-2 h-4 w-4' aria-hidden='true' />
                Send Another
              </Button>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='mt-4 space-y-4'>
            <div className='space-y-2'>
              <label htmlFor={emailInputId} className='font-medium text-card-foreground text-sm'>
                Email address
              </label>
              <div className='relative'>
                <Mail
                  className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground'
                  aria-hidden='true'
                />
                <Input
                  ref={inputRef}
                  id={emailInputId}
                  type='email'
                  required
                  autoComplete='email'
                  placeholder='you@example.com'
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (submitError) setSubmitError('');
                  }}
                  onBlur={(e) => setEmail(e.target.value.trim())}
                  className='border-border/60 bg-background pl-10 text-foreground placeholder:text-muted-foreground'
                  disabled={isLoading}
                  autoFocus
                  aria-invalid={!!submitError}
                  aria-describedby={submitError ? `${emailInputId}-error` : `${emailInputId}-hint`}
                />
              </div>
              <p id={`${emailInputId}-hint`} className='text-muted-foreground text-xs'>
                You&apos;ll receive a detailed breakdown with tax rates and key dates
              </p>
              {submitError && (
                <p id={`${emailInputId}-error`} className='text-destructive text-sm' role='alert'>
                  {submitError}
                </p>
              )}
            </div>

            <div className='flex justify-end gap-3'>
              <Button
                type='button'
                variant='ghost'
                onClick={handleClose}
                disabled={isLoading}
                className='text-muted-foreground hover:text-foreground'
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading || !email.trim()}>
                {isLoading ? 'Sending...' : 'Send Results'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
