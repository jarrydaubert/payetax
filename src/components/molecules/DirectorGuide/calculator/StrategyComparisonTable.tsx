// src/components/molecules/DirectorGuide/calculator/StrategyComparisonTable.tsx
/**
 * Strategy Comparison Cards - 3 selectable strategy cards
 *
 * All Salary | Baseline Mix (Comparison) | All Dividends
 * Selected card uses a bordered Ledger treatment. Clicking a card updates the slider.
 * Dynamic message shows savings (green) or cost (red) vs optimal mix.
 */
'use client';

import { AlertTriangle, Banknote, PiggyBank, Split, User } from 'lucide-react';
import { useState } from 'react';
import { trackStrategySelected } from '@/lib/directorGuideAnalytics';
import type { YourSetupResult } from '@/lib/tax/strategyComparison';
import { cn, formatCurrency } from '@/lib/utils';
import { useDirectorGuideActions, useSelectedStrategy } from '@/store/directorGuideStore';
import { useActiveDirectorScenario } from './useActiveDirectorScenario';

type StrategyKey = 'allSalary' | 'optimalMix' | 'allDividends';
type StrategyObjective = 'maximizeTakeHome' | 'minimizeNI';

export function StrategyComparisonTable() {
  const selectedStrategy = useSelectedStrategy();
  const { comparison, activeScenario } = useActiveDirectorScenario();
  const { setSelectedStrategy, setSliderSalary } = useDirectorGuideActions();
  const [objective, setObjective] = useState<StrategyObjective>('maximizeTakeHome');

  if (!comparison || comparison.grossProfit <= 0) return null;

  const strategies = [
    {
      key: 'allSalary' as StrategyKey,
      data: comparison.strategies.allSalary,
      icon: Banknote,
      description: 'Maximum PAYE salary',
    },
    {
      key: 'optimalMix' as StrategyKey,
      data: comparison.strategies.optimalMix,
      icon: Split,
      description: 'Comparison mix',
    },
    {
      key: 'allDividends' as StrategyKey,
      data: comparison.strategies.allDividends,
      icon: PiggyBank,
      description: 'Minimum salary, max dividends',
    },
  ];

  const comparisonStrategies = comparison.strategies;
  let objectiveReferenceKey: StrategyKey = 'allSalary';

  for (const key of ['optimalMix', 'allDividends'] as const) {
    if (objective === 'maximizeTakeHome') {
      if (
        comparisonStrategies[key].takeHome > comparisonStrategies[objectiveReferenceKey].takeHome
      ) {
        objectiveReferenceKey = key;
      }
      continue;
    }

    const candidateNI = comparisonStrategies[key].employeeNI + comparisonStrategies[key].employerNI;
    const bestNI =
      comparisonStrategies[objectiveReferenceKey].employeeNI +
      comparisonStrategies[objectiveReferenceKey].employerNI;
    if (candidateNI < bestNI) {
      objectiveReferenceKey = key;
    }
  }

  const objectiveReference = comparisonStrategies[objectiveReferenceKey];
  const objectiveReferenceTakeHome = objectiveReference.takeHome;
  const objectiveReferenceTotalTax =
    objectiveReference.totalPersonalTax +
    objectiveReference.corporationTax +
    objectiveReference.employerNI;
  const objectiveReferenceTotalNI = objectiveReference.employeeNI + objectiveReference.employerNI;

  const currentTakeHome = activeScenario?.takeHome ?? objectiveReferenceTakeHome;
  const currentTotalNI =
    activeScenario !== null
      ? activeScenario.employeeNI + activeScenario.employerNI
      : objectiveReferenceTotalNI;
  const takeHomeDifference = currentTakeHome - objectiveReferenceTakeHome;
  const niDifference = currentTotalNI - objectiveReferenceTotalNI;
  const isNearObjective =
    objective === 'maximizeTakeHome'
      ? Math.abs(takeHomeDifference) < 10
      : Math.abs(niDifference) < 10;

  const handleSelectStrategy = (key: StrategyKey) => {
    trackStrategySelected(key, objectiveReferenceKey === key);
    setSelectedStrategy(key);
    const salary = comparison.strategies[key].salary;
    setSliderSalary(salary);
  };

  return (
    <div className='space-y-3'>
      {/* Header with dynamic message */}
      <div>
        <h3 className='font-semibold text-foreground'>Choose Your Strategy</h3>
        <div className='mt-2 grid grid-cols-2 gap-2 rounded-sm border border-border/40 bg-background p-1'>
          <button
            type='button'
            onClick={() => setObjective('maximizeTakeHome')}
            className={cn(
              'rounded-sm px-3 py-2 text-sm transition-colors',
              objective === 'maximizeTakeHome'
                ? 'bg-primary/20 font-medium text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
            aria-pressed={objective === 'maximizeTakeHome'}
          >
            Maximize take-home
          </button>
          <button
            type='button'
            onClick={() => setObjective('minimizeNI')}
            className={cn(
              'rounded-sm px-3 py-2 text-sm transition-colors',
              objective === 'minimizeNI'
                ? 'bg-primary/20 font-medium text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
            aria-pressed={objective === 'minimizeNI'}
          >
            Minimize NI
          </button>
        </div>
        <p className='mt-2 text-muted-foreground text-sm'>
          Compare salary/dividend tradeoffs using your selected objective. Switch objective to see
          how the recommended strategy changes.
        </p>
        {isNearObjective && (
          <p className='text-sm'>
            <span className='font-medium text-success'>
              {objective === 'maximizeTakeHome'
                ? 'Closest to max take-home objective'
                : 'Closest to minimum NI objective'}
            </span>
            <span className='text-muted-foreground'>
              {' '}
              — use the £ deltas on each card to compare tradeoffs
            </span>
          </p>
        )}
        {objective === 'maximizeTakeHome' && takeHomeDifference < -10 && (
          <p className='text-sm'>
            <span className='font-medium text-destructive'>
              {formatCurrency(Math.abs(takeHomeDifference), 0)} lower take-home
            </span>
            <span className='text-muted-foreground'>{' than max take-home strategy'}</span>
          </p>
        )}
        {objective === 'minimizeNI' && niDifference > 10 && (
          <p className='text-sm'>
            <span className='font-medium text-destructive'>
              {formatCurrency(niDifference, 0)} more NI
            </span>
            <span className='text-muted-foreground'>{' than lowest-NI strategy'}</span>
          </p>
        )}
      </div>

      {/* 3 Strategy Cards */}
      <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
        {strategies.map(({ key, data, icon: Icon, description }) => {
          const isSelected = selectedStrategy === key;
          const isRecommended = objectiveReferenceKey === key;
          const totalTax = data.totalPersonalTax + data.corporationTax + data.employerNI;
          const totalNI = data.employeeNI + data.employerNI;
          const takeHomeDelta = data.takeHome - objectiveReferenceTakeHome;
          const niDelta = totalNI - objectiveReferenceTotalNI;
          const isReference =
            objective === 'maximizeTakeHome'
              ? Math.abs(takeHomeDelta) < 0.01
              : Math.abs(niDelta) < 0.01;

          return (
            <button
              type='button'
              key={key}
              onClick={() => handleSelectStrategy(key)}
              className={cn(
                'relative rounded-sm border p-5 text-left transition-colors',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border/40 bg-card hover:border-border/70 hover:bg-accent/20',
              )}
            >
              {/* Objective badge */}
              {isRecommended && (
                <span className='absolute -top-2 right-3 rounded-sm bg-success px-2 py-0.5 font-medium text-success-foreground text-xs'>
                  {objective === 'maximizeTakeHome' ? 'Highest Take-Home' : 'Lowest NI'}
                </span>
              )}

              {/* Icon & Title */}
              <div className='mb-3 flex items-center gap-2'>
                <div
                  className={cn(
                    'flex size-8 items-center justify-center rounded-sm',
                    isSelected ? 'bg-primary/20' : 'bg-muted/20',
                  )}
                >
                  <Icon
                    className={cn('size-4', isSelected ? 'text-primary' : 'text-muted-foreground')}
                  />
                </div>
                <div>
                  <h4 className='font-medium text-foreground'>{data.name}</h4>
                  <p className='text-muted-foreground text-xs'>{description}</p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className='space-y-1.5 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Salary</span>
                  <span className='font-mono text-foreground/90'>
                    {formatCurrency(data.salary, 0)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Dividends</span>
                  <span className='font-mono text-foreground/90'>
                    {formatCurrency(data.dividends, 0)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Total Tax</span>
                  <span className='font-mono text-destructive'>{formatCurrency(totalTax, 0)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Total NI</span>
                  <span className='font-mono text-foreground/90'>{formatCurrency(totalNI, 0)}</span>
                </div>
                <div className='mt-2 flex justify-between border-border/40 border-t pt-2'>
                  <span className='font-medium text-muted-foreground'>Take-Home</span>
                  <span className='font-mono font-semibold text-success'>
                    {formatCurrency(data.takeHome, 0)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>
                    {objective === 'maximizeTakeHome' ? 'Vs Max Take-Home' : 'Vs Lowest NI'}
                  </span>
                  <span
                    className={cn(
                      'font-mono',
                      isReference
                        ? 'text-success'
                        : objective === 'maximizeTakeHome' && takeHomeDelta < 0
                          ? 'text-destructive'
                          : objective === 'minimizeNI' && niDelta > 0
                            ? 'text-destructive'
                            : 'text-success',
                    )}
                  >
                    {isReference
                      ? 'Reference'
                      : objective === 'maximizeTakeHome'
                        ? `${takeHomeDelta < 0 ? '-' : '+'}${formatCurrency(Math.abs(takeHomeDelta), 0)}`
                        : `${niDelta > 0 ? '+' : '-'}${formatCurrency(Math.abs(niDelta), 0)}`}
                  </span>
                </div>
                <div className='text-right text-muted-foreground text-xs'>
                  {objective === 'maximizeTakeHome' ? 'Tax delta' : 'NI delta'}:{' '}
                  {objective === 'maximizeTakeHome'
                    ? totalTax > objectiveReferenceTotalTax
                      ? `+${formatCurrency(totalTax - objectiveReferenceTotalTax, 0)}`
                      : totalTax < objectiveReferenceTotalTax
                        ? `-${formatCurrency(Math.abs(totalTax - objectiveReferenceTotalTax), 0)}`
                        : '£0'
                    : niDelta > 0
                      ? `+${formatCurrency(niDelta, 0)}`
                      : niDelta < 0
                        ? `-${formatCurrency(Math.abs(niDelta), 0)}`
                        : '£0'}
                </div>
              </div>

              {/* Effective Rate */}
              <div className='mt-2 text-right text-muted-foreground text-xs'>
                {data.effectiveRate.toFixed(1)}% effective rate
              </div>
            </button>
          );
        })}
      </div>

      {/* Your Setup Card (4th card) */}
      <YourSetupCard
        yourSetup={comparison.strategies.yourSetup}
        objective={objective}
        objectiveReferenceTakeHome={objectiveReferenceTakeHome}
        objectiveReferenceTotalNI={objectiveReferenceTotalNI}
      />
    </div>
  );
}

interface YourSetupCardProps {
  yourSetup?: YourSetupResult;
  objective: StrategyObjective;
  objectiveReferenceTakeHome: number;
  objectiveReferenceTotalNI: number;
}

function YourSetupCard({
  yourSetup,
  objective,
  objectiveReferenceTakeHome,
  objectiveReferenceTotalNI,
}: YourSetupCardProps) {
  if (!yourSetup) {
    return (
      <div className='relative mt-4 rounded-sm border border-warning/50 bg-warning/10 p-5'>
        <div className='mb-3 flex items-center gap-2'>
          <div className='flex size-8 items-center justify-center rounded-sm bg-warning/20'>
            <User className='size-4 text-warning' />
          </div>
          <div>
            <h4 className='font-medium text-foreground'>Your Setup</h4>
            <p className='text-muted-foreground text-xs'>Your current arrangement</p>
          </div>
        </div>
        <div className='rounded-sm bg-muted/20 p-3 text-foreground/80 text-sm'>
          <span className='font-medium text-foreground'>Not set.</span> Add your salary and
          dividends in Full Inputs to compare your current setup against your selected objective.
        </div>
      </div>
    );
  }

  const totalTax = yourSetup.totalPersonalTax + yourSetup.corporationTax + yourSetup.employerNI;
  const totalNI = yourSetup.employeeNI + yourSetup.employerNI;
  const takeHomeDelta = yourSetup.takeHome - objectiveReferenceTakeHome;
  const niDelta = totalNI - objectiveReferenceTotalNI;
  const isNearObjective =
    objective === 'maximizeTakeHome' ? Math.abs(takeHomeDelta) < 10 : Math.abs(niDelta) < 10;

  return (
    <div
      className={cn(
        'relative mt-4 rounded-sm border p-5',
        yourSetup.exceedsProfit
          ? 'border-destructive/50 bg-destructive/10'
          : 'border-warning/50 bg-warning/10',
      )}
    >
      {/* DLA Warning Badge */}
      {yourSetup.exceedsProfit && (
        <span className='absolute -top-2 right-3 flex items-center gap-1 rounded-sm bg-destructive px-2 py-0.5 font-medium text-destructive-foreground text-xs'>
          <AlertTriangle className='size-3' />
          Exceeds Profit
        </span>
      )}

      {/* Icon & Title */}
      <div className='mb-3 flex items-center gap-2'>
        <div className='flex size-8 items-center justify-center rounded-sm bg-warning/20'>
          <User className='size-4 text-warning' />
        </div>
        <div>
          <h4 className='font-medium text-foreground'>Your Setup</h4>
          <p className='text-muted-foreground text-xs'>Your current arrangement</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className='space-y-1.5 text-sm'>
        <div className='flex justify-between'>
          <span className='text-muted-foreground'>Salary</span>
          <span className='font-mono text-foreground/90'>
            {formatCurrency(yourSetup.salary, 0)}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='text-muted-foreground'>Dividends</span>
          <span className='font-mono text-foreground/90'>
            {formatCurrency(yourSetup.dividends, 0)}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='text-muted-foreground'>Total Tax</span>
          <span className='font-mono text-destructive'>{formatCurrency(totalTax, 0)}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-muted-foreground'>Total NI</span>
          <span className='font-mono text-foreground/90'>{formatCurrency(totalNI, 0)}</span>
        </div>
        <div className='mt-2 flex justify-between border-border/40 border-t pt-2'>
          <span className='font-medium text-muted-foreground'>Take-Home</span>
          <span className='font-mono font-semibold text-success'>
            {formatCurrency(yourSetup.takeHome, 0)}
          </span>
        </div>
      </div>

      {/* Delta vs Optimal */}
      <div className='mt-3 rounded-sm bg-muted/20 p-2 text-center text-sm'>
        {objective === 'maximizeTakeHome' && isNearObjective && (
          <span className='text-success'>Within £10 of max take-home reference</span>
        )}
        {objective === 'maximizeTakeHome' && takeHomeDelta < -10 && (
          <span className='text-destructive'>
            Takes home {formatCurrency(Math.abs(takeHomeDelta), 0)} less per year vs max take-home
          </span>
        )}
        {objective === 'maximizeTakeHome' && takeHomeDelta > 10 && (
          <span className='text-success'>
            Takes home {formatCurrency(takeHomeDelta, 0)} more per year vs max take-home
          </span>
        )}
        {objective === 'minimizeNI' && isNearObjective && (
          <span className='text-success'>Within £10 of minimum NI reference</span>
        )}
        {objective === 'minimizeNI' && niDelta > 10 && (
          <span className='text-destructive'>
            Pays {formatCurrency(niDelta, 0)} more NI per year vs lowest-NI strategy
          </span>
        )}
        {objective === 'minimizeNI' && niDelta < -10 && (
          <span className='text-success'>
            Pays {formatCurrency(Math.abs(niDelta), 0)} less NI per year vs lowest-NI strategy
          </span>
        )}
      </div>

      {/* DLA Warning */}
      {yourSetup.exceedsProfit && (
        <div className='mt-3 flex items-start gap-2 rounded-sm border border-destructive/40 bg-destructive/10 p-3'>
          <AlertTriangle className='mt-0.5 size-4 shrink-0 text-destructive' />
          <p className='text-destructive/90 text-xs'>
            Your salary + dividends exceeds available profit. This may create or increase a
            Director&apos;s Loan Account balance. Speak to your accountant.
          </p>
        </div>
      )}

      {/* Effective Rate */}
      <div className='mt-2 text-right text-muted-foreground text-xs'>
        {yourSetup.effectiveRate.toFixed(1)}% effective rate
      </div>
    </div>
  );
}
