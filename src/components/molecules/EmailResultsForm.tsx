/**
 * Email Results Form - Inline form to send PAYE tax results to user's inbox
 *
 * Compact form variant (vs dialog) for embedding in results sections.
 * Shares validation/sending logic patterns with EmailResultsDialog.
 */
'use client';

import { Mail, RotateCcw, Send } from 'lucide-react';
import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ICON_SIZES } from '@/constants/designTokens';
import type { TaxYear } from '@/constants/taxRates';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { cn } from '@/lib/utils';

// Format tax year for display (e.g., "2025-2026" -> "2025-26")
const formatTaxYearForEmail = (year: TaxYear): string => {
  const [start, end] = year.split('-');
  return `${start}-${end?.slice(-2) ?? ''}`;
};

// Mask email for privacy (j***@domain.com)
const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!(local && domain)) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***@${domain}`;
};

interface EmailResultsFormProps {
  results: TaxCalculationResults;
  taxYear?: TaxYear;
  className?: string;
}

// Minimal payload - only what the email template actually needs
interface EmailPayload {
  grossSalary: { annually: number; monthly: number };
  netPay: { annually: number; monthly: number };
  incomeTax: { annually: number; monthly: number };
  nationalInsurance: { annually: number; monthly: number };
  pensionContribution: { annually: number; monthly: number };
  studentLoan: { annually: number; monthly: number };
  taxBands: Array<{ name: string; rate: number; amount: number }>;
}

export function EmailResultsForm({
  results,
  taxYear = '2025-2026',
  className,
}: EmailResultsFormProps) {
  const formId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Use native validation
    if (!inputRef.current?.validity.valid) {
      inputRef.current?.reportValidity();
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Abort any in-flight request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);

    try {
      // Build minimal payload - only fields the email template needs
      const payload: EmailPayload = {
        grossSalary: {
          annually: results.grossSalary.annually,
          monthly: results.grossSalary.monthly,
        },
        netPay: {
          annually: results.netPay.annually,
          monthly: results.netPay.monthly,
        },
        incomeTax: {
          annually: results.incomeTax.annually,
          monthly: results.incomeTax.monthly,
        },
        nationalInsurance: {
          annually: results.nationalInsurance.annually,
          monthly: results.nationalInsurance.monthly,
        },
        pensionContribution: {
          annually: results.pensionContribution.annually,
          monthly: results.pensionContribution.monthly,
        },
        studentLoan: {
          annually: results.studentLoan.annually,
          monthly: results.studentLoan.monthly,
        },
        taxBands: results.taxBands,
      };

      const response = await fetch('/api/send-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          results: payload,
          taxYear: formatTaxYearForEmail(taxYear),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        if (response.status === 429) {
          toast.error('Too many requests', {
            description: 'Please wait a minute before trying again',
          });
          return;
        }

        throw new Error(errorData?.error || 'Failed to send email');
      }

      setSentEmail(normalizedEmail);
      setIsSent(true);
      toast.success('Results sent!', {
        description: `Check your inbox at ${maskEmail(normalizedEmail)}`,
      });
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') return;

      toast.error('Failed to send email', {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSent(false);
    setSentEmail('');
    setEmail('');
  };

  if (isSent) {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-emerald-400 text-sm',
          className,
        )}
        role='status'
        aria-live='polite'
      >
        <div className='flex items-center gap-2'>
          <Mail className={ICON_SIZES.SIZE_4} aria-hidden='true' />
          <span>Results sent to {maskEmail(sentEmail)}</span>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={handleReset}
          className='h-auto p-1 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300'
          aria-label='Send to different email'
        >
          <RotateCcw className={ICON_SIZES.SIZE_4} aria-hidden='true' />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex gap-2', className)}>
      <div className='relative flex-1'>
        <Mail
          className={cn(
            'absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground',
            ICON_SIZES.SIZE_4,
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
          onChange={(e) => setEmail(e.target.value)}
          onBlur={(e) => setEmail(e.target.value.trim())}
          className='pl-10'
          disabled={isLoading}
          aria-label='Email address for results'
        />
      </div>
      <Button type='submit' disabled={isLoading || !email.trim()} variant='outline'>
        {isLoading ? (
          <span className='animate-pulse'>Sending...</span>
        ) : (
          <>
            <Send className={cn('mr-2', ICON_SIZES.SIZE_4)} aria-hidden='true' />
            Email Results
          </>
        )}
      </Button>
    </form>
  );
}
