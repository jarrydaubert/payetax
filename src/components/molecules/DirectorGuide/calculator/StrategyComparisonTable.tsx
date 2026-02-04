// src/components/molecules/DirectorGuide/calculator/StrategyComparisonTable.tsx
/**
 * Strategy Comparison Cards - 3 selectable strategy cards
 *
 * All Salary | Baseline Mix (Comparison) | All Dividends
 * Selected card has cyan glow. Clicking a card updates the slider.
 * Dynamic message shows savings (green) or cost (red) vs baseline.
 */
'use client';

import { AlertTriangle, Banknote, PiggyBank, Split, User } from 'lucide-react';
import { useMemo } from 'react';
import { calculateSalaryScenario, type YourSetupResult } from '@/lib/tax/strategyComparison';
import { cn } from '@/lib/utils';
import {
  useDirectorFormData,
  useDirectorGuideActions,
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

export function StrategyComparisonTable() {
  const comparison = useStrategyComparison();
  const selectedStrategy = useSelectedStrategy();
  const sliderSalary = useSliderSalary();
  const formData = useDirectorFormData();
  const { setSelectedStrategy, setSliderSalary } = useDirectorGuideActions();

  // Calculate current scenario based on slider position
  const currentScenario = useMemo(() => {
    if (!comparison || comparison.grossProfit <= 0 || sliderSalary === null) return null;

    return calculateSalaryScenario(
      sliderSalary,
      comparison.grossProfit - (formData.pensionContribution || 0),
      formData.region ?? 'rUK',
      TAX_YEAR,
      formData.otherIncome,
      formData.hasEmploymentAllowance,
      formData.studentLoanPlans,
      formData.pensionContribution,
      formData.companyCarBIK,
    );
  }, [comparison, sliderSalary, formData]);

  if (!comparison || comparison.grossProfit <= 0) return null;

  // Calculate tax difference vs baseline (optimal mix for these inputs)
  const optimalStrategy = comparison.strategies.optimalMix;
  const optimalTotalTax =
    optimalStrategy.totalPersonalTax + optimalStrategy.corporationTax + optimalStrategy.employerNI;

  const currentTotalTax = currentScenario
    ? currentScenario.incomeTax +
      currentScenario.employeeNI +
      currentScenario.dividendTax +
      currentScenario.studentLoan +
      currentScenario.corporationTax +
      currentScenario.employerNI
    : optimalTotalTax;

  const taxDifference = currentTotalTax - optimalTotalTax;
  const taxPercentageMore = optimalTotalTax > 0 ? (taxDifference / optimalTotalTax) * 100 : 0;

  const isNearBaseline = Math.abs(taxDifference) < 10; // Within £10 of baseline
  const isCosting = taxDifference > 10; // Paying more tax than baseline

  const strategies = [
    {
      key: 'allSalary' as const,
      data: comparison.strategies.allSalary,
      icon: Banknote,
      description: 'Maximum PAYE salary',
    },
    {
      key: 'optimalMix' as const,
      data: comparison.strategies.optimalMix,
      icon: Split,
      description: 'Comparison mix',
    },
    {
      key: 'allDividends' as const,
      data: comparison.strategies.allDividends,
      icon: PiggyBank,
      description: 'Minimum salary, max dividends',
    },
  ];

  const handleSelectStrategy = (key: 'allSalary' | 'optimalMix' | 'allDividends') => {
    setSelectedStrategy(key);
    const salary = comparison.strategies[key].salary;
    setSliderSalary(salary);
  };

  return (
    <div className='space-y-3'>
      {/* Header with dynamic message */}
      <div>
        <h3 className='font-semibold text-slate-100'>Choose Your Strategy</h3>
        {isNearBaseline && (
          <p className='text-sm'>
            <span className='font-medium text-emerald-400'>Closest to the baseline mix</span>
            <span className='text-slate-500'>
              {' '}
              — baseline is the lowest-tax mix for these inputs
            </span>
          </p>
        )}
        {isCosting && (
          <p className='text-sm'>
            <span className='font-medium text-red-400'>
              {taxPercentageMore.toFixed(0)}% more tax
            </span>
            <span className='text-slate-500'>
              {' '}
              than the baseline mix ({formatCurrency(taxDifference)} extra)
            </span>
          </p>
        )}
      </div>

      {/* 3 Strategy Cards */}
      <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
        {strategies.map(({ key, data, icon: Icon, description }) => {
          const isSelected = selectedStrategy === key;
          const isRecommended = comparison.recommended === key;
          const totalTax = data.totalPersonalTax + data.corporationTax + data.employerNI;

          return (
            <button
              type='button'
              key={key}
              onClick={() => handleSelectStrategy(key)}
              className={cn(
                'relative rounded-xl border p-4 text-left transition-all',
                isSelected
                  ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                  : 'border-white/[0.08] bg-[#1e293b] hover:border-white/[0.15] hover:bg-[#273548]',
              )}
            >
              {/* Highest Take-Home Badge */}
              {isRecommended && (
                <span className='absolute -top-2 right-3 rounded-full bg-emerald-500 px-2 py-0.5 font-medium text-white text-xs'>
                  Highest Take-Home
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
                <div className='mt-2 flex justify-between border-white/[0.08] border-t pt-2'>
                  <span className='font-medium text-slate-400'>Take-Home</span>
                  <span className='font-mono font-semibold text-emerald-400'>
                    {formatCurrency(data.takeHome)}
                  </span>
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
      {comparison.strategies.yourSetup && (
        <YourSetupCard yourSetup={comparison.strategies.yourSetup} />
      )}
    </div>
  );
}

interface YourSetupCardProps {
  yourSetup: YourSetupResult;
}

function YourSetupCard({ yourSetup }: YourSetupCardProps) {
  const totalTax = yourSetup.totalPersonalTax + yourSetup.corporationTax + yourSetup.employerNI;
  const delta = yourSetup.deltaVsOptimal;
  const isNearBaseline = Math.abs(delta) < 10;
  const isCosting = delta > 10;
  const isSaving = delta < -10;

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
        <div className='mt-2 flex justify-between border-white/[0.08] border-t pt-2'>
          <span className='font-medium text-slate-400'>Take-Home</span>
          <span className='font-mono font-semibold text-emerald-400'>
            {formatCurrency(yourSetup.takeHome)}
          </span>
        </div>
      </div>

      {/* Delta vs Optimal */}
      <div className='mt-3 rounded-lg bg-black/20 p-2 text-center text-sm'>
        {isNearBaseline && <span className='text-emerald-400'>Within £10 of the baseline mix</span>}
        {isCosting && (
          <span className='text-red-400'>
            Pays {formatCurrency(delta)} more tax than baseline per year
          </span>
        )}
        {isSaving && (
          <span className='text-emerald-400'>
            Pays {formatCurrency(Math.abs(delta))} less tax than baseline per year
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
