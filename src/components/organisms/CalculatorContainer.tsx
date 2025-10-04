// src/components/organisms/CalculatorContainer.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { FileDown, Printer, Sparkles } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { exportToCSV, printResults } from '@/lib/exportUtils';
import { useCalculatorStore } from '@/store/calculatorStore';
import { CalculatorInputsSection } from './CalculatorInputs/CalculatorInputsSection';
import { ResultsSummaryCards } from './CalculatorResults/ResultsSummaryCards';
import { ResultsTable } from './CalculatorResults/ResultsTable';

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

  const handleExport = () => {
    if (!results) return;
    try {
      exportToCSV(results);
      toast.success('CSV exported successfully!');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  const handlePrint = () => {
    if (!results) return;
    try {
      printResults(results);
    } catch {
      toast.error('Failed to open print dialog');
    }
  };

  return (
    <div className='mx-auto w-full max-w-7xl space-y-6 px-4 py-8'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='text-center'
      >
        <h1 className='mb-3 bg-gradient-to-r from-brand-gradient-start via-brand-accent to-brand-gradient-end bg-clip-text font-bold text-4xl text-transparent md:text-5xl'>
          UK Tax Calculator
        </h1>
        <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
          Calculate your take-home pay with official HMRC rates. Fast, accurate, and completely
          free.
        </p>
      </motion.div>

      {/* Summary Cards (top) */}
      <AnimatePresence mode='wait'>
        {showResults && results && <ResultsSummaryCards results={results} />}
      </AnimatePresence>

      {/* Main Calculator Grid: Inputs (left) + Results Table (right) */}
      <div className='grid gap-6 lg:grid-cols-[420px_1fr]'>
        {/* Inputs Column */}
        <Card className='p-6'>
          <CalculatorInputsSection onCalculate={handleCalculate} />
        </Card>

        {/* Results Table Column */}
        <AnimatePresence mode='wait'>
          {showResults && results ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <ResultsTable results={results} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='flex h-full items-center justify-center rounded-lg border border-dashed p-12 text-center'
            >
              <div>
                <Sparkles className='mx-auto mb-4 size-12 text-muted-foreground' />
                <h3 className='mb-2 font-semibold text-lg'>Ready to Calculate</h3>
                <p className='text-muted-foreground text-sm'>
                  Enter your salary details and click Calculate to see your results
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Export Buttons (bottom) */}
      <AnimatePresence mode='wait'>
        {showResults && results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className='flex justify-center gap-3'
          >
            <Button variant='outline' size='lg' onClick={handlePrint}>
              <Printer className='mr-2 size-4' />
              Print
            </Button>
            <Button variant='outline' size='lg' onClick={handleExport}>
              <FileDown className='mr-2 size-4' />
              Export CSV
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
