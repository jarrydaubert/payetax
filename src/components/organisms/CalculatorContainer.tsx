// src/components/organisms/CalculatorContainer.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, FileDown, Printer, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { EmailResultsForm } from '@/components/molecules/EmailResultsForm';
import { Card } from '@/components/ui/card';
import { ANIMATION_TRANSITIONS, ANIMATION_VARIANTS } from '@/constants/animationTokens';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { BREAKPOINTS, SCROLL_THRESHOLDS, TIMERS } from '@/constants/ui';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { trackEvent } from '@/lib/analytics';
import { exportToCSV, printResults } from '@/lib/exportUtils';
import { cn } from '@/lib/utils';
import type { PayeEmailInput } from '@/lib/validation/emailValidation';
import { useShallow } from '@/lib/zustandShallow';
import {
  useCalculatorActions,
  useCalculatorResults,
  useCalculatorStore,
} from '@/store/calculatorStore';
import { ChartsSkeleton } from './CalculatorCharts/ChartsSkeleton';
import { CalculatorInputsSection } from './CalculatorInputs/CalculatorInputsSection';
import { ResultsSummaryCards } from './CalculatorResults/ResultsSummaryCards';
import { ResultsTable } from './CalculatorResults/ResultsTable';

// Dynamic import for Recharts components to reduce initial bundle size (-571KB)
// Lazy loads visualization library only when charts are needed
// Reference: PAYTAX-80 Performance Optimization
const ChartsContainer = dynamic(
  () => import('./CalculatorCharts').then((mod) => ({ default: mod.ChartsContainer })),
  {
    loading: () => <ChartsSkeleton />,
    ssr: false, // Charts not needed for SEO, reduces SSR payload
  },
);

