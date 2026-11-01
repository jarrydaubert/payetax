// src/components/organisms/CalculatorContainer.tsx
'use client';

import { motion } from 'framer-motion';
import { Mail, Sparkles } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { EmailResultsForm } from '@/components/molecules/EmailResultsForm';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ANIMATION_TRANSITIONS, ANIMATION_VARIANTS } from '@/constants/animationTokens';
import { BREAKPOINTS, TIMERS } from '@/constants/ui';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { trackEvent } from '@/lib/analytics';
import { roundPensionUpToPence } from '@/lib/pensionOptimizer';
import { convertAnnualToPeriod } from '@/lib/periodCalculator';
import {
  derivePayePayBasis,
  getTaxCodeRegionOverride,
  hasNonCumulativeTaxCodeMarker,
  parseTaxCode,
  TAX_CODE_NON_CUMULATIVE_MARKERS,
} from '@/lib/tax';
import { cn } from '@/lib/utils';
import type { PayeEmailInput } from '@/lib/validation/emailValidation';
import { useShallow } from '@/lib/zustandShallow';
import { getBlockingInputErrors } from '@/store/calculatorInputErrors';
import {
  useCalculatorActions,
  useCalculatorResults,
  useCalculatorStore,
} from '@/store/calculatorStore';
import { CalculatorInputsSection } from './CalculatorInputs/CalculatorInputsSection';
import { commitFocusedField } from './CalculatorInputs/commitFocusedField';
import { ResultsSummaryCards } from './CalculatorResults/ResultsSummaryCards';
import { ResultsTable } from './CalculatorResults/ResultsTable';
import { TaxCodeBasisNotice } from './CalculatorResults/TaxCodeBasisNotice';

const DEFAULT_PERIODS = ['Yearly', 'Monthly', 'Weekly', 'Daily', 'Hourly'];

