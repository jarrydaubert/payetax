// src/components/molecules/DirectorGuide/calculator/StrategyComparisonTable.tsx
/**
 * Strategy Comparison Cards - 3 selectable strategy cards
 *
 * All Salary | Baseline Mix (Comparison) | All Dividends
 * Selected card has cyan glow. Clicking a card updates the slider.
 * Dynamic message shows savings (green) or cost (red) vs optimal mix.
 */
'use client';

import { AlertTriangle, Banknote, PiggyBank, Split, User } from 'lucide-react';
import { useState } from 'react';
import { trackStrategySelected } from '@/lib/directorGuideAnalytics';
import type { YourSetupResult } from '@/lib/tax/strategyComparison';
import { cn } from '@/lib/utils';
import { useDirectorGuideActions, useSelectedStrategy } from '@/store/directorGuideStore';
import { useActiveDirectorScenario } from './useActiveDirectorScenario';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

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
        <h3 className='font-semibold text-slate-100'>Choose Your Strategy</h3>
        <div className='mt-2 grid grid-cols-2 gap-2 rounded-lg border border-white/[0.04] bg-slate-950 p-1'>
          <button
            type='button'
            onClick={() => setObjective('maximizeTakeHome')}
            className={cn(
              'rounded-md px-3 py-2 text-sm transition-colors',
              objective === 'maximizeTakeHome'
                ? 'bg-cyan-500/20 font-medium text-cyan-300'
                : 'text-slate-400 hover:text-slate-200',
            )}
            aria-pressed={objective === 'maximizeTakeHome'}
          >
            Maximize take-home
          </button>
          <button
            type='button'
            onClick={() => setObjective('minimizeNI')}
            className={cn(
              'rounded-md px-3 py-2 text-sm transition-colors',
              objective === 'minimizeNI'
                ? 'bg-cyan-500/20 font-medium text-cyan-300'
                : 'text-slate-400 hover:text-slate-200',
            )}
            aria-pressed={objective === 'minimizeNI'}
          >
            Minimize NI
          </button>
        </div>
        <p className='mt-2 text-slate-400 text-sm'>
          Compare salary/dividend tradeoffs using your selected objective. Switch objective to see
          how the recommended strategy changes.
        </p>
        {isNearObjective && (
          <p className='text-sm'>
            <span className='font-medium text-emerald-400'>
              {objective === 'maximizeTakeHome'
                ? 'Closest to max take-home objective'
                : 'Closest to minimum NI objective'}
            </span>
            <span className='text-slate-500'>
              {' '}
              — use the £ deltas on each card to compare tradeoffs
            </span>
          </p>
        )}
        {objective === 'maximizeTakeHome' && takeHomeDifference < -10 && (
          <p className='text-sm'>
            <span className='font-medium text-red-400'>
              {formatCurrency(Math.abs(takeHomeDifference))} lower take-home
            </span>
            <span className='text-slate-500'>{' than max take-home strategy'}</span>
          </p>
        )}
        {objective === 'minimizeNI' && niDifference > 10 && (
          <p className='text-sm'>
            <span className='font-medium text-red-400'>{formatCurrency(niDifference)} more NI</span>
            <span className='text-slate-500'>{' than lowest-NI strategy'}</span>
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
                'relative rounded-xl border p-4 text-left transition-all',
                isSelected
                  ? 'border-cyan-500 bg-cyan-500/10 shadow-cyan-glow'
                  : 'border-white/[0.08] bg-[#1e293b] hover:border-white/[0.15] hover:bg-[#273548]',
              )}
            >
              {/* Objective badge */}
              {isRecommended && (
                <span className='absolute -top-2 right-3 rounded-full bg-emerald-500 px-2 py-0.5 font-medium text-white text-xs'>
                  {objective === 'maximizeTakeHome' ? 'Highest Take-Home' : 'Lowest NI'}
                </span>
              )}

              {/* Icon & Title */}
              <div className='mb-3 flex items-center gap-2'>
                <div
                  className={cn(
                    'flex size-8 items-center justify-center rounded-lg',
                    isSelected ? 'bg-cyan-500/20' : 'bg-white/5',
                  )}
                >
                  <Icon className={cn('size-4', isSelected ? 'text-cyan-400' : 'text-slate-400')} />
                </div>
                <div>
                  <h4 className='font-medium text-slate-100'>{data.name}</h4>
                  <p className='text-slate-500 text-xs'>{description}</p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className='space-y-1.5 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-slate-500'>Salary</span>
                  <span className='font-mono text-slate-300'>{formatCurrency(data.salary)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-500'>Dividends</span>
                  <span className='font-mono text-slate-300'>{formatCurrency(data.dividends)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-500'>Total Tax</span>
                  <span className='font-mono text-red-400'>{formatCurrency(totalTax)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-500'>Total NI</span>
                  <span className='font-mono text-slate-300'>{formatCurrency(totalNI)}</span>
                </div>
                <div className='mt-2 flex justify-between border-white/[0.08] border-t pt-2'>
                  <span className='font-medium text-slate-400'>Take-Home</span>
                  <span className='font-mono font-semibold text-emerald-400'>
                    {formatCurrency(data.takeHome)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-500'>
                    {objective === 'maximizeTakeHome' ? 'Vs Max Take-Home' : 'Vs Lowest NI'}
                  </span>
                  <span
                    className={cn(
                      'font-mono',
                      isReference
                        ? 'text-emerald-400'
                        : objective === 'maximizeTakeHome' && takeHomeDelta < 0
                          ? 'text-red-400'
                          : objective === 'minimizeNI' && niDelta > 0
                            ? 'text-red-400'
                            : 'text-emerald-400',
                    )}
                  >
                    {isReference
                      ? 'Reference'
                      : objective === 'maximizeTakeHome'
                        ? `${takeHomeDelta < 0 ? '-' : '+'}${formatCurrency(Math.abs(takeHomeDelta))}`
                        : `${niDelta > 0 ? '+' : '-'}${formatCurrency(Math.abs(niDelta))}`}
                  </span>
                </div>
                <div className='text-right text-slate-500 text-xs'>
                  {objective === 'maximizeTakeHome' ? 'Tax delta' : 'NI delta'}:{' '}
                  {objective === 'maximizeTakeHome'
                    ? totalTax > objectiveReferenceTotalTax
                      ? `+${formatCurrency(totalTax - objectiveReferenceTotalTax)}`
                      : totalTax < objectiveReferenceTotalTax
                        ? `-${formatCurrency(Math.abs(totalTax - objectiveReferenceTotalTax))}`
                        : '£0'
                    : niDelta > 0
                      ? `+${formatCurrency(niDelta)}`
                      : niDelta < 0
                        ? `-${formatCurrency(Math.abs(niDelta))}`
                        : '£0'}
                </div>
              </div>

              {/* Effective Rate */}
              <div className='mt-2 text-right text-slate-500 text-xs'>
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
      <div className='relative mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4'>
        <div className='mb-3 flex items-center gap-2'>
          <div className='flex size-8 items-center justify-center rounded-lg bg-amber-500/20'>
            <User className='size-4 text-amber-400' />
          </div>
          <div>
            <h4 className='font-medium text-slate-100'>Your Setup</h4>
            <p className='text-slate-500 text-xs'>Your current arrangement</p>
          </div>
        </div>
        <div className='rounded-lg bg-black/20 p-3 text-slate-300 text-sm'>
          <span className='font-medium text-slate-100'>Not set.</span> Add your salary and dividends
          in Full Inputs to compare your current setup against your selected objective.
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
        'relative mt-4 rounded-xl border p-4',
        yourSetup.exceedsProfit
          ? 'border-red-500/50 bg-red-500/10'
          : 'border-amber-500/30 bg-amber-500/5',
      )}
    >
      {/* DLA Warning Badge */}
      {yourSetup.exceedsProfit && (
        <span className='absolute -top-2 right-3 flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 font-medium text-white text-xs'>
          <AlertTriangle className='size-3' />
          Exceeds Profit
        </span>
      )}

      {/* Icon & Title */}
      <div className='mb-3 flex items-center gap-2'>
        <div className='flex size-8 items-center justify-center rounded-lg bg-amber-500/20'>
          <User className='size-4 text-amber-400' />
        </div>
        <div>
          <h4 className='font-medium text-slate-100'>Your Setup</h4>
          <p className='text-slate-500 text-xs'>Your current arrangement</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className='space-y-1.5 text-sm'>
        <div className='flex justify-between'>
          <span className='text-slate-500'>Salary</span>
          <span className='font-mono text-slate-300'>{formatCurrency(yourSetup.salary)}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-slate-500'>Dividends</span>
          <span className='font-mono text-slate-300'>{formatCurrency(yourSetup.dividends)}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-slate-500'>Total Tax</span>
          <span className='font-mono text-red-400'>{formatCurrency(totalTax)}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-slate-500'>Total NI</span>
          <span className='font-mono text-slate-300'>{formatCurrency(totalNI)}</span>
        </div>
        <div className='mt-2 flex justify-between border-white/[0.08] border-t pt-2'>
          <span className='font-medium text-slate-400'>Take-Home</span>
          <span className='font-mono font-semibold text-emerald-400'>
            {formatCurrency(yourSetup.takeHome)}
          </span>
        </div>
      </div>

      {/* Delta vs Optimal */}
      <div className='mt-3 rounded-lg bg-black/20 p-2 text-center text-sm'>
        {objective === 'maximizeTakeHome' && isNearObjective && (
          <span className='text-emerald-400'>Within £10 of max take-home reference</span>
        )}
        {objective === 'maximizeTakeHome' && takeHomeDelta < -10 && (
          <span className='text-red-400'>
            Takes home {formatCurrency(Math.abs(takeHomeDelta))} less per year vs max take-home
          </span>
        )}
        {objective === 'maximizeTakeHome' && takeHomeDelta > 10 && (
          <span className='text-emerald-400'>
            Takes home {formatCurrency(takeHomeDelta)} more per year vs max take-home
          </span>
        )}
        {objective === 'minimizeNI' && isNearObjective && (
          <span className='text-emerald-400'>Within £10 of minimum NI reference</span>
        )}
        {objective === 'minimizeNI' && niDelta > 10 && (
          <span className='text-red-400'>
            Pays {formatCurrency(niDelta)} more NI per year vs lowest-NI strategy
          </span>
        )}
        {objective === 'minimizeNI' && niDelta < -10 && (
          <span className='text-emerald-400'>
            Pays {formatCurrency(Math.abs(niDelta))} less NI per year vs lowest-NI strategy
          </span>
        )}
      </div>

      {/* DLA Warning */}
      {yourSetup.exceedsProfit && (
        <div className='mt-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3'>
          <AlertTriangle className='mt-0.5 size-4 shrink-0 text-red-400' />
          <p className='text-red-300 text-xs'>
            Your salary + dividends exceeds available profit. This may create or increase a
            Director&apos;s Loan Account balance. Speak to your accountant.
          </p>
        </div>
      )}

      {/* Effective Rate */}
      <div className='mt-2 text-right text-slate-500 text-xs'>
        {yourSetup.effectiveRate.toFixed(1)}% effective rate
      </div>
    </div>
  );
}