export function CalculatorContainer() {
  // Use optimized selectors to prevent unnecessary re-renders
  const results = useCalculatorResults();
  const previousYearResults = useCalculatorStore((state) => state.previousYearResults);
  const whatIfResults = useCalculatorStore((state) => state.whatIfResults);
  const input = useCalculatorStore(
    useShallow((state) => ({
      salary: state.input.salary,
      payPeriod: state.input.payPeriod,
      taxYear: state.input.taxYear,
      taxCode: state.input.taxCode,
      isScottish: state.input.isScottish,
      isMarried: state.input.isMarried,
      partnerGrossWage: state.input.partnerGrossWage,
      isBlind: state.input.isBlind,
      age: state.input.age,
      payNoNI: state.input.payNoNI,
      pensionContribution: state.input.pensionContribution,
      pensionContributionType: state.input.pensionContributionType,
      studentLoanPlans: state.input.studentLoanPlans,
      niCategory: state.input.niCategory,
      hoursPerWeek: state.input.hoursPerWeek,
      allowancesDeductions: state.input.allowancesDeductions,
      incomeSources: state.input.incomeSources,
      region: state.input.region,
    })),
  );
  const { calculate, calculatePreviousYear, setPensionContribution, setPensionContributionType } =
    useCalculatorActions();
  const [, startTransition] = React.useTransition();
  const [visiblePeriods, setVisiblePeriods] = React.useState<string[]>([
    'Yearly',
    'Monthly',
    'Weekly',
    'Daily',
    'Hourly',
  ]);
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const [portalMounted, setPortalMounted] = React.useState(false);
  const resultsRef = React.useRef<HTMLDivElement>(null);
  const hasTrackedCalculatorStartRef = React.useRef(false);
  const calcScrollTimeoutRef = React.useRef<number | null>(null);
  const whatIfScrollTimeoutRef = React.useRef<number | null>(null);
  const shouldReduceMotion = useMotionPreference();

  // SR-only live region message (event-driven, not region-driven)
  const [liveMessage, setLiveMessage] = React.useState('');

  // Derive showResults from results state
  const showResults = !!results;
  const emailInput: PayeEmailInput = {
    salary: input.salary,
    payPeriod: input.payPeriod,
    taxYear: input.taxYear,
    taxCode: input.taxCode,
    isScottish: input.isScottish,
    isMarried: input.isMarried,
    partnerGrossWage: input.partnerGrossWage,
    isBlind: input.isBlind,
    age: input.age,
    payNoNI: input.payNoNI,
    pensionContribution: input.pensionContribution,
    pensionContributionType: input.pensionContributionType,
    studentLoanPlans: input.studentLoanPlans,
    niCategory: input.niCategory,
    hoursPerWeek: input.hoursPerWeek,
    allowancesDeductions: input.allowancesDeductions,
    incomeSources: input.incomeSources?.length
      ? input.incomeSources.map(({ type, amount, period }) => ({ type, amount, period }))
      : undefined,
  };

  // Enable portal after mount (document not available during SSR)
  React.useEffect(() => {
    setPortalMounted(true);
  }, []);

  // Cleanup timeouts on unmount to prevent memory leaks
  React.useEffect(() => {
    return () => {
      if (calcScrollTimeoutRef.current) clearTimeout(calcScrollTimeoutRef.current);
      if (whatIfScrollTimeoutRef.current) clearTimeout(whatIfScrollTimeoutRef.current);
    };
  }, []);

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
    window.scrollTo({ top: 0, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  };

  const handleCalculate = () => {
    if (!hasTrackedCalculatorStartRef.current) {
      trackEvent({
        action: 'calculator_start',
        category: 'funnel',
        label: 'paye_calculator',
      });
      hasTrackedCalculatorStartRef.current = true;
    }

    // Use React 18's useTransition to mark calculations as non-urgent
    // This keeps the UI responsive during heavy computations
    startTransition(() => {
      calculate();
      calculatePreviousYear();
    });

    if (/\s*(W1|M1|X)$/i.test(input.taxCode)) {
      toast.info('Emergency tax code detected', {
        description:
          'W1/M1/X codes are non-cumulative and may differ from your final annual tax position.',
        duration: TIMERS.TOAST_SUCCESS,
      });
    }

    // Announce for screen readers (event-driven)
    setLiveMessage('Tax calculation complete. Results updated.');

    // Clear any pending scroll timeout
    if (calcScrollTimeoutRef.current) clearTimeout(calcScrollTimeoutRef.current);

    // Only scroll to results on mobile (desktop has everything visible)
    calcScrollTimeoutRef.current = window.setTimeout(() => {
      if (window.innerWidth < BREAKPOINTS.LG) {
        resultsRef.current?.scrollIntoView({
          behavior: shouldReduceMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    }, TIMERS.CALC_SCROLL);
  };

  /**
   * Handle post-calculation UI for what-if scenarios
   * Note: Actual calculation happens in CalculatorInputsSection
   */
  const handleWhatIfPostCalculateUI = () => {
    // Announce for screen readers
    setLiveMessage('Scenarios compared. Check the results table.');

    // Clear any pending scroll timeout
    if (whatIfScrollTimeoutRef.current) clearTimeout(whatIfScrollTimeoutRef.current);

    // Scroll to results and show feedback
    whatIfScrollTimeoutRef.current = window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
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
        studentLoans: input.studentLoanPlans !== 'none' ? input.studentLoanPlans : [],
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
    // biome-ignore lint/correctness/useUniqueElementIds: Static ID required for anchor navigation from hero/CTAs
    <div
      id='tax-calculator'
      className={cn(
        'mx-auto flex w-full max-w-[1800px] flex-col sm:px-4 md:py-8 lg:grid lg:grid-cols-[400px_minmax(0,1fr)] xl:grid-cols-[390px_minmax(0,1fr)] xl:px-8 2xl:grid-cols-[380px_minmax(0,1fr)]',
        SPACING.GAP_3,
        SPACING.PX_2,
        SPACING.PY_4,
        'md:gap-6 lg:gap-4 xl:gap-6',
      )}
      data-testid='calculator-section'
    >
      {/* Header - CSS animation for better mobile LCP (no JS blocking) */}
      <div
        className={cn(
          'order-1 py-6 text-center lg:col-span-2 lg:py-8',
          'fade-in slide-in-from-top-4 animate-in duration-500',
        )}
      >
        <h2
          className={cn(
            'mb-3 bg-gradient-to-r from-brand-gradient-start via-brand-accent to-brand-gradient-end bg-clip-text font-bold text-transparent',
            TYPOGRAPHY.TEXT_4XL,
            // Use literal string for responsive - dynamic template strings break Tailwind extraction
            'md:text-5xl',
          )}
        >
          UK Tax Calculator
        </h2>
        <p className={cn('mx-auto max-w-2xl text-muted-foreground', TYPOGRAPHY.TEXT_LG)}>
          Estimate your take-home pay with official HMRC rates. Fast and free.
        </p>
        <div className='mx-auto mt-4 max-w-2xl rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-left text-amber-200 text-xs'>
          <p>
            <strong>Disclaimer:</strong> For illustrative purposes only. Not financial or tax
            advice. Consult a qualified accountant for advice specific to your situation. Based on
            HMRC rates for {input.taxYear} which may change.
          </p>
        </div>
      </div>

      {/* Summary Cards - Between inputs and table on mobile (order-4), top on desktop (order-2) */}
      <AnimatePresence mode='wait'>
        {showResults && results && (
          <motion.div
            ref={resultsRef}
            variants={shouldReduceMotion ? {} : ANIMATION_VARIANTS.fadeInDown}
            initial={shouldReduceMotion ? {} : 'initial'}
            animate={shouldReduceMotion ? {} : 'animate'}
            exit={shouldReduceMotion ? {} : 'exit'}
            transition={shouldReduceMotion ? { duration: 0 } : ANIMATION_TRANSITIONS.default}
            className='order-4 scroll-mt-6 lg:order-2 lg:col-span-2'
            role='region'
            aria-label='Tax calculation results summary'
          >
            <ResultsSummaryCards results={results} taxYear={input.taxYear} input={input} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* SR-only live region for announcing state changes (event-driven) */}
      <div aria-live='polite' aria-atomic='true' className='sr-only'>
        {liveMessage}
      </div>

      {/* Inputs Section - order-2 on mobile, left column on desktop (sticky) */}
      <Card
        className={cn(
          'order-2 lg:sticky lg:top-4 lg:order-3 lg:self-start',
          SPACING.P_3,
          'sm:p-4 md:p-6',
        )}
      >
        <CalculatorInputsSection
          onCalculate={handleCalculate}
          onWhatIfCalculate={handleWhatIfPostCalculateUI}
        />
      </Card>

      {/* Results Table - order-6 on mobile, right column on desktop */}
      <AnimatePresence mode='wait'>
        {showResults && results ? (
          <motion.div
            variants={shouldReduceMotion ? {} : ANIMATION_VARIANTS.scaleIn}
            initial={shouldReduceMotion ? {} : 'initial'}
            animate={shouldReduceMotion ? {} : 'animate'}
            exit={shouldReduceMotion ? {} : 'exit'}
            transition={shouldReduceMotion ? { duration: 0 } : ANIMATION_TRANSITIONS.default}
            className='order-6 lg:order-3'
            data-testid='tax-results'
          >
            <ResultsTable
              results={results}
              studentLoans={input.studentLoanPlans !== 'none' ? input.studentLoanPlans : []}
              allowancesDeductions={input.allowancesDeductions}
              previousYearResults={previousYearResults}
              whatIfResults={whatIfResults}
              visiblePeriods={visiblePeriods}
              onVisiblePeriodsChange={handleVisiblePeriodsChange}
              taxYear={input.taxYear}
              onApplyPensionOptimization={handleApplyPensionOptimization}
              marriageAllowance={{
                isMarried: input.isMarried,
                partnerGrossWage: input.partnerGrossWage,
                taxCode: input.taxCode,
                isScottish: input.region === 'Scotland',
              }}
            />

            {/* Data Visualization Charts */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.2 }}
              className={SPACING.MT_6}
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
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
            className={cn(
              'order-6 flex h-full items-center justify-center rounded-lg border border-dashed text-center lg:order-3',
              'p-12',
            )}
          >
            <div>
              <Sparkles
                className={cn('mx-auto text-muted-foreground', SPACING.MB_4, ICON_SIZES.SIZE_12)}
              />
              <h3 className={cn('font-semibold', SPACING.MB_2, TYPOGRAPHY.TEXT_LG)}>
                Ready to Calculate
              </h3>
              <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                Enter your salary. See your take-home pay in seconds.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Buttons (bottom) - always last */}
      <AnimatePresence mode='wait'>
        {showResults && results && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
            className={cn('order-8 flex flex-col items-center lg:col-span-2', SPACING.GAP_4)}
          >
            {/* Email Results Form */}
            <EmailResultsForm input={emailInput} className='w-full max-w-md' />

            {/* Secondary actions - demoted to link-style for cleaner hierarchy */}
            <div className='flex items-center justify-center gap-4 text-muted-foreground text-sm'>
              <button
                type='button'
                onClick={handlePrint}
                className='inline-flex items-center gap-1.5 hover:text-foreground hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                aria-label='Print tax calculation results'
              >
                <Printer className='h-3.5 w-3.5' />
                Print
              </button>
              <span className='text-border'>|</span>
              <button
                type='button'
                onClick={handleExport}
                className='inline-flex items-center gap-1.5 hover:text-foreground hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                aria-label='Download results as CSV file'
              >
                <FileDown className='h-3.5 w-3.5' />
                Download CSV
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to Top Button - Portal to body to escape stacking contexts */}
      {portalMounted &&
        createPortal(
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.8 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
                onClick={scrollToTop}
                className={cn(
                  'safe-bottom safe-right fixed z-[9999] flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  // Only add hover scale when motion is allowed
                  !shouldReduceMotion && 'transition-transform hover:scale-110',
                  ICON_SIZES.SIZE_12,
                )}
                aria-label='Scroll to top'
              >
                <ArrowUp className={ICON_SIZES.SIZE_6} />
              </motion.button>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
