// src/components/organisms/CalculatorInputs/CalculatorInputsSection.tsx
'use client';

import { motion } from 'framer-motion';
import { Calculator, RotateCcw, Sparkles } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCalculatorStore } from '@/store/calculatorStore';
import { BasicInputs } from './BasicInputs';

interface CalculatorInputsSectionProps {
  onCalculate: () => void;
}

export function CalculatorInputsSection({ onCalculate }: CalculatorInputsSectionProps) {
  const { reset } = useCalculatorStore();
  const [isCalculating, setIsCalculating] = React.useState(false);

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      onCalculate();
      toast.success('Calculation complete!', {
        description: 'Your tax breakdown is ready',
        icon: <Sparkles className='h-4 w-4' />,
      });
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
    toast.info('Calculator reset', {
      description: 'All inputs have been cleared',
    });
  };

  return (
    <div className='space-y-4'>
      <BasicInputs />

      <div className='flex gap-2'>
        <Button onClick={handleCalculate} disabled={isCalculating} size='lg' className='flex-1'>
          {isCalculating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
              >
                <Calculator className='mr-2 h-5 w-5' />
              </motion.div>
              Calculating...
            </>
          ) : (
            <>
              <Calculator className='mr-2 h-5 w-5' />
              Calculate
            </>
          )}
        </Button>

        <Button onClick={handleReset} variant='outline' size='lg'>
          <RotateCcw className='mr-2 h-5 w-5' />
          Reset
        </Button>
      </div>
    </div>
  );
}
