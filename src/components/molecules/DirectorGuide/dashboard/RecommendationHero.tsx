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
  const { comparison, selectedStrategy, activeScenario } = useActiveDirectorScenario(true);

  if (!(comparison && selectedStrategy && activeScenario)) return null;

  const isRecommended = selectedStrategy === comparison.recommended;
  const label = isRecommended ? 'Recommended strategy' : 'Displayed strategy';
  const heading =
    selectedStrategy === 'optimalMix' && !isRecommended
      ? 'Baseline Mix'
      : STRATEGY_LABEL[selectedStrategy];
  const totalTax =
    activeScenario.corporationTax + activeScenario.employerNI + activeScenario.totalPersonalTax;
  const savingsVsAllSalary = activeScenario.takeHome - comparison.strategies.allSalary.takeHome;

  return (
    <section
      aria-label={isRecommended ? 'Recommended pay strategy' : 'Displayed pay strategy'}
      className={cn('rounded-sm border border-primary/35 bg-card p-6', className)}
    >
      <div className='mb-3 text-xs font-semibold tracking-[0.22em] text-primary uppercase'>
        {label}
      </div>

      <div className='grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end'>
        <div>
          <h2 className='font-display text-2xl leading-tight font-semibold text-foreground'>
            {heading}
          </h2>
          <p className='mt-1 text-sm text-muted-foreground'>
            {formatCurrency(activeScenario.salary, 0)} salary +{' '}
            {formatCurrency(activeScenario.dividends, 0)} dividends
          </p>

          <div className='mt-4'>
            <div className='text-xs tracking-wider text-muted-foreground uppercase'>
              Annual take-home
            </div>
            <div className='font-mono text-4xl font-semibold tracking-tight text-primary'>
              {formatCurrency(activeScenario.takeHome, 0)}
            </div>
            <div className='mt-1 text-sm text-muted-foreground'>
              ≈ {formatCurrency(activeScenario.takeHome / 12, 0)}/mo ·{' '}
              {activeScenario.effectiveRate.toFixed(1)}% effective tax rate
            </div>
          </div>
        </div>

        <dl className='grid grid-cols-2 gap-4 border-t border-border/60 pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6'>
          <div>
            <dt className='text-xs tracking-wider text-muted-foreground uppercase'>
              Total tax to set aside
            </dt>
            <dd className='mt-1 font-mono text-xl font-semibold text-foreground'>
              {formatCurrency(totalTax, 0)}
            </dd>
          </div>
          {savingsVsAllSalary > 0 && (
            <div>
              <dt className='text-xs tracking-wider text-muted-foreground uppercase'>
                vs all salary
              </dt>
              <dd className='mt-1 font-mono text-xl font-semibold text-success'>
                +{formatCurrency(savingsVsAllSalary, 0)}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}
