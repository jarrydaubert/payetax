// src/components/molecules/DirectorGuide/calculator/SalarySlider.tsx
/**
 * Salary Explorer - Simple slider for exploring salary levels
 *
 * Per spec: Range £0 to UEL (Upper Earnings Limit) or gross profit if lower.
 * Strategy cards are presets that jump to specific salary positions.
 */
'use client';

import { MoveHorizontal } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { TAX_RATES } from '@/constants/taxRates';
import {
  useDirectorGuideActions,
  useSliderSalary,
  useStrategyComparison,
} from '@/store/directorGuideStore';

const TAX_YEAR = '2025-2026';
const UEL = TAX_RATES[TAX_YEAR].nationalInsurance.employee.A.upper.threshold;

export function SalarySlider() {
  const comparison = useStrategyComparison();
  const sliderSalary = useSliderSalary();
  const { setSliderSalary } = useDirectorGuideActions();
  const hasInitialized = useRef(false);

  // Initialize slider to optimal salary on first calculation
  useEffect(() => {
    if (comparison && comparison.grossProfit > 0 && !hasInitialized.current) {
      const optimalSalary = comparison.strategies.optimalMix.salary;
      setSliderSalary(optimalSalary);
      hasInitialized.current = true;
    }
  }, [comparison, setSliderSalary]);

  // Reset initialization flag when comparison is cleared
  useEffect(() => {
    if (!comparison || comparison.grossProfit <= 0) {
      hasInitialized.current = false;
    }
  }, [comparison]);

  if (!comparison || comparison.grossProfit <= 0) return null;

  // Max is UEL or gross profit, whichever is lower
  const maxSalary = Math.min(UEL, comparison.grossProfit);
  const currentSalary = sliderSalary ?? comparison.strategies.optimalMix.salary;

  return (
    <div className='rounded-xl border border-white/[0.04] bg-[#1e293b] p-5'>
      {/* Header */}
      <div className='mb-4 flex items-center gap-2 text-slate-500'>
        <MoveHorizontal className='size-4' />
        <span className='text-sm'>Drag to explore different salary levels</span>
      </div>

      {/* Slider */}
      <Slider
        value={[currentSalary]}
        onValueChange={(value) => setSliderSalary(value[0] ?? null)}
        min={0}
        max={maxSalary}
        step={100}
        className='w-full'
      />
    </div>
  );
}
