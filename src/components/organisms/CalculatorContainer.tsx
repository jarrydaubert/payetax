// src/components/organisms/CalculatorContainer.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import * as React from 'react';
import { useCalculatorStore } from '@/store/calculatorStore';
import { CalculatorInputsSection } from './CalculatorInputs/CalculatorInputsSection';
import { CalculatorResultsSection } from './CalculatorResults/CalculatorResultsSection';

export function CalculatorContainer() {
  const { results, calculate } = useCalculatorStore();
  const [showResults, setShowResults] = React.useState(false);

  const handleCalculate = () => {
    calculate();
    setShowResults(true);
  };

  React.useEffect(() => {
    if (results) {
      setShowResults(true);
    }
  }, [results]);

  return (
    <div className='mx-auto w-full max-w-7xl space-y-8 px-4 py-8'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='text-center'
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'
        >
          <Sparkles className='h-8 w-8 text-primary' />
        </motion.div>
        <h1 className='mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text font-bold text-4xl text-transparent md:text-5xl'>
          UK Tax Calculator
        </h1>
        <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
          Calculate your take-home pay with official HMRC rates. Fast, accurate, and completely
          free.
        </p>
      </motion.div>

      {/* Main Calculator Grid */}
      <div className='grid gap-8 lg:grid-cols-2'>
        {/* Inputs Column */}
        <div>
          <CalculatorInputsSection onCalculate={handleCalculate} />
        </div>

        {/* Results Column */}
        <div>
          <AnimatePresence mode='wait'>
            {showResults && results ? (
              <CalculatorResultsSection results={results} />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='flex h-full items-center justify-center rounded-lg border border-border border-dashed bg-card/50 p-12 text-center'
              >
                <div>
                  <Sparkles className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                  <h3 className='mb-2 font-semibold text-lg'>Ready to Calculate</h3>
                  <p className='text-muted-foreground text-sm'>
                    Enter your salary details and click Calculate Tax to see your results
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
