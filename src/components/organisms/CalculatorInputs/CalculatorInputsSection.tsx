// src/components/organisms/CalculatorInputs/CalculatorInputsSection.tsx
'use client';

import { Calculator, ChevronDown, RotateCcw } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Spinner } from '@/components/ui/spinner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ICON_SIZES, SPACING } from '@/constants/designTokens';
import { cn } from '@/lib/utils';
import { useCalculatorActions, useCalculatorStore } from '@/store/calculatorStore';
import { BasicInputs } from './BasicInputs';
import { WhatIfInputs } from './WhatIfInputs';

interface CalculatorInputsSectionProps {
  onCalculate: () => void;
  onWhatIfCalculate?: () => void;
}

export function CalculatorInputsSection({
  onCalculate,
  onWhatIfCalculate,
}: CalculatorInputsSectionProps) {
  const { reset } = useCalculatorActions();
  const salary = useCalculatorStore((state) => state.input.salary);
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [whatIfOpen, setWhatIfOpen] = React.useState(false);

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
      toast.error('Please enter a salary', {
        description: 'Enter your gross salary to calculate your tax breakdown',
      });
      return;
    }

    // Warn about very low salary (less than minimum wage equivalent)
    if (salary < 100) {
      toast.warning('Very low salary', {
        description: 'Salary below £100/year may show unusual percentages',
      });
    }

    setIsCalculating(true);
    try {
      onCalculate();
      // Success is implicit - results appear on screen
    } catch (error) {
      toast.error('Calculation failed', {
        description: error instanceof Error ? error.message : 'Please check your inputs',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    reset();
    // Close What If section when resetting
    setWhatIfOpen(false);
    // Reset is visually obvious - no toast needed
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
            size='lg'
            className='flex-1'
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

          <Button onClick={handleReset} variant='outline' size='lg'>
            <RotateCcw className={cn('mr-2', ICON_SIZES.SIZE_5)} />
            Reset
          </Button>
        </div>

        {/* What If Collapsible Section */}
        <Collapsible open={whatIfOpen} onOpenChange={handleWhatIfToggle}>
          <CollapsibleTrigger asChild>
            <Button
              variant='outline'
              size='lg'
              className='w-full border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 hover:from-purple-500/20 hover:to-pink-500/20 hover:text-purple-700 dark:border-purple-400/30 dark:from-purple-400/10 dark:to-pink-400/10 dark:text-purple-400 dark:hover:from-purple-400/20 dark:hover:to-pink-400/20 dark:hover:text-purple-300'
              data-testid='what-if-trigger'
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