export function CalculatorContainer() {
  // Use optimized selectors to prevent unnecessary re-renders
  const results = useCalculatorResults();
  const hasCalculated = useCalculatorStore((state) => state.hasCalculated);
  const previousYearResults = useCalculatorStore((state) => state.previousYearResults);
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
  const { calculate, calculatePreviousYear, setInput, invalidateResults } = useCalculatorActions();
  const parsedInputTaxCode = React.useMemo(() => parseTaxCode(input.taxCode, 0), [input.taxCode]);
  const codeRegionOverride = getTaxCodeRegionOverride(parsedInputTaxCode);
  const effectiveIsScottish =
    codeRegionOverride === 'Scotland' ||
    (codeRegionOverride === null && input.region === 'Scotland');
  const [, startTransition] = React.useTransition();
  const isDesktop = useMediaQuery('(min-width: 1280px)');
  const [inputsBeforeSummary, setInputsBeforeSummary] = React.useState(false);
  const [visiblePeriods, setSelectedPeriods] = React.useState<string[]>(DEFAULT_PERIODS);
  const [actionMessage, setActionMessage] = React.useState<{
    tone: 'info' | 'error';
    text: string;
    taxCodeLink?: boolean;
    requiresCalculate?: boolean;
  } | null>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const hasTrackedCalculatorStartRef = React.useRef(false);
  const calcScrollTimeoutRef = React.useRef<number | null>(null);
  const focusFrameRef = React.useRef<number | null>(null);
  const shouldReduceMotion = useMotionPreference();

  // SR-only live region message (event-driven, not region-driven)
  const [liveMessage, setLiveMessage] = React.useState('');

  // Derive showResults from results state
  const showResults = !!results;
  const needsCalculate = !results && hasCalculated;
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

  // Cleanup timeouts on unmount to prevent memory leaks
  React.useEffect(() => {
    return () => {
      if (calcScrollTimeoutRef.current) clearTimeout(calcScrollTimeoutRef.current);
      if (focusFrameRef.current !== null) cancelAnimationFrame(focusFrameRef.current);
    };
  }, []);

  React.useLayoutEffect(() => {
    const desktop = window.matchMedia('(min-width: 80rem)');
    const sidebar = window.matchMedia('(min-width: 112.5rem)');
    const updateOrder = () => setInputsBeforeSummary(desktop.matches && !sidebar.matches);
    updateOrder();
    desktop.addEventListener('change', updateOrder);
    sidebar.addEventListener('change', updateOrder);
    return () => {
      desktop.removeEventListener('change', updateOrder);
      sidebar.removeEventListener('change', updateOrder);
    };
  }, []);

  React.useLayoutEffect(() => {
    if (results && window.innerWidth >= BREAKPOINTS.XL) {
      resultsRef.current?.focus({ preventScroll: true });
      resultsRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, [results]);

  const handleDesktopFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    if (focusFrameRef.current !== null) cancelAnimationFrame(focusFrameRef.current);
    if (window.innerWidth < BREAKPOINTS.XL) return;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!event.currentTarget.contains(target)) return;
    // Check after native focus scrolling; never scroll for a control the user has already left.
    focusFrameRef.current = requestAnimationFrame(() => {
      focusFrameRef.current = null;
      if (window.innerWidth < BREAKPOINTS.XL) return;
      if (document.activeElement !== target || !target.matches(':focus-visible')) return;
      const rect = target.getBoundingClientRect();
      const style = getComputedStyle(document.documentElement);
      if (
        rect.top < Number.parseFloat(style.scrollPaddingTop) ||
        rect.bottom > window.innerHeight - Number.parseFloat(style.scrollPaddingBottom)
      ) {
        target.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' });
      }
    });
  };

  const handleCalculate = () => {
    setActionMessage(null);

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

    const taxCodeInput = typeof input.taxCode === 'string' ? input.taxCode.trim() : '';
    const parsedTaxCode = parsedInputTaxCode;
    if (taxCodeInput && !parsedTaxCode.isValid) {
      setActionMessage({
        tone: 'error',
        text: 'Tax code format not recognized. This estimate used a policy-derived tax-free amount based on the selected year, adjusted net income and allowance answers. Check the complete code against your payslip or HMRC notice.',
        taxCodeLink: true,
      });
    } else {
      const taxCodeNotices: string[] = [];
      if (hasNonCumulativeTaxCodeMarker(taxCodeInput)) {
        taxCodeNotices.push(
          `Emergency tax code detected. ${TAX_CODE_NON_CUMULATIVE_MARKERS.join(', ')} codes use only the current pay period. This calculator shows a steady-pay annual projection, not an exact deduction from a particular emergency-code payslip.`,
        );
      }
      const parsedCodeRegion = getTaxCodeRegionOverride(parsedTaxCode);
      if (parsedCodeRegion && parsedCodeRegion !== input.region) {
        taxCodeNotices.push(
          `The ${parsedTaxCode.prefix} prefix assigns ${parsedCodeRegion} tax rates, so it takes precedence over the selected ${input.region} region for this estimate.`,
        );
      }
      if (taxCodeNotices.length > 0) {
        setActionMessage({ tone: 'info', text: taxCodeNotices.join(' '), taxCodeLink: true });
      }
    }

    // Announce for screen readers (event-driven)
    setLiveMessage('Tax calculation complete. Results updated.');

    // Clear any pending scroll timeout
    if (calcScrollTimeoutRef.current) clearTimeout(calcScrollTimeoutRef.current);

    // Only scroll to results on mobile (desktop scrolls when its results commit).
    calcScrollTimeoutRef.current = window.setTimeout(() => {
      if (window.innerWidth < BREAKPOINTS.LG) {
        resultsRef.current?.scrollIntoView({
          behavior: shouldReduceMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    }, TIMERS.CALC_SCROLL);
  };

  const handleVisiblePeriodsChange = (periods: string[]) => {
    setSelectedPeriods(periods);
  };

  const handleApplyPensionOptimization = (pensionAmount: number) => {
    setActionMessage(null);
    // Commit the focused field so a later blur cannot overwrite the applied pension.
    // Rejected text clears the results this action belongs to; then there is nothing to apply to.
    commitFocusedField(sectionRef.current);
    const current = useCalculatorStore.getState();
    if (!results || current.results !== results || getBlockingInputErrors(current).length > 0)
      return;
    try {
      // Validate pension amount
      if (
        typeof pensionAmount !== 'number' ||
        !Number.isFinite(pensionAmount) ||
        pensionAmount < 0
      ) {
        console.error('[CalculatorContainer] Invalid pension amount:', pensionAmount);
        setActionMessage({
          tone: 'error',
          text: 'Invalid pension amount. Please enter a valid pension contribution.',
        });
        return;
      }

      const basis = derivePayePayBasis(current.input);
      const totalAnnualPension = basis.salarySacrificePensionDeduction.annual + pensionAmount;
      const perPeriodPension = convertAnnualToPeriod(
        totalAnnualPension,
        current.input.payPeriod,
        basis.hoursPerWeek,
      );
      const pensionContribution = roundPensionUpToPence(perPeriodPension);
      setInput({
        pensionContribution,
        pensionContributionType: 'amount',
      });
      invalidateResults();

      // Show success message
      const formattedAmount = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
      }).format(pensionAmount);
      const conversionNotice =
        current.input.pensionContributionType === 'percentage' &&
        current.input.pensionContribution > 0
          ? ` Your existing ${current.input.pensionContribution}% pension was converted to a £ amount for your pay period.`
          : '';
      const roundingNotice =
        pensionContribution > perPeriodPension
          ? ' Rounded up to the next penny for your pay period so your annual contribution meets the target.'
          : '';
      const message = `${formattedAmount} added to your annual pension contribution.${conversionNotice}${roundingNotice} Calculate again to update your results.`;
      setActionMessage({ tone: 'info', text: message, requiresCalculate: true });
      setLiveMessage(message);
    } catch (error) {
      console.error('[CalculatorContainer] Error applying pension:', error);
      setActionMessage({
        tone: 'error',
        text: 'Failed to apply pension contribution. Please try entering the amount manually.',
      });
    }
  };

  const emailResultsAction = (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type='button'
          className='inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          aria-label='Email tax calculation results'
          title='Email Results'
        >
          <Mail className='h-4 w-4' />
          <span className='sr-only'>Email Results</span>
        </button>
      </DialogTrigger>
      <DialogContent className='border-border/60 bg-card text-card-foreground sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Email Results</DialogTitle>
          <DialogDescription>Send a copy of this calculation to your inbox.</DialogDescription>
        </DialogHeader>
        <EmailResultsForm
          input={emailInput}
          canSend={() => {
            const current = useCalculatorStore.getState();
            return (
              !!results &&
              current.results === results &&
              getBlockingInputErrors(current).length === 0
            );
          }}
          className='w-full'
        />
      </DialogContent>
    </Dialog>
  );

  const summarySection = (
    <React.Fragment key='summary'>
      {showResults && (
        <motion.div
          ref={resultsRef}
          variants={shouldReduceMotion ? {} : ANIMATION_VARIANTS.fadeInDown}
          initial={shouldReduceMotion || isDesktop ? false : 'initial'}
          animate={shouldReduceMotion ? {} : 'animate'}
          exit={shouldReduceMotion ? {} : 'exit'}
          transition={shouldReduceMotion ? { duration: 0 } : ANIMATION_TRANSITIONS.default}
          className='order-4 scroll-mt-[calc(var(--navbar-height)+1rem)] xl:order-3 xl:col-span-2 xl:scroll-mt-0 min-[112.5rem]:order-2'
          role='region'
          aria-label='Tax calculation results summary'
          tabIndex={-1}
        >
          {actionMessage && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
              className={cn(
                'mb-3 rounded-md border px-3 py-2 text-sm',
                actionMessage.tone === 'error'
                  ? 'border-destructive/30 bg-destructive/10 text-destructive'
                  : 'border-primary/30 bg-primary/10 text-primary',
              )}
              role={actionMessage.tone === 'error' ? 'alert' : 'status'}
            >
              <span>{actionMessage.text}</span>
              {actionMessage.taxCodeLink && (
                <Link
                  href='/tools/tax-code-decoder'
                  className='ml-1 inline-flex min-h-11 items-center font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                >
                  Check the code
                </Link>
              )}
            </motion.div>
          )}
          {results && (
            <>
              <TaxCodeBasisNotice basis={results.taxCodeBasis} />
              <ResultsSummaryCards results={results} taxYear={input.taxYear} input={input} />
            </>
          )}
        </motion.div>
      )}
    </React.Fragment>
  );

  const inputsSection = (
    <Card
      key='inputs'
      className={cn(
        'order-2 mx-auto w-full max-w-xl xl:col-span-2 xl:mx-0 xl:max-w-none xl:self-start min-[112.5rem]:sticky min-[112.5rem]:top-[calc(var(--navbar-height)+1rem)] min-[112.5rem]:order-3 min-[112.5rem]:col-span-1',
        'p-3',
        'sm:p-4 md:p-6',
      )}
    >
      <CalculatorInputsSection
        onCalculate={handleCalculate}
        onReset={() => {
          setActionMessage(null);
          setLiveMessage('');
        }}
        resultAction={showResults ? emailResultsAction : undefined}
      />
      <p
        aria-live='polite'
        aria-atomic='true'
        role={needsCalculate ? 'status' : undefined}
        className={
          needsCalculate
            ? 'mt-3 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm'
            : 'sr-only'
        }
      >
        {needsCalculate && (
          <>
            Inputs changed — Calculate again. Previous results have been cleared.
            {actionMessage?.requiresCalculate && ` ${actionMessage.text}`}
          </>
        )}
      </p>
    </Card>
  );

  return (
    <div
      className={cn(
        'paye-calculator mx-auto flex w-full max-w-[120rem] flex-col sm:px-4 md:py-8 xl:grid xl:grid-cols-[380px_minmax(0,1fr)] xl:px-8',
        'gap-3',
        'px-4',
        'py-4',
        'md:gap-6 lg:gap-4 xl:gap-6',
      )}
      data-testid='calculator-section'
      ref={sectionRef}
      onFocusCapture={handleDesktopFocus}
    >
      {/* Header - CSS animation for better mobile LCP (no JS blocking) */}
      <div
        className={cn(
          'order-1 grid gap-4 border-border border-y py-5 text-left lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-end lg:py-6',
          'fade-in slide-in-from-top-4 animate-in duration-500',
        )}
      >
        <div>
          <p className='mb-2 font-semibold text-primary text-xs uppercase tracking-[0.18em]'>
            Calculator
          </p>
          <h2 className='font-display font-semibold text-3xl text-foreground leading-tight md:text-4xl'>
            Calculate your take-home pay
          </h2>
          <p className='mt-2 max-w-2xl text-muted-foreground text-sm md:text-base'>
            Enter your salary to see what you could take home. Adjust the details to explore your
            pay.
          </p>
        </div>
        <p className='border-border border-t pt-3 text-muted-foreground text-xs leading-relaxed lg:border-t-0 lg:border-l lg:pl-5'>
          Estimates, not financial or tax advice.{' '}
          <Link href='/#faq' className='underline underline-offset-2'>
            About these estimates
          </Link>
        </p>
      </div>

      {/* Match the desktop DOM sequence to the input-band and sidebar layouts. */}
      {inputsBeforeSummary ? [inputsSection, summarySection] : [summarySection, inputsSection]}
      {/* SR-only live region for announcing state changes (event-driven) */}
      <div aria-live='polite' aria-atomic='true' className='sr-only'>
        {liveMessage}
      </div>

      {/* Results column - order-6 on mobile, right column on desktop */}
      <React.Fragment key='results'>
        {showResults && results ? (
          <motion.div
            variants={shouldReduceMotion ? {} : ANIMATION_VARIANTS.scaleIn}
            initial={shouldReduceMotion ? {} : 'initial'}
            animate={shouldReduceMotion ? {} : 'animate'}
            exit={shouldReduceMotion ? {} : 'exit'}
            transition={shouldReduceMotion ? { duration: 0 } : ANIMATION_TRANSITIONS.default}
            className={cn(
              'order-6 flex flex-col',
              'gap-4',
              'xl:order-4 xl:col-span-2 xl:min-w-0 xl:self-start min-[112.5rem]:order-3 min-[112.5rem]:col-span-1',
            )}
            data-testid='tax-results'
          >
            <ResultsTable
              results={results}
              studentLoans={input.studentLoanPlans !== 'none' ? input.studentLoanPlans : []}
              allowancesDeductions={input.allowancesDeductions}
              previousYearResults={previousYearResults}
              visiblePeriods={visiblePeriods}
              onVisiblePeriodsChange={handleVisiblePeriodsChange}
              taxYear={input.taxYear}
              onApplyPensionOptimization={handleApplyPensionOptimization}
              marriageAllowance={{
                isMarried: input.isMarried,
                partnerGrossWage: input.partnerGrossWage,
                taxCode: input.taxCode,
                isScottish: effectiveIsScottish,
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
            className={cn(
              'order-6 flex min-h-[28rem] items-center justify-center rounded-sm border border-dashed bg-card/70 text-center xl:order-4 xl:col-span-2 min-[112.5rem]:order-3 min-[112.5rem]:col-span-1',
              'p-12',
            )}
          >
            <div>
              <Sparkles className={cn('mx-auto text-muted-foreground', 'mb-4', 'size-12')} />
              <h3 className={cn('font-semibold', 'mb-2', 'text-lg')}>
                {needsCalculate ? 'Calculate again' : 'Ready to Calculate'}
              </h3>
              <p className={cn('text-muted-foreground', 'text-sm')}>
                {needsCalculate
                  ? 'Your inputs have changed. Calculate to see your updated take-home pay.'
                  : input.salary > 0
                    ? 'Check your inputs, then select Calculate to see your take-home pay.'
                    : 'Enter your salary, then select Calculate to see your take-home pay.'}
              </p>
            </div>
          </motion.div>
        )}
      </React.Fragment>
    </div>
  );
}
