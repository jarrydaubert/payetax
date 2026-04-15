// src/components/molecules/ScenarioSummaryCard.tsx
/**
 * Quick summary card for scenario pages
 * Displays key financial metrics for the scenario with before/after comparison
 */

'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SPACING, SURFACES, TYPOGRAPHY } from '@/constants/designTokens';
import type { PensionOptimization } from '@/lib/pensionOptimizer';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { cn, formatCurrency } from '@/lib/utils';

interface ScenarioSummaryCardProps {
  /** Gross salary for the scenario */
  salary: number;
  /** Tax calculation results (current state) */
  results: TaxCalculationResults;
  /** Pension optimization data (if applicable) */
  optimization?: PensionOptimization | null;
  /** Optimized results (after pension contribution) */
  optimizedResults?: TaxCalculationResults | null;
  /** Label for the hero stat */
  heroStatLabel?: string;
  /** Category-specific styling */
  category?: 'tax-trap' | 'student-loan' | 'life-stage' | 'scottish';
}

/**
 * Default category colors
 */
const defaultColors = {
  border: 'border-success/30',
  accent: 'text-success',
};

/**
 * Category-specific accent colors
 */
const categoryColors: Record<string, { border: string; accent: string }> = {
  'tax-trap': {
    border: 'border-warning/30',
    accent: 'text-warning',
  },
  'student-loan': {
    border: 'border-primary/30',
    accent: 'text-primary',
  },
  scottish: {
    border: 'border-primary/30',
    accent: 'text-primary',
  },
  'life-stage': defaultColors,
};

