// src/components/organisms/CalculatorInputs/CalculatorInputsSection.tsx
'use client';

import { motion } from 'framer-motion';
import { Calculator, ChevronDown, RotateCcw } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useCalculatorActions, useCalculatorStore } from '@/store/calculatorStore';
import { BasicInputs } from './BasicInputs';
import { WhatIfInputs } from './WhatIfInputs';

interface CalculatorInputsSectionProps {
  onCalculate: () => void;
}

export function CalculatorInputsSection({ onCalculate }: CalculatorInputsSectionProps) {
  const { reset } = useCalculatorActions();
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
    setIsCalculating(true);
    try {
      onCalculate();
      // Success is implicit - results appear on screen
    } catch (error) {
      toast.error('Calculation failed', {
        description: error instanceof Error ? error.message : 'Please check your inputs',
      });
    } finally {
      setTimeout(() => setIsCalculating(false), 500);
    }
  };

  const handleReset = () => {
    reset();
    // Reset is visually obvious - no toast needed
  };

  return (
    <div className='space-y-4'>
      <BasicInputs />

      {/* Calculate and Reset buttons */}
      <div className='flex gap-2'>
        <Button
          onClick={handleCalculate}
          disabled={isCalculating}
          size='lg'
          className='flex-1'
          data-testid='calculate-button'
        >
          {isCalculating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
              >
                <Calculator className='mr-2 size-5' />
              </motion.div>
              Calculating...
            </>
          ) : (
            <>
              <Calculator className='mr-2 size-5' />
              Calculate
            </>
          )}
        </Button>

        <Button onClick={handleReset} variant='outline' size='lg'>
          <RotateCcw className='mr-2 size-5' />
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
            <div className='flex w-full items-center justify-center gap-2'>
              <span>Compare Scenarios</span>
              <ChevronDown
                className={`size-5 transition-transform duration-200 ${whatIfOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className='pt-4'>
            <WhatIfInputs />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
