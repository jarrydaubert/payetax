// src/components/molecules/DirectorGuide/calculator/SalarySlider.tsx
/**
 * What-If Explorer - Salary and company profit controls
 *
 * - Salary slider explores extraction at the current scenario.
 * - Company profit slider explores "what if the company makes more/less".
 */
'use client';

import { MoveHorizontal, TrendingUp } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { CURRENT_TAX_YEAR, TAX_RATES } from '@/constants/taxRates';
import { cn, formatCurrency } from '@/lib/utils';
import {
  DIRECTOR_PROFIT_WHAT_IF_MAX_PERCENT,
  DIRECTOR_PROFIT_WHAT_IF_MIN_PERCENT,
  useDirectorGuideActions,
} from '@/store/directorGuideStore';
import { useActiveDirectorScenario } from './useActiveDirectorScenario';

const formatPercent = (amount: number) => (amount > 0 ? `+${amount}%` : `${amount}%`);

const TAX_YEAR = CURRENT_TAX_YEAR;
const UEL = TAX_RATES[TAX_YEAR].nationalInsurance.employee.A.upper.threshold;

export function SalarySlider() {
  const {
    comparison,
    sliderSalary,
    profitWhatIfPercent,
    isProfitWhatIfActive,
    baseGrossProfitBeforePension,
    scenarioGrossProfitBeforePension,
  } = useActiveDirectorScenario();
  const { setSliderSalary, setProfitWhatIfPercent } = useDirectorGuideActions();
  const hasInitialized = useRef(false);
  const hasValidComparison = Boolean(comparison && comparison.grossProfit > 0);
  const grossProfitForSlider = comparison?.grossProfitAfterPension ?? comparison?.grossProfit ?? 0;
  const maxSalary = hasValidComparison ? Math.min(UEL, grossProfitForSlider) : 0;
  const baselineSalary = comparison?.strategies.optimalMix.salary ?? 0;
  const currentSalary = hasValidComparison ? (sliderSalary ?? baselineSalary) : 0;
  const isSalaryCustom = hasValidComparison && Math.abs(currentSalary - baselineSalary) >= 1;

  // Initialize slider to optimal salary on first calculation
  useEffect(() => {
    if (comparison && comparison.grossProfit > 0 && !hasInitialized.current) {
      setSliderSalary(comparison.strategies.optimalMix.salary);
      hasInitialized.current = true;
    }
  }, [comparison, setSliderSalary]);

  // Clamp to current max salary when scenario changes.
  useEffect(() => {
    if (sliderSalary !== null && sliderSalary > maxSalary) {
      setSliderSalary(maxSalary);
    }
  }, [maxSalary, setSliderSalary, sliderSalary]);

  // Reset initialization flag when comparison is cleared
  useEffect(() => {
    if (!comparison || comparison.grossProfit <= 0) {
      hasInitialized.current = false;
    }
  }, [comparison]);

  if (!hasValidComparison) return null;

  return (
    <div className='space-y-4 rounded-sm border border-border/50 bg-card p-5'>
      <div className='rounded-sm border border-border/50 bg-background p-3'>
        <div className='flex items-center justify-between gap-2'>
          <span className='font-medium text-foreground text-sm'>Active Scenario</span>
          <span
            className={cn(
              'rounded px-2 py-0.5 text-xs',
              isProfitWhatIfActive ? 'bg-primary/20 text-primary' : 'bg-success/20 text-success',
            )}
          >
            {isProfitWhatIfActive ? 'Simulated Company' : 'Current Company'}
          </span>
        </div>
        <p className='mt-2 text-muted-foreground text-xs'>
          Salary slider is editing the {isProfitWhatIfActive ? 'simulated' : 'current'} company
          scenario ({isSalaryCustom ? 'custom salary' : 'baseline salary'}).
        </p>
      </div>

      <div className='space-y-3'>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <TrendingUp className='size-4' />
            <span className='text-sm'>Company profit scenario</span>
          </div>
          <button
            type='button'
            onClick={() => setProfitWhatIfPercent(0)}
            className={cn(
              'rounded border px-2 py-1 text-xs transition-colors',
              isProfitWhatIfActive
                ? 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20'
                : 'cursor-default border-border/50 text-muted-foreground',
            )}
            disabled={!isProfitWhatIfActive}
          >
            Reset
          </button>
        </div>
        <p className='text-muted-foreground text-xs'>
          {formatCurrency(baseGrossProfitBeforePension, 0)} now
          {' -> '}
          <span className='font-medium text-foreground'>
            {formatCurrency(scenarioGrossProfitBeforePension, 0)}
          </span>{' '}
          ({formatPercent(profitWhatIfPercent)})
        </p>
        <Slider
          data-testid='director-profit-slider'
          value={[profitWhatIfPercent]}
          onValueChange={(value) => setProfitWhatIfPercent(value[0] ?? 0)}
          min={DIRECTOR_PROFIT_WHAT_IF_MIN_PERCENT}
          max={DIRECTOR_PROFIT_WHAT_IF_MAX_PERCENT}
          step={5}
          className='w-full'
        />
      </div>

      <div className='space-y-3'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <MoveHorizontal className='size-4' />
          <span className='text-sm'>Salary level at this scenario</span>
        </div>
        <p className='text-muted-foreground text-xs'>
          Exploring salary from £0 to {formatCurrency(maxSalary, 0)} (max affordable under current
          company scenario)
        </p>
        <Slider
          data-testid='director-salary-slider'
          value={[currentSalary]}
          onValueChange={(value) => setSliderSalary(value[0] ?? null)}
          min={0}
          max={maxSalary}
          step={100}
          className='w-full'
        />
      </div>
    </div>
  );
}