export function ScenarioSummaryCard({
  salary,
  results,
  optimization,
  optimizedResults,
  heroStatLabel = 'Take-Home Pay',
  category = 'life-stage',
}: ScenarioSummaryCardProps) {
  const colors = categoryColors[category] ?? defaultColors;
  const hasOptimization = optimization && optimizedResults;

  // Calculate the hero stat based on scenario type
  const heroStat = hasOptimization ? optimization.savingsFromOptimizing : results.netPay.annually;

  const heroLabel = hasOptimization ? heroStatLabel : 'Annual Take-Home';

  return (
    <div className={cn('rounded-xl border bg-card', SPACING.P_6, colors.border)}>
      {/* Hero Stat */}
      <div className={cn('text-center', SPACING.MB_6)}>
        <p className={cn(TYPOGRAPHY.TEXT_SM, 'text-muted-foreground', SPACING.MB_2)}>{heroLabel}</p>
        <p className={cn(TYPOGRAPHY.TEXT_4XL, 'font-bold', colors.accent)}>
          {formatCurrency(heroStat, 0)}
        </p>
        {hasOptimization && (
          <p className={cn(TYPOGRAPHY.TEXT_SM, 'text-muted-foreground', SPACING.MT_1)}>
            by contributing {formatCurrency(optimization.suggested, 0)} to pension
          </p>
        )}
      </div>

      {/* Breakdown Grid */}
      <div className={cn('grid grid-cols-2', SPACING.GAP_4, SPACING.MB_6)}>
        <SummaryItem label='Gross Salary' value={formatCurrency(salary, 0)} variant='neutral' />
        <SummaryItem
          label='Income Tax'
          value={formatCurrency(results.incomeTax.annually, 0)}
          variant='deduction'
          align='right'
        />
        <SummaryItem
          label='National Insurance'
          value={formatCurrency(results.nationalInsurance.annually, 0)}
          variant='deduction'
        />
        <SummaryItem
          label='Student Loan'
          value={formatCurrency(results.studentLoan.annually, 0)}
          variant={results.studentLoan.annually > 0 ? 'deduction' : 'neutral'}
          align='right'
        />
      </div>

      {/* Before/After Comparison (if optimization available) */}
      {hasOptimization && (
        <div className={cn(SURFACES.BORDER_TOP_DIVIDER, SPACING.PT_4, SPACING.MB_6)}>
          <p className={cn(TYPOGRAPHY.TEXT_SM, TYPOGRAPHY.FONT_MEDIUM, SPACING.MB_3)}>
            With Pension Optimization
          </p>
          <div className={cn('grid grid-cols-2', SPACING.GAP_4)}>
            <div>
              <p className={cn(TYPOGRAPHY.TEXT_XS, 'text-muted-foreground')}>Before</p>
              <p className={cn(TYPOGRAPHY.TEXT_LG, 'font-semibold')}>
                {formatCurrency(results.netPay.annually, 0)}
              </p>
            </div>
            <div>
              <p className={cn(TYPOGRAPHY.TEXT_XS, 'text-muted-foreground')}>After (+ Pension)</p>
              <p className={cn(TYPOGRAPHY.TEXT_LG, 'font-semibold', 'text-success')}>
                {formatCurrency(optimizedResults.netPay.annually + optimization.suggested, 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Breakdown */}
      <div className={cn(SURFACES.BORDER_TOP_DIVIDER, SPACING.PT_4, SPACING.MB_6)}>
        <p className={cn(TYPOGRAPHY.TEXT_SM, TYPOGRAPHY.FONT_MEDIUM, SPACING.MB_3)}>
          Monthly Breakdown
        </p>
        <div className={cn('grid grid-cols-3', SPACING.GAP_2)}>
          <MiniStat label='Gross' value={formatCurrency(results.grossSalary.monthly, 0)} />
          <MiniStat
            label='Deductions'
            value={formatCurrency(
              results.incomeTax.monthly +
                results.nationalInsurance.monthly +
                results.studentLoan.monthly,
              0,
            )}
            negative
          />
          <MiniStat label='Take-Home' value={formatCurrency(results.netPay.monthly, 0)} highlight />
        </div>
      </div>

      {/* CTA */}
      <Link
        href='/#tax-calculator'
        className={cn(
          'flex items-center justify-center',
          SPACING.GAP_2,
          SPACING.PY_2,
          'rounded-lg bg-primary/10 text-primary',
          'transition-colors hover:bg-primary/20',
          TYPOGRAPHY.TEXT_SM,
          TYPOGRAPHY.FONT_MEDIUM,
        )}
      >
        Calculate with your numbers
        <ArrowRight className='size-4' />
      </Link>
    </div>
  );
}

/**
 * Individual summary item
 */
function SummaryItem({
  label,
  value,
  variant = 'neutral',
  align = 'left',
}: {
  label: string;
  value: string;
  variant?: 'neutral' | 'deduction' | 'highlight';
  align?: 'left' | 'right';
}) {
  return (
    <div className={align === 'right' ? 'text-right' : ''}>
      <p className={cn(TYPOGRAPHY.TEXT_XS, 'text-muted-foreground')}>{label}</p>
      <p
        className={cn(
          TYPOGRAPHY.TEXT_BASE,
          'font-semibold',
          variant === 'deduction' && 'text-destructive/80',
          variant === 'highlight' && 'text-success',
        )}
      >
        {variant === 'deduction' && value !== formatCurrency(0, 0) ? `-${value.slice(1)}` : value}
      </p>
    </div>
  );
}

/**
 * Mini stat for monthly breakdown
 */
function MiniStat({
  label,
  value,
  negative = false,
  highlight = false,
}: {
  label: string;
  value: string;
  negative?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className='text-center'>
      <p className={cn(TYPOGRAPHY.TEXT_XS, 'text-muted-foreground')}>{label}</p>
      <p
        className={cn(
          TYPOGRAPHY.TEXT_SM,
          'font-semibold',
          negative && 'text-destructive/80',
          highlight && 'text-success',
        )}
      >
        {negative && value !== '£0' ? `-${value.slice(1)}` : value}
      </p>
    </div>
  );
}

export default ScenarioSummaryCard;
