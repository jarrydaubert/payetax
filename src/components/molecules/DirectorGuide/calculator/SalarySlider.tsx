// src/components/molecules/DirectorGuide/calculator/SalarySlider.tsx
/**
 * What-If Explorer - Salary and company profit controls
 *
 * - Salary slider explores extraction at the current scenario.
 * - Company profit slider explores "what if the company makes more/less".
 */
'use client';

import { MoveHorizontal, TrendingUp } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn, formatCurrency } from '@/lib/utils';
import {
  DIRECTOR_PROFIT_WHAT_IF_MAX_PERCENT,
  DIRECTOR_PROFIT_WHAT_IF_MIN_PERCENT,
  useDirectorGuideActions,
  useProfitWhatIfPercent,
  useSelectedStrategy,
  useSliderSalary,
  useStrategyComparison,
} from '@/store/directorGuideStore';

const formatPercent = (amount: number) => (amount > 0 ? `+${amount}%` : `${amount}%`);

export function SalarySlider() {
  const comparison = useStrategyComparison();
  const sliderSalary = useSliderSalary();
  const selectedStrategy = useSelectedStrategy();
  const profitWhatIfPercent = useProfitWhatIfPercent();
  const { setSliderSalary, setProfitWhatIfPercent } = useDirectorGuideActions();
  if (!comparison || comparison.grossProfit <= 0) return null;

  const isProfitWhatIfActive = profitWhatIfPercent !== 0;
  const currentSalary = sliderSalary ?? comparison.strategies[selectedStrategy].salary;
  const maxSalary = Math.max(100, comparison.strategies.allSalary.salary, currentSalary);

  return (
    <div className='space-y-4 rounded-sm border border-border/50 bg-card p-5'>
      <div className='rounded-sm border border-border/50 bg-background p-3'>
        <div className='flex items-center justify-between gap-2'>
          <span className='text-sm font-medium text-foreground'>Draft scenario</span>
          <span
            className={cn(
              'rounded px-2 py-0.5 text-xs',
              isProfitWhatIfActive ? 'bg-primary/20 text-primary' : 'bg-success/20 text-success',
            )}
          >
            {isProfitWhatIfActive ? 'Simulated Company' : 'Current Company'}
          </span>
        </div>
        <p className='mt-2 text-xs text-muted-foreground'>
          {sliderSalary === null ? comparison.strategies[selectedStrategy].name : 'Custom salary'}.
          Changes apply when you calculate.
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
        <p className='text-xs text-muted-foreground'>{formatPercent(profitWhatIfPercent)}</p>
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
        <p className='text-xs text-muted-foreground'>
          {formatCurrency(currentSalary)} salary. Affordability is checked when you calculate.
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
