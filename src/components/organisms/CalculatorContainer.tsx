// src/components/organisms/CalculatorContainer.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, FileDown, Printer, Sparkles } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BREAKPOINTS, SCROLL_THRESHOLDS, TIMERS } from '@/lib/constants/ui';
import { exportToCSV, printResults } from '@/lib/exportUtils';
import {
  useCalculatorActions,
  useCalculatorResults,
  useCalculatorStore,
} from '@/store/calculatorStore';
import { ChartsContainer } from './CalculatorCharts';
import { CalculatorInputsSection } from './CalculatorInputs/CalculatorInputsSection';
import { ResultsSummaryCards } from './CalculatorResults/ResultsSummaryCards';
import { ResultsTable } from './CalculatorResults/ResultsTable';

export function CalculatorContainer() {
  // Use optimized selectors to prevent unnecessary re-renders
  const results = useCalculatorResults();
  const previousYearResults = useCalculatorStore((state) => state.previousYearResults);
  const whatIfResults = useCalculatorStore((state) => state.whatIfResults);
  const input = useCalculatorStore((state) => state.input);
  const { calculate, calculatePreviousYear, setPensionContribution, setPensionContributionType } =
    useCalculatorActions();
  const [_isPending, startTransition] = React.useTransition();
  const [visiblePeriods, setVisiblePeriods] = React.useState<string[]>([
    'Yearly',
    'Monthly',
    'Weekly',
    'Daily',
    'Hourly',
  ]);
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  // Derive showResults from results state
  const showResults = !!results;

  // Lightweight scroll listener only for scroll-to-top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > SCROLL_THRESHOLDS.TOP_BUTTON);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCalculate = () => {
    // Use React 18's useTransition to mark calculations as non-urgent
    // This keeps the UI responsive during heavy computations
    startTransition(() => {
      calculate();
      calculatePreviousYear();
    });

    // Only scroll to results on mobile (desktop has everything visible)
    setTimeout(() => {
      if (window.innerWidth < BREAKPOINTS.LG) {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, TIMERS.CALC_SCROLL);
  };

  const handleWhatIfCalculate = () => {
    // Scroll to results and show feedback
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      toast.success('Scenarios compared!', {
        description: 'Check the results table to see your comparison',
        duration: TIMERS.TOAST_SUCCESS,
      });
    }, TIMERS.WHAT_IF_SCROLL);
  };

  const handleVisiblePeriodsChange = (periods: string[]) => {
    setVisiblePeriods(periods);
  };

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
      printResults({
        results,
        visiblePeriods,
        whatIfResults,
        studentLoans: input.studentLoanPlan !== 'none' ? [input.studentLoanPlan] : [],
        allowancesDeductions: input.allowancesDeductions,
        previousYearResults,
        taxYear: input.taxYear,
      });
    } catch {
      toast.error('Failed to open print dialog');
    }
  };

  const handleApplyPensionOptimization = (pensionAmount: number) => {
    try {
      // Validate pension amount
      if (typeof pensionAmount !== 'number' || Number.isNaN(pensionAmount) || pensionAmount < 0) {
        console.error('[CalculatorContainer] Invalid pension amount:', pensionAmount);
        toast.error('Invalid pension amount', {
          description: 'Please enter a valid pension contribution',
        });
        return;
      }

      // Update pension contribution
      setPensionContribution(pensionAmount);
      setPensionContributionType('amount');

      // Recalculate
      calculate();
      calculatePreviousYear();

      // Show success message
      const formattedAmount = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
      }).format(pensionAmount);
      toast.success(`Added ${formattedAmount} to pension`, {
        description: 'Your tax calculation has been updated',
      });
    } catch (error) {
      console.error('[CalculatorContainer] Error applying pension:', error);
      toast.error('Failed to apply pension contribution', {
        description: 'Please try entering the pension amount manually',
      });
    }
  };

  return (
    <div
      className='mx-auto flex w-full max-w-[1800px] flex-col gap-3 px-2 py-4 sm:px-4 md:gap-6 md:py-8 lg:grid lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-4 xl:grid-cols-[390px_minmax(0,1fr)] xl:gap-6 xl:px-8 2xl:grid-cols-[380px_minmax(0,1fr)]'
      data-testid='calculator-section'
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='order-1 py-6 text-center lg:col-span-2 lg:py-8'
      >
        <h2 className='mb-3 bg-gradient-to-r from-brand-gradient-start via-brand-accent to-brand-gradient-end bg-clip-text font-bold text-4xl text-transparent md:text-5xl'>
          UK Tax Calculator
        </h2>
        <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
          Calculate your take-home pay with official HMRC rates. Fast, accurate, and completely
          free.
        </p>
      </motion.div>

      {/* Summary Cards - Between inputs and table on mobile (order-4), top on desktop (order-2) */}
      <AnimatePresence mode='wait'>
        {showResults && results && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className='order-4 scroll-mt-6 lg:order-2 lg:col-span-2'
            role='region'
            aria-live='polite'
            aria-label='Tax calculation results summary'
          >
            <ResultsSummaryCards results={results} taxYear={input.taxYear} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inputs Section - order-2 on mobile, left column on desktop (sticky) */}
      <Card className='order-2 border-primary/20 p-3 sm:p-4 md:p-6 lg:sticky lg:top-4 lg:order-3 lg:self-start'>
        <CalculatorInputsSection
          onCalculate={handleCalculate}
          onWhatIfCalculate={handleWhatIfCalculate}
        />
      </Card>

      {/* Results Table - order-6 on mobile, right column on desktop */}
      <AnimatePresence mode='wait'>
        {showResults && results ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className='order-6 lg:order-3'
            data-testid='tax-results'
          >
            <ResultsTable
              results={results}
              studentLoans={input.studentLoanPlan !== 'none' ? [input.studentLoanPlan] : []}
              allowancesDeductions={input.allowancesDeductions}
              previousYearResults={previousYearResults}
              whatIfResults={whatIfResults}
              visiblePeriods={visiblePeriods}
              onVisiblePeriodsChange={handleVisiblePeriodsChange}
              taxYear={input.taxYear}
              onApplyPensionOptimization={handleApplyPensionOptimization}
              isMarried={input.isMarried}
              partnerGrossWage={input.partnerGrossWage}
              taxCode={input.taxCode}
            />

            {/* Data Visualization Charts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className='mt-6'
            >
              <ChartsContainer
                results={results}
                whatIfResults={whatIfResults}
                layout='full-width'
              />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='order-6 flex h-full items-center justify-center rounded-lg border border-primary/20 border-dashed p-12 text-center lg:order-3'
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
            className='order-8 flex justify-center gap-2 md:gap-3 lg:col-span-2'
          >
            <Button
              variant='outline'
              size='lg'
              onClick={handlePrint}
              aria-label='Print tax calculation results'
            >
              <Printer className='mr-2 size-4' />
              Print
            </Button>
            <Button
              variant='outline'
              size='lg'
              onClick={handleExport}
              aria-label='Export results to CSV file'
            >
              <FileDown className='mr-2 size-4' />
              Export CSV
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to Top Button - Fixed position FAB */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            className='safe-bottom safe-right fixed z-50 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
            aria-label='Scroll to top'
          >
            <ArrowUp className='size-6' />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
