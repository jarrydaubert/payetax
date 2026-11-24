'use client';

import { Slider } from '@/components/ui/slider';
import { CURRENCY_INPUT_MAX } from '@/lib/currencyInput';
import { resolveAnnualFinancials } from '@/lib/tax';
import { formatCurrency } from '@/lib/utils';
import {
  DIRECTOR_PROFIT_WHAT_IF_MAX_PERCENT,
  DIRECTOR_PROFIT_WHAT_IF_MIN_PERCENT,
  useDirectorFormData,
  useDirectorGuideActions,
  useProfitWhatIfPercent,
  useSliderSalary,
} from '@/store/directorGuideStore';

export function SalarySlider() {
  const formData = useDirectorFormData();
  const sliderSalary = useSliderSalary();
  const profitWhatIfPercent = useProfitWhatIfPercent();
  const { setSliderSalary, setProfitWhatIfPercent } = useDirectorGuideActions();
  const { revenue, expenses } = resolveAnnualFinancials(formData);
  const draftProfit = revenue === undefined || expenses === undefined ? 0 : revenue - expenses;
  const draftBudget = draftProfit * (1 + profitWhatIfPercent / 100);
  const maxSalary = Math.min(
    CURRENCY_INPUT_MAX,
    Math.max(100, draftProfit, draftBudget, sliderSalary ?? 0),
  );

  return (
    <div className='space-y-4 rounded-sm border border-border/50 bg-card p-4'>
      <div className='space-y-3'>
        <div className='flex items-center justify-between gap-2'>
          <span className='text-sm'>Company profit adjustment</span>
          <button
            type='button'
            onClick={() => setProfitWhatIfPercent(0)}
            aria-label='Reset profit adjustment'
            className='rounded border px-2 py-1 text-xs text-primary disabled:text-muted-foreground'
            disabled={profitWhatIfPercent === 0}
          >
            Reset
          </button>
        </div>
        <p className='text-xs text-muted-foreground'>
          {profitWhatIfPercent > 0 ? '+' : ''}
          {profitWhatIfPercent}%
        </p>
        <Slider
          data-testid='director-profit-slider'
          thumbLabel='Company profit adjustment'
          value={[profitWhatIfPercent]}
          onValueChange={(value) => setProfitWhatIfPercent(value[0] ?? 0)}
          min={DIRECTOR_PROFIT_WHAT_IF_MIN_PERCENT}
          max={DIRECTOR_PROFIT_WHAT_IF_MAX_PERCENT}
          step={5}
        />
      </div>
      {draftBudget <= 0 && sliderSalary === null ? (
        <p className='text-xs text-muted-foreground'>
          Enter figures with positive company profit to set a custom salary.
        </p>
      ) : (
        <div className='space-y-3'>
          <p className='text-sm'>Custom salary</p>
          <p className='text-xs text-muted-foreground'>
            {sliderSalary === null
              ? 'Move the slider to set a custom salary. Affordability is checked when you calculate.'
              : `${formatCurrency(sliderSalary)} draft salary. Affordability is checked when you calculate.`}
          </p>
          <Slider
            data-testid='director-salary-slider'
            thumbLabel='Custom salary'
            value={[sliderSalary ?? 0]}
            onValueChange={(value) => setSliderSalary(value[0] ?? null)}
            min={0}
            max={maxSalary}
            step={100}
          />
        </div>
      )}
    </div>
  );
}
