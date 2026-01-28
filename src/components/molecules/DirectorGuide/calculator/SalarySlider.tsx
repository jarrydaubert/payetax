// src/components/molecules/DirectorGuide/calculator/SalarySlider.tsx
/**
 * Salary Slider - Interactive slider with breakpoints for salary exploration
 */
'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { TAX_RATES } from '@/constants/taxRates';
import { calculateSalaryScenario } from '@/lib/tax/strategyComparison';
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

export function SalarySlider() {
  const formData = useDirectorFormData();
  const comparison = useStrategyComparison();
  const selectedStrategy = useSelectedStrategy();
  const sliderSalary = useSliderSalary();
  const { setSliderSalary } = useDirectorGuideActions();

  // Calculate scenario based on slider or selected strategy
  const activeScenario = useMemo(() => {
    if (!comparison || comparison.grossProfit <= 0) return null;

    // If slider is being used
    if (sliderSalary !== null) {
      const scenario = calculateSalaryScenario(
        sliderSalary,
        comparison.grossProfit - formData.pensionContribution,
        formData.region!,
        TAX_YEAR,
        formData.otherIncome,
        formData.hasEmploymentAllowance,
        formData.studentLoanPlans,
        formData.pensionContribution,
        formData.companyCarBIK
      );

      return {
        salary: scenario.salary,
        dividends: scenario.dividends,
        takeHome: scenario.takeHome,
        totalTax:
          scenario.incomeTax +
          scenario.employeeNI +
          scenario.dividendTax +
          scenario.studentLoan +
          scenario.employerNI +
          scenario.corporationTax,
      };
    }

    // Use selected strategy
    const strategy = comparison.strategies[selectedStrategy];
    return {
      salary: strategy.salary,
      dividends: strategy.dividends,
      takeHome: strategy.takeHome,
      totalTax:
        strategy.totalPersonalTax + strategy.employerNI + strategy.corporationTax,
    };
  }, [comparison, sliderSalary, selectedStrategy, formData]);

  if (!comparison || comparison.grossProfit <= 0 || !activeScenario) return null;

  const maxSliderSalary = Math.min(
    comparison.grossProfit,
    comparison.strategies.allSalary.salary
  );

  const currentSalary = sliderSalary ?? comparison.strategies[selectedStrategy].salary;

  // Breakpoints
  const breakpoints = [
    { value: 0, label: '£0' },
    {
      value: TAX_RATES[TAX_YEAR].nationalInsurance.lowerEarningsLimit,
      label: `£${(TAX_RATES[TAX_YEAR].nationalInsurance.lowerEarningsLimit / 1000).toFixed(1)}k LEL`,
    },
    {
      value: TAX_RATES[TAX_YEAR].personalAllowance,
      label: `£${(TAX_RATES[TAX_YEAR].personalAllowance / 1000).toFixed(1)}k PA`,
    },
    { value: 50270, label: '£50.3k Basic' },
  ].filter((bp) => bp.value <= maxSliderSalary);

  // Comparison with recommended
  const recommendedTakeHome = comparison.strategies[comparison.recommended].takeHome;
  const diff = activeScenario.takeHome - recommendedTakeHome;

  return (
    <Card className='border-primary/30 bg-primary/5'>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center justify-between'>
          <span>Adjust Salary</span>
          {sliderSalary !== null && (
            <Button variant='outline' size='sm' onClick={() => setSliderSalary(null)}>
              Reset to Recommended
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Drag to see how the entire breakdown changes in real-time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {/* Current value */}
          <div className='flex items-center justify-between'>
            <span className='text-lg font-semibold'>{formatCurrency(currentSalary)}</span>
            <span className='text-muted-foreground'>
              {formatCurrency(currentSalary / 12)}/month
            </span>
          </div>

          {/* Slider */}
          <Slider
            value={[currentSalary]}
            onValueChange={(value) => setSliderSalary(value[0] ?? null)}
            min={0}
            max={maxSliderSalary}
            step={100}
            className='w-full'
          />

          {/* Breakpoints */}
          <div className='flex justify-between text-muted-foreground text-xs'>
            {breakpoints.map((bp) => (
              <button
                key={bp.value}
                type='button'
                className='hover:text-primary hover:underline'
                onClick={() => setSliderSalary(bp.value)}
              >
                {bp.label}
              </button>
            ))}
            <span>{formatCurrency(maxSliderSalary)}</span>
          </div>

          {/* Live summary strip */}
          <div className='mt-4 grid grid-cols-4 gap-2 rounded-lg bg-background p-3'>
            <div className='text-center'>
              <p className='text-muted-foreground text-xs'>Salary</p>
              <p className='font-semibold'>{formatCurrency(activeScenario.salary)}</p>
            </div>
            <div className='text-center'>
              <p className='text-muted-foreground text-xs'>Dividends</p>
              <p className='font-semibold'>{formatCurrency(activeScenario.dividends)}</p>
            </div>
            <div className='text-center'>
              <p className='text-muted-foreground text-xs'>Total Tax</p>
              <p className='font-semibold text-red-600 dark:text-red-400'>
                {formatCurrency(activeScenario.totalTax)}
              </p>
            </div>
            <div className='text-center'>
              <p className='text-muted-foreground text-xs'>Take-Home</p>
              <p className='font-semibold text-green-600 dark:text-green-400'>
                {formatCurrency(activeScenario.takeHome)}
              </p>
            </div>
          </div>

          {/* Comparison message */}
          {sliderSalary !== null && diff !== 0 && (
            <p
              className={`text-center text-sm ${diff > 0 ? 'text-green-600' : 'text-amber-600'}`}
            >
              {diff > 0 ? '+' : ''}
              {formatCurrency(diff)} vs recommended strategy
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
