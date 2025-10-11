// src/components/organisms/CalculatorContainer.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { FileDown, Printer, Sparkles } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { exportToCSV, printResults } from '@/lib/exportUtils';
import {
  useCalculatorActions,
  useCalculatorResults,
  useCalculatorStore,
} from '@/store/calculatorStore';
import { CalculatorInputsSection } from './CalculatorInputs/CalculatorInputsSection';
import { ResultsSummaryCards } from './CalculatorResults/ResultsSummaryCards';
import { ResultsTable } from './CalculatorResults/ResultsTable';

export function CalculatorContainer() {
  // Use optimized selectors to prevent unnecessary re-renders
  const results = useCalculatorResults();
  const previousYearResults = useCalculatorStore((state) => state.previousYearResults);
  const input = useCalculatorStore((state) => state.input);
  const { calculate, calculatePreviousYear } = useCalculatorActions();
  const [showResults, setShowResults] = React.useState(false);
  const [visiblePeriods, setVisiblePeriods] = React.useState<string[]>([
    'Yearly',
    'Monthly',
    'Weekly',
  ]);

  const handleCalculate = () => {
    calculate();
    calculatePreviousYear();
    setShowResults(true);
  };

  const handleVisiblePeriodsChange = (periods: string[]) => {
    setVisiblePeriods(periods);
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
    <div
      className='mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-2 py-4 sm:px-4 md:gap-6 md:py-8 lg:grid lg:grid-cols-[380px_1fr] lg:gap-4 xl:gap-6 xl:px-8'
      data-testid='calculator-section'
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='order-1 text-center lg:col-span-2'
      >
        <h2 className='mb-3 bg-gradient-to-r from-brand-gradient-start via-brand-accent to-brand-gradient-end bg-clip-text font-bold text-4xl text-transparent md:text-5xl'>
          UK Tax Calculator
        </h2>
        <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
          Calculate your take-home pay with official HMRC rates. Fast, accurate, and completely
          free.
        </p>
      </motion.div>

      {/* Summary Cards - Between inputs and table on mobile (order-3), top on desktop (order-2) */}
      <AnimatePresence mode='wait'>
        {showResults && results && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className='order-3 lg:order-2 lg:col-span-2'
          >
            <ResultsSummaryCards results={results} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inputs Section - order-2 on mobile, left column on desktop */}
      <Card className='order-2 border-primary/20 p-3 sm:p-4 md:p-6 lg:order-3'>
        <CalculatorInputsSection onCalculate={handleCalculate} />
      </Card>

      {/* Results Table - order-4 on mobile, right column on desktop */}
      <AnimatePresence mode='wait'>
        {showResults && results ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className='order-4 lg:order-3'
            data-testid='tax-results'
          >
            <ResultsTable
              results={results}
              studentLoans={input.studentLoanPlan !== 'none' ? [input.studentLoanPlan] : []}
              allowancesDeductions={input.allowancesDeductions}
              previousYearResults={previousYearResults}
              visiblePeriods={visiblePeriods}
              onVisiblePeriodsChange={handleVisiblePeriodsChange}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='order-4 flex h-full items-center justify-center rounded-lg border border-primary/20 border-dashed p-12 text-center lg:order-3'
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

      {/* Export Buttons (bottom) - always last */}
      <AnimatePresence mode='wait'>
        {showResults && results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className='order-5 flex justify-center gap-2 md:gap-3 lg:col-span-2'
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
