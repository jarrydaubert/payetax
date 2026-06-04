// src/components/organisms/CalculatorInputs/CalculatorInputsSection.tsx
'use client';

import { Calculator, ChevronDown, RotateCcw } from 'lucide-react';
import * as React from 'react';
import { Spinner } from '@/components/atoms/Spinner';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ICON_SIZES, SPACING } from '@/constants/designTokens';
import { convertPeriodToAnnual } from '@/lib/periodCalculator';
import { cn } from '@/lib/utils';
import { useCalculatorActions, useCalculatorStore } from '@/store/calculatorStore';
import { BasicInputs } from './BasicInputs';
import { WhatIfInputs } from './WhatIfInputs';

interface CalculatorInputsSectionProps {
  onCalculate: () => void;
  onWhatIfCalculate?: () => void;
  resultAction?: React.ReactNode;
}

export function CalculatorInputsSection({
  onCalculate,
  onWhatIfCalculate,
  resultAction,
}: CalculatorInputsSectionProps) {
  const { reset } = useCalculatorActions();
  const salary = useCalculatorStore((state) => state.input.salary);
  const payPeriod = useCalculatorStore((state) => state.input.payPeriod);
  const hoursPerWeek = useCalculatorStore((state) => state.input.hoursPerWeek);
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [whatIfOpen, setWhatIfOpen] = React.useState(false);
  const [formMessage, setFormMessage] = React.useState<{
    tone: 'error' | 'warning';
    text: string;
  } | null>(null);

  // Clear What If results when collapsible closes
  const handleWhatIfToggle = (open: boolean) => {
    setWhatIfOpen(open);
    if (!open) {
      // Clear What If results when closing
      useCalculatorStore.setState({ whatIfResults: null });
    }
  };

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
    // Close What If section when resetting
    setWhatIfOpen(false);
    setFormMessage(null);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className={SPACING.SPACE_Y_4}>
        <BasicInputs />

        {/* Calculate and Reset buttons */}
        <div className={cn('flex', SPACING.GAP_2)}>
          <Button
            onClick={handleCalculate}
            disabled={isCalculating}
            size='default'
            className='min-w-0 flex-1 px-3'
            data-testid='calculate-button'
          >
            {isCalculating ? (
              <>
                <Spinner className={cn('mr-2', ICON_SIZES.SIZE_5)} />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className={cn('mr-2', ICON_SIZES.SIZE_5)} />
                Calculate
              </>
            )}
          </Button>

          <Button onClick={handleReset} variant='outline' size='default' className='shrink-0 px-3'>
            <RotateCcw className={cn('mr-1.5', ICON_SIZES.SIZE_5)} />
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

        {/* What If Collapsible Section */}
        <Collapsible open={whatIfOpen} onOpenChange={handleWhatIfToggle}>
          <CollapsibleTrigger asChild>
            <Button
              variant='outline'
              size='lg'
              className='w-full border-primary/40 bg-card text-primary hover:bg-primary/10 hover:text-primary'
              data-testid='what-if-collapsible-trigger'
            >
              <div className={cn('flex w-full items-center justify-center', SPACING.GAP_2)}>
                <span>Compare Scenarios</span>
                <ChevronDown
                  className={cn(
                    ICON_SIZES.SIZE_5,
                    `transition-transform duration-200 ${whatIfOpen ? 'rotate-180' : ''}`,
                  )}
                />
              </div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className='pt-4'>
              <WhatIfInputs onCompare={onWhatIfCalculate} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </TooltipProvider>
  );
}
