// src/components/organisms/CalculatorContainer.tsx
'use client';

import { motion } from 'framer-motion';
import { Mail, Sparkles } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { EmailResultsForm } from '@/components/molecules/EmailResultsForm';
import { LEGACY_RESTORE_SELECTOR } from '@/components/molecules/FigureStorageControls';
import { Button } from '@/components/ui/button';
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
import { useFigureStorage } from '@/lib/figureStorage';
import { roundPensionUpToPence } from '@/lib/pensionOptimizer';
import { convertAnnualToPeriod } from '@/lib/periodCalculator';
import {
  getTaxCodeRegionOverride,
  hasNonCumulativeTaxCodeMarker,
  parseTaxCode,
  TAX_CODE_NON_CUMULATIVE_MARKERS,
} from '@/lib/tax';
import { cn } from '@/lib/utils';
import { PayeEmailInputSchema } from '@/lib/validation/emailValidation';
import { useShallow } from '@/lib/zustandShallow';
import { getRejectedAmountsMessage, MISSING_SALARY_MESSAGE } from '@/store/calculatorInputErrors';
import {
  isSubmittedCalculatorInput,
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

function getTaxCodeNotice({ taxCode, region }: { taxCode: string; region: string }) {
  const trimmedCode = taxCode.trim();
  const parsedTaxCode = parseTaxCode(trimmedCode, 0);
  if (trimmedCode && !parsedTaxCode.isValid) {
    return {
      tone: 'error',
      text: 'Tax code format not recognized. This estimate used a policy-derived tax-free amount based on the selected year, adjusted net income and allowance answers. Check the complete code against your payslip or HMRC notice.',
    };
  }

  const notices: string[] = [];
  if (hasNonCumulativeTaxCodeMarker(trimmedCode)) {
    notices.push(
      `Emergency tax code detected. ${TAX_CODE_NON_CUMULATIVE_MARKERS.join(', ')} codes use only the current pay period. This calculator shows a steady-pay annual projection, not an exact deduction from a particular emergency-code payslip.`,
    );
  }
  const codeRegion = getTaxCodeRegionOverride(parsedTaxCode);
  if (codeRegion && codeRegion !== region) {
    notices.push(
      `The ${parsedTaxCode.prefix} prefix assigns ${codeRegion} tax rates, so it takes precedence over the selected ${region} region for this estimate.`,
    );
  }
  return notices.length ? { tone: 'info', text: notices.join(' ') } : null;
}

export function CalculatorContainer() {
  const hasLegacyFigures = useFigureStorage((state) => state.legacy);
  const results = useCalculatorResults();
  const { calculatedInput, marginalTaxRate, previousYearResults, inputRevision } =
    useCalculatorStore(
      useShallow(({ calculatedInput, marginalTaxRate, previousYearResults, inputRevision }) => ({
        calculatedInput,
        marginalTaxRate,
        previousYearResults,
        inputRevision,
      })),
    );
  const hasSalary = useCalculatorStore((state) => state.input.salary > 0);
  const { calculate, setInput } = useCalculatorActions();
  const taxCodeNotice = React.useMemo(
    () => (calculatedInput ? getTaxCodeNotice(calculatedInput) : null),
    [calculatedInput],
  );
  const isDesktop = useMediaQuery('(min-width: 1280px)');
  const [inputsBeforeSummary, setInputsBeforeSummary] = React.useState(false);
  const [visiblePeriods, setSelectedPeriods] = React.useState<string[]>(DEFAULT_PERIODS);
  const [actionMessage, setActionMessage] = React.useState<{
    tone: 'info' | 'error';
    text: string;
  } | null>(null);
  const focusOnResultsRef = React.useRef(true);
  const resultsRef = React.useRef<HTMLDivElement>(null);
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const hasTrackedCalculatorStartRef = React.useRef(false);
  const calcScrollTimeoutRef = React.useRef<number | null>(null);
  const focusFrameRef = React.useRef<number | null>(null);
  const shouldReduceMotion = useMotionPreference();

  // SR-only live region message (event-driven, not region-driven)
  const [liveMessage, setLiveMessage] = React.useState('');

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
    if (results && focusOnResultsRef.current && window.innerWidth >= BREAKPOINTS.XL) {
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

  const clearActionFeedback = () => {
    setActionMessage(null);
    setLiveMessage('');
    if (calcScrollTimeoutRef.current !== null) {
      clearTimeout(calcScrollTimeoutRef.current);
      calcScrollTimeoutRef.current = null;
    }
  };

  const handleCalculate = (isEmail = false) => {
    const before = useCalculatorStore.getState().results;
    focusOnResultsRef.current = !isEmail;

    if (!hasTrackedCalculatorStartRef.current) {
      trackEvent({
        action: 'calculator_start',
        category: 'funnel',
        label: 'paye_calculator',
      });
      hasTrackedCalculatorStartRef.current = true;
    }

    try {
      const inputIssue = calculate({ reuseCurrent: isEmail });
      if (inputIssue) return inputIssue;
    } catch {
      throw new Error('Unable to calculate your tax. Please try again.');
    }

    if (useCalculatorStore.getState().results !== before) {
      setLiveMessage('Tax calculation complete. Results updated.');
    }
    if (isEmail) return;

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

  const prepareEmail = () => {
    commitFocusedField(sectionRef.current);
    clearActionFeedback();
    const state = useCalculatorStore.getState();
    if (state.inputRevision !== inputRevision) throw new Error('Reopen Email Results to continue.');
    const rejected = getRejectedAmountsMessage(state);
    if (rejected) throw new Error(rejected);
    if (state.input.salary <= 0) throw new Error(MISSING_SALARY_MESSAGE);

    const input = PayeEmailInputSchema.safeParse({
      ...state.input,
      incomeSources: state.input.incomeSources.map(({ type, amount, period }) => ({
        type,
        amount,
        period,
      })),
    });
    if (!input.success) {
      throw new Error(input.error.issues[0]?.message ?? 'Check your inputs before emailing.');
    }

    const inputIssue = handleCalculate(true);
    if (inputIssue) throw new Error(inputIssue);
    const submitted = useCalculatorStore.getState();
    if (
      !(submitted.results && isSubmittedCalculatorInput(state.input, submitted.calculatedInput))
    ) {
      throw new Error('Unable to calculate your tax. Please try again.');
    }

    return {
      input: input.data,
      isCurrent: () => {
        const current = useCalculatorStore.getState();
        return (
          current.inputRevision === submitted.inputRevision && current.results === submitted.results
        );
      },
    };
  };

  const handleVisiblePeriodsChange = (periods: string[]) => {
    setSelectedPeriods(periods);
  };

  const handleApplyPensionOptimization = (pensionAmount: number) => {
    setActionMessage(null);
    commitFocusedField(sectionRef.current);
    const current = useCalculatorStore.getState();
    if (
      !results ||
      current.results !== results ||
      getRejectedAmountsMessage(current) ||
      !isSubmittedCalculatorInput(current.input, current.calculatedInput)
    ) {
      setActionMessage({
        tone: 'error',
        text: 'Calculate with your current inputs before applying a pension suggestion.',
      });
      return;
    }
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

      const totalAnnualPension = current.results.pensionContribution.annually + pensionAmount;
      const perPeriodPension = convertAnnualToPeriod(
        totalAnnualPension,
        current.input.payPeriod,
        current.results.calculationBasis?.pay.hoursPerWeek ?? current.input.hoursPerWeek,
      );
      const pensionContribution = roundPensionUpToPence(perPeriodPension);
      setInput({
        pensionContribution,
        pensionContributionType: 'amount',
      });

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
      setActionMessage({ tone: 'info', text: message });
    } catch (error) {
      console.error('[CalculatorContainer] Error applying pension:', error);
      setActionMessage({
        tone: 'error',
        text: 'Failed to apply pension contribution. Please try entering the amount manually.',
      });
    }
  };

  const emailResultsAction = (
    <Dialog key={inputRevision}>
      <DialogTrigger asChild>
        <button
          type='button'
          className='inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          aria-label='Email tax calculation results'
          title='Email Results'
          onClick={() => commitFocusedField(sectionRef.current)}
        >
          <Mail className='h-4 w-4' />
          <span className='sr-only'>Email Results</span>
        </button>
      </DialogTrigger>
      <DialogContent className='border-border/60 bg-card text-card-foreground sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Email Results</DialogTitle>
          <DialogDescription>
            Calculate with your current inputs and send the results to your inbox.
          </DialogDescription>
        </DialogHeader>
        <EmailResultsForm prepare={prepareEmail} className='w-full' />
      </DialogContent>
    </Dialog>
  );

  const summarySection = (
    <React.Fragment key='summary'>
      {results && calculatedInput && marginalTaxRate !== null && (
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
          {taxCodeNotice && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
              className={cn(
                'mb-3 rounded-md border px-3 py-2 text-sm',
                taxCodeNotice.tone === 'error'
                  ? 'border-destructive/30 bg-destructive/10 text-destructive'
                  : 'border-primary/30 bg-primary/10 text-primary',
              )}
              role={taxCodeNotice.tone === 'error' ? 'alert' : 'status'}
            >
              <span>{taxCodeNotice.text}</span>
              <Link
                href='/tools/tax-code-decoder'
                className='ml-1 inline-flex min-h-11 items-center font-medium underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none'
              >
                Check the code
              </Link>
            </motion.div>
          )}
          <TaxCodeBasisNotice basis={results.taxCodeBasis} />
          <ResultsSummaryCards
            results={results}
            input={calculatedInput}
            marginalTaxRate={marginalTaxRate}
          />
        </motion.div>
      )}
    </React.Fragment>
  );

  const inputsSection = (
    <Card
      key='inputs'
      className={cn(
        'order-2 mx-auto w-full max-w-xl xl:col-span-2 xl:mx-0 xl:max-w-[58rem] xl:self-start min-[112.5rem]:sticky min-[112.5rem]:top-[calc(var(--navbar-height)+1rem)] min-[112.5rem]:order-3 min-[112.5rem]:col-span-1',
        'p-3',
        'sm:p-4 md:p-6 xl:p-8 min-[112.5rem]:p-6',
      )}
    >
      <CalculatorInputsSection
        onCalculate={() => handleCalculate()}
        onCalculateAttempt={clearActionFeedback}
        onReset={() => {
          clearActionFeedback();
          setSelectedPeriods(DEFAULT_PERIODS);
        }}
        resultAction={emailResultsAction}
      />
      <p
        className={cn(
          actionMessage ? 'mt-3 rounded-md border px-3 py-2 text-sm' : 'sr-only',
          actionMessage?.tone === 'error'
            ? 'border-destructive/30 bg-destructive/10 text-destructive'
            : 'border-primary/30 bg-primary/10 text-primary',
        )}
        role={actionMessage?.tone === 'error' ? 'alert' : undefined}
        aria-live='polite'
        aria-atomic='true'
      >
        {actionMessage?.text}
      </p>
    </Card>
  );

  return (
    <div
      className={cn(
        'paye-calculator mx-auto flex w-full max-w-[120rem] flex-col sm:px-4 md:py-8 xl:grid xl:grid-cols-[380px_minmax(0,1fr)] xl:px-8 min-[112.5rem]:grid-cols-[28rem_minmax(0,1fr)]',
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
          'order-1 grid gap-4 border-y border-border py-5 text-left lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-end lg:py-6',
          'animate-in duration-500 fade-in slide-in-from-top-4',
        )}
      >
        <div>
          <p className='mb-2 text-xs font-semibold tracking-[0.18em] text-primary uppercase'>
            Calculator
          </p>
          <h2 className='font-display text-3xl leading-tight font-semibold text-foreground md:text-4xl'>
            Calculate your take-home pay
          </h2>
          <p className='mt-2 max-w-2xl text-sm text-muted-foreground md:text-base'>
            Enter your salary to see what you could take home. Adjust the details to explore your
            pay.
          </p>
        </div>
        <p className='border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground lg:border-t-0 lg:border-l lg:pl-5'>
          Estimates, not financial or tax advice.{' '}
          <Link href='/#faq' className='underline underline-offset-2'>
            About these estimates
          </Link>
        </p>
      </div>

      {hasLegacyFigures && (
        <div className='order-1 flex flex-wrap items-center gap-x-4 text-sm xl:col-span-2'>
          <p className='font-medium'>Previously saved figures are waiting.</p>
          <Button
            type='button'
            variant='outline'
            size='touch'
            onClick={() =>
              sectionRef.current?.querySelector<HTMLButtonElement>(LEGACY_RESTORE_SELECTOR)?.focus()
            }
          >
            Review saved figures
          </Button>
        </div>
      )}

      {/* Match the desktop DOM sequence to the input-band and sidebar layouts. */}
      {inputsBeforeSummary ? [inputsSection, summarySection] : [summarySection, inputsSection]}
      {/* SR-only live region for announcing state changes (event-driven) */}
      <div aria-live='polite' aria-atomic='true' className='sr-only'>
        {liveMessage}
      </div>

      {/* Results column - order-6 on mobile, right column on desktop */}
      <React.Fragment key='results'>
        {results && calculatedInput ? (
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
              previousYearResults={previousYearResults}
              visiblePeriods={visiblePeriods}
              onVisiblePeriodsChange={handleVisiblePeriodsChange}
              onApplyPensionOptimization={handleApplyPensionOptimization}
              marriageAllowance={{
                isMarried: calculatedInput.isMarried,
                partnerGrossWage: calculatedInput.partnerGrossWage,
                taxCode: calculatedInput.taxCode,
                isScottish: results.calculationBasis?.incomeTaxRegime === 'Scotland',
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
              <h3 className={cn('font-semibold', 'mb-2', 'text-lg')}>Ready to Calculate</h3>
              <p className={cn('text-muted-foreground', 'text-sm')}>
                {hasSalary
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
