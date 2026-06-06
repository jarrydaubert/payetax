/**
 * Recommendation Hero - answer-first summary of the director pay result.
 *
 * Leads the results with the single recommended strategy (most take-home):
 * the salary/dividend split, annual + monthly take-home, total tax to set
 * aside, and the gain versus taking everything as salary. Everything below
 * it (slider, comparison table, breakdowns) is for exploring around this.
 */
'use client';

import { useActiveDirectorScenario } from '@/components/molecules/DirectorGuide/calculator/useActiveDirectorScenario';
import { cn, formatCurrency } from '@/lib/utils';

const STRATEGY_LABEL: Record<'allSalary' | 'optimalMix' | 'allDividends', string> = {
  allSalary: 'Take it all as salary',
  optimalMix: 'Optimal salary & dividend mix',
  allDividends: 'Take it all as dividends',
};

interface RecommendationHeroProps {
  className?: string;
}

export function RecommendationHero({ className }: RecommendationHeroProps) {
  const { comparison } = useActiveDirectorScenario();

  if (!comparison || comparison.grossProfit <= 0) return null;

  const recommended = comparison.strategies[comparison.recommended];
  const totalTax =
    recommended.corporationTax + recommended.employerNI + recommended.totalPersonalTax;
  const showSavings = comparison.recommended !== 'allSalary' && comparison.savingsVsAllSalary > 0;

  return (
    <section
      aria-label='Recommended pay strategy'
      className={cn('rounded-sm border border-primary/35 bg-card p-6', className)}
    >
      <div className='mb-3 font-semibold text-primary text-xs uppercase tracking-[0.22em]'>
        Recommended strategy
      </div>

      <div className='grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end'>
        <div>
          <h2 className='font-display font-semibold text-2xl text-foreground leading-tight'>
            {STRATEGY_LABEL[comparison.recommended]}
          </h2>
          <p className='mt-1 text-muted-foreground text-sm'>
            {formatCurrency(recommended.salary, 0)} salary +{' '}
            {formatCurrency(recommended.dividends, 0)} dividends
          </p>

          <div className='mt-4'>
            <div className='text-muted-foreground text-xs uppercase tracking-wider'>
              Annual take-home
            </div>
            <div className='font-mono font-semibold text-4xl text-primary tracking-tight'>
              {formatCurrency(recommended.takeHome, 0)}
            </div>
            <div className='mt-1 text-muted-foreground text-sm'>
              ≈ {formatCurrency(recommended.takeHome / 12, 0)}/mo ·{' '}
              {recommended.effectiveRate.toFixed(1)}% effective tax rate
            </div>
          </div>
        </div>

        <dl className='grid grid-cols-2 gap-4 border-border/60 border-t pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6'>
          <div>
            <dt className='text-muted-foreground text-xs uppercase tracking-wider'>
              Total tax to set aside
            </dt>
            <dd className='mt-1 font-mono font-semibold text-foreground text-xl'>
              {formatCurrency(totalTax, 0)}
            </dd>
          </div>
          {showSavings && (
            <div>
              <dt className='text-muted-foreground text-xs uppercase tracking-wider'>
                vs all salary
              </dt>
              <dd className='mt-1 font-mono font-semibold text-success text-xl'>
                +{formatCurrency(comparison.savingsVsAllSalary, 0)}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}
