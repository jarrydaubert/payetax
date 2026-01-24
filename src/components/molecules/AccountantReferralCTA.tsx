// src/components/molecules/AccountantReferralCTA.tsx
'use client';

import { AlertTriangle, ArrowRight, Sparkles, X } from 'lucide-react';
import { useCallback, useId, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/ui/button';
import { Card } from '@/components/atoms/ui/card';
import { Input } from '@/components/atoms/ui/input';
import { Label } from '@/components/atoms/ui/label';
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

/**
 * Analyzes a tax situation and returns complexity info if applicable.
 * Returns null if the situation isn't complex enough to warrant expert help.
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

  // Additional rate taxpayer (£125,140+)
  if (salary > 125_140) {
    return {
      reason: 'additional-rate',
      headline: 'Additional Rate Tax Planning',
      description:
        'As an additional rate taxpayer, there may be legitimate strategies to optimize your tax position, such as pension contributions or salary sacrifice schemes.',
    };
  }

  // Scottish high earner with multiple bands
  if (isScottish && salary >= 75_000) {
    return {
      reason: 'scottish-high',
      headline: 'Scottish High Earner',
      description:
        "Scotland's six-band tax system creates unique planning opportunities. A tax specialist familiar with Scottish rates could help optimize your position.",
    };
  }

  // High earner but not in trap (£75k-£100k)
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

  const complexity = analyzeComplexity(situation);

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
    trackEvent({
      action: 'referral_cta_clicked',
      category: 'monetization',
      label: complexity?.reason ?? 'unknown',
      custom_data: {
        salary_range:
          situation.salary >= 125_140
            ? '125k+'
            : situation.salary >= 100_000
              ? '100k-125k'
              : '75k-100k',
      },
    });
  }, [complexity?.reason, situation.salary]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || isSubmitting) return;

      setIsSubmitting(true);
      try {
        const response = await fetch('/api/referral/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            salaryRange:
              situation.salary >= 125_140
                ? '125k+'
                : situation.salary >= 100_000
                  ? '100k-125k'
                  : '75k-100k',
            reason: complexity?.reason,
            isScottish: situation.isScottish,
          }),
        });

        if (response.ok) {
          toast.success('Thanks! A tax specialist will be in touch soon.');
          setShowForm(false);
          setIsDismissed(true);
          trackEvent({
            action: 'referral_lead_submitted',
            category: 'monetization',
            label: complexity?.reason ?? 'unknown',
          });
        } else {
          toast.error('Something went wrong. Please try again.');
        }
      } catch {
        toast.error('Network error. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, isSubmitting, situation, complexity?.reason]
  );

  // Don't show if no complex situation or dismissed
  if (!complexity || isDismissed) {
    return null;
  }

  return (
    <Card
      className={cn(
        'relative border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5',
        SPACING.P_6,
        className
      )}
    >
      {/* Dismiss button */}
      <button
        type='button'
        onClick={handleDismiss}
        className='absolute top-3 right-3 text-muted-foreground hover:text-foreground'
        aria-label='Dismiss'
      >
        <X className={ICON_SIZES.SIZE_4} />
      </button>

      {showForm ? (
        // Lead capture form
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Sparkles className={cn(ICON_SIZES.SIZE_5, 'text-amber-500')} />
            <h3 className={cn('font-semibold', TYPOGRAPHY.TEXT_LG)}>Get Expert Tax Advice</h3>
          </div>
          <p className='text-muted-foreground text-sm'>
            Enter your email and a UK tax specialist will contact you with personalized advice for
            your situation. No obligation, completely free consultation.
          </p>
          <div className='space-y-2'>
            <Label htmlFor={emailInputId}>Email address</Label>
            <div className='flex gap-2'>
              <Input
                id={emailInputId}
                type='email'
                placeholder='you@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='flex-1'
              />
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Get Advice'}
              </Button>
            </div>
          </div>
          <p className='text-muted-foreground text-xs'>
            We&apos;ll connect you with a vetted UK tax specialist. Your data is never sold.
          </p>
        </form>
      ) : (
        // Initial CTA
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-start gap-3'>
            <AlertTriangle
              className={cn(ICON_SIZES.SIZE_6, 'mt-0.5 flex-shrink-0 text-amber-500')}
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
            className='shrink-0 border-amber-500/30 hover:bg-amber-500/10'
          >
            Talk to an Expert
            <ArrowRight className={cn(ICON_SIZES.SIZE_4, 'ml-2')} />
          </Button>
        </div>
      )}
    </Card>
  );
}
