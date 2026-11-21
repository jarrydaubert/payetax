// src/components/organisms/CalculatorInputs/CalculatorInputsSection.tsx
'use client';

import { Calculator, RotateCcw } from 'lucide-react';
import * as React from 'react';
import { Spinner } from '@/components/atoms/Spinner';
import { FigureStorageControls } from '@/components/molecules/FigureStorageControls';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { convertPeriodToAnnual } from '@/lib/periodCalculator';
import { cn } from '@/lib/utils';
import { getRejectedAmountsMessage, MISSING_SALARY_MESSAGE } from '@/store/calculatorInputErrors';
import { useCalculatorActions, useCalculatorStore } from '@/store/calculatorStore';
import { BasicInputs } from './BasicInputs';
import { commitFocusedField } from './commitFocusedField';

interface CalculatorInputsSectionProps {
  onCalculate: () => string | undefined;
  onCalculateAttempt?: () => void;
  onReset?: () => void;
  resultAction?: React.ReactNode;
}

export function CalculatorInputsSection({
  onCalculate,
  onCalculateAttempt,
  onReset,
  resultAction,
}: CalculatorInputsSectionProps) {
  const { reset } = useCalculatorActions();
  const inputsRef = React.useRef<HTMLDivElement>(null);
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [formMessage, setFormMessage] = React.useState<{
    tone: 'error' | 'warning';
    text: string;
    /** Set when the message reports rejected amounts, so it clears once they are corrected. */
    rejectedAmounts?: boolean;
    missingSalary?: boolean;
  } | null>(null);

  // A rejected amount in a field the calculation uses blocks calculating from its old amount.
  const rejectedAmountsMessage = useCalculatorStore(getRejectedAmountsMessage);
  const hasBlockingAmounts = rejectedAmountsMessage !== '';
  const hasSalary = useCalculatorStore((state) => state.input.salary > 0);

  // Once every rejected amount is corrected, the message asking for that correction is stale.
  React.useEffect(() => {
    setFormMessage((message) =>
      (message?.rejectedAmounts && !hasBlockingAmounts) || (message?.missingSalary && hasSalary)
        ? null
        : message,
    );
  }, [hasBlockingAmounts, hasSalary]);

  const handleCalculate = () => {
    onCalculateAttempt?.();
    // Calculate must never use a previous amount while a field shows different text.
    commitFocusedField(inputsRef.current);

    // Read the store after that commit, not the values captured at the last render.
    const state = useCalculatorStore.getState();
    const rejected = getRejectedAmountsMessage(state);
    if (rejected) {
      setFormMessage({ tone: 'error', text: rejected, rejectedAmounts: true });
      return;
    }

    const { salary, payPeriod, hoursPerWeek } = state.input;

    // Validate salary is entered and reasonable
    if (salary <= 0) {
      setFormMessage({
        tone: 'error',
        text: MISSING_SALARY_MESSAGE,
        missingSalary: true,
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
      const inputIssue = onCalculate();
      if (inputIssue) setFormMessage({ tone: 'error', text: inputIssue });
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
    onReset?.();
    setFormMessage(null);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className={'space-y-4'}>
        <div ref={inputsRef}>
          <BasicInputs />
        </div>

        {/* Calculate and Reset buttons */}
        <div
          className={cn(
            'flex',
            'gap-2',
            'xl:ml-auto xl:max-w-sm min-[112.5rem]:ml-0 min-[112.5rem]:max-w-none',
          )}
        >
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
            {formMessage.rejectedAmounts ? rejectedAmountsMessage : formMessage.text}
          </p>
        )}
        <FigureStorageControls />
      </div>
    </TooltipProvider>
  );
}
