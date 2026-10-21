// src/components/organisms/CalculatorContainer.tsx
'use client';

import { Mail, ReceiptText } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { EmailResultsForm } from '@/components/molecules/EmailResultsForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { BREAKPOINTS } from '@/constants/ui';
import { trackEvent } from '@/lib/analytics';
import type { PayPeriod } from '@/lib/tax';
import {
  getTaxCodeRegionOverride,
  hasNonCumulativeTaxCodeMarker,
  parseTaxCode,
  TAX_CODE_NON_CUMULATIVE_MARKERS,
} from '@/lib/tax';
import { cn, formatCurrency } from '@/lib/utils';
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
import { CalculatorInsights } from './CalculatorResults/CalculatorInsights';
import { PayStatement } from './CalculatorResults/PayStatement';
import { ResultsTable } from './CalculatorResults/ResultsTable';

export function CalculatorContainer() {
  // Use optimized selectors to prevent unnecessary re-renders
  const results = useCalculatorResults();
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
  const { calculate, calculatePreviousYear, setInput } = useCalculatorActions();
  const parsedInputTaxCode = React.useMemo(() => parseTaxCode(input.taxCode, 0), [input.taxCode]);
  const codeRegionOverride = getTaxCodeRegionOverride(parsedInputTaxCode);
  const effectiveIsScottish =
    codeRegionOverride === 'Scotland' ||
    (codeRegionOverride === null && input.region === 'Scotland');
  const [editing, setEditing] = React.useState(false);
  const [comparisonOpen, setComparisonOpen] = React.useState(false);
  const [resultPeriod, setResultPeriod] = React.useState<PayPeriod>('monthly');
  const comparisonRef = React.useRef<HTMLElement>(null);
  const [visiblePeriods, setVisiblePeriods] = React.useState<string[]>([
    'Yearly',
    'Monthly',
    '4-Weekly',
    'Fortnightly',
    'Weekly',
    'Daily',
    'Hourly',
  ]);
  const [actionMessage, setActionMessage] = React.useState<{
    tone: 'info' | 'error';
    text: string;
    taxCodeLink?: boolean;
  } | null>(null);
  const resultsRef = React.useRef<HTMLElement>(null);
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const hasTrackedCalculatorStartRef = React.useRef(false);

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

  // Apply focus after React has committed the corresponding visible UI. Timers can steal
  // focus from the next edit, especially when Safari keeps focus on amount fields.
  React.useLayoutEffect(() => {
    if (!results) return;
    resultsRef.current?.focus({ preventScroll: true });
    const top = resultsRef.current?.getBoundingClientRect().top ?? 0;
    if (window.innerWidth < BREAKPOINTS.LG || top < 90 || top > window.innerHeight / 2) {
      const target = window.innerWidth < BREAKPOINTS.LG ? sectionRef.current : resultsRef.current;
      target?.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, [results]);

  React.useLayoutEffect(() => {
    if (editing) {
      sectionRef.current?.querySelector<HTMLInputElement>('[data-testid="salary-input"]')?.focus();
    }
  }, [editing]);

  React.useLayoutEffect(() => {
    if (!comparisonOpen) return;
    comparisonRef.current?.focus({ preventScroll: true });
    comparisonRef.current?.scrollIntoView({
      behavior: 'instant',
      block: 'start',
    });
  }, [comparisonOpen]);

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

    calculate();
    if (!useCalculatorStore.getState().results) return;
    calculatePreviousYear();
    setEditing(false);
    setComparisonOpen(false);
    const input = useCalculatorStore.getState().input;
    const currentParsedCode = parseTaxCode(input.taxCode, 0);

    const taxCodeInput = typeof input.taxCode === 'string' ? input.taxCode.trim() : '';
    const parsedTaxCode = currentParsedCode;
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
  };

  const handleVisiblePeriodsChange = (periods: string[]) => {
    setVisiblePeriods(periods);
  };

  const handleApplyPensionOptimization = (pensionAmount: number) => {
    setActionMessage(null);
    // Commit any field being edited first, so the applied pension is not overwritten by a later
    // blur and the recalculation uses the amounts shown. Rejected text clears the results this
    // action belongs to; then there is nothing to apply to.
    commitFocusedField(sectionRef.current);
    const current = useCalculatorStore.getState();
    if (!results || current.results !== results || getBlockingInputErrors(current).length > 0)
      return;
    try {
      // Validate pension amount
      if (typeof pensionAmount !== 'number' || Number.isNaN(pensionAmount) || pensionAmount < 0) {
        console.error('[CalculatorContainer] Invalid pension amount:', pensionAmount);
        setActionMessage({
          tone: 'error',
          text: 'Invalid pension amount. Please enter a valid pension contribution.',
        });
        return;
      }

      // Update both fields in one store write so the immediate recalculation reads the new value.
      setInput({
        pensionContribution: pensionAmount,
        pensionContributionType: 'amount',
      });

      // Recalculate
      calculate();
      calculatePreviousYear();

      // Show success message
      const formattedAmount = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
      }).format(pensionAmount);
      setLiveMessage(`${formattedAmount} pension contribution applied. Results updated.`);
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
          className='statement-action'
          aria-label='Email tax calculation results'
          title='Email Results'
        >
          <Mail className='h-4 w-4' />
          <span>Email results</span>
        </button>
      </DialogTrigger>
      <DialogContent className='border-border/60 bg-card text-card-foreground sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Email Results</DialogTitle>
          <DialogDescription>Send a copy of this calculation to your inbox.</DialogDescription>
        </DialogHeader>
        <EmailResultsForm input={emailInput} className='w-full' />
      </DialogContent>
    </Dialog>
  );

  const marriageAllowance = {
    isMarried: input.isMarried,
    partnerGrossWage: input.partnerGrossWage,
    taxCode: input.taxCode,
    isScottish: effectiveIsScottish,
  };
  const compare = () => {
    if (comparisonOpen) {
      comparisonRef.current?.focus({ preventScroll: true });
      comparisonRef.current?.scrollIntoView({
        behavior: 'instant',
        block: 'start',
      });
    } else {
      setComparisonOpen(true);
    }
  };
  const notice = actionMessage && (
    <div
      className={cn(
        'rounded-sm border px-3 py-2 text-sm leading-relaxed',
        actionMessage.tone === 'error'
          ? 'border-destructive/30 text-destructive'
          : 'border-primary/30 text-primary',
      )}
      role={actionMessage.tone === 'error' ? 'alert' : 'status'}
    >
      {actionMessage.text}
      {actionMessage.taxCodeLink && (
        <Link
          href='/tools/tax-code-decoder'
          className='ml-1 inline-flex min-h-11 items-center underline underline-offset-4'
        >
          Check the code
        </Link>
      )}
    </div>
  );

  return (
    <div
      className='mx-auto grid w-full max-w-[120rem] scroll-mt-[calc(var(--navbar-height)+1rem)] gap-5 px-4 pb-10 sm:px-6 lg:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] lg:items-start lg:gap-6 lg:px-8'
      data-testid='calculator-section'
      ref={sectionRef}
    >
      <div className='sr-only' aria-live='polite' aria-atomic='true'>
        {liveMessage}
      </div>
      {showResults && !editing && (
        <div className='flex flex-wrap items-center justify-between gap-2 rounded-sm border border-border bg-card p-3 text-sm lg:hidden'>
          <span>
            {formatCurrency(input.salary)} /{' '}
            {input.payPeriod === 'annually' ? 'year' : input.payPeriod} · {input.region}
          </span>
          <button type='button' className='statement-action' onClick={() => setEditing(true)}>
            Edit inputs
          </button>
        </div>
      )}
      <div
        className={cn(
          'rounded-sm border border-border bg-card p-4 sm:p-5',
          showResults && !editing && 'hidden lg:block',
        )}
      >
        <CalculatorInputsSection onCalculate={handleCalculate} />
      </div>
      {showResults && results ? (
        <section
          ref={resultsRef}
          tabIndex={-1}
          aria-label='Tax calculation results summary'
          className='pay-statement min-w-0 scroll-mt-[calc(var(--navbar-height)+1rem)] rounded-sm border border-border bg-card p-4 focus:outline-none sm:p-6'
          data-testid='tax-results'
        >
          <PayStatement
            results={results}
            input={input}
            previousYearResults={previousYearResults}
            period={resultPeriod}
            onPeriodChange={setResultPeriod}
            onCompare={compare}
            emailAction={emailResultsAction}
            notice={notice}
          />
          <CalculatorInsights
            results={results}
            taxYear={input.taxYear}
            marriageAllowance={marriageAllowance}
            onApplyPensionOptimization={handleApplyPensionOptimization}
          />
        </section>
      ) : (
        <div className='hidden min-h-96 flex-col justify-center rounded-sm border border-border border-dashed p-8 lg:flex'>
          <ReceiptText className='mb-5 size-8 text-primary' aria-hidden='true' />
          <h2 className='font-display font-semibold text-3xl'>Your pay, explained.</h2>
          <p className='mt-3 max-w-md text-muted-foreground leading-relaxed'>
            Enter your salary to see what reaches your bank account, where the rest goes, and how it
            compares across all seven pay periods.
          </p>
          <p className='mt-6 text-muted-foreground text-sm'>
            No signup. Calculated in your browser.
          </p>
        </div>
      )}
      {results && (
        <section
          ref={comparisonRef}
          hidden={!comparisonOpen}
          tabIndex={-1}
          aria-label='Compare pay periods'
          className='min-w-0 scroll-mt-[calc(var(--navbar-height)+1rem)] rounded-sm border border-border bg-card p-4 focus:outline-none sm:p-6 lg:col-span-2'
          data-testid='period-comparison'
        >
          <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
            <h2 className='font-display font-semibold text-2xl'>Compare all 7 periods</h2>
            <button
              type='button'
              className='statement-action'
              onClick={() => {
                setComparisonOpen(false);
                resultsRef.current?.focus();
              }}
            >
              Back to pay statement
            </button>
          </div>
          <p className='mb-5 text-muted-foreground text-sm'>
            Compare the same estimate across pay periods. On smaller screens, choose any two periods
            to see complete amounts side by side.
          </p>
          <ResultsTable
            results={results}
            studentLoans={input.studentLoanPlans !== 'none' ? input.studentLoanPlans : []}
            allowancesDeductions={input.allowancesDeductions}
            previousYearResults={previousYearResults}
            visiblePeriods={visiblePeriods}
            onVisiblePeriodsChange={handleVisiblePeriodsChange}
            taxYear={input.taxYear}
            marriageAllowance={marriageAllowance}
            responsive
            hoursPerWeek={input.hoursPerWeek}
            showInsights={false}
          />
        </section>
      )}
      <p className='text-muted-foreground text-xs leading-relaxed lg:col-span-2'>
        Illustrative only. Not financial or tax advice. Based on HMRC rates for {input.taxYear}.
        Individual payslips can differ with payroll timing and cumulative history.
      </p>
    </div>
  );
}
