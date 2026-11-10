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
import { type FormEvent, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
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
import { useDirectorGuideStore } from '@/store/directorGuideStore';

const TAX_YEAR = CURRENT_TAX_YEAR;

interface EmailResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comparison: StrategyComparison | null;
  emailInput: DirectorEmailInput | null;
  unavailableReason?: string | null;
}

export function EmailResultsDialog({
  open,
  onOpenChange,
  comparison,
  emailInput,
  unavailableReason = null,
}: EmailResultsDialogProps) {
  const renderedState = useDirectorGuideStore();
  const emailInputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [guardError, setGuardError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const submitError = guardError || requestError;
  const canSend = !unavailableReason && !!(comparison && emailInput);
  const sendableScenario = open && canSend ? comparison : null;

  useEffect(() => {
    if (open) trackEmailOpened();
  }, [open]);

  // The comparison identifies the calculated scenario; emailInput is rebuilt on each render.
  // Retire the request before the next dialog state is shown, even if fetch ignores abort.
  useLayoutEffect(() => {
    if (!open) {
      setEmail('');
      setGuardError('');
    }
    setIsLoading(false);
    setRequestError('');
    setSentEmail('');

    if (!sendableScenario) return;
    return () => {
      const request = requestRef.current;
      requestRef.current = null;
      request?.abort();
    };
  }, [open, sendableScenario]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!open || requestRef.current) return;

    // A store edit and submit can arrive in one task, before React updates the guard props.
    if (useDirectorGuideStore.getState() !== renderedState) {
      setGuardError('Results changed. Check the current scenario before emailing.');
      return;
    }

    // Use native validation
    if (!inputRef.current?.validity.valid) {
      inputRef.current?.reportValidity();
      return;
    }

    if (unavailableReason || !(comparison && emailInput)) {
      setGuardError(unavailableReason || 'No results to send right now.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const request = new AbortController();
    requestRef.current = request;
    const isCurrentRequest = () => requestRef.current === request;

    setGuardError('');
    setRequestError('');
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
        signal: request.signal,
      });

      if (!isCurrentRequest()) return;
      if (!response.ok) {
        // Parse structured error if available
        const errorData = await response.json().catch(() => null);
        if (!isCurrentRequest()) return;

        if (response.status === 429) {
          setRequestError('Too many requests. Please wait a minute before trying again.');
          return;
        }

        if (response.status === 400 && errorData?.details) {
          setRequestError('Please check your email address and try again.');
          return;
        }

        throw new Error(errorData?.error || 'Failed to send email');
      }

      trackEmailSent();
      setSentEmail(normalizedEmail);
      setEmail('');
    } catch (error) {
      if (isCurrentRequest()) {
        setRequestError(error instanceof Error ? error.message : 'Please try again later');
      }
    } finally {
      if (isCurrentRequest()) {
        requestRef.current = null;
        setIsLoading(false);
      }
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
                onClick={() => setSentEmail('')}
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
              <label htmlFor={emailInputId} className='text-sm font-medium text-card-foreground'>
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
                    setGuardError('');
                    setRequestError('');
                  }}
                  onBlur={(e) => setEmail(e.target.value.trim())}
                  className='border-border/60 bg-background pl-10 text-foreground placeholder:text-muted-foreground'
                  disabled={isLoading}
                  autoFocus
                  aria-invalid={!!submitError}
                  aria-describedby={submitError ? `${emailInputId}-error` : `${emailInputId}-hint`}
                />
              </div>
              <p id={`${emailInputId}-hint`} className='text-xs text-muted-foreground'>
                You&apos;ll receive a director pay and tax breakdown. Company key dates are not
                included.
              </p>
              {submitError && (
                <p id={`${emailInputId}-error`} className='text-sm text-destructive' role='alert'>
                  {submitError}
                </p>
              )}
            </div>

            {unavailableReason && (
              <p role='status' className='text-sm text-warning'>
                {unavailableReason}
              </p>
            )}

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
              <Button type='submit' disabled={isLoading || !email.trim() || !canSend}>
                {isLoading ? 'Sending...' : 'Send Results'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
