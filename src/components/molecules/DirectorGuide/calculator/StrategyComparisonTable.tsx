// src/components/molecules/DirectorGuide/calculator/StrategyComparisonTable.tsx
/**
 * Submitted strategy comparison cards
 *
 * All Salary | Baseline Mix (Comparison) | All Dividends
 */
'use client';

import { AlertTriangle, Banknote, PiggyBank, Split, User } from 'lucide-react';
import { roundToPence } from '@/lib/tax';
import type { YourSetupResult } from '@/lib/tax/strategyComparison';
import { cn, formatCurrency } from '@/lib/utils';
import { type StrategyObjective, useSubmittedDirectorForm } from '@/store/directorGuideStore';
import { useActiveDirectorScenario } from './useActiveDirectorScenario';

type StrategyKey = 'allSalary' | 'optimalMix' | 'allDividends';

export function StrategyComparisonTable() {
  const {
    comparison,
    activeScenario,
    selectedStrategy,
    exploration,
    isCustomSalary,
    isProfitWhatIfActive,
  } = useActiveDirectorScenario();
  const formData = useSubmittedDirectorForm();
  const objective = exploration?.objective ?? 'maximizeTakeHome';
  const objectiveBadge = objective === 'maximizeTakeHome' ? 'Highest Take-Home' : 'Lowest NI';

  if (!(formData && comparison) || comparison.grossProfit <= 0) return null;

  const { ytdSalary, ytdDividends, minimumSalaryRequirement } = formData;

  const hasMinimumSalary = roundToPence(minimumSalaryRequirement ?? 0) > 0;
  const isCustom = isCustomSalary || isProfitWhatIfActive;
  const compareWithDisplayed = !exploration && hasMinimumSalary && selectedStrategy !== null;
  const displaysRecommendation = !isCustom && selectedStrategy === comparison.recommended;
  const paidSalary = roundToPence(ytdSalary);
  const paidDividends = roundToPence(ytdDividends);
  const scenarioSalary = activeScenario && roundToPence(activeScenario.salary);
  const scenarioDividends = activeScenario && roundToPence(activeScenario.dividends);

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
      description: 'No salary, max dividends',
    },
  ];

  const objectiveReferenceKey = exploration
    ? exploration.objectiveReference
    : compareWithDisplayed
      ? selectedStrategy
      : comparison.recommended;
  const objectiveReference = objectiveReferenceKey
    ? comparison.strategies[objectiveReferenceKey]
    : null;
  const objectiveReferenceTakeHome = objectiveReference?.takeHome ?? 0;
  const objectiveReferenceTotalTax = objectiveReference
    ? objectiveReference.totalPersonalTax +
      objectiveReference.corporationTax +
      objectiveReference.employerNI
    : 0;
  const objectiveReferenceTotalNI = objectiveReference
    ? objectiveReference.employeeNI + objectiveReference.employerNI
    : 0;

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

  return (
    <div className='space-y-3'>
      <div>
        <h3 className='font-semibold text-foreground'>Compare Strategies</h3>
        <p className='mt-2 text-sm text-muted-foreground'>
          Other strategies are shown for comparison.
        </p>
        {exploration && !objectiveReference && (
          <p className='mt-2 text-sm text-muted-foreground'>
            No strategy meets your minimum salary for this objective comparison.
          </p>
        )}
        <p className='mt-2 text-sm text-muted-foreground'>
          Salary and dividends are full-year estimates calculated without adjusting for amounts
          already paid.
        </p>
        <div role='status' className='text-sm font-medium text-foreground not-empty:mt-2'>
          {scenarioSalary !== null && paidSalary > scenarioSalary && (
            <p>
              Salary already paid ({formatCurrency(paidSalary)}) exceeds this scenario’s full-year
              salary ({formatCurrency(scenarioSalary)}).
            </p>
          )}
          {scenarioDividends !== null && paidDividends > scenarioDividends && (
            <p>
              Dividends already paid ({formatCurrency(paidDividends)}) exceed this scenario’s
              full-year dividends ({formatCurrency(scenarioDividends)}).
            </p>
          )}
        </div>
        {objectiveReference && isNearObjective && (
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
        {objectiveReference && objective === 'maximizeTakeHome' && takeHomeDifference < -10 && (
          <p className='text-sm'>
            <span className='font-medium text-destructive'>
              {formatCurrency(Math.abs(takeHomeDifference), 0)} lower take-home
            </span>
            <span className='text-muted-foreground'>{' than max take-home strategy'}</span>
          </p>
        )}
        {objectiveReference && objective === 'minimizeNI' && niDifference > 10 && (
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
          const isDisplayed = !isCustom && selectedStrategy === key;
          const isObjectiveReference = objectiveReferenceKey === key;
          const comparisonOnly = key === 'allDividends' && hasMinimumSalary;
          const showsDisplayedBadge =
            isDisplayed && (exploration || compareWithDisplayed || !displaysRecommendation);
          const showsRecommendationBadge = compareWithDisplayed && key === comparison.recommended;
          const badge = showsDisplayedBadge
            ? 'Displayed Result'
            : showsRecommendationBadge
              ? 'Recommendation'
              : isObjectiveReference
                ? objectiveBadge
                : null;
          const totalTax = data.totalPersonalTax + data.corporationTax + data.employerNI;
          const totalNI = data.employeeNI + data.employerNI;
          const takeHomeDelta = data.takeHome - objectiveReferenceTakeHome;
          const niDelta = totalNI - objectiveReferenceTotalNI;
          const isReference = isObjectiveReference && !comparisonOnly;

          return (
            <article
              key={key}
              className={cn(
                'relative rounded-sm border p-5 text-left transition-colors',
                isDisplayed ? 'border-primary bg-primary/5' : 'border-border/40 bg-card',
              )}
            >
              {/* Objective badge */}
              {!comparisonOnly && badge && (
                <span className='absolute -top-2 right-3 rounded-sm bg-success px-2 py-0.5 text-xs font-medium text-success-foreground'>
                  {badge}
                </span>
              )}

              {/* Icon & Title */}
              <div className='mb-3 flex items-center gap-2'>
                <div
                  className={cn(
                    'flex size-8 items-center justify-center rounded-sm',
                    isDisplayed ? 'bg-primary/20' : 'bg-muted/20',
                  )}
                >
                  <Icon
                    className={cn('size-4', isDisplayed ? 'text-primary' : 'text-muted-foreground')}
                  />
                </div>
                <div>
                  <h4 className='font-medium text-foreground'>{data.name}</h4>
                  <p className='text-xs text-muted-foreground'>
                    {comparisonOnly
                      ? 'Comparison only. Zero salary does not meet your minimum.'
                      : description}
                  </p>
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
                <div className='mt-2 flex justify-between border-t border-border/40 pt-2'>
                  <span className='font-medium text-muted-foreground'>Take-Home</span>
                  <span className='font-mono font-semibold text-success'>
                    {formatCurrency(data.takeHome, 0)}
                  </span>
                </div>
                {objectiveReference && (
                  <>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        {compareWithDisplayed
                          ? 'Vs Displayed Result'
                          : objective === 'maximizeTakeHome'
                            ? 'Vs Max Take-Home'
                            : 'Vs Lowest NI'}
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
                    <div className='text-right text-xs text-muted-foreground'>
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
                  </>
                )}
              </div>

              {/* Effective Rate */}
              <div className='mt-2 text-right text-xs text-muted-foreground'>
                {data.effectiveRate.toFixed(1)}% effective rate
              </div>
            </article>
          );
        })}
      </div>

      {/* Your Setup Card (4th card) */}
      <YourSetupCard
        yourSetup={comparison.strategies.yourSetup}
        objective={objective}
        objectiveReferenceTakeHome={objectiveReferenceTakeHome}
        objectiveReferenceTotalNI={objectiveReferenceTotalNI}
        compareWithDisplayed={compareWithDisplayed}
        hasObjectiveReference={objectiveReference !== null}
      />
    </div>
  );
}

