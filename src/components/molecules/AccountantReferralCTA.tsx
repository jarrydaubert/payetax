'use client';

import { AlertTriangle, ArrowRight, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { type FormEvent, useCallback, useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface TaxSituation {
  /** Annual gross salary */
  salary: number;
  /** Whether user is in Scotland */
  isScottish: boolean;
  /** Current effective tax rate */
  effectiveTaxRate: number;
  /** Tax code if available */
  taxCode?: string;
}

interface AccountantReferralCTAProps {
  /** Tax situation to analyze */
  situation: TaxSituation;
  /** Optional className */
  className?: string;
}

type ComplexityReason = 'tax-trap' | 'high-earner' | 'scottish-high' | 'additional-rate';

interface ComplexSituation {
  reason: ComplexityReason;
  headline: string;
  description: string;
}

/** Salary range buckets for analytics and API */
type SalaryRange = '75k-100k' | '100k-125k' | '125k+';

/**
 * Get salary range bucket for analytics and API payload
 * Extracted to avoid logic duplication
 */
function getSalaryRange(salary: number): SalaryRange {
  if (salary >= 125_140) return '125k+';
  if (salary >= 100_000) return '100k-125k';
  return '75k-100k';
}

/**
 * Analyzes a tax situation and returns complexity info if applicable.
 * Returns null if the situation isn't complex enough to warrant expert help.
 *
 * Note: Scottish high earners (>125k) are grouped with additional-rate
 * since the planning strategies overlap. Scottish-specific messaging
 * only shows for the 75k-125k band.
 */
function analyzeComplexity(situation: TaxSituation): ComplexSituation | null {
  const { salary, isScottish, effectiveTaxRate } = situation;

  // £100k-£125,140 tax trap (60% marginal rate due to PA taper)
  if (salary >= 100_000 && salary <= 125_140) {
    return {
      reason: 'tax-trap',
      headline: "You're in the £100k Tax Trap",
      description:
        'Your income is in the Personal Allowance taper zone, which creates an effective 60% marginal tax rate. A tax specialist could help you optimize your position.',
    };
  }

  // Additional rate taxpayer (£125,140+) - includes Scottish additional rate
  if (salary > 125_140) {
    return {
      reason: 'additional-rate',
      headline: 'Additional Rate Tax Planning',
      description:
        'As an additional rate taxpayer, there may be legitimate strategies to optimize your tax position, such as pension contributions or salary sacrifice schemes.',
    };
  }

  // Scottish high earner with multiple bands (75k-125k only)
  if (isScottish && salary >= 75_000) {
    return {
      reason: 'scottish-high',
      headline: 'Scottish High Earner',
      description:
        "Scotland's six-band tax system creates unique planning opportunities. A tax specialist familiar with Scottish rates could help optimize your position.",
    };
  }

  // High earner but not in trap (£75k-£100k) - only if high effective rate
  if (salary >= 75_000 && effectiveTaxRate > 25) {
    return {
      reason: 'high-earner',
      headline: 'Maximize Your Take-Home Pay',
      description:
        'At your income level, there may be tax-efficient strategies worth exploring, such as pension optimization or salary sacrifice schemes.',
    };
  }

  return null;
}

/**
 * AccountantReferralCTA Component
 *
 * Shows a helpful CTA for users with complex tax situations who could
 * benefit from professional tax advice. Only appears for qualifying situations.
 */
export function AccountantReferralCTA({ situation, className }: AccountantReferralCTAProps) {
  const emailInputId = useId();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const complexity = analyzeComplexity(situation);
  const salaryRange = getSalaryRange(situation.salary);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    trackEvent({
      action: 'referral_cta_dismissed',
      category: 'monetization',
      label: complexity?.reason ?? 'unknown',
    });
  }, [complexity?.reason]);

  const handleShowForm = useCallback(() => {
    setShowForm(true);
    setSubmissionError('');
    trackEvent({
      action: 'referral_cta_clicked',
      category: 'monetization',
      label: complexity?.reason ?? 'unknown',
      custom_data: { salary_range: salaryRange },
    });
  }, [complexity?.reason, salaryRange]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!email) return;

      setSubmissionError('');
      setIsSubmitting(true);

      try {
        const response = await fetch('/api/referral/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            salaryRange,
            reason: complexity?.reason,
            isScottish: situation.isScottish,
          }),
        });

        if (response.ok) {
          setSubmitted(true);
          setShowForm(false);
          setEmail('');
          trackEvent({
            action: 'referral_lead_submitted',
            category: 'monetization',
            label: complexity?.reason ?? 'unknown',
          });
        } else if (response.status === 429) {
          setSubmissionError('Too many requests. Please try again in a few minutes.');
        } else {
          setSubmissionError('Something went wrong. Please try again.');
        }
      } catch {
        setSubmissionError('Network error. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, salaryRange, situation.isScottish, complexity?.reason],
  );

  // Don't show if no complex situation or dismissed
  if (!complexity || isDismissed) {
    return null;
  }

  return (
    <Card
      className={cn(
        'relative border-warning/30 bg-gradient-to-r from-warning/5 to-destructive/5',
        SPACING.P_6,
        className,
      )}
    >
      {/* Dismiss button - meets 44px touch target via padding */}
      <button
        type='button'
        onClick={handleDismiss}
        className={cn(
          'absolute top-2 right-2 p-2 text-muted-foreground transition-colors',
          'hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'rounded-md',
        )}
        aria-label='Dismiss recommendation'
      >
        <X className={ICON_SIZES.SIZE_4} aria-hidden='true' />
      </button>

      {submitted ? (
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Sparkles className={cn(ICON_SIZES.SIZE_5, 'text-success')} aria-hidden='true' />
            <h3 className={cn('font-semibold', TYPOGRAPHY.TEXT_LG)}>Request Received</h3>
          </div>
          <p className='text-muted-foreground text-sm'>
            Thanks. A UK tax specialist will be in touch soon with next steps.
          </p>
        </div>
      ) : showForm ? (
        // Lead capture form
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Sparkles className={cn(ICON_SIZES.SIZE_5, 'text-warning')} aria-hidden='true' />
            <h3 className={cn('font-semibold', TYPOGRAPHY.TEXT_LG)}>Get Expert Tax Advice</h3>
          </div>
          <p className='text-muted-foreground text-sm'>
            Enter your email and a UK tax specialist will contact you with personalized advice for
            your situation. No obligation, free initial consultation.
          </p>
          <div className='space-y-2'>
            <Label htmlFor={emailInputId}>Email address</Label>
            <div className='flex gap-2'>
              <Input
                id={emailInputId}
                type='email'
                placeholder='you@example.com'
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (submissionError) setSubmissionError('');
                }}
                disabled={isSubmitting}
                required
                className='flex-1'
                autoComplete='email'
                aria-invalid={!!submissionError}
                aria-describedby={submissionError ? `${emailInputId}-error` : undefined}
              />
              <Button type='submit' disabled={isSubmitting || !email}>
                {isSubmitting ? 'Sending...' : 'Get Advice'}
              </Button>
            </div>
            {submissionError && (
              <p id={`${emailInputId}-error`} className='text-destructive text-sm' role='alert'>
                {submissionError}
              </p>
            )}
          </div>
          <p className='text-muted-foreground text-xs'>
            We&apos;ll connect you with a trusted UK tax specialist. See our{' '}
            <Link href='/privacy' className='underline hover:text-foreground'>
              privacy policy
            </Link>{' '}
            for how we handle your data.
          </p>
        </form>
      ) : (
        // Initial CTA
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-start gap-3'>
            <AlertTriangle
              className={cn(ICON_SIZES.SIZE_6, 'mt-0.5 shrink-0 text-warning')}
              aria-hidden='true'
            />
            <div>
              <h3 className={cn('font-semibold', TYPOGRAPHY.TEXT_LG)}>{complexity.headline}</h3>
              <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM, SPACING.MT_1)}>
                {complexity.description}
              </p>
            </div>
          </div>
          <Button
            onClick={handleShowForm}
            variant='outline'
            className='shrink-0 border-warning/30 hover:bg-warning/10'
          >
            Talk to an Expert
            <ArrowRight className={cn(ICON_SIZES.SIZE_4, 'ml-2')} aria-hidden='true' />
          </Button>
        </div>
      )}
    </Card>
  );
}
