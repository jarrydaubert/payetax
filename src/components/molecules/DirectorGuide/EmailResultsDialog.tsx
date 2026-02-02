/**
 * Email Results Dialog - Send director tax strategy report to user's inbox
 *
 * Security/Privacy notes:
 * - Email sent via Resend (third-party provider subject to their privacy policy)
 * - No results stored on our servers after email is sent
 * - Rate limited server-side (5 emails/min per client)
 */
'use client';

import { Mail } from 'lucide-react';
import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ICON_SIZES } from '@/constants/designTokens';
import type { TaxYear } from '@/constants/taxRates';
import { trackEmailOpened, trackEmailSent } from '@/lib/directorGuideAnalytics';
import type { StrategyComparison } from '@/lib/tax/strategyComparison';
import { cn } from '@/lib/utils';

// TODO: Centralize tax year selection in app config
const TAX_YEAR: TaxYear = '2025-2026';

// Format tax year for display (e.g., "2025-2026" -> "2025-26")
const formatTaxYearForEmail = (year: TaxYear): string => {
  const [start, end] = year.split('-');
  return `${start}-${end?.slice(-2) ?? ''}`;
};

interface EmailResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comparison: StrategyComparison | null;
}

// Minimal payload for email - only what's needed for the template
interface EmailPayload {
  grossProfit: number;
  strategies: StrategyComparison['strategies'];
  recommended: StrategyComparison['recommended'];
  savingsVsAllSalary: number;
}

export function EmailResultsDialog({ open, onOpenChange, comparison }: EmailResultsDialogProps) {
  const emailInputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      trackEmailOpened();
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Use native validation
    if (!inputRef.current?.validity.valid) {
      inputRef.current?.reportValidity();
      return;
    }

    if (!comparison) {
      toast.error('No results to send');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    setIsLoading(true);

    try {
      // Build minimal payload - only what the email template needs
      const payload: EmailPayload = {
        grossProfit: comparison.grossProfit,
        strategies: comparison.strategies,
        recommended: comparison.recommended,
        savingsVsAllSalary: comparison.savingsVsAllSalary,
      };

      const response = await fetch('/api/send-director-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          results: payload,
          taxYear: formatTaxYearForEmail(TAX_YEAR),
        }),
      });

      if (!response.ok) {
        // Parse structured error if available
        const errorData = await response.json().catch(() => null);

        if (response.status === 429) {
          toast.error('Too many requests', {
            description: 'Please wait a minute before trying again',
          });
          return;
        }

        if (response.status === 400 && errorData?.details) {
          toast.error('Invalid request', {
            description: 'Please check your email address and try again',
          });
          return;
        }

        throw new Error(errorData?.error || 'Failed to send email');
      }

      toast.success('Results sent!', {
        description: `Check your inbox at ${normalizedEmail}`,
      });
      trackEmailSent();
      onOpenChange(false);
      setEmail('');
    } catch (error) {
      toast.error('Failed to send email', {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
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
      <DialogContent className='border-white/10 bg-slate-950 text-slate-100 sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-slate-100'>
            <Mail className={ICON_SIZES.SIZE_5} aria-hidden='true' />
            Email Your Results
          </DialogTitle>
          <DialogDescription className='text-slate-400'>
            We&apos;ll send your director pay breakdown to your inbox. Results are sent directly via
            email and not stored on our servers.{' '}
            <a href='/privacy' className='text-cyan-400 underline hover:text-cyan-300'>
              Privacy policy
            </a>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='mt-4 space-y-4'>
          <div className='space-y-2'>
            <label htmlFor={emailInputId} className='font-medium text-slate-300 text-sm'>
              Email address
            </label>
            <div className='relative'>
              <Mail
                className={cn(
                  'absolute top-1/2 left-3 -translate-y-1/2 text-slate-500',
                  ICON_SIZES.SIZE_4,
                )}
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
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => setEmail(e.target.value.trim())}
                className='border-white/10 bg-slate-900 pl-10 text-slate-100 placeholder:text-slate-500'
                disabled={isLoading}
                autoFocus
                aria-describedby={`${emailInputId}-hint`}
              />
            </div>
            <p id={`${emailInputId}-hint`} className='text-slate-500 text-xs'>
              You&apos;ll receive a detailed breakdown with tax rates and key dates
            </p>
          </div>

          <div className='flex justify-end gap-3'>
            <Button
              type='button'
              variant='ghost'
              onClick={handleClose}
              disabled={isLoading}
              className='text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isLoading || !email.trim()}
              className='bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:opacity-90'
            >
              {isLoading ? 'Sending...' : 'Send Results'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
