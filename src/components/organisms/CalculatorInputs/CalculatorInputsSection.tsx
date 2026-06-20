// src/components/organisms/CalculatorInputs/CalculatorInputsSection.tsx
'use client';

import { Calculator, RotateCcw } from 'lucide-react';
import * as React from 'react';
import { Spinner } from '@/components/atoms/Spinner';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { convertPeriodToAnnual } from '@/lib/periodCalculator';
import { cn } from '@/lib/utils';
import { useCalculatorActions, useCalculatorStore } from '@/store/calculatorStore';
import { BasicInputs } from './BasicInputs';

interface CalculatorInputsSectionProps {
  onCalculate: () => void;
  resultAction?: React.ReactNode;
}

export function CalculatorInputsSection({
  onCalculate,
  resultAction,
}: CalculatorInputsSectionProps) {
  const { reset } = useCalculatorActions();
  const salary = useCalculatorStore((state) => state.input.salary);
  const payPeriod = useCalculatorStore((state) => state.input.payPeriod);
  const hoursPerWeek = useCalculatorStore((state) => state.input.hoursPerWeek);
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [formMessage, setFormMessage] = React.useState<{
    tone: 'error' | 'warning';
    text: string;
  } | null>(null);

  const handleCalculate = () => {
    // Validate salary is entered and reasonable
    if (salary <= 0) {
      setFormMessage({
        tone: 'error',
        text: 'Enter your gross salary to calculate your tax breakdown.',
      });
      return;
    }

    const annualSalary = convertPeriodToAnnual(salary, payPeriod, hoursPerWeek);

    if (annualSalary < 100) {
      setFormMessage({
        tone: 'warning',
        text: 'Salary below £100/year may show unusual percentages.',
      });
    } else {
      setFormMessage(null);
    }

    setIsCalculating(true);
    try {
      onCalculate();
      // Success is implicit - results appear on screen
    } catch (error) {
      setFormMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Please check your inputs.',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    reset();
    setFormMessage(null);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className={'space-y-4'}>
        <BasicInputs />

        {/* Calculate and Reset buttons */}
        <div className={cn('flex', 'gap-2')}>
          <Button
            onClick={handleCalculate}
            disabled={isCalculating}
            size='default'
            className='min-w-0 flex-1 px-3'
            data-testid='calculate-button'
          >
            {isCalculating ? (
              <>
                <Spinner className={cn('mr-2', 'size-5')} />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className={cn('mr-2', 'size-5')} />
                Calculate
              </>
            )}
          </Button>

          <Button onClick={handleReset} variant='outline' size='default' className='shrink-0 px-3'>
            <RotateCcw className={cn('mr-1.5', 'size-5')} />
            Reset
          </Button>
          {resultAction}
        </div>
        {formMessage && (
          <p
            className={cn(
              'rounded-md border px-3 py-2 text-sm',
              formMessage.tone === 'error'
                ? 'border-destructive/30 bg-destructive/10 text-destructive'
                : 'border-warning/30 bg-warning/10 text-warning',
            )}
            role={formMessage.tone === 'error' ? 'alert' : 'status'}
          >
            {formMessage.text}
          </p>
        )}
      </div>
    </TooltipProvider>
  );
}
