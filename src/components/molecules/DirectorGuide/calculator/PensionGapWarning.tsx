// src/components/molecules/DirectorGuide/calculator/PensionGapWarning.tsx
/**
 * Pension Gap Warning - NI credits / State Pension warning
 *
 * Warns when salary is in the "pension gap" zone:
 * - Above £5,000 (paying Employer NI)
 * - Below £6,500 (not qualifying for State Pension credits)
 */
'use client';

import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TAX_RATES } from '@/constants/taxRates';
import { cn } from '@/lib/utils';
import {
  useSelectedStrategy,
  useSliderSalary,
  useStrategyComparison,
} from '@/store/directorGuideStore';

const TAX_YEAR = '2025-2026';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export function PensionGapWarning() {
  const comparison = useStrategyComparison();
  const selectedStrategy = useSelectedStrategy();
  const sliderSalary = useSliderSalary();

  // Get current salary (from slider or selected strategy)
  const currentSalary = useMemo(() => {
    if (sliderSalary !== null) return sliderSalary;
    if (!comparison) return 0;
    return comparison.strategies[selectedStrategy].salary;
  }, [sliderSalary, comparison, selectedStrategy]);

  // Thresholds
  const ST = TAX_RATES[TAX_YEAR].nationalInsurance.employer.A.secondary.threshold;
  const LEL = TAX_RATES[TAX_YEAR].nationalInsurance.lowerEarningsLimit;
  const niRate = TAX_RATES[TAX_YEAR].nationalInsurance.employer.A.secondary.rate / 100;

  // Calculate status
  const inPensionGap = currentSalary > ST && currentSalary < LEL;
  const hasNICredits = currentSalary >= LEL;

  // Calculate costs if in gap
  const employerNIInGap = inPensionGap ? (currentSalary - ST) * niRate : 0;
  const salaryToFix = LEL - currentSalary;
  const additionalNICost = salaryToFix > 0 ? salaryToFix * niRate : 0;
  const monthlyFixCost = additionalNICost / 12;

  if (!comparison || comparison.grossProfit <= 0) return null;

  return (
    <Card
      className={cn(
        'border',
        hasNICredits
          ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20'
          : inPensionGap
            ? 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20'
            : 'border-muted bg-muted/30'
      )}
    >
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          {hasNICredits ? (
            <CheckCircle2 className='size-5 text-green-600' />
          ) : inPensionGap ? (
            <AlertTriangle className='size-5 text-amber-600' />
          ) : (
            <Info className='size-5 text-muted-foreground' />
          )}
          NI Credits &amp; State Pension
        </CardTitle>
      </CardHeader>
      <CardContent className='text-sm'>
        <div className='space-y-2'>
          <p>
            <strong>Lower Earnings Limit (LEL):</strong> {formatCurrency(LEL)}/year (
            {formatCurrency(Math.round(LEL / 12))}/month)
          </p>
          <p className='text-muted-foreground'>
            Salary above LEL earns NI credits toward your State Pension, even if below the Primary
            Threshold where you start paying NI.
          </p>

          <div className='mt-3 rounded-lg bg-background p-3'>
            {hasNICredits ? (
              <p className='text-green-700 dark:text-green-400'>
                ✓ <strong>{formatCurrency(currentSalary)} salary</strong> qualifies for NI credits —
                you&apos;ll build State Pension entitlement.
              </p>
            ) : inPensionGap ? (
              <div className='space-y-2'>
                <p className='text-amber-700 dark:text-amber-400'>
                  ⚠ <strong>Inefficient zone:</strong> Paying{' '}
                  {formatCurrency(Math.round(employerNIInGap))}/year Employer NI but earning no
                  pension credits.
                </p>
                <p className='font-medium text-amber-700 dark:text-amber-400'>
                  Increase to {formatCurrency(LEL)} (+{formatCurrency(Math.round(monthlyFixCost))}
                  /month) to secure a qualifying year.
                </p>
              </div>
            ) : (
              <p className='text-muted-foreground'>
                {formatCurrency(currentSalary)} salary is below the Secondary Threshold — no
                Employer NI, but also no pension credits.
              </p>
            )}
          </div>

          <p className='mt-2 text-muted-foreground text-xs'>
            The £12,570 &quot;optimal&quot; salary is above the LEL, so you automatically qualify
            for NI credits without paying any Employee NI.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