interface YourSetupCardProps {
  yourSetup?: YourSetupResult;
  objective: StrategyObjective;
  objectiveReferenceTakeHome: number;
  objectiveReferenceTotalNI: number;
  compareWithDisplayed: boolean;
  hasObjectiveReference: boolean;
}

function YourSetupCard({
  yourSetup,
  objective,
  objectiveReferenceTakeHome,
  objectiveReferenceTotalNI,
  compareWithDisplayed,
  hasObjectiveReference,
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
            <p className='text-xs text-muted-foreground'>Your current arrangement</p>
          </div>
        </div>
        <div className='rounded-sm bg-muted/20 p-3 text-sm text-foreground/80'>
          <span className='font-medium text-foreground'>Not set.</span> Add your salary and
          dividends in Full Inputs to compare your current setup.
        </div>
      </div>
    );
  }

  const totalTax = yourSetup.totalPersonalTax + yourSetup.corporationTax + yourSetup.employerNI;
  const totalNI = yourSetup.employeeNI + yourSetup.employerNI;
  const takeHomeDelta = yourSetup.takeHome - objectiveReferenceTakeHome;
  const niDelta = totalNI - objectiveReferenceTotalNI;
  const takeHomeReference = compareWithDisplayed ? 'the displayed result' : 'max take-home';
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
        <span className='absolute -top-2 right-3 flex items-center gap-1 rounded-sm bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground'>
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
          <p className='text-xs text-muted-foreground'>Your current arrangement</p>
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
        <div className='mt-2 flex justify-between border-t border-border/40 pt-2'>
          <span className='font-medium text-muted-foreground'>Take-Home</span>
          <span className='font-mono font-semibold text-success'>
            {formatCurrency(yourSetup.takeHome, 0)}
          </span>
        </div>
      </div>

      {/* Delta vs Optimal */}
      {hasObjectiveReference && (
        <div className='mt-3 rounded-sm bg-muted/20 p-2 text-center text-sm'>
          {objective === 'maximizeTakeHome' && isNearObjective && (
            <span className='text-success'>
              Within £10 of{' '}
              {compareWithDisplayed ? 'the displayed result' : 'max take-home reference'}
            </span>
          )}
          {objective === 'maximizeTakeHome' && takeHomeDelta < -10 && (
            <span className='text-destructive'>
              Takes home {formatCurrency(Math.abs(takeHomeDelta), 0)} less per year vs{' '}
              {takeHomeReference}
            </span>
          )}
          {objective === 'maximizeTakeHome' && takeHomeDelta > 10 && (
            <span className='text-success'>
              Takes home {formatCurrency(takeHomeDelta, 0)} more per year vs {takeHomeReference}
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
      )}

      {/* DLA Warning */}
      {yourSetup.exceedsProfit && (
        <div className='mt-3 flex items-start gap-2 rounded-sm border border-destructive/40 bg-destructive/10 p-3'>
          <AlertTriangle className='mt-0.5 size-4 shrink-0 text-destructive' />
          <p className='text-xs text-destructive/90'>
            Your salary, dividends and company taxes exceed available profit by{' '}
            {formatCurrency(yourSetup.companyShortfall)}. This may create or increase a
            Director&apos;s Loan Account balance. Speak to your accountant.
          </p>
        </div>
      )}

      {/* Effective Rate */}
      <div className='mt-2 text-right text-xs text-muted-foreground'>
        {yourSetup.effectiveRate.toFixed(1)}% effective rate
      </div>
    </div>
  );
}
