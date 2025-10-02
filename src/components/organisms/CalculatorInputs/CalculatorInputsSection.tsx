// src/components/organisms/CalculatorInputs/CalculatorInputsSection.tsx
'use client';

import { motion } from 'framer-motion';
import { Calculator, Sparkles } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { BasicInputs } from './BasicInputs';
import { DeductionsInputs } from './DeductionsInputs';
import { TaxSettings } from './TaxSettings';

interface CalculatorInputsSectionProps {
  onCalculate: () => void;
}

export function CalculatorInputsSection({ onCalculate }: CalculatorInputsSectionProps) {
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

  return (
    <div className='space-y-6'>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className='mb-2 font-bold text-2xl'>Calculate Your Take-Home Pay</h2>
        <p className='text-muted-foreground'>
          Enter your salary details to see a complete tax breakdown
        </p>
      </motion.div>

      <BasicInputs />
      <TaxSettings />
      <DeductionsInputs />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Button onClick={handleCalculate} disabled={isCalculating} size='lg' className='w-full'>
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
              Calculate Tax
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
